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
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { PayInvoiceDialog } from "@/components/billing/PayInvoiceDialog";
import { canDownloadReceipt, canPay, isAwaitingAutopay, useAutopay } from "@/lib/billing";
import type { Invoice } from "@/lib/data/types";

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
  const [paidIds, setPaidIds] = useState<string[]>([]);
  const [paying, setPaying] = useState<Invoice | null>(null);
  const [autopay, setAutopay] = useAutopay();
  const rows = invoices.map((i) => (paidIds.includes(i.id) ? { ...i, status: "paid" as const } : i));
  const due = rows.find((i) => i.status === "due" || i.status === "sent" || i.status === "overdue");

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle>Invoice history</CardTitle>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch checked={autopay} onCheckedChange={setAutopay} aria-label="Automatic payments" />
              Automatic payments {autopay ? "on" : "off"}
            </label>
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
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.number}</TableCell>
                      <TableCell className="text-muted-foreground">{i.period}</TableCell>
                      <TableCell className="tabular-nums">${i.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <StatusBadge label={prettify(i.status)} tone={toneFor(i.status)} />
                      </TableCell>
                      <TableCell className="text-right">
                        {canPay(i, autopay) && (
                          <Button size="sm" onClick={() => setPaying(i)}>Pay</Button>
                        )}
                        {isAwaitingAutopay(i, autopay) && (
                          <span className="text-xs text-muted-foreground">Auto-pay scheduled</span>
                        )}
                        {canDownloadReceipt(i) && (
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <Download className="mr-1.5 h-4 w-4" /> Receipt
                          </Button>
                        )}
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
      <PayInvoiceDialog invoice={paying} onClose={() => setPaying(null)} onPaid={(id) => setPaidIds((p) => [...p, id])} />
    </div>
  );
}
