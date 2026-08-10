import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "error" | "info" | "neutral";

const toneMap: Record<Tone, string> = {
  success: "bg-success-muted text-success border-success/20",
  warning: "bg-warning-muted text-warning-foreground border-warning/30",
  error: "bg-destructive-muted text-destructive border-destructive/20",
  info: "bg-info-muted text-info border-info/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

const statusTone: Record<string, Tone> = {
  Active: "success",
  Operational: "success",
  Paid: "success",
  Sent: "success",
  Activated: "success",
  Delivered: "success",
  Success: "success",
  Resolved: "success",
  Completed: "success",
  Invited: "info",
  Idle: "info",
  Info: "info",
  Pending: "warning",
  Degraded: "warning",
  Warning: "warning",
  Investigating: "warning",
  Suspended: "warning",
  Unused: "neutral",
  Archived: "neutral",
  Expired: "neutral",
  Disabled: "neutral",
  Cancelled: "neutral",
  System: "info",
  Failed: "error",
  Error: "error",
  Critical: "error",
  Revoked: "error",
  Unavailable: "error",
  Refunded: "info",
  Open: "error",
};

export function StatusBadge({
  status,
  tone,
  dot = true,
  className,
}: {
  status: string;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  const resolved = tone ?? statusTone[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        toneMap[resolved],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {status}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const resolved = statusTone[status] ?? "neutral";
  const color =
    resolved === "success"
      ? "bg-success"
      : resolved === "warning"
        ? "bg-warning"
        : resolved === "error"
          ? "bg-destructive"
          : resolved === "info"
            ? "bg-info"
            : "bg-muted-foreground";
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={cn("size-2 rounded-full", color)} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}
