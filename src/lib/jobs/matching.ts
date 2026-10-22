export type ExperienceTier = "beginner" | "intermediate" | "advanced";
export type SkillLevel = "Basic" | "Intermediate" | "Advanced" | "Expert";
export type MustHaveBehavior = "filter" | "lower-score";
export type EducationLevel = "No preference" | "High school" | "Some college / Undergraduate" | "Associate degree" | "Bachelor's degree" | "Master's degree" | "Doctorate";

export interface TierDefinition { label: string; experience: string; description: string; blurb: string; }
export const EXPERIENCE_TIERS: Record<ExperienceTier, TierDefinition> = {
  beginner: { label: "Beginner", experience: "0–2 years", description: "Early-career talent ready for structured training and close guidance.", blurb: "We are looking for an early-career professional who is coachable, organized, and ready to learn our processes with structured support." },
  intermediate: { label: "Intermediate", experience: "2–5 years", description: "Proven fundamentals with enough experience to own routine work.", blurb: "We are looking for a capable professional who can independently manage recurring work while learning the nuances of our business." },
  advanced: { label: "Advanced", experience: "5+ years", description: "Deep experience and ready to lead the work with minimal ramp-up.", blurb: "We need an experienced professional who can take ownership quickly, improve the process, and deliver with minimal supervision." },
};

export interface SkillRequirement { name: string; level: SkillLevel; kind: "skill" | "tool"; necessity: "must" | "preferred"; yearsExperience?: number; }
export interface LanguageRequirement { language: string; proficiency: number; primary?: boolean; speaking?: number; reading?: number; writing?: number; }
export interface AssessmentPreferences { values: Partial<Record<"AES" | "ECO" | "IND" | "POL" | "ALT" | "REG" | "THE", number | null>>; natural: Partial<Record<"D" | "I" | "S" | "C", number | null>>; modified: Partial<Record<"D" | "I" | "S" | "C", number | null>>; }
export interface ScoringWeights { skills: number; experience: number; responsibilities: number; values: number; disc: number; education: number; }
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = { skills: 40, experience: 25, responsibilities: 20, values: 5, disc: 5, education: 5 };
export const scoringTotal = (weights: ScoringWeights) => Object.values(weights).reduce((sum, value) => sum + value, 0);
export function setCappedWeight(weights: ScoringWeights, key: keyof ScoringWeights, requested: number) {
  const otherTotal = scoringTotal(weights) - weights[key];
  return { ...weights, [key]: Math.max(0, Math.min(100 - otherTotal, Math.round(requested))) };
}

export interface JobMatchProfile {
  title: string; industry: string; tier: ExperienceTier;
  requiredSkills: string[]; preferredSkills: string[]; responsibilities: string[]; deliverables: string[]; tools: string[];
  timezone: string; availabilityHours: string; workStyle: string; language: string; certification: string;
  skillRequirements?: SkillRequirement[]; languages?: LanguageRequirement[]; minimumYears?: number; functionalExpertise?: string[];
  education?: EducationLevel; educationRequired?: boolean; engagementType?: string; shift?: string; startTiming?: string; availabilityNotes?: string;
  assessmentPreferences?: AssessmentPreferences; assessmentPreferencesEnabled?: boolean; mustHaveBehavior?: MustHaveBehavior; weights?: ScoringWeights;
}
export interface MatchableCandidate {
  title: string; yearsExperience: number; skills: string[]; industries: string[]; tools?: string[]; timezone?: string;
  availabilityHours?: string[]; workStyle?: string; languages?: string[]; languageProficiency?: Record<string, number>;
  certifications?: string[]; education?: EducationLevel; functionalExpertise?: string[]; assessmentScore?: number;
}
export interface CandidateMatchResult { score: number; passesConstraints: boolean; strengths: string[]; gaps: string[]; }

const SKILL_ALIASES: Record<string, string> = { "calendar management": "calendar", "email management": "inbox", "project management": "project mgmt", "customer service": "customer support", "transaction coordination": "transaction coordinator", "hubspot crm": "hubspot", "salesforce crm": "salesforce", "gohighlevel crm": "gohighlevel" };
const normalizeTerm = (value: string) => SKILL_ALIASES[value.toLowerCase().trim()] ?? value.toLowerCase().trim();
const normalizedWords = (value: string) => normalizeTerm(value).split(/[^a-z0-9]+/).filter((word) => word.length > 2 && !["management", "assistant", "specialist"].includes(word));
export function termsMatch(left: string, right: string) { const a = normalizeTerm(left); const b = normalizeTerm(right); if (!a || !b) return false; if (a.includes(b) || b.includes(a)) return true; const leftWords = normalizedWords(a); const rightWords = normalizedWords(b); return leftWords.some((word) => rightWords.includes(word)); }
export function tierExperienceMatches(tier: ExperienceTier, years: number) { if (tier === "beginner") return years >= 0 && years <= 2; if (tier === "intermediate") return years >= 2 && years <= 5; return years >= 5; }
function arrayHasMatch(needles: string[], haystack: string[]) { return needles.filter((needle) => haystack.some((value) => termsMatch(needle, value))); }
const EDUCATION_RANK: Record<EducationLevel, number> = { "No preference": 0, "High school": 1, "Some college / Undergraduate": 2, "Associate degree": 3, "Bachelor's degree": 4, "Master's degree": 5, Doctorate: 6 };

