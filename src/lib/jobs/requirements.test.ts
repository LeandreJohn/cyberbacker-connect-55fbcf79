import { expect, test } from "vitest";
import { createBlankJob, normalizeJob } from "@/lib/data/jobs";
import { makePrimary, normalizeLanguages, optionalNumber, preferenceText, ratingValue, validDuration } from "./requirements";
import { scoreCandidate } from "./matching";
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
  expect(job.assessmentPreferences).toEqual({ values: {}, authentic: {}, modified: {} });
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
  const changed = scoreCandidate({ ...job, assessmentPreferencesEnabled: true, assessmentPreferences: { values: { AES: 99 }, authentic: { D: 100 }, modified: { C: 0 } }, skillRequirements: job.skillRequirements.map((item) => ({ ...item, yearsExperience: 20 })), languages: job.languages.map((item) => ({ ...item, speaking: 1, reading: 5, writing: 2, primary: true })) }, candidate);
  expect(changed).toEqual(original);
});
test("preference exports include entered skill years and distinct DISC targets", () => {
  const text = preferenceText({ ...normalizeJob(createBlankJob()), skillRequirements: [{ name: "Dialpad", level: "Advanced", yearsExperience: 2.5 }], assessmentPreferencesEnabled: true, assessmentPreferences: { values: { AES: 63 }, authentic: { D: 67 }, modified: { D: 70 } } });
  expect(text).toContain("Dialpad: Advanced · 2.5 years");
  expect(text).toContain("DISC Authentic: D 67");
  expect(text).toContain("DISC Modified: D 70");
});
test("both demo roles can open University", () => {
  expect(canAccessPath("client", "/cyberbacker-university")).toBe(true);
  expect(canAccessPath("superadmin", "/cyberbacker-university")).toBe(true);
});