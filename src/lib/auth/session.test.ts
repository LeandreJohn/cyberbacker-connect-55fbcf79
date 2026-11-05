import { describe, expect, it } from "vitest";
import { homeForRole, positionToRole } from "./session";
import { toBackendId, toCyberbackerPayload } from "@/lib/api/reviews";

describe("login position routing", () => {
  it("SuperAdmin goes to the admin area", () => {
    expect(homeForRole(positionToRole("SuperAdmin")!)).toBe("/internal");
  });
  it("Client goes to the client dashboard", () => {
    expect(homeForRole(positionToRole("Client")!)).toBe("/dashboard");
  });
  it("other positions get no access", () => {
    expect(positionToRole("Recruiter")).toBeNull();
    expect(positionToRole(null)).toBeNull();
  });
});

describe("review payload", () => {
  it("sends integer id and meets_expectations", () => {
    expect(toBackendId("cb3")).toBe(3);
    const p = toCyberbackerPayload({ cyberbackerId: 3, overall: 4, communication: 5, quality: 4, reliability: 3, timeliness: 4, expectations: 5, comments: " ", recommend: true });
    expect(p.cyberbacker_id).toBe(3);
    expect(p.meets_expectations).toBe(5);
    expect(p.comments).toBeUndefined();
  });
});
