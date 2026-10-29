import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { DEMO_ACCOUNTS, selectDemoRole, selectSession, type DemoRole } from "@/lib/demo-auth";
import { homeForRole, loginWithPassword } from "@/lib/auth/session";
import loginBg from "@/assets/cyberbacker-login-scene.jpg";
import logo from "@/assets/cyberbacker-logo-light.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Cyberbacker Client Portal" },
      { name: "description", content: "Sign in to your Cyberbacker Client Portal." },
      { property: "og:title", content: "Sign in — Cyberbacker Client Portal" },
      { property: "og:description", content: "Bringing visibility, convenience, and control to your Cyberbacker experience." },
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = (role: DemoRole) => {
    selectDemoRole(role);
    return navigate({ to: DEMO_ACCOUNTS[role].home, replace: true });
  };
  const notYet = () => toast.info("Google sign-in isn't available yet. Use your email and password.");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setPending(true);
    try {
      const session = await loginWithPassword(email, password);
      selectSession(session);
      await navigate({ to: homeForRole(session.role), replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="relative isolate min-h-dvh overflow-x-hidden lg:h-dvh lg:overflow-hidden">
      <img src={loginBg} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full object-cover object-left-bottom" />
      <div className="flex min-h-dvh flex-col gap-8 px-5 py-6 sm:px-10 lg:h-full lg:min-h-0 lg:flex-row lg:items-stretch lg:justify-between lg:gap-[3vw] lg:px-[4vw] lg:py-[4vh]">
        <div className="flex min-w-0 flex-col lg:max-w-[56%] lg:flex-1">
          <div>
            <img src={logo} alt="Cyberbacker" className="h-auto w-[clamp(150px,14vw,260px)]" />
            <p className="mt-1 pl-[clamp(40px,3.6vw,68px)] text-[clamp(10px,0.75vw,14px)] leading-tight text-foreground/80">We've Got Your Back.<br />World-Class Professional Support.</p>
          </div>
          <div className="mt-[clamp(20px,6vh,72px)]">
            <h2 className="font-display font-bold leading-[1.05] tracking-tight">
              <span className="block text-[clamp(28px,3.4vw,64px)] text-foreground">Welcome to Your</span>
              <span className="block text-[clamp(32px,4.2vw,84px)] text-primary">Cyberbacker Client Portal</span>
            </h2>
            <p className="mt-[clamp(12px,3vh,32px)] max-w-[34ch] text-[clamp(15px,1.35vw,26px)] italic leading-snug text-foreground/85">Bringing visibility, convenience, and control to your Cyberbacker experience.</p>
          </div>
          <p className="mt-auto hidden pt-6 text-[clamp(12px,0.9vw,16px)] text-foreground/85 lg:block">© 2026 Cyberbacker. All rights reserved.</p>
        </div>
        <div className="flex justify-center lg:items-center">
        <div className="w-full max-w-[440px] rounded-2xl border border-border/60 bg-card/95 p-7 shadow-2xl backdrop-blur sm:p-9 lg:max-h-[92dvh] lg:w-[clamp(360px,30vw,480px)] lg:max-w-none lg:overflow-y-auto lg:p-7">
          <h1 className="text-3xl font-bold tracking-normal text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your Cyberbacker Client Portal.</p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-12 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-12 rounded-lg" />
            </div>
            {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" disabled={pending} className="h-12 w-full rounded-lg text-base font-semibold">{pending ? "Signing in…" : "Log in"}</Button>
          </form>

          <div className="my-5 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="h-12 w-full gap-3 rounded-lg text-base font-semibold" onClick={notYet}>
            <GoogleIcon /> Sign in with Google
          </Button>

          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Demo access</p>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="secondary" className="h-auto flex-col py-2" onClick={() => login("client")}>
                <span className="text-xs font-semibold">Continue as Client</span>
                <span className="text-[10px] font-normal text-muted-foreground">{DEMO_ACCOUNTS.client.name}</span>
              </Button>
              <Button size="sm" variant="secondary" className="h-auto flex-col py-2" onClick={() => login("superadmin")}>
                <span className="text-xs font-semibold">Continue as Superadmin</span>
                <span className="text-[10px] font-normal text-muted-foreground">{DEMO_ACCOUNTS.superadmin.name}</span>
              </Button>
            </div>
          </div>
        </div>
        </div>
        <p className="text-center text-xs text-foreground/85 lg:hidden">© 2026 Cyberbacker. All rights reserved.</p>
      </div>
      <Toaster position="top-center" />
    </main>
  );
}
