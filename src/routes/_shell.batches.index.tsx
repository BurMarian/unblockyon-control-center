import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Layers, Plus } from "lucide-react";

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
import { batches } from "@/lib/mock-data";
import { num } from "@/lib/format";

export const Route = createFileRoute("/_shell/batches/")({
  head: () => ({
    meta: [
      { title: "QR Batches — unblockyOn Admin" },
      { name: "description", content: "Track QR production batches, activation rates and distribution status." },
      { property: "og:title", content: "QR Batches — unblockyOn Admin" },
      { property: "og:description", content: "Track QR production batches and activation rates." },
    ],
  }),
  component: BatchesPage,
});

function BatchesPage() {
  const [state, setState] = useState<PageState>("success");

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Batches"
        description="Production batches and their distribution status."
        actions={
          <>
            <StateSwitcher value={state} onChange={setState} />
            <Button variant="outline" size="sm">
              <Download className="size-4" aria-hidden="true" /> Export
            </Button>
            <Button size="sm" asChild>
              <Link to="/generate-qr">
                <Plus className="size-4" aria-hidden="true" /> New batch
              </Link>
            </Button>
          </>
        }
      />

      {state === "denied" ? (
        <div className="rounded-xl border border-border bg-card">
          <PermissionDeniedState />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <DataToolbar placeholder="Search batches…">
            <FilterSelect label="Status" options={["All statuses", "Active", "Archived", "Disabled"]} />
            <FilterSelect label="Created" options={["All time", "Last 30 days", "This quarter"]} />
          </DataToolbar>

          {state === "loading" && <TableSkeleton cols={7} />}
          {state === "empty" && (
            <EmptyState
              title="No batches yet"
              description="Generate your first QR batch to get started."
              action={
                <Button size="sm" asChild>
                  <Link to="/generate-qr">
                    <Layers className="size-4" aria-hidden="true" /> Generate QR
                  </Link>
                </Button>
              }
            />
          )}
          {state === "error" && <ErrorState title="Unable to load batches" onRetry={() => setState("success")} />}

          {state === "success" && (
            <>
              <DataTable>
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <Th>Batch</Th>
                    <Th align="right">Quantity</Th>
                    <Th align="right">Active</Th>
                    <Th align="right">Unused</Th>
                    <Th align="right">Disabled</Th>
                    <Th>Activation rate</Th>
                    <Th>Created</Th>
                    <Th>Status</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {batches.map((b) => {
                    const rate = Math.round((b.active / b.quantity) * 100);
                    return (
                      <tr key={b.id} className="transition-colors hover:bg-muted/40">
                        <Td>
                          <Link to="/batches/$batchId" params={{ batchId: b.id }} className="num font-medium hover:underline">
                            {b.id}
                          </Link>
                        </Td>
                        <Td align="right" className="num">
                          {num(b.quantity)}
                        </Td>
                        <Td align="right" className="num text-muted-foreground">
                          {num(b.active)}
                        </Td>
                        <Td align="right" className="num text-muted-foreground">
                          {num(b.unused)}
                        </Td>
                        <Td align="right" className="num text-muted-foreground">
                          {num(b.disabled)}
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${rate}%` }} />
                            </div>
                            <span className="num text-xs text-muted-foreground">{rate}%</span>
                          </div>
                        </Td>
                        <Td className="num text-muted-foreground">{b.created}</Td>
                        <Td>
                          <StatusBadge status={b.status} />
                        </Td>
                        <Td align="right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to="/batches/$batchId" params={{ batchId: b.id }}>
                              View
                            </Link>
                          </Button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </DataTable>
              <TableFooterBar showing={batches.length} total={batches.length} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
