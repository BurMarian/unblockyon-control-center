// Static mock data for the unblockyOn admin dashboard prototype.
// No backend, no persistence — purely for UI demonstration.

export type UserStatus = "Active" | "Invited" | "Suspended" | "Disabled";
export type RoleName = "Superadmin" | "Admin" | "Manager" | "Support";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  status: UserStatus;
  lastLogin: string;
  created: string;
  location: string;
  phone: string;
}

export const users: MockUser[] = [
  { id: "usr_8241", name: "Alex Morgan", email: "alex.morgan@unblockyon.com", role: "Superadmin", status: "Active", lastLogin: "2026-08-10 17:42", created: "2025-01-14", location: "Zagreb, HR", phone: "+385 91 224 118" },
  { id: "usr_8242", name: "Maria Wilson", email: "maria.wilson@unblockyon.com", role: "Admin", status: "Active", lastLogin: "2026-08-10 15:08", created: "2025-02-02", location: "Vienna, AT", phone: "+43 660 118 220" },
  { id: "usr_8243", name: "Daniel Carter", email: "daniel.carter@unblockyon.com", role: "Manager", status: "Active", lastLogin: "2026-08-09 21:19", created: "2025-03-21", location: "Berlin, DE", phone: "+49 151 4820 118" },
  { id: "usr_8244", name: "Sophie Brown", email: "sophie.brown@unblockyon.com", role: "Support", status: "Invited", lastLogin: "—", created: "2026-08-04", location: "London, UK", phone: "+44 7700 900412" },
  { id: "usr_8245", name: "Luka Novak", email: "luka.novak@unblockyon.com", role: "Manager", status: "Active", lastLogin: "2026-08-10 09:31", created: "2025-05-11", location: "Ljubljana, SI", phone: "+386 41 662 004" },
  { id: "usr_8246", name: "Elena Petrova", email: "elena.petrova@unblockyon.com", role: "Support", status: "Active", lastLogin: "2026-08-10 12:57", created: "2025-06-30", location: "Sofia, BG", phone: "+359 88 442 118" },
  { id: "usr_8247", name: "Tomas Andersen", email: "tomas.andersen@unblockyon.com", role: "Admin", status: "Suspended", lastLogin: "2026-07-22 08:04", created: "2025-04-18", location: "Copenhagen, DK", phone: "+45 30 44 21 08" },
  { id: "usr_8248", name: "Nina Kovač", email: "nina.kovac@unblockyon.com", role: "Support", status: "Disabled", lastLogin: "2026-05-02 11:23", created: "2025-02-27", location: "Split, HR", phone: "+385 98 553 210" },
  { id: "usr_8249", name: "Marco Rossi", email: "marco.rossi@unblockyon.com", role: "Manager", status: "Active", lastLogin: "2026-08-08 19:44", created: "2025-09-09", location: "Milan, IT", phone: "+39 340 118 2204" },
  { id: "usr_8250", name: "Hannah Weber", email: "hannah.weber@unblockyon.com", role: "Support", status: "Active", lastLogin: "2026-08-10 16:12", created: "2026-01-19", location: "Munich, DE", phone: "+49 176 3320 118" },
  { id: "usr_8251", name: "Peter Havel", email: "peter.havel@unblockyon.com", role: "Manager", status: "Invited", lastLogin: "—", created: "2026-08-07", location: "Prague, CZ", phone: "+420 604 118 220" },
  { id: "usr_8252", name: "Ivana Barić", email: "ivana.baric@unblockyon.com", role: "Admin", status: "Active", lastLogin: "2026-08-10 08:02", created: "2025-11-03", location: "Rijeka, HR", phone: "+385 95 118 4420" },
];

export const roles = [
  { id: "superadmin", name: "Superadmin", description: "Unrestricted access to every platform capability and setting.", usersCount: 1, permissionsCount: 28, status: "System" },
  { id: "admin", name: "Admin", description: "Manages users, QR operations, billing and platform configuration.", usersCount: 3, permissionsCount: 22, status: "Active" },
  { id: "manager", name: "Manager", description: "Operates QR batches, activations and customer communication.", usersCount: 4, permissionsCount: 14, status: "Active" },
  { id: "support", name: "Support", description: "Read-only operational access with limited notification actions.", usersCount: 4, permissionsCount: 8, status: "Active" },
];

