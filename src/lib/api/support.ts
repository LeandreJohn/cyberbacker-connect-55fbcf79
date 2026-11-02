// Support Center endpoints, client and admin sides.
import { apiFetch } from "@/lib/api/client";
import type { TicketDetail, TicketListItem, TicketSummary, TicketUpdate } from "@/lib/types";

const CP = "/api/v1/cb_client_portal";
const AP = "/api/v1/cb_admin_portal";

export interface TicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  assignee?: string;
  limit?: number;
  offset?: number;
}

function qs(filters: TicketFilters, includeAssignee: boolean): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.search) params.set("search", filters.search);
  if (includeAssignee && filters.assignee) params.set("assignee", filters.assignee);
  params.set("limit", String(filters.limit ?? 50));
  if (filters.offset) params.set("offset", String(filters.offset));
  return params.toString();
}

export function fetchTicketSummary(admin = false): Promise<TicketSummary> {
  return apiFetch<TicketSummary>(`${admin ? AP : CP}/support/summary`);
}

export function fetchTickets(filters: TicketFilters = {}, admin = false): Promise<TicketListItem[]> {
  return apiFetch<TicketListItem[]>(`${admin ? AP : CP}/support/tickets?${qs(filters, admin)}`);
}

export function fetchTicket(id: number, admin = false): Promise<TicketDetail> {
  return apiFetch<TicketDetail>(`${admin ? AP : CP}/support/tickets/${id}`);
}

export interface CreateTicketInput {
  subject: string;
  category: string;
  priority: string;
  description: string;
  files: File[];
}

export function createTicket(input: CreateTicketInput): Promise<TicketDetail> {
  const form = new FormData();
  form.set("subject", input.subject);
  form.set("category", input.category);
  form.set("priority", input.priority);
  form.set("description", input.description);
  input.files.forEach((f) => form.append("files", f));
  return apiFetch<TicketDetail>(`${CP}/support/tickets`, { method: "POST", body: form });
}

export interface ReplyInput {
  body: string;
  files: File[];
  isInternal?: boolean;
}

export function replyToTicket(id: number, input: ReplyInput, admin = false): Promise<TicketDetail> {
  const form = new FormData();
  form.set("body", input.body);
  if (admin && input.isInternal) form.set("is_internal", "true");
  input.files.forEach((f) => form.append("files", f));
  return apiFetch<TicketDetail>(`${admin ? AP : CP}/support/tickets/${id}/reply`, { method: "POST", body: form });
}

export function resolveTicket(id: number): Promise<TicketDetail> {
  return apiFetch<TicketDetail>(`${CP}/support/tickets/${id}/resolve`, { method: "POST" });
}

export function patchTicket(id: number, patch: TicketUpdate): Promise<TicketDetail> {
  return apiFetch<TicketDetail>(`${AP}/support/tickets/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
