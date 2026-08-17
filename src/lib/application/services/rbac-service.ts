import { PERMISSIONS } from "@/lib/domain/permissions";
import { assertPermission, type AppContext } from "../context";
import { conflict, fromDatabaseError, notFound } from "../errors";
import { writeAuditLog } from "../repositories/audit-repository";

export interface RoleSummary {
  id: string;
  key: string;
  name: string;
  description: string;
  is_system: boolean;
  users_count: number;
  permissions_count: number;
}

export async function listRolesWithCounts(ctx: AppContext): Promise<RoleSummary[]> {
  assertPermission(ctx, PERMISSIONS.rolesView);
  const { data, error } = await ctx.db
    .from("roles")
    .select("id, key, name, description, is_system, role_permissions(count), user_roles(count)")
    .order("created_at", { ascending: true });
  if (error) throw fromDatabaseError(error);

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => ({
    id: String(row["id"]),
    key: String(row["key"]),
    name: String(row["name"]),
    description: String(row["description"] ?? ""),
    is_system: Boolean(row["is_system"]),
    permissions_count: Number((row["role_permissions"] as Array<{ count: number }> | null)?.[0]?.count ?? 0),
    users_count: Number((row["user_roles"] as Array<{ count: number }> | null)?.[0]?.count ?? 0),
  }));
}

export interface RoleDetail {
  role: { id: string; key: string; name: string; description: string; is_system: boolean };
  permissions: Array<{ id: string; key: string; resource: string; action: string; description: string }>;
  grantedPermissionIds: string[];
}

export async function getRoleDetail(ctx: AppContext, roleId: string): Promise<RoleDetail> {
  assertPermission(ctx, PERMISSIONS.rolesView);

  const [{ data: role, error: roleError }, { data: permissions, error: permError }, { data: granted, error: grantError }] =
    await Promise.all([
      ctx.db.from("roles").select("id, key, name, description, is_system").eq("id", roleId).maybeSingle(),
      ctx.db.from("permissions").select("id, key, resource, action, description").order("key"),
      ctx.db.from("role_permissions").select("permission_id").eq("role_id", roleId),
    ]);

  if (roleError) throw fromDatabaseError(roleError);
  if (permError) throw fromDatabaseError(permError);
  if (grantError) throw fromDatabaseError(grantError);
  if (!role) throw notFound("This role does not exist.");

  return {
    role,
    permissions: permissions ?? [],
    grantedPermissionIds: (granted ?? []).map((g) => g.permission_id),
  };
}

export async function setRolePermission(
  ctx: AppContext,
  input: { roleId: string; permissionId: string; granted: boolean },
): Promise<void> {
  assertPermission(ctx, PERMISSIONS.rolesManage);

  const { data: role, error } = await ctx.db
    .from("roles")
    .select("id, key, is_system")
    .eq("id", input.roleId)
    .maybeSingle();
  if (error) throw fromDatabaseError(error);
  if (!role) throw notFound("This role does not exist.");
  if (role.is_system) throw conflict("System roles inherit every permission and cannot be modified.");

  if (input.granted) {
    const { error: insertError } = await ctx.db
      .from("role_permissions")
      .upsert({ role_id: input.roleId, permission_id: input.permissionId });
    if (insertError) throw fromDatabaseError(insertError);
  } else {
    const { error: deleteError } = await ctx.db
      .from("role_permissions")
      .delete()
      .eq("role_id", input.roleId)
      .eq("permission_id", input.permissionId);
    if (deleteError) throw fromDatabaseError(deleteError);
  }

  await writeAuditLog(ctx, {
    action: input.granted ? "role.permission_granted" : "role.permission_revoked",
    entity: "role",
    entityId: input.roleId,
    metadata: { permission_id: input.permissionId },
  });
}

export async function listUserRoles(ctx: AppContext, userId: string) {
  assertPermission(ctx, PERMISSIONS.usersView);
  const { data, error } = await ctx.db
    .from("user_roles")
    .select("id, role_id, created_at, roles(id, key, name)")
    .eq("user_id", userId);
  if (error) throw fromDatabaseError(error);
  return data ?? [];
}

export async function assignRole(ctx: AppContext, input: { userId: string; roleId: string }): Promise<void> {
  assertPermission(ctx, PERMISSIONS.rolesManage);
  const { error } = await ctx.db
    .from("user_roles")
    .insert({ user_id: input.userId, role_id: input.roleId, granted_by: ctx.userId });
  if (error) throw fromDatabaseError(error);
  await writeAuditLog(ctx, {
    action: "user.role_assigned",
    entity: "profile",
    entityId: input.userId,
    metadata: { role_id: input.roleId },
  });
}

export async function revokeRole(ctx: AppContext, input: { userId: string; roleId: string }): Promise<void> {
  assertPermission(ctx, PERMISSIONS.rolesManage);

  if (input.userId === ctx.userId) {
    const { data: role } = await ctx.db.from("roles").select("key").eq("id", input.roleId).maybeSingle();
    if (role?.key === "superadmin") {
      throw conflict("You cannot revoke your own superadmin role.");
    }
  }

  const { error, count } = await ctx.db
    .from("user_roles")
    .delete({ count: "exact" })
    .eq("user_id", input.userId)
    .eq("role_id", input.roleId);
  if (error) throw fromDatabaseError(error);
  if (!count) throw notFound("This role assignment does not exist.");

  await writeAuditLog(ctx, {
    action: "user.role_revoked",
    entity: "profile",
    entityId: input.userId,
    metadata: { role_id: input.roleId },
  });
}
