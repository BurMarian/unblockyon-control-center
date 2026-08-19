import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "./audit";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  status: string;
  last_seen_at: string | null;
  created_at: string;
  roleKeys: string[];
  roleNames: string[];
}

interface UserFilters {
  search?: string;
  status?: string;
  role?: string;
}

export const usersQuery = (filters: UserFilters = {}) =>
  queryOptions({
    queryKey: ["users", filters],
    queryFn: async (): Promise<AdminUser[]> => {
      let query = supabase
        .from("profiles")
        .select("id, email, full_name, phone, status, last_seen_at, created_at")
        .order("created_at", { ascending: false });

      if (filters.search) {
        const term = `%${filters.search}%`;
        query = query.or(`email.ilike.${term},full_name.ilike.${term}`);
      }
      if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;

      const ids = (data ?? []).map((p) => p.id);
      const { data: roleRows, error: roleError } = ids.length
        ? await supabase
            .from("user_roles")
            .select("user_id, roles ( key, name )")
            .in("user_id", ids)
        : { data: [], error: null };
      if (roleError) throw roleError;

      const byUser = new Map<string, { keys: string[]; names: string[] }>();
      for (const row of (roleRows ?? []) as Array<{
        user_id: string;
        roles: { key: string; name: string } | null;
      }>) {
        if (!row.roles) continue;
        const entry = byUser.get(row.user_id) ?? { keys: [], names: [] };
        entry.keys.push(row.roles.key);
        entry.names.push(row.roles.name);
        byUser.set(row.user_id, entry);
      }

      const users = (data ?? []).map((p) => ({
        ...p,
        roleKeys: byUser.get(p.id)?.keys ?? [],
        roleNames: byUser.get(p.id)?.names ?? [],
      }));

      return filters.role && filters.role !== "all"
        ? users.filter((u) => u.roleKeys.includes(filters.role!))
        : users;
    },
  });

export const userQuery = (userId: string) =>
  queryOptions({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, phone, avatar_url, status, last_seen_at, created_at, updated_at")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;

      const { data: roleRows, error: roleError } = await supabase
        .from("user_roles")
        .select("role_id, roles ( id, key, name )")
        .eq("user_id", userId);
      if (roleError) throw roleError;

      return {
        profile: data,
        roles: ((roleRows ?? []) as Array<{ roles: { id: string; key: string; name: string } | null }>)
          .map((r) => r.roles)
          .filter((r): r is { id: string; key: string; name: string } => Boolean(r)),
      };
    },
  });

export const rolesQuery = () =>
  queryOptions({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("id, key, name, description, is_system, created_at, role_permissions ( permission_id )")
        .order("created_at");
      if (error) throw error;

      const { data: counts, error: countError } = await supabase.from("user_roles").select("role_id");
      if (countError) throw countError;

      const usersByRole = new Map<string, number>();
      for (const row of counts ?? []) {
        usersByRole.set(row.role_id, (usersByRole.get(row.role_id) ?? 0) + 1);
      }

      return (data ?? []).map((r) => ({
        id: r.id,
        key: r.key,
        name: r.name,
        description: r.description,
        isSystem: r.is_system,
        permissionsCount: r.role_permissions?.length ?? 0,
        usersCount: usersByRole.get(r.id) ?? 0,
      }));
    },
  });

export const permissionsQuery = () =>
  queryOptions({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("id, key, resource, action, description")
        .order("resource")
        .order("action");
      if (error) throw error;
      return data ?? [];
    },
  });

export const rolePermissionsQuery = (roleId: string) =>
  queryOptions({
    queryKey: ["role-permissions", roleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("id, key, name, description, is_system, role_permissions ( permission_id )")
        .eq("id", roleId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export async function setUserStatus(userId: string, status: string) {
  const { error } = await supabase.from("profiles").update({ status }).eq("id", userId);
  if (error) throw error;
  await logAudit({ action: `user.${status}`, entity: "profile", entityId: userId, metadata: { status } });
}

export async function setUserRole(userId: string, roleId: string) {
  const { error: delError } = await supabase.from("user_roles").delete().eq("user_id", userId);
  if (delError) throw delError;
  const { data: actor } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role_id: roleId, granted_by: actor.user?.id ?? null });
  if (error) throw error;
  await logAudit({ action: "user.role_changed", entity: "user_role", entityId: userId, metadata: { roleId } });
}

export async function updateProfile(userId: string, values: { full_name?: string; phone?: string }) {
  const { error } = await supabase.from("profiles").update(values).eq("id", userId);
  if (error) throw error;
  await logAudit({ action: "user.updated", entity: "profile", entityId: userId, metadata: values });
}

export async function setRolePermission(roleId: string, permissionId: string, enabled: boolean) {
  if (enabled) {
    const { error } = await supabase.from("role_permissions").insert({ role_id: roleId, permission_id: permissionId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId)
      .eq("permission_id", permissionId);
    if (error) throw error;
  }
  await logAudit({
    action: enabled ? "role.permission_granted" : "role.permission_revoked",
    entity: "role",
    entityId: roleId,
    metadata: { permissionId },
  });
}

export async function createRole(values: { key: string; name: string; description: string }) {
  const { data, error } = await supabase.from("roles").insert(values).select("id").single();
  if (error) throw error;
  await logAudit({ action: "role.created", entity: "role", entityId: data.id, metadata: values });
  return data.id;
}

export async function deleteRole(roleId: string) {
  const { error } = await supabase.from("roles").delete().eq("id", roleId);
  if (error) throw error;
  await logAudit({ action: "role.deleted", entity: "role", entityId: roleId });
}
