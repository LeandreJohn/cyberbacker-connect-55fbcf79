// In-memory demo backend. Only used while a demo session is active: apiFetch
// routes every request here instead of the network. Paths, request shapes and
// response shapes mirror the API reference exactly, so screens need no
// demo-specific branches. Writes mutate this module's memory only and reset on
// page refresh or sign out (resetDemoApi re-seeds).
import * as mock from "@/lib/data/mock";
import type {
  Attachment,
  CompanyReviewCreate,
  CompanyReviewItem,
  CompanyReviewList,
  CyberbackerReviewCreate,
  CyberbackerReviewItem,
  CyberbackerReviewOut,
  CyberbackerSummary,
  KbArticleAdminDetail,
  KbArticleAdminListItem,
  KbArticleCreate,
  KbArticleDetail,
  KbArticleListItem,
  KbCategory,
  KbCategoryAdmin,
  KbCategoryCreate,
  KbImportReport,
  KbImportRowResult,
  Preferences,
  PreferencesUpdate,
  Profile,
  ProfileUpdate,
  RatingTrendPoint,
  SkillEndorsement,
  TicketCategory,
  TicketDetail,
  TicketEvent,
  TicketListItem,
  TicketMessage,
  TicketPriority,
  TicketStatus,
  TicketSummary,
  TicketUpdate,
  TutorialState,
  UserOut,
} from "@/lib/types";
import type { DemoRole } from "@/lib/demo-auth";

// ---------------------------------------------------------------- identities

export const DEMO_PEOPLE = {
  client: {
    email: "jordan.avery@brightpath.co",
    name: "Jordan Avery",
    company: "BrightPath Ventures",
    initials: "JA",
    position: "Client",
  },
  superadmin: {
    email: "leandrejs@cyberbacker.com",
    name: "Leandre John Sabado",
    company: "Cyberbacker",
    initials: "LS",
    position: "SuperAdmin",
  },
  otherClients: [
    { email: "mia.chen@northstar.io", name: "Mia Chen", company: "Northstar Labs", initials: "MC", position: "Client" },
    { email: "sam.rivera@apexgroup.com", name: "Sam Rivera", company: "Apex Group", initials: "SR", position: "Client" },
  ],
};

type ClientPerson = (typeof DEMO_PEOPLE)["otherClients"][number];

function personFor(email: string): ClientPerson {
  if (email === DEMO_PEOPLE.client.email) return DEMO_PEOPLE.client;
  if (email === DEMO_PEOPLE.superadmin.email) return DEMO_PEOPLE.superadmin;
  return DEMO_PEOPLE.otherClients.find((c) => c.email === email) ?? {
    email,
    name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
    company: null as unknown as string,
    initials: email.slice(0, 2).toUpperCase(),
    position: "Client",
  };
}

// ------------------------------------------------------------------- helpers

const day = 86_400_000;
const iso = (daysAgo: number, hour = 10, minute = 0) => {
  const d = new Date(Date.now() - daysAgo * day);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
};

const wait = (ms = 160) => new Promise((r) => setTimeout(r, ms));

class DemoError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

interface Body {
  fields: Record<string, string>;
  files: { name: string; size: number }[];
}
async function parseBody(init: RequestInit): Promise<Body> {
  if (!init.body) return { fields: {}, files: [] };
  if (typeof init.body === "string") {
    try {
      return { fields: (JSON.parse(init.body) ?? {}) as Record<string, string>, files: [] };
    } catch {
      return { fields: Object.fromEntries(new URLSearchParams(init.body)), files: [] };
    }
  }
  if (init.body instanceof FormData) {
    const fields: Record<string, string> = {};
    const files: Body["files"] = [];
    for (const [key, value] of init.body.entries()) {
      if (typeof value === "string") fields[key] = value;
      else files.push({ name: value.name, size: value.size });
    }
    return { fields, files };
  }
  return { fields: {}, files: [] };
}

