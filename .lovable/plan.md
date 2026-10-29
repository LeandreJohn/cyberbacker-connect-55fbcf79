# Remove auto-pay toggle, make the login background fit every screen

## 1. Billing
- Remove the "Automatic payments" switch from Invoice history.
- Each invoice decides for itself whether it's on auto-pay (later this comes from your server's data). Sample data: one invoice on auto-pay so the "Auto-pay scheduled" label can still be seen; the rest show the Pay button.
- Rules stay the same: Pay only for Due / Overdue / Sent and not on auto-pay; Receipt only for Paid.

## 2. Login background: full-screen on any size, no blank space, no scroll bar
**Why it keeps going wrong:** the logo, headline, tagline and copyright are baked into the photo. Screens come in many shapes, so the photo must either be trimmed (cutting off the text) or shrunk (leaving blank space). No setting fixes both.

**Fix:**
- Make a clean copy of the background with the logo, headline, tagline and copyright text removed. Keep the man, the office and the blue shapes. Store it offline in the assets folder.
- The clean photo fills the whole screen. On different screen shapes only the plain office edges get trimmed, and the man and the blue shapes stay anchored bottom-left.
- Add the logo, "Welcome to Your / Cyberbacker Client Portal" headline, italic tagline and copyright back as real page elements, placed like the reference (top-left, bottom-left). They scale with the screen size, so they never get cut off.
- The "Welcome back" card stays on the right, vertically centered, and fits within the screen height (it shrinks slightly on short screens). The page never scrolls on desktop.
- Phone/tablet: the same full-bleed photo, with the headline and the card stacked on top. Scrolling is allowed only on small phones where the card can't fit.
- Check against the reference at 1122x725, 1280x800, 1440x900, 1920x1080, 2560x1080, a tablet size and a phone size. No scroll bars, no blank edges, all text visible.

## Technical details
- `Invoice` gets `autopay?: boolean`. `canPay`/`isAwaitingAutopay` take the invoice only. Remove `useAutopay` and the cb-autopay storage, update tests, and update the AGENTS.md line.
- Generate `src/assets/cyberbacker-login-scene.jpg` from the existing bg using image edit (remove text and logo). Use the `object-cover` class with a left-bottom position, plus `h-dvh overflow-hidden` on lg.
- Overlay type uses clamp()/vw sizing. The logo uses the existing bundled tagline logo asset if one exists, otherwise the current logo.
