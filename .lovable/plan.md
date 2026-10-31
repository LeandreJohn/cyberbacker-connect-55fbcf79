# Connect Cyberbacker Client Portal to FastAPI + Admin Knowledge Base

Build the attached prompt against the API reference PDF. No redesign: current layout, routes, components, and powder-blue theme stay.

## Decisions (confirmed)
- Keep `/internal/*` routes; the new admin Knowledge Base lives at `/internal/knowledge-base` in the ADMIN sidebar group.
- Review/endorsement cards resolve names and positions from the app's existing Cyberbacker roster (mock team list) by numeric id, exactly as the reference describes.
- Demo switch goes in the existing `src/lib/api/client.ts`; mock data stays in `src/lib/data/`.
- Pages the backend doesn't cover yet (dashboard KPI numbers, billing, contracts, attendance, marketplace, job builder, etc.) show empty states for real accounts and sample data only for demo sessions.

## PART 0 — Demo mode
- Demo sign-in via sessionStorage `{ mode: 'demo', role }` (no token, never calls the backend). Login page divider "or explore the demo" with two buttons: "Jordan Avery · Client demo" (JA, BrightPath Ventures) and "Leandre John Sabado · SuperAdmin demo". Buttons render only when `VITE_ENABLE_DEMO` is true (default true; add to `.env` + `.env.example`).
- Move demo-role state from localStorage to sessionStorage inside `src/lib/demo-auth.ts`; real sessions stay in localStorage and always win.
- Single interception point in `src/lib/api/client.ts`: when demo mode is active, every request is answered by a new `src/lib/mocks/demo-api.ts` (same paths + response shapes as the reference, backed by the existing mock data in memory). Screens and hooks get no demo branches.
- Demo writes mutate the in-memory copy only; reset on refresh and sign out. Attachment downloads and the Excel template toast "Not available in demo". Excel import accepts any .xlsx and returns a sample report.
- Seed demo Knowledge Base: four categories (18, 24, 12, 31) plus sample articles ("How to delegate your first task" — 4,210 views, 5 min; "Setting weekly priorities with your team" — 3,180 views, 7 min; a few more).
- Slim banner on every page in demo mode: "Demo mode: sample data, nothing is saved."
- Real accounts never see mock data — only API data and empty states.

## PART 1 — Foundation
- `src/lib/api/client.ts`: add FormData passthrough (never set Content-Type), redirect to `/` on 401, errors carry status + `detail`; add `downloadFile(path)` blob helper for attachments and the Excel template.
- `src/lib/types.ts` (re-export from `src/lib/data/types.ts` if cleaner): all section-4 types verbatim.
- Auth: `GET /users/me` restores the session on app load when a token exists; sign out clears token, session and demo state; header shows name + position; ADMIN sidebar group and `/internal/*` allowed only for position SuperAdmin (real or demo).

## PART 2 — Client screens (TanStack Query everywhere; loading skeleton, empty state, `detail` error toast per screen)
- **Reviews "Rate my Cyberbackers"**: cards from `GET cb_ratings` merged with roster; unreviewed Cyberbackers show 0 / dash / empty stars; recent reviews from `GET cb_reviews` (card click filters by `cyberbacker_id`); trend from `GET cb_rating_trend` (y 0–5, missing months filled). Form: Overall + Meets expectations required, four other stars optional; POST `cb_rate`; refresh all three after submit. Make the four categories optional (current form forces all).
- **Reviews "Rate Cyberbacker"**: POST `company_rate`; right panel from `GET company_reviews` (average + count header, list with sub-ratings).
- **Endorsements** in the Cyberbacker detail panel: `GET/POST/DELETE skill_endorsements`; each call returns the refreshed list. Profile skills render as plus chips until present in the endorsement list; "Endorsed by you" + count; "+ Skill" input endorses.
- **Settings, six tabs**:
  - Profile: `GET/PUT settings/profile`; role read-only; Cancel resets; Change avatar stays disabled.
  - Change password: 8+ chars, match, differ from current; POST 400 → inline "current password is incorrect", never logs out.
  - Dashboard: KPI toggles PATCH `settings/preferences`; last remaining toggle disabled; dashboard hides cards whose preference is off.
  - Tutorials: `tutorials_enabled` + `completed_pages`; "Replay all" POSTs `tutorials/replay`; first-visit popup per page only when enabled and page not completed, then POST `tutorials/complete`.
  - Notifications: four toggles PATCH.
  - Appearance: Light / Dark / System PATCH; add System support to ThemeProvider (media query); apply the saved theme after login; header moon button uses the same setting.
- **Support Center (client)**: four cards from `GET support/summary`; ticket list with search, category + priority selects, status pills (Pending = `pending_client`); detail with Conversation / Timeline / Details tabs and SLA text from `sla_hours_left`; New Ticket modal posts multipart (subject, category, priority, description, ≤5 files × 10 MB); reply box with Attach + Send (multipart); Mark resolved; attachments download via blob helper; closed tickets hide the reply box (409 handled).
- **Knowledge Base (client)**: category cards from `GET knowledge_base/categories` (click filters); Popular articles from `/articles/popular`; debounced (300 ms) search; results list; new article page `/knowledge-base/:slug` with title, category pill, views, read time, body rendered as safe Markdown (never raw HTML). Every article-page visit counts one view.

## PART 3 — Admin screens (SuperAdmin only)
- **Admin Support Center** (`/internal/tickets`): wire `cb_admin_portal/support/*`. List with filters + search (also matches requester); detail Conversation / Timeline / Details; status + priority dropdowns show the opened ticket's own values and re-sync on every ticket switch; changes PATCH. Reassign dialog with assignee input suggesting "Support Team" and "Facilitator". Reply box: Send + Add note (`is_internal=true`); internal notes get a distinct yellow style with "Internal note" label.
- **Admin Knowledge Base** (new `/internal/knowledge-base`, ADMIN sidebar group), three tabs:
  1. Articles: table (title, category, status badge, views, updated), filters for status/category/search; New article form (title, category select, summary, body, status, optional slug under "Advanced", optional read time); row actions Edit, Publish/Archive (quick status PATCH), Delete with confirmation ("permanent — consider Archive").
  2. Categories: name, slug, article count, total articles, active toggle; create/edit dialog (name, description, icon select from lucide keys: rocket, users, credit-card, zap + more, sort order). No delete — active toggle only.
  3. Import: Download template (blob), .xlsx drop zone (≤5 MB), "Update existing articles" and "Validate only (dry run)" switches, Import button; report shows summary counts then rows (row, title, action badge, message) with errors highlighted; "Nothing was saved" banner when `committed` is false; refresh list after a committed import.

## PART 4 — Checks
- After building: list every reference endpoint with the screen that uses it; flag any screen where a real account could still see mock data.
- Type check (`bunx tsgo --noEmit`), tests (`bunx vitest run src/lib` — add tests for demo-mode routing, KPI "at least one on" rule, password-change handling, optional-rating payload shape), and Playwright pass over login/demo banner/reviews/settings/support/KB.

## Technical notes
- Static SPA on Azure stays; all calls go browser → `VITE_API_BASE_URL` (default `http://127.0.0.1:8000`). Backend must allow CORS from the portal origin — flag it in the final report.
- Tokens ~30 min: any 401 redirects to the login page. Review/endorsement endpoints return only ids; roster fills names.
- Keep `status_label` / `expectation_label` from responses instead of local label maps where they supersede current ones.
