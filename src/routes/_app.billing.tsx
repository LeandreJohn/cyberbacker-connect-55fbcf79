import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CreditCard, Download, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge, toneFor, prettify } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarClock, Wallet } from "lucide-react";
import { q } from "@/lib/data/queries";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({
    meta: [
      { title: "Billing — Cyberbacker" },
      { name: "description", content: "Manage invoices, payment methods and your subscription plan." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q.invoices());
    context.queryClient.ensureQueryData(q.paymentMethods());
  },
  component: Billing,
});

function Billing() {
  const { data: invoices } = useSuspenseQuery(q.invoices());
  const { data: methods } = useSuspenseQuery(q.paymentMethods());
  const due = invoices.find((i) => i.status === "due");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Invoices, payment methods and subscription"
        actions={
          <Button variant="outline">
            <Download className="mr-1.5 h-4 w-4" /> Export all
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Current Plan" value="Scale" icon={Wallet} hint="6 Cyberbackers · billed monthly" />
        <StatCard
          label="Next Invoice"
          value={due ? `$${due.amount.toLocaleString()}` : "—"}
          icon={CalendarClock}
          hint={due ? `Due ${due.dueOn}` : "All paid"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Invoice history</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.number}</TableCell>
                      <TableCell className="text-muted-foreground">{i.period}</TableCell>
                      <TableCell className="tabular-nums">${i.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <StatusBadge label={prettify(i.status)} tone={toneFor(i.status)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Payment methods</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <span className="grid h-9 w-12 place-items-center rounded bg-muted text-xs font-bold">
                  {m.brand}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">•••• {m.last4}</p>
                  <p className="text-xs text-muted-foreground">Expires {m.expiry}</p>
                </div>
                {m.isDefault && (
                  <Badge variant="secondary" className="font-normal">
                    Default
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
