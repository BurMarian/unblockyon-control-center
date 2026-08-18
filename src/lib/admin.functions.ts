import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildAppContext } from "@/lib/application/build-context";
import type { AppContext } from "@/lib/application/context";
import { getDashboardStats, getRecentActivity } from "@/lib/application/services/dashboard-service";
import {
  activateQrCode,
  generateQrBatch,
  getBatchDetail,
  getQrCodeDetail,
  setQrCodeStatus,
} from "@/lib/application/services/qr-service";
import {
  assignRole,
  getRoleDetail,
  listRolesWithCounts,
  listUserRoles,
  revokeRole,
  setRolePermission,
} from "@/lib/application/services/rbac-service";
import {
  createResource,
  deleteResource,
  getResource,
  listResource,
  updateResource,
} from "@/lib/application/services/resource-service";
import {
  activateQrSchema,
  generateBatchSchema,
  listParamsSchema,
  mutateSchema,
  qrStatusSchema,
  recordIdSchema,
  rolePermissionSchema,
  userRoleSchema,
} from "@/lib/validation/schemas";

/** Builds the caller context (identity + DB-resolved permissions) for a request. */
async function context(ctx: { supabase: unknown; userId: string; claims: Record<string, unknown> }): Promise<AppContext> {
  const { getRequest } = await import("@tanstack/react-start/server");
  const request = getRequest();
  const ip =
    request?.headers.get("cf-connecting-ip") ??
    request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    undefined;

  return buildAppContext({
    db: ctx.supabase as AppContext["db"],
    userId: ctx.userId,
    email: typeof ctx.claims["email"] === "string" ? (ctx.claims["email"] as string) : undefined,
    ip,
  });
}

/* ------------------------------------------------------------------ identity */

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context: rpc }) => {
    const ctx = await context(rpc as never);
    const { data } = await ctx.db
      .from("profiles")
      .select("id, email, full_name, avatar_url, status, created_at")
      .eq("id", ctx.userId)
      .maybeSingle();

    return {
      userId: ctx.userId,
      email: ctx.email,
      profile: data ?? null,
      roles: ctx.roles,
      permissions: ctx.permissions,
    };
  });

/* ------------------------------------------------------------------ generic resources */

export const listResourceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => listParamsSchema.parse(data))
  .handler(async ({ data, context: rpc }) => {
    const ctx = await context(rpc as never);
    const { resource, ...params } = data;
    return listResource(ctx, resource, params);
  });

export const getResourceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => recordIdSchema.parse(data))
  .handler(async ({ data, context: rpc }) => getResource(await context(rpc as never), data.resource, data.id));

export const createResourceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => mutateSchema.parse(data))
  .handler(async ({ data, context: rpc }) => createResource(await context(rpc as never), data.resource, data.values));

export const updateResourceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => mutateSchema.extend({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data, context: rpc }) =>
    updateResource(await context(rpc as never), data.resource, data.id, data.values),
  );

export const deleteResourceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => recordIdSchema.parse(data))
  .handler(async ({ data, context: rpc }) => {
    await deleteResource(await context(rpc as never), data.resource, data.id);
    return { ok: true } as const;
  });

/* ------------------------------------------------------------------ dashboard */

export const getDashboardFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context: rpc }) => {
    const ctx = await context(rpc as never);
    const [stats, activity] = await Promise.all([getDashboardStats(ctx), getRecentActivity(ctx, 8)]);
    return { stats, activity };
  });

/* ------------------------------------------------------------------ rbac */

export const listRolesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context: rpc }) => listRolesWithCounts(await context(rpc as never)));

export const getRoleDetailFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ roleId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context: rpc }) => getRoleDetail(await context(rpc as never), data.roleId));

export const setRolePermissionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => rolePermissionSchema.parse(data))
  .handler(async ({ data, context: rpc }) => {
    await setRolePermission(await context(rpc as never), data);
    return { ok: true } as const;
  });

export const listUserRolesFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ userId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context: rpc }) => listUserRoles(await context(rpc as never), data.userId));

export const assignRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => userRoleSchema.parse(data))
  .handler(async ({ data, context: rpc }) => {
    await assignRole(await context(rpc as never), data);
    return { ok: true } as const;
  });

export const revokeRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => userRoleSchema.parse(data))
  .handler(async ({ data, context: rpc }) => {
    await revokeRole(await context(rpc as never), data);
    return { ok: true } as const;
  });

/* ------------------------------------------------------------------ qr */

export const generateQrBatchFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => generateBatchSchema.parse(data))
  .handler(async ({ data, context: rpc }) => generateQrBatch(await context(rpc as never), data));

export const activateQrFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => activateQrSchema.parse(data))
  .handler(async ({ data, context: rpc }) => activateQrCode(await context(rpc as never), data));

export const setQrStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => qrStatusSchema.parse(data))
  .handler(async ({ data, context: rpc }) => setQrCodeStatus(await context(rpc as never), data));

export const getQrDetailFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ qrCodeId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context: rpc }) => getQrCodeDetail(await context(rpc as never), data.qrCodeId));

export const getBatchDetailFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ batchId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context: rpc }) => getBatchDetail(await context(rpc as never), data.batchId));
