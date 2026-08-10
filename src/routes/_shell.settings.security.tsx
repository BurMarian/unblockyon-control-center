import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Plus, Save } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { DataTable, ConfirmDialog, Td, Th } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_shell/settings/security")({
  head: () => ({
    meta: [
      { title: "Security Settings — unblockyOn Admin" },
      { name: "description", content: "Password policy, two-factor enforcement, session limits and API keys." },
      { property: "og:title", content: "Security Settings — unblockyOn Admin" },
      { property: "og:description", content: "Password policy, 2FA, sessions and API keys." },
    ],
  }),
  component: SecuritySettingsPage,
});

const apiKeys = [
  { name: "Production API", prefix: "ubo_live_9f2c…a41", created: "2026-03-14", lastUsed: "2 minutes ago", status: "Active" },
  { name: "QR Bridge worker", prefix: "ubo_live_31bd…7c0", created: "2026-05-02", lastUsed: "18 minutes ago", status: "Active" },
  { name: "Staging sandbox", prefix: "ubo_test_08aa…19f", created: "2026-01-22", lastUsed: "3 days ago", status: "Revoked" },
];

function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security"
        description="Authentication policy and API access for this workspace."
        actions={
          <Button size="sm">
            <Save className="size-4" aria-hidden="true" /> Save changes
          </Button>
        }
      />

      <SectionCard title="Authentication" bodyClassName="divide-y divide-border p-0">
        <Row id="2fa" label="Require two-factor authentication" description="All admins must enrol in 2FA to sign in." defaultChecked />
        <Row id="sso" label="Single sign-on (SAML)" description="Allow admins to sign in through your identity provider." />
        <Row id="ip" label="IP allow-list" description="Restrict admin access to approved IP ranges." />
      </SectionCard>

      <SectionCard title="Password policy" bodyClassName="grid gap-5 p-5 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="min-len">Minimum length</Label>
          <Input id="min-len" type="number" defaultValue={12} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expiry">Password expiry (days)</Label>
          <Input id="expiry" type="number" defaultValue={90} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ttl">Session timeout (minutes)</Label>
          <Input id="ttl" type="number" defaultValue={60} />
        </div>
      </SectionCard>

      <SectionCard
        title="API keys"
        description="Keys used by services integrating with the unblockyOn API."
        actions={
          <Button size="sm" variant="outline">
            <Plus className="size-4" aria-hidden="true" /> Create key
          </Button>
        }
        bodyClassName="p-0"
      >
        <DataTable>
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <Th>Name</Th>
              <Th>Key</Th>
              <Th>Created</Th>
              <Th>Last used</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {apiKeys.map((k) => (
              <tr key={k.prefix} className="transition-colors hover:bg-muted/40">
                <Td className="font-medium">
                  <span className="flex items-center gap-2">
                    <KeyRound className="size-4 text-muted-foreground" aria-hidden="true" />
                    {k.name}
                  </span>
                </Td>
                <Td className="num text-muted-foreground">{k.prefix}</Td>
                <Td className="num text-muted-foreground">{k.created}</Td>
                <Td className="text-muted-foreground">{k.lastUsed}</Td>
                <Td>
                  <StatusBadge status={k.status} />
                </Td>
                <Td align="right">
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="sm" className="text-destructive" disabled={k.status === "Revoked"}>
                        Revoke
                      </Button>
                    }
                    title={`Revoke ${k.name}?`}
                    description="Any service using this key will immediately lose API access."
                    confirmLabel="Revoke key"
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </SectionCard>
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
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  );
}
