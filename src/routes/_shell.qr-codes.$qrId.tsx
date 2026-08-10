import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download, QrCode } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { qrCodes } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/qr-codes/$qrId")({
  loader: ({ params }) => {
    const qr = qrCodes.find((q) => q.id === params.qrId);
    if (!qr) throw notFound();
    return { qr };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.qr.id} — unblockyOn Admin` : "QR code — unblockyOn Admin" },
      { name: "description", content: "QR identifier details, activation status and lifecycle timeline." },
      { property: "og:title", content: "QR code detail — unblockyOn Admin" },
      { property: "og:description", content: "Identifier details, activation status and lifecycle timeline." },
    ],
  }),
  component: QrDetailPage,
});

const timeline = [
  { label: "Created", detail: "Queued in production batch", time: "2026-08-02 08:14" },
  { label: "Generated", detail: "Rendered by QR Bridge worker", time: "2026-08-02 08:16" },
  { label: "Activated", detail: "Activation code A7K-42PQ redeemed", time: "2026-08-03 09:14" },
  { label: "Used", detail: "Driver contacted via Telegram", time: "2026-08-08 18:22" },
  { label: "Updated", detail: "Vehicle plate re-linked", time: "2026-08-10 17:04" },
];

function QrDetailPage() {
  const { qr } = Route.useLoaderData();
  const disabled = qr.status === "Disabled";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/qr-codes">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to QR codes
        </Link>
      </Button>

      <PageHeader
        title={qr.id}
        description={`Batch ${qr.batch} · created ${qr.created}`}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/batches/$batchId" params={{ batchId: qr.batch }}>
                View batch
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-4" aria-hidden="true" /> Download
            </Button>
            {disabled ? (
              <Button size="sm">Enable</Button>
            ) : (
              <ConfirmDialog
                trigger={
                  <Button variant="destructive" size="sm">
                    Disable
                  </Button>
                }
                title={`Disable ${qr.id}?`}
                description="Scanning this QR will stop working immediately. The identifier can be re-enabled later."
                confirmLabel="Disable QR"
              />
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="QR preview" bodyClassName="p-5">
          <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-border-strong bg-muted/40">
            <div className="text-center">
              <QrCode className="mx-auto size-24 text-foreground/80" aria-hidden="true" />
              <p className="num mt-3 text-xs text-muted-foreground">{qr.id}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Preview rendered at 1024×1024 · PNG with embedded logo
          </p>
        </SectionCard>

        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Information" bodyClassName="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="QR ID" value={qr.id} />
            <Field label="Batch" value={qr.batch} />
            <Field label="Status" node={<StatusBadge status={qr.status} />} />
            <Field label="Created" value={qr.created} />
            <Field label="Activated" value={qr.activation === "Activated" ? "2026-08-03 09:14" : "—"} />
            <Field label="Activation code" value={qr.activation} />
          </SectionCard>

          <SectionCard title="Activity" description="Lifecycle events for this identifier." bodyClassName="p-5">
            <ol className="relative space-y-5 border-l border-border pl-5">
              {timeline.map((t) => (
                <li key={t.label} className="relative">
                  <span
                    className="absolute top-1.5 -left-[25px] size-2 rounded-full bg-primary ring-4 ring-card"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.detail}</p>
                  <p className="num mt-0.5 text-xs text-muted-foreground">{t.time}</p>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, node }: { label: string; value?: string; node?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      {node ? <div className="mt-1.5">{node}</div> : <p className="num mt-1 text-sm font-medium">{value}</p>}
    </div>
  );
}
