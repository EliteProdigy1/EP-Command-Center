# EP Command Center — Phase 2 API Integration Plan

**Version:** 1.0  
**Date:** July 2026  
**Status:** Planning — Not Yet Implemented

---

## Overview

Phase 2 replaces mock data with live API connections. All integrations route through Netlify Functions to protect API keys and enforce access control. No API keys are ever exposed in frontend JavaScript.

---

## Security Architecture

```
Browser (index.html / dashboard.html)
  ↓ fetch('/api/github-status')
Netlify Function (functions/github-status.js)
  ↓ uses process.env.GITHUB_TOKEN
GitHub API
```

**Rules:**
- All API keys in Netlify environment variables — never in source code
- All live data fetched server-side via Netlify Functions
- Sensitive sections (Investor, Banking) require secondary auth check before rendering live data
- Read-only by default — no write operations without explicit approval from Jonathan

---

## Integration Roadmap

### Priority 1 — Highest Impact (Q3 2026)

#### GitHub
- **Endpoint:** Netlify Function → GitHub REST API
- **Data:** Repo list, last push, open issues, branch status
- **Replaces:** `DATA.repos` (mock)
- **Auth:** `GITHUB_TOKEN` (Personal Access Token, read-only)
- **Function:** `functions/github-status.js`
- **Dashboard section:** GitHub Status

#### Netlify
- **Endpoint:** Netlify Function → Netlify API
- **Data:** Deploy history, build status, site list, form submissions count
- **Replaces:** `DATA.deployments` (mock)
- **Auth:** `NETLIFY_TOKEN`
- **Function:** `functions/netlify-status.js`
- **Dashboard section:** Deployments

#### Apollo.io
- **Endpoint:** Netlify Function → Apollo API
- **Data:** Contact search, sequence status, task count
- **Replaces:** `DATA.outreach` and partial `S.prospects` (mock)
- **Auth:** `APOLLO_API_KEY`
- **Function:** `functions/apollo-contacts.js`
- **Dashboard section:** Potential Clients, Call Mode

---

### Priority 2 — Operations (Q4 2026)

