import type { SavedJob } from "@/lib/data/jobs";

export const IMPORT_DRAFT_KEY = "cb-import-draft";
export const KNOWN_TOOLS = ["Monday.com", "GoHighLevel CRM", "HubSpot CRM", "Salesforce CRM", "Buildium", "Yardi Breeze", "RentRedi", "Google Workspace", "Slack", "Canva", "QuickBooks Online", "Zendesk", "Dialpad", "Asana", "Trello", "Notion", "Microsoft 365"];
export const KNOWN_SKILLS = ["Calendar Management", "Email Management", "Lead Generation", "Social Media Management", "Bookkeeping", "Customer Service", "Transaction Coordination", "Data Entry", "Project Coordination", "Content Writing", "Graphic Design", "Recruiting", "Sales Outreach", "Research", "Reporting & Analytics", "Accounts Payable", "Process Documentation"];

const toolKey = (name: string) => name.toLowerCase().replace(/\s*crm$/, "").replace(/online$/, "").trim();

/** Pure heuristic extraction of a job draft from pasted/uploaded job description text. */
export function parseJobText(text: string): Partial<SavedJob> {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const titleLine = lines.find((l) => /^(job\s*title|title|position|role)\s*[:\-–]/i.test(l));
  const title = (titleLine ? titleLine.replace(/^[^:\-–]+[:\-–]\s*/, "") : lines.find((l) => !/^[•\-*\d]/.test(l) && l.length <= 80) ?? "").trim();
  const tasks: string[] = []; const responsibilities: string[] = [];
  let section: "tasks" | "resp" | null = null;
  for (const line of lines) {
    if (/^(key\s+)?(tasks|duties)\b/i.test(line)) { section = "tasks"; continue; }
    if (/^(key\s+)?responsibilit/i.test(line)) { section = "resp"; continue; }
    if (/^(requirements|qualifications|skills|about|benefits)\b/i.test(line)) { section = null; continue; }
    const bullet = line.match(/^(?:[•\-*▪●◦]|\d+[.)])\s*(.+)$/);
    if (bullet) (section === "tasks" ? tasks : responsibilities).push(bullet[1].trim());
  }
  const lower = text.toLowerCase();
  const tools = KNOWN_TOOLS.filter((t) => lower.includes(toolKey(t)));
  const skills = KNOWN_SKILLS.filter((s) => lower.includes(s.toLowerCase()));
  const skillRequirements = [...skills.map((name) => ({ name, level: "Intermediate" as const, kind: "skill" as const, necessity: "preferred" as const })), ...tools.map((name) => ({ name, level: "Intermediate" as const, kind: "tool" as const, necessity: "preferred" as const }))];
  return { title, tasks: tasks.slice(0, 15), responsibilities: responsibilities.slice(0, 15), skillRequirements, preferredSkills: skillRequirements.map((s) => s.name), tools };
}
