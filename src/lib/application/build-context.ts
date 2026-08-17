import type { AppContext, Db } from "./context";
import { fromDatabaseError, unauthorized } from "./errors";

/**
 * Builds the caller context from the DATABASE, never from client input.
 * Roles and permissions are resolved through the caller's own RLS-scoped client.
 */
export async function buildAppContext(params: {
  db: Db;
  userId: string | undefined;
  email: string | undefined;
  ip?: string | undefined;
}): Promise<AppContext> {
  if (!params.userId) throw unauthorized();

  const { data, error } = await params.db
    .from("user_roles")
    .select("roles(key), roles!inner(role_permissions(permissions(key)))")
    .eq("user_id", params.userId);

  if (error) throw fromDatabaseError(error);

  const roles = new Set<string>();
  const permissions = new Set<string>();

  for (const row of (data ?? []) as unknown as Array<{
    roles: { key: string; role_permissions: Array<{ permissions: { key: string } | null }> } | null;
  }>) {
    if (!row.roles) continue;
    roles.add(row.roles.key);
    for (const rp of row.roles.role_permissions ?? []) {
      if (rp.permissions) permissions.add(rp.permissions.key);
    }
  }

  return {
    userId: params.userId,
    email: params.email ?? "",
    db: params.db,
    roles: [...roles],
    permissions: [...permissions],
    ip: params.ip,
  };
}
