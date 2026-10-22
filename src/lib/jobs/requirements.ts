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
export function preferenceText(job: { skillRequirements: { name: string; level: string; yearsExperience?: number }[]; languages: LanguageRequirement[]; assessmentPreferencesEnabled?: boolean; assessmentPreferences?: { values: object; natural: object; modified: object } }) {
  const lines = ["Skill & tool experience:", ...job.skillRequirements.map((item) => `• ${item.name}: ${item.level}${item.yearsExperience == null ? "" : ` · ${item.yearsExperience} years`}`), "", "Language competencies:", ...job.languages.map((item) => `• ${item.language}${item.primary ? " (Primary)" : ""}: overall ${item.proficiency}/5 · Speaking ${item.speaking ?? item.proficiency}/5 · Reading ${item.reading ?? item.proficiency}/5 · Writing ${item.writing ?? item.proficiency}/5`)];
  if (job.assessmentPreferencesEnabled && job.assessmentPreferences) {
    const scores = (items: object) => Object.entries(items).filter(([, value]) => value !== undefined).map(([key, value], index) => `#${index + 1} ${key} ${value ?? "—"}`).join(" · ") || "No preference";
    lines.push("", "Desired assessment scores:", `Values: ${scores(job.assessmentPreferences.values)}`, `DISC Natural: ${scores(job.assessmentPreferences.natural)}`, `DISC Modified: ${scores(job.assessmentPreferences.modified)}`);
  }
  return lines.join("\n");
}
export const VALUES_LIMIT = 4;
export const DISC_LIMIT = 2;
/** Scores rank by entry order (object insertion order); clearing a score removes it so later ones move up. */
export function setRankedScore<T extends Record<string, number | undefined>>(scores: T, key: string, value: number | undefined, limit: number): T {
  const next: Record<string, number> = {};
  for (const [name, score] of Object.entries(scores)) if (score != null && name !== key) next[name] = score;
  const exists = scores[key] != null;
  if (value == null) return next as T;
  if (!exists && Object.keys(next).length >= limit) return scores;
  if (exists) { const ordered: Record<string, number> = {}; for (const [name, score] of Object.entries(scores)) if (score != null) ordered[name] = name === key ? value : score; return ordered as T; }
  return { ...next, [key]: value } as T;
}
export const rankOf = (scores: Record<string, number | undefined>, key: string) => { const keys = Object.entries(scores).filter(([, v]) => v != null).map(([k]) => k); const i = keys.indexOf(key); return i < 0 ? undefined : i + 1; };
export function limitScores(scores: Record<string, number | null | undefined> | undefined, limit: number) { return Object.fromEntries(Object.entries(scores ?? {}).filter(([, v]) => v !== undefined).slice(0, limit)) as Record<string, number | null>; }
type Ranked = Record<string, number | null | undefined>;
/** Ordered keys = left-to-right importance. A null score means "added, no score yet". */
export const rankedKeys = (scores: Ranked) => Object.entries(scores).filter(([, v]) => v !== undefined).map(([k]) => k);
const rebuild = <T extends Ranked>(scores: T, keys: string[]) => Object.fromEntries(keys.map((k) => [k, scores[k] ?? null])) as T;
export function addRanked<T extends Ranked>(scores: T, key: string, limit: number): T { const keys = rankedKeys(scores); if (keys.includes(key) || keys.length >= limit) return scores; return rebuild(scores, [...keys, key]); }
export function removeRanked<T extends Ranked>(scores: T, key: string): T { return rebuild(scores, rankedKeys(scores).filter((k) => k !== key)); }
export function moveRanked<T extends Ranked>(scores: T, key: string, toIndex: number): T { const keys = rankedKeys(scores).filter((k) => k !== key); if (keys.length === rankedKeys(scores).length) return scores; keys.splice(Math.max(0, Math.min(keys.length, toIndex)), 0, key); return rebuild(scores, keys); }
export function setScoreInPlace<T extends Ranked>(scores: T, key: string, value: number | undefined): T { if (!rankedKeys(scores).includes(key)) return scores; return { ...scores, [key]: value ?? null }; }
