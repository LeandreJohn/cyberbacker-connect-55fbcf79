# Login fix + real login and ratings via FastAPI

## 1. Login page: no scroll bar, full photo
- Lock the login page to exactly the screen height on desktop (no page scroll), and fit the whole photo inside the screen (no cropping) with the soft fill color around it.
- Keep the sign-in card over the right side; on phone/tablet keep photo-on-top, card-below (scrolling there is unavoidable on small screens, but the photo stays whole).
- Verify at 1122x725 (your current size), 1280x800, 1920x1080, tablet and phone: no scroll bar on desktop sizes.

## 2. Working email/password login
- Log in button sends email + password to `POST {API_BASE}/auth/login` (form-encoded `username`/`password`, as your FastAPI expects).
- On success, store the token, email, name and position in the browser.
- `position` = `SuperAdmin` → Admin area (`/internal`); `Client` → client dashboard. Anything else shows "This account has no portal access."
- The header/profile menu and welcome banner show the real `name` from the login response instead of Jordan Avery / Leandre.
- Wrong credentials (401) show "Incorrect email or password"; server unreachable shows a clear message.
- Sign out clears the stored token.
- The two small "Continue as Client / Superadmin" demo buttons stay so you can still get in without the server. Google button stays visual only.

## 3. Ratings go to your endpoints (with token)
- Rate my Cyberbackers submit → `POST /api/v1/cb_client_portal/cb_rate` (overall, communication, quality, reliability, timeliness, meets_expectations, comments, would_recommend, cyberbacker_id).
- Rate Cyberbacker (company) submit → `POST /company_rate` with the five category ratings.
- Lists read from `GET /cb_ratings`, `/cb_reviews`, `/cb_rating_trend`, `/company_reviews` (average + count in the header, expectation label on each review).
- When signed in with a demo button (no token), the page keeps using the current sample data so it still works offline.
- Cyberbacker ids: the app's ids are text (e.g. "cb1"); the number part is sent as the integer `cyberbacker_id`. Names come back empty from your placeholder `_cyberbacker_info`, so the app fills names from its own team list by id.

## 4. Base URL setting
- New `.env` with `VITE_API_BASE_URL=http://localhost:8000` (plus `.env.example`). All calls build from it.
- Note: your FastAPI must allow CORS from the app's address (e.g. `http://localhost:8080`) or the browser will block requests.

## Technical details
- `src/lib/api/client.ts`: `apiFetch` reading `import.meta.env.VITE_API_BASE_URL`, attaches `Authorization: Bearer`, throws typed `ApiError`.
- `src/lib/auth/session.ts`: `login(email,password)`, session store (localStorage), `positionToRole`, integrates with `useDemoAccount` so `canAccessPath` and nav use the real role/name. Stays static-SPA (no server functions).
- `src/lib/data/reviews-api.ts`: typed request/response mappers matching the pydantic schemas; `src/routes/_app.reviews.tsx` uses TanStack Query against these when a token exists, mock otherwise.
- Tests: position→route mapping (SuperAdmin→/internal, Client→/dashboard) and review payload mapping (meets_expectations, id parsing).
- Update AGENTS.md: API base URL from env; real token session supersedes demo selection when present.
