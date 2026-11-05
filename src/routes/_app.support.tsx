import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleDot, Loader2, Clock, CheckCircle2, Inbox } from "lucide-react";

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

export const Route = createFileRoute("/_app/support")({
  head: () => ({
    meta: [
      { title: "Support Center — Cyberbacker" },
      { name: "description", content: "Open and track support tickets with the Cyberbacker team." },
    ],
  }),
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(portalQ.ticketSummary(false));
    void context.queryClient.ensureQueryData(portalQ.tickets({}, false));
  },
  component: Support,
});

function Support() {
  const queryClient = useQueryClient();
  const summary = useQuery(portalQ.ticketSummary(false));
  const [filters, setFilters] = useState<TicketFilters>({});
  const tickets = useQuery(portalQ.tickets(filters, false));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Detail is fetched only when a ticket is opened — never prefetched — and
  // every open counts one view.
  const detail = useQuery({ ...portalQ.ticket(selectedId ?? 0, false), enabled: selectedId !== null });

  const select = (id: number) => {
    setSelectedId(id);
    setMobileOpen(true);
  };

  const onUpdated = (d: TicketDetail) => {
    queryClient.setQueryData(["support-ticket", false, d.id], d);
    void queryClient.invalidateQueries({ queryKey: ["support-tickets", false] });
    void queryClient.invalidateQueries({ queryKey: ["support-summary", false] });
  };

  const s = summary.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Center"
        description="Get help and track your requests"
        actions={<CreateTicketModal onCreated={onUpdated} />}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Open" value={s ? String(s.open) : "—"} icon={CircleDot} hint="awaiting reply" />
        <StatCard label="In Progress" value={s ? String(s.in_progress) : "—"} icon={Loader2} />
        <StatCard label="Pending Client" value={s ? String(s.pending_client) : "—"} icon={Clock} hint="needs your input" />
        <StatCard label="Resolved" value={s ? String(s.resolved) : "—"} icon={CheckCircle2} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[minmax(0,380px)_1fr]">
          <div className="lg:border-r lg:border-border">
            <TicketList
              tickets={tickets.data ?? []}
              filters={filters}
              onFiltersChange={setFilters}
              isPending={tickets.isPending}
              selectedId={selectedId ?? undefined}
              onSelect={(t) => select(t.id)}
              className="h-[640px]"
            />
          </div>
          {/* Desktop detail */}
          <div className="hidden lg:block">
            {selectedId === null ? (
              <EmptyDetail />
            ) : detail.isPending ? (
              <TicketDetailSkeleton className="h-[640px]" />
            ) : detail.data ? (
              <TicketDetailPanel detail={detail.data} onUpdated={onUpdated} className="h-[640px] p-5" />
            ) : null}
          </div>
        </div>
      </Card>

      {/* Mobile detail in a sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto p-5 sm:max-w-md lg:hidden">
          {selectedId !== null && detail.data && (
            <TicketDetailPanel detail={detail.data} onUpdated={onUpdated} className="h-full" />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="flex h-[640px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
      <Inbox className="h-10 w-10" />
      <p className="text-sm">Select a ticket to view the conversation.</p>
    </div>
  );
}
