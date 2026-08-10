import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Download, Loader2, Sparkles } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/generate-qr")({
  head: () => ({
    meta: [
      { title: "Generate QR — unblockyOn Admin" },
      { name: "description", content: "Configure and generate a new production batch of unblockyOn QR codes." },
      { property: "og:title", content: "Generate QR — unblockyOn Admin" },
      { property: "og:description", content: "Configure and generate a new QR production batch." },
    ],
  }),
  component: GenerateQrPage,
});

const steps = [
  "Preparing batch…",
  "Generating QR codes…",
  "Creating activation codes…",
  "Finalizing package…",
];

function GenerateQrPage() {
  const [quantity, setQuantity] = useState(1000);
  const [batchName, setBatchName] = useState("August 2026");
  const [format, setFormat] = useState("PNG");
  const [codes, setCodes] = useState(true);
  const [logo, setLogo] = useState(true);
  const [phase, setPhase] = useState<"form" | "running" | "done">("form");
  const [step, setStep] = useState(0);

  const start = () => {
    setPhase("running");
    setStep(0);
    steps.forEach((_, i) => {
      setTimeout(() => {
        setStep(i + 1);
        if (i === steps.length - 1) setTimeout(() => setPhase("done"), 700);
      }, (i + 1) * 900);
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate QR"
        description="Create a new production batch of unblockyOn identifiers."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Batch configuration" className="lg:col-span-2" bodyClassName="space-y-5 p-5">
          <fieldset disabled={phase !== "form"} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  max={50000}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">Maximum 50,000 codes per batch.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="batch-name">Batch name</Label>
                <Input id="batch-name" value={batchName} onChange={(e) => setBatchName(e.target.value)} />
                <p className="text-xs text-muted-foreground">Used as the printable batch reference.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="format">Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["PNG", "SVG", "PDF", "EPS"].map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resolution">Resolution</Label>
                <Select defaultValue="1024 × 1024">
                  <SelectTrigger id="resolution">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["512 × 512", "1024 × 1024", "2048 × 2048"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <ToggleRow
                id="codes"
                label="Include activation codes"
                description="Generate a unique single-use activation code for every QR."
                checked={codes}
                onChange={setCodes}
              />
              <ToggleRow
                id="logo"
                label="Include logo"
                description="Embed the unblockyOn mark in the centre of each code."
                checked={logo}
                onChange={setLogo}
              />
            </div>
          </fieldset>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Configuration summary" bodyClassName="p-5">
            <dl className="space-y-3 text-sm">
              <SummaryRow label="Batch name" value={batchName || "—"} />
              <SummaryRow label="Quantity" value={num(quantity)} />
              <SummaryRow label="Format" value={format} />
              <SummaryRow label="Activation codes" value={codes ? "Enabled" : "Disabled"} />
              <SummaryRow label="Logo" value={logo ? "Enabled" : "Disabled"} />
            </dl>
            <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Estimated output</p>
              <ul className="num mt-2 space-y-1 text-sm">
                <li>{num(quantity)} QR codes</li>
                <li>1 batch</li>
                <li>{codes ? `${num(quantity)} activation codes` : "No activation codes"}</li>
              </ul>
            </div>
          </SectionCard>

          {phase === "form" && (
            <Button className="w-full" size="lg" onClick={start} disabled={quantity < 1}>
              <Sparkles className="size-4" aria-hidden="true" /> Generate QR Codes
            </Button>
          )}

          {phase === "running" && (
            <SectionCard title="Generating" bodyClassName="space-y-4 p-5">
              <Progress value={(step / steps.length) * 100} />
              <ul className="space-y-2.5 text-sm" aria-live="polite">
                {steps.map((s, i) => (
                  <li key={s} className="flex items-center gap-2">
                    {i < step ? (
                      <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                    ) : i === step ? (
                      <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
                    ) : (
                      <span className="size-4 rounded-full border border-border" aria-hidden="true" />
                    )}
                    <span className={cn(i <= step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {phase === "done" && (
            <SectionCard bodyClassName="p-5">
              <div className="text-center">
                <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-success-muted text-success">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-base font-semibold">Generation completed</h3>
                <p className="num mt-1 text-sm text-muted-foreground">
                  {num(quantity)} QR codes created successfully.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button>
                    <Download className="size-4" aria-hidden="true" /> Download ZIP
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/batches">View batch</Link>
                  </Button>
                  <Button variant="ghost" onClick={() => setPhase("form")}>
                    Generate another batch
                  </Button>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="num font-medium">{value}</dd>
    </div>
  );
}
