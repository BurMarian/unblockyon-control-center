import { PERMISSIONS, type PermissionKey } from "@/lib/domain/permissions";
import { can, type AppContext } from "../context";
import { fromDatabaseError } from "../errors";

export interface DashboardStats {
  users: number | null;
  activeUsers: number | null;
  qrCodes: number | null;
  activeQrCodes: number | null;
  activations24h: number | null;
  interactions: number | null;
  openInteractions: number | null;
  notifications24h: number | null;
  failedNotifications: number | null;
  paidRevenueCents: number | null;
  payments: number | null;
  errors24h: number | null;
}

/** Aggregation happens in Postgres — never by pulling rows into the browser. */
export async function getDashboardStats(ctx: AppContext): Promise<DashboardStats> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const count = async (
    permission: PermissionKey,
    table: string,
    build?: (q: any) => any,
  ): Promise<number | null> => {
    if (!can(ctx, permission)) return null;
    let query = (ctx.db as any).from(table).select("*", { count: "exact", head: true });
    if (build) query = build(query);
    const { count: value, error } = await query;
    if (error) throw fromDatabaseError(error);
    return value ?? 0;
  };

  const revenue = async (): Promise<number | null> => {
    if (!can(ctx, PERMISSIONS.paymentsView)) return null;
    const { data, error } = await ctx.db.from("payments").select("amount_cents").eq("status", "paid").limit(1000);
    if (error) throw fromDatabaseError(error);
    return (data ?? []).reduce((sum, row) => sum + (row.amount_cents ?? 0), 0);
  };

  const [
    users,
    activeUsers,
    qrCodes,
    activeQrCodes,
    activations24h,
    interactions,
    openInteractions,
    notifications24h,
    failedNotifications,
    payments,
    errors24h,
    paidRevenueCents,
  ] = await Promise.all([
    count(PERMISSIONS.usersView, "profiles"),
    count(PERMISSIONS.usersView, "profiles", (q) => q.eq("status", "active")),
    count(PERMISSIONS.qrView, "qr_codes"),
    count(PERMISSIONS.qrView, "qr_codes", (q) => q.eq("status", "active")),
    count(PERMISSIONS.qrView, "qr_activations", (q) => q.gte("created_at", since24h)),
    count(PERMISSIONS.interactionsView, "interactions"),
    count(PERMISSIONS.interactionsView, "interactions", (q) => q.eq("status", "pending")),
    count(PERMISSIONS.notificationsView, "notifications", (q) => q.gte("created_at", since24h)),
    count(PERMISSIONS.notificationsView, "notifications", (q) => q.eq("status", "failed")),
    count(PERMISSIONS.paymentsView, "payments"),
    count(PERMISSIONS.systemView, "error_logs", (q) => q.gte("created_at", since24h)),
    revenue(),
  ]);

  return {
    users,
    activeUsers,
    qrCodes,
    activeQrCodes,
    activations24h,
    interactions,
    openInteractions,
    notifications24h,
    failedNotifications,
    payments,
    errors24h,
    paidRevenueCents,
  };
}

/** Recent audit activity for the overview feed. */
export async function getRecentActivity(ctx: AppContext, limit = 8) {
  if (!can(ctx, PERMISSIONS.auditView)) return [];
  const { data, error } = await ctx.db
    .from("audit_logs")
    .select("id, actor_email, action, entity, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw fromDatabaseError(error);
  return data ?? [];
}
