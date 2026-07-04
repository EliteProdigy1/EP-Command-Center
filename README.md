# EP Command Center

**Elite Prodigy Media — Internal Operating System Dashboard**

> Internal admin dashboard. Not for public distribution. No real APIs connected.

---

## Overview

The EP Command Center is the internal operating system for Elite Prodigy Media. It provides a single-pane view of all active clients, repositories, deployments, tasks, pipeline, revenue, AI tools, and asset library.

This is a **static HTML/CSS/JS mockup** using placeholder data only. It is designed to be connected to real APIs in a future phase.

---

## Dashboard Modules

| Module | Description |
|---|---|
| **Dashboard** | KPI overview — clients, deploys, tasks, revenue snapshot |
| **Clients** | Full client roster with status, retainer, and repo links |
| **Repositories** | GitHub repo inventory with status and migration warnings |
| **Deployments** | Netlify deployment status for all client sites |
| **Tasks** | Kanban-style task board (To Do / In Progress / Done) |
| **Pipeline** | Client acquisition pipeline by stage |
| **Maintenance** | Urgent, warning, and informational maintenance items |
| **Revenue** | Revenue snapshot by client and type |
| **AI Tools** | Full EP Media AI tool stack reference |
| **Asset Library** | Filterable asset inventory across all clients |

---

## Design System

- **Colors:** Black (`#0a0a0a`) / Gold (`#c9a84c`) / Silver (`#a8b2bc`)
- **Typography:** Inter (body) + Space Grotesk (headings/display)
- **Style:** Apple/Nike-inspired — clean, premium, minimal
- **Layout:** Fixed sidebar + scrollable main content
- **Responsive:** Full mobile support with hamburger nav

---

## Files

```
EP-Command-Center/
├── index.html      — Main dashboard HTML structure
├── styles.css      — Full design system and component styles
├── app.js          — Mock data, render functions, navigation logic
└── README.md       — This file
```

---

## Roadmap: Real API Connections (Phase 2)

The following integrations are planned for Phase 2:

- **GitHub API** — Live repo status, commit history, branch counts
- **Netlify API** — Real deploy status, build logs, site health
- **Notion API** — Pull tasks and client notes from Notion databases
- **Stripe / QuickBooks** — Real revenue and invoice data
- **Zapier Webhooks** — Trigger automations from dashboard actions

---

## Current Status

This is a **Phase 1 mockup**. All data is hardcoded in `app.js` under the `DATA` object. No external requests are made.

**Production:** Not yet deployed. Pending Netlify site creation for `EliteProdigy1/EP-Command-Center`.

---

*Elite Prodigy Media — Internal Use Only*