export const permissionGroups = [
  {
    group: "Access management",
    resources: [
      { key: "users", label: "Users", description: "Platform user accounts and invitations.", perms: { view: true, create: true, update: true, delete: false } },
      { key: "roles", label: "Roles & Permissions", description: "Administrative role definitions.", perms: { view: true, create: false, update: true, delete: false } },
      { key: "sessions", label: "Sessions", description: "Active administrative sessions.", perms: { view: true, create: false, update: true, delete: true } },
    ],
  },
  {
    group: "QR operations",
    resources: [
      { key: "qr", label: "QR Codes", description: "Individual QR identifiers.", perms: { view: true, create: true, update: true, delete: false } },
      { key: "batches", label: "QR Batches", description: "Generated production batches.", perms: { view: true, create: true, update: true, delete: false } },
      { key: "activations", label: "Activations", description: "QR activation lifecycle.", perms: { view: true, create: false, update: true, delete: false } },
    ],
  },
  {
    group: "Business",
    resources: [
      { key: "payments", label: "Payments", description: "Transactions and refunds.", perms: { view: true, create: false, update: false, delete: false } },
      { key: "plans", label: "Plans & Pricing", description: "Subscription plan configuration.", perms: { view: true, create: false, update: false, delete: false } },
    ],
  },
  {
    group: "System",
    resources: [
      { key: "logs", label: "System Logs", description: "Audit and error logs.", perms: { view: true, create: false, update: false, delete: false } },
      { key: "settings", label: "Settings", description: "Platform configuration.", perms: { view: true, create: false, update: true, delete: false } },
    ],
  },
];

export const sessions = [
  { id: "ses_4410", user: "Alex Morgan", device: "MacBook Pro 16″", browser: "Chrome 141", location: "Zagreb, HR", ip: "89.164.22.104", lastActive: "2 minutes ago", created: "2026-08-10 08:12", status: "Active" },
  { id: "ses_4411", user: "Maria Wilson", device: "iPhone 17 Pro", browser: "Safari Mobile", location: "Vienna, AT", ip: "213.47.118.22", lastActive: "18 minutes ago", created: "2026-08-10 09:41", status: "Active" },
  { id: "ses_4412", user: "Daniel Carter", device: "ThinkPad X1", browser: "Firefox 142", location: "Berlin, DE", ip: "91.66.204.18", lastActive: "3 hours ago", created: "2026-08-09 21:19", status: "Idle" },
  { id: "ses_4413", user: "Luka Novak", device: "Dell XPS 15", browser: "Edge 141", location: "Ljubljana, SI", ip: "193.2.88.140", lastActive: "just now", created: "2026-08-10 09:31", status: "Active" },
  { id: "ses_4414", user: "Elena Petrova", device: "iPad Air", browser: "Safari 26", location: "Sofia, BG", ip: "78.90.11.208", lastActive: "1 hour ago", created: "2026-08-10 12:57", status: "Idle" },
  { id: "ses_4415", user: "Tomas Andersen", device: "MacBook Air 13″", browser: "Chrome 140", location: "Copenhagen, DK", ip: "185.24.90.11", lastActive: "19 days ago", created: "2026-07-22 08:04", status: "Expired" },
];

export type QrStatus = "Unused" | "Active" | "Disabled" | "Expired";

export const qrCodes = [
  { id: "UBQ-2026-000148", batch: "BATCH-2608-A", status: "Active" as QrStatus, activation: "Activated", created: "2026-08-02", lastActivity: "2026-08-10 17:04" },
  { id: "UBQ-2026-000149", batch: "BATCH-2608-A", status: "Active" as QrStatus, activation: "Activated", created: "2026-08-02", lastActivity: "2026-08-10 14:22" },
  { id: "UBQ-2026-000150", batch: "BATCH-2608-A", status: "Unused" as QrStatus, activation: "Pending", created: "2026-08-02", lastActivity: "—" },
  { id: "UBQ-2026-000151", batch: "BATCH-2607-C", status: "Disabled" as QrStatus, activation: "Revoked", created: "2026-07-18", lastActivity: "2026-08-01 10:08" },
  { id: "UBQ-2026-000152", batch: "BATCH-2607-C", status: "Active" as QrStatus, activation: "Activated", created: "2026-07-18", lastActivity: "2026-08-09 07:51" },
  { id: "UBQ-2026-000153", batch: "BATCH-2607-B", status: "Expired" as QrStatus, activation: "Expired", created: "2026-06-30", lastActivity: "2026-07-30 16:40" },
  { id: "UBQ-2026-000154", batch: "BATCH-2608-B", status: "Unused" as QrStatus, activation: "Pending", created: "2026-08-06", lastActivity: "—" },
  { id: "UBQ-2026-000155", batch: "BATCH-2608-B", status: "Active" as QrStatus, activation: "Activated", created: "2026-08-06", lastActivity: "2026-08-10 11:36" },
  { id: "UBQ-2026-000156", batch: "BATCH-2608-B", status: "Unused" as QrStatus, activation: "Pending", created: "2026-08-06", lastActivity: "—" },
  { id: "UBQ-2026-000157", batch: "BATCH-2605-A", status: "Active" as QrStatus, activation: "Activated", created: "2026-05-12", lastActivity: "2026-08-04 18:20" },
];

