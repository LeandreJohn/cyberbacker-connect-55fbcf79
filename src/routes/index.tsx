import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, Building2, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEMO_ACCOUNTS, selectDemoRole, type DemoRole } from "@/lib/demo-auth";
import logoLight from "@/assets/cyberbacker-wordmark-light.png";
import logoDark from "@/assets/cyberbacker-logo-dark.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Cyberbacker Client Success Platform" },
      { name: "description", content: "Choose a Client or Superadmin demo workspace." },
      { property: "og:title", content: "Sign in — Cyberbacker Client Success Platform" },
      { property: "og:description", content: "Access the Cyberbacker client success and operations platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

const choices: { role: DemoRole; icon: typeof Users; description: string }[] = [
  { role: "client", icon: BriefcaseBusiness, description: "Manage your Cyberbacker team, hiring, reviews, billing, and support." },
  { role: "superadmin", icon: ShieldCheck, description: "Oversee clients, recruitment, finance, analytics, and system operations." },
];

function LoginPage() {
  const navigate = useNavigate();
  const login = (role: DemoRole) => {
    selectDemoRole(role);
    return navigate({ to: DEMO_ACCOUNTS[role].home, replace: true });
  };

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,.95fr)]">
      <section className="relative hidden overflow-hidden bg-gradient-banner p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:p-16">
        <img src={logoLight} alt="Cyberbacker" className="h-10 w-auto self-start object-contain" />
        <div className="max-w-xl space-y-7">
          <div className="inline-flex items-center gap-2 border border-primary-foreground/25 px-3 py-1.5 text-xs font-medium uppercase">
            <Building2 className="h-3.5 w-3.5" /> Client Success Platform
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-normal xl:text-6xl">Your people. Your progress. One workspace.</h1>
          <p className="max-w-lg text-lg leading-relaxed text-primary-foreground/80">A clear command center for clients and Cyberbacker operations teams to work better together.</p>
          <div className="grid grid-cols-2 gap-4 border-t border-primary-foreground/20 pt-6 text-sm text-primary-foreground/80">
            <p>Team performance and attendance</p><p>Hiring and candidate matching</p>
            <p>Support and client success</p><p>Operations and executive insights</p>
          </div>
        </div>
        <p className="text-xs text-primary-foreground/65">© 2026 Cyberbacker. All rights reserved.</p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-10 lg:p-12">
        <div className="w-full max-w-xl">
          <img src={logoDark} alt="Cyberbacker" className="mb-10 h-9 w-auto object-contain lg:hidden" />
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-primary">WELCOME BACK</p>
            <h2 className="text-3xl font-bold tracking-normal">Choose your workspace</h2>
            <p className="mt-2 text-muted-foreground">Select a demo account to continue. Your choice will be remembered on this device.</p>
          </div>

          <div className="space-y-4">
            {choices.map(({ role, icon: Icon, description }) => {
              const account = DEMO_ACCOUNTS[role];
              return (
                <Button key={role} variant="outline" className="h-auto w-full justify-start gap-4 p-5 text-left" onClick={() => login(role)}>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1 whitespace-normal">
                    <span className="block text-base font-semibold text-foreground">Continue as {account.title}</span>
                    <span className="mt-0.5 block text-sm font-medium text-foreground/80">{account.name}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{description}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Button>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-between gap-4 text-sm">
            <p className="text-muted-foreground">No signup is available during this demo.</p>
            <Button variant="link" className="h-auto shrink-0 p-0" onClick={() => navigate({ to: "/forgot-password" })}>Forgot password?</Button>
          </div>
        </div>
      </section>
    </main>
  );
}