// Domain types for the Cyberbacker Client Success Platform.
// These mirror the shapes the FastAPI REST API will return.

export type Role =
  | "Client"
  | "Recruiter"
  | "Facilitator"
  | "Support Agent"
  | "Finance Team"
  | "Administrator"
  | "Executive";

export type CyberbackerStatus = "active" | "onboarding" | "paused" | "offboarded";
export type AvailabilityStatus = "available" | "interviewing" | "hired";
export type TicketStatus = "open" | "in_progress" | "pending_client" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type ContractStatus = "active" | "pending_signature" | "draft" | "expired";
export type InvoiceStatus = "paid" | "due" | "overdue" | "processing";
export type PipelineStageId =
  | "applied"
  | "screening"
  | "interview"
  | "assessment"
  | "offer"
  | "placed";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  company: string;
  avatarUrl?: string;
  initials: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issuedOn: string;
  expiresOn?: string;
}

export interface ScheduleDay {
  day: string; // Mon, Tue ...
  start: string; // 08:00
  end: string; // 16:00
  hours: number;
}

export interface AttendanceDay {
  date: string;
  status: "present" | "late" | "absent" | "leave";
  hours: number;
}

export interface PerformanceReview {
  period: string;
  reviewer: string;
  score: number; // 0-100
  summary: string;
}

export type TrainingStatus = "completed" | "in_progress" | "assigned";

export interface TrainingRecord {
  title: string;
  status: TrainingStatus;
  completedOn?: string;
  progress: number; // 0-100
}

export type ProfileProficiency = "Basic" | "Intermediate" | "Proficient" | "Expert";

export interface ProfileSkill {
  category: string;
  name: string;
  proficiency: ProfileProficiency;
}

export interface WorkExperienceItem {
  title: string;
  employer: string;
  location: string;
  start: string;
  end: string;
  summary: string;
}

export interface TalentProfile {
  nationality: string;
  languages: string[];
  education: { level: string; school: string; location: string; graduation: string; degree: string };
  preferredIndustry: string;
  preferredRoles: string[];
  availability: string;
  engagement: string;
  experience: WorkExperienceItem[];
  coreSkills: ProfileSkill[];
  tools: Omit<ProfileSkill, "category">[];
  portfolio: string[];
  certifications: { title: string; organization: string; completed: string; expires?: string }[];
  workSetup: { primaryDevice: string; secondaryDevice: string; webcam: boolean; headset: boolean; primaryIsp: string; backupIsp: string; cpu: string; ram: string; storage: string };
  valuesBreakdown: Record<string, number>;
  disc: Record<string, number>;
}

export interface Cyberbacker {
  id: string;
  name: string;
  initials: string;
  role: string;
  status: CyberbackerStatus;
  hoursThisWeek: number;
  weeklyCapacity: number;
  performance: number; // 0-100
  startedOn: string;
  email: string;
  timezone: string;
  skills: string[];
  // Rich management profile (optional so other pages stay valid)
  avatarUrl?: string;
  attendanceRate?: number; // 0-100
  productivity?: number; // 0-100
  tasksCompleted?: number;
  certifications?: Certification[];
  schedule?: ScheduleDay[];
  attendanceHistory?: AttendanceDay[];
  reviews?: PerformanceReview[];
  trainings?: TrainingRecord[];
  bio?: string;
  location?: string;
  profile?: TalentProfile;
}

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  title: string;
  availability: AvailabilityStatus;
  rating: number; // 0-5
  hourlyRate: number;
  yearsExperience: number;
  location: string;
  skills: string[];
  matchScore: number; // 0-100
  industries: string[];
  valuesScore: number; // 0-100 Values Assessment Score
  introVideoUrl?: string; // placeholder; empty for now
  bio: string;
  tools?: string[];
  timezone?: string;
  availabilityHours?: string[];
  workStyle?: "Proactive" | "Reactive" | "Combination";
  languages?: string[];
  certifications?: string[];
  languageProficiency?: Record<string, number>;
  education?: import("@/lib/jobs/matching").EducationLevel;
  functionalExpertise?: string[];
  assessmentScore?: number;
  profile?: TalentProfile;
}

