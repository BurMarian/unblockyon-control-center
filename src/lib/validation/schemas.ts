import { z } from "zod";

/** Centralised validation schemas. Portable to `packages/validation`. */

export const listParamsSchema = z.object({
  resource: z.string().min(1),
  search: z.string().max(200).optional(),
  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  page: z.number().int().min(1).max(10000).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  sort: z.object({ column: z.string().min(1).max(64), ascending: z.boolean() }).optional(),
});
export type ListParamsInput = z.infer<typeof listParamsSchema>;

export const recordIdSchema = z.object({ resource: z.string().min(1), id: z.string().min(1).max(200) });

export const mutateSchema = z.object({
  resource: z.string().min(1),
  id: z.string().min(1).max(200).optional(),
  values: z.record(z.string(), z.unknown()),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(120).optional(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  status: z.enum(["active", "suspended", "invited"]).optional(),
});

export const roleSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, "Key is required")
    .max(40)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers and underscores"),
  name: z.string().trim().min(2, "Name is required").max(80),
  description: z.string().trim().max(400).default(""),
});

export const generateBatchSchema = z.object({
  name: z.string().trim().min(2, "Batch name is required").max(80),
  quantity: z.number().int().min(1, "At least one identifier").max(5000, "Maximum 5000 identifiers per batch"),
  format: z.enum(["png", "svg", "pdf"]).default("png"),
});

export const activateQrSchema = z.object({
  activationCode: z.string().trim().min(4, "Activation code is required").max(32),
  vehiclePlate: z.string().trim().max(20).optional(),
  source: z.enum(["admin", "web", "telegram"]).default("admin"),
});

export const qrStatusSchema = z.object({
  qrCodeId: z.string().uuid(),
  status: z.enum(["active", "disabled", "unused"]),
});

export const rolePermissionSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
  granted: z.boolean(),
});

export const userRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

export const templateSchema = z.object({
  key: z.string().trim().min(2).max(60),
  name: z.string().trim().min(2).max(80),
  channel: z.enum(["telegram", "email", "push"]),
  subject: z.string().trim().max(140).optional(),
  body: z.string().trim().min(1, "Message body is required").max(4000),
  is_active: z.boolean().default(true),
});

export const planSchema = z.object({
  key: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400).default(""),
  price_cents: z.number().int().min(0).max(10_000_00),
  currency: z.enum(["EUR", "USD", "GBP"]).default("EUR"),
  interval: z.enum(["month", "year"]).default("month"),
  is_active: z.boolean().default(true),
});

export const notificationSchema = z.object({
  recipient: z.string().trim().min(2, "Recipient is required").max(160),
  channel: z.enum(["telegram", "email", "push"]),
  type: z.string().trim().min(2).max(60),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

export const settingSchema = z.object({
  key: z.string().trim().min(2).max(80),
  value: z.unknown(),
  description: z.string().trim().max(300).default(""),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});
