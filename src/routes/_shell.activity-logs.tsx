import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, DataToolbar, TableFooterBar, Td, Th } from "@/components/data-table";
import { FilterSelect } from "@/components/filter-select";
import {
  EmptyState,
  ErrorState,
  PermissionDeniedState,
  StateSwitcher,
  TableSkeleton,
  type PageState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { auditLogs } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/activity-logs")({
  head: () => ({
    meta: [
      { title: "Activity Logs — unblockyOn Admin" },
      { name: "description", content: "Full audit trail of admin actions across the unblockyOn platform." },
      { property: "og:title", content: "Activity Logs — unblockyOn Admin" },
      { property: "og:description", content: "Audit trail of admin actions." },
    ],
  }),
  component: ActivityLogsPage,
});

function ActivityLogsPage() {
  const [state, setState] = useState<PageState>("success");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs"
        description="Immutable audit trail of every administrative action."
        actions={
          <>
            <StateSwitcher value={state} onChange={setState} />
            <Button variant="outline" size="sm">
              <Download className="size-4" aria-hidden="true" /> Export
            </Button>
          </>
        }
      />

      <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        {state === "denied" ? (
          <PermissionDeniedState />
        ) : (
          <>
            <DataToolbar placeholder="Search actions, users or resources…">
              <FilterSelect label="Action" options={["All actions", "QR batch generated", "User updated", "Payment refunded", "Role changed"]} />
              <FilterSelect label="Resource" options={["All resources", "User", "Role", "QR Code", "Batch", "Transaction", "Settings"]} />
              <FilterSelect label="Date" options={["Last 7 days", "Today", "Last 30 days", "All time"]} />
            </DataToolbar>

            {state === "loading" && <TableSkeleton cols={6} />}
            {state === "empty" && (
              <EmptyState title="No activity recorded" description="Admin actions will be logged here automatically." />
            )}
            {state === "error" && <ErrorState title="Unable to load activity logs" onRetry={() => setState("success")} />}

            {state === "success" && (
              <>
                <DataTable>
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <Th>Timestamp</Th>
                      <Th>User</Th>
                      <Th>Action</Th>
                      <Th>Resource</Th>
                      <Th>Resource ID</Th>
                      <Th>IP address</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditLogs.map((l) => (
                      <tr key={`${l.ts}-${l.resourceId}`} className="transition-colors hover:bg-muted/40">
                        <Td className="num text-muted-foreground">{l.ts}</Td>
                        <Td className="font-medium">{l.user}</Td>
                        <Td>{l.action}</Td>
                        <Td className="text-muted-foreground">{l.resource}</Td>
                        <Td className="num text-muted-foreground">{l.resourceId}</Td>
                        <Td className="num text-muted-foreground">{l.ip}</Td>
                        <Td>
                          <StatusBadge status={l.status} />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
                <TableFooterBar showing={auditLogs.length} total={2841} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
