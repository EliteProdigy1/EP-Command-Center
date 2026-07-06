/* ═══════════════════════════════════════════════════════════════
   Netlify Function — Firecrawl / discovery proxy  (Sprint 3 → live)
   ─────────────────────────────────────────────────────────────
   The frontend (services/firecrawl.js) calls:
     /.netlify/functions/firecrawl?action=discover&industry=..&location=..
     /.netlify/functions/firecrawl?action=audit&url=..

   SAFETY:
   - Returns 501 "mock mode" UNLESS BOTH are set (frontend then uses its
     built-in mock pool):
       FIRECRAWL_API_KEY   (secret — server-side only, never committed)
       FIRECRAWL_LIVE=true (explicit opt-in switch)
   - Discovery is hard-capped at MAX_DISCOVER. There is NO messaging /
     outreach endpoint here — discovery + audit only.
   - The key is read from process.env and never leaves the server.

   Discovery uses Firecrawl Search; audit uses Firecrawl Scrape and derives
   rough sub-scores from the page (add PageSpeed/Lighthouse later for exact
   numbers). No dependencies: global fetch (Netlify Node 18 runtime).
═══════════════════════════════════════════════════════════════ */

const MAX_DISCOVER = 10;          // hard cap — never mass-enrich
const FC = 'https://api.firecrawl.dev/v1';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

// A result that lives on a directory/social page means the business has no
// site of its own — that's the highest-opportunity signal for EP.
function isDirectory(url) {
  return /(yelp\.|facebook\.|instagram\.|google\.|maps\.|mapquest|yellowpages|bbb\.org|nextdoor|angi\.|thumbtack|tripadvisor|foursquare|manta\.)/i.test(url || '');
}
function cleanName(title, url) {
  var t = String(title || '').replace(/\s*[|\-–—:].*$/, '').trim();
  if (!t) { try { t = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { t = url; } }
  return t.slice(0, 80);
}
function mapSearchResult(r, industry, location) {
  var url = r.url || '';
  var dir = isDirectory(url);
  return {
    id: 'fc' + Math.random().toString(36).slice(2, 8),
    businessName: cleanName(r.title, url),
    industry: industry, location: location, source: 'Firecrawl',
    hasWebsite: !dir,
    websiteUrl: dir ? '' : url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    phone: '', rating: null, reviews: 0,
    signal: dir
      ? 'Only found on a directory/social listing — no website of their own (strongest opportunity)'
      : 'Has a site (' + (r.title ? String(r.title).slice(0, 60) : url) + ') — audit it for the gaps',
  };
}

function gradeFromScore(s) { return s >= 80 ? 'A' : s >= 65 ? 'B' : s >= 50 ? 'C' : s >= 35 ? 'D' : 'F'; }

// Derive rough audit sub-scores from a Firecrawl scrape (metadata + content).
function deriveAudit(data) {
  var meta = (data && data.metadata) || {};
  var md = (data && data.markdown) || '';
  var findings = [];
  var mobile = 45, seo = 45, design = 45;
  if (meta.viewport) mobile += 20; else { mobile -= 15; findings.push('No mobile viewport meta — likely not mobile-responsive'); }
  if (meta.description) seo += 15; else { seo -= 15; findings.push('Missing meta description — weak local SEO'); }
  if (meta.title) seo += 8; else findings.push('Missing/weak page title');
  if ((meta.ogImage || meta['og:image'])) design += 10; else findings.push('No social/OG image — poor link previews');
  var len = md.length;
  if (len < 600) { design -= 15; findings.push('Very little content — thin, low-trust page'); }
  else if (len > 4000) design += 8;
  if (!/https:/i.test(meta.sourceURL || meta.url || '')) findings.push('No HTTPS/SSL detected');
  var clamp = function (n) { return Math.max(0, Math.min(100, Math.round(n))); };
  mobile = clamp(mobile); seo = clamp(seo); design = clamp(design);
  if (!findings.length) findings.push('Basic checks passed — pull PageSpeed for exact scores');
  return { hasWebsite: true, grade: gradeFromScore(Math.round((mobile + seo + design) / 3)), mobile: mobile, seo: seo, design: design, findings: findings };
}

exports.handler = async function (event) {
  const q = event.queryStringParameters || {};
  const action = q.action || '';
  const key = process.env.FIRECRAWL_API_KEY;
  const live = process.env.FIRECRAWL_LIVE === 'true';

  // Not explicitly enabled → frontend uses its mock pool (yellow).
  if (!key || !live) {
    return json(501, {
      error: 'Firecrawl in mock mode',
      action,
      hint: 'Set FIRECRAWL_API_KEY and FIRECRAWL_LIVE=true in Netlify env vars to enable live discovery/audits.',
    });
  }

  const headers = { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' };

  try {
    if (action === 'discover') {
      const industry = q.industry && q.industry !== 'All' ? q.industry : 'local business';
      const location = q.location && q.location !== 'All' ? q.location : 'Gulf Coast, Alabama';
      const res = await fetch(FC + '/search', {
        method: 'POST', headers,
        body: JSON.stringify({ query: industry + ' in ' + location, limit: MAX_DISCOVER }),
      });
      if (!res.ok) return json(502, { error: 'Firecrawl search error', status: res.status, detail: (await res.text()).slice(0, 300) });
      const data = await res.json();
      const raw = (data.data || data.results || []).slice(0, MAX_DISCOVER);
      // Map + dedupe by business name; no-website (directory) results first.
      const seen = {};
      const candidates = raw.map(function (r) { return mapSearchResult(r, industry, location); })
        .filter(function (c) { var k = c.businessName.toLowerCase(); if (seen[k]) return false; seen[k] = 1; return true; })
        .sort(function (a, b) { return (a.hasWebsite === b.hasWebsite) ? 0 : (a.hasWebsite ? 1 : -1); });
      return json(200, { source: 'Firecrawl', candidates: candidates });
    }

    if (action === 'audit') {
      const url = q.url || '';
      if (!url) return json(200, { hasWebsite: false, grade: 'F', mobile: 0, seo: 6, design: 0, findings: ['No website URL — nothing to audit; from-scratch build'] });
      const res = await fetch(FC + '/scrape', {
        method: 'POST', headers,
        body: JSON.stringify({ url: /^https?:/i.test(url) ? url : 'https://' + url, formats: ['markdown'] }),
      });
      if (!res.ok) return json(502, { error: 'Firecrawl scrape error', status: res.status, detail: (await res.text()).slice(0, 300) });
      const data = await res.json();
      return json(200, deriveAudit(data.data || data));
    }

    return json(400, { error: 'Unknown action "' + action + '"' });
  } catch (e) {
    return json(502, { error: 'Firecrawl request failed', detail: String(e).slice(0, 300) });
  }
};
