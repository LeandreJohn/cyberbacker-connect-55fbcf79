// Response/request types from "Cyberbacker Client Portal: API and Database Reference", section 4.
// Do not invent fields — the live /openapi.json is the source of truth.

export type Rating = 1 | 2 | 3 | 4 | 5;
export type TicketStatus = "open" | "in_progress" | "pending_client" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "billing" | "account" | "onboarding" | "reports" | "technical";
export type ArticleStatus = "draft" | "published" | "archived";

// Auth
export interface LoginResponse {
  access_token: string;
  token_type: string;
  email: string;
  name: string;
  position: string | null;
}
export interface UserOut {
  id: number;
  email: string;
  name: string;
  status: string;
  position: string | null;
}
export interface UserCreate {
  email: string;
  password: string;
  name: string;
}

// Reviews
export interface CyberbackerReviewCreate {
  cyberbacker_id: number;
  overall_rating: Rating;
  communication_rating?: Rating;
  quality_rating?: Rating;
  reliability_rating?: Rating;
  timeliness_rating?: Rating;
  meets_expectations: Rating;
  comments?: string;
  would_recommend?: boolean;
}
export interface CyberbackerReviewOut extends CyberbackerReviewCreate {
  id: number;
  client_email: string;
  created_at: string;
}
export interface CyberbackerSummary {
  id: number;
  name: string;
  initials: string;
  position: string;
  average_rating: number | null;
  review_count: number;
}
export interface CyberbackerReviewItem {
  id: number;
  cyberbacker_id: number;
  cyberbacker_name: string;
  overall_rating: number;
  meets_expectations: number;
  expectation_label: string;
  comments: string | null;
  would_recommend: boolean;
  created_at: string;
}
export interface RatingTrendPoint {
  month: string; // YYYY-MM
  average_rating: number;
}
export interface CompanyReviewCreate {
  overall_rating: Rating;
  service_quality_rating?: Rating;
  communication_rating?: Rating;
  recruiting_matching_rating?: Rating;
  support_responsiveness_rating?: Rating;
  value_for_money_rating?: Rating;
  meets_expectations: Rating;
  comments?: string;
  would_recommend?: boolean;
}
export interface CompanyReviewOut extends CompanyReviewCreate {
  id: number;
  client_email: string;
  created_at: string;
}
export interface CompanyReviewItem extends CompanyReviewOut {
  expectation_label: string;
}
export interface CompanyReviewList {
  average_rating: number | null;
  total_reviews: number;
  reviews: CompanyReviewItem[];
}
export interface SkillEndorsement {
  skill: string;
  endorsements: number;
  endorsed_by_me: boolean;
}

// Settings
export interface Profile {
  name: string;
  email: string;
  company: string | null;
  role: string;
  avatar_url: string | null;
  initials: string;
}
export interface ProfileUpdate {
  name: string;
  email: string;
  company?: string | null;
}
export interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}
export interface Preferences {
  appearance: "light" | "dark" | "system";
  kpi_active_cyberbackers: boolean;
  kpi_attendance_rate: boolean;
  kpi_open_support_tickets: boolean;
  kpi_upcoming_renewals: boolean;
  tutorials_enabled: boolean;
  notify_weekly_reports: boolean;
  notify_ticket_updates: boolean;
  notify_billing_reminders: boolean;
  notify_product_news: boolean;
}
export type PreferencesUpdate = Partial<Preferences>;
export interface TutorialState {
  enabled: boolean;
  completed_pages: string[];
}

// Support Center
export interface TicketSummary {
  open: number;
  in_progress: number;
  pending_client: number;
  resolved: number;
  closed: number;
  total: number;
}
export interface TicketListItem {
  id: number;
  code: string; // e.g. "T12"
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  status_label: string;
  assignee: string;
  requester_name: string;
  requester_company: string | null;
  requester_initials: string;
  updated_at: string;
}
export interface Attachment {
  id: number;
  file_name: string;
  content_type: string | null;
  size_bytes: number;
  download_url: string;
}
export interface TicketMessage {
  id: number;
  sender_name: string;
  sender_role: "client" | "admin";
  body: string;
  is_internal: boolean;
  created_at: string;
  attachments: Attachment[];
}
export interface TicketEvent {
  event_type: "created" | "replied" | "status_changed" | "priority_changed" | "reassigned";
  actor_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}
export interface TicketDetail extends TicketListItem {
  created_at: string;
  requester_email: string | null;
  sla_due_at: string | null;
  sla_hours_left: number | null;
  sla_breached: boolean;
  messages: TicketMessage[];
  events: TicketEvent[];
}
export interface TicketUpdate {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignee?: string;
}

// Knowledge Base
export interface KbCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  article_count: number;
}
export interface KbCategoryAdmin extends KbCategory {
  sort_order: number;
  is_active: boolean;
  total_articles: number;
}
export interface KbCategoryCreate {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}
export type KbCategoryUpdate = Partial<Omit<KbCategoryCreate, "slug">>;
export interface KbArticleListItem {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  category_id: number;
  category_slug: string;
  category_name: string;
  view_count: number;
  read_time_minutes: number;
  published_at: string | null;
}
export interface KbArticleDetail extends KbArticleListItem {
  body: string;
  updated_at: string;
}
export interface KbArticleAdminListItem extends KbArticleListItem {
  status: ArticleStatus;
  author_email: string | null;
  created_at: string;
  updated_at: string;
}
export interface KbArticleAdminDetail extends KbArticleAdminListItem {
  body: string;
}
export interface KbArticleCreate {
  category_id: number;
  title: string;
  summary?: string;
  body: string;
  slug?: string;
  status?: ArticleStatus;
  read_time_minutes?: number;
}
export type KbArticleUpdate = Partial<KbArticleCreate>;
export interface KbImportRowResult {
  row: number;
  title: string | null;
  action: "created" | "updated" | "skipped" | "error";
  message: string | null;
}
export interface KbImportReport {
  dry_run: boolean;
  committed: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  rows: KbImportRowResult[];
}
