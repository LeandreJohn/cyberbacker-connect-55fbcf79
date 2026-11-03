import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { portalQ } from "@/lib/api/queries";
import { changePassword, replayTutorials, updatePreferences, updateProfile } from "@/lib/api/settings";
import type { Preferences, PreferencesUpdate, Profile } from "@/lib/types";
import { validatePasswordChange } from "@/lib/password-rules";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Cyberbacker" },
      { name: "description", content: "Manage your profile, notifications and appearance." },
    ],
  }),
  component: Settings,
});

const KPI_PREFS = [
  { key: "kpi_active_cyberbackers", label: "Active Cyberbackers" },
  { key: "kpi_attendance_rate", label: "Attendance rate" },
  { key: "kpi_open_support_tickets", label: "Open support tickets" },
  { key: "kpi_upcoming_renewals", label: "Upcoming renewals" },
] as const;

const NOTIFY_PREFS = [
  { key: "notify_weekly_reports", label: "Weekly reports", desc: "Summary of your team's output" },
  { key: "notify_ticket_updates", label: "Ticket updates", desc: "Replies to your support tickets" },
  { key: "notify_billing_reminders", label: "Billing reminders", desc: "Upcoming and overdue invoices" },
  { key: "notify_product_news", label: "Product news", desc: "New features and announcements" },
] as const;

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences" />
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Change password</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><ProfileCard /></TabsContent>
        <TabsContent value="password"><ChangePasswordCard /></TabsContent>
        <TabsContent value="dashboard"><PreferenceCard title="Dashboard KPI widgets" description="Choose which KPI cards appear on your dashboard. At least one must stay on.">
          <PreferenceSwitches keys={KPI_PREFS} lastOneOn />
        </PreferenceCard></TabsContent>
        <TabsContent value="tutorials"><TutorialsCard /></TabsContent>
        <TabsContent value="notifications">
          <PreferenceCard title="Notification preferences" description="Choose what you want to be notified about">
            <PreferenceSwitches keys={NOTIFY_PREFS} />
          </PreferenceCard>
        </TabsContent>
        <TabsContent value="appearance"><AppearanceCard /></TabsContent>
      </Tabs>
    </div>
  );
}

/** Shared read of the preferences document, one mutation per flip. */
function usePreferences() {
  const { data, isLoading } = useQuery(portalQ.preferences());
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: (patch: PreferencesUpdate) => updatePreferences(patch),
    onSuccess: (prefs) => queryClient.setQueryData(["preferences"], prefs),
    onError: (e) => toast.error(errorMessage(e, "Couldn't save the setting")),
  });
  return { prefs: data, isLoading, save };
}

function PreferenceCard({ title, description, children, loading }: { title: string; description: string; children: React.ReactNode; loading?: boolean }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent className="divide-y divide-border">{loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />) : children}</CardContent>
    </Card>
  );
}

function PreferenceSwitches({ keys, lastOneOn }: { keys: readonly { key: string; label: string; desc?: string }[]; lastOneOn?: boolean }) {
  const { prefs, isLoading, save } = usePreferences();
  if (isLoading || !prefs) return null;
  const flip = (key: string, on: boolean) => {
    const turningOff = !on && lastOneOn && keys.filter((k) => (prefs as unknown as Record<string, boolean>)[k.key]).length <= 1;
    if (turningOff) {
      toast.error("Keep at least one widget on.");
      return;
    }
    save.mutate({ [key]: on } as PreferencesUpdate);
  };
  return (
    <>
      {keys.map((p) => (
        <div key={p.key} className="flex items-center justify-between py-4 first:pt-0">
          <div>
            <p className="text-sm font-medium">{p.label}</p>
            {p.desc && <p className="text-sm text-muted-foreground">{p.desc}</p>}
          </div>
          <Switch checked={Boolean((prefs as unknown as Record<string, boolean>)[p.key])} onCheckedChange={(on) => flip(p.key, on)} disabled={save.isPending} />
        </div>
      ))}
    </>
  );
}

function ProfileCard() {
  const { data: profile, isLoading } = useQuery(portalQ.profile());
  if (isLoading || !profile) return <Card><CardContent className="space-y-3 pt-6">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>;
  return <ProfileForm profile={profile} />;
}

