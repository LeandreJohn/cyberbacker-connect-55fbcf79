# AGENTS.md
- Build is SPA mode (static shell, no runtime SSR) — the app must be deployable as static files to Azure Static Web Apps; avoid server functions and server-only loaders.
- Data comes from the typed mock layer in src/lib/data (api.ts/queries.ts) — swap point for the future FastAPI backend.
- Demo account selection is presentation-only browser state; never treat it as secure authorization until FastAPI authentication replaces it.
- Builder preference models and normalization live in the jobs data/helpers layer; save-only preferences must stay independent of candidate matching so collecting intake details cannot accidentally change ranking.
- Cyberbacker University is a client-only route; superadmins manage staff via /internal/users instead.
- Client skill ratings/added skills for team members live in src/lib/data/member-skills.ts (browser storage) until the FastAPI backend replaces it.
- Requirements control layouts use the builder card's container width rather than viewport breakpoints, so they fit both split-preview and single-column forms.
- Pasted/uploaded job descriptions are parsed fully in the browser (pdfjs-dist, mammoth) by a pure helper in src/lib/jobs/import.ts and handed to the builder via sessionStorage, keeping the app static-hostable.
