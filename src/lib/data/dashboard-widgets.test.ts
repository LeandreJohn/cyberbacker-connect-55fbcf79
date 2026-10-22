import { expect, test } from "vitest";
import { DEFAULT_WIDGETS, normalizeWidgets, toggleWidget } from "./dashboard-widgets";
test("all four KPI widgets are on by default", () => { expect(Object.values(DEFAULT_WIDGETS)).toEqual([true, true, true, true]); });
test("at least one KPI widget must stay on", () => {
  const one = { activeCyberbackers: true, attendanceRate: false, openTickets: false, upcomingRenewals: false };
  expect(toggleWidget(one, "activeCyberbackers", false)).toEqual(one);
  expect(normalizeWidgets({ activeCyberbackers: false, attendanceRate: false, openTickets: false, upcomingRenewals: false })).toEqual(DEFAULT_WIDGETS);
});