export const activations = [
  { id: "act_9931", qr: "UBQ-2026-000148", code: "A7K-42PQ", status: "Activated", at: "2026-08-03 09:14", by: "Marko Jurić", source: "Telegram Bot" },
  { id: "act_9932", qr: "UBQ-2026-000149", code: "B2M-81LT", status: "Activated", at: "2026-08-03 11:47", by: "Ana Horvat", source: "Web" },
  { id: "act_9933", qr: "UBQ-2026-000150", code: "C9F-30RD", status: "Pending", at: "—", by: "—", source: "—" },
  { id: "act_9934", qr: "UBQ-2026-000151", code: "D4X-77YE", status: "Revoked", at: "2026-07-29 15:02", by: "Daniel Carter", source: "Admin" },
  { id: "act_9935", qr: "UBQ-2026-000152", code: "E1T-58KM", status: "Activated", at: "2026-07-20 08:33", by: "Petar Vidić", source: "Telegram Bot" },
  { id: "act_9936", qr: "UBQ-2026-000153", code: "F6R-19WB", status: "Failed", at: "2026-07-30 16:40", by: "system", source: "QR Bridge" },
  { id: "act_9937", qr: "UBQ-2026-000155", code: "G8N-64QA", status: "Activated", at: "2026-08-07 19:12", by: "Lea Marić", source: "Web" },
  { id: "act_9938", qr: "UBQ-2026-000157", code: "H3P-25ZC", status: "Activated", at: "2026-05-14 07:58", by: "Ivan Šarić", source: "Telegram Bot" },
];

export const batches = [
  { id: "BATCH-2608-B", quantity: 2500, active: 1180, unused: 1290, disabled: 30, created: "2026-08-06", status: "Active" },
  { id: "BATCH-2608-A", quantity: 1000, active: 742, unused: 236, disabled: 22, created: "2026-08-02", status: "Active" },
  { id: "BATCH-2607-C", quantity: 5000, active: 3910, unused: 940, disabled: 150, created: "2026-07-18", status: "Active" },
  { id: "BATCH-2607-B", quantity: 1500, active: 1104, unused: 296, disabled: 100, created: "2026-06-30", status: "Archived" },
  { id: "BATCH-2605-A", quantity: 750, active: 604, unused: 118, disabled: 28, created: "2026-05-12", status: "Active" },
  { id: "BATCH-2604-A", quantity: 300, active: 188, unused: 92, disabled: 20, created: "2026-04-08", status: "Disabled" },
];

export const notifications = [
  { id: "ntf_5521", type: "Driver blocked", recipient: "Marko Jurić", channel: "Telegram", status: "Sent", sentAt: "2026-08-10 17:41", message: "Your vehicle ZG 118-AB is blocking an exit at Radnička 41." },
  { id: "ntf_5522", type: "QR activated", recipient: "Ana Horvat", channel: "Telegram", status: "Sent", sentAt: "2026-08-10 16:03", message: "Your unblockyOn QR UBQ-2026-000149 is now active." },
  { id: "ntf_5523", type: "Welcome", recipient: "sophie.brown@unblockyon.com", channel: "Email", status: "Pending", sentAt: "—", message: "Welcome to unblockyOn. Finish setting up your account." },
  { id: "ntf_5524", type: "Payment successful", recipient: "Marco Rossi", channel: "Email", status: "Sent", sentAt: "2026-08-10 12:20", message: "We received your payment of €49.00 for the Business plan." },
  { id: "ntf_5525", type: "System alert", recipient: "ops@unblockyon.com", channel: "Email", status: "Failed", sentAt: "2026-08-10 09:58", message: "Redis memory usage exceeded 85% for 5 minutes." },
  { id: "ntf_5526", type: "Activation successful", recipient: "Lea Marić", channel: "Telegram", status: "Sent", sentAt: "2026-08-07 19:12", message: "Activation completed for UBQ-2026-000155." },
  { id: "ntf_5527", type: "Driver blocked", recipient: "Ivan Šarić", channel: "SMS", status: "Failed", sentAt: "2026-08-09 22:11", message: "Delivery failed: recipient number unreachable." },
  { id: "ntf_5528", type: "QR activated", recipient: "Petar Vidić", channel: "Telegram", status: "Pending", sentAt: "—", message: "Queued for delivery, retry 1 of 3." },
];

