import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { TutorialPopup } from "@/components/layout/TutorialPopup";
import { Topbar } from "@/components/layout/Topbar";
import { Toaster } from "@/components/ui/sonner";
import { canAccessPath, restoreSessionFromApi, useDemoAccount } from "@/lib/demo-auth";
import { fetchPreferences } from "@/lib/api/settings";
import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

/** Applies the account's saved appearance (light / dark / system) app-wide. */
function AppearanceSync() {
  const { setTheme } = useTheme();
  const { data: prefs } = useQuery({ queryKey: ["preferences"], queryFn: fetchPreferences, staleTime: 60_000 });
  useEffect(() => {
    if (prefs?.appearance) setTheme(prefs.appearance);
  }, [prefs?.appearance, setTheme]);
  return null;
}

function AppLayout() {
  const account = useDemoAccount();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const queryClient = useQueryClient();

  useEffect(() => {
    void restoreSessionFromApi().then((session) => {
      if (session) void queryClient.invalidateQueries();
    });
    // Runs once per mount; the account is refreshed by the store events.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!account) return <Navigate to="/" replace />;
  if (!canAccessPath(account.role, pathname)) return <Navigate to={account.home} replace />;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <DemoBanner />
        <Topbar />
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
      <AppearanceSync />
      <TutorialPopup />
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
