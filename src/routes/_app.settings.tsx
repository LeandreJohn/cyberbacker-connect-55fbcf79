import { createFileRoute } from "@tanstack/react-router";
import { Monitor, Moon, Sun } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { useDemoAccount } from "@/lib/demo-auth";
import { useState } from "react";
import { toast } from "sonner";
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

const notifPrefs = [
  { id: "weekly", label: "Weekly reports", desc: "Summary of your team's output", on: true },
  { id: "tickets", label: "Ticket updates", desc: "Replies to your support tickets", on: true },
  { id: "billing", label: "Billing reminders", desc: "Upcoming and overdue invoices", on: true },
  { id: "marketing", label: "Product news", desc: "New features and announcements", on: false },
];

function Settings() {
  const user = useDemoAccount();
  const { theme, setTheme } = useTheme();
  if (!user) return null;

  const themes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Change password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile information</CardTitle>
              <CardDescription>Update your personal and company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <InitialsAvatar initials={user.initials} size="lg" />
                <Button variant="outline" size="sm">
                  Change avatar
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" defaultValue={user.name} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user.email} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" defaultValue={user.company} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue={user.title} disabled />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password"><ChangePasswordCard /></TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {notifPrefs.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-4 first:pt-0">
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                  </div>
                  <Switch defaultChecked={p.on} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the platform looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {themes.map((t) => {
                  const active = theme === t.id || (t.id === "system" && false);
                  return (
                    <button
                      key={t.id}
                      onClick={() => t.id !== "system" && setTheme(t.id)}
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
        </TabsContent>
      </Tabs>
    </div>
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
    setF({ current: "", next: "", confirm: "" });
    toast.success("Password updated");
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
