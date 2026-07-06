/* ═══════════════════════════════════════════════════════════════
   Netlify Function — Firecrawl / discovery proxy  (Sprint 3)
   ─────────────────────────────────────────────────────────────
   The frontend (services/firecrawl.js) calls:
     /.netlify/functions/firecrawl?action=discover&industry=..&location=..
     /.netlify/functions/firecrawl?action=audit&url=..

   SAFETY (Sprint 3 is mock/test only):
   - This function returns 501 "mock mode" UNLESS BOTH of these are set:
       FIRECRAWL_API_KEY   (the secret — server-side only, never committed)
       FIRECRAWL_LIVE=true (an explicit opt-in switch)
     With 501, the frontend runs its built-in mock pool. So live calls
     NEVER happen by accident — no credits burned, no mass enrichment.
   - Even when live, discovery is hard-capped (MAX_DISCOVER) and audit is
     one URL at a time. There is NO messaging/outreach endpoint here.

   PHASE 3 (later): flip FIRECRAWL_LIVE=true, add FIRECRAWL_API_KEY, and the
   commented live blocks below call Firecrawl. Google Places / Yelp can be
   added the same way behind their own keys. The frontend + UI do not change.

   No dependencies: uses the global fetch in the Netlify Node 18 runtime.
═══════════════════════════════════════════════════════════════ */

const MAX_DISCOVER = 10; // hard cap — never mass-enrich

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

exports.handler = async function (event) {
  const q = event.queryStringParameters || {};
  const action = q.action || '';
  const key = process.env.FIRECRAWL_API_KEY;
  const live = process.env.FIRECRAWL_LIVE === 'true';

  // Not explicitly enabled → tell the frontend to use its mock pool (yellow).
  if (!key || !live) {
    return json(501, {
      error: 'Firecrawl in mock mode',
      action,
      hint: 'Set FIRECRAWL_API_KEY and FIRECRAWL_LIVE=true in Netlify env vars to enable live discovery/audits. Mock mode uses built-in test data.',
    });
  }

  try {
    // ─────────────────────────────────────────────────────────────
    // LIVE PATH (Phase 3) — intentionally minimal + capped.
    // Discovery: business search by industry + location.
    // Audit:     scrape one site and derive scores.
    // Wire the real Firecrawl endpoints here when you go live:
    //
    // if (action === 'discover') {
    //   const res = await fetch('https://api.firecrawl.dev/v1/search', {
    //     method: 'POST',
    //     headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ query: q.industry + ' in ' + q.location, limit: MAX_DISCOVER }),
    //   });
    //   const data = await res.json();
    //   const candidates = (data.data || []).slice(0, MAX_DISCOVER).map(mapSearchResult);
    //   return json(200, { source: 'Firecrawl', candidates });
    // }
    // if (action === 'audit') {
    //   const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    //     method: 'POST',
    //     headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ url: q.url, formats: ['markdown'] }),
    //   });
    //   const data = await res.json();
    //   return json(200, deriveAuditScores(data));  // { mobile, seo, design, findings }
    // }
    // ─────────────────────────────────────────────────────────────

    // Until the live blocks above are wired, even the enabled path is a no-op
    // so nothing runs unreviewed.
    return json(501, { error: 'Live path not wired yet', action, hint: 'Uncomment the Firecrawl live blocks in netlify/functions/firecrawl.js when ready.' });
  } catch (e) {
    return json(502, { error: 'Firecrawl request failed', detail: String(e).slice(0, 300) });
  }
};
