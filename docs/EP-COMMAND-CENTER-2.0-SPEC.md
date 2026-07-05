# EP Command Center 2.0 — Master Specification

**Version:** 2.0  
**Date:** July 2026  
**Author:** EP Media / Jonathan Walton  
**Status:** Phase 1 Complete — Mock Data Active

---

## Overview

EP Command Center is a private, cinematic operating dashboard for Elite Prodigy Media. It functions as a mission control interface — surfacing client status, revenue, tasks, deployments, blockers, AI tools, and strategic context in a single unified view.

It is intentionally built without a backend framework or database in Phase 1. All data is stored in `localStorage` and driven by a single `app.js` file. This keeps the system portable, fast, and zero-dependency.

---

## Architecture

```
ep-command-center/
├── index.html         # Cinematic gate (passcode lock screen)
├── dashboard.html     # Main operating dashboard
├── app.js             # All logic, data, and render functions
├── styles.css         # Dashboard design system
├── css/
│   └── gate.css       # Gate-specific cinematic styles
└── docs/
    ├── EP-COMMAND-CENTER-2.0-SPEC.md   ← this file
    └── PHASE-2-API-PLAN.md
```

---

## Gate (index.html)

### Purpose
Cinematic entry experience. Not a security system — it is a brand ritual.

### Behavior
- Page loads with animated EP monogram, film grain, grid overlay, ambient glow
- User clicks anywhere → hidden `<input type="password">` receives focus
- Three gold dots fill as digits are typed
- Code `251` → unlock animation → redirect to `dashboard.html` after 1.6 seconds
- Wrong code → "Access Denied" appears → clears after 1.2 seconds, refocuses
- Quick Portals at bottom provide unguarded links to key tools

### Security Note
The 251 gate is cinematic only. It provides zero real security. Do not store sensitive data in `localStorage` or expose API keys in this codebase.

### Portal Links
| Label | Destination |
|-------|-------------|
| Dashboard | dashboard.html |
| EP Sports Group | https://eliteprodigysportsgroup.netlify.app |
| EP Youth | https://eliteprodigysportsgroup.netlify.app/eliteprodigy.html |
| GitHub | https://github.com/EliteProdigy1 |
| Netlify | https://app.netlify.com |
| LeagueApps | https://eliteprodigy.leagueapps.com |

---

## Dashboard (dashboard.html + app.js)

### Layout
- Fixed sidebar (260px, dark)
- Main content area (scrollable)
- Topbar with "← Gate" link, section title, avatar "JW"
- Mobile: sidebar collapses at 900px, hamburger menu at 600px

### Navigation Structure

```
OVERVIEW
  Dashboard
  Active Clients
  GitHub Status
  Deployments

OPERATIONS
  Call Mode
  Tasks
  Client Pipeline
  Potential Clients
  Maintenance

INTELLIGENCE
  Revenue
  Calendar
  Blockers
  Next Actions

TOOLS & SYSTEMS
  AI Team
  Agent Workforce
  Automation Center
  Integrations Map
  Growth Stack

RESOURCES
  Knowledge Center
  Asset Library

PERSONAL
  Personal Command
  Investor Dashboard
  Banking Center
```

---

## Data Architecture

### DATA (immutable reference)
Static source-of-truth object in `app.js`. Contains all mock data for Phase 1.

| Key | Contents |
|-----|----------|
| `clients` | Active client objects |
| `projects` | EP Media project list |
| `repos` | GitHub repo stubs |
| `deployments` | Netlify deployment records |
| `kpis` | Revenue/activity KPI values |
| `aiTools` | AI subscription tools |
| `assets` | Asset library entries |
| `outreach` | Daily outreach queue |
| `maintenance` | Site maintenance tasks |
| `pricing` | Service pricing tiers |
| `calendar` | Upcoming events and tasks |
| `blockers` | Active blockers with priority |
| `nextActions` | Prioritized next actions |
| `agentWorkforce` | AI agent registry |
| `automations` | Automation pipeline entries |
| `integrationsMap` | Phase 1 + Phase 2 integrations |
| `growthStack` | Growth levers with status |
| `knowledgeCenter` | Resource links and docs |
| `personalCommand` | Focus, habits, quick links |
| `investorDashboard` | Placeholder — no real data |
| `bankingCenter` | Links only — no real data |

### S (working state — localStorage)
Editable data that persists across sessions.

| Key | Contents |
|-----|----------|
| `leads` | Call log entries |
| `tasks` | Task board items |
| `callLog` | Completed calls |
| `prospects` | Potential client pipeline |

