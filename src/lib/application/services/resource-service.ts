import { assertPermission, type AppContext } from "../context";
import { validationFailed } from "../errors";
import { writeAuditLog } from "../repositories/audit-repository";
import {
  deleteRecord,
  getRecord,
  insertRecord,
  listRecords,
  updateRecord,
  type ListParams,
  type ListResult,
} from "../repositories/resource-repository";
import { getResourceDefinition } from "../resources";

/**
 * Generic resource application service.
 * Transport-independent: an Edge Function, a NestJS controller or a TanStack
 * server function can all call these with an AppContext.
 */

export async function listResource(
  ctx: AppContext,
  resource: string,
  params: ListParams,
): Promise<ListResult<Record<string, unknown>>> {
  const def = getResourceDefinition(resource);
  assertPermission(ctx, def.permissions.view);
  return listRecords<Record<string, unknown>>(ctx.db, def, resource, params);
}

export async function getResource(
  ctx: AppContext,
  resource: string,
  id: string,
): Promise<Record<string, unknown>> {
  const def = getResourceDefinition(resource);
  assertPermission(ctx, def.permissions.view);
  return getRecord<Record<string, unknown>>(ctx.db, def, resource, id);
}

function pickWritable(resource: string, values: Record<string, unknown>): Record<string, unknown> {
  const def = getResourceDefinition(resource);
  const picked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (def.writable.includes(key)) picked[key] = value;
  }
  if (Object.keys(picked).length === 0) {
    throw validationFailed("No writable fields were provided for this resource.");
  }
  return picked;
}

export async function createResource(
  ctx: AppContext,
  resource: string,
  values: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const def = getResourceDefinition(resource);
  assertPermission(ctx, def.permissions.create);
  const row = await insertRecord<Record<string, unknown>>(ctx.db, def, pickWritable(resource, values));
  await writeAuditLog(ctx, {
    action: `${def.auditEntity}.created`,
    entity: def.auditEntity,
    entityId: String(row["id"] ?? row["key"] ?? ""),
    metadata: { values: pickWritable(resource, values) },
  });
  return row;
}

export async function updateResource(
  ctx: AppContext,
  resource: string,
  id: string,
  values: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const def = getResourceDefinition(resource);
  assertPermission(ctx, def.permissions.update);
  const patch = pickWritable(resource, values);
  const row = await updateRecord<Record<string, unknown>>(ctx.db, def, resource, id, patch);
  await writeAuditLog(ctx, {
    action: `${def.auditEntity}.updated`,
    entity: def.auditEntity,
    entityId: id,
    metadata: { patch },
  });
  return row;
}

export async function deleteResource(ctx: AppContext, resource: string, id: string): Promise<void> {
  const def = getResourceDefinition(resource);
  assertPermission(ctx, def.permissions.delete);
  await deleteRecord(ctx.db, def, resource, id);
  await writeAuditLog(ctx, {
    action: `${def.auditEntity}.deleted`,
    entity: def.auditEntity,
    entityId: id,
  });
}
