# EP Command Center 2.0

**Private operating console for Elite Prodigy Media.**
Answers one question on open: *what needs Jonathan today?*

## Structure
```
index.html               — the dashboard (251 passcode gate; see Security)
css/dashboard.css        — cinematic design system (black/gold/glass/grain)
js/app.js                — mockData + module registry + all render functions
js/gate.js               — 251 passcode gate (obscurity, not security)
services/notion.js       — data service: reads through Notion, falls back to mockData
netlify/functions/notion.js — serverless Notion proxy (keeps the API key server-side)
.env.example             — environment variable template (names only, no secrets)
docs/                    — as-built spec + Phase 2 API plan + Sprint 1/2 notes
assets/                  — images/icons/video (reserved)
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

## Sprint 2 — Notion Integration
The dashboard no longer reads mockData directly. Every source now flows through
`services/notion.js`, which calls a Netlify Function (`netlify/functions/notion.js`)
that queries Notion **server-side**. If Notion isn't configured — or a call
fails — each getter returns the matching mockData set, so the dashboard always
renders. The **Integration Status** page shows per-source state at a glance:

| Status | Meaning |
|--------|---------|
| 🟢 Connected | Live data from Notion |
| 🟡 Fallback | Running on built-in mock data (default until keys are set) |
| 🔴 API Error | Notion is configured but the call failed |

The UI, filters, opportunity scoring, and rankings are unchanged — only the
**source** of the data moved. Nothing in the frontend ever sees a secret.

### Connecting Notion (one time)
1. **Create an integration** → https://www.notion.so/my-integrations → *New
   integration* → copy the **Internal Integration Secret** (`ntn_...`). This is
   your `NOTION_API_KEY`.
2. **Create (or open) five Notion databases** — Prospects, Projects, Tasks, AI
   Workforce, Revenue — and **share each one with the integration** (open the
   database → `•••` → *Connections* → add your integration). Without sharing,
   Notion returns 404 and the source stays yellow.
3. **Copy each database ID.** Open the database as a full page; the ID is the
   32-character string in the URL:
   `notion.so/<workspace>/`**`a1b2c3d4e5f6...`**`?v=...`
4. **Set the environment variables in Netlify** → Site configuration →
   Environment variables (see `.env.example` for the full list):

   | Env var | Value |
   |---------|-------|
   | `NOTION_API_KEY` | your integration secret (`ntn_...`) |
   | `NOTION_DATABASE_PROSPECTS` | Prospects database ID |
   | `NOTION_DATABASE_PROJECTS` | Projects database ID |
   | `NOTION_DATABASE_TASKS` | Tasks database ID |
   | `NOTION_DATABASE_AI_WORKFORCE` | AI Workforce database ID |
   | `NOTION_DATABASE_REVENUE` | Revenue database ID |

   (Website Intelligence reuses the Prospects database's audit columns — no
   separate ID.)
5. **Redeploy** (Netlify → Deploys → *Trigger deploy*). Each source flips from
   🟡 Fallback to 🟢 Connected on its own — **no code changes**.

### Column names Notion expects
The proxy maps Notion columns to the dashboard in `netlify/functions/notion.js`.
Match these column names in Notion, or edit the mappers to match yours:
- **Prospects**: Business Name, Industry, Location, Website URL, Website Status,
  Website Score, Mobile Score, SEO Score, Design Score, Source Tool,
  Opportunity Level, Pipeline Status, Recommended Action, Contact Name, Phone,
  Email, Last Checked, Next Follow-Up, Notes
- **Projects**: Name, Industry, Status, Site, Repo
- **Tasks**: Title, Client, Priority, Due, Status (`todo` / `in progress` / `done`)
- **AI Workforce**: Agent, Role, Area, Tools, Status, Permissions, Next Assignment
- **Revenue**: Name, Price, Detail

### Phase 3 hooks (not connected)
`services/notion.js` and `.env.example` reserve slots for **Firecrawl** (website
audits) and **Apollo** (contact enrichment). Same pattern — a Netlify Function
holds the key, a getter is added, render code stays the same. `FIRECRAWL_API_KEY`
and `APOLLO_API_KEY` are placeholders only; nothing calls them yet.

## Security
- The **251 passcode gate** (js/gate.js) is obscurity, not security — it keeps
  casual eyes out but is trivially bypassed. Treat this dashboard as public.
- **Before adding anything sensitive: enable Netlify password protection**
  (Site configuration → Access control) once the plan supports it.
- No API keys, personal, banking, or investing data in frontend JS — ever.
  The Notion key and all database IDs live in **Netlify environment variables**
  and are only ever read by the serverless function. See docs/PHASE-2-API-PLAN.md.
