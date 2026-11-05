import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlarmClock, CircleDot, Inbox, ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CreateTicketModal } from "@/components/support/CreateTicketModal";
import { TicketList } from "@/components/support/TicketList";
import { TicketDetailPanel, TicketDetailSkeleton } from "@/components/support/TicketDetailPanel";
import { portalQ } from "@/lib/api/queries";
import type { TicketFilters } from "@/lib/api/support";
import type { TicketDetail } from "@/lib/types";

export const Route = createFileRoute("/_app/internal/tickets")({
  head: () => ({
    meta: [
      { title: "Support Ticket Management — Cyberbacker" },
      { name: "description", content: "Triage and resolve client support tickets with SLA tracking." },
    ],
  }),
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(portalQ.ticketSummary(true));
    void context.queryClient.ensureQueryData(portalQ.tickets({}, true));
  },
  component: TicketManagement,
});

function TicketManagement() {
  const queryClient = useQueryClient();
  const summary = useQuery(portalQ.ticketSummary(true));
  const [filters, setFilters] = useState<TicketFilters>({});
  const tickets = useQuery(portalQ.tickets(filters, true));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const detail = useQuery({ ...portalQ.ticket(selectedId ?? 0, true), enabled: selectedId !== null });

  const select = (id: number) => {
    setSelectedId(id);
    // The mobile sheet only exists below lg; on desktop the detail panel is shown inline.
    if (!window.matchMedia("(min-width: 1024px)").matches) setMobileOpen(true);
  };

  const onUpdated = (d: TicketDetail) => {
    queryClient.setQueryData(["support-ticket", true, d.id], d);
    void queryClient.invalidateQueries({ queryKey: ["support-tickets", true] });
    void queryClient.invalidateQueries({ queryKey: ["support-summary", true] });
  };

  const s = summary.data;
  const active = s ? s.open + s.in_progress + s.pending_client : 0;
  const urgent = (tickets.data ?? []).filter((t) => t.priority === "urgent").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Ticket Management"
        description="Triage, assign and resolve client tickets"
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Tickets" value={s ? String(s.total) : "—"} icon={Inbox} />
        <StatCard label="Needs Action" value={String(active)} icon={CircleDot} hint="open · in progress · pending" />
        <StatCard label="Urgent" value={String(urgent)} icon={ShieldAlert} hint="high priority" />
        <StatCard label="Resolved" value={s ? String(s.resolved) : "—"} icon={AlarmClock} hint="all time" />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[minmax(0,400px)_1fr]">
          <div className="lg:border-r lg:border-border">
            <TicketList
              tickets={tickets.data ?? []}
              filters={filters}
              onFiltersChange={setFilters}
              isPending={tickets.isPending}
              selectedId={selectedId ?? undefined}
              onSelect={(t) => select(t.id)}
              showRequester
              className="h-[680px]"
            />
          </div>
          <div className="hidden lg:block">
            {selectedId === null ? (
              <div className="flex h-[680px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <Inbox className="h-10 w-10" />
                <p className="text-sm">Select a ticket from the queue.</p>
              </div>
            ) : detail.isPending ? (
              <TicketDetailSkeleton className="h-[680px]" />
            ) : detail.data ? (
              <TicketDetailPanel detail={detail.data} admin onUpdated={onUpdated} className="h-[680px] p-5" />
            ) : null}
          </div>
        </div>
      </Card>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto p-5 sm:max-w-md lg:hidden">
          {selectedId !== null && detail.data && (
            <TicketDetailPanel detail={detail.data} admin onUpdated={onUpdated} className="h-full" />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