**Storage key:** `epcc-v2`

### SEED
Default values for `S` when localStorage is empty or missing keys. Used for migration when upgrading from v1 state.

---

## Modules Reference

### Dashboard Overview
- KPI strip: Active Sites, Monthly Revenue, Open Tasks, Calls This Month
- Quick stats for rapid situational awareness

### Active Clients
- Client cards with status badges, balance indicators, health dots
- Edit project, view maintenance, quick actions

### GitHub Status
- Repo list with branch, last push, open issues
- Color-coded activity indicators

### Deployments
- Netlify deployment history
- Status (live/building/failed), deploy time, commit ref

### Call Mode
- Call log with add/complete/delete
- Tracks outreach activity by date

### Tasks
- Kanban board: Todo / In Progress / Done
- Add task, move between columns, delete

### Client Pipeline
- Kanban: Prospect / Proposal / Active / Complete
- Drag-to-advance-style buttons

### Potential Clients
- Filterable by status: Research / Demo Ready / Pitched / Follow-up / Not Interested
- Add prospect form (business name, contact, industry, notes)
- Advance status, edit, delete per row
- Persists in localStorage

### Maintenance
- Per-site maintenance task list
- Status tracking

### Revenue
- MRR, project revenue, total
- Service pricing reference

### Calendar
- Upcoming events, follow-ups, milestones, tasks
- Color coded by type

### Blockers
- High/medium priority blockers
- Owner, resolution notes

### Next Actions
- Numbered priority list with due date
- Context labels

### AI Team
- AI subscription tools with tier, use case, status
- Monthly cost tracking

### Agent Workforce
- AI agents deployed in EP workflows
- Status: active / standby / planned
- Direct links to each tool

### Automation Center
- Active automations with platform, trigger, action
- Status tracking

### Integrations Map
- Phase 1 (connected) integrations
- Phase 2 (planned) integrations with target date

### Growth Stack
- Growth levers: SEO, content, outreach, referrals, etc.
- Status and impact rating

### Knowledge Center
- Resource grid: docs, external tools, forms, guides
- Opens in new tab

### Asset Library
- Media assets, logos, photos
- Download links

### Personal Command
- Focus statement
- Daily habit checklist
- Quick links (8)
- Emergency contacts (2)

### Investor Dashboard
- Phase 1: placeholder with security warning
- Phase 2: connect via Netlify Function + auth
- No real financial data stored

### Banking Center
- Phase 1: links only (Relay, Mercury, Stripe)
- No account numbers, balances, or credentials stored
- Phase 2 requires backend auth before any live data

---

## Render Pattern

Every module follows this pattern:

```javascript
function renderModuleName() {
  const container = document.getElementById('container-id');
  if (!container) return;
  container.innerHTML = DATA.moduleKey.map(item => `
    <div class="card">...</div>
  `).join('');
}
```

All renders are called from `renderAll()` on page load and after any state mutation.

---

## State Mutations

All edits to `S` call `save()` immediately after mutation, then re-render the affected section.

```javascript
function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(S));
}
```

---

## Export / Import

- **Export**: `JSON.stringify(S)` → Blob download as `epcc-backup-[timestamp].json`
- **Import**: `FileReader` reads uploaded `.json`, validates, replaces `S`, saves, re-renders

---

## Design System

See `styles.css` for complete token reference.

### Key Tokens
```css
--bg-base:    #0a0a0a
--bg-surface: #111111
--bg-card:    #141414
--gold:       #c9a84c
--gold-light: #e8c96a
--silver:     #a8b2bc
--text-primary: #f0f0f0
--border:     rgba(255,255,255,0.06)
--sidebar-w:  260px
```

### Typography
- Display: Space Grotesk (headings, labels, nav)
- Body: Inter (content, descriptions)

---

## Phase 1 Constraints

- No live API connections
- No backend server
- No authentication
- No real financial data
- Mock data only in `DATA` object
- Working state only in `S` (localStorage)

---

## Upgrade Path to Phase 2

See `docs/PHASE-2-API-PLAN.md` for full integration roadmap.

Phase 2 introduces:
- Netlify Functions as a secure API proxy layer
- Environment variables for all API keys
- JWT or Netlify Identity for auth
- Live data from: GitHub, Netlify, Apollo, Gmail, Google Calendar, Zapier, Stripe

Sensitive modules (Investor Dashboard, Banking Center) require additional auth layer beyond the gate before displaying live data.
