# Expectations star rating and page tutorials

## 1. Expectations star rating (both reviews)
- Add a "Meets expectations?" question to the Cyberbacker review and the company review.
- It's a 1–5 star rating with labels at each end: "Doesn't meet expectations" (1 star) on the left and "Exceeds expectations" (5 stars) on the right. The label for the selected star shows under the stars (1 Doesn't meet, 2 Partially meets, 3 Meets, 4 Above, 5 Exceeds).
- Required before submitting. Past reviews show the chosen label, e.g. "Exceeds expectations".

## 2. Tutorial popups
- Settings gets a "Tutorials" tab with a switch: "Show tutorial popups". On by default for both client and admin.
- When on, opening any tab in the sidebar (Dashboard, My Cyberbackers, Marketplace, Job Description Builder, Reviews, Attendance, Billing, Settings, admin pages, etc.) shows a short popup the first time: what the page is for and 2–3 tips.
- Popup buttons:
  - "Got it": closes it; it won't show again for that page.
  - "Turn off all tutorials": switches tutorials off everywhere (same as the Settings switch).
- Settings also has "Replay all tutorials" to show them again.

## Technical details
- `expectations: number` added to `Review` and `CompanyReview` (older rows default to 3). Shared `EXPECTATION_LABELS` helper.
- Tutorial content keyed by path in `src/lib/tutorials.ts`; enabled flag + seen pages in browser storage with a change event; one `TutorialPopup` (Dialog) mounted in the app shell, matching the current path.
- Tests: expectation label mapping (1 and 5 endpoints), turning off hides all, "Got it" marks only that page seen, replay clears seen pages.