export const templates = [
  { id: "tpl_driver_blocked", name: "Driver blocked", title: "Your vehicle is blocking an exit", channel: "Telegram", updated: "2026-08-04", vars: ["{{plate}}", "{{location}}", "{{time}}"], body: "Hello, your vehicle {{plate}} is blocking an exit at {{location}} since {{time}}. Please move it as soon as possible." },
  { id: "tpl_qr_activated", name: "QR activated", title: "Your QR code is active", channel: "Telegram", updated: "2026-07-28", vars: ["{{qr_id}}", "{{plate}}"], body: "Your unblockyOn QR {{qr_id}} is now linked to {{plate}} and ready to use." },
  { id: "tpl_welcome", name: "Welcome", title: "Welcome to unblockyOn", channel: "Email", updated: "2026-06-15", vars: ["{{name}}"], body: "Hi {{name}}, welcome to unblockyOn. Your account is ready — activate your first QR to get started." },
  { id: "tpl_activation_successful", name: "Activation successful", title: "Activation completed", channel: "Email", updated: "2026-07-02", vars: ["{{qr_id}}", "{{time}}"], body: "Activation for {{qr_id}} completed at {{time}}." },
  { id: "tpl_payment_successful", name: "Payment successful", title: "Payment received", channel: "Email", updated: "2026-05-30", vars: ["{{amount}}", "{{plan}}"], body: "We received your payment of {{amount}} for the {{plan}} plan. Thank you." },
  { id: "tpl_system_alert", name: "System alert", title: "Platform alert", channel: "Email", updated: "2026-08-01", vars: ["{{service}}", "{{severity}}"], body: "A {{severity}} alert was raised on {{service}}. Check the system health dashboard." },
];

export const transactions = [
  { id: "txn_7f21a904", user: "Marco Rossi", amount: 49.0, currency: "EUR", status: "Paid", method: "Visa •••• 4142", created: "2026-08-10 12:20", plan: "Business" },
  { id: "txn_7f21a903", user: "Ana Horvat", amount: 10.0, currency: "EUR", status: "Paid", method: "Mastercard •••• 8820", created: "2026-08-10 10:04", plan: "Starter" },
  { id: "txn_7f21a902", user: "Petar Vidić", amount: 49.0, currency: "EUR", status: "Pending", method: "SEPA Direct Debit", created: "2026-08-10 08:47", plan: "Business" },
  { id: "txn_7f21a901", user: "Lea Marić", amount: 10.0, currency: "EUR", status: "Failed", method: "Visa •••• 0071", created: "2026-08-09 21:15", plan: "Starter" },
  { id: "txn_7f21a900", user: "Ivan Šarić", amount: 249.0, currency: "EUR", status: "Paid", method: "Wire transfer", created: "2026-08-09 14:32", plan: "Enterprise" },
  { id: "txn_7f21a8ff", user: "Marko Jurić", amount: 10.0, currency: "EUR", status: "Refunded", method: "Visa •••• 1188", created: "2026-08-08 17:51", plan: "Starter" },
  { id: "txn_7f21a8fe", user: "Nina Kovač", amount: 49.0, currency: "EUR", status: "Cancelled", method: "Mastercard •••• 4410", created: "2026-08-08 09:02", plan: "Business" },
  { id: "txn_7f21a8fd", user: "Hannah Weber", amount: 49.0, currency: "EUR", status: "Paid", method: "Apple Pay", created: "2026-08-07 19:44", plan: "Business" },
];

export const plans = [
  { id: "starter", name: "Starter", price: "€10", period: "per month", qr: "100 QR codes", subs: 412, status: "Active", features: ["100 QR codes", "Telegram notifications", "Email support", "1 admin seat"] },
  { id: "business", name: "Business", price: "€49", period: "per month", qr: "1,000 QR codes", subs: 168, status: "Active", features: ["1,000 QR codes", "Batch generation", "Priority support", "5 admin seats", "Custom branding"] },
  { id: "enterprise", name: "Enterprise", price: "Custom", period: "annual contract", qr: "Unlimited QR codes", subs: 14, status: "Active", features: ["Unlimited QR codes", "Dedicated QR bridge", "SLA 99.95%", "Unlimited seats", "On-premise option"] },
];

