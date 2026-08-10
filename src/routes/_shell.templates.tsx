import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Save } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { templates } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/templates")({
  head: () => ({
    meta: [
      { title: "Message Templates — unblockyOn Admin" },
      { name: "description", content: "Edit the Telegram and email templates unblockyOn sends to drivers and admins." },
      { property: "og:title", content: "Message Templates — unblockyOn Admin" },
      { property: "og:description", content: "Edit Telegram and email notification templates." },
    ],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const [activeId, setActiveId] = useState(templates[0]!.id);
  const active = templates.find((t) => t.id === activeId)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Reusable message templates for every notification type."
        actions={
          <Button size="sm">
            <Plus className="size-4" aria-hidden="true" /> New template
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <SectionCard title="Templates" bodyClassName="p-2">
          <nav aria-label="Templates">
            <ul className="space-y-1">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    aria-current={t.id === activeId ? "true" : undefined}
                    className={cn(
                      "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                      t.id === activeId ? "bg-secondary" : "hover:bg-muted",
                    )}
                  >
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {t.channel} · updated {t.updated}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            key={active.id}
            title={active.name}
            description={`${active.channel} template · last updated ${active.updated}`}
            actions={
              <Button size="sm">
                <Save className="size-4" aria-hidden="true" /> Save changes
              </Button>
            }
            bodyClassName="space-y-5 p-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="tpl-title">Title</Label>
              <Input id="tpl-title" defaultValue={active.title} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tpl-body">Message body</Label>
              <Textarea id="tpl-body" rows={7} defaultValue={active.body} className="font-mono text-sm" />
            </div>
            <div>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Available variables</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {active.vars.map((v) => (
                  <Badge key={v} variant="secondary" className="font-mono text-xs">
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Preview" description="How this message appears to the recipient." bodyClassName="p-5">
            <div className="max-w-md rounded-2xl rounded-tl-sm border border-border bg-muted/50 p-4">
              <p className="text-sm font-semibold">{active.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{active.body}</p>
              <p className="num mt-3 text-right text-[11px] text-muted-foreground">17:41</p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
