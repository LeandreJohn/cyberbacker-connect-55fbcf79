import type { EducationLevel, ExperienceTier, JobMatchProfile, LanguageRequirement, MustHaveBehavior, ScoringWeights, SkillRequirement } from "@/lib/jobs/matching";
import { DEFAULT_SCORING_WEIGHTS } from "@/lib/jobs/matching";

export interface SavedJob extends JobMatchProfile {
  id: string; department: string; duration: string; tasks: string[]; certification: string; communication: string; checkIns: string;
  hours: number; engagementType: string; startTiming: string; availabilityNotes: string; status: "Draft" | "Active"; updatedAt: string; candidateCount: number;
  skillRequirements: SkillRequirement[]; languages: LanguageRequirement[]; minimumYears: number; functionalExpertise: string[];
  education: EducationLevel; educationRequired: boolean; mustHaveBehavior: MustHaveBehavior; weights: ScoringWeights;
}
const STORAGE_KEY = "cb-saved-jobs";
export const createBlankJob = (): SavedJob => ({ id: `job-${Date.now()}`, title: "", department: "", industry: "Professional Services", duration: "Long-term / ongoing", tier: "intermediate" as ExperienceTier, tasks: [], responsibilities: [], deliverables: [], requiredSkills: [], preferredSkills: [], tools: [], skillRequirements: [], certification: "", languages: [{ language: "English", proficiency: 4 }], language: "English", timezone: "Eastern", availabilityHours: "Standard business hours (9am–5pm)", workStyle: "Proactive", communication: "Slack", checkIns: "Daily summary", minimumYears: 1, functionalExpertise: [], education: "No preference", educationRequired: false, engagementType: "Full-time", hours: 40, shift: "Standard business hours (9am–5pm)", startTiming: "Immediate", availabilityNotes: "", mustHaveBehavior: "filter", weights: { ...DEFAULT_SCORING_WEIGHTS }, status: "Draft", updatedAt: new Date().toISOString(), candidateCount: 0 });
const seedJobs = (): SavedJob[] => {
  const first = createBlankJob(); return [{ ...first, id: "job-ea", title: "Executive Virtual Assistant", department: "Operations", tasks: ["Manage daily calendar and meetings"], responsibilities: ["Keep CRM records up to date"], deliverables: ["Weekly priorities report"], skillRequirements: [{ name: "Calendar Management", level: "Advanced", kind: "skill", necessity: "must" }, { name: "Email Management", level: "Advanced", kind: "skill", necessity: "must" }, { name: "HubSpot CRM", level: "Intermediate", kind: "tool", necessity: "preferred" }], requiredSkills: ["Calendar Management", "Email Management"], preferredSkills: ["HubSpot CRM"], tools: ["HubSpot CRM"], functionalExpertise: ["Administrative & Executive Support"], status: "Active", updatedAt: "2026-10-08T09:30:00.000Z", candidateCount: 3 }];
};
export function getSavedJobs(): SavedJob[] { if (typeof window === "undefined") return seedJobs(); const stored = window.localStorage.getItem(STORAGE_KEY); if (!stored) return seedJobs(); try { return JSON.parse(stored) as SavedJob[]; } catch { return seedJobs(); } }
export function saveJob(job: SavedJob) { const jobs = getSavedJobs(); const next = [{ ...job, updatedAt: new Date().toISOString() }, ...jobs.filter((item) => item.id !== job.id)]; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; }
