import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Download } from "lucide-react";

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
import { transactions } from "@/lib/mock-data";
import { euro } from "@/lib/format";

export const Route = createFileRoute("/_shell/payments")({
  head: () => ({
    meta: [
      { title: "Payments — unblockyOn Admin" },
      { name: "description", content: "Review unblockyOn transactions, payment methods, refunds and failed charges." },
      { property: "og:title", content: "Payments — unblockyOn Admin" },
      { property: "og:description", content: "Transactions, refunds and failed charges." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const [state, setState] = useState<PageState>("success");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Every transaction processed through unblockyOn billing."
        actions={
          <>
            <StateSwitcher value={state} onChange={setState} />
            <Button variant="outline" size="sm">
              <Download className="size-4" aria-hidden="true" /> Export CSV
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
            <StatCard label="Revenue (MTD)" value="€23,880" change={11.4} icon={CreditCard} />
            <StatCard label="Successful" value="566" change={9.1} tone="success" />
            <StatCard label="Pending" value="24" change={2.8} tone="warning" />
            <StatCard label="Failed" value="17" change={-4.6} tone="error" />
          </div>

          <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            <DataToolbar placeholder="Search by transaction ID or customer…">
              <FilterSelect label="Status" options={["All statuses", "Paid", "Pending", "Failed", "Refunded"]} />
              <FilterSelect label="Plan" options={["All plans", "Starter", "Business", "Enterprise"]} />
              <FilterSelect label="Date" options={["Last 30 days", "Last 7 days", "This quarter", "All time"]} />
            </DataToolbar>

            {state === "loading" && <TableSkeleton cols={7} />}
            {state === "empty" && (
              <EmptyState title="No transactions" description="Payments appear here as soon as customers are billed." />
            )}
            {state === "error" && <ErrorState title="Unable to load payments" onRetry={() => setState("success")} />}

            {state === "success" && (
              <>
                <DataTable>
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <Th>Transaction</Th>
                      <Th>Customer</Th>
                      <Th>Plan</Th>
                      <Th align="right">Amount</Th>
                      <Th>Method</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                      <Th align="right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((t) => (
                      <tr key={t.id} className="transition-colors hover:bg-muted/40">
                        <Td className="num font-medium">{t.id}</Td>
                        <Td className="text-muted-foreground">{t.user}</Td>
                        <Td className="text-muted-foreground">{t.plan}</Td>
                        <Td align="right" className="num font-medium">
                          {euro(t.amount)}
                        </Td>
                        <Td className="text-muted-foreground">{t.method}</Td>
                        <Td>
                          <StatusBadge status={t.status} />
                        </Td>
                        <Td className="num text-muted-foreground">{t.created}</Td>
                        <Td align="right">
                          <ConfirmDialog
                            trigger={
                              <Button variant="ghost" size="sm" disabled={t.status !== "Paid"}>
                                Refund
                              </Button>
                            }
                            title={`Refund ${euro(t.amount)}?`}
                            description={`This refunds ${t.user}'s payment for the ${t.plan} plan. The action cannot be undone.`}
                            confirmLabel="Refund payment"
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
                <TableFooterBar showing={transactions.length} total={566} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
