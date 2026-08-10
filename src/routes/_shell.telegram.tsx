import { createFileRoute } from "@tanstack/react-router";
import {
  Bot,
  CheckCircle2,
  Info,
  RefreshCw,
  Send,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader, SectionCard } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, Td, Th } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { notifications, telegramEvents, telegramSeries } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/telegram")({
  head: () => ({
    meta: [
      { title: "Telegram Bot — unblockyOn Admin" },
      { name: "description", content: "Monitor the unblockyOn Telegram bot status, delivery rate and recent messages." },
      { property: "og:title", content: "Telegram Bot — unblockyOn Admin" },
      { property: "og:description", content: "Bot status, delivery rate and recent messages." },
    ],
  }),
  component: TelegramPage,
});

const toneIcon = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: XCircle,
} as const;

const toneClass = {
  success: "text-success",
  info: "text-muted-foreground",
  warning: "text-warning-foreground",
  error: "text-destructive",
} as const;

function TelegramPage() {
  const telegramNotifications = notifications.filter((n) => n.channel === "Telegram");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telegram"
        description="Bot health, delivery performance and recent message activity."
        actions={
          <>
            <Button variant="outline" size="sm">
              <RefreshCw className="size-4" aria-hidden="true" /> Refresh
            </Button>
            <Button size="sm">
              <Send className="size-4" aria-hidden="true" /> Send test message
            </Button>
          </>
        }
      />

      <SectionCard bodyClassName="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-success-muted text-success">
            <Bot className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">@unblockyon_bot</p>
            <p className="text-xs text-muted-foreground">Webhook mode · v1.9.0 · last update 12 seconds ago</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <MiniStat label="Status" node={<StatusBadge status="Operational" />} />
          <MiniStat label="Uptime" value="99.87%" />
          <MiniStat label="Avg. latency" value="228 ms" />
          <MiniStat label="Queue" value="18 pending" />
        </div>
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Messages Sent (7d)" value="5,499" change={18.6} icon={Send} />
        <StatCard label="Delivered" value="5,270" change={19.1} tone="success" />
        <StatCard label="Failed" value="229" change={-6.2} tone="error" />
        <StatCard label="Delivery rate" value="95.8%" change={1.4} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Delivery volume"
          description="Delivered vs failed messages over the last 7 days."
          className="lg:col-span-2"
          bodyClassName="p-5"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={telegramSeries} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="delivered" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={26} />
                <Bar dataKey="failed" fill="var(--destructive)" radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Live bot activity" bodyClassName="p-5">
          <ul className="space-y-4">
            {telegramEvents.map((e) => {
              const Icon = toneIcon[e.tone];
              return (
                <li key={e.id} className="flex gap-3">
                  <Icon className={`mt-0.5 size-4 shrink-0 ${toneClass[e.tone]}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{e.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.detail}</p>
                  </div>
                  <span className="num ml-auto shrink-0 text-xs text-muted-foreground">{e.time}</span>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Recent Telegram messages" bodyClassName="p-0">
        <DataTable>
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <Th>Type</Th>
              <Th>Recipient</Th>
              <Th>Message</Th>
              <Th>Status</Th>
              <Th>Sent at</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {telegramNotifications.map((n) => (
              <tr key={n.id} className="transition-colors hover:bg-muted/40">
                <Td className="font-medium">{n.type}</Td>
                <Td className="text-muted-foreground">{n.recipient}</Td>
                <Td className="max-w-sm truncate text-muted-foreground">{n.message}</Td>
                <Td>
                  <StatusBadge status={n.status} />
                </Td>
                <Td className="num text-muted-foreground">{n.sentAt}</Td>
                <Td align="right">
                  <Button variant="ghost" size="sm">
                    Resend
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </SectionCard>
    </div>
  );
}

function MiniStat({ label, value, node }: { label: string; value?: string; node?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      {node ? <div className="mt-1.5">{node}</div> : <p className="num mt-1 text-sm font-semibold">{value}</p>}
    </div>
  );
}
