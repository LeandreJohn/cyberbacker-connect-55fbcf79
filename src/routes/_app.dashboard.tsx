import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarClock,
  Clock,
  Download,
  FilePen,
  LifeBuoy,
  Megaphone,
  RefreshCw,
  Store,
  TicketCheck,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { StatusBadge, toneFor, prettify } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendAreaChart, DonutChart, chartColors } from "@/components/charts/Charts";
import { q } from "@/lib/data/queries";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { JobDescriptionBuilder } from "@/components/jobs/JobDescriptionBuilder";
import logoLight from "@/assets/cyberbacker-logo-light.png";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Client Dashboard — Cyberbacker" },
      {
        name: "description",
        content:
          "Your Cyberbacker team at a glance — active team, attendance, support tickets, renewals and announcements.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q.cyberbackers());
    context.queryClient.ensureQueryData(q.attendance());
    context.queryClient.ensureQueryData(q.tickets());
    context.queryClient.ensureQueryData(q.renewals());
    context.queryClient.ensureQueryData(q.announcements());
    context.queryClient.ensureQueryData(q.activityFeed());
    context.queryClient.ensureQueryData(q.performanceTrend());
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm">
      Failed to load the dashboard: {(error as Error).message}
    </div>
  ),
  component: Dashboard,
});

const tagTone: Record<string, "primary" | "warning" | "success" | "info"> = {
  Product: "primary",
  Maintenance: "warning",
  Community: "success",
  Policy: "info",
};

function currency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function Dashboard() {
  const { data: team } = useSuspenseQuery(q.cyberbackers());
  const { data: attendance } = useSuspenseQuery(q.attendance());
  const { data: tickets } = useSuspenseQuery(q.tickets());
  const { data: renewals } = useSuspenseQuery(q.renewals());
  const { data: announcements } = useSuspenseQuery(q.announcements());
  const { data: activity } = useSuspenseQuery(q.activityFeed());
  const { data: trend } = useSuspenseQuery(q.performanceTrend());

  const activeCount = team.filter((c) => c.status === "active").length;
  const openTickets = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress" || t.status === "pending_client",
  );
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const lateCount = attendance.filter((a) => a.status === "late").length;
  const leaveCount = attendance.filter((a) => a.status === "leave").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const attendanceRate = Math.round(
    ((presentCount + lateCount) / Math.max(attendance.length, 1)) * 100,
  );

  const attendanceSummary = [
    { name: "Present", value: presentCount, color: "var(--color-success)" },
    { name: "Late", value: lateCount, color: "var(--color-warning)" },
    { name: "On leave", value: leaveCount, color: "var(--color-muted-foreground)" },
    { name: "Absent", value: absentCount, color: "var(--color-destructive)" },
  ].filter((d) => d.value > 0);

  const quickActions = [
    { title: "Hire a Cyberbacker", desc: "Browse the marketplace", to: "/marketplace", icon: Store },
    { title: "Submit Support Ticket", desc: "Get help from our team", to: "/support", icon: LifeBuoy },
    { title: "View Attendance", desc: "Today's time logs", to: "/attendance", icon: CalendarClock },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-banner shadow-elegant relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="bg-white/10 pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <img src={logoLight} alt="Cyberbacker" className="mb-4 h-10 w-auto" />
            <h1 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
              Welcome back, Jordan
            </h1>
            <p className="mt-2 text-sm text-primary-foreground/80">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              · Here's how your team is performing today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/marketplace" search={{}}>
                <Store className="mr-1.5 h-4 w-4" /> Hire a Cyberbacker
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20"
              variant="outline"
            >
              <Link to="/support">
                <LifeBuoy className="mr-1.5 h-4 w-4" /> Get Support
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Cyberbackers"
          value={String(activeCount)}
          change={12.5}
          trend="up"
          hint={`${team.length} total on your team`}
          icon={Users}
        />
        <StatCard
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          change={3.2}
          trend="up"
          hint="present this week"
          icon={Clock}
        />
        <StatCard
          label="Open Support Tickets"
          value={String(openTickets.length)}
          change={-25}
          trend="down"
          hint="vs last week"
          icon={TicketCheck}
        />
        <StatCard
          label="Upcoming Renewals"
          value={String(renewals.length)}
          change={0}
          trend="up"
          hint={`next in ${Math.min(...renewals.map((r) => r.daysUntil))} days`}
          icon={RefreshCw}
        />
      </div>

      {/* Performance + Quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Team performance</CardTitle>
            <span className="text-xs text-muted-foreground">Last 6 months</span>
          </CardHeader>
          <CardContent>
            <TrendAreaChart
              data={trend}
              xKey="label"
              series={[
                { key: "productivity", color: chartColors[1], label: "Productivity" },
                { key: "satisfaction", color: chartColors[4], label: "Satisfaction" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <a.icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <FilePen className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Build Job Description</p>
                    <p className="text-xs text-muted-foreground">Tasks, skills & tier</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader><DialogTitle>Job Description Builder</DialogTitle></DialogHeader>
                <JobDescriptionBuilder compact />
              </DialogContent>
            </Dialog>
            <button
              type="button"
              onClick={() =>
                toast.success("Report export started", {
                  description: "Your performance report will be emailed shortly.",
                })
              }
              className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Download className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Download Reports</p>
                <p className="text-xs text-muted-foreground">Export team metrics</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Attendance summary + Activity feed */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Attendance summary</CardTitle>
            <span className="text-xs text-muted-foreground">Today</span>
          </CardHeader>
          <CardContent>
            <DonutChart data={attendanceSummary} height={220} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {attendanceSummary.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span className="text-sm text-muted-foreground">{s.name}</span>
                  <span className="ml-auto text-sm font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map((a) => (
              <div key={a.id} className="flex gap-3">
                <InitialsAvatar initials={a.initials} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Open tickets + Upcoming renewals */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Open support tickets</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/support">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {openTickets.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <LifeBuoy className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.category} · {t.assignedTo}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge label={prettify(t.priority)} tone={toneFor(t.priority)} dot={false} />
                  <span className="text-xs text-muted-foreground">SLA {t.slaHoursLeft}h</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Upcoming renewals</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/contracts">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {renewals.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-powder/40 text-powder-foreground">
                  <CalendarClock className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.plan} · {currency(r.amount)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge label={prettify(r.status)} tone={toneFor(r.status)} dot={false} />
                  <span className="text-xs text-muted-foreground">in {r.daysUntil} days</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent announcements */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-4.5 w-4.5 text-primary" /> Recent announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <StatusBadge label={a.tag} tone={tagTone[a.tag] ?? "neutral"} dot={false} />
                <span className="text-xs text-muted-foreground">{a.date}</span>
              </div>
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">— {a.author}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
