import { createFileRoute } from "@tanstack/react-router";
import { Activity, Cpu, Database, Server } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader, SectionCard } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { services, trendSeries } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/system-health")({
  head: () => ({
    meta: [
      { title: "System Health — unblockyOn Admin" },
      { name: "description", content: "Live uptime, latency and resource usage across unblockyOn infrastructure." },
      { property: "og:title", content: "System Health — unblockyOn Admin" },
      { property: "og:description", content: "Uptime, latency and resource usage." },
    ],
  }),
  component: SystemHealthPage,
});

const resources = [
  { label: "CPU usage", value: 42, detail: "8 vCPU · avg 1m load 1.9" },
  { label: "Memory", value: 68, detail: "10.9 GB of 16 GB" },
  { label: "Disk", value: 54, detail: "268 GB of 500 GB" },
  { label: "Redis memory", value: 86, detail: "3.4 GB of 4 GB", warn: true },
];

function SystemHealthPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="System Health" description="Infrastructure status across all unblockyOn services." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Uptime (30d)" value="99.96%" change={0.02} icon={Activity} tone="success" />
        <StatCard label="Avg. response" value="118 ms" change={-4.2} icon={Server} tone="success" />
        <StatCard label="Requests / min" value="2,418" change={7.9} icon={Cpu} />
        <StatCard label="Error rate" value="0.24%" change={0.05} icon={Database} tone="warning" />
      </div>

      <SectionCard title="Request throughput" description="Platform activity over the last 7 days." bodyClassName="p-5">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendSeries} margin={{ left: -10, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="healthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="notifications" stroke="var(--primary)" strokeWidth={2} fill="url(#healthFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Resource usage" bodyClassName="space-y-5 p-5">
          {resources.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{r.label}</span>
                <span className="num text-muted-foreground">{r.value}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={r.warn ? "h-full rounded-full bg-warning" : "h-full rounded-full bg-primary"}
                  style={{ width: `${r.value}%` }}
                />
              </div>
              <p className="num mt-1.5 text-xs text-muted-foreground">{r.detail}</p>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Service status" bodyClassName="divide-y divide-border p-0">
          {services.map((s) => (
            <div key={s.name} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="num text-xs text-muted-foreground">
                  {s.uptime} uptime · {s.latency}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
}
