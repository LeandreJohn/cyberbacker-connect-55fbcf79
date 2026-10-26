import { describe, expect, it } from "vitest";
import { addEndorsed, normalizeState, toggle } from "./member-skills";

describe("client endorsements", () => {
  it("toggles an endorsement on and off", () => {
    const on = toggle({ endorsed: [], added: [] }, "Excel");
    expect(on.endorsed).toEqual(["Excel"]);
    expect(toggle(on, "Excel").endorsed).toEqual([]);
  });
  it("removing an endorsement drops a client-added skill", () => {
    expect(toggle({ endorsed: ["Canva"], added: ["Canva"] }, "Canva").added).toEqual([]);
  });
  it("prevents duplicate added skills and reuses profile skills", () => {
    const s = addEndorsed({ endorsed: [], added: [] }, "canva", [])!;
    expect(addEndorsed(s, "Canva", [])).toBeNull();
    expect(addEndorsed(s, "excel", ["Excel"])).toEqual({ endorsed: ["canva", "Excel"], added: ["canva"] });
  });
  it("migrates legacy ratings and added skills into endorsements", () => {
    expect(normalizeState({ ratings: { Excel: 4 }, added: [{ name: "Canva", category: "x", proficiency: "Basic" }] })).toEqual({ endorsed: ["Excel", "Canva"], added: ["Canva"] });
  });
});