export const services = [
  { name: "API", status: "Operational", uptime: "99.98%", latency: "84 ms", version: "v2.14.3", checked: "12 seconds ago", incidents: 0 },
  { name: "Database", status: "Operational", uptime: "99.99%", latency: "11 ms", version: "PostgreSQL 17.2", checked: "12 seconds ago", incidents: 0 },
  { name: "Redis", status: "Degraded", uptime: "99.41%", latency: "162 ms", version: "7.4.1", checked: "9 seconds ago", incidents: 2 },
  { name: "Telegram Bot", status: "Operational", uptime: "99.87%", latency: "228 ms", version: "v1.9.0", checked: "20 seconds ago", incidents: 1 },
  { name: "QR Bridge", status: "Operational", uptime: "99.92%", latency: "57 ms", version: "v0.8.4", checked: "15 seconds ago", incidents: 0 },
  { name: "SMTP", status: "Operational", uptime: "99.75%", latency: "310 ms", version: "Postmark", checked: "40 seconds ago", incidents: 0 },
];

export const activityFeed = [
  { id: 1, actor: "Alex Morgan", action: "generated QR batch BATCH-2608-B", time: "12 minutes ago", kind: "qr" },
  { id: 2, actor: "Daniel Carter", action: "activated QR UBQ-2026-000155", time: "48 minutes ago", kind: "qr" },
  { id: 3, actor: "Maria Wilson", action: "created user Sophie Brown", time: "1 hour ago", kind: "user" },
  { id: 4, actor: "System", action: "delivered 1,204 Telegram notifications", time: "2 hours ago", kind: "telegram" },
  { id: 5, actor: "System", action: "raised warning: Redis memory above 85%", time: "3 hours ago", kind: "warning" },
  { id: 6, actor: "Ivana Barić", action: "refunded transaction txn_7f21a8ff", time: "5 hours ago", kind: "payment" },
];

export const auditLogs = [
  { ts: "2026-08-10 17:42:08", user: "Alex Morgan", action: "QR batch generated", resource: "Batch", resourceId: "BATCH-2608-B", ip: "89.164.22.104", status: "Success" },
  { ts: "2026-08-10 16:58:41", user: "Maria Wilson", action: "User updated", resource: "User", resourceId: "usr_8248", ip: "213.47.118.22", status: "Success" },
  { ts: "2026-08-10 16:12:03", user: "Ivana Barić", action: "Payment refunded", resource: "Transaction", resourceId: "txn_7f21a8ff", ip: "93.138.4.77", status: "Success" },
  { ts: "2026-08-10 14:22:55", user: "Daniel Carter", action: "QR activated", resource: "QR Code", resourceId: "UBQ-2026-000149", ip: "91.66.204.18", status: "Success" },
  { ts: "2026-08-10 12:04:19", user: "Alex Morgan", action: "Role changed", resource: "Role", resourceId: "manager", ip: "89.164.22.104", status: "Success" },
  { ts: "2026-08-10 09:31:47", user: "Luka Novak", action: "Settings updated", resource: "Settings", resourceId: "security.session_ttl", ip: "193.2.88.140", status: "Success" },
  { ts: "2026-08-10 08:02:12", user: "Tomas Andersen", action: "Sign-in attempt", resource: "Session", resourceId: "ses_4415", ip: "185.24.90.11", status: "Failed" },
  { ts: "2026-08-09 22:47:30", user: "Elena Petrova", action: "Notification resent", resource: "Notification", resourceId: "ntf_5527", ip: "78.90.11.208", status: "Success" },
];

