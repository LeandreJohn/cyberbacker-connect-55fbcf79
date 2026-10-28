# Login sides, invoice Pay modal, login-matched colors

## 1. Login photo fills the whole screen (no side bands)
- Switch the desktop photo from "fit inside" to "fill and crop", anchored so the logo, headline and the man at the desk stay visible; only small top/bottom edges trim on unusual screen shapes.
- Keep no scroll bar; sign-in card stays on the right. Phone/tablet layout unchanged.
- Verify at 1122x725, 1280x800, 1920x1080, 2560x1080.

## 2. Billing - Invoice history actions
- Add a "Sent" invoice status (with a few sample invoices).
- **Pay** button shows when status is Due, Overdue or Sent - but hidden when the account is on automatic payment (subscription).
- **Download receipt** shows only when status is Paid.
- Pay opens a modal (Authorize.Net placeholder): invoice summary + amount, card form (name, card number, expiry, CVC, billing ZIP) with basic checks, "Pay $X" button. Submitting shows a "Processing / Payment received" screen and marks the invoice Paid locally (demo only - no real charge).
- If auto-payment is on, the invoice row shows "Auto-pay scheduled" instead, and the modal explains the card on file will be charged automatically.
- Add an "Automatic payments" indicator/switch on the Billing page (demo setting) so both cases can be seen.

## 3. Color theme from the login design
- Retune theme tokens to the login photo's palette: deep navy buttons (like the "Log in" button), bright Cyberbacker blue accents (the diagonal shapes), soft blue-grey surfaces, clean white cards.
- Applies app-wide via existing tokens (buttons, links, sidebar, badges, charts); dark mode adjusted to match.

## Technical details
- `src/routes/index.tsx`: `lg:object-cover` with `object-[left_center]`-style positioning, remove powder fill bands.
- `types.ts`: `InvoiceStatus` += `"sent"`; `mock.ts` sample data; `toneFor` maps sent -> info.
- New `src/components/billing/PayInvoiceDialog.tsx`; pure helper `canPay(invoice, autopay)` / `canDownloadReceipt(invoice)` in `src/lib/billing.ts` with vitest tests.
- Autopay flag browser-stored until FastAPI/AuthNet integration (note in AGENTS.md).
- `src/styles.css`: update oklch values of primary, accent, powder, ring, sidebar, chart tokens; update memory theme note.
