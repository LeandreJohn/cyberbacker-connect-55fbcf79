import type { Invoice } from "@/lib/data/types";

const PAYABLE = new Set(["due", "overdue", "sent"]);

/** Manual Pay button: only for unpaid invoices when the client is not on auto-pay. */
type Payable = Pick<Invoice, "status" | "autopay">;
export const canPay = (inv: Payable) => !inv.autopay && PAYABLE.has(inv.status);
/** Subscription invoices (autopay from the backend payload) are charged automatically. */
export const isAwaitingAutopay = (inv: Payable) => !!inv.autopay && PAYABLE.has(inv.status);
export const canDownloadReceipt = (inv: Pick<Invoice, "status">) => inv.status === "paid";

export function validateCard(c: { name: string; number: string; expiry: string; cvc: string; zip: string }) {
  const errors: Record<string, string> = {};
  if (!c.name.trim()) errors.name = "Enter the name on the card.";
  const digits = c.number.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) errors.number = "Enter a valid card number.";
  const m = c.expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!m || +m[1] < 1 || +m[1] > 12) errors.expiry = "Use MM/YY.";
  if (!/^\d{3,4}$/.test(c.cvc)) errors.cvc = "3 or 4 digits.";
  if (!c.zip.trim()) errors.zip = "Enter billing ZIP.";
  return errors;
}
