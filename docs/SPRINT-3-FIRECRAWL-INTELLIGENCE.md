# Sprint 3 — Firecrawl Intelligence (Prospect Pool Pipeline)

**Status: MOCK / TEST ONLY.** No live Firecrawl calls, no credits, no mass
enrichment, no messaging. The whole pipeline runs on built-in test data until
it is explicitly switched to live.

## The pipeline

```
Discover ──► Website Intelligence ──► Opportunity Score ──► Prospects ──► Call Queue
(Firecrawl/     (audit each site,        (lower = bigger      (the pool)     (ready to
 Google/Yelp)    grade + sub-scores)      opportunity)                        dial, hottest first)
```

Built around **no-website businesses first** — a business with no site is the
strongest opportunity because EP's core $1,000 website *is* the whole solution.

## Where it lives

- **UI:** sidebar → **Prospect Discovery** (`#section-discovery`). Pick an
  industry + location, press **Run Discovery (test)**. Candidates surface
  no-website-first. Each card: **Run Website Intelligence** (audit) → shows a
  grade, sub-scores, findings, and an opportunity score → **Add to Prospects**.
  The **Call Queue** underneath ranks everything you've added, hottest first,
  with tap-to-dial and **→ Call Mode**.
- **Data:** `mockData.discoveryPool` in `js/app.js` — the businesses a search
  *would* return. Nothing is hardcoded in HTML; every card renders from data.
- **Service:** `services/firecrawl.js` — `discover(industry, location)` and
  `audit(candidate)`. Tries the Netlify Function, falls back to the mock pool.
- **Proxy:** `netlify/functions/firecrawl.js` — holds the key server-side.
- **Scoring:** `computeOpportunity(audit)` in `js/app.js` — one rubric for the
  whole dashboard (High ≤45 · Medium ≤65 · Low >65; no website = 10 = High).

## Safety gate (why nothing runs live yet)

The Netlify Function returns **501 "mock mode"** unless **BOTH** are set:

| Env var | Purpose |
|---------|---------|
| `FIRECRAWL_API_KEY` | the Firecrawl secret (server-side only) |
| `FIRECRAWL_LIVE=true` | explicit opt-in switch |

With 501, the frontend uses `mockData.discoveryPool`. So live discovery can
**never** happen by accident. Even once enabled, discovery is hard-capped
(`MAX_DISCOVER = 10`) and there is **no messaging/outreach endpoint** in this
function at all.

## Going live later (Phase 3)

1. Add `FIRECRAWL_API_KEY` and `FIRECRAWL_LIVE=true` in Netlify env vars.
2. Uncomment the live `discover` / `audit` blocks in
   `netlify/functions/firecrawl.js` (real Firecrawl search + scrape, already
   capped). Google Places / Yelp can be added behind their own keys the same way.
3. Redeploy. The UI, scoring, and prospect/call-queue flow do **not** change —
   only the data source flips from mock to live, and the engine badge turns
   from **MOCK MODE** to **LIVE**.

Do **not** enable live until you're ready to spend credits and have reviewed
the capped result counts. This sprint is deliberately test-only.