const bool = (v: string | null | undefined) => v === "true" || v === "1";
const int = (v: string | null | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

// ------------------------------------------------------------------- stores

interface DemoReview {
  id: number;
  client_email: string;
  cyberbacker_id: number;
  overall_rating: number;
  communication_rating: number | null;
  quality_rating: number | null;
  reliability_rating: number | null;
  timeliness_rating: number | null;
  meets_expectations: number;
  comments: string | null;
  would_recommend: boolean;
  created_at: string;
}

interface DemoCompanyReview {
  id: number;
  client_email: string;
  overall_rating: number;
  service_quality_rating: number | null;
  communication_rating: number | null;
  recruiting_matching_rating: number | null;
  support_responsiveness_rating: number | null;
  value_for_money_rating: number | null;
  meets_expectations: number;
  comments: string | null;
  would_recommend: boolean;
  created_at: string;
}

interface DemoTicket {
  id: number;
  client_email: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  sla_due_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  messages: (TicketMessage & { sender_email: string })[];
  events: TicketEvent[];
  attachments: Attachment[];
  nextMessageId: number;
}

interface DemoArticle {
  id: number;
  category_id: number;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  read_time_minutes: number;
  view_count: number;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  author_email: string | null;
  created_at: string;
  updated_at: string;
}

interface DemoCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

interface EndorsementRow {
  client_email: string;
  cyberbacker_id: number;
  skill: string;
  created_at: string;
}

interface State {
  reviews: DemoReview[];
  companyReviews: DemoCompanyReview[];
  endorsements: EndorsementRow[];
  tickets: DemoTicket[];
  categories: DemoCategory[];
  articles: DemoArticle[];
  profiles: Record<string, Profile>;
  preferences: Record<string, Preferences>;
  tutorials: Record<string, TutorialState>;
  nextReviewId: number;
  nextCompanyId: number;
  nextTicketId: number;
  nextMessageId: number;
  nextCategoryId: number;
  nextArticleId: number;
}

const DEFAULT_PREFERENCES: Preferences = {
  appearance: "light",
  kpi_active_cyberbackers: true,
  kpi_attendance_rate: true,
  kpi_open_support_tickets: true,
  kpi_upcoming_renewals: true,
  tutorials_enabled: true,
  notify_weekly_reports: true,
  notify_ticket_updates: true,
  notify_billing_reminders: true,
  notify_product_news: false,
};

const ROSTER = mock.cyberbackers;
const cbNumber = (id: string) => Number(id.replace(/\D/g, ""));

const REVIEW_COMMENTS = [
  "Consistently delivers ahead of schedule and communicates proactively.",
  "Great attention to detail on client reports. Occasional delays on Fridays.",
  "Handles our inbox and calendar flawlessly — a real asset to the team.",
  "Quick learner, adapted to our CRM within a week.",
  "Reliable and friendly; would love a bit more initiative on follow-ups.",
  "Outstanding quality on listing descriptions and social posts.",
];

function seedReviews(): DemoReview[] {
  const out: DemoReview[] = [];
  let id = 1;
  const months = [5, 6, 7, 8, 9, 10];
  ROSTER.slice(0, 5).forEach((cb, i) => {
    months.forEach((m, j) => {
      if ((i + j) % 2 === 0 || j > 3) {
        const s = 3 + ((i + j) % 3);
        out.push({
          id: id++,
          client_email: DEMO_PEOPLE.client.email,
          cyberbacker_id: cbNumber(cb.id),
          overall_rating: s,
          communication_rating: Math.min(5, s + (j % 2)),
          quality_rating: s,
          reliability_rating: Math.max(3, s - (i % 2)),
          timeliness_rating: s,
          meets_expectations: Math.min(5, s + 1),
          comments: REVIEW_COMMENTS[(i + j) % REVIEW_COMMENTS.length],
          would_recommend: s >= 4,
          created_at: iso(120 - (j * 20 + i * 3), 9 + (i % 8), 15),
        });
      }
    });
  });
  return out;
}

function seedCompanyReviews(): DemoCompanyReview[] {
  return [
    {
      id: 1,
      client_email: DEMO_PEOPLE.client.email,
      overall_rating: 5,
      service_quality_rating: 5,
      communication_rating: 5,
      recruiting_matching_rating: 4,
      support_responsiveness_rating: 5,
      value_for_money_rating: 5,
      meets_expectations: 5,
      comments: "Onboarding was smooth and our account manager checks in every month.",
      would_recommend: true,
      created_at: iso(43, 14, 30),
    },
    {
      id: 2,
      client_email: DEMO_PEOPLE.client.email,
      overall_rating: 4,
      service_quality_rating: 4,
      communication_rating: 4,
      recruiting_matching_rating: 4,
      support_responsiveness_rating: 3,
      value_for_money_rating: 5,
      meets_expectations: 4,
      comments: "Great talent. Ticket replies could be a little faster on weekends.",
      would_recommend: true,
      created_at: iso(149, 16, 5),
    },
  ];
}

function seedEndorsements(): EndorsementRow[] {
  const rows: EndorsementRow[] = [];
  const seed = (email: string, cbId: string, skills: string[]) =>
    skills.forEach((skill, i) => rows.push({ client_email: email, cyberbacker_id: cbNumber(cbId), skill, created_at: iso(60 + i, 12) }));
  seed(DEMO_PEOPLE.otherClients[0].email, "cb1", ["Calendar", "Inbox"]);
  seed(DEMO_PEOPLE.otherClients[1].email, "cb1", ["Calendar"]);
  seed(DEMO_PEOPLE.otherClients[0].email, "cb2", ["QuickBooks", "Payroll"]);
  return rows;
}

interface TicketSeed {
  client: ClientPerson;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  daysAgo: number;
  description: string;
  replies?: { role: "client" | "admin"; name: string; email: string; body: string; is_internal?: boolean; daysAfter: number }[];
  file?: string;
}

const TICKET_SEEDS: TicketSeed[] = [
  {
    client: DEMO_PEOPLE.client,
    subject: "Payroll report export stuck at 90%",
    category: "technical",
    priority: "high",
    status: "in_progress",
    assignee: "Support Team",
    daysAgo: 2,
    description: "The September payroll export hangs at 90% and never completes. We need it before Friday's cutoff.",
    file: "export-error.png",
    replies: [
      { role: "admin", name: "Leo Martins", email: "leo.martins@cyberbacker.com", body: "Thanks for the screenshot — our platform team is on it. We'll update you within 24 hours.", daysAfter: 1 },
      { role: "admin", name: "Leo Martins", email: "leo.martins@cyberbacker.com", body: "Platform team suspects a timeout on large exports. Estimating fix by Thursday.", is_internal: true, daysAfter: 1 },
    ],
  },
  {
    client: DEMO_PEOPLE.client,
    subject: "Add a second Cyberbacker to my plan",
    category: "account",
    priority: "medium",
    status: "pending_client",
    assignee: "Facilitator",
    daysAgo: 4,
    description: "We'd like to add a part-time bookkeeper to the current plan. What are the options?",
    replies: [
      { role: "admin", name: "Ana Reyes", email: "ana.reyes@cyberbacker.com", body: "Happy to help! Could you confirm how many weekly hours you'd need for the second seat?", daysAfter: 1 },
    ],
  },
  {
    client: DEMO_PEOPLE.client,
    subject: "Invoice PDF missing line items",
    category: "billing",
    priority: "medium",
    status: "open",
    assignee: "Support Team",
    daysAgo: 1,
    description: "September's invoice PDF doesn't show the per-Cyberbacker line items anymore.",
  },
  {
    client: DEMO_PEOPLE.client,
    subject: "Request attendance summary for Q3",
    category: "reports",
    priority: "low",
    status: "resolved",
    assignee: "Support Team",
    daysAgo: 18,
    description: "Could you send the Q3 attendance summary for our two Cyberbackers?",
    replies: [
      { role: "admin", name: "Support Team", email: "support@cyberbacker.com", body: "Attached the Q3 summary. Let us know if you need a different date range.", daysAfter: 1 },
      { role: "client", name: DEMO_PEOPLE.client.name, email: DEMO_PEOPLE.client.email, body: "Received, thank you!", daysAfter: 2 },
    ],
  },
  {
    client: DEMO_PEOPLE.client,
    subject: "Change primary contact email",
    category: "account",
    priority: "low",
    status: "closed",
    assignee: "Support Team",
    daysAgo: 40,
    description: "Please update our billing contact to finance@brightpath.co.",
    replies: [
      { role: "admin", name: "Ana Reyes", email: "ana.reyes@cyberbacker.com", body: "Done — billing notifications now go to finance@brightpath.co.", daysAfter: 1 },
      { role: "client", name: DEMO_PEOPLE.client.name, email: DEMO_PEOPLE.client.email, body: "Confirmed, all good.", daysAfter: 2 },
    ],
  },
  {
    client: DEMO_PEOPLE.otherClients[0],
    subject: "Welcome kit not received",
    category: "onboarding",
    priority: "low",
    status: "closed",
    assignee: "Support Team",
    daysAgo: 55,
    description: "The physical welcome kit for our new hire hasn't arrived after two weeks.",
    replies: [
      { role: "admin", name: "Mia Santos", email: "mia.santos@cyberbacker.com", body: "Apologies for the delay — the carrier lost the package. A replacement has shipped with tracking #1Z998.", daysAfter: 2 },
    ],
  },
  {
    client: DEMO_PEOPLE.otherClients[1],
    subject: "API token returns 401 after rotation",
    category: "technical",
    priority: "urgent",
    status: "open",
    assignee: "Support Team",
    daysAgo: 0,
    description: "After rotating our API token this morning every call returns 401. Production is affected.",
  },
];

function seedTickets(): { tickets: DemoTicket[]; nextId: number } {
  const tickets: DemoTicket[] = [];
  let id = 1;
  let messageId = 1;
  for (const seed of TICKET_SEEDS) {
    const created = iso(seed.daysAgo, 9, 20);
    const sla = seed.status === "resolved" || seed.status === "closed" ? null : iso(seed.daysAgo - 2, 9, 20);
    const ticket: DemoTicket = {
      id,
      client_email: seed.client.email,
      subject: seed.subject,
      category: seed.category,
      priority: seed.priority,
      status: seed.status,
      assignee: seed.assignee,
      sla_due_at: sla,
      resolved_at: seed.status === "resolved" || seed.status === "closed" ? iso(Math.max(0, seed.daysAgo - 3), 15) : null,
      closed_at: seed.status === "closed" ? iso(Math.max(0, seed.daysAgo - 2), 16) : null,
      created_at: created,
      updated_at: created,
      messages: [],
      events: [],
      attachments: [],
      nextMessageId: messageId,
    };
    ticket.messages.push({
      id: messageId++,
      sender_email: seed.client.email,
      sender_name: seed.client.name,
      sender_role: "client",
      body: seed.description,
      is_internal: false,
      created_at: created,
      attachments: seed.file
        ? [{ id: messageId, file_name: seed.file, content_type: "image/png", size_bytes: 184_320, download_url: `/api/v1/cb_client_portal/support/attachments/${messageId}` }]
        : [],
    });
    if (seed.file) ticket.attachments.push({ id: messageId - 1, file_name: seed.file, content_type: "image/png", size_bytes: 184_320, download_url: `/api/v1/cb_client_portal/support/attachments/${messageId - 1}` });
    ticket.events.push({ event_type: "created", actor_name: seed.client.name, old_value: null, new_value: null, created_at: created });
    for (const r of seed.replies ?? []) {
      const at = iso(Math.max(0, seed.daysAgo - r.daysAfter), 14, 10);
      ticket.messages.push({
        id: messageId++,
        sender_email: r.email,
        sender_name: r.name,
        sender_role: r.role,
        body: r.body,
        is_internal: Boolean(r.is_internal),
        created_at: at,
        attachments: [],
      });
      ticket.events.push({ event_type: "replied", actor_name: r.name, old_value: null, new_value: null, created_at: at });
    }
    ticket.updated_at = ticket.messages[ticket.messages.length - 1]?.created_at ?? created;
    tickets.push(ticket);
    id++;
  }
  return { tickets, nextId: id };
}

const ARTICLE_BODIES: Record<string, string> = {
  "How to delegate your first task": `## Why delegation matters\n\nHanding off work is the fastest way to get hours back. Start with one repeatable task this week.\n\n### Steps\n\n1. Pick a task you do every week that follows the same pattern.\n2. Write the steps down once — even a rough list helps.\n3. Book a 15-minute walkthrough with your Cyberbacker.\n4. Let them own it end-to-end for two weeks.\n5. Review together and adjust.\n\n**Tip:** delegate the outcome, not the method. Your Cyberbacker may find a better way.\n\n> Expect the first two weeks to feel slower. Week three is where the time savings start.`,
  "Setting weekly priorities with your team": `## The weekly priorities ritual\n\nEvery Monday, share your top three outcomes for the week in your shared board.\n\n1. **List outcomes, not tasks.** "Invoice sent" beats "work on invoices."\n2. **Flag the one thing that must not slip.**\n3. **Agree on blockers early** — anything your Cyberbacker needs from you.\n\nReview Friday for 10 minutes. Two cycles in, you'll notice fewer surprises.`,
  "Understanding your monthly invoice": `## Reading your invoice\n\nYour monthly statement has three sections:\n\n- **Plan fee** — your committed weekly hours.\n- **Add-ons** — extra hours, tools or seats used during the period.\n- **Adjustments** — credits or corrections, always with a note.\n\nHours are tracked to the nearest 15 minutes. If a number looks off, open a **Billing** ticket and we'll walk the log with you.`,
  "Top 10 automations for assistants": `## Automations your Cyberbacker can set up\n\n1. Meeting prep digest every morning at 7am.\n2. Auto-file email attachments to Drive folders.\n3. Invoice reminders three days before due date.\n4. Weekly KPI snapshot to your inbox.\n5. Travel itinerary builder from confirmation emails.\n\n**Start with one.** Automations compound — ten small ones save a full day a week.`,
  "Using Dialpad for daily check-ins": `## Daily check-ins on Dialpad\n\nYour team's Dialpad line rings straight to their laptop or mobile. Set a recurring morning call for context hand-off, and use **Smart Recording** (with consent) to review highlights later.\n\nIf you miss a call, transcripts land in your shared folder within an hour.`,
  "Reading your weekly performance report": `## What's in the weekly report\n\n- **Hours logged** vs. capacity\n- **Tasks completed** with turnaround times\n- **Attendance** including late starts\n\nScores under 90% come with a short note from the team lead explaining what's being coached.`,
  "Requesting schedule changes and leave coverage": `## Schedule changes\n\nNeed different hours? Open a ticket under **Account** with the timezone and window you need. Changes apply from the next Monday.\n\nPlanned leave is covered by a trained teammate at no extra cost — just tell us the dates.`,
  "Connecting your CRM to your Cyberbacker workspace": `## Connecting your CRM\n\n1. Open **Settings → Integrations** and pick your CRM.\n2. Authorize with a scoped, read-write token.\n3. Your Cyberbacker gets sandbox access first, then production.\n\nRevoke access anytime — the token dies immediately and local caches clear within 24 hours.`,
};

function seedKb(): { categories: DemoCategory[]; articles: DemoArticle[] } {
  const categories: DemoCategory[] = [
    { id: 1, slug: "getting-started", name: "Getting Started", description: "Onboarding and account setup", icon: "rocket", sort_order: 1, is_active: true },
    { id: 2, slug: "managing-cyberbackers", name: "Managing Cyberbackers", description: "Delegation, hours, and reviews", icon: "users", sort_order: 2, is_active: true },
    { id: 3, slug: "billing-contracts", name: "Billing & Contracts", description: "Invoices, plans, and payments", icon: "credit-card", sort_order: 3, is_active: true },
    { id: 4, slug: "productivity-tools", name: "Productivity Tools", description: "Integrations and best practices", icon: "zap", sort_order: 4, is_active: true },
  ];
  const defs: { title: string; cat: number; views: number; read: number; summary: string; status?: "draft" }[] = [
    { title: "How to delegate your first task", cat: 1, views: 4210, read: 5, summary: "A step-by-step guide to handing off work effectively to your Cyberbacker." },
    { title: "Requesting schedule changes and leave coverage", cat: 1, views: 1120, read: 4, summary: "Change hours, timezones or arrange leave coverage without downtime." },
    { title: "Setting weekly priorities with your team", cat: 2, views: 3180, read: 7, summary: "Run an effective weekly planning ritual that keeps everyone aligned." },
    { title: "Reading your weekly performance report", cat: 2, views: 1890, read: 4, summary: "Understand hours, tasks and attendance in your Monday report." },
    { title: "Understanding your monthly invoice", cat: 3, views: 2560, read: 4, summary: "Breakdown of line items, hours, and add-ons on your statement." },
    { title: "Top 10 automations for assistants", cat: 4, views: 5890, read: 9, summary: "Save hours every week with these no-code automation recipes." },
    { title: "Using Dialpad for daily check-ins", cat: 4, views: 980, read: 3, summary: "Set up quick daily calls with your team over Dialpad." },
    { title: "Connecting your CRM to your Cyberbacker workspace", cat: 4, views: 740, read: 6, summary: "Give your Cyberbacker safe, scoped access to your CRM.", status: "draft" },
  ];
  const articles: DemoArticle[] = defs.map((d, i) => {
    const published = d.status !== "draft";
    return {
      id: i + 1,
      category_id: d.cat,
      slug: d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      title: d.title,
      summary: d.summary,
      body: ARTICLE_BODIES[d.title],
      read_time_minutes: d.read,
      view_count: d.views,
      status: d.status ?? "published",
      published_at: published ? iso(90 - i * 9, 11) : null,
      author_email: DEMO_PEOPLE.superadmin.email,
      created_at: iso(120 - i * 9, 11),
      updated_at: iso(30 - (i % 20), 11),
    };
  });
  return { categories, articles };
}

let state: State;
function seed(): State {
  const kb = seedKb();
  const { tickets, nextId } = seedTickets();
  return {
    reviews: seedReviews(),
    companyReviews: seedCompanyReviews(),
    endorsements: seedEndorsements(),
    tickets,
    categories: kb.categories,
    articles: kb.articles,
    profiles: {},
    preferences: {},
    tutorials: {},
    nextReviewId: 1000,
    nextCompanyId: 100,
    nextTicketId: nextId,
    nextMessageId: 5000,
    nextCategoryId: 10,
    nextArticleId: kb.articles.length + 1,
  };
}
export function resetDemoApi() {
  state = seed();
}
resetDemoApi();

// ------------------------------------------------------------------ mapping

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

function toSummary(clientEmail: string): CyberbackerSummary[] {
  const byId = new Map<number, number[]>();
  state.reviews.filter((r) => r.client_email === clientEmail).forEach((r) => {
    byId.set(r.cyberbacker_id, [...(byId.get(r.cyberbacker_id) ?? []), r.overall_rating]);
  });
  const out: CyberbackerSummary[] = [];
  byId.forEach((scores, id) => {
    out.push({
      id,
      name: "",
      initials: "",
      position: "",
      average_rating: avg(scores),
      review_count: scores.length,
    });
  });
  return out.sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
}

function toReviewItem(r: DemoReview): CyberbackerReviewItem {
  return {
    id: r.id,
    cyberbacker_id: r.cyberbacker_id,
    cyberbacker_name: "",
    overall_rating: r.overall_rating,
    meets_expectations: r.meets_expectations,
    expectation_label: labelFor(r.meets_expectations),
    comments: r.comments,
    would_recommend: r.would_recommend,
    created_at: r.created_at,
  } as CyberbackerReviewItem;
}

function toCompanyItem(r: DemoCompanyReview): CompanyReviewItem {
  return {
    ...r,
    expectation_label: labelFor(r.meets_expectations),
  } as CompanyReviewItem;
}

function toListItem(t: DemoTicket): TicketListItem {
  const person = personFor(t.client_email);
  return {
    id: t.id,
    code: `T${t.id}`,
    subject: t.subject,
    category: t.category,
    priority: t.priority,
    status: t.status,
    status_label: t.status.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
    assignee: t.assignee,
    requester_name: person.name,
    requester_company: person.company ?? null,
    requester_initials: person.initials,
    updated_at: t.updated_at,
  };
}

function toDetail(t: DemoTicket, includeInternal: boolean): TicketDetail {
  const person = personFor(t.client_email);
  const slaHoursLeft = t.sla_due_at && t.status !== "resolved" && t.status !== "closed"
    ? Math.max(0, Math.round((new Date(t.sla_due_at).getTime() - Date.now()) / 3_600_000))
    : null;
  return {
    ...toListItem(t),
    created_at: t.created_at,
    requester_email: t.client_email,
    sla_due_at: t.sla_due_at,
    sla_hours_left: slaHoursLeft,
    sla_breached: slaHoursLeft !== null && slaHoursLeft <= 0,
    messages: t.messages
      .filter((m) => includeInternal || !m.is_internal)
      .map(({ sender_email: _e, ...rest }) => rest),
    events: t.events,
  };
}

function toKbCategory(c: DemoCategory): KbCategory {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    icon: c.icon,
    article_count: state.articles.filter((a) => a.category_id === c.id && a.status === "published").length,
  };
}
function toKbCategoryAdmin(c: DemoCategory): KbCategoryAdmin {
  return {
    ...toKbCategory(c),
    sort_order: c.sort_order,
    is_active: c.is_active,
    total_articles: state.articles.filter((a) => a.category_id === c.id && a.status !== "archived").length,
  };
}
function toArticleListItem(a: DemoArticle, admin: boolean): KbArticleListItem {
  const cat = state.categories.find((c) => c.id === a.category_id);
  const base: KbArticleListItem = {
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    category_id: a.category_id,
    category_slug: cat?.slug ?? "",
    category_name: cat?.name ?? "",
    view_count: a.view_count,
    read_time_minutes: a.read_time_minutes,
    published_at: a.published_at,
  };
  if (!admin) return base;
  return {
    ...base,
    status: a.status,
    author_email: a.author_email,
    created_at: a.created_at,
    updated_at: a.updated_at,
  } as KbArticleAdminListItem;
}
function toArticleDetail(a: DemoArticle, admin: boolean): KbArticleDetail {
  return { ...toArticleListItem(a, admin), body: a.body, updated_at: a.updated_at } as KbArticleDetail;
}

