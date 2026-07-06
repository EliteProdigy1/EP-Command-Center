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
