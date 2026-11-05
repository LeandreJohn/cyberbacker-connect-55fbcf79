// API-ready service layer.
//
// These async functions currently resolve mock data, but their signatures and
// return shapes mirror the future FastAPI REST endpoints. To switch to the live
// backend, set VITE_API_BASE and replace each `mock(...)` call with the matching
// `fetchJson(...)` call already stubbed in comments below.

import * as mock from "./mock";
import { isDemoSession } from "@/lib/demo-auth";
import type {
  ActivityItem,
  Announcement,
  Article,
  AttendanceEntry,
  AuditEntry,
  Candidate,
  ClientAccount,
  Contract,
  CurrentUser,
  Cyberbacker,
  FunnelStep,
  GrowthPoint,
  Invoice,
  KbCategory,
  KpiStat,
  Notification,
  PaymentMethod,
  PerformancePoint,
  PipelineCandidate,
  Renewal,
  RetentionPoint,
  RevenuePoint,
  Reward,
  SystemUser,
  Ticket,
  TicketVolumePoint,
} from "./types";

export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

// Simulate network latency so loading states are visible.
function mockResponse<T>(data: T, delay = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

/**
 * Backend-uncovered pages show empty data for real accounts; the two demo
 * profiles get the full fixtures. The Cyberbacker roster stays ungated — it is
 * the approved name source for reviews and endorsements.
 */
function gated<T>(data: T, empty: T): Promise<T> {
  return mockResponse(isDemoSession() ? data : empty, isDemoSession() ? 250 : 0);
}

// Real implementation to use once FastAPI is connected:
// async function fetchJson<T>(path: string): Promise<T> {
//   const res = await fetch(`${API_BASE}${path}`, {
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//   });
//   if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
//   return (await res.json()) as T;
// }

export const getCurrentUser = (): Promise<CurrentUser> => mockResponse(mock.currentUser);
export const getDashboardStats = (): Promise<KpiStat[]> => gated(mock.dashboardStats, []);
export const getActivityFeed = (): Promise<ActivityItem[]> => gated(mock.activityFeed, []);
export const getCyberbackers = (): Promise<Cyberbacker[]> => mockResponse(mock.cyberbackers);
export const getCandidates = (): Promise<Candidate[]> => gated(mock.candidates, []);
export const getAttendance = (): Promise<AttendanceEntry[]> => gated(mock.attendance, []);
export const getPerformanceTrend = (): Promise<PerformancePoint[]> =>
  gated(mock.performanceTrend, []);
export const getTickets = (): Promise<Ticket[]> => gated(mock.tickets, []);
export const getKbCategories = (): Promise<KbCategory[]> => gated(mock.kbCategories, []);
export const getArticles = (): Promise<Article[]> => gated(mock.articles, []);
export const getContracts = (): Promise<Contract[]> => gated(mock.contracts, []);
export const getInvoices = (): Promise<Invoice[]> => gated(mock.invoices, []);
export const getPaymentMethods = (): Promise<PaymentMethod[]> =>
  gated(mock.paymentMethods, []);
export const getRewards = (): Promise<Reward[]> => gated(mock.rewards, []);
export const getClientAccounts = (): Promise<ClientAccount[]> =>
  gated(mock.clientAccounts, []);
export const getPipeline = (): Promise<PipelineCandidate[]> => gated(mock.pipeline, []);
export const getRevenueTrend = (): Promise<RevenuePoint[]> => gated(mock.revenueTrend, []);
export const getAcquisitionFunnel = (): Promise<FunnelStep[]> =>
  gated(mock.acquisitionFunnel, []);
export const getGrowthTrend = (): Promise<GrowthPoint[]> => gated(mock.growthTrend, []);
export const getTicketVolume = (): Promise<TicketVolumePoint[]> =>
  gated(mock.ticketVolume, []);
export const getRetentionTrend = (): Promise<RetentionPoint[]> =>
  gated(mock.retentionTrend, []);
export const getSystemUsers = (): Promise<SystemUser[]> => gated(mock.systemUsers, []);
export const getAuditLog = (): Promise<AuditEntry[]> => gated(mock.auditLog, []);
export const getNotifications = (): Promise<Notification[]> => gated(mock.notifications, []);
export const getRenewals = (): Promise<Renewal[]> => gated(mock.renewals, []);
export const getAnnouncements = (): Promise<Announcement[]> => gated(mock.announcements, []);

// ---- Reviews (mock, in-memory) ----
import type { Review } from "./types";
let reviewStore: Review[] | null = null;
function reviewsSeed(): Review[] {
  const base = mock.cyberbackers.slice(0, 5);
  const comments = [
    "Consistently delivers ahead of schedule and communicates proactively.",
    "Great attention to detail on client reports. Occasional delays on Fridays.",
    "Handles our inbox and calendar flawlessly — a real asset to the team.",
    "Quick learner, adapted to our CRM within a week.",
    "Reliable and friendly; would love a bit more initiative on follow-ups.",
    "Outstanding quality on listing descriptions and social posts.",
  ];
  const out: Review[] = [];
  const months = ["2026-05-12", "2026-06-10", "2026-07-08", "2026-08-14", "2026-09-11", "2026-10-01"];
  base.forEach((cb, i) => {
    months.forEach((d, j) => {
      if ((i + j) % 2 === 0 || j > 3) {
        const s = 3 + ((i + j) % 3);
        out.push({
          id: `rv-${cb.id}-${j}`,
          cyberbackerId: cb.id,
          cyberbackerName: cb.name,
          overall: s,
          communication: Math.min(5, s + (j % 2)),
          quality: s,
          reliability: Math.max(3, s - (i % 2)),
          timeliness: s,
          comment: comments[(i + j) % comments.length],
          recommend: s >= 4,
          date: d,
          author: "Jordan Avery",
        });
      }
    });
  });
  return out.sort((a, b) => b.date.localeCompare(a.date));
}
export const getReviews = (): Promise<Review[]> => {
  reviewStore ??= reviewsSeed();
  return mockResponse([...reviewStore]);
};
export const submitReview = (r: Omit<Review, "id" | "date" | "author">): Promise<Review> => {
  reviewStore ??= reviewsSeed();
  const review: Review = { ...r, id: `rv-${Date.now()}`, date: new Date().toISOString().slice(0, 10), author: "Jordan Avery" };
  reviewStore = [review, ...reviewStore];
  return mockResponse(review);
};
