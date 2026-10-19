import { Link, useRouterState } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { navGroups } from "./nav-config";
// Bundled in the app so the brand mark renders even offline.
import wordmarkDarkText from "@/assets/cyberbacker-mark-dark.png";
import wordmarkLightText from "@/assets/cyberbacker-wordmark-light.png";
import { useDemoAccount } from "@/lib/demo-auth";

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const account = useDemoAccount();

  const exactRoutes = new Set(["/dashboard", "/internal"]);
  const isActive = (to: string) =>
    exactRoutes.has(to) ? pathname === to : pathname.startsWith(to);

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          to={account?.home ?? "/dashboard"}
          onClick={() => isMobile && setOpenMobile(false)}
          aria-label="Cyberbacker home"
          className={
            collapsed
              ? "flex items-center justify-center py-1"
              : "flex items-center gap-2.5 px-1 py-1.5"
          }
        >
          {collapsed ? (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-powder text-xs font-bold text-powder-foreground">
              CB
            </span>
          ) : (
            <>
              {/* Light mode: black wordmark. Dark mode: white wordmark. Same lockup, same height. */}
              <img
                src={wordmarkDarkText}
                alt="Cyberbacker"
                className="h-7 w-auto max-w-full object-contain object-left dark:hidden"
              />
              <img
                src={wordmarkLightText}
                alt="Cyberbacker"
                className="hidden h-7 w-auto max-w-full object-contain object-left dark:block"
              />
            </>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.filter((group) => account?.role === "superadmin" ? group.label === "Internal" : group.label === "Client").map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.to)}
                      tooltip={item.title}
                    >
                      <Link
                        to={item.to}
                        onClick={() => isMobile && setOpenMobile(false)}
                        className="flex items-center gap-2.5"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
