/**
 * Single source of truth for roles and permission identifiers.
 * Portable to `packages/permissions` — no framework, React or Supabase imports.
 * These keys MUST match the rows seeded in the database (public.permissions / public.roles).
 */

export const ROLE_KEYS = ["superadmin", "admin", "manager", "support"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const PERMISSIONS = {
  usersView: "users.view",
  usersCreate: "users.create",
  usersUpdate: "users.update",
  usersDelete: "users.delete",

  rolesView: "roles.view",
  rolesCreate: "roles.create",
  rolesUpdate: "roles.update",
  rolesDelete: "roles.delete",
  rolesManage: "roles.manage",

  permissionsView: "permissions.view",
  permissionsManage: "permissions.manage",

  qrView: "qr.view",
  qrCreate: "qr.create",
  qrGenerate: "qr.generate",
  qrUpdate: "qr.update",
  qrActivate: "qr.activate",
  qrDelete: "qr.delete",

  interactionsView: "interactions.view",
  interactionsManage: "interactions.manage",

  telegramView: "telegram.view",
  telegramManage: "telegram.manage",

  notificationsView: "notifications.view",
  notificationsManage: "notifications.manage",

  paymentsView: "payments.view",
  paymentsManage: "payments.manage",

  auditView: "audit.view",

  systemView: "system.view",
  systemManage: "system.manage",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionKey[] = Object.values(PERMISSIONS);

export function hasPermission(granted: readonly string[], required: PermissionKey): boolean {
  return granted.includes(required);
}

export function hasAnyPermission(granted: readonly string[], required: readonly PermissionKey[]): boolean {
  return required.some((p) => granted.includes(p));
}
