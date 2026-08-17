import { PERMISSIONS } from "@/lib/domain/permissions";
import { assertPermission, type AppContext } from "../context";
import { conflict, fromDatabaseError, notFound, validationFailed } from "../errors";
import { writeAuditLog } from "../repositories/audit-repository";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_BATCH_SIZE = 5000;
const CHUNK = 500;

function randomToken(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length];
  return out;
}

export interface GenerateBatchInput {
  name: string;
  quantity: number;
  format: string;
}

export async function generateQrBatch(ctx: AppContext, input: GenerateBatchInput) {
  assertPermission(ctx, PERMISSIONS.qrGenerate);

  if (input.quantity < 1 || input.quantity > MAX_BATCH_SIZE) {
    throw validationFailed(`Quantity must be between 1 and ${MAX_BATCH_SIZE}.`);
  }

  const { data: batch, error } = await ctx.db
    .from("qr_batches")
    .insert({
      name: input.name,
      quantity: input.quantity,
      format: input.format,
      status: "generating",
      created_by: ctx.userId,
    })
    .select("id, name, quantity, format, status, created_at")
    .single();
  if (error) throw fromDatabaseError(error);

  let created = 0;
  try {
    while (created < input.quantity) {
      const size = Math.min(CHUNK, input.quantity - created);
      const rows = Array.from({ length: size }, () => ({
        code: `UBO-${randomToken(10)}`,
        activation_code: randomToken(8),
        batch_id: batch.id,
        status: "unused",
      }));
      const { error: insertError } = await ctx.db.from("qr_codes").insert(rows);
      if (insertError) throw fromDatabaseError(insertError);
      created += size;
    }
  } catch (generationError) {
    await ctx.db.from("qr_batches").update({ status: "failed" }).eq("id", batch.id);
    throw generationError;
  }

  const { data: completed, error: finaliseError } = await ctx.db
    .from("qr_batches")
    .update({ status: "completed" })
    .eq("id", batch.id)
    .select("id, name, quantity, format, status, created_at")
    .single();
  if (finaliseError) throw fromDatabaseError(finaliseError);

  await writeAuditLog(ctx, {
    action: "qr_batch.generated",
    entity: "qr_batch",
    entityId: batch.id,
    metadata: { quantity: input.quantity, format: input.format },
  });

  return completed;
}

export async function activateQrCode(
  ctx: AppContext,
  input: { activationCode: string; vehiclePlate?: string | undefined; source?: string | undefined },
) {
  assertPermission(ctx, PERMISSIONS.qrActivate);

  const { data: qr, error } = await ctx.db
    .from("qr_codes")
    .select("id, code, status")
    .eq("activation_code", input.activationCode.trim().toUpperCase())
    .maybeSingle();
  if (error) throw fromDatabaseError(error);
  if (!qr) throw notFound("No QR identifier matches that activation code.");
  if (qr.status === "disabled") throw conflict("This QR identifier is disabled and cannot be activated.");
  if (qr.status === "active") throw conflict("This QR identifier is already activated.");

  const { error: updateError } = await ctx.db
    .from("qr_codes")
    .update({
      status: "active",
      activated_at: new Date().toISOString(),
      vehicle_plate: input.vehiclePlate ?? null,
      owner_id: ctx.userId,
    })
    .eq("id", qr.id);
  if (updateError) throw fromDatabaseError(updateError);

  const { error: activationError } = await ctx.db.from("qr_activations").insert({
    qr_code_id: qr.id,
    activated_by: ctx.userId,
    source: input.source ?? "admin",
    status: "succeeded",
    vehicle_plate: input.vehiclePlate ?? null,
  });
  if (activationError) throw fromDatabaseError(activationError);

  await ctx.db.from("qr_events").insert({
    qr_code_id: qr.id,
    event_type: "activated",
    detail: `Activated via ${input.source ?? "admin"}`,
    actor_id: ctx.userId,
  });

  await writeAuditLog(ctx, {
    action: "qr_code.activated",
    entity: "qr_code",
    entityId: qr.id,
    metadata: { code: qr.code },
  });

  return { id: qr.id, code: qr.code, status: "active" };
}

export async function setQrCodeStatus(ctx: AppContext, input: { qrCodeId: string; status: "active" | "disabled" | "unused" }) {
  assertPermission(ctx, PERMISSIONS.qrUpdate);

  const { data, error } = await ctx.db
    .from("qr_codes")
    .update({ status: input.status })
    .eq("id", input.qrCodeId)
    .select("id, code, status")
    .maybeSingle();
  if (error) throw fromDatabaseError(error);
  if (!data) throw notFound("This QR identifier does not exist.");

  await ctx.db.from("qr_events").insert({
    qr_code_id: data.id,
    event_type: input.status === "disabled" ? "disabled" : "status_changed",
    detail: `Status set to ${input.status}`,
    actor_id: ctx.userId,
  });

  await writeAuditLog(ctx, {
    action: "qr_code.status_changed",
    entity: "qr_code",
    entityId: data.id,
    metadata: { status: input.status },
  });

  return data;
}

export async function getQrCodeDetail(ctx: AppContext, qrCodeId: string) {
  assertPermission(ctx, PERMISSIONS.qrView);
  const [{ data: qr, error }, { data: events, error: eventsError }] = await Promise.all([
    ctx.db
      .from("qr_codes")
      .select(
        "id, code, status, batch_id, vehicle_plate, activation_code, activated_at, last_used_at, created_at, qr_batches(id, name)",
      )
      .eq("id", qrCodeId)
      .maybeSingle(),
    ctx.db
      .from("qr_events")
      .select("id, event_type, detail, created_at")
      .eq("qr_code_id", qrCodeId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  if (error) throw fromDatabaseError(error);
  if (eventsError) throw fromDatabaseError(eventsError);
  if (!qr) throw notFound("This QR identifier does not exist.");
  return { qr, events: events ?? [] };
}

export async function getBatchDetail(ctx: AppContext, batchId: string) {
  assertPermission(ctx, PERMISSIONS.qrView);

  const [batchResult, totalResult, activeResult, disabledResult] = await Promise.all([
    ctx.db.from("qr_batches").select("id, name, quantity, format, status, created_at").eq("id", batchId).maybeSingle(),
    ctx.db.from("qr_codes").select("*", { count: "exact", head: true }).eq("batch_id", batchId),
    ctx.db.from("qr_codes").select("*", { count: "exact", head: true }).eq("batch_id", batchId).eq("status", "active"),
    ctx.db.from("qr_codes").select("*", { count: "exact", head: true }).eq("batch_id", batchId).eq("status", "disabled"),
  ]);

  if (batchResult.error) throw fromDatabaseError(batchResult.error);
  if (!batchResult.data) throw notFound("This batch does not exist.");

  const total = totalResult.count ?? 0;
  const active = activeResult.count ?? 0;
  const disabled = disabledResult.count ?? 0;

  return {
    batch: batchResult.data,
    stats: { total, active, disabled, unused: Math.max(0, total - active - disabled) },
  };
}
