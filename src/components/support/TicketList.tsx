import { useMemo } from "react";
import { Search, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import { StatusBadge, toneFor } from "@/components/shared/StatusBadge";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TicketFilters } from "@/lib/api/support";
import type { TicketListItem, TicketStatus } from "@/lib/types";

const statusTabs: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending_client", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const CATEGORY_OPTIONS = ["billing", "account", "onboarding", "reports", "technical"];

export function TicketList({
  tickets,
  filters,
  onFiltersChange,
  selectedId,
  onSelect,
  isPending = false,
  showRequester = false,
  className,
}: {
  tickets: TicketListItem[];
  filters: TicketFilters;
  onFiltersChange: (f: TicketFilters) => void;
  selectedId?: number;
  onSelect: (t: TicketListItem) => void;
  isPending?: boolean;
  showRequester?: boolean;
  className?: string;
}) {
  // Status lives in `filters.status`; "all" means no status filter.
  const status = filters.status ?? "all";

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tickets) map[t.status] = (map[t.status] ?? 0) + 1;
    return map;
  }, [tickets]);

  const setFilter = (patch: Partial<TicketFilters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="space-y-3 border-b border-border p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search ?? ""}
            onChange={(e) => setFilter({ search: e.target.value || undefined })}
            placeholder="Search tickets…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filters.category ?? "all"} onValueChange={(v) => setFilter({ category: v === "all" ? undefined : v })}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.priority ?? "all"} onValueChange={(v) => setFilter({ priority: v === "all" ? undefined : v })}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {["urgent", "high", "medium", "low"].map((p) => (
                <SelectItem key={p} value={p} className="capitalize">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Tabs value={status} onValueChange={(v) => setFilter({ status: v === "all" ? undefined : (v as TicketStatus) })}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
            {statusTabs.map((s) => (
              <TabsTrigger
                key={s.value}
                value={s.value}
                className="h-7 rounded-full border border-border px-2.5 text-xs data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {s.label}
                {s.value === "all" && ` · ${tickets.length}`}
                {s.value !== "all" && counts[s.value] ? ` · ${counts[s.value]}` : ""}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isPending ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
            <Inbox className="h-8 w-8" />
            <p className="text-sm">No tickets match your filters.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {tickets.map((t) => {
              const active = t.id === selectedId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(t)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent",
                      active && "bg-accent",
                    )}
                  >
                    {showRequester && (
                      <InitialsAvatar initials={t.requester_initials} size="sm" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium">{t.subject}</p>
                        <StatusBadge
                          label={t.priority}
                          tone={toneFor(t.priority)}
                          dot={false}
                          className="shrink-0"
                        />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {t.code} · {showRequester ? `${t.requester_name} · ` : ""}
                        {t.category} · updated {new Date(t.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <div className="mt-1.5">
                        <StatusBadge label={t.status_label} tone={toneFor(t.status)} />
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
