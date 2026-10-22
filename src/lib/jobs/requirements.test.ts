import { expect, test } from "vitest";
import { createBlankJob, migrateWeights, normalizeJob } from "@/lib/data/jobs";
import { setRankedScore, rankOf, makePrimary, normalizeLanguages, optionalNumber, preferenceText, ratingValue, validDuration } from "./requirements";
import { scoreCandidate } from "./matching";
import { parseJobText } from "./import";
import { canAccessPath } from "@/lib/demo-auth";

test("raw assessment scores are optional and bounded 0–100", () => {
  expect(optionalNumber("", 100)).toBeUndefined();
  expect(optionalNumber("0", 100)).toBe(0);
  expect(optionalNumber("101", 100)).toBe(100);
  expect(optionalNumber("-1", 100)).toBe(0);
});
test("skill experience is optional and nonnegative", () => {
  expect(optionalNumber("")).toBeUndefined();
  expect(optionalNumber("2.5")).toBe(2.5);
  expect(optionalNumber("-2")).toBe(0);
});
test("language ratings remain within 1–5", () => {
  expect(ratingValue(0)).toBe(1);
  expect(ratingValue(6)).toBe(5);
});
test("languages always have exactly one primary when nonempty", () => {
  const languages = normalizeLanguages([{ language: "English", proficiency: 4 }, { language: "Tagalog", proficiency: 5 }]);
  expect(languages.filter((item) => item.primary).map((item) => item.language)).toEqual(["English"]);
  expect(makePrimary(languages, "Tagalog").filter((item) => item.primary).map((item) => item.language)).toEqual(["Tagalog"]);
});
test("old jobs preserve overall ratings and initialize new language details", () => {
  const job = normalizeJob({ ...createBlankJob(), duration: "Temporary / project-based" });
  expect(job.languages[0]).toEqual({ language: "English", proficiency: 4, primary: true, speaking: 4, reading: 4, writing: 4 });
  expect(job.skillRequirements).toEqual([]);
  expect(Object.keys(job.assessmentPreferences?.values ?? {})).toEqual(["AES", "ECO", "IND", "POL", "ALT", "REG", "THE"]);
  expect(job.duration).toBe("");
});
test("temporary duration is no longer supported", () => {
  expect(validDuration("Temporary / project-based")).toBe(false);
  expect(validDuration("")).toBe(false);
  expect(validDuration("Long-term / ongoing")).toBe(true);
});
test("save-only skill years and assessment targets do not affect matching", () => {
  const job = { ...createBlankJob(), skillRequirements: [{ name: "Dialpad", level: "Advanced" as const, kind: "tool" as const, necessity: "must" as const }] };
  const candidate = { title: "Assistant", skills: ["Dialpad"], industries: [], yearsExperience: 3 };
  const original = scoreCandidate(job, candidate);
  const changed = scoreCandidate({ ...job, assessmentPreferencesEnabled: true, assessmentPreferences: { values: { AES: 99 }, natural: { D: 100 }, modified: { C: 0 } }, skillRequirements: job.skillRequirements.map((item) => ({ ...item, yearsExperience: 20 })), languages: job.languages.map((item) => ({ ...item, speaking: 1, reading: 5, writing: 2, primary: true })) }, candidate);
  expect(changed).toEqual(original);
});
test("preference exports include entered skill years and distinct DISC targets", () => {
  const text = preferenceText({ ...normalizeJob(createBlankJob()), skillRequirements: [{ name: "Dialpad", level: "Advanced", yearsExperience: 2.5 }], assessmentPreferencesEnabled: true, assessmentPreferences: { values: { AES: 63 }, natural: { D: 67 }, modified: { D: 70 } } });
  expect(text).toContain("Dialpad: Advanced · 2.5 years");
  expect(text).toContain("DISC Natural: #1 D 67");
  expect(text).toContain("DISC Modified: #1 D 70");
});

test("values allow at most 4 ranked scores and clearing moves ranks up", () => {
  let v: Record<string, number | undefined> = {};
  for (const k of ["AES", "ECO", "IND", "POL", "ALT"]) v = setRankedScore(v, k, 50, 4);
  expect(Object.keys(v)).toEqual(["AES", "ECO", "IND", "POL"]);
  v = setRankedScore(v, "AES", undefined, 4);
  expect(rankOf(v, "ECO")).toBe(1);
  v = setRankedScore(v, "IND", 90, 4);
  expect(rankOf(v, "IND")).toBe(2);
});
test("DISC natural and modified allow only top 2", () => {
  let d: Record<string, number | undefined> = {};
  for (const k of ["D", "I", "S"]) d = setRankedScore(d, k, 60, 2);
  expect(Object.keys(d)).toEqual(["D", "I"]);
});
test("default weights total 100 with Values and DISC at 5%", () => {
  const w = createBlankJob().weights;
  expect(w.values).toBe(5); expect(w.disc).toBe(5);
  expect(Object.values(w).reduce((a, b) => a + b, 0)).toBe(100);
});
test("legacy assessment weight splits into values and disc; authentic becomes natural", () => {
  expect(migrateWeights({ skills: 40, experience: 25, responsibilities: 20, assessment: 10, education: 5 } as never)).toEqual({ skills: 40, experience: 25, responsibilities: 20, values: 5, disc: 5, education: 5 });
  const job = normalizeJob({ ...createBlankJob(), assessmentPreferences: { authentic: { D: 1, I: 2, S: 3 } } as never });
  expect(job.assessmentPreferences?.natural).toEqual({ D: 1, I: 2, S: null, C: null });
});

test("imported text detects title, bullets, and specific tools", () => {
  const d = parseJobText("Job Title: Executive Assistant\nResponsibilities:\n• Manage inbox in Google Workspace\n- Log calls in Dialpad and HubSpot");
  expect(d.title).toBe("Executive Assistant");
  expect(d.responsibilities).toHaveLength(2);
  expect(d.tools).toEqual(expect.arrayContaining(["Dialpad", "HubSpot CRM", "Google Workspace"]));
});

import { addRanked, moveRanked, removeRanked, rankedKeys, setScoreInPlace } from "./requirements";
test("left-to-right ranking enforces limits and reorders", () => {
  let v: Record<string, number | null> = {};
  for (const k of ["AES", "ECO", "IND", "POL", "ALT"]) v = addRanked(v, k, 4);
  expect(rankedKeys(v)).toEqual(["AES", "ECO", "IND", "POL"]);
  v = moveRanked(v, "POL", 0);
  expect(rankedKeys(v)).toEqual(["POL", "AES", "ECO", "IND"]);
  v = setScoreInPlace(v, "ECO", 80);
  expect(rankedKeys(v)).toEqual(["POL", "AES", "ECO", "IND"]);
  expect(v.ECO).toBe(80);
  v = removeRanked(v, "AES");
  expect(rankedKeys(v)).toEqual(["POL", "ECO", "IND"]);
  let d: Record<string, number | null> = {};
  for (const k of ["D", "I", "S"]) d = addRanked(d, k, 2);
  expect(rankedKeys(d)).toEqual(["D", "I"]);
});

import { normalizeRanked, VALUE_KEYS } from "./requirements";
test("all values ranked; only top 4 keep scores", () => {
  let v = normalizeRanked({ IND: 70 }, VALUE_KEYS, 4);
  expect(Object.keys(v)).toEqual(["IND", "AES", "ECO", "POL", "ALT", "REG", "THE"]);
  v = normalizeRanked(moveRanked(v, "IND", 5), VALUE_KEYS, 4);
  expect(Object.keys(v)[5]).toBe("IND");
  expect(v.IND).toBeNull();
});
