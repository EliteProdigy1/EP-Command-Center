/* ═══════════════════════════════════════════════════════════════
   Netlify Function — Firecrawl / discovery + enrichment proxy
   ─────────────────────────────────────────────────────────────
   Actions (GET ?action=..):
     status   → { live, hasKey, ... }  (no Firecrawl call, no credits)
     discover → individual businesses only (category/"Top 10"/directory
                search pages are filtered out)
     enrich   → scrape one business and pull phone, email, address, socials,
                Google Business Profile, category, logo, photos, rating, reviews
     audit    → rough website sub-scores from a scrape

   SAFETY: returns 501 "mock mode" unless FIRECRAWL_API_KEY + FIRECRAWL_LIVE
   are set (frontend then uses its mock pool). Discovery hard-capped at
   MAX_DISCOVER. No messaging endpoint. Key read from env only, never returned.
   Global fetch (Netlify Node 18). No dependencies.
═══════════════════════════════════════════════════════════════ */

const MAX_DISCOVER = 10;
const FC = 'https://api.firecrawl.dev/v1';

function json(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) };
}

// A result living on a directory/social page = the business has no site of its
// own (high opportunity). But a directory SEARCH/CATEGORY page is not a business.
function isDirectory(url) {
  return /(yelp\.|facebook\.|instagram\.|google\.|maps\.|mapquest|yellowpages|bbb\.org|nextdoor|angi\.|thumbtack|tripadvisor|foursquare|manta\.)/i.test(url || '');
}
// Directory/aggregator hosts. A result on one of these is only an individual
// business if it's a specific PROFILE path; otherwise it's a list/category page.
function isAggregator(url) {
  return /(yelp|yellowpages|angi|thumbtack|bbb\.org|mapquest|tripadvisor|foursquare|manta\.|nextdoor|houzz|porch\.com|expertise\.com)\./i.test(url || '');
}
function isBusinessProfilePath(url) {
  return /(\/biz\/[a-z0-9-]+|\/maps\/place\/|g\.page\/|facebook\.com\/[a-z0-9.]{2,}\/?$|instagram\.com\/[a-z0-9_.]{2,}\/?$)/i.test(url || '');
}
// Exclude category pages, listicles ("Top 10 …"), and directory search results.
function isListingPage(title, url) {
  var t = String(title || '').toLowerCase();
  var u = String(url || '').toLowerCase();
  if (/\b(top|best)\s*\d+\b|\b\d+\s+(best|top)\b|\bnear me\b|\b\d+\s+(best|top)\s+\w+/.test(t)) return true;
  if (/\bbest\s+\w+\s+(in|near)\b|\b(companies|services|contractors|pros|reviews|directory)\b.*\bin\s+[a-z]/.test(t)) return true;
  if (/(\/search|\/find|\/c\/|\/category|\/categories|\/companylist|\/company-list|\/biz-listing|\/best-|\/top-|\/browse|\/directory|\/biz\/?$|[?&]q=|[?&]find_)/.test(u)) return true;
  if (/^https?:\/\/(www\.)?(yelp|yellowpages|angi|thumbtack|bbb|mapquest)\.[a-z.]+\/?$/.test(u)) return true;
  // Aggregator host without a specific business-profile path = a list page.
  if (isAggregator(u) && !isBusinessProfilePath(u)) return true;
  return false;
}
// A title is "generic" when it's basically the search query (industry + city)
// or filler like "Pro <industry>…"/"…Services in <city>" — i.e. an SEO title,
// not a brand. Then we derive the real name from the domain instead.
var TRADE = 'pressure|power|soft|home|gulf|coast|coastal|shore|shores|bay|clean|cleaning|wash|washing|solutions|service|services|landscap\\w*|lawn|turf|roof\\w*|detail\\w*|fence|tree|hvac|heating|cooling|air|electric\\w*|plumb\\w*|paint\\w*|concrete|window|pest|auto|barber|salon|studio|fitness|gym|dental|chiro\\w*';
function looksGeneric(name, industry, location) {
  var n = String(name || '').toLowerCase().trim();
  if (!n) return true;
  var city = String(location || '').split(',')[0].toLowerCase().trim();
  var indWords = String(industry || '').toLowerCase().split(/\s+/).filter(function (w) { return w.length > 3; });
  var hasInd = indWords.some(function (w) { return n.indexOf(w) !== -1; });
  var hasCity = city && n.indexOf(city) !== -1;
  if (hasInd && hasCity) return true;
  if (new RegExp('^(pro|best|top|leading|leader|premier|#?1|your|the|expert|experts|professional|affordable|local|quality|trusted)\\s+(' + TRADE + ')\\b', 'i').test(n)) return true;
  if (/\b(near me|company|companies)\b/.test(n) && (hasInd || hasCity)) return true;
  return false;
}
function domainBrand(url) {
  var h; try { h = new URL(/^https?:/i.test(url) ? url : 'https://' + url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  var base = (h.split('.')[0] || '').replace(/[^a-z0-9]/gi, '');
  if (!base || base.length < 3) return '';
  base = base.replace(/^(call|get|go|book|my|the)(?=[a-z]{3})/i, '');
  var spaced = base
    .replace(new RegExp('(' + TRADE + ')', 'gi'), ' $1')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ').trim();
  if (!spaced) return '';
  return spaced.replace(/\b\w/g, function (c) { return c.toUpperCase(); }).slice(0, 60);
}
function cleanName(title, url, industry, location) {
  var full = String(title || '').replace(/\s+/g, ' ').trim();
  var head = full.split(/\s*[|\-–—:•·]\s*/)[0].trim();       // brand before a separator
  var tail = (full.match(/,\s*(?:AL|FL|MS|GA)\b[\s.:-]*(.+)$/i) || [])[1] || ''; // brand after "…, AL"
  var cands = [];
  if (tail && !looksGeneric(tail, industry, location)) cands.push(tail.trim());
  if (head && !looksGeneric(head, industry, location)) cands.push(head);
  var db = domainBrand(url);
  if (db) cands.push(db);
  if (head) cands.push(head); // last resort: the cleaned title, generic or not
  var name = cands.find(function (x) { return x && x.length >= 3; }) || head || '';
  return name.slice(0, 80);
}
function rootDomain(url) {
  try { return new URL(/^https?:/i.test(url) ? url : 'https://' + url).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) { return ''; }
}
function mapSearchResult(r, industry, location) {
  var url = r.url || '';
  var dir = isDirectory(url);
  return {
    id: 'fc' + Math.random().toString(36).slice(2, 8),
    businessName: cleanName(r.title, url, industry, location),
    industry: industry, location: location, source: 'Firecrawl',
    hasWebsite: !dir,
    websiteUrl: dir ? '' : url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    listingUrl: url, // where we found them (for enrichment scrape)
    phone: '', email: '', address: '', category: industry,
    gbpUrl: '', facebook: dir && /facebook\./i.test(url) ? url : '', instagram: '',
    logoUrl: '', photos: [], rating: null, reviews: 0,
    signal: dir
      ? 'Found on a directory/social listing - no website of their own (strongest opportunity)'
      : 'Has a site (' + (r.description ? String(r.description).slice(0, 60) : url) + ') - audit it for the gaps',
  };
}

// ── Enrichment: pull structured business data out of a scrape ──
function collectLinks(meta, md) {
  var links = (md.match(/https?:\/\/[^\s)"'\]]+/g) || []);
  ['facebook', 'instagram'].forEach(function () {});
  Object.keys(meta || {}).forEach(function (k) { var v = meta[k]; if (typeof v === 'string' && /^https?:/.test(v)) links.push(v); });
  return links;
}
function firstMatch(links, re) { for (var i = 0; i < links.length; i++) if (re.test(links[i])) return links[i]; return ''; }

function extractEnrichment(data, candidate) {
  data = data || {};
  var meta = data.metadata || {};
  var md = data.markdown || '';
  var blob = md + ' ' + JSON.stringify(meta);
  var links = collectLinks(meta, md);
  var phone = (blob.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/) || [''])[0].trim();
  var email = (blob.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i) || [''])[0];
  var address = (blob.match(/\d{1,6}\s+[A-Za-z0-9.\s]+,\s*[A-Za-z .]+,\s*[A-Z]{2}\s*\d{5}/) || [''])[0].trim();
  var rating = parseFloat((blob.match(/([0-5](?:\.\d)?)\s*(?:star|out of\s*5|\/\s*5)/i) || [0, ''])[1]) || null;
  var reviews = parseInt((blob.match(/(\d{1,5})\s+reviews?/i) || [0, ''])[1], 10) || 0;
  var photos = (md.match(/https?:\/\/[^\s)"'\]]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s)"'\]]*)?/gi) || []).slice(0, 8);
  var logo = meta.ogImage || meta['og:image'] || meta.image || meta.favicon || (photos[0] || '');
  return {
    phone: phone, email: email, address: address,
    facebook: firstMatch(links, /facebook\.com/i),
    instagram: firstMatch(links, /instagram\.com/i),
    gbpUrl: firstMatch(links, /(google\.[a-z.]+\/maps|g\.page|business\.google|goo\.gl\/maps)/i),
    logoUrl: logo || '', photos: photos,
    category: meta.category || candidate.category || candidate.industry || '',
    rating: rating, reviews: reviews,
  };
}
function gradeFromScore(s) { return s >= 80 ? 'A' : s >= 65 ? 'B' : s >= 50 ? 'C' : s >= 35 ? 'D' : 'F'; }
function deriveAudit(data) {
  var meta = (data && data.metadata) || {}, md = (data && data.markdown) || '';
  var findings = [], mobile = 45, seo = 45, design = 45;
  if (meta.viewport) mobile += 20; else { mobile -= 15; findings.push('No mobile viewport meta — likely not mobile-responsive'); }
  if (meta.description) seo += 15; else { seo -= 15; findings.push('Missing meta description — weak local SEO'); }
  if (meta.title) seo += 8; else findings.push('Missing/weak page title');
  if (meta.ogImage || meta['og:image']) design += 10; else findings.push('No social/OG image — poor link previews');
  if (md.length < 600) { design -= 15; findings.push('Very little content — thin, low-trust page'); } else if (md.length > 4000) design += 8;
  var clamp = function (n) { return Math.max(0, Math.min(100, Math.round(n))); };
  mobile = clamp(mobile); seo = clamp(seo); design = clamp(design);
  if (!findings.length) findings.push('Basic checks passed — pull PageSpeed for exact scores');
  return { hasWebsite: true, grade: gradeFromScore(Math.round((mobile + seo + design) / 3)), mobile: mobile, seo: seo, design: design, findings: findings };
}

async function scrape(url, headers) {
  var res = await fetch(FC + '/scrape', {
    method: 'POST', headers,
    body: JSON.stringify({ url: /^https?:/i.test(url) ? url : 'https://' + url, formats: ['markdown'] }),
  });
  if (!res.ok) throw new Error('scrape ' + res.status + ': ' + (await res.text()).slice(0, 200));
  var data = await res.json();
  return data.data || data;
}

exports.handler = async function (event) {
  const q = event.queryStringParameters || {};
  const action = q.action || '';
  const key = (process.env.FIRECRAWL_API_KEY || '').trim();
  const flagRaw = process.env.FIRECRAWL_LIVE;
  const live = ['true', '1', 'yes', 'on'].indexOf(String(flagRaw == null ? '' : flagRaw).trim().toLowerCase()) !== -1;

  if (action === 'status') {
    return json(200, {
      live: !!(key && live), hasKey: !!key, keyLength: key.length, hasFlag: live,
      flagValueSeen: flagRaw == null ? '(unset)' : String(flagRaw), runtime: process.version,
    });
  }

  if (!key || !live) {
    return json(501, {
      error: 'Firecrawl in mock mode', action,
      reason: !key ? 'FIRECRAWL_API_KEY not seen by the function runtime' : 'FIRECRAWL_LIVE not truthy (saw: ' + (flagRaw == null ? '(unset)' : JSON.stringify(String(flagRaw))) + ')',
      hint: 'Set FIRECRAWL_API_KEY and FIRECRAWL_LIVE=true in Netlify env vars (scope must include Functions), then redeploy.',
    });
  }

  const headers = { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' };

  try {
    if (action === 'discover') {
      const industry = q.industry && q.industry !== 'All' ? q.industry : 'local business';
      const location = q.location && q.location !== 'All' ? q.location : 'Gulf Coast, Alabama';
      const res = await fetch(FC + '/search', {
        method: 'POST', headers,
        body: JSON.stringify({ query: industry + ' in ' + location, limit: MAX_DISCOVER + 6 }),
      });
      if (!res.ok) return json(502, { error: 'Firecrawl search error', status: res.status, detail: (await res.text()).slice(0, 300) });
      const data = await res.json();
      const raw = (data.data || data.results || []);
      const seen = {};
      const candidates = raw
        .filter(function (r) { return r && r.url && !isListingPage(r.title, r.url); }) // individual businesses only
        .map(function (r) { return mapSearchResult(r, industry, location); })
        .filter(function (c) {
          // De-dupe by business name AND by own-site root domain.
          var k = c.businessName.toLowerCase();
          var dk = c.hasWebsite ? ('dom:' + rootDomain(c.websiteUrl)) : '';
          if (!k || seen[k] || (dk && seen[dk])) return false;
          seen[k] = 1; if (dk) seen[dk] = 1; return true;
        })
        .sort(function (a, b) { return (a.hasWebsite === b.hasWebsite) ? 0 : (a.hasWebsite ? 1 : -1); })
        .slice(0, MAX_DISCOVER);
      return json(200, { source: 'Firecrawl', candidates: candidates });
    }

    if (action === 'enrich') {
      const target = q.url || q.listing || '';
      if (!target) return json(200, { phone: '', email: '', photos: [] });
      const data = await scrape(target, headers);
      return json(200, extractEnrichment(data, { industry: q.industry || '', category: q.industry || '' }));
    }

    if (action === 'audit') {
      const url = q.url || '';
      if (!url) return json(200, { hasWebsite: false, grade: 'F', mobile: 0, seo: 6, design: 0, findings: ['No website URL — nothing to audit; from-scratch build'] });
      const data = await scrape(url, headers);
      return json(200, deriveAudit(data));
    }

    return json(400, { error: 'Unknown action "' + action + '"' });
  } catch (e) {
    return json(502, { error: 'Firecrawl request failed', action, detail: String(e && e.message || e).slice(0, 300) });
  }
};
