import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function StateShell({
  icon,
  title,
  description,
  action,
  tone = "muted",
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  tone?: "muted" | "error" | "warning";
}) {
  const ring =
    tone === "error"
      ? "bg-destructive-muted text-destructive"
      : tone === "warning"
        ? "bg-warning-muted text-warning-foreground"
        : "bg-muted text-muted-foreground";
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className={`flex size-11 items-center justify-center rounded-full ${ring}`}>
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <StateShell
      icon={<Inbox className="size-5" aria-hidden="true" />}
      title={title}
      description={description}
      action={action}
    />
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Try again in a moment.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <StateShell
      tone="error"
      icon={<AlertTriangle className="size-5" aria-hidden="true" />}
      title={title}
      description={description}
      action={
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      }
    />
  );
}

export function PermissionDeniedState({
  description = "You don't have permission to access this page. Contact a workspace administrator if you need access.",
}: {
  description?: string;
}) {
  return (
    <StateShell
      tone="warning"
      icon={<Lock className="size-5" aria-hidden="true" />}
      title="Access denied"
      description={description}
    />
  );
}

export function LoadingState({ label = "Loading data…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 px-6 py-14 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-border" aria-busy="true" aria-label="Loading table">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-3.5">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className="h-4 flex-1" style={{ maxWidth: c === 0 ? 200 : 120 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-8 w-32" />
          <Skeleton className="mt-4 h-3 w-40" />
        </div>
      ))}
    </div>
  );
}

/** Small demo switcher so every data page can showcase its states. */
export type PageState = "success" | "loading" | "empty" | "error" | "denied";

export function StateSwitcher({
  value,
  onChange,
}: {
  value: PageState;
  onChange: (v: PageState) => void;
}) {
  const options: PageState[] = ["success", "loading", "empty", "error", "denied"];
  return (
    <div
      role="group"
      aria-label="Preview page state"
      className="inline-flex rounded-lg border border-border bg-card p-0.5"
    >
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
            value === o
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
