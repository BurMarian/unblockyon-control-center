import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Plus, QrCode } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, DataToolbar, TableFooterBar, Td, Th } from "@/components/data-table";
import { FilterSelect } from "@/components/filter-select";
import {
  CardsSkeleton,
  EmptyState,
  ErrorState,
  PermissionDeniedState,
  StateSwitcher,
  TableSkeleton,
  type PageState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { qrCodes } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/qr-codes/")({
  head: () => ({
    meta: [
      { title: "QR Codes — unblockyOn Admin" },
      { name: "description", content: "Browse, filter and manage every unblockyOn QR identifier." },
      { property: "og:title", content: "QR Codes — unblockyOn Admin" },
      { property: "og:description", content: "Manage all unblockyOn QR identifiers." },
    ],
  }),
  component: QrCodesPage,
});

function QrCodesPage() {
  const [state, setState] = useState<PageState>("success");

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Codes"
        description="Manage all unblockyOn QR identifiers."
        actions={
          <>
            <StateSwitcher value={state} onChange={setState} />
            <Button variant="outline" size="sm">
              <Download className="size-4" aria-hidden="true" /> Export
            </Button>
            <Button size="sm" asChild>
              <Link to="/generate-qr">
                <Plus className="size-4" aria-hidden="true" /> Generate QR
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
        <>
          {state === "loading" ? (
            <CardsSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total QR Codes" value="11,050" change={8.2} icon={QrCode} />
              <StatCard label="Active" value="7,528" change={6.1} tone="success" />
              <StatCard label="Unused" value="2,972" change={-4.4} />
              <StatCard label="Disabled" value="550" change={1.2} tone="warning" />
            </div>
          )}

          <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            <DataToolbar placeholder="Search by QR ID or batch…">
              <FilterSelect label="Status" options={["All statuses", "Unused", "Active", "Disabled", "Expired"]} />
              <FilterSelect
                label="Batch"
                options={["All batches", "BATCH-2608-B", "BATCH-2608-A", "BATCH-2607-C", "BATCH-2605-A"]}
              />
              <FilterSelect label="Created" options={["All time", "Last 7 days", "Last 30 days"]} />
            </DataToolbar>

            {state === "loading" && <TableSkeleton cols={7} />}
            {state === "empty" && (
              <EmptyState
                title="No QR codes yet"
                description="Generate your first QR batch to start distributing unblockyOn identifiers."
                action={
                  <Button size="sm" asChild>
                    <Link to="/generate-qr">Generate QR</Link>
                  </Button>
                }
              />
            )}
            {state === "error" && (
              <ErrorState
                title="Unable to load QR codes"
                description="Something went wrong while loading this data."
                onRetry={() => setState("success")}
              />
            )}

            {state === "success" && (
              <>
                <DataTable>
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <Th>QR ID</Th>
                      <Th>Batch</Th>
                      <Th>Status</Th>
                      <Th>Activation</Th>
                      <Th>Created</Th>
                      <Th>Last activity</Th>
                      <Th align="right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {qrCodes.map((q) => (
                      <tr key={q.id} className="transition-colors hover:bg-muted/40">
                        <Td>
                          <Link
                            to="/qr-codes/$qrId"
                            params={{ qrId: q.id }}
                            className="num font-medium hover:underline"
                          >
                            {q.id}
                          </Link>
                        </Td>
                        <Td>
                          <Link to="/batches/$batchId" params={{ batchId: q.batch }} className="num text-muted-foreground hover:underline">
                            {q.batch}
                          </Link>
                        </Td>
                        <Td>
                          <StatusBadge status={q.status} />
                        </Td>
                        <Td className="text-muted-foreground">{q.activation}</Td>
                        <Td className="num text-muted-foreground">{q.created}</Td>
                        <Td className="num text-muted-foreground">{q.lastActivity}</Td>
                        <Td align="right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to="/qr-codes/$qrId" params={{ qrId: q.id }}>
                              View
                            </Link>
                          </Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
                <TableFooterBar showing={qrCodes.length} total={11050} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
