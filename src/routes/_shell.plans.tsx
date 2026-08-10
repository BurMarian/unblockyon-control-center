import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, Td, Th } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { plans } from "@/lib/mock-data";
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/plans")({
  head: () => ({
    meta: [
      { title: "Plans & Pricing — unblockyOn Admin" },
      { name: "description", content: "Manage unblockyOn subscription plans, pricing tiers and included QR quotas." },
      { property: "og:title", content: "Plans & Pricing — unblockyOn Admin" },
      { property: "og:description", content: "Subscription plans, pricing tiers and QR quotas." },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans & Pricing"
        description="Subscription tiers available to unblockyOn customers."
        actions={
          <Button size="sm">
            <Plus className="size-4" aria-hidden="true" /> New plan
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((p) => {
          const featured = p.id === "business";
          return (
            <section
              key={p.id}
              className={cn(
                "flex flex-col rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]",
                featured ? "border-primary ring-1 ring-primary/20" : "border-border",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">{p.name}</h2>
                {featured ? (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                    Most popular
                  </span>
                ) : (
                  <StatusBadge status={p.status} />
                )}
              </div>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="num text-3xl font-semibold tracking-tight">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </p>
              <p className="num mt-1 text-sm text-muted-foreground">{p.qr}</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2 border-t border-border pt-5">
                <Button variant={featured ? "default" : "outline"} size="sm" className="flex-1">
                  Edit plan
                </Button>
                <Button variant="ghost" size="sm">
                  Archive
                </Button>
              </div>
            </section>
          );
        })}
      </div>

      <SectionCard title="Plan performance" bodyClassName="p-0">
        <DataTable>
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <Th>Plan</Th>
              <Th align="right">Subscribers</Th>
              <Th>Price</Th>
              <Th>QR quota</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {plans.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-muted/40">
                <Td className="font-medium">{p.name}</Td>
                <Td align="right" className="num">
                  {num(p.subs)}
                </Td>
                <Td className="num text-muted-foreground">
                  {p.price} {p.period}
                </Td>
                <Td className="num text-muted-foreground">{p.qr}</Td>
                <Td>
                  <StatusBadge status={p.status} />
                </Td>
                <Td align="right">
                  <Button variant="ghost" size="sm">
                    Edit
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
