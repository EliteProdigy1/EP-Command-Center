# EP Command Center 2.0

**Private operating console for Elite Prodigy Media.**
Answers one question on open: *what needs Jonathan today?*

## Structure
```
index.html          — the dashboard (no gate; see Security)
css/dashboard.css   — cinematic design system (black/gold/glass/grain)
js/app.js           — mockData + module registry + all render functions
docs/               — as-built spec + Phase 2 API plan
assets/             — images/icons/video (reserved)
```

## How data works
- **mockData** (js/app.js): reference state — clients, sites, pricing, AI team,
  growth stack, integrations. Phase 2 APIs replace these keys one by one.
- **Working state**: leads, prospects, tasks, and the call log are editable in
  the UI and saved to this browser's localStorage. **⬇ Backup** downloads a
  JSON file; **⬆ Restore** loads it on any device. Data does not sync between
  devices in Phase 1.

## Add/remove a dashboard module
Edit `dashboardModules` in js/app.js. Set `enabled: false` to hide a module
from Mission Control, or add a new entry `{ id, title, enabled, size, section,
summary }` — the grid accepts it with no HTML changes.

## Add a new client / lead / prospect
- Prospect: Potential Clients → ＋ Add Prospect (or promote → Pipeline)
- Lead: Pipeline → ＋ Add Lead (appears in Call Mode queue automatically)
- Delivered client: add to `mockData.clients` + `deployments` in js/app.js

## Preview locally
Any static server, e.g. `python3 -m http.server 8080` → http://localhost:8080

## Deploy
Netlify → Import from GitHub → EP-Command-Center → main → publish `.`
(netlify.toml included).


## Sprint 1 — Prospecting Engine
The Intelligence Center + Potential Clients answer "who should EP Media reach
out to next?" Prospects carry 20 fields, filter six ways, score by opportunity
(lower web score = bigger opportunity), and expose six action hooks (Run Audit,
Build SiteDrop Concept, Move to CRM, Mark Contacted, Schedule Follow-Up,
Generate Outreach Message) ready for Apollo / Firecrawl / Google Maps / SiteDrop
/ Zapier in Phase 2. All data lives in `mockData` (js/app.js); nothing is
hardcoded in HTML. See docs/SPRINT-1-PROSPECTING-ENGINE.md.

## Security
- There is **no passcode gate** — and the old 251 gate was never security.
- **Before adding anything sensitive: enable Netlify password protection**
  (Site configuration → Access control).
- No API keys, personal, banking, or investing data in frontend JS — ever.
  Phase 2 integrations go through Netlify Functions with environment
  variables. See docs/PHASE-2-API-PLAN.md.
