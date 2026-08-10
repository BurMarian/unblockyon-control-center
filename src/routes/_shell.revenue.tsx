import { createFileRoute } from "@tanstack/react-router";
import { CircleDollarSign, Download, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader, SectionCard } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { DataTable, Td, Th } from "@/components/data-table";
import { FilterSelect } from "@/components/filter-select";
import { Button } from "@/components/ui/button";
import { planDistribution, plans, revenueSeries } from "@/lib/mock-data";
import { euro, num } from "@/lib/format";

export const Route = createFileRoute("/_shell/revenue")({
  head: () => ({
    meta: [
      { title: "Revenue — unblockyOn Admin" },
      { name: "description", content: "Track unblockyOn MRR, revenue growth, plan mix and transaction volume." },
      { property: "og:title", content: "Revenue — unblockyOn Admin" },
      { property: "og:description", content: "MRR, revenue growth, plan mix and transaction volume." },
    ],
  }),
  component: RevenuePage,
});

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--card)",
  fontSize: 12,
};

function RevenuePage() {
  const totalSubs = plans.reduce((s, p) => s + p.subs, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue"
        description="Financial performance across plans and billing periods."
        actions={
          <>
            <FilterSelect label="Period" options={["Last 7 months", "This year", "Last 12 months"]} />
            <Button variant="outline" size="sm">
              <Download className="size-4" aria-hidden="true" /> Export report
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="MRR" value="€23,880" change={11.4} icon={CircleDollarSign} />
        <StatCard label="ARR (projected)" value="€286,560" change={11.4} tone="success" icon={TrendingUp} />
        <StatCard label="ARPU" value="€40.55" change={2.1} />
        <StatCard label="Churn rate" value="1.8%" change={-0.4} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Monthly revenue"
          description="Recurring revenue over the last 7 months."
          className="lg:col-span-2"
          bodyClassName="p-5"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ left: -6, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => euro(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Revenue by plan" description={`${num(totalSubs)} active subscriptions`} bodyClassName="p-5">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planDistribution} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={3}>
                  {planDistribution.map((entry, i) => (
                    <Cell key={entry.name} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-2.5">
            {planDistribution.map((p, i) => (
              <li key={p.name} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: pieColors[i % pieColors.length] }}
                  aria-hidden="true"
                />
                <span>{p.name}</span>
                <span className="num ml-auto text-muted-foreground">{num(p.value)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Transaction volume" bodyClassName="p-5">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="transactions" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Monthly breakdown" bodyClassName="p-0">
          <DataTable>
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <Th>Month</Th>
                <Th align="right">Revenue</Th>
                <Th align="right">Transactions</Th>
                <Th align="right">Avg. value</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...revenueSeries].reverse().map((r) => (
                <tr key={r.month} className="transition-colors hover:bg-muted/40">
                  <Td className="font-medium">{r.month} 2026</Td>
                  <Td align="right" className="num">
                    {euro(r.revenue)}
                  </Td>
                  <Td align="right" className="num text-muted-foreground">
                    {num(r.transactions)}
                  </Td>
                  <Td align="right" className="num text-muted-foreground">
                    {euro(Math.round((r.revenue / r.transactions) * 100) / 100)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </SectionCard>
      </div>
    </div>
  );
}