export const errorLogs = [
  { id: "err_20a4f1", severity: "Critical", service: "Redis", message: "Connection pool exhausted while writing activation cache", endpoint: "internal:cache.write", http: "—", ts: "2026-08-10 17:11:04", status: "Open", requestId: "req_9f2c11a4" },
  { id: "err_20a4f0", severity: "Error", service: "Telegram Bot", message: "Message delivery failed: chat not found", endpoint: "POST /bot/sendMessage", http: "400", ts: "2026-08-10 16:22:48", status: "Investigating", requestId: "req_9f2c1102" },
  { id: "err_20a4ef", severity: "Warning", service: "API", message: "Slow query detected on activations index (1.8s)", endpoint: "GET /v2/activations", http: "200", ts: "2026-08-10 15:04:12", status: "Open", requestId: "req_9f2c10c7" },
  { id: "err_20a4ee", severity: "Error", service: "QR Bridge", message: "Batch rendering worker timed out after 30s", endpoint: "POST /bridge/render", http: "504", ts: "2026-08-10 11:39:55", status: "Resolved", requestId: "req_9f2c0f31" },
  { id: "err_20a4ed", severity: "Info", service: "SMTP", message: "Provider throttled outbound queue for 40 seconds", endpoint: "internal:mail.flush", http: "—", ts: "2026-08-10 09:58:07", status: "Resolved", requestId: "req_9f2c0d08" },
  { id: "err_20a4ec", severity: "Error", service: "API", message: "Unhandled exception in payment webhook handler", endpoint: "POST /v2/webhooks/payments", http: "500", ts: "2026-08-09 21:15:33", status: "Resolved", requestId: "req_9f2c0902" },
];

export const stackTrace = `PaymentWebhookError: Unhandled exception in payment webhook handler
    at PaymentsService.handleWebhook (/srv/api/src/payments/payments.service.ts:184:15)
    at PaymentsController.webhook (/srv/api/src/payments/payments.controller.ts:62:28)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at RouterExecutionContext.handler (/srv/api/node_modules/@nestjs/core/router/router-execution-context.js:47:28)
    at /srv/api/node_modules/@nestjs/core/router/router-proxy.js:9:17`;

export const trendSeries = [
  { day: "Aug 04", users: 68, activations: 214, notifications: 640 },
  { day: "Aug 05", users: 74, activations: 268, notifications: 712 },
  { day: "Aug 06", users: 61, activations: 302, notifications: 688 },
  { day: "Aug 07", users: 88, activations: 341, notifications: 804 },
  { day: "Aug 08", users: 96, activations: 296, notifications: 762 },
  { day: "Aug 09", users: 79, activations: 358, notifications: 918 },
  { day: "Aug 10", users: 104, activations: 402, notifications: 1204 },
];

export const revenueSeries = [
  { month: "Feb", revenue: 12480, transactions: 318 },
  { month: "Mar", revenue: 14120, transactions: 356 },
  { month: "Apr", revenue: 15890, transactions: 401 },
  { month: "May", revenue: 17240, transactions: 428 },
  { month: "Jun", revenue: 18960, transactions: 472 },
  { month: "Jul", revenue: 21430, transactions: 519 },
  { month: "Aug", revenue: 23880, transactions: 566 },
];

export const planDistribution = [
  { name: "Starter", value: 412 },
  { name: "Business", value: 168 },
  { name: "Enterprise", value: 14 },
];

export const telegramSeries = [
  { day: "Aug 04", delivered: 612, failed: 28 },
  { day: "Aug 05", delivered: 688, failed: 24 },
  { day: "Aug 06", delivered: 654, failed: 34 },
  { day: "Aug 07", delivered: 771, failed: 33 },
  { day: "Aug 08", delivered: 730, failed: 32 },
  { day: "Aug 09", delivered: 882, failed: 36 },
  { day: "Aug 10", delivered: 1162, failed: 42 },
];

export const telegramEvents = [
  { id: 1, label: "Message delivered", detail: "Driver blocked → Marko Jurić", time: "17:41", tone: "success" as const },
  { id: 2, label: "Notification sent", detail: "QR activated → Ana Horvat", time: "16:03", tone: "info" as const },
  { id: 3, label: "Delivery failed", detail: "chat not found → +385 98 …210", time: "15:22", tone: "error" as const },
  { id: 4, label: "Retry scheduled", detail: "ntf_5528 · retry 1 of 3", time: "15:23", tone: "warning" as const },
  { id: 5, label: "Message delivered", detail: "Activation successful → Lea Marić", time: "14:12", tone: "success" as const },
];

export const searchGroups = [
  { group: "Users", items: ["Alex Morgan", "Maria Wilson", "Daniel Carter", "Sophie Brown"], to: "/users" },
  { group: "QR Codes", items: ["UBQ-2026-000148", "UBQ-2026-000155"], to: "/qr-codes" },
  { group: "Batches", items: ["BATCH-2608-B", "BATCH-2607-C"], to: "/batches" },
  { group: "Transactions", items: ["txn_7f21a904", "txn_7f21a900"], to: "/payments" },
  { group: "Logs", items: ["Activity logs", "Error logs"], to: "/activity-logs" },
  { group: "Settings", items: ["General", "Security", "Administration"], to: "/settings/general" },
];
