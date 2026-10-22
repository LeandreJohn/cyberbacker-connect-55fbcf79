import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  DollarSign,
  Smile,
  TicketCheck,
  UserSquare,
  Workflow,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge, toneFor, prettify } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GroupedBarChart,
  SimpleLineChart,
  TrendAreaChart,
  chartColors,
} from "@/components/charts/Charts";
import { q } from "@/lib/data/queries";

export const Route = createFileRoute("/_app/internal/")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — Cyberbacker" },
      {
        name: "description",
        content: "Cross-department operations command center: clients, talent, support and finance.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q.clientAccounts());
    context.queryClient.ensureQueryData(q.cyberbackers());
    context.queryClient.ensureQueryData(q.tickets());
    context.queryClient.ensureQueryData(q.revenueTrend());
    context.queryClient.ensureQueryData(q.pipeline());
    context.queryClient.ensureQueryData(q.invoices());
    context.queryClient.ensureQueryData(q.ticketVolume());
    context.queryClient.ensureQueryData(q.retentionTrend());
  },
  component: Operations,
});

const CSAT = 4.7;

function MiniStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function DrillHeader({
  title,
  to,
}: {
  title: string;
  to: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button variant="outline" size="sm" asChild>
        <Link to={to}>
          View full dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function Operations() {
  const { data: clients } = useSuspenseQuery(q.clientAccounts());
  const { data: cyberbackers } = useSuspenseQuery(q.cyberbackers());
  const { data: tickets } = useSuspenseQuery(q.tickets());
  const { data: revenue } = useSuspenseQuery(q.revenueTrend());
  const { data: pipeline } = useSuspenseQuery(q.pipeline());
  const { data: invoices } = useSuspenseQuery(q.invoices());
  const { data: ticketVolume } = useSuspenseQuery(q.ticketVolume());
  const { data: retention } = useSuspenseQuery(q.retentionTrend());

  const activeClients = clients.filter((c) => c.status === "active").length;
  const atRiskClients = clients.filter((c) => c.status === "at_risk");
  const activeCb = cyberbackers.filter((c) => c.status === "active").length;
  const openTickets = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress" || t.status === "pending_client",
  );
  const mrr = clients.reduce((s, c) => s + c.mrr, 0);
  const placedCount = pipeline.filter((p) => p.stage === "placed").length;
  const offerCount = pipeline.filter((p) => p.stage === "offer").length;
  const outstanding = invoices
    .filter((i) => i.status === "due" || i.status === "overdue")
    .reduce((s, i) => s + i.amount, 0);
  const latestRetention = retention[retention.length - 1];
  const topPipeline = [...pipeline].sort((a, b) => b.score - a.score).slice(0, 5);
  const recentTickets = openTickets.slice(0, 5);
  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Dashboard"
        description="Cross-department command center across talent, clients, support and finance"
        actions={
          <Badge className="bg-success/12 text-success hover:bg-success/12">Live · Jun 2026</Badge>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Active Clients" value={String(activeClients)} change={7.2} trend="up" icon={Building2} />
        <StatCard label="Active Cyberbackers" value={String(activeCb)} change={4.6} trend="up" icon={UserSquare} />
        <StatCard label="Open Tickets" value={String(openTickets.length)} change={-3.1} trend="down" icon={TicketCheck} hint="across all clients" />
        <StatCard label="Revenue (MRR)" value={`$${(mrr / 1000).toFixed(1)}k`} change={6.9} trend="up" icon={DollarSign} />
        <StatCard label="Client Satisfaction" value={`${CSAT} / 5`} change={2.1} trend="up" icon={Smile} hint="CSAT" />
      </div>


      <Card>
        <CardHeader className="flex-row items-center justify-between"><CardTitle>Upcoming client renewals</CardTitle><Link to="/internal/clients" className="text-sm text-primary hover:underline">All clients</Link></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs text-muted-foreground"><tr><th className="px-6 py-3 font-medium">Client</th><th className="px-6 py-3 font-medium">Plan</th><th className="px-6 py-3 font-medium">Renewal date</th><th className="px-6 py-3 text-right font-medium">Days left</th></tr></thead>
            <tbody>
              {clients.filter((c) => c.status !== "churned").map((c) => ({ ...c, days: Math.ceil((new Date(c.renewalDate).getTime() - Date.now()) / 86400000) })).sort((a, b) => a.days - b.days).map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-6 py-3 font-medium">{c.company}</td>
                  <td className="px-6 py-3">{c.plan}</td>
                  <td className="px-6 py-3">{new Date(c.renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="px-6 py-3 text-right"><StatusBadge label={c.days < 0 ? "Overdue" : `${c.days} days`} tone={c.days <= 14 ? "warning" : "neutral"} dot={false} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Tabs defaultValue="recruitment" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="success">Client Success</TabsTrigger>
        </TabsList>

        {/* Recruitment */}
        <TabsContent value="recruitment" className="space-y-4">
          <DrillHeader title="Recruitment" to="/internal/recruitment" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MiniStat label="In Pipeline" value={String(pipeline.length)} />
            <MiniStat label="Offers Out" value={String(offerCount)} />
            <MiniStat label="Placed (90d)" value={String(placedCount)} />
            <MiniStat label="Avg Match Score" value={`${Math.round(pipeline.reduce((s, p) => s + p.score, 0) / pipeline.length)}%`} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Top candidates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topPipeline.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.role} · {p.recruiter}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="tabular-nums text-xs text-muted-foreground">Score {p.score}</span>
                    <StatusBadge label={prettify(p.stage)} tone={toneFor(p.stage)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support */}
        <TabsContent value="support" className="space-y-4">
          <DrillHeader title="Support" to="/internal/tickets" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MiniStat label="Open Tickets" value={String(openTickets.length)} />
            <MiniStat label="Urgent" value={String(tickets.filter((t) => t.priority === "urgent").length)} />
            <MiniStat label="Resolved (Jun)" value={String(ticketVolume[ticketVolume.length - 1]?.resolved ?? 0)} />
            <MiniStat label="CSAT" value={`${CSAT} / 5`} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ticket volume</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleLineChart
                  data={ticketVolume}
                  xKey="month"
                  series={[
                    { key: "opened", color: chartColors[1], label: "Opened" },
                    { key: "resolved", color: chartColors[2], label: "Resolved" },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent open tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentTickets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.subject}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.requester}</p>
                    </div>
                    <StatusBadge label={prettify(t.status)} tone={toneFor(t.status)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Finance */}
        <TabsContent value="finance" className="space-y-4">
          <DrillHeader title="Finance" to="/internal/finance" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MiniStat label="MRR" value={`$${(mrr / 1000).toFixed(1)}k`} />
            <MiniStat label="Payouts" value={`$${(revenue[revenue.length - 1]?.payouts ?? 0) / 1000}k`} hint="this month" />
            <MiniStat label="Outstanding AR" value={`$${(outstanding / 1000).toFixed(1)}k`} hint="due + overdue" />
            <MiniStat label="Gross Margin" value="51%" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <GroupedBarChart
                  data={revenue}
                  xKey="month"
                  series={[
                    { key: "revenue", color: chartColors[1], label: "Revenue" },
                    { key: "payouts", color: chartColors[2], label: "Payouts" },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent invoices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentInvoices.map((i) => (
                  <div key={i.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{i.number}</p>
                      <p className="truncate text-xs text-muted-foreground">{i.period}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="tabular-nums text-xs">${i.amount.toLocaleString()}</span>
                      <StatusBadge label={prettify(i.status)} tone={toneFor(i.status)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Client Success */}
        <TabsContent value="success" className="space-y-4">
          <DrillHeader title="Client Success" to="/internal/clients" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MiniStat label="Active Clients" value={String(activeClients)} />
            <MiniStat label="At Risk" value={String(atRiskClients.length)} />
            <MiniStat label="Retention" value={`${latestRetention?.retention}%`} />
            <MiniStat label="Churn" value={`${latestRetention?.churn}%`} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Retention trend</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendAreaChart
                  data={retention}
                  xKey="month"
                  series={[{ key: "retention", color: chartColors[1], label: "Retention %" }]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Accounts to watch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[...atRiskClients, ...clients.filter((c) => c.status === "churned")].slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.company}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.plan} · {c.contact}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="tabular-nums text-xs text-muted-foreground">Health {c.health}</span>
                      <StatusBadge label={prettify(c.status)} tone={toneFor(c.status)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
