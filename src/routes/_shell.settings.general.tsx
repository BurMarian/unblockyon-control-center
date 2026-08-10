import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FilterSelect } from "@/components/filter-select";

export const Route = createFileRoute("/_shell/settings/general")({
  head: () => ({
    meta: [
      { title: "General Settings — unblockyOn Admin" },
      { name: "description", content: "Workspace name, branding, locale and regional defaults for unblockyOn." },
      { property: "og:title", content: "General Settings — unblockyOn Admin" },
      { property: "og:description", content: "Workspace, branding and regional defaults." },
    ],
  }),
  component: GeneralSettingsPage,
});

function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="General"
        description="Workspace identity and regional defaults."
        actions={
          <Button size="sm">
            <Save className="size-4" aria-hidden="true" /> Save changes
          </Button>
        }
      />

      <SectionCard title="Workspace" bodyClassName="grid gap-5 p-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="org">Organisation name</Label>
          <Input id="org" defaultValue="unblockyOn" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="support">Support email</Label>
          <Input id="support" type="email" defaultValue="support@unblockyon.com" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" rows={3} defaultValue="QR-based vehicle unblocking platform for parking operators and drivers." />
        </div>
      </SectionCard>

      <SectionCard title="Localisation" bodyClassName="flex flex-wrap gap-5 p-5">
        <SettingField label="Default language" options={["English", "Hrvatski", "Deutsch", "Slovenščina"]} />
        <SettingField label="Timezone" options={["Europe/Zagreb", "Europe/Berlin", "UTC"]} />
        <SettingField label="Date format" options={["YYYY-MM-DD", "DD.MM.YYYY", "MM/DD/YYYY"]} />
        <SettingField label="Currency" options={["EUR (€)", "USD ($)", "GBP (£)"]} />
      </SectionCard>

      <SectionCard title="Preferences" bodyClassName="divide-y divide-border p-0">
        <Row
          id="maintenance"
          label="Maintenance mode"
          description="Show a maintenance page to all non-admin users."
        />
        <Row id="digest" label="Weekly digest" description="Email admins a weekly platform summary." defaultChecked />
        <Row id="beta" label="Beta features" description="Enable experimental admin features in this workspace." />
      </SectionCard>
    </div>
  );
}

function SettingField({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <FilterSelect label={label} options={options} className="h-9 w-[220px]" />
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
