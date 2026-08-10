import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, DataToolbar, Td, Th } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { roles } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/roles/")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions — unblockyOn Admin" },
      { name: "description", content: "Define administrative roles and fine-grained permissions." },
      { property: "og:title", content: "Roles & Permissions — unblockyOn Admin" },
      { property: "og:description", content: "Manage administrative access and permissions." },
    ],
  }),
  component: RolesPage,
});

function RolesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage administrative access and permissions."
        actions={
          <Button size="sm">
            <Plus className="size-4" aria-hidden="true" /> New role
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {roles.map((r) => (
          <Link
            key={r.id}
            to="/roles/$roleId"
            params={{ roleId: r.id }}
            className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-border-strong"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-8 items-center justify-center rounded-lg bg-secondary">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-3 font-semibold">{r.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
            <p className="num mt-3 text-xs text-muted-foreground">
              {r.usersCount} users · {r.permissionsCount} permissions
            </p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <DataToolbar placeholder="Search roles…" />
        <DataTable>
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <Th>Role</Th>
              <Th>Description</Th>
              <Th align="right">Users</Th>
              <Th align="right">Permissions</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {roles.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-muted/40">
                <Td className="font-medium">{r.name}</Td>
                <Td className="max-w-md truncate whitespace-normal text-muted-foreground">
                  {r.description}
                </Td>
                <Td align="right" className="num">
                  {r.usersCount}
                </Td>
                <Td align="right" className="num">
                  {r.permissionsCount}
                </Td>
                <Td>
                  <StatusBadge status={r.status} />
                </Td>
                <Td align="right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/roles/$roleId" params={{ roleId: r.id }}>
                      Manage
                    </Link>
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </div>
  );
}
