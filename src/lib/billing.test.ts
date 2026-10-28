import { describe, expect, it } from "vitest";
import { canDownloadReceipt, canPay, validateCard } from "./billing";

describe("billing rules", () => {
  it("shows Pay for due, overdue and sent when not on auto-pay", () => {
    for (const status of ["due", "overdue", "sent"] as const) expect(canPay({ status }, false)).toBe(true);
    expect(canPay({ status: "paid" }, false)).toBe(false);
  });
  it("hides Pay for subscription auto-payment", () => {
    expect(canPay({ status: "due" }, true)).toBe(false);
  });
  it("receipt download only for paid", () => {
    expect(canDownloadReceipt({ status: "paid" })).toBe(true);
    expect(canDownloadReceipt({ status: "overdue" })).toBe(false);
  });
  it("validates card fields", () => {
    expect(validateCard({ name: "A", number: "4111 1111 1111 1111", expiry: "12/28", cvc: "123", zip: "1" })).toEqual({});
    expect(Object.keys(validateCard({ name: "", number: "1", expiry: "13/28", cvc: "1", zip: "" })).length).toBe(5);
  });
});
