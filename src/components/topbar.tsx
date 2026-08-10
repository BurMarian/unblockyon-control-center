import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronRight, LogOut, Search, Settings2, ShieldCheck, User } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchGroups } from "@/lib/mock-data";

const titles: Record<string, string> = {
  "/": "Overview",
  "/users": "Users",
  "/roles": "Roles & Permissions",
  "/sessions": "Sessions",
  "/qr-codes": "QR Codes",
  "/generate-qr": "Generate QR",
  "/activations": "Activations",
  "/batches": "QR Batches",
  "/telegram": "Telegram",
  "/notifications": "Notifications",
  "/templates": "Templates",
  "/payments": "Payments",
  "/plans": "Plans & Pricing",
  "/revenue": "Revenue",
  "/system-health": "System Health",
  "/activity-logs": "Activity Logs",
  "/error-logs": "Error Logs",
  "/services": "Services",
  "/settings/general": "General",
  "/settings/security": "Security",
  "/settings/administration": "Administration",
};

function useCrumbs() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  if (pathname === "/") return [{ label: "Overview", href: "/" }];
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [{ label: "Home", href: "/" }];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    crumbs.push({ label: titles[acc] ?? prettify(seg), href: acc });
  }
  return crumbs;
}

function prettify(seg: string) {
  if (seg.startsWith("UBQ") || seg.startsWith("BATCH") || seg.startsWith("usr_") || seg.startsWith("err_"))
    return seg;
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
}

export function Topbar() {
  const crumbs = useCrumbs();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-3 backdrop-blur sm:px-5">
      <SidebarTrigger className="shrink-0" aria-label="Toggle navigation" />

      <nav aria-label="Breadcrumb" className="hidden min-w-0 md:block">
        <ol className="flex items-center gap-1 text-sm">
          {crumbs.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden="true" />}
              {i === crumbs.length - 1 ? (
                <span className="font-medium">{c.label}</span>
              ) : (
                <Link to={c.href as "/"} className="text-muted-foreground hover:text-foreground">
                  {c.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:border-border-strong sm:w-64"
        >
          <Search className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Search anything…</span>
          <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-medium sm:inline">
            ⌘K
          </kbd>
        </button>

        <span className="hidden items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium lg:inline-flex">
          <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
          Systems normal
        </span>

        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative" asChild>
          <Link to="/notifications">
            <Bell className="size-4" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-accent"
              aria-label="Open user menu"
            >
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">AM</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium lg:inline">Alex Morgan</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">Alex Morgan</p>
              <p className="text-xs font-normal text-muted-foreground">Superadmin</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/users/$userId" params={{ userId: "usr_8241" }}>
                <User className="size-4" aria-hidden="true" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings/general">
                <Settings2 className="size-4" aria-hidden="true" /> Preferences
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings/security">
                <ShieldCheck className="size-4" aria-hidden="true" /> Security
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search anything…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchGroups.map((g) => (
            <CommandGroup key={g.group} heading={g.group}>
              {g.items.map((item) => (
                <CommandItem key={item} value={`${g.group} ${item}`} onSelect={() => setOpen(false)}>
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
