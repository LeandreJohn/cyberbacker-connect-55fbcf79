import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import logoLight from "@/assets/cyberbacker-wordmark-light.png";
import logoDark from "@/assets/cyberbacker-logo-dark.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Cyberbacker Client Success Platform" },
      { name: "description", content: "Sign in to your Cyberbacker client workspace with Google." },
      { property: "og:title", content: "Sign in — Cyberbacker" },
      { property: "og:description", content: "Access your Cyberbacker team, reports and support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="bg-gradient-banner relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <img src={logoLight} alt="Cyberbacker" className="h-10 w-auto self-start" />
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-primary-foreground">
            Your remote team, beautifully managed.
          </h1>
          <ul className="space-y-3 text-primary-foreground/85">
            {[
              { icon: Users, t: "Track every Cyberbacker's attendance and performance" },
              { icon: Sparkles, t: "Hire vetted talent from the marketplace" },
              { icon: ShieldCheck, t: "Enterprise-grade security and support" },
            ].map((f) => (
              <li key={f.t} className="flex items-center gap-3 text-sm">
                <f.icon className="h-5 w-5" /> {f.t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-primary-foreground/70">© 2026 Cyberbacker. All rights reserved.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <img src={logoDark} alt="Cyberbacker" className="mx-auto h-10 w-auto lg:hidden" />
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your Client Success workspace</p>
          </div>
          <Button
            size="lg"
            variant="outline"
            className="h-12 w-full gap-3 text-base"
            onClick={() => navigate({ to: "/" })}
          >
            <GoogleIcon /> Continue with Google
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to Cyberbacker's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
