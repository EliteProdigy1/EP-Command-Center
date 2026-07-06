# Phase 2 — API Integration Plan

## Security rules (non-negotiable)
- **No API keys in frontend JavaScript.** All integrations run through
  Netlify Functions (or another backend) with environment variables.
- Authentication in front of anything sensitive; Netlify password protection
  at minimum for the dashboard itself.
- Banking / credit / investing data: **read-only**, encrypted storage,
  explicit approval before any write action. Robinhood etc. must never expose
  account numbers or balances to the client bundle.
- Personal (Gmail/Calendar/Drive) data stays out of the repo entirely.

## Integration → mockData key map
| Integration | Replaces | Notes |
|---|---|---|
| GitHub API | `mockData.repos` | repo status, last commit, branches |
| Netlify API | `mockData.deployments` | live deploy state + build logs |
| CRM / HighLevel | `S.leads`, `S.prospects` | CRM becomes source of truth; dashboard displays state |
| Apollo | `S.prospects` | scored lead lists |
| Firecrawl | `prospect.websiteScore/websiteStatus` | automated website audits |
| SiteDrop | prospect "Build Concept" action | concept build kickoff |
| Google Calendar | `mockData.calendar` | read-only agenda |
| Gmail | notifications module (future) | outreach threads surfaced |
| Notion | `mockData.knowledge` | live doc index |
| Stripe / QuickBooks | `mockData.bankingFunding` revenue/expense cards | computed, read-only |
| Robinhood | `mockData.investorDashboard` | read-only watchlist/positions |
| ElevenLabs | Morning Briefing | daily audio from dashboard state |
| Zapier | `mockData.integrationsMap` | connection health |

## Example fetch shape
```js
// js/app.js — Phase 2
async function loadDeployments() {
  const res = await fetch('/.netlify/functions/netlify-status'); // key lives server-side
  mockData.deployments = await res.json();
  renderDeploys(); renderKPIs(); renderMissionControl();
}
```

## Prospecting workflow (target state)
Firecrawl / Site Source / Google research
→ find local businesses → detect website quality → score opportunity
→ prospect appears in Potential Clients → optional SiteDrop concept
→ qualified prospect moves to CRM → outreach sequence starts
→ Command Center displays state (CRM is the source of truth).

## Briefing loop (target state)
Connected tools → agent reports → Command Center state
→ ElevenLabs morning briefing → Jonathan approval → action taken → system updates.

## Suggested order of connection
1. Netlify API (deploy truth on the dashboard)
2. GitHub API (repo truth)
3. Firecrawl prospect audits (feeds tomorrow's calls)
4. CRM/HighLevel (move lead source-of-truth out of localStorage)
5. Google Calendar read-only
6. ElevenLabs morning briefing
7. Stripe/QuickBooks read-only revenue
8. Robinhood read-only (last; strictest security)


## Sprint 1 — Prospecting Engine API targets

| Integration | Replaces / fills | Example endpoint |
|---|---|---|
| Firecrawl | `prospect.websiteScore/mobileScore/seoScore/designScore`, `prospectAudits` | `POST /.netlify/functions/audit { url }` |
| Google Maps (Places) | discovery → new `prospects` | `POST /.netlify/functions/discover { industry, area }` |
| Apollo | `prospect.contactName/phone/email`, `leadSources` counts | `POST /.netlify/functions/enrich { businessName }` |
| SiteDrop | "Build SiteDrop Concept" hook → concept preview URL | `POST /.netlify/functions/sitedrop-concept { prospect }` |
| CRM / HighLevel | "Move to CRM" hook; long-term source of truth for prospects | `POST /.netlify/functions/crm-upsert { prospect }` |
| Google Calendar | "Schedule Follow-Up" → real calendar event | `POST /.netlify/functions/calendar-event { when, prospect }` |
| Claude / ChatGPT | "Generate Outreach Message" → tailored copy | `POST /.netlify/functions/draft-outreach { prospect }` |
| Zapier | `automationHealth` connection status | webhook health check |

### Prospecting workflow (target state)
```
Firecrawl / Site Source / Google Maps research
  -> find local businesses
  -> detect website quality or missing website
  -> score opportunity (weighted: website/mobile/seo/design)
  -> prospect appears in Command Center (Potential Clients)
  -> optional SiteDrop concept build
  -> qualified prospect moves to CRM (HighLevel)
  -> outreach sequence starts
```
The Command Center **displays** prospect state; the CRM / prospecting tools
own the data long-term. The six action buttons are the wiring points — each
has a `// PHASE 2:` comment in js/app.js.

### Security (unchanged, restated)
No API keys in frontend JavaScript. Every call above runs through a Netlify
Function (or backend) with environment variables. Prospect PII (phone/email)
and any personal/finance data stay server-side.
