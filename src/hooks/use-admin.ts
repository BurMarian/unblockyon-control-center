import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getMe } from "@/lib/admin.functions";
import type { PermissionKey } from "@/lib/domain/permissions";

export interface Me {
  userId: string;
  email: string;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    status: string;
    created_at: string;
  } | null;
  roles: string[];
  permissions: string[];
}

/** Current caller: profile, roles and DB-resolved permissions. */
export function useMe() {
  const fetchMe = useServerFn(getMe);
  const query = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchMe() as Promise<Me>,
    staleTime: 60_000,
  });

  const permissions = query.data?.permissions ?? [];
  const roles = query.data?.roles ?? [];

  return {
    ...query,
    me: query.data ?? null,
    roles,
    permissions,
    can: (permission: PermissionKey) => permissions.includes(permission),
    hasRole: (role: string) => roles.includes(role),
    displayName: query.data?.profile?.full_name ?? query.data?.email ?? "",
  };
}
