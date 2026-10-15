# AGENTS.md
- Build is SPA mode (static shell, no runtime SSR) — the app must be deployable as static files to Azure Static Web Apps; avoid server functions and server-only loaders.
- Data comes from the typed mock layer in src/lib/data (api.ts/queries.ts) — swap point for the future FastAPI backend.
- Demo account selection is presentation-only browser state; never treat it as secure authorization until FastAPI authentication replaces it.
- Builder preference models and normalization live in the jobs data/helpers layer; save-only preferences must stay independent of candidate matching so collecting intake details cannot accidentally change ranking.
- Cyberbacker University is a shared shell route available to both demo roles, so its single blank page stays consistent across workspaces.
