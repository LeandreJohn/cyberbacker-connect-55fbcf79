import { useEffect, useState } from "react";

export const KPI_WIDGETS = [
  { key: "activeCyberbackers", label: "Active Cyberbackers" },
  { key: "attendanceRate", label: "Attendance Rate" },
  { key: "openTickets", label: "Open Support Tickets" },
  { key: "upcomingRenewals", label: "Upcoming Renewals" },
] as const;
export type KpiWidgetKey = (typeof KPI_WIDGETS)[number]["key"];
export type DashboardWidgets = Record<KpiWidgetKey, boolean>;
const KEY = "cb-dashboard-widgets";
const EVENT = "cb-dashboard-widgets-change";
export const DEFAULT_WIDGETS: DashboardWidgets = { activeCyberbackers: true, attendanceRate: true, openTickets: true, upcomingRenewals: true };

export function normalizeWidgets(value: Partial<DashboardWidgets> | null | undefined): DashboardWidgets {
  const next = { ...DEFAULT_WIDGETS, ...(value ?? {}) };
  return Object.values(next).some(Boolean) ? next : { ...DEFAULT_WIDGETS };
}
/** Toggling off the last visible widget is refused so the dashboard always shows at least one KPI. */
export function toggleWidget(current: DashboardWidgets, key: KpiWidgetKey, on: boolean): DashboardWidgets {
  const next = { ...current, [key]: on };
  return Object.values(next).some(Boolean) ? next : current;
}
export function readWidgets(): DashboardWidgets {
  try { return normalizeWidgets(JSON.parse(localStorage.getItem(KEY) ?? "null")); } catch { return { ...DEFAULT_WIDGETS }; }
}
export function saveWidgets(value: DashboardWidgets) { localStorage.setItem(KEY, JSON.stringify(value)); window.dispatchEvent(new Event(EVENT)); }
export function useDashboardWidgets() {
  const [widgets, setWidgets] = useState<DashboardWidgets>(DEFAULT_WIDGETS);
  useEffect(() => { const sync = () => setWidgets(readWidgets()); sync(); window.addEventListener(EVENT, sync); return () => window.removeEventListener(EVENT, sync); }, []);
  return widgets;
}
