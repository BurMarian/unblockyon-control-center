import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ScanLine } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog, DataTable, DataToolbar, TableFooterBar, Td, Th } from "@/components/data-table";
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
import { activations } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/activations")({
  head: () => ({
    meta: [
      { title: "QR Activations — unblockyOn Admin" },
      { name: "description", content: "Track QR activation attempts, sources and failures across the platform." },
      { property: "og:title", content: "QR Activations — unblockyOn Admin" },
      { property: "og:description", content: "Track QR activation attempts, sources and failures." },
    ],
  }),
  component: ActivationsPage,
});

function ActivationsPage() {
  const [state, setState] = useState<PageState>("success");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activations"
        description="Monitor the activation lifecycle of every QR identifier."
        actions={
          <>
            <StateSwitcher value={state} onChange={setState} />
            <Button variant="outline" size="sm">
              <Download className="size-4" aria-hidden="true" /> Export
            </Button>
          </>
        }
      />

      {state === "denied" ? (
        <div className="rounded-xl border border-border bg-card">
          <PermissionDeniedState />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Activations" value="8,412" change={14.2} icon={ScanLine} />
            <StatCard label="Today" value="402" change={12.3} tone="success" />
            <StatCard label="Pending" value="118" change={-3.1} tone="warning" />
            <StatCard label="Failed" value="27" change={-8.4} tone="error" />
          </div>

          <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            <DataToolbar placeholder="Search by QR ID or activation code…">
              <FilterSelect label="Status" options={["All statuses", "Pending", "Activated", "Failed", "Revoked"]} />
              <FilterSelect label="Source" options={["All sources", "Telegram Bot", "Web", "Admin", "QR Bridge"]} />
              <FilterSelect label="Date" options={["All time", "Today", "Last 7 days", "Last 30 days"]} />
            </DataToolbar>

            {state === "loading" && <TableSkeleton cols={7} />}
            {state === "empty" && (
              <EmptyState
                title="No activations recorded"
                description="Activations appear here as soon as drivers redeem their codes."
              />
            )}
            {state === "error" && (
              <ErrorState title="Unable to load activations" onRetry={() => setState("success")} />
            )}

            {state === "success" && (
              <>
                <DataTable>
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <Th>QR ID</Th>
                      <Th>Activation code</Th>
                      <Th>Status</Th>
                      <Th>Activated at</Th>
                      <Th>Activated by</Th>
                      <Th>Source</Th>
                      <Th align="right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activations.map((a) => (
                      <tr key={a.id} className="transition-colors hover:bg-muted/40">
                        <Td>
                          <Link to="/qr-codes/$qrId" params={{ qrId: a.qr }} className="num font-medium hover:underline">
                            {a.qr}
                          </Link>
                        </Td>
                        <Td className="num text-muted-foreground">{a.code}</Td>
                        <Td>
                          <StatusBadge status={a.status} />
                        </Td>
                        <Td className="num text-muted-foreground">{a.at}</Td>
                        <Td className="text-muted-foreground">{a.by}</Td>
                        <Td className="text-muted-foreground">{a.source}</Td>
                        <Td align="right">
                          <ConfirmDialog
                            trigger={
                              <Button variant="ghost" size="sm" className="text-destructive">
                                Revoke
                              </Button>
                            }
                            title={`Revoke activation for ${a.qr}?`}
                            description="The driver will lose access and the QR returns to an unused state."
                            confirmLabel="Revoke activation"
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
                <TableFooterBar showing={activations.length} total={8412} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