export interface AttendanceEntry {
  id: string;
  cyberbacker: string;
  initials: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  status: "present" | "late" | "absent" | "leave";
}

export interface PerformancePoint {
  label: string;
  productivity: number;
  satisfaction: number;
  hours: number;
}

export type AttachmentType = "image" | "pdf" | "doc" | "sheet" | "file";

export interface TicketAttachment {
  id: string;
  name: string;
  sizeKb: number;
  type: AttachmentType;
}

export interface TicketMessage {
  id: string;
  author: string;
  initials: string;
  role: "client" | "agent";
  body: string;
  time: string;
  internal?: boolean; // internal note, agents only
  attachments?: TicketAttachment[];
}

export type TicketEventType =
  | "created"
  | "status"
  | "assignment"
  | "priority"
  | "comment"
  | "attachment";

export interface TicketEvent {
  id: string;
  type: TicketEventType;
  label: string;
  actor: string;
  time: string;
}

export interface Ticket {
  id: string;
  subject: string;
  requester: string;
  requesterInitials: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  slaHoursLeft: number;
  description: string;
  tags?: string[];
  attachments: TicketAttachment[];
  messages: TicketMessage[];
  events: TicketEvent[];
}

export interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  readMinutes: number;
  views: number;
  updatedAt: string;
}

export interface KbCategory {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  icon: string;
}

export interface Contract {
  id: string;
  title: string;
  party: string;
  status: ContractStatus;
  value: number;
  startDate: string;
  endDate: string;
  signedOn?: string;
}

export interface Invoice {
  id: string;
  number: string;
  period: string;
  amount: number;
  status: InvoiceStatus;
  issuedOn: string;
  dueOn: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  type: "coupon" | "credit" | "perk";
  value: string;
  code?: string;
  expiresOn: string;
  status: "available" | "redeemed" | "expired";
}

export interface ClientAccount {
  id: string;
  company: string;
  initials: string;
  contact: string;
  plan: string;
  cyberbackers: number;
  mrr: number;
  status: "active" | "trial" | "churned" | "at_risk";
  health: number; // 0-100
  since: string;
}

export interface PipelineCandidate {
  id: string;
  name: string;
  initials: string;
  role: string;
  stage: PipelineStageId;
  recruiter: string;
  appliedOn: string;
  score: number;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "info" | "success" | "warning" | "ticket";
  read: boolean;
}

export interface KpiStat {
  id: string;
  label: string;
  value: string;
  change: number; // percent, can be negative
  trend: "up" | "down";
  hint: string;
}

export interface ActivityItem {
  id: string;
  actor: string;
  initials: string;
  action: string;
  target: string;
  time: string;
}

export interface Renewal {
  id: string;
  name: string;
  plan: string;
  renewalDate: string;
  amount: number;
  daysUntil: number;
  status: "upcoming" | "due_soon" | "auto_renew";
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  tag: "Product" | "Maintenance" | "Community" | "Policy";
  author: string;
}

export interface AttendanceSummaryPoint {
  name: string;
  value: number;
  color: string;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  payouts: number;
}

export interface FunnelStep {
  step: string;
  value: number;
}

export interface GrowthPoint {
  month: string;
  clients: number;
  cyberbackers: number;
}

export interface TicketVolumePoint {
  month: string;
  opened: number;
  resolved: number;
}

export interface RetentionPoint {
  month: string;
  retention: number; // %
  churn: number; // %
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited" | "suspended";
  lastActive: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  time: string;
  ip: string;
}

export interface Review {
  id: string;
  cyberbackerId: string;
  cyberbackerName: string;
  overall: number;
  communication: number;
  quality: number;
  reliability: number;
  timeliness: number;
  comment: string;
  recommend: boolean;
  date: string; // ISO
  author: string;
}
