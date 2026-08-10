import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Info } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { permissionGroups, roles } from "@/lib/mock-data";

export const Route = createFileRoute("/_shell/roles/$roleId")({
  loader: ({ params }) => {
    const role = roles.find((r) => r.id === params.roleId);
    if (!role) throw notFound();
    return { role };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.role.name} role — unblockyOn Admin` : "Role — unblockyOn Admin" },
      { name: "description", content: "Review and adjust the permission matrix for this administrative role." },
      { property: "og:title", content: "Role permissions — unblockyOn Admin" },
      { property: "og:description", content: "Permission matrix for an unblockyOn administrative role." },
    ],
  }),
  component: RoleDetailPage,
});

const actions = ["view", "create", "update", "delete"] as const;

function RoleDetailPage() {
  const { role } = Route.useLoaderData();
  const isSystem = role.id === "superadmin";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/roles">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to roles
        </Link>
      </Button>

      <PageHeader
        title={role.name}
        description={role.description}
        actions={
          <>
            <StatusBadge status={role.status} />
            <Button variant="outline" size="sm">
              Reset
            </Button>
            <Button size="sm">Save changes</Button>
          </>
        }
      />

      {isSystem && (
        <div className="flex items-start gap-2.5 rounded-lg border border-info/20 bg-info-muted px-4 py-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
          <p>
            Superadmin is a system role. All permissions are inherited and cannot be modified.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {permissionGroups.map((group) => (
          <SectionCard key={group.group} title={group.group} bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th scope="col" className="px-5 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Resource
                    </th>
                    {actions.map((a) => (
                      <th
                        key={a}
                        scope="col"
                        className="w-24 px-4 py-2.5 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase"
                      >
                        {a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {group.resources.map((res) => (
                    <tr key={res.key} className="transition-colors hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{res.label}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" aria-label={`About ${res.label} permissions`}>
                                <Info className="size-3.5 text-muted-foreground" aria-hidden="true" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>{res.description}</TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{res.description}</p>
                      </td>
                      {actions.map((a) => (
                        <td key={a} className="px-4 py-3 text-center">
                          <Checkbox
                            defaultChecked={isSystem ? true : res.perms[a]}
                            disabled={isSystem}
                            aria-label={`${a} ${res.label}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ))}
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-3.5 shadow-[var(--shadow-pop)]">
        <p className="text-sm text-muted-foreground">
          {isSystem ? "System role — editing disabled." : "You have unsaved permission changes."}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={isSystem}>
            Reset
          </Button>
          <Button size="sm" disabled={isSystem}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
