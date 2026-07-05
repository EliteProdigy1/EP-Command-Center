# EP Command Center 2.0

**Elite Prodigy Media — Internal Operating System Dashboard**

> Internal admin dashboard. Not for public distribution. No real APIs connected (Phase 1).

---

## Overview

EP Command Center 2.0 is the internal operating system for Elite Prodigy Media. It provides mission-control visibility across all active clients, repositories, deployments, tasks, pipeline, revenue, AI tools, automations, and strategic context — in a single cinematic dashboard.

**Phase 1:** Static HTML/CSS/JS with realistic mock data. Zero dependencies. Zero build step. Runs anywhere.  
**Phase 2:** Live API connections via Netlify Functions. See `docs/PHASE-2-API-PLAN.md`.

---

## Structure

```
EP-Command-Center/
├── index.html          Cinematic gate (passcode lock screen)
├── dashboard.html      Main operating dashboard
├── app.js              All logic, data, and render functions
├── styles.css          Dashboard design system
├── css/
│   └── gate.css        Gate-specific cinematic styles
└── docs/
    ├── EP-COMMAND-CENTER-2.0-SPEC.md   Full specification
    └── PHASE-2-API-PLAN.md             API integration roadmap
```

---

## Gate

The `index.html` gate is a cinematic entry experience — an EP brand ritual, not a security system.

- Rotating EP monogram with film grain and grid overlay
- 3-digit passcode input with gold dot indicators
- Unlock animation on success → redirect to dashboard
- Quick portal links to key tools (no gate required)

---

## Dashboard Modules

### Overview
| Module | Description |
|--------|-------------|
| Dashboard | KPI strip — active sites, revenue, tasks, calls |
| Active Clients | Client cards with status, balance, health |
| GitHub Status | Repo inventory with branch and issue counts |
| Deployments | Netlify deploy history with status |

### Operations
| Module | Description |
|--------|-------------|
| Call Mode | Call log with add/complete actions |
| Tasks | Kanban board — Todo / In Progress / Done |
| Client Pipeline | Acquisition pipeline by stage |
| Potential Clients | Filterable prospect list with CRUD |
| Maintenance | Site maintenance task tracker |

### Intelligence
| Module | Description |
|--------|-------------|
| Revenue | MRR, project revenue, pricing reference |
| Calendar | Upcoming events, follow-ups, milestones |
| Blockers | Active blockers by priority and owner |
| Next Actions | Prioritized action list with due dates |

### Tools & Systems
| Module | Description |
|--------|-------------|
| AI Team | AI subscription tool stack |
| Agent Workforce | AI agents deployed in EP workflows |
| Automation Center | Active automations with status |
| Integrations Map | Phase 1 connected + Phase 2 planned |
| Growth Stack | Growth levers with status and impact |

### Resources
| Module | Description |
|--------|-------------|
| Knowledge Center | Resource grid — docs, tools, forms, guides |
| Asset Library | Filterable media asset inventory |

### Personal
| Module | Description |
|--------|-------------|
| Personal Command | Focus, daily habits, quick links, contacts |
| Investor Dashboard | Placeholder — no real data (Phase 2 pending auth) |
| Banking Center | Links only — no account data stored |

---

## Design System

- **Colors:** Black (`#0a0a0a`) · Gold (`#c9a84c`) · Silver (`#a8b2bc`)
- **Typography:** Inter (body) · Space Grotesk (headings, labels)
- **Style:** Cinematic · Premium · Apple/Nike-inspired
- **Layout:** Fixed sidebar (260px) · Scrollable main
- **Responsive:** Full mobile support with hamburger nav at 600px

---

## Data Architecture

**`DATA`** — Immutable reference object in `app.js`. All mock data lives here.  
**`S`** — Working state in `localStorage` (`epcc-v2`). Editable: leads, tasks, prospects.  
**`SEED`** — Default values for `S` on first load or migration from v1.

Export/Import buttons on the dashboard back up and restore `S` as JSON.

---

## Security Notes

- The 251 gate provides zero real security — it is cinematic only
- No API keys are stored in this codebase
- No real financial, banking, or investment data is stored anywhere
- Investor Dashboard and Banking Center are placeholder-only in Phase 1
- Phase 2 sensitive integrations require Netlify Functions + environment variables + auth

---

## Phase 2 Roadmap

| Quarter | Integration |
|---------|-------------|
| Q3 2026 | GitHub + Netlify live data |
| Q4 2026 | Google Calendar + Gmail + Apollo |
| Q1 2027 | Stripe revenue + Zapier automations |
| Q2 2027 | ElevenLabs, Higgsfield, Firecrawl status |

Full plan: `docs/PHASE-2-API-PLAN.md`

---

*Elite Prodigy Media — Internal Use Only*
