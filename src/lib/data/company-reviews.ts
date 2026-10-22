export const COMPANY_CATEGORIES = [
  { key: "service", label: "Service quality" },
  { key: "communication", label: "Communication" },
  { key: "matching", label: "Recruiting & matching" },
  { key: "support", label: "Support responsiveness" },
  { key: "value", label: "Value for money" },
] as const;
export type CompanyCategory = (typeof COMPANY_CATEGORIES)[number]["key"];
export interface CompanyReview { id: string; overall: number; scores: Record<CompanyCategory, number>; expectations?: number; comment: string; recommend: boolean; date: string; author: string; }

const KEY = "cb-company-reviews";
const SEED: CompanyReview[] = [
  { id: "cr1", overall: 5, scores: { service: 5, communication: 5, matching: 4, support: 5, value: 5 }, comment: "Onboarding was smooth and our account manager checks in every month.", recommend: true, date: "2026-09-18", author: "Jordan Avery" },
  { id: "cr2", overall: 4, scores: { service: 4, communication: 4, matching: 4, support: 3, value: 5 }, comment: "Great talent. Ticket replies could be a little faster on weekends.", recommend: true, date: "2026-06-04", author: "Jordan Avery" },
];
// Browser-stored until the FastAPI backend provides company reviews.
export function getCompanyReviews(): CompanyReview[] {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : SEED; } catch { return SEED; }
}
export function addCompanyReview(review: Omit<CompanyReview, "id" | "date">): CompanyReview[] {
  const next = [{ ...review, id: `cr-${Date.now()}`, date: new Date().toISOString().slice(0, 10) }, ...getCompanyReviews()];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
