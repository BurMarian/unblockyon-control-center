import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, Td, Th } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/services")({
  head: () => ({
    meta: [
      { title: "Services — unblockyOn Admin" },
      { name: "description", content: "Status, versions and latency for every unblockyOn microservice." },
      { property: "og:title", content: "Services — unblockyOn Admin" },
      { property: "og:description", content: "Status, versions and latency per microservice." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Individual service health across the platform."
        actions={
          <Button variant="outline" size="sm">
            <RefreshCw className="size-4" aria-hidden="true" /> Run health check
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => (
          <section key={s.name} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">{s.name}</h2>
              <StatusBadge status={s.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Uptime</dt>
                <dd className="num font-medium">{s.uptime}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Latency</dt>
                <dd className="num font-medium">{s.latency}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Version</dt>
                <dd className="num font-medium">{s.version}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Incidents (30d)</dt>
                <dd className="num font-medium">{s.incidents}</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              Last checked {s.checked}
            </p>
          </section>
        ))}
      </div>

      <SectionCard title="All services" bodyClassName="p-0">
        <DataTable>
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <Th>Service</Th>
              <Th>Status</Th>
              <Th>Uptime</Th>
              <Th>Latency</Th>
              <Th>Version</Th>
              <Th align="right">Incidents</Th>
              <Th>Last check</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {services.map((s) => (
              <tr key={s.name} className="transition-colors hover:bg-muted/40">
                <Td className="font-medium">{s.name}</Td>
                <Td>
                  <StatusBadge status={s.status} />
                </Td>
                <Td className="num text-muted-foreground">{s.uptime}</Td>
                <Td className="num text-muted-foreground">{s.latency}</Td>
                <Td className="num text-muted-foreground">{s.version}</Td>
                <Td align="right" className="num text-muted-foreground">
                  {s.incidents}
                </Td>
                <Td className="text-muted-foreground">{s.checked}</Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </SectionCard>
    </div>
  );
}
