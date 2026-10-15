import type { LanguageRequirement } from "./matching";

export const ROLE_DURATIONS = ["3–6 months", "6–12 months", "Long-term / ongoing", "Not sure yet"];
export const validDuration = (value: string) => ROLE_DURATIONS.includes(value);
export function optionalNumber(value: string, max = Infinity): number | undefined {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(0, number)) : undefined;
}
export const ratingValue = (value: number) => Number.isFinite(value) ? Math.min(5, Math.max(1, Math.round(value))) : 3;
export function normalizeLanguages(items: LanguageRequirement[]): LanguageRequirement[] {
  const primaryIndex = Math.max(0, items.findIndex((item) => item.primary));
  return items.map((item, index) => ({ ...item, proficiency: ratingValue(item.proficiency), primary: index === primaryIndex, speaking: ratingValue(item.speaking ?? item.proficiency), reading: ratingValue(item.reading ?? item.proficiency), writing: ratingValue(item.writing ?? item.proficiency) }));
}
export const makePrimary = (items: LanguageRequirement[], language: string) => normalizeLanguages(items.map((item) => ({ ...item, primary: item.language === language })));
export function preferenceText(job: { skillRequirements: { name: string; level: string; yearsExperience?: number }[]; languages: LanguageRequirement[]; assessmentPreferencesEnabled?: boolean; assessmentPreferences?: { values: object; authentic: object; modified: object } }) {
  const lines = ["Skill & tool experience:", ...job.skillRequirements.map((item) => `• ${item.name}: ${item.level}${item.yearsExperience == null ? "" : ` · ${item.yearsExperience} years`}`), "", "Language competencies:", ...job.languages.map((item) => `• ${item.language}${item.primary ? " (Primary)" : ""}: overall ${item.proficiency}/5 · Speaking ${item.speaking ?? item.proficiency}/5 · Reading ${item.reading ?? item.proficiency}/5 · Writing ${item.writing ?? item.proficiency}/5`)];
  if (job.assessmentPreferencesEnabled && job.assessmentPreferences) {
    const scores = (items: object) => Object.entries(items).filter(([, value]) => value != null).map(([key, value]) => `${key} ${value}`).join(" · ") || "No preference";
    lines.push("", "Desired assessment scores:", `Values: ${scores(job.assessmentPreferences.values)}`, `DISC Authentic: ${scores(job.assessmentPreferences.authentic)}`, `DISC Modified: ${scores(job.assessmentPreferences.modified)}`);
  }
  return lines.join("\n");
}