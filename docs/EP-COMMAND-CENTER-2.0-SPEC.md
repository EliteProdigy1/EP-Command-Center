# EP Command Center 2.0 — As-Built Spec

**Built:** 2026-07-05 · **Status:** Phase 1 (mock + working local data, no live APIs)

## What it is
The private operating console for Elite Prodigy Media. One question drives the
home screen: **"What needs Jonathan today?"**

## Architecture
- `index.html` — single-page dashboard (the gate was intentionally removed;
  real protection = Netlify password protection)
- `css/dashboard.css` — cinematic design system: black/gold, glass panels,
  film grain, serif display type, 3D card depth
- `js/app.js` — everything renders from data:
  - `mockData` — reference state (clients, deployments, repos, pricing,
    aiTeam, growthStack, integrationsMap, automations, knowledge,
    personalCommand, investorDashboard, bankingFunding, agentWorkforce, calendar)
  - `S` (working state) — leads, tasks, prospects, callLog — editable in the
    UI and persisted to localStorage (`epcc-v2`), with Backup/Restore JSON
  - `dashboardModules` — module registry; Mission Control auto-renders a
    summary card per enabled module

## Modules
Mission Control · Call Mode · Potential Clients · Pipeline · Tasks ·
Active Clients · Sites & Repos · Revenue & Pricing · AI Team · Growth Stack ·
Integrations Map · Agent Workforce · Automations · Knowledge ·
Personal Command · Investor Dashboard · Banking/Funding

## Design decisions
- **No passcode gate** (removed by request). The old 251 gate was cinematic
  only, not security. Use Netlify password protection before adding anything
  sensitive.
- Working sales data (leads/tasks/prospects/calls) is intentionally editable
  and device-local. Long term, the CRM becomes the source of truth (Phase 2).
- Personal / Investor / Banking modules are **placeholders only** — no real
  personal or financial data may enter frontend JavaScript. See PHASE-2-API-PLAN.
