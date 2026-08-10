import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Send } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
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
import { notifications } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — unblockyOn Admin" },
      { name: "description", content: "Review every notification sent to drivers and admins across Telegram, email and push." },
      { property: "og:title", content: "Notifications — unblockyOn Admin" },
      { property: "og:description", content: "Delivery log for Telegram, email and push notifications." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const [state, setState] = useState<PageState>("success");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Delivery log across every notification channel."
        actions={
          <>
            <StateSwitcher value={state} onChange={setState} />
            <Button size="sm">
              <Send className="size-4" aria-hidden="true" /> Send notification
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
            <StatCard label="Sent Today" value="1,204" change={22.4} icon={Bell} />
            <StatCard label="Delivered" value="1,161" change={21.8} tone="success" />
            <StatCard label="Pending" value="18" change={4.5} tone="warning" />
            <StatCard label="Failed" value="25" change={-9.7} tone="error" />
          </div>

          <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            <DataToolbar placeholder="Search notifications…">
              <FilterSelect label="Channel" options={["All channels", "Telegram", "Email", "Push"]} />
              <FilterSelect label="Type" options={["All types", "Driver blocked", "QR activated", "Welcome", "Payment successful"]} />
              <FilterSelect label="Status" options={["All statuses", "Sent", "Pending", "Failed"]} />
            </DataToolbar>

            {state === "loading" && <TableSkeleton cols={6} />}
            {state === "empty" && (
              <EmptyState
                title="No notifications sent"
                description="Notifications appear here once the platform starts delivering messages."
              />
            )}
            {state === "error" && (
              <ErrorState title="Unable to load notifications" onRetry={() => setState("success")} />
            )}

            {state === "success" && (
              <>
                <DataTable>
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <Th>Type</Th>
                      <Th>Recipient</Th>
                      <Th>Channel</Th>
                      <Th>Message</Th>
                      <Th>Status</Th>
                      <Th>Sent at</Th>
                      <Th align="right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {notifications.map((n) => (
                      <tr key={n.id} className="transition-colors hover:bg-muted/40">
                        <Td className="font-medium">{n.type}</Td>
                        <Td className="text-muted-foreground">{n.recipient}</Td>
                        <Td className="text-muted-foreground">{n.channel}</Td>
                        <Td className="max-w-sm truncate text-muted-foreground">{n.message}</Td>
                        <Td>
                          <StatusBadge status={n.status} />
                        </Td>
                        <Td className="num text-muted-foreground">{n.sentAt}</Td>
                        <Td align="right">
                          <Button variant="ghost" size="sm">
                            Resend
                          </Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
                <TableFooterBar showing={notifications.length} total={1204} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
