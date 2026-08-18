/**
 * Single source of truth for roles & permissions.
 * Portable: no React, no Supabase, no Deno. Moves to packages/permissions as-is.
 */

export const ROLE_KEYS = ["superadmin", "admin", "manager", "support"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const PERMISSIONS = [
  "users.view",
  "users.create",
  "users.update",
  "users.delete",
  "roles.view",
  "roles.create",
  "roles.update",
  "roles.delete",
  "roles.manage",
  "permissions.view",
  "permissions.manage",
  "qr.view",
  "qr.create",
  "qr.generate",
  "qr.update",
  "qr.activate",
  "qr.delete",
  "interactions.view",
  "interactions.manage",
  "telegram.view",
  "telegram.manage",
  "notifications.view",
  "notifications.manage",
  "payments.view",
  "payments.manage",
  "audit.view",
  "system.view",
  "system.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}

export function hasPermission(granted: readonly string[], required: Permission): boolean {
  return granted.includes(required);
}
