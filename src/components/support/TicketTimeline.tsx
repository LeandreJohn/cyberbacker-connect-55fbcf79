import {
  CircleDot,
  RefreshCw,
  UserCog,
  Flag,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { TicketEvent } from "@/lib/types";

const iconFor: Record<TicketEvent["event_type"], LucideIcon> = {
  created: CircleDot,
  replied: MessageSquare,
  status_changed: RefreshCw,
  priority_changed: Flag,
  reassigned: UserCog,
};

const prefixFor: Record<TicketEvent["event_type"], string> = {
  created: "Ticket created",
  replied: "New reply",
  status_changed: "Status",
  priority_changed: "Priority",
  reassigned: "Assigned to",
};

export function TicketTimeline({
  events,
  className,
}: {
  events: TicketEvent[];
  className?: string;
}) {
  if (!events.length) {
    return <p className={cn("text-sm text-muted-foreground", className)}>No activity yet.</p>;
  }
  return (
    <ol className={cn("relative space-y-5", className)}>
      {events.map((event, i) => {
        const Icon = iconFor[event.event_type];
        const isLast = i === events.length - 1;
        const change = event.old_value && event.new_value ? `${event.old_value} → ${event.new_value}` : event.new_value ?? "";
        return (
          <li key={`${event.event_type}-${event.created_at}-${i}`} className="relative flex gap-3.5 pl-1">
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[15px] top-7 h-[calc(100%+4px)] w-px bg-border"
              />
            )}
            <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-medium text-foreground">
                {prefixFor[event.event_type]}
                {change ? `: ${change}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {event.actor_name} · {new Date(event.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
