// Per-page tutorial copy. Visibility and progress are stored by the backend
// (GET/POST /settings/tutorials); this module is pure display data.
export interface TutorialInfo {
  title: string;
  body: string;
  tips: string[];
}

export const TUTORIALS: Record<string, TutorialInfo> = {
  "/dashboard": {
    title: "Your client dashboard",
    body: "Everything about your Cyberbacker team on one page — KPIs, attendance, tickets and renewals.",
    tips: ["Choose which KPI cards you see under Settings → Dashboard.", "Use quick actions to hire, get support or export reports."],
  },
  "/my-cyberbackers": {
    title: "My Cyberbackers",
    body: "Your active team members, their roles and latest reviews.",
    tips: ["Open a profile to see details and endorse skills.", "Use “Rate my Cyberbacker” to leave a review."],
  },
  "/marketplace": {
    title: "Hiring Marketplace",
    body: "Browse available Cyberbackers and shortlist candidates that fit your role.",
    tips: ["Filters and search narrow the roster.", "Shortlist candidates to compare them side by side."],
  },
  "/job-builder": {
    title: "Job Description Builder",
    body: "Build a structured job description with requirements, tiers and assessment preferences.",
    tips: ["Saved jobs can be edited any time from the job table.", "Your scoring weights must total 100%."],
  },
  "/reviews": {
    title: "Reviews & Ratings",
    body: "Rate your Cyberbackers individually and Cyberbacker as a company.",
    tips: ["Star ratings cover quality, communication, reliability and timeliness.", "The trend chart follows your average ratings over time."],
  },
  "/attendance": {
    title: "Attendance",
    body: "Daily time logs for your team, including late and leave entries.",
    tips: ["Filter by date range or team member.", "Exports keep your records for payroll."],
  },
  "/performance": {
    title: "Performance Reports",
    body: "Productivity and quality trends for every member of your team.",
    tips: ["Compare months to spot improvements.", "Share findings in your next check-in."],
  },
  "/support": {
    title: "Support Center",
    body: "Open tickets, track progress and talk to our team in one place.",
    tips: ["Attach up to 5 files (10 MB each) per message.", "Mark a ticket resolved once you're happy with the fix."],
  },
  "/knowledge-base": {
    title: "Knowledge Base",
    body: "Guides and best practices for working with Cyberbacker.",
    tips: ["Search by keyword or browse by category.", "Popular articles are shown first."],
  },
  "/contracts": {
    title: "Contracts",
    body: "Your agreements and their renewal dates.",
    tips: ["Renewals surface on your dashboard ahead of time."],
  },
  "/billing": {
    title: "Billing",
    body: "Invoices, payment methods and receipts.",
    tips: ["Due and overdue invoices show a Pay button.", "Subscriptions are charged automatically — receipts appear once paid."],
  },
  "/rewards": {
    title: "Rewards & Coupons",
    body: "Loyalty rewards and discounts you've earned.",
    tips: ["Apply coupons at checkout or share them with your team."],
  },
  "/settings": {
    title: "Settings",
    body: "Profile, password, KPI widgets, tutorials, notifications and appearance.",
    tips: ["Switch between Light, Dark and System themes.", "Turn off all tutorials here or from any popup."],
  },
  "/internal": {
    title: "Operations Dashboard",
    body: "The internal control room — active clients, Cyberbackers, tickets and revenue.",
    tips: ["Drill into department dashboards from the sidebar.", "KPIs follow the same last-one-on rule as the client dashboard."],
  },
  "/internal/tickets": {
    title: "Support Ticket Management",
    body: "Triage, assign and resolve client tickets.",
    tips: ["Internal notes stay private to staff.", "Replying to an open ticket moves it to In Progress."],
  },
  "/internal/knowledge-base": {
    title: "Knowledge Base Management",
    body: "Publish articles, organize categories and import from Excel.",
    tips: ["Use the template for bulk imports — validate with a dry run first.", "Deactivate a category to hide it from clients without deleting it."],
  },
};

export interface TutorialState {
  enabled: boolean;
  completed_pages: string[];
}

export const DEFAULT_TUTORIALS: TutorialState = { enabled: true, completed_pages: [] };

export function shouldShow(state: TutorialState, path: string): boolean {
  return state.enabled && Boolean(TUTORIALS[path]) && !state.completed_pages.includes(path);
}

export function markSeen(state: TutorialState, path: string): TutorialState {
  return state.completed_pages.includes(path)
    ? state
    : { ...state, completed_pages: [...state.completed_pages, path] };
}

export function replayAll(): TutorialState {
  return { enabled: true, completed_pages: [] };
}

export function turnOff(state: TutorialState): TutorialState {
  return { ...state, enabled: false };
}
