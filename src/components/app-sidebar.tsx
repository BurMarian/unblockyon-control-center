import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BadgeEuro,
  Bell,
  BookTemplate,
  CircleDollarSign,
  CreditCard,
  Cpu,
  FileWarning,
  Gauge,
  KeyRound,
  LayoutDashboard,
  MonitorSmartphone,
  QrCode,
  ScrollText,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  Layers,
  ScanLine,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const nav = [
  {
    label: "Main",
    items: [{ title: "Overview", url: "/", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Management",
    items: [
      { title: "Users", url: "/users", icon: Users },
      { title: "Roles & Permissions", url: "/roles", icon: ShieldCheck },
      { title: "Sessions", url: "/sessions", icon: MonitorSmartphone },
    ],
  },
  {
    label: "QR Management",
    items: [
      { title: "QR Codes", url: "/qr-codes", icon: QrCode },
      { title: "Generate QR", url: "/generate-qr", icon: Sparkles },
      { title: "Activations", url: "/activations", icon: ScanLine },
      { title: "QR Batches", url: "/batches", icon: Layers },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Telegram", url: "/telegram", icon: Send },
      { title: "Notifications", url: "/notifications", icon: Bell, badge: "3" },
      { title: "Templates", url: "/templates", icon: BookTemplate },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Payments", url: "/payments", icon: CreditCard },
      { title: "Plans & Pricing", url: "/plans", icon: BadgeEuro },
      { title: "Revenue", url: "/revenue", icon: CircleDollarSign },
    ],
  },
  {
    label: "System",
    items: [
      { title: "System Health", url: "/system-health", icon: Gauge },
      { title: "Activity Logs", url: "/activity-logs", icon: ScrollText },
      { title: "Error Logs", url: "/error-logs", icon: FileWarning, badge: "6" },
      { title: "Services", url: "/services", icon: Cpu },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "General", url: "/settings/general", icon: SlidersHorizontal },
      { title: "Security", url: "/settings/security", icon: KeyRound },
      { title: "Administration", url: "/settings/administration", icon: Settings },
    ],
  },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-11 items-center gap-2.5 px-1.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="size-4" aria-hidden="true" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">unblockyOn</p>
              <p className="truncate text-[11px] text-muted-foreground">Admin Console</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {nav.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider uppercase">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = isActive(item.url, "exact" in item ? item.exact : false);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground"
                      >
                        <Link to={item.url}>
                          <item.icon className="size-4" aria-hidden="true" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {"badge" in item && item.badge && !collapsed && (
                        <SidebarMenuBadge className="text-[11px]">{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {collapsed ? (
          <div className="flex justify-center py-1.5">
            <span className="size-2 rounded-full bg-success" aria-label="All systems operational" />
          </div>
        ) : (
          <div className="rounded-lg bg-sidebar-accent px-3 py-2.5">
            <p className="flex items-center gap-2 text-xs font-medium">
              <span className="size-2 rounded-full bg-success" aria-hidden="true" />
              All systems operational
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Platform v2.14.3 · EU-Central</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
