import { useEffect, useState } from "react";

export interface Tutorial { title: string; body: string; tips: string[] }
export const TUTORIALS: Record<string, Tutorial> = {
  "/dashboard": { title: "Your dashboard", body: "A quick view of your team, tickets and renewals.", tips: ["Announcements appear at the top.", "Choose which KPI cards show in Settings → Dashboard.", "Use Quick actions to hire, get support or download reports."] },
  "/my-cyberbackers": { title: "My Cyberbackers", body: "Everyone currently working with you.", tips: ["Open View profile to rate or add skills.", "Use Rate my Cyberbacker to leave a review."] },
  "/marketplace": { title: "Hiring Marketplace", body: "Browse and compare available Cyberbackers.", tips: ["Use search and filters to narrow results.", "Shortlist candidates or schedule an interview."] },
  "/job-builder": { title: "Job Description Builder", body: "Create roles and match them to candidates.", tips: ["Click New Job to start blank or paste an existing description.", "Saved jobs appear in the table to edit later."] },
  "/reviews": { title: "Reviews & Ratings", body: "Rate your Cyberbackers and Cyberbacker as a company.", tips: ["Switch tabs to rate the company.", "Star ratings go from Doesn't meet to Exceeds expectations."] },
  "/attendance": { title: "Attendance", body: "Daily time logs and attendance for your team.", tips: ["Check late or absent days at a glance."] },
  "/performance": { title: "Performance Reports", body: "Productivity and quality trends for your team.", tips: ["Export reports from the dashboard's Quick actions."] },
  "/support": { title: "Support Center", body: "Create and track support tickets.", tips: ["Filter by status or category.", "Attach files when creating a ticket."] },
  "/knowledge-base": { title: "Knowledge Base", body: "Guides and answers to common questions.", tips: ["Search for a topic to find articles fast."] },
  "/cyberbacker-university": { title: "Cyberbacker University", body: "Training resources for working with Cyberbackers.", tips: ["New courses will appear here."] },
  "/contracts": { title: "Contracts", body: "Your agreements and their status.", tips: ["Download signed copies anytime."] },
  "/billing": { title: "Billing", body: "Invoices, payments and plan details.", tips: ["Check due dates to avoid late payments."] },
  "/rewards": { title: "Rewards & Coupons", body: "Referral rewards and available coupons.", tips: ["Refer a business to earn account credit."] },
  "/settings": { title: "Settings", body: "Manage your profile, password and preferences.", tips: ["Turn tutorials on or off in the Tutorials tab."] },
  "/internal": { title: "Operations Dashboard", body: "Company-wide metrics across departments.", tips: ["See upcoming client renewals in the table.", "Use department tabs to drill down."] },
  "/internal/clients": { title: "Client Management", body: "All client accounts and their health.", tips: ["Watch at-risk accounts closely."] },
  "/internal/cyberbackers": { title: "Cyberbacker Management", body: "Roster, attendance and performance of Cyberbackers.", tips: ["Open a profile to request coaching or schedule a review."] },
  "/internal/recruitment": { title: "Recruitment Pipeline", body: "Candidates moving through hiring stages.", tips: ["Track offers and placements."] },
  "/internal/tickets": { title: "Support Tickets", body: "All client tickets in one queue.", tips: ["Prioritize by SLA and urgency."] },
  "/internal/finance": { title: "Finance Dashboard", body: "Revenue, invoices and payouts.", tips: ["Review overdue invoices regularly."] },
  "/internal/analytics": { title: "Analytics Dashboard", body: "Trends across clients and talent.", tips: ["Compare periods to spot changes."] },
  "/internal/executive": { title: "Executive Dashboard", body: "High-level KPIs and strategic insights.", tips: ["Use insights to guide quarterly priorities."] },
  "/internal/admin": { title: "System Administration", body: "Platform configuration and audit info.", tips: ["Changes here affect all users."] },
  "/internal/users": { title: "User Management", body: "Manage staff accounts and roles.", tips: ["Invite staff and assign their roles."] },
};

export interface TutorialState { enabled: boolean; seen: string[] }
const KEY = "cb-tutorials";
const EVENT = "cb-tutorials-change";
export const DEFAULT_TUTORIALS: TutorialState = { enabled: true, seen: [] };
export const shouldShow = (s: TutorialState, path: string) => s.enabled && path in TUTORIALS && !s.seen.includes(path);
export const markSeen = (s: TutorialState, path: string): TutorialState => ({ ...s, seen: s.seen.includes(path) ? s.seen : [...s.seen, path] });
export const turnOff = (s: TutorialState): TutorialState => ({ ...s, enabled: false });
export const replayAll = (): TutorialState => ({ enabled: true, seen: [] });

export function readTutorials(): TutorialState {
  try { return { ...DEFAULT_TUTORIALS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }; } catch { return { ...DEFAULT_TUTORIALS }; }
}
export function saveTutorials(s: TutorialState) { localStorage.setItem(KEY, JSON.stringify(s)); window.dispatchEvent(new Event(EVENT)); }
export function useTutorials(): TutorialState | null {
  const [state, setState] = useState<TutorialState | null>(null);
  useEffect(() => { const sync = () => setState(readTutorials()); sync(); window.addEventListener(EVENT, sync); return () => window.removeEventListener(EVENT, sync); }, []);
  return state;
}
