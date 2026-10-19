import { describe, expect, it } from "vitest";
import { canAccessPath } from "./demo-auth";
import { validatePasswordChange } from "./password-rules";
import { clampRating } from "./data/member-skills";

describe("access", () => {
  it("admin cannot open Cyberbacker University", () => expect(canAccessPath("superadmin", "/cyberbacker-university")).toBe(false));
  it("client can open Cyberbacker University", () => expect(canAccessPath("client", "/cyberbacker-university")).toBe(true));
  it("admin can open User Management", () => expect(canAccessPath("superadmin", "/internal/users")).toBe(true));
});

describe("password change", () => {
  it("rejects short passwords", () => expect(validatePasswordChange("oldpass1", "short", "short")).not.toBeNull());
  it("rejects mismatch", () => expect(validatePasswordChange("oldpass1", "newpassword", "newpassw0rd")).toBe("Passwords do not match."));
  it("rejects same as current", () => expect(validatePasswordChange("samepass1", "samepass1", "samepass1")).not.toBeNull());
  it("accepts valid change", () => expect(validatePasswordChange("oldpass1", "newpassword", "newpassword")).toBeNull());
});

describe("skill rating", () => {
  it("is bounded 1-5", () => { expect(clampRating(9)).toBe(5); expect(clampRating(0)).toBe(1); expect(clampRating(3)).toBe(3); });
});
