import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Clock,
  Tag,
  User,
  Hash,
  CheckCircle2,
  RefreshCw,
  UserCog,
  Flag,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { StatusBadge, toneFor } from "@/components/shared/StatusBadge";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConversationThread } from "./ConversationThread";
import { TicketTimeline } from "./TicketTimeline";
import { AttachmentList } from "./AttachmentList";
import { patchTicket, replyToTicket, resolveTicket } from "@/lib/api/support";
import type { TicketDetail, TicketStatus } from "@/lib/types";

const statusOptions: TicketStatus[] = [
  "open",
  "in_progress",
  "pending_client",
  "resolved",
  "closed",
];

const AGENTS = ["Support Team", "Aisha Torres", "Marcus Lee", "Priya Nair"];

export function TicketDetailPanel({
  detail,
  admin = false,
  onUpdated,
  className,
}: {
  detail: TicketDetail;
  admin?: boolean;
  onUpdated: (detail: TicketDetail) => void;
  className?: string;
}) {
  const ticket = detail;
  const isAgent = admin;

  const reply = useMutation({
    mutationFn: (input: { body: string; files: File[]; isInternal: boolean }) =>
      replyToTicket(ticket.id, { body: input.body, files: input.files, isInternal: input.isInternal }, admin),
    onSuccess: (d) => onUpdated(d),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't send the reply"),
  });

  const resolve = useMutation({
    mutationFn: () => resolveTicket(ticket.id),
    onSuccess: (d) => { onUpdated(d); toast.success("Ticket marked as resolved"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't resolve the ticket"),
  });

  const patch = useMutation({
    mutationFn: (update: Parameters<typeof patchTicket>[1]) => patchTicket(ticket.id, update),
    onSuccess: (d) => { onUpdated(d); toast.success("Ticket updated"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't update the ticket"),
  });

  const createdLabel = new Date(ticket.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const updatedLabel = new Date(ticket.updated_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const slaLabel = ticket.sla_breached
    ? "SLA breached"
    : ticket.sla_hours_left !== null
      ? `${Math.round(ticket.sla_hours_left)}h SLA left`
      : "SLA met";

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <div className="space-y-3 border-b border-border pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-tight">{ticket.subject}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              {ticket.code} · opened {createdLabel}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge label={ticket.status_label} tone={toneFor(ticket.status)} />
            <StatusBadge label={ticket.priority} tone={toneFor(ticket.priority)} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> {ticket.category}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> {ticket.requester_name}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UserCog className="h-3.5 w-3.5" /> {ticket.assignee}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              (ticket.sla_breached || (ticket.sla_hours_left !== null && ticket.sla_hours_left > 0 && ticket.sla_hours_left <= 4)) && "text-destructive",
            )}
          >
            <Clock className="h-3.5 w-3.5" /> {slaLabel}
          </span>
        </div>

        {/* Actions */}
        {isAgent ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Select
              value={ticket.status}
              onValueChange={(v) => patch.mutate({ status: v as TicketStatus })}
              disabled={patch.isPending}
            >
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <RefreshCw className="h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {ticket.status_label && s === ticket.status ? ticket.status_label : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={ticket.priority}
              onValueChange={(v) => patch.mutate({ priority: v as typeof ticket.priority })}
              disabled={patch.isPending}
            >
              <SelectTrigger className="h-8 w-[130px] text-xs capitalize">
                <Flag className="h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["low", "medium", "high", "urgent"].map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={ticket.assignee}
              onValueChange={(v) => patch.mutate({ assignee: v })}
              disabled={patch.isPending}
            >
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <UserCog className="h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGENTS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {ticket.status !== "resolved" && ticket.status !== "closed" && (
              <Button
                variant="outline"
                size="sm"
                disabled={resolve.isPending}
                onClick={() => resolve.mutate()}
              >
                <CheckCircle2 className="h-4 w-4" /> Mark resolved
              </Button>
            )}
            {ticket.status === "resolved" && (
              <p className="text-xs text-muted-foreground">Resolved — reply reopens the conversation.</p>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="conversation" className="flex min-h-0 flex-1 flex-col pt-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="mt-4 min-h-0 flex-1">
          <ConversationThread
            messages={ticket.messages}
            allowInternalNote={isAgent}
            sending={reply.isPending}
            onSend={(body, files, isInternal) => reply.mutate({ body, files, isInternal })}
            className="h-full"
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-4 min-h-0 flex-1 overflow-y-auto">
          <TicketTimeline events={ticket.events} />
        </TabsContent>

        <TabsContent value="details" className="mt-4 min-h-0 flex-1 space-y-5 overflow-y-auto">
          <div className="flex items-start gap-3">
            <InitialsAvatar initials={ticket.requester_initials} size="sm" />
            <div>
              <p className="text-sm font-medium">{ticket.requester_name}</p>
              <p className="text-xs text-muted-foreground">
                Requester{ticket.requester_email ? ` · ${ticket.requester_email}` : ""}
              </p>
            </div>
          </div>
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {ticket.messages[0]?.body ?? "—"}
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Attachments
            </h3>
            <AttachmentList attachments={detail.messages.flatMap((m) => m.attachments)} />
          </div>
          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            Last updated {updatedLabel}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function TicketDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 p-5", className)}>
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="space-y-2 pt-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    </div>
  );
}