// ------------------------------------------------------------- mutation ops

function addMessage(t: DemoTicket, senderEmail: string, role: "client" | "admin", body: string, isInternal: boolean, files: Body["files"]) {
  const now = new Date().toISOString();
  const attachments: Attachment[] = files.map((f, i) => ({
    id: state.nextMessageId + i + 1,
    file_name: f.name,
    content_type: null,
    size_bytes: f.size,
    download_url: `/api/v1/cb_client_portal/support/attachments/${state.nextMessageId + i + 1}`,
  }));
  t.messages.push({
    id: state.nextMessageId++,
    sender_email: senderEmail,
    sender_name: personFor(senderEmail).name,
    sender_role: role,
    body,
    is_internal: isInternal,
    created_at: now,
    attachments,
  });
  if (!isInternal) t.events.push({ event_type: "replied", actor_name: personFor(senderEmail).name, old_value: null, new_value: null, created_at: now });
  t.updated_at = now;
}

function applyTicketPatch(t: DemoTicket, patch: TicketUpdate, actor: string) {
  const now = new Date().toISOString();
  if (patch.status && patch.status !== t.status) {
    t.events.push({ event_type: "status_changed", actor_name: actor, old_value: t.status, new_value: patch.status, created_at: now });
    t.status = patch.status;
    if (patch.status === "resolved") { t.resolved_at = now; t.sla_due_at = null; }
    if (patch.status === "closed") { t.closed_at = now; t.sla_due_at = null; }
    if (patch.status === "open" || patch.status === "in_progress" || patch.status === "pending_client") {
      t.resolved_at = null;
      t.closed_at = null;
      t.sla_due_at = new Date(Date.now() + 48 * 3_600_000).toISOString();
    }
  }
  if (patch.priority && patch.priority !== t.priority) {
    t.events.push({ event_type: "priority_changed", actor_name: actor, old_value: t.priority, new_value: patch.priority, created_at: now });
    t.priority = patch.priority;
  }
  if (patch.assignee && patch.assignee !== t.assignee) {
    t.events.push({ event_type: "reassigned", actor_name: actor, old_value: t.assignee, new_value: patch.assignee, created_at: now });
    t.assignee = patch.assignee;
  }
  t.updated_at = now;
}

