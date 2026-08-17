import type { PermissionKey } from "@/lib/domain/permissions";
import { PERMISSIONS } from "@/lib/domain/permissions";

/**
 * Declarative registry of every data resource the control center exposes.
 * Single source of truth for table, projection, ordering, search and the
 * permissions required for each operation. Portable to `packages/database`.
 */
export interface ResourceDefinition {
  table: string;
  select: string;
  orderBy: { column: string; ascending: boolean };
  searchColumns: string[];
  filterColumns: string[];
  permissions: {
    view: PermissionKey;
    create: PermissionKey;
    update: PermissionKey;
    delete: PermissionKey;
  };
  auditEntity: string;
  /** Columns clients are allowed to write. Anything else is rejected. */
  writable: string[];
}

const rbac = (view: PermissionKey, manage: PermissionKey) => ({
  view,
  create: manage,
  update: manage,
  delete: manage,
});

export const RESOURCES = {
  profiles: {
    table: "profiles",
    select: "id, email, full_name, phone, avatar_url, status, last_seen_at, created_at, updated_at",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["email", "full_name", "phone"],
    filterColumns: ["status"],
    permissions: {
      view: PERMISSIONS.usersView,
      create: PERMISSIONS.usersCreate,
      update: PERMISSIONS.usersUpdate,
      delete: PERMISSIONS.usersDelete,
    },
    auditEntity: "profile",
    writable: ["full_name", "phone", "status", "avatar_url"],
  },
  roles: {
    table: "roles",
    select: "id, key, name, description, is_system, created_at, updated_at",
    orderBy: { column: "created_at", ascending: true },
    searchColumns: ["key", "name", "description"],
    filterColumns: [],
    permissions: {
      view: PERMISSIONS.rolesView,
      create: PERMISSIONS.rolesCreate,
      update: PERMISSIONS.rolesUpdate,
      delete: PERMISSIONS.rolesDelete,
    },
    auditEntity: "role",
    writable: ["key", "name", "description"],
  },
  permissions: {
    table: "permissions",
    select: "id, key, resource, action, description",
    orderBy: { column: "key", ascending: true },
    searchColumns: ["key", "resource", "action", "description"],
    filterColumns: ["resource"],
    permissions: rbac(PERMISSIONS.permissionsView, PERMISSIONS.permissionsManage),
    auditEntity: "permission",
    writable: ["key", "resource", "action", "description"],
  },
  qr_batches: {
    table: "qr_batches",
    select: "id, name, quantity, format, status, created_by, created_at, updated_at",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["name", "status"],
    filterColumns: ["status", "format"],
    permissions: {
      view: PERMISSIONS.qrView,
      create: PERMISSIONS.qrCreate,
      update: PERMISSIONS.qrUpdate,
      delete: PERMISSIONS.qrDelete,
    },
    auditEntity: "qr_batch",
    writable: ["name", "status", "format"],
  },
  qr_codes: {
    table: "qr_codes",
    select:
      "id, code, batch_id, status, owner_id, vehicle_plate, activation_code, activated_at, last_used_at, created_at, updated_at, qr_batches(name)",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["code", "activation_code", "vehicle_plate"],
    filterColumns: ["status", "batch_id"],
    permissions: {
      view: PERMISSIONS.qrView,
      create: PERMISSIONS.qrCreate,
      update: PERMISSIONS.qrUpdate,
      delete: PERMISSIONS.qrDelete,
    },
    auditEntity: "qr_code",
    writable: ["status", "vehicle_plate"],
  },
  qr_activations: {
    table: "qr_activations",
    select: "id, qr_code_id, activated_by, source, status, vehicle_plate, created_at, qr_codes(code)",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["vehicle_plate", "source", "status"],
    filterColumns: ["status", "source"],
    permissions: {
      view: PERMISSIONS.qrView,
      create: PERMISSIONS.qrActivate,
      update: PERMISSIONS.qrUpdate,
      delete: PERMISSIONS.qrDelete,
    },
    auditEntity: "qr_activation",
    writable: ["status"],
  },
  qr_events: {
    table: "qr_events",
    select: "id, qr_code_id, event_type, detail, actor_id, created_at",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["event_type", "detail"],
    filterColumns: ["qr_code_id", "event_type"],
    permissions: {
      view: PERMISSIONS.qrView,
      create: PERMISSIONS.qrUpdate,
      update: PERMISSIONS.qrUpdate,
      delete: PERMISSIONS.qrDelete,
    },
    auditEntity: "qr_event",
    writable: [],
  },
  interactions: {
    table: "interactions",
    select: "id, qr_code_id, requester_contact, channel, status, message, created_at, updated_at, qr_codes(code)",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["requester_contact", "message", "status"],
    filterColumns: ["status", "channel"],
    permissions: rbac(PERMISSIONS.interactionsView, PERMISSIONS.interactionsManage),
    auditEntity: "interaction",
    writable: ["status", "message"],
  },
  telegram_accounts: {
    table: "telegram_accounts",
    select: "id, telegram_id, username, first_name, profile_id, status, created_at",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["telegram_id", "username", "first_name"],
    filterColumns: ["status"],
    permissions: rbac(PERMISSIONS.telegramView, PERMISSIONS.telegramManage),
    auditEntity: "telegram_account",
    writable: ["username", "first_name", "status"],
  },
  telegram_events: {
    table: "telegram_events",
    select: "id, telegram_account_id, event_type, payload, status, created_at, telegram_accounts(username)",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["event_type", "status"],
    filterColumns: ["status", "event_type"],
    permissions: rbac(PERMISSIONS.telegramView, PERMISSIONS.telegramManage),
    auditEntity: "telegram_event",
    writable: ["status"],
  },
  notification_templates: {
    table: "notification_templates",
    select: "id, key, name, channel, subject, body, variables, is_active, created_at, updated_at",
    orderBy: { column: "name", ascending: true },
    searchColumns: ["key", "name", "subject"],
    filterColumns: ["channel", "is_active"],
    permissions: rbac(PERMISSIONS.notificationsView, PERMISSIONS.notificationsManage),
    auditEntity: "notification_template",
    writable: ["key", "name", "channel", "subject", "body", "variables", "is_active"],
  },
  notifications: {
    table: "notifications",
    select:
      "id, template_id, recipient, channel, type, message, status, error, sent_at, created_at, notification_templates(name)",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["recipient", "message", "type"],
    filterColumns: ["status", "channel", "type"],
    permissions: rbac(PERMISSIONS.notificationsView, PERMISSIONS.notificationsManage),
    auditEntity: "notification",
    writable: ["recipient", "channel", "type", "message", "status", "template_id"],
  },
  plans: {
    table: "plans",
    select: "id, key, name, description, price_cents, currency, interval, features, is_active, created_at, updated_at",
    orderBy: { column: "price_cents", ascending: true },
    searchColumns: ["key", "name", "description"],
    filterColumns: ["is_active", "interval"],
    permissions: rbac(PERMISSIONS.paymentsView, PERMISSIONS.paymentsManage),
    auditEntity: "plan",
    writable: ["key", "name", "description", "price_cents", "currency", "interval", "features", "is_active"],
  },
  subscriptions: {
    table: "subscriptions",
    select:
      "id, profile_id, plan_id, status, current_period_end, external_reference, created_at, updated_at, profiles(email), plans(name)",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["status", "external_reference"],
    filterColumns: ["status", "plan_id"],
    permissions: rbac(PERMISSIONS.paymentsView, PERMISSIONS.paymentsManage),
    auditEntity: "subscription",
    writable: ["status", "plan_id", "current_period_end"],
  },
  payments: {
    table: "payments",
    select:
      "id, profile_id, subscription_id, plan_id, amount_cents, currency, method, status, external_reference, refunded_at, created_at, updated_at, profiles(email), plans(name)",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["external_reference", "method", "status"],
    filterColumns: ["status", "method", "plan_id"],
    permissions: rbac(PERMISSIONS.paymentsView, PERMISSIONS.paymentsManage),
    auditEntity: "payment",
    writable: ["status", "method", "amount_cents", "currency", "external_reference"],
  },
  audit_logs: {
    table: "audit_logs",
    select: "id, actor_id, actor_email, action, entity, entity_id, metadata, ip_address, created_at",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["actor_email", "action", "entity", "entity_id"],
    filterColumns: ["entity", "action"],
    permissions: {
      view: PERMISSIONS.auditView,
      create: PERMISSIONS.auditView,
      update: PERMISSIONS.auditView,
      delete: PERMISSIONS.auditView,
    },
    auditEntity: "audit_log",
    writable: [],
  },
  services: {
    table: "services",
    select: "id, key, name, version, status, last_check_at, created_at, updated_at",
    orderBy: { column: "name", ascending: true },
    searchColumns: ["key", "name", "version"],
    filterColumns: ["status"],
    permissions: rbac(PERMISSIONS.systemView, PERMISSIONS.systemManage),
    auditEntity: "service",
    writable: ["key", "name", "version", "status", "last_check_at"],
  },
  system_events: {
    table: "system_events",
    select: "id, service_key, event_type, severity, message, metadata, created_at",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["service_key", "event_type", "message"],
    filterColumns: ["severity", "service_key"],
    permissions: rbac(PERMISSIONS.systemView, PERMISSIONS.systemManage),
    auditEntity: "system_event",
    writable: [],
  },
  error_logs: {
    table: "error_logs",
    select: "id, service_key, severity, message, stack, request_id, metadata, resolved_at, created_at",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["message", "service_key", "request_id"],
    filterColumns: ["severity", "service_key"],
    permissions: rbac(PERMISSIONS.systemView, PERMISSIONS.systemManage),
    auditEntity: "error_log",
    writable: ["resolved_at", "severity"],
  },
  system_settings: {
    table: "system_settings",
    select: "key, value, description, updated_by, updated_at",
    orderBy: { column: "key", ascending: true },
    searchColumns: ["key", "description"],
    filterColumns: [],
    permissions: rbac(PERMISSIONS.systemView, PERMISSIONS.systemManage),
    auditEntity: "system_setting",
    writable: ["value", "description"],
  },
} as const satisfies Record<string, ResourceDefinition>;

export type ResourceKey = keyof typeof RESOURCES;

export function getResourceDefinition(key: string): ResourceDefinition {
  const def = (RESOURCES as Record<string, ResourceDefinition | undefined>)[key];
  if (!def) throw new Error(`Unknown resource: ${key}`);
  return def;
}

/** Primary key column for a resource (system_settings is keyed by `key`). */
export function primaryKeyOf(key: string): string {
  return key === "system_settings" ? "key" : "id";
}
