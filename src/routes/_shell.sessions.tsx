import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MonitorSmartphone } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog, DataTable, DataToolbar, TableFooterBar, Td, Th } from "@/components/data-table";
import { FilterSelect } from "@/components/filter-select";
import { EmptyState, ErrorState, StateSwitcher, TableSkeleton, PermissionDeniedState, type PageState } from "@/components/states";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { sessions } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/sessions")({
  head: () => ({
    meta: [
      { title: "Sessions — unblockyOn Admin" },
      { name: "description", content: "Review and revoke active administrative sessions across devices." },
      { property: "og:title", content: "Sessions — unblockyOn Admin" },
      { property: "og:description", content: "Review and revoke active administrative sessions." },
    ],
  }),
  component: SessionsPage,
});

function SessionsPage() {
  const [state, setState] = useState<PageState>("success");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessions"
        description="Monitor active administrative sessions and revoke access instantly."
        actions={
          <>
            <StateSwitcher value={state} onChange={setState} />
            <ConfirmDialog
              trigger={
                <Button variant="destructive" size="sm">
                  Revoke all sessions
                </Button>
              }
              title="Revoke every active session?"
              description="All administrators, including you, will be signed out and must authenticate again."
              confirmLabel="Revoke all"
            />
          </>
        }
      />

      {state === "denied" ? (
        <div className="rounded-xl border border-border bg-card">
          <PermissionDeniedState />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <DataToolbar placeholder="Search by user, IP or device…">
            <FilterSelect label="Status" options={["All statuses", "Active", "Idle", "Expired"]} />
            <FilterSelect label="Device" options={["All devices", "Desktop", "Mobile", "Tablet"]} />
          </DataToolbar>

          {state === "loading" && <TableSkeleton cols={8} />}
          {state === "empty" && (
            <EmptyState title="No active sessions" description="Nobody is currently signed in to the admin console." />
          )}
          {state === "error" && <ErrorState title="Unable to load sessions" onRetry={() => setState("success")} />}

          {state === "success" && (
            <>
              <DataTable>
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <Th>User</Th>
                    <Th>Device</Th>
                    <Th>Browser</Th>
                    <Th>Location</Th>
                    <Th>IP</Th>
                    <Th>Last active</Th>
                    <Th>Created</Th>
                    <Th>Status</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/40">
                      <Td className="font-medium">{s.user}</Td>
                      <Td>{s.device}</Td>
                      <Td className="text-muted-foreground">{s.browser}</Td>
                      <Td className="text-muted-foreground">{s.location}</Td>
                      <Td className="num text-muted-foreground">{s.ip}</Td>
                      <Td className="text-muted-foreground">{s.lastActive}</Td>
                      <Td className="num text-muted-foreground">{s.created}</Td>
                      <Td>
                        <StatusBadge status={s.status} />
                      </Td>
                      <Td align="right">
                        <div className="flex justify-end gap-1">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-md">
                              <SheetHeader>
                                <SheetTitle>Session {s.id}</SheetTitle>
                                <SheetDescription>{s.user}</SheetDescription>
                              </SheetHeader>
                              <div className="space-y-4 px-4 pb-6">
                                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                                  <MonitorSmartphone className="size-5 text-muted-foreground" aria-hidden="true" />
                                  <div>
                                    <p className="text-sm font-medium">{s.device}</p>
                                    <p className="text-xs text-muted-foreground">{s.browser}</p>
                                  </div>
                                  <span className="ml-auto">
                                    <StatusBadge status={s.status} />
                                  </span>
                                </div>
                                <dl className="grid grid-cols-2 gap-4 text-sm">
                                  {[
                                    ["IP address", s.ip],
                                    ["Location", s.location],
                                    ["Created", s.created],
                                    ["Last active", s.lastActive],
                                  ].map(([k, v]) => (
                                    <div key={k}>
                                      <dt className="text-xs tracking-wide text-muted-foreground uppercase">{k}</dt>
                                      <dd className="num mt-1 font-medium">{v}</dd>
                                    </div>
                                  ))}
                                </dl>
                              </div>
                            </SheetContent>
                          </Sheet>
                          <ConfirmDialog
                            trigger={
                              <Button variant="ghost" size="sm" className="text-destructive">
                                Revoke
                              </Button>
                            }
                            title="Revoke this session?"
                            description={`${s.user} will be signed out of ${s.device} immediately.`}
                            confirmLabel="Revoke session"
                          />
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
              <TableFooterBar showing={sessions.length} total={42} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
