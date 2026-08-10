import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileWarning } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, DataToolbar, TableFooterBar, Td, Th } from "@/components/data-table";
import { FilterSelect } from "@/components/filter-select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { errorLogs, stackTrace } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/error-logs")({
  head: () => ({
    meta: [
      { title: "Error Logs — unblockyOn Admin" },
      { name: "description", content: "Investigate platform exceptions, failed requests and service errors with stack traces." },
      { property: "og:title", content: "Error Logs — unblockyOn Admin" },
      { property: "og:description", content: "Exceptions, failed requests and stack traces." },
    ],
  }),
  component: ErrorLogsPage,
});

function ErrorLogsPage() {
  const [open, setOpen] = useState<string | null>(null);
  const active = errorLogs.find((e) => e.id === open);

  return (
    <div className="space-y-6">
      <PageHeader title="Error Logs" description="Exceptions and failures captured across services." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Errors (24h)" value="42" change={-12.5} icon={FileWarning} tone="error" />
        <StatCard label="Critical" value="1" change={0} tone="error" />
        <StatCard label="Open" value="6" change={-2.1} tone="warning" />
        <StatCard label="Resolved (7d)" value="128" change={9.4} tone="success" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <DataToolbar placeholder="Search errors, endpoints or request IDs…">
          <FilterSelect label="Severity" options={["All severities", "Critical", "Error", "Warning", "Info"]} />
          <FilterSelect label="Service" options={["All services", "API", "Database", "Redis", "Telegram Bot", "QR Bridge", "SMTP"]} />
          <FilterSelect label="Status" options={["All statuses", "Open", "Investigating", "Resolved"]} />
        </DataToolbar>

        <DataTable>
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <Th>Severity</Th>
              <Th>Service</Th>
              <Th>Message</Th>
              <Th>Endpoint</Th>
              <Th>HTTP</Th>
              <Th>Timestamp</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {errorLogs.map((e) => (
              <tr key={e.id} className="transition-colors hover:bg-muted/40">
                <Td>
                  <StatusBadge status={e.severity} />
                </Td>
                <Td className="font-medium">{e.service}</Td>
                <Td className="max-w-sm truncate">{e.message}</Td>
                <Td className="num text-muted-foreground">{e.endpoint}</Td>
                <Td className="num text-muted-foreground">{e.http}</Td>
                <Td className="num text-muted-foreground">{e.ts}</Td>
                <Td>
                  <StatusBadge status={e.status} />
                </Td>
                <Td align="right">
                  <Button variant="ghost" size="sm" onClick={() => setOpen(e.id)}>
                    Details
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <TableFooterBar showing={errorLogs.length} total={412} />
      </div>

      <Sheet open={Boolean(active)} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{active?.message ?? "Error details"}</SheetTitle>
            <SheetDescription>
              {active ? `${active.service} · ${active.ts} · request ${active.requestId}` : ""}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-5 px-4 pb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs tracking-wide text-muted-foreground uppercase">Severity</p>
                <div className="mt-1.5">{active && <StatusBadge status={active.severity} />}</div>
              </div>
              <div>
                <p className="text-xs tracking-wide text-muted-foreground uppercase">Status</p>
                <div className="mt-1.5">{active && <StatusBadge status={active.status} />}</div>
              </div>
              <div>
                <p className="text-xs tracking-wide text-muted-foreground uppercase">Endpoint</p>
                <p className="num mt-1 text-sm font-medium">{active?.endpoint}</p>
              </div>
            </div>
            <SectionCard title="Stack trace" bodyClassName="p-0">
              <pre className="overflow-x-auto rounded-b-xl bg-muted/50 p-4 font-mono text-xs leading-relaxed">
                {stackTrace}
              </pre>
            </SectionCard>
            <div className="flex gap-2">
              <Button size="sm">Mark as resolved</Button>
              <Button variant="outline" size="sm">
                Copy request ID
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
