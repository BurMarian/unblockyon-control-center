import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Bell, CreditCard, QrCode, Users as UsersIcon, ArrowRight } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { activityFeed, errorLogs, services, trendSeries } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/")({
  head: () => ({
    meta: [
      { title: "Overview — unblockyOn Admin" },
      {
        name: "description",
        content:
          "Operational overview of the unblockyOn platform: users, QR activations, revenue and system health.",
      },
      { property: "og:title", content: "Overview — unblockyOn Admin" },
      {
        property: "og:description",
        content: "Monitor users, QR activations, revenue and platform health in one console.",
      },
    ],
  }),
  component: OverviewPage,
});

const ranges = ["Today", "7 days", "30 days", "Custom"] as const;
const metrics = [
  { key: "users", label: "Users" },
  { key: "activations", label: "QR activations" },
  { key: "notifications", label: "Notifications" },
] as const;

function OverviewPage() {
  const [range, setRange] = useState<(typeof ranges)[number]>("7 days");
  const [metric, setMetric] = useState<(typeof metrics)[number]["key"]>("activations");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Monitor and manage your unblockyOn platform."
        actions={
          <div
            role="group"
            aria-label="Date range"
            className="inline-flex rounded-lg border border-border bg-card p-0.5"
          >
            {ranges.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  range === r
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value="1,248"
          change={12.4}
          icon={UsersIcon}
          spark={[62, 68, 74, 61, 88, 96, 104]}
        />
        <StatCard
          label="Active QR Codes"
          value="7,528"
          change={6.1}
          icon={QrCode}
          spark={[6800, 6902, 7010, 7188, 7290, 7402, 7528]}
        />
        <StatCard
          label="QR Activations"
          value="2,181"
          change={18.7}
          icon={Bell}
          spark={[214, 268, 302, 341, 296, 358, 402]}
        />
        <StatCard
          label="Revenue"
          value="€23,880"
          change={-2.3}
          icon={CreditCard}
          spark={[21430, 22100, 22890, 22440, 23310, 23120, 23880]}
        />
      </div>

      <SectionCard
        title="System health"
        description={`Live service status · ${range.toLowerCase()} window`}
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/system-health">
              Details <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        }
        bodyClassName="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {services.map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{s.name}</p>
              <p className="num text-xs text-muted-foreground">
                {s.latency} · uptime {s.uptime}
              </p>
            </div>
            <StatusBadge status={s.status} />
          </div>
        ))}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Platform activity"
          description="Daily volume across the selected period."
          actions={
            <div
              role="group"
              aria-label="Chart metric"
              className="inline-flex rounded-lg border border-border p-0.5"
            >
              {metrics.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMetric(m.key)}
                  aria-pressed={metric === m.key}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    metric === m.key
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          }
          bodyClassName="p-4"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#fillMetric)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Recent activity" description="Latest platform events." bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {activityFeed.map((a) => (
              <li key={a.id} className="flex gap-3 px-5 py-3.5">
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    a.kind === "warning"
                      ? "bg-warning"
                      : a.kind === "payment"
                        ? "bg-info"
                        : a.kind === "user"
                          ? "bg-chart-5"
                          : "bg-primary",
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent errors"
        description="Latest issues reported by platform services."
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/error-logs">
              View all errors <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        }
        bodyClassName="p-0"
      >
        <ul className="divide-y divide-border">
          {errorLogs.slice(0, 4).map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <StatusBadge status={e.severity} />
              <p className="min-w-0 flex-1 truncate text-sm">{e.message}</p>
              <span className="text-xs text-muted-foreground">{e.service}</span>
              <span className="num text-xs text-muted-foreground">{e.ts}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
