# Client reviews, dashboard, billing and admin updates

## Reviews & Ratings
- Add two tabs: "Rate my Cyberbackers" (current page) and "Rate Cyberbacker" (the company).
- Company review: overall star rating plus star ratings (1–5) for Service quality, Communication, Recruiting & matching, Support responsiveness, Value for money; comment box and "Would you recommend Cyberbacker?" switch. No "Exceeds / Doesn't meet expectations" wording — stars only.
- Shows past company reviews and the average company rating.

## Billing
- Remove the "Lifetime Spend" card.

## Client dashboard
- Announcements move to the top, right under the welcome banner.
- Remove Team performance chart, Attendance summary chart, and Recent activity.
- Keep: KPI cards, Quick actions, Open support tickets, Upcoming renewals.
- KPI cards shown follow the client's choice in Settings.

## Settings — Dashboard widgets
- New "Dashboard" tab: switches for Active Cyberbackers, Attendance Rate, Open Support Tickets, Upcoming Renewals (all on by default; at least one must stay on). Saved in the browser.

## Admin dashboard
- New "Upcoming client renewals" table on the Operations dashboard: client name, plan, renewal date, days left, sorted soonest first.

## Cyberbacker role tags
- On My Cyberbackers cards (and similar team lists), show tags as a plain "Covers: Calendar · Inbox · Travel" summary line with muted text and no button/pill styling, so it doesn't look clickable.

## Technical details
- Company reviews: new `CompanyReview` type + mock rows and `getCompanyReviews`/`submitCompanyReview` in the mock API layer.
- KPI preferences in `src/lib/data/dashboard-widgets.ts` (localStorage, normalize to keep ≥1 enabled); small test for defaults and minimum-one rule.
- Client accounts get a `renewalDate` in mock data for the admin table.
