# Add role-based mock login and richer Cyberbacker profiles

## Goal
Make sign-in the first experience, provide separate Client and Superadmin demo entry points, tailor navigation and account details to the selected role, and expand Cyberbacker review/profile workflows using the supplied profile references.

## Login, session, and password recovery
- Move the existing client dashboard from `/` to `/dashboard` and make `/` the professional Cyberbacker login page.
- Keep `/login` working by redirecting it to the new login home.
- Use the bundled Cyberbacker wordmark, enterprise styling, and two clear demo entry buttons:
  - **Continue as Client** — Jordan Avery, Client; opens `/dashboard`.
  - **Continue as Admin** — Leandre John Sabado, Superadmin; opens `/internal`.
- Remember the selected demo account in browser storage across refreshes. Sign out clears the selection and returns to `/`.
- Add client-side route checks so app pages return signed-out visitors to the login page and keep each role within its allowed area. This is a prototype gate only, not production authentication or server-side security.
- Add `/forgot-password` with an email field, submit/loading/success states, and a return-to-login action. Since there is no backend, it will clearly behave as a demo recovery flow and send no email.
- Add unique page metadata for the login, forgot-password, and relocated dashboard routes.

## Role-aware app shell
- Centralize the two demo account definitions and session helpers so the sidebar, top bar, settings, and redirects all use the same selected account.
- Client session:
  - Show only the **Client** sidebar group.
  - Display Jordan Avery and the Client title in the account menu/settings.
- Superadmin session:
  - Show only the **Internal** sidebar group plus **User Settings**.
  - Display Leandre John Sabado and the Superadmin title in the top bar/account menu.
- Make the root logo link and post-login redirects role-aware.
- Update the account menu sign-out action to clear cached mock data and the remembered account before returning to login.

## My Cyberbackers and reviews
- Replace **Add Cyberbacker** with **Rate my Cyberbacker**, linking to Reviews & Ratings.
- Let that link preselect the relevant Cyberbacker when launched from an individual card.
- Load review data on My Cyberbackers and show each person’s latest review directly on their card: rating, date, and a concise comment preview; show a sensible empty state if none exists.
- Keep the existing Reviews & Ratings submission flow, while displaying only first names for Cyberbackers throughout cards, selectors, review lists, and related candidate surfaces.

## Shared expanded profile experience
- Build one reusable profile panel used by both Hiring Marketplace and My Cyberbackers so the two views remain visually and behaviorally consistent.
- Expand the panel using the supplied JSON/screenshots as the content model, adapted into realistic mock data for each person:
  - header, role, location, availability, assessments, and About
  - selected personal details without phone numbers
  - education and professional background
  - work experience
  - categorized core skills with proficiency levels
  - tools with proficiency levels
  - portfolio, certifications, and work setup
- Omit the entire compliance section and all phone fields.
- Display only first names for every candidate/Cyberbacker across marketplace cards, profile panels, comparison UI, My Cyberbackers, Reviews & Ratings, and relevant internal candidate lists. Account holders such as Jordan and Leandre keep their requested full names.
- Preserve marketplace-only actions such as interview, shortlist, match score, and comparison; use team-appropriate actions in My Cyberbackers.
- Use the reference screenshots as design guidance only; do not embed them as page assets.

## Data and verification
- Extend the existing typed mock/FastAPI-ready data shapes with profile sections, proficiency values, experience, education, assessments, portfolio, certification, and work-setup fields.
- Keep the app static/Azure-compatible with no server functions or backend dependency.
- Add focused tests for role-specific navigation/access, persisted demo session behavior, first-name display, latest-review selection, and omission of phone/compliance fields.
- Verify both login paths, refresh persistence, sign-out, forgot-password states, Client and Superadmin sidebars, review preselection, latest reviews, and both profile entry points on desktop and mobile.
