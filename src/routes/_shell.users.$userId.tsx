import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { auditLogs, sessions, users } from "@/lib/mock-data";
import { initials } from "@/lib/format";

export const Route = createFileRoute("/_shell/users/$userId")({
  loader: ({ params }) => {
    const user = users.find((u) => u.id === params.userId);
    if (!user) throw notFound();
    return { user };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.user.name} — unblockyOn Admin` : "User — unblockyOn Admin" },
      {
        name: "description",
        content: "User profile, account information, security posture and recent activity.",
      },
      { property: "og:title", content: "User profile — unblockyOn Admin" },
      { property: "og:description", content: "Profile, security and activity for a platform user." },
    ],
  }),
  component: UserDetailPage,
});

function UserDetailPage() {
  const { user } = Route.useLoaderData();
  const userSessions = sessions.filter((s) => s.user === user.name);
  const userActivity = auditLogs.filter((a) => a.user === user.name).slice(0, 5);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/users">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to users
        </Link>
      </Button>

      <PageHeader
        title={user.name}
        description={`${user.role} · ${user.id}`}
        actions={
          <>
            <Button variant="outline" size="sm">
              Edit user
            </Button>
            <Button variant="outline" size="sm">
              Change role
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm">
                  Revoke sessions
                </Button>
              }
              title="Revoke all sessions?"
              description={`${user.name} will be signed out of every device immediately and must authenticate again.`}
              confirmLabel="Revoke sessions"
            />
            <ConfirmDialog
              trigger={
                <Button variant="destructive" size="sm">
                  Suspend user
                </Button>
              }
              title={`Suspend ${user.name}?`}
              description="Suspension blocks all console access until an administrator restores the account."
              confirmLabel="Suspend user"
            />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Profile" className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary text-base text-primary-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-1.5">
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <dl className="space-y-3 text-sm">
            <Row icon={<ShieldCheck className="size-4" />} label="Role" value={user.role} />
            <Row icon={<Mail className="size-4" />} label="Email" value={user.email} />
            <Row icon={<Phone className="size-4" />} label="Phone" value={user.phone} />
            <Row icon={<MapPin className="size-4" />} label="Location" value={user.location} />
          </dl>
        </SectionCard>

        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Account information" bodyClassName="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Created" value={user.created} />
            <Field label="Last login" value={user.lastLogin} />
            <Field label="Last activity" value={user.status === "Invited" ? "—" : "2026-08-10 17:12"} />
            <Field label="Account status" value={user.status} />
          </SectionCard>

          <SectionCard title="Security" bodyClassName="p-0">
            <div className="grid gap-4 border-b border-border p-5 sm:grid-cols-3">
              <Field label="Active sessions" value={String(userSessions.length)} />
              <Field label="Failed login attempts (30d)" value={user.status === "Suspended" ? "7" : "0"} />
              <Field label="Password" value="Rotated 42 days ago" />
            </div>
            {userSessions.length > 0 ? (
              <ul className="divide-y divide-border">
                {userSessions.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {s.device} · {s.browser}
                      </p>
                      <p className="num text-xs text-muted-foreground">
                        {s.location} · {s.ip} · {s.lastActive}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="sm" className="text-destructive">
                          Revoke
                        </Button>
                      }
                      title="Revoke this session?"
                      description={`The session on ${s.device} will be terminated immediately.`}
                      confirmLabel="Revoke session"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                No active sessions for this account.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Activity" description="Recent actions performed by this user." bodyClassName="p-0">
            {userActivity.length > 0 ? (
              <ul className="divide-y divide-border">
                {userActivity.map((a) => (
                  <li key={a.ts} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <KeyRound className="size-4 text-muted-foreground" aria-hidden="true" />
                    <p className="min-w-0 flex-1 text-sm">
                      {a.action} <span className="text-muted-foreground">· {a.resourceId}</span>
                    </p>
                    <StatusBadge status={a.status} />
                    <span className="num text-xs text-muted-foreground">{a.ts}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                No recorded activity in the last 30 days.
              </p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-muted-foreground" aria-hidden="true">
        {icon}
      </span>
      <dt className="sr-only">{label}</dt>
      <dd className="truncate">{value}</dd>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="num mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
