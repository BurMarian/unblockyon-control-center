import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, MoreHorizontal, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  ConfirmDialog,
  DataTable,
  DataToolbar,
  TableFooterBar,
  Td,
  Th,
} from "@/components/data-table";
import {
  EmptyState,
  ErrorState,
  PermissionDeniedState,
  StateSwitcher,
  TableSkeleton,
  type PageState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { users } from "@/lib/mock-data";
import { initials } from "@/lib/format";

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

function UsersPage() {
  const [state, setState] = useState<PageState>("success");
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allSelected = selected.length === users.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage platform users and access."
        actions={
          <>
            <StateSwitcher value={state} onChange={setState} />
            <Button variant="outline" size="sm">
              <Download className="size-4" aria-hidden="true" /> Export
            </Button>
            <AddUserDialog />
          </>
        }
      />

      {state === "denied" ? (
        <div className="rounded-xl border border-border bg-card">
          <PermissionDeniedState />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <DataToolbar
            placeholder="Search users by name or email…"
            right={
              selected.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selected.length} selected</span>
                  <Button variant="outline" size="sm">
                    Change role
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button variant="outline" size="sm" className="text-destructive">
                        Suspend
                      </Button>
                    }
                    title={`Suspend ${selected.length} users?`}
                    description="Suspended users are signed out immediately and cannot access the admin console until reactivated."
                    confirmLabel="Suspend users"
                    onConfirm={() => setSelected([])}
                  />
                </div>
              ) : null
            }
          >
            <FilterSelect label="Role" options={["All roles", "Superadmin", "Admin", "Manager", "Support"]} />
            <FilterSelect label="Status" options={["All statuses", "Active", "Invited", "Suspended", "Disabled"]} />
            <FilterSelect label="Created" options={["All time", "Last 7 days", "Last 30 days", "This year"]} />
          </DataToolbar>

          {state === "loading" && <TableSkeleton cols={7} />}
          {state === "empty" && (
            <EmptyState
              title="No users match your filters"
              description="Adjust the search or filters, or invite a new teammate to the console."
              action={<AddUserDialog />}
            />
          )}
          {state === "error" && <ErrorState title="Unable to load users" onRetry={() => setState("success")} />}

          {state === "success" && (
            <>
              <DataTable>
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <Th className="w-10">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(v) => setSelected(v ? users.map((u) => u.id) : [])}
                        aria-label="Select all users"
                      />
                    </Th>
                    <Th>User ↓</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Last login</Th>
                    <Th>Created</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-muted/40">
                      <Td>
                        <Checkbox
                          checked={selected.includes(u.id)}
                          onCheckedChange={() => toggle(u.id)}
                          aria-label={`Select ${u.name}`}
                        />
                      </Td>
                      <Td>
                        <Link
                          to="/users/$userId"
                          params={{ userId: u.id }}
                          className="flex items-center gap-2.5 hover:underline"
                        >
                          <Avatar className="size-7">
                            <AvatarFallback className="bg-secondary text-[11px]">
                              {initials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{u.name}</span>
                        </Link>
                      </Td>
                      <Td className="text-muted-foreground">{u.email}</Td>
                      <Td>{u.role}</Td>
                      <Td>
                        <StatusBadge status={u.status} />
                      </Td>
                      <Td className="num text-muted-foreground">{u.lastLogin}</Td>
                      <Td className="num text-muted-foreground">{u.created}</Td>
                      <Td align="right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${u.name}`}>
                              <MoreHorizontal className="size-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to="/users/$userId" params={{ userId: u.id }}>
                                View profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit user</DropdownMenuItem>
                            <DropdownMenuItem>Change role</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              Suspend user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
              <TableFooterBar showing={users.length} total={1248} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function FilterSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <Select defaultValue={options[0] ?? ""}>
      <SelectTrigger className="h-9 w-auto min-w-[150px]" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function AddUserDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" aria-hidden="true" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a user</DialogTitle>
          <DialogDescription>
            The invitation email includes a single-use link valid for 72 hours.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-name">Full name</Label>
            <Input id="new-name" placeholder="Jonas Meier" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-email">Work email</Label>
            <Input id="new-email" type="email" placeholder="jonas.meier@unblockyon.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-role">Role</Label>
            <Select defaultValue="Support">
              <SelectTrigger id="new-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Superadmin", "Admin", "Manager", "Support"].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Send invitation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
