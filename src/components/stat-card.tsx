import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  comparison = "vs previous period",
  icon: Icon,
  spark,
  tone = "neutral",
}: {
  label: string;
  value: string;
  change?: number;
  comparison?: string;
  icon?: LucideIcon;
  spark?: number[];
  tone?: "neutral" | "success" | "warning" | "error";
}) {
  const positive = (change ?? 0) >= 0;
  const accent =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning-foreground"
        : tone === "error"
          ? "text-destructive"
          : "text-muted-foreground";

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon className={cn("size-4", accent)} aria-hidden="true" />}
      </div>
      <p className="num mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        {change !== undefined ? (
          <p className="flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
                positive
                  ? "bg-success-muted text-success"
                  : "bg-destructive-muted text-destructive",
              )}
            >
              {positive ? (
                <ArrowUpRight className="size-3" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="size-3" aria-hidden="true" />
              )}
              {positive ? "+" : ""}
              {change}%
            </span>
            <span className="text-muted-foreground">{comparison}</span>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{comparison}</p>
        )}
        {spark && <Sparkline points={spark} />}
      </div>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 72;
      const y = 24 - ((p - min) / span) * 22;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width="72" height="26" viewBox="0 0 72 26" aria-hidden="true" className="shrink-0">
      <path d={d} fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
