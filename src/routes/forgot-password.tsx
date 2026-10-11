import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { useState } from "react";

import logoDark from "@/assets/cyberbacker-logo-dark.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — Cyberbacker" }, { name: "description", content: "Request access recovery for your Cyberbacker workspace." }, { property: "og:title", content: "Forgot password — Cyberbacker" }, { property: "og:description", content: "Recover access to your Cyberbacker workspace." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-10">
      <div className="w-full max-w-md border bg-background p-7 shadow-card sm:p-9">
        <img src={logoDark} alt="Cyberbacker" className="mb-9 h-9 w-auto object-contain" />
        {sent ? (
          <div className="space-y-5 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success"><CheckCircle2 className="h-7 w-7" /></span>
            <div><h1 className="text-2xl font-bold tracking-normal">Check your email</h1><p className="mt-2 text-sm text-muted-foreground">If a demo account exists for {email}, recovery instructions would be sent. Email delivery is disabled in this prototype.</p></div>
            <Button className="w-full" asChild><Link to="/">Return to sign in</Link></Button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); if (email.trim()) setSent(true); }}>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"><KeyRound className="h-5 w-5" /></span>
            <div><h1 className="text-2xl font-bold tracking-normal">Forgot your password?</h1><p className="mt-2 text-sm text-muted-foreground">Enter your work email and we’ll prepare recovery instructions.</p></div>
            <div className="space-y-2"><Label htmlFor="recovery-email">Work email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input id="recovery-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="pl-9" /></div></div>
            <Button type="submit" className="w-full">Send recovery instructions</Button>
            <Button variant="ghost" className="w-full" asChild><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to sign in</Link></Button>
          </form>
        )}
      </div>
    </main>
  );
}