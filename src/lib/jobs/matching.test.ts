import { describe, expect, test } from "vitest";

import { scoreCandidate, setCappedWeight, tierExperienceMatches, type JobMatchProfile } from "./matching";

const profile: JobMatchProfile = {
  title: "Executive Assistant",
  industry: "Professional Services",
  tier: "intermediate",
  requiredSkills: ["Calendar Management"],
  preferredSkills: ["CRM"],
  responsibilities: ["Manage the calendar"],
  deliverables: ["Weekly priorities report"],
  tools: ["Google Workspace"],
  timezone: "Eastern",
  availabilityHours: "Standard business hours",
  workStyle: "Proactive",
  language: "English",
  certification: "",
};

const candidate = {
  title: "Executive Assistant",
  yearsExperience: 4,
  skills: ["Calendar", "Inbox"],
  industries: ["Professional Services"],
  tools: ["Google Workspace"],
  timezone: "Eastern",
  availabilityHours: ["Standard business hours"],
  workStyle: "Proactive",
  languages: ["English"],
};

describe("experience tiers", () => {
  test("Beginner includes 0–1 year", () => {
    expect(tierExperienceMatches("beginner", 0)).toBe(true);
    expect(tierExperienceMatches("beginner", 1)).toBe(true);
    expect(tierExperienceMatches("beginner", 2)).toBe(false);
  });

  test("Intermediate includes 1–4 years", () => {
    expect(tierExperienceMatches("intermediate", 1)).toBe(true);
    expect(tierExperienceMatches("intermediate", 4)).toBe(true);
    expect(tierExperienceMatches("intermediate", 5)).toBe(false);
  });

  test("Advanced includes 4+ years", () => {
    expect(tierExperienceMatches("advanced", 3)).toBe(false);
    expect(tierExperienceMatches("advanced", 4)).toBe(true);
  });
});

test("missing a required skill fails constraints while a preferred skill does not", () => {
  expect(scoreCandidate(profile, candidate).passesConstraints).toBe(true);
  expect(scoreCandidate({ ...profile, requiredSkills: ["Email Management"] }, { ...candidate, skills: ["Inbox"] }).passesConstraints).toBe(true);
  expect(scoreCandidate({ ...profile, requiredSkills: ["Bookkeeping"] }, candidate).passesConstraints).toBe(false);
  expect(scoreCandidate({ ...profile, preferredSkills: ["Bookkeeping"] }, candidate).passesConstraints).toBe(true);
});

test("an explicit operational mismatch fails constraints", () => {
  expect(scoreCandidate(profile, { ...candidate, timezone: "Pacific" }).passesConstraints).toBe(false);
});

test("scoring weights can never exceed 100 percent", () => {
  const weights = { skills: 40, experience: 25, responsibilities: 20, assessment: 10, education: 5 };
  expect(setCappedWeight(weights, "skills", 80)).toEqual({ ...weights, skills: 40 });
  expect(setCappedWeight({ ...weights, education: 0 }, "skills", 45).skills).toBe(45);
});

test("lower-score mode keeps candidates missing a must-have in results", () => {
  const strict = scoreCandidate({ ...profile, requiredSkills: ["Bookkeeping"], mustHaveBehavior: "filter" }, candidate);
  const flexible = scoreCandidate({ ...profile, requiredSkills: ["Bookkeeping"], mustHaveBehavior: "lower-score" }, candidate);
  expect(strict.passesConstraints).toBe(false);
  expect(flexible.passesConstraints).toBe(true);
  expect(flexible.score).toBeLessThan(scoreCandidate(profile, candidate).score);
});

test("language proficiency and required education act as constraints", () => {
  const expanded = { ...profile, languages: [{ language: "English", proficiency: 5 }], education: "Bachelor's degree" as const, educationRequired: true };
  expect(scoreCandidate(expanded, { ...candidate, languageProficiency: { English: 4 }, education: "Bachelor's degree" }).passesConstraints).toBe(false);
  expect(scoreCandidate(expanded, { ...candidate, languageProficiency: { English: 5 }, education: "Some college / Undergraduate" }).passesConstraints).toBe(false);
});

test("shift compatibility is enforced", () => {
  expect(scoreCandidate({ ...profile, shift: "Evening coverage" }, candidate).passesConstraints).toBe(false);
});