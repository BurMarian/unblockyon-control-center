import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog, DataTable, Td, Th } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { batches, qrCodes } from "@/lib/mock-data";
import { num } from "@/lib/format";

export const Route = createFileRoute("/_shell/batches/$batchId")({
  loader: ({ params }) => {
    const batch = batches.find((b) => b.id === params.batchId);
    if (!batch) throw notFound();
    return { batch };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.batch.id} — unblockyOn Admin` : "Batch — unblockyOn Admin" },
      { name: "description", content: "QR batch statistics, activation progress and included identifiers." },
      { property: "og:title", content: "QR batch detail — unblockyOn Admin" },
      { property: "og:description", content: "Batch statistics, activation progress and identifiers." },
    ],
  }),
  component: BatchDetailPage,
});

function BatchDetailPage() {
  const { batch } = Route.useLoaderData();
  const rate = Math.round((batch.active / batch.quantity) * 100);
  const items = qrCodes.filter((q) => q.batch === batch.id);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/batches">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to batches
        </Link>
      </Button>

      <PageHeader
        title={batch.id}
        description={`Created ${batch.created} · ${num(batch.quantity)} identifiers`}
        actions={
          <>
            <StatusBadge status={batch.status} />
            <Button variant="outline" size="sm">
              <Download className="size-4" aria-hidden="true" /> Download batch
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="destructive" size="sm">
                  Disable batch
                </Button>
              }
              title={`Disable ${batch.id}?`}
              description="All QR codes in this batch stop working until the batch is re-enabled."
              confirmLabel="Disable batch"
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total QR codes" value={num(batch.quantity)} />
        <StatCard label="Active" value={num(batch.active)} tone="success" />
        <StatCard label="Unused" value={num(batch.unused)} tone="warning" />
        <StatCard label="Disabled" value={num(batch.disabled)} tone="error" />
      </div>

      <SectionCard title="Activation progress" bodyClassName="p-5">
        <div className="flex items-end justify-between gap-3">
          <p className="num text-3xl font-semibold tracking-tight">{rate}%</p>
          <p className="num text-sm text-muted-foreground">
            {num(batch.active)} of {num(batch.quantity)} activated
          </p>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${rate}%` }} />
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs tracking-wide text-muted-foreground uppercase">Format</dt>
            <dd className="mt-1 text-sm font-medium">PNG · 1024 × 1024</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-muted-foreground uppercase">Created by</dt>
            <dd className="mt-1 text-sm font-medium">Alex Morgan</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-muted-foreground uppercase">Activation codes</dt>
            <dd className="num mt-1 text-sm font-medium">{num(batch.quantity)} issued</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard
        title="QR codes in batch"
        description="A sample of identifiers belonging to this batch."
        bodyClassName="p-0"
      >
        {items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No sample identifiers available for this batch.
          </p>
        ) : (
          <DataTable>
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <Th>QR ID</Th>
                <Th>Status</Th>
                <Th>Activation</Th>
                <Th>Created</Th>
                <Th>Last activity</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((q) => (
                <tr key={q.id} className="transition-colors hover:bg-muted/40">
                  <Td>
                    <Link to="/qr-codes/$qrId" params={{ qrId: q.id }} className="num font-medium hover:underline">
                      {q.id}
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
        )}
      </SectionCard>
    </div>
  );
}
