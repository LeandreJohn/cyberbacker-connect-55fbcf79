import { describe, expect, test } from "vitest";

import { candidates } from "./mock";

const valuesKeys = ["AES", "ECO", "IND", "POL", "ALT", "REG", "THE"];
const discKeys = ["D", "I", "S", "C"];

describe("applicant profile assessment data", () => {
  test.each(candidates)("$id has all raw Values and DISC scores", (candidate) => {
    expect(candidate.profile).toBeDefined();
    expect(Object.keys(candidate.profile?.valuesBreakdown ?? {})).toEqual(valuesKeys);
    expect(Object.keys(candidate.profile?.disc ?? {})).toEqual(discKeys);
    expect(Object.values(candidate.profile?.valuesBreakdown ?? {}).every((score) => score >= 0 && score <= 100)).toBe(true);
    expect(Object.values(candidate.profile?.disc ?? {}).every((score) => score >= 0 && score <= 100)).toBe(true);
  });

  test.each(candidates)("$id has a 1–5 rating for every profile language", (candidate) => {
    expect(candidate.profile?.languages.length).toBeGreaterThan(0);
    expect(candidate.profile?.languages.every(({ proficiency }) => proficiency >= 1 && proficiency <= 5)).toBe(true);
  });
});