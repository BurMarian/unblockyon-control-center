import type { AppContext } from "../context";

export interface AuditEntry {
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Audit writes must never break the business operation they describe, but they
 * must never be silently faked either — failures are logged server-side.
 */
export async function writeAuditLog(ctx: AppContext, entry: AuditEntry): Promise<void> {
  const { error } = await ctx.db.from("audit_logs").insert({
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId ?? null,
    metadata: (entry.metadata ?? {}) as never,
    ip_address: ctx.ip ?? null,
  });
  if (error) console.error("[audit] failed to write audit log", error.code, error.message);
}
