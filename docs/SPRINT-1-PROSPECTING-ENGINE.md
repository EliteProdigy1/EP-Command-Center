# Sprint 1 — Prospecting Engine

**Built:** 2026-07-05 · **Status:** Phase 1 (mock data; no live APIs)

The Command Center's answer to one question: **"Who should EP Media reach out to next?"**

## Modules

| Module | Where | What it does |
|---|---|---|
| **Intelligence Center** | nav → Intelligence Center | Prospecting cockpit — stacks the five sub-modules below and ranks who to call first |
| **Potential Clients** | nav → Potential Clients | Full prospect table: 6 filters, search, add form, promote-to-pipeline |
| **Prospect Detail Panel** | click any prospect | 20 fields, 4-bar score breakdown, 6 action hooks |
| **Opportunity Scoring** | inside Intelligence Center | Rubric: weighted overall score, High/Medium/Low bands (lower score = bigger opportunity) |
| **Lead Source Tracker** | inside Intelligence Center | Where prospects come from (Firecrawl, Google Maps, Apollo, manual…) with live counts |
| **Daily Lead Report** | inside Intelligence Center | Today's snapshot + the "call these first" ranked list |
| **Automation Health** | inside Intelligence Center | Status of the pipelines that feed the engine |

## Architecture

Everything renders from data in `js/app.js` — nothing is hardcoded in HTML.

- **mockData keys added:** `prospects`, `leadSources`, `opportunityScores`,
  `prospectAudits`, `dailyLeadReport`, `automationHealth`
- **Module registry:** `dashboardModules` gains `intelligence`,
  `opportunity-scoring`, `lead-source-tracker`, `daily-lead-report`,
  `automation-health` — each surfaces a summary card on Mission Control
- **Working state (`S`, localStorage):** `prospects` are seeded from
  `mockData.prospects` and become editable (add / promote / advance / audit).
  Existing saved data auto-migrates to the 20-field schema on load.

### Each prospect (20 fields)
`businessName, industry, location, websiteUrl, websiteStatus, websiteScore,
mobileScore, seoScore, designScore, sourceTool, opportunityLevel,
pipelineStatus, recommendedAction, contactName, phone, email, socialLinks,
lastChecked, nextFollowUp, notes` (+ `id`).

### Filters (6)
Industry · Location · Opportunity level · Source tool · Pipeline status · Website status
(plus free-text search).

### Action hooks (6) — placeholders now, Phase 2 wires each
`Run Audit` · `Build SiteDrop Concept` · `Move to CRM` · `Mark Contacted` ·
`Schedule Follow-Up` · `Generate Outreach Message`.
Each updates local state today and carries a clear `// PHASE 2:` comment
in `js/app.js` for where the real API call goes.

## Opportunity scoring
Overall `websiteScore` is a weighted blend (website 30% · mobile 30% · SEO 20%
· design 20%). **Lower = bigger opportunity.** Bands: High ≤45 · Medium ≤65 ·
Low >65. The Daily Lead Report sorts the call list by lowest score first.

## Phase 2 connection (see PHASE-2-API-PLAN.md)
Firecrawl / Site Source / Google Maps research → find local businesses →
detect website quality / missing site → score opportunity → prospect appears
here → optional SiteDrop concept → qualified prospect moves to CRM → outreach
sequence starts. The CRM (not this dashboard) is the long-term source of truth.