function ProfileForm({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [f, setF] = useState({ name: profile.name, email: profile.email, company: profile.company ?? "" });
  useEffect(() => setF({ name: profile.name, email: profile.email, company: profile.company ?? "" }), [profile]);
  const save = useMutation({
    mutationFn: () => updateProfile({ name: f.name.trim(), email: f.email.trim(), company: f.company.trim() || null }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile"], updated);
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn't update your profile")),
  });
  const dirty = f.name !== profile.name || f.email !== profile.email || f.company !== (profile.company ?? "");
  const field = (id: keyof typeof f, label: string, type = "text", disabled = false) => (
    <div className="space-y-1.5">
      <Label htmlFor={`pf-${id}`}>{label}</Label>
      <Input id={`pf-${id}`} type={type} value={f[id]} disabled={disabled} onChange={(e) => setF({ ...f, [id]: e.target.value })} />
    </div>
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile information</CardTitle>
        <CardDescription>Update your personal and company details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <InitialsAvatar initials={profile.initials} size="lg" />
          <Button variant="outline" size="sm" disabled>Change avatar</Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("name", "Full name")}
          {field("email", "Email", "email")}
          {field("company", "Company")}
          <div className="space-y-1.5"><Label htmlFor="pf-role">Role</Label><Input id="pf-role" value={profile.role} disabled /></div>
        </div>
        <Separator />
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={!dirty || save.isPending} onClick={() => setF({ name: profile.name, email: profile.email, company: profile.company ?? "" })}>Cancel</Button>
          <Button disabled={!dirty || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving…" : "Save changes"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChangePasswordCard() {
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePasswordChange(f.current, f.next, f.confirm);
    setError(err);
    if (err) return;
    changePassword({ current_password: f.current, new_password: f.next, confirm_new_password: f.confirm })
      .then(() => { setF({ current: "", next: "", confirm: "" }); toast.success("Password updated"); })
      .catch((err2: unknown) => toast.error(errorMessage(err2, "Couldn't change the password. Check your current password.")));
  };
  const field = (id: keyof typeof f, label: string) => (
    <div className="space-y-1.5"><Label htmlFor={`pw-${id}`}>{label}</Label><Input id={`pw-${id}`} type="password" autoComplete={id === "current" ? "current-password" : "new-password"} value={f[id]} onChange={(e) => setF({ ...f, [id]: e.target.value })} /></div>
  );
  return (
    <Card>
      <CardHeader><CardTitle>Change password</CardTitle><CardDescription>Use at least 8 characters, different from your current password</CardDescription></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="max-w-md space-y-4">
          {field("current", "Current password")}{field("next", "New password")}{field("confirm", "Confirm new password")}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end"><Button type="submit">Update password</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}

function TutorialsCard() {
  const { prefs, isLoading, save } = usePreferences();
  const queryClient = useQueryClient();
  return (
    <Card>
      <CardHeader><CardTitle>Tutorials</CardTitle><CardDescription>Show a short guide the first time you open each page.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="tutorials-on" className="text-sm font-medium">Show tutorial popups</Label>
          <Switch id="tutorials-on" checked={prefs?.tutorials_enabled ?? true} disabled={isLoading} onCheckedChange={(enabled) => save.mutate({ tutorials_enabled: enabled })} />
        </div>
        <Button variant="outline" onClick={() => replayTutorials().then((t) => queryClient.setQueryData(["tutorials"], t)).then(() => toast.success("Tutorials will show again on each page.")).catch((e) => toast.error(errorMessage(e, "Couldn't reset tutorials")))}>
          Replay all tutorials
        </Button>
      </CardContent>
    </Card>
  );
}

function AppearanceCard() {
  const { prefs, isLoading, save } = usePreferences();
  const { theme, setTheme } = useTheme();
  const themes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ] as const;
  return (
    <Card>
      <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize how the platform looks. Follows the device theme when set to System.</CardDescription></CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => {
            const active = (prefs?.appearance ?? theme) === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); save.mutate({ appearance: t.id }); }}
                disabled={isLoading}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                  active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                )}
              >
                <t.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
