import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog, DataTable, DataToolbar, TableFooterBar, Td, Th } from "@/components/data-table";
import { EmptyState, ErrorState, PermissionDeniedState, TableSkeleton } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { rolesQuery, setUserRole, setUserStatus, usersQuery } from "@/lib/data/users";
import { initials } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_shell/users/")({
  head: () => ({
    meta: [
      { title: "Users — unblockyOn Admin" },
      { name: "description", content: "Manage unblockyOn platform users, roles and account access." },
      { property: "og:title", content: "Users — unblockyOn Admin" },
      { property: "og:description", content: "Manage platform users, roles and account access." },
    ],
  }),
  component: UsersPage,
});

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function UsersPage() {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");

  const canView = can("users.view");
  const canUpdate = can("users.update");

  const users = useQuery({ ...usersQuery({ search, status, role }), enabled: canView });
  const roles = useQuery({ ...rolesQuery(), enabled: canView });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => setUserStatus(id, next),
    onSuccess: () => {
      toast.success("User status updated");
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) => setUserRole(id, roleId),
    onSuccess: () => {
      toast.success("Role updated");
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = users.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage platform users and access."
        actions={canUpdate ? <InviteUserHint /> : null}
      />

      {!canView ? (
        <div className="rounded-xl border border-border bg-card">
          <PermissionDeniedState />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <DataToolbar
            placeholder="Search users by name or email…"
            value={search}
            onValueChange={setSearch}
          >
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-9 w-auto min-w-[150px]" aria-label="Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {(roles.data ?? []).map((r) => (
                  <SelectItem key={r.id} value={r.key}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-auto min-w-[150px]" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["all", "active", "invited", "suspended", "disabled"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All statuses" : s[0]!.toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DataToolbar>

          {users.isLoading && <TableSkeleton cols={7} />}
          {users.isError && (
            <ErrorState title="Unable to load users" onRetry={() => void users.refetch()} />
          )}
          {users.isSuccess && rows.length === 0 && (
            <EmptyState
              title="No users match your filters"
              description="Adjust the search or filters to find the account you're looking for."
            />
          )}

          {users.isSuccess && rows.length > 0 && (
            <>
              <DataTable>
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <Th>User</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Last seen</Th>
                    <Th>Created</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-muted/40">
                      <Td>
                        <Link
                          to="/users/$userId"
                          params={{ userId: u.id }}
                          className="flex items-center gap-2.5 hover:underline"
                        >
                          <Avatar className="size-7">
                            <AvatarFallback className="bg-secondary text-[11px]">
                              {initials(u.full_name ?? u.email)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{u.full_name ?? "—"}</span>
                        </Link>
                      </Td>
                      <Td className="text-muted-foreground">{u.email}</Td>
                      <Td>{u.roleNames.join(", ") || "No role"}</Td>
                      <Td>
                        <StatusBadge status={u.status} />
                      </Td>
                      <Td className="num text-muted-foreground">{formatDate(u.last_seen_at)}</Td>
                      <Td className="num text-muted-foreground">{formatDate(u.created_at)}</Td>
                      <Td align="right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${u.email}`}>
                              <MoreHorizontal className="size-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to="/users/$userId" params={{ userId: u.id }}>
                                View profile
                              </Link>
                            </DropdownMenuItem>
                            {canUpdate &&
                              (roles.data ?? []).map((r) => (
                                <DropdownMenuItem
                                  key={r.id}
                                  onSelect={() => roleMutation.mutate({ id: u.id, roleId: r.id })}
                                >
                                  Set role: {r.name}
                                </DropdownMenuItem>
                              ))}
                            {canUpdate && <DropdownMenuSeparator />}
                            {canUpdate && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() =>
                                  statusMutation.mutate({
                                    id: u.id,
                                    next: u.status === "suspended" ? "active" : "suspended",
                                  })
                                }
                              >
                                {u.status === "suspended" ? "Reactivate user" : "Suspend user"}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
              <TableFooterBar showing={rows.length} total={rows.length} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function InviteUserHint() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" aria-hidden="true" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adding users</DialogTitle>
          <DialogDescription>
            New administrators sign up on the sign-in screen. Once their account exists you can assign a role from the
            user list.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="signup-link">Sign-up link</Label>
          <Input id="signup-link" readOnly value="/auth" />
        </div>
        <DialogFooter>
          <ConfirmDialog
            trigger={<Button variant="outline">Copy link</Button>}
            title="Copy sign-up link"
            description="Share this link with the person you want to onboard."
            confirmLabel="Copy"
            onConfirm={() => {
              void navigator.clipboard.writeText(`${window.location.origin}/auth`);
              toast.success("Sign-up link copied");
            }}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