export function scoreCandidate(profile: JobMatchProfile, candidate: MatchableCandidate): CandidateMatchResult {
  const mustHaves = profile.skillRequirements?.filter((item) => item.necessity === "must").map((item) => item.name) ?? profile.requiredSkills;
  const preferred = profile.skillRequirements?.filter((item) => item.necessity === "preferred").map((item) => item.name) ?? profile.preferredSkills;
  const toolNeeds = profile.skillRequirements?.filter((item) => item.kind === "tool").map((item) => item.name) ?? profile.tools;
  const requiredHits = arrayHasMatch(mustHaves, [...candidate.skills, ...(candidate.tools ?? [])]);
  const preferredHits = arrayHasMatch(preferred, candidate.skills);
  const toolHits = arrayHasMatch(toolNeeds, candidate.tools ?? candidate.skills);
  const experiencePass = profile.minimumYears != null ? candidate.yearsExperience >= profile.minimumYears : tierExperienceMatches(profile.tier, candidate.yearsExperience);
  const timezonePass = !profile.timezone || !candidate.timezone || termsMatch(profile.timezone, candidate.timezone);
  const requestedShift = profile.shift || profile.availabilityHours;
  const shiftPass = !requestedShift || !candidate.availabilityHours?.length || candidate.availabilityHours.some((hours) => termsMatch(requestedShift, hours));
  const requestedLanguages = profile.languages?.length ? profile.languages : profile.language && profile.language !== "No preference" ? [{ language: profile.language, proficiency: 1 }] : [];
  const languagePass = requestedLanguages.every((need) => candidate.languages?.some((language) => termsMatch(need.language, language) && (candidate.languageProficiency?.[language] ?? 5) >= need.proficiency) ?? true);
  const certificationPass = !profile.certification || !candidate.certifications?.length || candidate.certifications.some((certification) => termsMatch(profile.certification, certification));
  const educationPass = !profile.education || profile.education === "No preference" || !candidate.education || EDUCATION_RANK[candidate.education] >= EDUCATION_RANK[profile.education];
  const requiredPass = requiredHits.length === mustHaves.length;
  const strictMustHave = (profile.mustHaveBehavior ?? "filter") === "filter";
  const passesConstraints = (!strictMustHave || requiredPass) && experiencePass && timezonePass && shiftPass && languagePass && certificationPass && (!profile.educationRequired || educationPass);
  const weights = profile.weights ?? DEFAULT_SCORING_WEIGHTS;
  const skillPool = mustHaves.length + preferred.length + toolNeeds.length;
  const skillScore = skillPool ? ((requiredHits.length + preferredHits.length + toolHits.length) / skillPool) * weights.skills : weights.skills;
  const experienceScore = experiencePass ? weights.experience : 0;
  const contextTerms = [...profile.responsibilities, ...profile.deliverables, profile.title, profile.industry, ...(profile.functionalExpertise ?? [])];
  const contextHaystack = [candidate.title, ...candidate.skills, ...candidate.industries, ...(candidate.functionalExpertise ?? [])];
  const contextHits = arrayHasMatch(contextTerms, contextHaystack);
  const responsibilityScore = contextTerms.length ? Math.min(weights.responsibilities, (contextHits.length / contextTerms.length) * weights.responsibilities) : weights.responsibilities;
  const assessmentScore = ((candidate.assessmentScore ?? 80) / 100) * ((weights.values ?? 0) + (weights.disc ?? 0));
  const educationScore = educationPass ? weights.education : 0;
  const strengths = [requiredHits.length ? `${requiredHits.length}/${mustHaves.length} must-have skills` : "Experience aligned", experiencePass ? `${candidate.yearsExperience} years of experience` : "", shiftPass ? "Shift compatible" : "", languagePass && requestedLanguages.length ? "Language requirements met" : "", preferredHits.length ? `${preferredHits.length} preferred skill${preferredHits.length === 1 ? "" : "s"}` : ""].filter(Boolean).slice(0, 3);
  const gaps = [...mustHaves.filter((skill) => !requiredHits.includes(skill)).map((skill) => `Missing ${skill}`), !experiencePass ? `Below ${profile.minimumYears ?? EXPERIENCE_TIERS[profile.tier].experience} experience` : "", !shiftPass ? "Shift mismatch" : "", !languagePass ? "Language proficiency mismatch" : "", !educationPass ? "Education requirement not met" : ""].filter(Boolean).slice(0, 3);
  return { score: Math.min(100, Math.round(skillScore + experienceScore + responsibilityScore + assessmentScore + educationScore)), passesConstraints, strengths, gaps };
}
