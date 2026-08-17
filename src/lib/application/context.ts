import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import type { PermissionKey } from "@/lib/domain/permissions";
import { forbidden } from "./errors";

/** The database port. Any adapter (Edge Function, NestJS) can supply it. */
export type Db = SupabaseClient<Database>;

/**
 * Everything a service needs about the caller. Built by the transport layer,
 * never by the browser: the permissions are read from the database, not the client.
 */
export interface AppContext {
  userId: string;
  email: string;
  db: Db;
  roles: string[];
  permissions: string[];
  ip?: string | undefined;
}

export function assertPermission(ctx: AppContext, permission: PermissionKey): void {
  if (!ctx.permissions.includes(permission)) {
    throw forbidden(`Missing permission: ${permission}`);
  }
}

export function can(ctx: AppContext, permission: PermissionKey): boolean {
  return ctx.permissions.includes(permission);
}
