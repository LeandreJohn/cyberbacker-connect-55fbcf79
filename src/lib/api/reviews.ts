// Reviews & Ratings endpoints (client portal).
import { apiFetch } from "@/lib/api/client";
import type {
  CompanyReviewCreate,
  CompanyReviewList,
  CyberbackerReviewCreate,
  CyberbackerReviewItem,
  CyberbackerSummary,
  Rating,
  RatingTrendPoint,
} from "@/lib/types";

const CP = "/api/v1/cb_client_portal";

/** The portal's Cyberbacker list uses ids like "cb3"; review endpoints take numbers. */
export function toBackendId(localId: string): number {
  const n = Number(localId.replace(/\D/g, ""));
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Unmapped Cyberbacker id: ${localId}`);
  return n;
}
export function fromBackendId(id: number): string {
  return `cb${id}`;
}

export function fetchCyberbackerSummaries(): Promise<CyberbackerSummary[]> {
  return apiFetch<CyberbackerSummary[]>(`${CP}/cb_ratings`);
}

export function fetchCyberbackerReviews(options: { cyberbackerId?: number; limit?: number } = {}): Promise<CyberbackerReviewItem[]> {
  const params = new URLSearchParams();
  if (options.cyberbackerId) params.set("cyberbacker_id", String(options.cyberbackerId));
  params.set("limit", String(options.limit ?? 100));
  return apiFetch<CyberbackerReviewItem[]>(`${CP}/cb_reviews?${params}`);
}

export function fetchRatingTrend(options: { months?: number; cyberbackerId?: number } = {}): Promise<RatingTrendPoint[]> {
  const params = new URLSearchParams();
  params.set("months", String(options.months ?? 6));
  if (options.cyberbackerId) params.set("cyberbacker_id", String(options.cyberbackerId));
  return apiFetch<RatingTrendPoint[]>(`${CP}/cb_rating_trend?${params}`);
}

export interface CyberbackerReviewInput {
  cyberbackerId: number;
  overall: number;
  /** Optional 1–5 categories; unset ones are left out of the payload. */
  communication?: number;
  quality?: number;
  reliability?: number;
  timeliness?: number;
  expectations: number;
  comments?: string;
  recommend?: boolean;
}

const asRating = (v: number | undefined): Rating | undefined =>
  v && v >= 1 && v <= 5 ? (Math.round(v) as Rating) : undefined;

export function toCyberbackerPayload(input: CyberbackerReviewInput): CyberbackerReviewCreate {
  const payload: CyberbackerReviewCreate = {
    cyberbacker_id: input.cyberbackerId,
    overall_rating: asRating(input.overall)!,
    meets_expectations: asRating(input.expectations)!,
  };
  const optional = {
    communication_rating: asRating(input.communication),
    quality_rating: asRating(input.quality),
    reliability_rating: asRating(input.reliability),
    timeliness_rating: asRating(input.timeliness),
  } as const;
  for (const [key, value] of Object.entries(optional)) {
    if (value) (payload as Record<string, unknown>)[key] = value;
  }
  const comments = input.comments?.trim();
  if (comments) payload.comments = comments;
  if (input.recommend !== undefined) payload.would_recommend = input.recommend;
  return payload;
}

export function postCyberbackerReview(input: CyberbackerReviewInput): Promise<CyberbackerReviewCreate & { id: number }> {
  return apiFetch(`${CP}/cb_rate`, { method: "POST", body: JSON.stringify(toCyberbackerPayload(input)) });
}

export interface CompanyReviewInput {
  overall: number;
  service?: number;
  communication?: number;
  matching?: number;
  support?: number;
  value?: number;
  expectations: number;
  comments?: string;
  recommend?: boolean;
}

export function toCompanyPayload(input: CompanyReviewInput): CompanyReviewCreate {
  const payload: CompanyReviewCreate = {
    overall_rating: asRating(input.overall)!,
    meets_expectations: asRating(input.expectations)!,
  };
  const optional = {
    service_quality_rating: asRating(input.service),
    communication_rating: asRating(input.communication),
    recruiting_matching_rating: asRating(input.matching),
    support_responsiveness_rating: asRating(input.support),
    value_for_money_rating: asRating(input.value),
  } as const;
  for (const [key, value] of Object.entries(optional)) {
    if (value) (payload as Record<string, unknown>)[key] = value;
  }
  const comments = input.comments?.trim();
  if (comments) payload.comments = comments;
  if (input.recommend !== undefined) payload.would_recommend = input.recommend;
  return payload;
}

export function postCompanyReview(input: CompanyReviewInput): Promise<CompanyReviewCreate & { id: number }> {
  return apiFetch(`${CP}/company_rate`, { method: "POST", body: JSON.stringify(toCompanyPayload(input)) });
}

export function fetchCompanyReviews(limit = 50): Promise<CompanyReviewList> {
  return apiFetch<CompanyReviewList>(`${CP}/company_reviews?limit=${limit}`);
}