#### Google Calendar
- **Endpoint:** Netlify Function → Google Calendar API
- **Data:** Upcoming events (next 14 days)
- **Replaces:** `DATA.calendar` (mock)
- **Auth:** `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
- **Function:** `functions/calendar-events.js`
- **Dashboard section:** Calendar
- **Note:** OAuth flow required. Refresh token stored in Netlify env, never in browser.

#### Gmail
- **Endpoint:** Netlify Function → Gmail API
- **Data:** Unread count, Netlify form notification threads
- **Auth:** Same OAuth credentials as Calendar
- **Function:** `functions/gmail-unread.js`
- **Dashboard section:** Dashboard Overview (KPI strip)
- **Constraint:** Read-only. No send capability in Phase 2 without approval.

#### Zapier
- **Endpoint:** Netlify Function → Zapier Webhooks or NLA API
- **Data:** Automation run history, trigger counts
- **Replaces:** `DATA.automations` (mock)
- **Auth:** `ZAPIER_NLA_KEY`
- **Function:** `functions/zapier-status.js`
- **Dashboard section:** Automation Center

---

### Priority 3 — Revenue & Finance (Q1 2027)

#### Stripe
- **Endpoint:** Netlify Function → Stripe API
- **Data:** MRR, recent charges, subscription status
- **Replaces:** `DATA.kpis.revenue` (mock)
- **Auth:** `STRIPE_SECRET_KEY` (restricted, read-only)
- **Function:** `functions/stripe-revenue.js`
- **Dashboard section:** Revenue
- **Constraint:** Read-only. No payment initiation in this system.

#### Relay / Mercury (Banking)
- **Approach:** Links only in Phase 2 — no live balance data
- **Reason:** Banking APIs require additional OAuth, FDIC compliance considerations, and explicit approval
- **Phase 3 consideration:** If live balance needed, use read-only Plaid integration with Jonathan's explicit approval
- **Dashboard section:** Banking Center

#### Robinhood / Investment
- **Approach:** Links only in Phase 2
- **Reason:** No official Robinhood API for third-party apps; any scraping approach is against ToS
- **Alternative:** Manual entry form for investment tracking if needed
- **Dashboard section:** Investor Dashboard

---

### Priority 4 — AI & Media (Q2 2027)

#### ElevenLabs
- **Endpoint:** Netlify Function → ElevenLabs API
- **Data:** Character quota used, voice list, recent generations
- **Auth:** `ELEVENLABS_API_KEY`
- **Function:** `functions/elevenlabs-status.js`
- **Dashboard section:** AI Team, Agent Workforce

#### Higgsfield
- **Endpoint:** Netlify Function → Higgsfield API
- **Data:** Generation quota, recent jobs
- **Auth:** `HIGGSFIELD_API_KEY`
- **Function:** `functions/higgsfield-status.js`
- **Dashboard section:** AI Team, Agent Workforce

#### Firecrawl
- **Endpoint:** Netlify Function → Firecrawl API
- **Data:** Scrape job history, remaining credits
- **Auth:** `FIRECRAWL_API_KEY`
- **Function:** `functions/firecrawl-status.js`
- **Dashboard section:** Agent Workforce, Growth Stack

---

## Netlify Functions Structure

```
functions/
├── github-status.js       # GitHub repo data
├── netlify-status.js      # Netlify deploys and forms
├── apollo-contacts.js     # Apollo prospects and outreach
├── calendar-events.js     # Google Calendar events
├── gmail-unread.js        # Gmail unread / form notifications
├── zapier-status.js       # Automation run history
├── stripe-revenue.js      # Revenue and subscription data
├── elevenlabs-status.js   # ElevenLabs quota
├── higgsfield-status.js   # Higgsfield job status
└── firecrawl-status.js    # Firecrawl credit usage
```

---

## Environment Variables (Netlify Dashboard)

Set in: Netlify → Site → Environment variables

```
GITHUB_TOKEN
NETLIFY_TOKEN
APOLLO_API_KEY
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
ZAPIER_NLA_KEY
STRIPE_SECRET_KEY
ELEVENLABS_API_KEY
HIGGSFIELD_API_KEY
FIRECRAWL_API_KEY
```

**Never commit these to any file in the repo.**

---

## Frontend Upgrade Pattern

When a function is ready, replace the mock data call in `app.js`:

**Before (Phase 1):**
```javascript
function renderDeployCards() {
  const container = document.getElementById('deploy-cards');
  if (!container) return;
  container.innerHTML = DATA.deployments.map(d => `...`).join('');
}
```

**After (Phase 2):**
```javascript
async function renderDeployCards() {
  const container = document.getElementById('deploy-cards');
  if (!container) return;
  container.innerHTML = '<div class="loading">Loading deployments...</div>';
  try {
    const res = await fetch('/api/netlify-status');
    const deployments = await res.json();
    container.innerHTML = deployments.map(d => `...`).join('');
  } catch (e) {
    container.innerHTML = '<div class="error">Failed to load deployments</div>';
  }
}
```

No HTML structure changes needed. The render functions are already isolated.

---

## Auth Strategy

Phase 2 uses Netlify Identity (or a simple JWT check) to protect the `/api/*` routes.

```
User → index.html (251 gate) → dashboard.html
  → fetch('/api/sensitive-data')
    → Netlify Function checks Authorization header
      → Valid: return data
      → Invalid: return 401
```

The 251 gate remains cinematic only. Real auth happens at the function level.

For extra-sensitive sections (Banking Center, Investor Dashboard):
- Require a separate PIN or passphrase stored server-side
- Rate-limit attempts
- Log access timestamp to a Netlify-connected store (FaunaDB or Upstash)

---

## Timeline

| Quarter | Milestone |
|---------|-----------|
| Q3 2026 | GitHub + Netlify live data |
| Q4 2026 | Google Calendar + Gmail + Apollo live |
| Q1 2027 | Stripe revenue live, Zapier automations live |
| Q2 2027 | AI tool status live (ElevenLabs, Higgsfield, Firecrawl) |
| Q3 2027 | Auth hardening, Banking Center decision point |

---

## Decision Log

| Date | Decision |
|------|----------|
| July 2026 | Phase 1 ships with mock data only — no backend |
| July 2026 | Banking and investment data: links only until Phase 3 |
| July 2026 | All API keys: Netlify env vars only, never in source |
| July 2026 | All integrations: read-only by default |
| July 2026 | Zapier chosen over direct API calls for low-code automations |