function labelFor(v: number) {
  return ["Doesn't meet expectations", "Partially meets expectations", "Meets expectations", "Above expectations", "Exceeds expectations"][Math.min(5, Math.max(1, v)) - 1];
}
const rating = (v: unknown): number | undefined => {
  const n = Number(v);
  return n >= 1 && n <= 5 ? Math.round(n) : undefined;
};

function preferencesFor(email: string): Preferences {
  return state.preferences[email] ?? { ...DEFAULT_PREFERENCES };
}
function tutorialsFor(email: string): TutorialState {
  return state.tutorials[email] ?? { enabled: preferencesFor(email).tutorials_enabled, completed_pages: [] };
}
function profileFor(email: string): Profile {
  const p = state.profiles[email];
  if (p) return p;
  const person = personFor(email);
  return {
    name: person.name,
    email,
    company: person.company ?? null,
    role: person.position,
    avatar_url: null,
    initials: person.initials,
  };
}

// --------------------------------------------------------------- dispatcher

export async function demoApi<T>(path: string, init: RequestInit = {}, role: DemoRole = "client"): Promise<T> {
  await wait();
  const url = new URL(path, "http://demo.local");
  const q = url.searchParams;
  const p = url.pathname;
  const method = (init.method ?? "GET").toUpperCase();
  const body = await parseBody(init);

  const admin = () => {
    if (role !== "superadmin") throw new DemoError(403, "You don't have access to the admin area.");
  };
  const who = () => (role === "superadmin" ? DEMO_PEOPLE.superadmin : DEMO_PEOPLE.client);
  const me = who();
  const CP = "/api/v1/cb_client_portal";
  const AP = "/api/v1/cb_admin_portal";

  try {
    // ------------------------------------------------------------- auth
    if (p === "/users/me" && method === "GET") {
      return <T>(await (async () => {
        const u: UserOut = { id: role === "superadmin" ? 2 : 1, email: me.email, name: me.name, status: "active", position: me.position };
        return u;
      })());
    }

    // ---------------------------------------------------------- reviews
    if (p === `${CP}/cb_ratings` && method === "GET") return toSummary(me.email) as T;

    if (p === `${CP}/cb_reviews` && method === "GET") {
      const cbId = q.get("cyberbacker_id");
      const limit = int(q.get("limit"), 10);
      let rows = state.reviews.filter((r) => r.client_email === me.email);
      if (cbId) rows = rows.filter((r) => r.cyberbacker_id === Number(cbId));
      rows = rows.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
      return rows.map(toReviewItem) as T;
    }

    if (p === `${CP}/cb_rating_trend` && method === "GET") {
      const months = Math.min(24, Math.max(1, int(q.get("months"), 6)));
      const cbId = q.get("cyberbacker_id");
      let rows = state.reviews.filter((r) => r.client_email === me.email);
      if (cbId) rows = rows.filter((r) => r.cyberbacker_id === Number(cbId));
      const cutoff = new Date();
      cutoff.setUTCMonth(cutoff.getUTCMonth() - months + 1);
      cutoff.setUTCDate(1);
      const byMonth = new Map<string, number[]>();
      rows.forEach((r) => {
        if (new Date(r.created_at) >= cutoff) {
          const key = r.created_at.slice(0, 7);
          byMonth.set(key, [...(byMonth.get(key) ?? []), r.overall_rating]);
        }
      });
      const out: RatingTrendPoint[] = [...byMonth.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, v]) => ({ month, average_rating: +(avg(v) as number).toFixed(2) }));
      return out as T;
    }

    if (p === `${CP}/cb_rate` && method === "POST") {
      const input = body.fields as unknown as CyberbackerReviewCreate;
      const review: DemoReview = {
        id: state.nextReviewId++,
        client_email: me.email,
        cyberbacker_id: Number(input.cyberbacker_id),
        overall_rating: rating(input.overall_rating)!,
        communication_rating: rating(input.communication_rating) ?? null,
        quality_rating: rating(input.quality_rating) ?? null,
        reliability_rating: rating(input.reliability_rating) ?? null,
        timeliness_rating: rating(input.timeliness_rating) ?? null,
        meets_expectations: rating(input.meets_expectations)!,
        comments: input.comments?.trim() || null,
        would_recommend: input.would_recommend ?? true,
        created_at: new Date().toISOString(),
      };
      state.reviews = [review, ...state.reviews];
      const out: CyberbackerReviewOut = { ...toReviewItem(review) as unknown as CyberbackerReviewCreate, ...review };
      return out as T;
    }

    if (p === `${CP}/company_rate` && method === "POST") {
      const input = body.fields as unknown as CompanyReviewCreate;
      const row: DemoCompanyReview = {
        id: state.nextCompanyId++,
        client_email: me.email,
        overall_rating: rating(input.overall_rating)!,
        service_quality_rating: rating(input.service_quality_rating) ?? null,
        communication_rating: rating(input.communication_rating) ?? null,
        recruiting_matching_rating: rating(input.recruiting_matching_rating) ?? null,
        support_responsiveness_rating: rating(input.support_responsiveness_rating) ?? null,
        value_for_money_rating: rating(input.value_for_money_rating) ?? null,
        meets_expectations: rating(input.meets_expectations)!,
        comments: input.comments?.trim() || null,
        would_recommend: input.would_recommend ?? true,
        created_at: new Date().toISOString(),
      };
      state.companyReviews = [row, ...state.companyReviews];
      return toCompanyItem(row) as T;
    }

    if (p === `${CP}/company_reviews` && method === "GET") {
      const limit = int(q.get("limit"), 20);
      const rows = state.companyReviews
        .filter((r) => r.client_email === me.email)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, limit);
      const list: CompanyReviewList = {
        average_rating: avg(rows.map((r) => r.overall_rating)),
        total_reviews: rows.length,
        reviews: rows.map(toCompanyItem),
      };
      return list as T;
    }

    // ----------------------------------------------------- endorsements
    if (p === `${CP}/skill_endorsements`) {
      const cbId = Number(q.get("cyberbacker_id") ?? body.fields.cyberbacker_id);
      if (method === "GET") {
        const rows = state.endorsements.filter((e) => e.cyberbacker_id === cbId);
        const grouped = new Map<string, SkillEndorsement>();
        rows.forEach((e) => {
          const key = e.skill.toLowerCase();
          const g = grouped.get(key) ?? { skill: e.skill, endorsements: 0, endorsed_by_me: false };
          g.endorsements += 1;
          if (e.client_email === me.email) g.endorsed_by_me = true;
          grouped.set(key, g);
        });
        return [...grouped.values()].sort((a, b) => b.endorsements - a.endorsements || a.skill.localeCompare(b.skill)) as T;
      }
      if (method === "POST") {
        const skill = (body.fields.skill ?? "").trim();
        if (!skill) throw new DemoError(422, "Skill is required");
        const exists = state.endorsements.some(
          (e) => e.cyberbacker_id === cbId && e.client_email === me.email && e.skill.toLowerCase() === skill.toLowerCase(),
        );
        if (exists) throw new DemoError(409, "You already endorsed this skill");
        state.endorsements.push({ client_email: me.email, cyberbacker_id: cbId, skill, created_at: new Date().toISOString() });
        // fall through to return the refreshed list
      }
      if (method === "DELETE") {
        const skill = q.get("skill") ?? "";
        state.endorsements = state.endorsements.filter(
          (e) => !(e.cyberbacker_id === cbId && e.client_email === me.email && e.skill.toLowerCase() === skill.toLowerCase()),
        );
      }
      if (method !== "GET") {
        const rows = state.endorsements.filter((e) => e.cyberbacker_id === cbId);
        const grouped = new Map<string, SkillEndorsement>();
        rows.forEach((e) => {
          const key = e.skill.toLowerCase();
          const g = grouped.get(key) ?? { skill: e.skill, endorsements: 0, endorsed_by_me: false };
          g.endorsements += 1;
          if (e.client_email === me.email) g.endorsed_by_me = true;
          grouped.set(key, g);
        });
        return [...grouped.values()].sort((a, b) => b.endorsements - a.endorsements || a.skill.localeCompare(b.skill)) as T;
      }
    }

    // --------------------------------------------------------- settings
    if (p === `${CP}/settings/profile` && method === "GET") return profileFor(me.email) as T;
    if (p === `${CP}/settings/profile` && method === "PUT") {
      const input = body.fields as unknown as ProfileUpdate;
      if (!input.name?.trim()) throw new DemoError(422, "Name is required");
      if (!input.email?.trim()) throw new DemoError(422, "Email is required");
      const current = profileFor(me.email);
      const next: Profile = { ...current, name: input.name.trim(), email: input.email.trim(), company: input.company ?? current.company };
      state.profiles[me.email] = next;
      return next as T;
    }
    if (p === `${CP}/settings/change_password` && method === "POST") {
      const input = body.fields as unknown as { current_password: string; new_password: string; confirm_new_password: string };
      if (input.new_password !== input.confirm_new_password) throw new DemoError(422, "Passwords do not match");
      if ((input.new_password ?? "").length < 8) throw new DemoError(422, "Password must be at least 8 characters");
      return undefined as T;
    }
    if (p === `${CP}/settings/preferences` && method === "GET") return preferencesFor(me.email) as T;
    if (p === `${CP}/settings/preferences` && method === "PATCH") {
      const patch = body.fields as unknown as PreferencesUpdate;
      const current = preferencesFor(me.email);
      const next: Preferences = { ...current, ...patch };
      if (!(next.kpi_active_cyberbackers || next.kpi_attendance_rate || next.kpi_open_support_tickets || next.kpi_upcoming_renewals)) {
        throw new DemoError(400, "At least one KPI must stay on");
      }
      state.preferences[me.email] = next;
      return next as T;
    }
    if (p === `${CP}/settings/tutorials` && method === "GET") return tutorialsFor(me.email) as T;
    if (p === `${CP}/settings/tutorials/complete` && method === "POST") {
      const t = tutorialsFor(me.email);
      const key = body.fields.page_key;
      if (key && !t.completed_pages.includes(key)) t.completed_pages.push(key);
      state.tutorials[me.email] = t;
      return t as T;
    }
    if (p === `${CP}/settings/tutorials/replay` && method === "POST") {
      const t: TutorialState = { enabled: true, completed_pages: [] };
      state.tutorials[me.email] = t;
      return t as T;
    }

    // -------------------------------------------------- support, client
    if (p === `${CP}/support/summary` && method === "GET") {
      const rows = state.tickets.filter((t) => t.client_email === me.email);
      const s: TicketSummary = {
        open: rows.filter((t) => t.status === "open").length,
        in_progress: rows.filter((t) => t.status === "in_progress").length,
        pending_client: rows.filter((t) => t.status === "pending_client").length,
        resolved: rows.filter((t) => t.status === "resolved").length,
        closed: rows.filter((t) => t.status === "closed").length,
        total: rows.length,
      };
      return s as T;
    }
    if (p === `${CP}/support/tickets` && method === "GET" && !/\/\d+$/.test(p)) {
      let rows = state.tickets.filter((t) => t.client_email === me.email);
      rows = filterTickets(rows, q);
      return rows.sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, int(q.get("offset"), 0) + int(q.get("limit"), 50)).slice(int(q.get("offset"), 0)).map((t) => toListItem(t)) as T;
    }
    const cpTicket = p.match(new RegExp(`^${CP}/support/tickets/(\\d+)$`));
    if (cpTicket) {
      const ticket = state.tickets.find((t) => t.id === Number(cpTicket[1]) && t.client_email === me.email);
      if (!ticket) throw new DemoError(404, "Ticket not found");
      if (method === "GET") return toDetail(ticket, false) as T;
    }
    const cpCreate = p === `${CP}/support/tickets` && method === "POST";
    if (cpCreate) {
      const subject = (body.fields.subject ?? "").trim();
      if (!subject) throw new DemoError(422, "Subject is required");
      if (body.files.length > 5) throw new DemoError(422, "Up to 5 files per message");
      if (body.files.some((f) => f.size > 10 * 1024 * 1024)) throw new DemoError(413, "Each file must be 10 MB or smaller");
      const now = new Date().toISOString();
      const t: DemoTicket = {
        id: state.nextTicketId++,
        client_email: me.email,
        subject,
        category: (body.fields.category as TicketCategory) || "account",
        priority: (body.fields.priority as TicketPriority) || "medium",
        status: "open",
        assignee: "Support Team",
        sla_due_at: new Date(Date.now() + 48 * 3_600_000).toISOString(),
        resolved_at: null,
        closed_at: null,
        created_at: now,
        updated_at: now,
        messages: [],
        events: [],
        attachments: [],
        nextMessageId: state.nextMessageId,
      };
      addMessage(t, me.email, "client", (body.fields.description ?? "").trim(), false, body.files);
      t.events.push({ event_type: "created", actor_name: me.name, old_value: null, new_value: null, created_at: now });
      state.tickets.push(t);
      return toDetail(t, false) as T;
    }
    const cpReply = p.match(new RegExp(`^${CP}/support/tickets/(\\d+)/reply$`));
    if (cpReply && method === "POST") {
      const ticket = state.tickets.find((t) => t.id === Number(cpReply[1]) && t.client_email === me.email);
      if (!ticket) throw new DemoError(404, "Ticket not found");
      if (ticket.status === "closed") throw new DemoError(409, "This ticket is closed. Please open a new ticket.");
      if (ticket.status === "pending_client") applyTicketPatch(ticket, { status: "in_progress" }, "System");
      if (ticket.status === "resolved") applyTicketPatch(ticket, { status: "open" }, "System");
      addMessage(ticket, me.email, "client", (body.fields.body ?? "").trim(), false, body.files);
      return toDetail(ticket, false) as T;
    }
    const cpResolve = p.match(new RegExp(`^${CP}/support/tickets/(\\d+)/resolve$`));
    if (cpResolve && method === "POST") {
      const ticket = state.tickets.find((t) => t.id === Number(cpResolve[1]) && t.client_email === me.email);
      if (!ticket) throw new DemoError(404, "Ticket not found");
      applyTicketPatch(ticket, { status: "resolved" }, me.name);
      return toDetail(ticket, false) as T;
    }

    // -------------------------------------------------- support, admin
    if (p === `${AP}/support/summary` && method === "GET") {
      admin();
      const s: TicketSummary = {
        open: state.tickets.filter((t) => t.status === "open").length,
        in_progress: state.tickets.filter((t) => t.status === "in_progress").length,
        pending_client: state.tickets.filter((t) => t.status === "pending_client").length,
        resolved: state.tickets.filter((t) => t.status === "resolved").length,
        closed: state.tickets.filter((t) => t.status === "closed").length,
        total: state.tickets.length,
      };
      return s as T;
    }
    if (p === `${AP}/support/tickets` && method === "GET" && !/\/\d+$/.test(p)) {
      admin();
      let rows = filterTickets(state.tickets, q);
      const assignee = q.get("assignee");
      if (assignee) rows = rows.filter((t) => t.assignee.toLowerCase() === assignee.toLowerCase());
      const search = (q.get("search") ?? "").trim().toLowerCase();
      if (search) {
        rows = rows.filter((t) => {
          const person = personFor(t.client_email);
          return `${t.subject} ${person.name} ${person.company ?? ""}`.toLowerCase().includes(search);
        });
      }
      return rows.sort((a, b) => b.updated_at.localeCompare(a.updated_at)).map((t) => toListItem(t)) as T;
    }
    const apTicket = p.match(new RegExp(`^${AP}/support/tickets/(\\d+)$`));
    if (apTicket) {
      admin();
      const ticket = state.tickets.find((t) => t.id === Number(apTicket[1]));
      if (!ticket) throw new DemoError(404, "Ticket not found");
      if (method === "GET") return toDetail(ticket, true) as T;
      if (method === "PATCH") {
        applyTicketPatch(ticket, body.fields as unknown as TicketUpdate, me.name);
        return toDetail(ticket, true) as T;
      }
    }
    const apReply = p.match(new RegExp(`^${AP}/support/tickets/(\\d+)/reply$`));
    if (apReply && method === "POST") {
      admin();
      const ticket = state.tickets.find((t) => t.id === Number(apReply[1]));
      if (!ticket) throw new DemoError(404, "Ticket not found");
      const isInternal = bool(body.fields.is_internal);
      if (ticket.status === "open" && !isInternal) applyTicketPatch(ticket, { status: "in_progress" }, "System");
      addMessage(ticket, me.email, "admin", (body.fields.body ?? "").trim(), isInternal, body.files);
      return toDetail(ticket, true) as T;
    }

    // ---------------------------------------------- knowledge base, client
    const KB = `${CP}/knowledge_base`;
    if (p === `${KB}/categories` && method === "GET") {
      return state.categories.filter((c) => c.is_active).map(toKbCategory) as T;
    }
    if (p === `${KB}/articles/popular` && method === "GET") {
      const limit = Math.min(20, int(q.get("limit"), 5));
      return state.articles
        .filter((a) => a.status === "published")
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, limit)
        .map((a) => toArticleListItem(a, false)) as T;
    }
    if (p === `${KB}/articles` && method === "GET") {
      let rows = state.articles.filter((a) => a.status === "published");
      const cat = q.get("category");
      if (cat) {
        const c = state.categories.find((x) => x.slug === cat || x.name.toLowerCase() === cat.toLowerCase());
        rows = c ? rows.filter((a) => a.category_id === c.id) : [];
      }
      const search = (q.get("search") ?? "").trim().toLowerCase();
      if (search) rows = rows.filter((a) => `${a.title} ${a.summary ?? ""}`.toLowerCase().includes(search));
      const offset = int(q.get("offset"), 0);
      return rows.sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? "")).slice(offset, offset + int(q.get("limit"), 20)).map((a) => toArticleListItem(a, false)) as T;
    }
    const kbSlug = p.match(new RegExp(`^${KB}/articles/([a-z0-9-]+)$`));
    if (kbSlug && method === "GET" && kbSlug[1] !== "popular") {
      const article = state.articles.find((a) => a.slug === kbSlug[1] && a.status === "published");
      if (!article) throw new DemoError(404, "Article not found");
      article.view_count += 1;
      return toArticleDetail(article, false) as T;
    }

    // ------------------------------------------------ knowledge base, admin
    const AKB = `${AP}/knowledge_base`;
    if (p.startsWith(AKB)) admin();
    if (p === `${AKB}/categories` && method === "GET") return state.categories.map(toKbCategoryAdmin) as T;
    if (p === `${AKB}/categories` && method === "POST") {
      const input = body.fields as unknown as KbCategoryCreate;
      if (!input.name?.trim()) throw new DemoError(422, "Name is required");
      const slug = (input.slug ?? input.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (state.categories.some((c) => c.slug === slug)) throw new DemoError(409, "A category with this name already exists");
      const cat: DemoCategory = {
        id: state.nextCategoryId++,
        slug,
        name: input.name.trim(),
        description: input.description ?? null,
        icon: input.icon ?? null,
        sort_order: input.sort_order ?? state.categories.length + 1,
        is_active: input.is_active ?? true,
      };
      state.categories.push(cat);
      return toKbCategoryAdmin(cat) as T;
    }
    const kbCat = p.match(new RegExp(`^${AKB}/categories/(\\d+)$`));
    if (kbCat && method === "PATCH") {
      const cat = state.categories.find((c) => c.id === Number(kbCat[1]));
      if (!cat) throw new DemoError(404, "Category not found");
      const input = body.fields as unknown as Partial<KbCategoryCreate>;
      if (input.name !== undefined) cat.name = input.name;
      if (input.description !== undefined) cat.description = input.description ?? null;
      if (input.icon !== undefined) cat.icon = input.icon ?? null;
      if (input.sort_order !== undefined) cat.sort_order = input.sort_order;
      if (input.is_active !== undefined) cat.is_active = input.is_active;
      return toKbCategoryAdmin(cat) as T;
    }
    if (p === `${AKB}/articles` && method === "GET") {
      let rows = [...state.articles];
      const status = q.get("status");
      if (status) rows = rows.filter((a) => a.status === status);
      const catId = q.get("category_id");
      if (catId) rows = rows.filter((a) => a.category_id === Number(catId));
      const search = (q.get("search") ?? "").trim().toLowerCase();
      if (search) rows = rows.filter((a) => `${a.title} ${a.summary ?? ""}`.toLowerCase().includes(search));
      const offset = int(q.get("offset"), 0);
      return rows.sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(offset, offset + int(q.get("limit"), 50)).map((a) => toArticleListItem(a, true)) as T;
    }
    if (p === `${AKB}/articles` && method === "POST") {
      const input = body.fields as unknown as KbArticleCreate;
      if (!input.title?.trim()) throw new DemoError(422, "Title is required");
      if (!input.body?.trim()) throw new DemoError(422, "Body is required");
      const slug = (input.slug ?? input.title).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (state.articles.some((a) => a.slug === slug)) throw new DemoError(409, "An article with this slug already exists");
      const now = new Date().toISOString();
      const article: DemoArticle = {
        id: state.nextArticleId++,
        category_id: Number(input.category_id),
        slug,
        title: input.title.trim(),
        summary: input.summary ?? null,
        body: input.body,
        read_time_minutes: input.read_time_minutes ?? Math.max(1, Math.round(input.body.split(/\s+/).length / 200)),
        view_count: 0,
        status: input.status ?? "draft",
        published_at: (input.status ?? "draft") === "published" ? now : null,
        author_email: me.email,
        created_at: now,
        updated_at: now,
      };
      state.articles.push(article);
      return toArticleDetail(article, true) as T;
    }
    const kbArt = p.match(new RegExp(`^${AKB}/articles/(\\d+)$`));
    if (kbArt) {
      const article = state.articles.find((a) => a.id === Number(kbArt[1]));
      if (!article) throw new DemoError(404, "Article not found");
      if (method === "GET") return toArticleDetail(article, true) as T;
      if (method === "PATCH") {
        const input = body.fields as unknown as Partial<KbArticleCreate>;
        if (input.title !== undefined) article.title = input.title;
        if (input.summary !== undefined) article.summary = input.summary ?? null;
        if (input.body !== undefined) article.body = input.body;
        if (input.slug !== undefined && input.slug) article.slug = input.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        if (input.category_id !== undefined) article.category_id = Number(input.category_id);
        if (input.read_time_minutes !== undefined) article.read_time_minutes = Number(input.read_time_minutes);
        if (input.status !== undefined) {
          if (input.status === "published" && article.status !== "published") article.published_at = new Date().toISOString();
          article.status = input.status;
        }
        article.updated_at = new Date().toISOString();
        return toArticleDetail(article, true) as T;
      }
      if (method === "DELETE") {
        state.articles = state.articles.filter((a) => a.id !== article.id);
        return undefined as T;
      }
    }
    if (p === `${AKB}/articles/import` && method === "POST") {
      const report: KbImportReport = {
        dry_run: bool(body.fields.dry_run),
        committed: false,
        created: 2,
        updated: 1,
        skipped: 0,
        errors: 1,
        rows: [
          { row: 2, title: "How to delegate under pressure", action: "created", message: null },
          { row: 3, title: "Running a great first interview", action: "created", message: null },
          { row: 4, title: "Understanding your monthly invoice", action: "updated", message: null },
          { row: 5, title: "Missing body column", action: "error", message: "Row 5: 'body' is required" },
        ],
      };
      report.committed = !report.dry_run && report.errors === 0;
      return report as T;
    }

    throw new DemoError(404, `Demo backend has no handler for ${method} ${p}`);
  } catch (e) {
    if (e instanceof DemoError) throw Object.assign(new Error(e.message), { status: e.status });
    throw e;
  }
}

function filterTickets(rows: DemoTicket[], q: URLSearchParams): DemoTicket[] {
  let out = rows;
  const status = q.get("status");
  if (status) out = out.filter((t) => t.status === status);
  const category = q.get("category");
  if (category) out = out.filter((t) => t.category === category);
  const priority = q.get("priority");
  if (priority) out = out.filter((t) => t.priority === priority);
  return out;
}
