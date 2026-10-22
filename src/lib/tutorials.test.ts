import { expect, test } from "vitest";
import { DEFAULT_TUTORIALS, markSeen, replayAll, shouldShow, turnOff } from "./tutorials";
import { expectationLabel } from "./expectations";
test("expectation stars: 1 is Doesn't meet, 5 is Exceeds", () => {
  expect(expectationLabel(1)).toBe("Doesn't meet expectations");
  expect(expectationLabel(5)).toBe("Exceeds expectations");
});
test("turning off hides tutorials on every page", () => {
  const off = turnOff(DEFAULT_TUTORIALS);
  expect(shouldShow(off, "/dashboard")).toBe(false);
  expect(shouldShow(off, "/billing")).toBe(false);
});
test("Got it marks only that page as seen", () => {
  const s = markSeen(DEFAULT_TUTORIALS, "/dashboard");
  expect(shouldShow(s, "/dashboard")).toBe(false);
  expect(shouldShow(s, "/billing")).toBe(true);
});
test("replay shows all tutorials again", () => {
  expect(shouldShow(replayAll(), "/dashboard")).toBe(true);
});
