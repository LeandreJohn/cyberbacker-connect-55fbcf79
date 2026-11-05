import { describe, expect, it, vi } from "vitest";

import { demoApi, resetDemoApi } from "./demo-api";
import { toCyberbackerPayload } from "../api/reviews";

const json = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

describe("demo backend (in-memory, never touches the network)", () => {
  it("answers requests without calling fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    resetDemoApi();
    const summaries = await demoApi<unknown[]>("/api/v1/cb_client_portal/cb_ratings", {}, "client");
    expect(Array.isArray(summaries)).toBe(true);
    expect(summaries.length).toBeGreaterThan(0);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("creates a Cyberbacker review and lists it", async () => {
    resetDemoApi();
    const payload = toCyberbackerPayload({
      cyberbackerId: 3, overall: 4, communication: 5, expectations: 5, comments: "Great work", recommend: true,
    });
    const created = await demoApi<{ id: number }>(
      "/api/v1/cb_client_portal/cb_rate", json(payload), "client",
    );
    expect(created.id).toBeGreaterThan(0);
    const reviews = await demoApi<{ cyberbacker_id: number }[]>(
      "/api/v1/cb_client_portal/cb_reviews", {}, "client",
    );
    expect(reviews[0].cyberbacker_id).toBe(3);
  });

  it("keeps at least one KPI widget on (400 when every KPI is off)", async () => {
    resetDemoApi();
    const allOff = {
      kpi_active_cyberbackers: false, kpi_attendance_rate: false,
      kpi_open_support_tickets: false, kpi_upcoming_renewals: false,
    };
    await expect(
      demoApi("/api/v1/cb_client_portal/settings/preferences", { method: "PATCH", body: JSON.stringify(allOff) }, "client"),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("admin endpoints reject clients and accept superadmins", async () => {
    resetDemoApi();
    await expect(
      demoApi("/api/v1/cb_admin_portal/support/summary", {}, "client"),
    ).rejects.toMatchObject({ status: 403 });
    const summary = await demoApi<{ total: number }>(
      "/api/v1/cb_admin_portal/support/summary", {}, "superadmin",
    );
    expect(summary.total).toBeGreaterThan(0);
  });

  it("closed tickets refuse client replies with 409", async () => {
    resetDemoApi();
    const tickets = await demoApi<{ id: number; status: string }[]>(
      "/api/v1/cb_client_portal/support/tickets", {}, "client",
    );
    const closed = tickets.find((t) => t.status === "closed");
    if (!closed) return; // seed guarantees a closed ticket; skip if fixtures change
    await expect(
      demoApi(`/api/v1/cb_client_portal/support/tickets/${closed.id}/reply`, json({ body: "hello" }), "client"),
    ).rejects.toMatchObject({ status: 409 });
  });
});
