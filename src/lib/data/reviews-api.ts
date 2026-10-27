import { apiFetch } from "@/lib/api/client";
import type { Review } from "@/lib/data/types";
import type { CompanyCategory, CompanyReview } from "@/lib/data/company-reviews";

const BASE = "/api/v1/cb_client_portal";

/** App ids are text like "cb3"; the backend expects the integer part. */
export function toBackendId(id: string): number {
  const n = Number(id.replace(/\D/g, ""));
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid Cyberbacker id: ${id}`);
  return n;
}
export const fromBackendId = (n: number) => `cb${n}`;

export interface CyberbackerReviewCreate {
  cyberbacker_id: number;
  overall_rating: number;
  communication_rating: number | null;
  quality_rating: number | null;
  reliability_rating: number | null;
  timeliness_rating: number | null;
  meets_expectations: number;
  comments: string | null;
  would_recommend: boolean;
}

export function toCyberbackerPayload(r: Omit<Review, "id" | "date" | "author">): CyberbackerReviewCreate {
  return {
    cyberbacker_id: toBackendId(r.cyberbackerId),
    overall_rating: r.overall,
    communication_rating: r.communication || null,
    quality_rating: r.quality || null,
    reliability_rating: r.reliability || null,
    timeliness_rating: r.timeliness || null,
    meets_expectations: r.expectations ?? r.overall,
    comments: r.comment.trim() || null,
    would_recommend: r.recommend,
  };
}

interface CbReviewItem { id: number; cyberbacker_id: number; cyberbacker_name: string; overall_rating: number; meets_expectations: number; comments: string | null; would_recommend: boolean; created_at: string }
export interface CbSummary { id: number; name: string; initials: string; position: string; average_rating: number; review_count: number }
export interface TrendPoint { month: string; average_rating: number }

export async function postCyberbackerReview(r: Omit<Review, "id" | "date" | "author">): Promise<void> {
  await apiFetch(`${BASE}/cb_rate`, { method: "POST", body: JSON.stringify(toCyberbackerPayload(r)) });
}

export async function fetchCyberbackerReviews(nameFor: (id: string) => string): Promise<Review[]> {
  const items = await apiFetch<CbReviewItem[]>(`${BASE}/cb_reviews?limit=100`);
  return items.map((i) => {
    const id = fromBackendId(i.cyberbacker_id);
    return {
      id: String(i.id), cyberbackerId: id, cyberbackerName: i.cyberbacker_name || nameFor(id),
      overall: i.overall_rating, communication: 0, quality: 0, reliability: 0, timeliness: 0,
      expectations: i.meets_expectations, comment: i.comments ?? "", recommend: i.would_recommend,
      date: i.created_at.slice(0, 10), author: "",
    };
  });
}
export const fetchCyberbackerSummary = () => apiFetch<CbSummary[]>(`${BASE}/cb_ratings`);
export const fetchRatingTrend = () => apiFetch<TrendPoint[]>(`${BASE}/cb_rating_trend?months=6`);

const COMPANY_FIELDS: Record<CompanyCategory, string> = {
  service: "service_quality_rating", communication: "communication_rating", matching: "recruiting_matching_rating",
  support: "support_responsiveness_rating", value: "value_for_money_rating",
};

export function toCompanyPayload(r: { overall: number; scores: Record<CompanyCategory, number>; expectations: number; comment: string; recommend: boolean }) {
  const out: Record<string, unknown> = { overall_rating: r.overall, meets_expectations: r.expectations, comments: r.comment.trim() || null, would_recommend: r.recommend };
  (Object.keys(COMPANY_FIELDS) as CompanyCategory[]).forEach((k) => { out[COMPANY_FIELDS[k]] = r.scores[k] || null; });
  return out;
}

export async function postCompanyReview(r: Parameters<typeof toCompanyPayload>[0]): Promise<void> {
  await apiFetch(`${BASE}/company_rate`, { method: "POST", body: JSON.stringify(toCompanyPayload(r)) });
}

export async function fetchCompanyReviews(): Promise<{ average: number; total: number; reviews: CompanyReview[] }> {
  const data = await apiFetch<{ average_rating: number | null; total_reviews: number; reviews: Array<Record<string, unknown>> }>(`${BASE}/company_reviews?limit=50`);
  return {
    average: data.average_rating ?? 0,
    total: data.total_reviews,
    reviews: data.reviews.map((r) => ({
      id: String(r.id),
      overall: r.overall_rating as number,
      scores: Object.fromEntries((Object.keys(COMPANY_FIELDS) as CompanyCategory[]).map((k) => [k, (r[COMPANY_FIELDS[k]] as number | null) ?? 0])) as Record<CompanyCategory, number>,
      expectations: r.meets_expectations as number,
      comment: (r.comments as string | null) ?? "",
      recommend: Boolean(r.would_recommend),
      date: String(r.created_at),
      author: String(r.client_email ?? ""),
    })),
  };
}
