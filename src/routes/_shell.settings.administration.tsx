import { createFileRoute, Link } from "@tanstack/react-router";
import { Save, TriangleAlert } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { ConfirmDialog, DataTable, Td, Th } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { users } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/settings/administration")({
  head: () => ({
    meta: [
      { title: "Administration Settings — unblockyOn Admin" },
      { name: "description", content: "Admin seats, data retention, maintenance windows and destructive workspace actions." },
      { property: "og:title", content: "Administration Settings — unblockyOn Admin" },
      { property: "og:description", content: "Admin seats, retention and workspace actions." },
    ],
  }),
  component: AdministrationSettingsPage,
});

function AdministrationSettingsPage() {
  const admins = users.filter((u) => u.role === "Superadmin" || u.role === "Admin").slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Platform-level controls for this workspace."
        actions={
          <Button size="sm">
            <Save className="size-4" aria-hidden="true" /> Save changes
          </Button>
        }
      />

      <SectionCard title="Admin seats" description="Users with elevated platform access." bodyClassName="p-0">
        <DataTable>
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-muted/40">
                <Td className="font-medium">{u.name}</Td>
                <Td className="text-muted-foreground">{u.email}</Td>
                <Td className="text-muted-foreground">{u.role}</Td>
                <Td>
                  <StatusBadge status={u.status} />
                </Td>
                <Td align="right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/users/$userId" params={{ userId: u.id }}>
                      Manage
                    </Link>
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </SectionCard>

      <SectionCard title="Data retention" bodyClassName="grid gap-5 p-5 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="logs">Activity logs (days)</Label>
          <Input id="logs" type="number" defaultValue={365} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="errors">Error logs (days)</Label>
          <Input id="errors" type="number" defaultValue={90} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notif">Notification history (days)</Label>
          <Input id="notif" type="number" defaultValue={180} />
        </div>
      </SectionCard>

      <SectionCard title="Automation" bodyClassName="divide-y divide-border p-0">
        <Row id="auto-disable" label="Auto-disable unused QR codes" description="Disable identifiers unused for 24 months." defaultChecked />
        <Row id="auto-archive" label="Auto-archive batches" description="Archive batches once fully activated." />
        <Row id="maint-window" label="Scheduled maintenance window" description="Sundays 02:00–04:00 Europe/Zagreb." defaultChecked />
      </SectionCard>

      <section className="rounded-xl border border-destructive/40 bg-card shadow-[var(--shadow-card)]">
        <header className="flex items-center gap-2 border-b border-destructive/30 px-5 py-4">
          <TriangleAlert className="size-4 text-destructive" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
        </header>
        <div className="divide-y divide-border">
          <DangerRow
            title="Purge activity logs"
            description="Permanently delete all audit records older than the retention window."
            action="Purge logs"
          />
          <DangerRow
            title="Disable all QR codes"
            description="Immediately stop every identifier across all batches from resolving."
            action="Disable all"
          />
          <DangerRow
            title="Reset workspace"
            description="Remove all users, QR codes, batches and billing history. This cannot be undone."
            action="Reset workspace"
          />
        </div>
      </section>
    </div>
  );
}

function DangerRow({ title, description, action }: { title: string; description: string; action: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <ConfirmDialog
        trigger={
          <Button variant="destructive" size="sm">
            {action}
          </Button>
        }
        title={`${action}?`}
        description={description}
        confirmLabel={action}
      />
    </div>
  );
}

function Row({
  id,
  label,
  description,
  defaultChecked,
}: {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} defaultChecked={defaultChecked ?? false} />
    </div>
  );
}
