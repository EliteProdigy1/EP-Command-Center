/* ═══════════════════════════════════════════════════════════════
   EP COMMAND CENTER — DISCOVERY SERVICE  (Sprint 3: Firecrawl)
   ─────────────────────────────────────────────────────────────
   The prospect-pool pipeline runs through this service:
     discover(industry, location) → candidate businesses
     audit(candidate)             → website-intelligence sub-scores

   Like the Notion service, it tries a Netlify Function that proxies
   Firecrawl (key server-side). Sprint 3 is MOCK/TEST ONLY: the function
   returns 501 until FIRECRAWL_API_KEY + FIRECRAWL_LIVE=true are set, so
   every run here uses the built-in mock pool (mockData.discoveryPool).
   No live calls, no credits, no mass enrichment, no messaging.

   Status:
     mock       → running on built-in test data (default)
     connected  → live from Firecrawl
     error      → live configured but a call failed

   NOTHING here reads a secret. Scoring lives in app.js (computeOpportunity)
   so there is one rubric for the whole dashboard.
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STATUS = { discover: 'mock', audit: 'mock' };
  var ENDPOINT = '/.netlify/functions/firecrawl';

  function pool() {
    return (typeof mockData !== 'undefined' && mockData.discoveryPool) ? mockData.discoveryPool : [];
  }

  // ── MOCK discovery: filter the built-in pool, no-website businesses first ──
  function mockDiscover(industry, location) {
    var rows = pool().slice();
    if (industry && industry !== 'All') rows = rows.filter(function (b) { return b.industry === industry; });
    if (location && location !== 'All') rows = rows.filter(function (b) { return b.location === location; });
    // No-website first (biggest opportunity), then by weakest signal.
    rows.sort(function (a, b) {
      if (a.hasWebsite !== b.hasWebsite) return a.hasWebsite ? 1 : -1;
      return (a.rating || 0) - (b.rating || 0);
    });
    // Deep copy so a run never mutates the source pool.
    return JSON.parse(JSON.stringify(rows));
  }

  // ── MOCK audit: derive website-intelligence sub-scores for one business ──
  // Returns raw signals; app.js computeOpportunity() turns them into a score.
  function mockAudit(c) {
    if (!c.hasWebsite) {
      return {
        hasWebsite: false, grade: 'F', mobile: 0, seo: 6, design: 0,
        findings: [
          'No website found — searches for this business go to competitors who have one',
          'Only presence is a ' + (c.source === 'Yelp' ? 'Yelp' : c.source === 'Google' ? 'Google Business' : 'social') + ' listing',
          'Nothing to book, quote, or contact from — every lead is a phone tag',
        ],
      };
    }
    // Has a site — score it from the seeded quality signal (mock).
    var q = c.siteQuality || 'weak'; // 'weak' | 'outdated' | 'ok'
    var map = {
      weak:     { grade: 'D', mobile: 34, seo: 28, design: 30, findings: ['Generic template, no real branding', 'Weak or missing call-to-action', 'Thin local SEO'] },
      outdated: { grade: 'C', mobile: 40, seo: 44, design: 38, findings: ['Not mobile-responsive', 'Slow load on phones', 'Looks ~2015, hurts trust'] },
      ok:       { grade: 'B', mobile: 70, seo: 66, design: 72, findings: ['Solid site — lower priority', 'Fit for a monthly growth plan later'] },
    };
    var a = map[q] || map.weak;
    a.hasWebsite = true;
    return a;
  }

  // ── MOCK enrichment: realistic contact/social/asset data for the pool ──
  function mockEnrich(c) {
    var slug = String(c.businessName || 'biz').toLowerCase().replace(/[^a-z0-9]+/g, '');
    var area = { 'Gulf Shores, AL': '251-968', 'Orange Beach, AL': '251-981', 'Foley, AL': '251-943', 'Daphne, AL': '251-621', 'Fairhope, AL': '251-928', 'Spanish Fort, AL': '251-626', 'Mobile, AL': '251-432', 'Dauphin Island, AL': '251-861', 'Robertsdale, AL': '251-947', 'Perdido Key, AL': '251-492' }[c.location] || '251-555';
    var num = area + '-' + String(1000 + Math.floor(Math.random() * 8999));
    return {
      phone: num,
      email: (c.hasWebsite ? 'info@' + slug + '.com' : slug + '@gmail.com'),
      address: '—',
      facebook: 'https://facebook.com/' + slug,
      instagram: 'https://instagram.com/' + slug,
      gbpUrl: 'https://g.page/' + slug,
      logoUrl: '',
      photos: [],
      category: c.industry,
      rating: c.rating || null,
      reviews: c.reviews || 0,
    };
  }

  async function tryFn(params, mockFn, statusKey) {
    try {
      var res = await fetch(ENDPOINT + '?' + params, { headers: { 'Accept': 'application/json' } });
      if (res.status === 501 || res.status === 503 || res.status === 404) { STATUS[statusKey] = 'mock'; return mockFn(); }
      if (!res.ok) { STATUS[statusKey] = 'error'; return mockFn(); }
      var data = await res.json();
      STATUS[statusKey] = 'connected';
      return data;
    } catch (e) {
      STATUS[statusKey] = 'mock';
      return mockFn();
    }
  }

  // Ping the function's status action on load so the MOCK/LIVE badge reflects
  // the ACTUAL env config, not just post-run state. Makes no Firecrawl call.
  function probeStatus() {
    return fetch(ENDPOINT + '?action=status', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var liveOn = !!(d && d.live);
        STATUS.discover = liveOn ? 'connected' : 'mock';
        STATUS.audit = liveOn ? 'connected' : 'mock';
        return d; // { live, hasKey, keyLength, hasFlag, flagValueSeen, runtime }
      })
      .catch(function () { STATUS.discover = 'mock'; STATUS.audit = 'mock'; return null; });
  }

  window.firecrawlService = {
    status: STATUS,
    probeStatus: probeStatus,
    isMock: function () { return STATUS.discover !== 'connected'; },

    // Discover candidate businesses (mock pool until live).
    discover: function (industry, location) {
      var params = 'action=discover&industry=' + encodeURIComponent(industry || 'All') + '&location=' + encodeURIComponent(location || 'All');
      return tryFn(params, function () { return { source: 'Mock', candidates: mockDiscover(industry, location) }; }, 'discover')
        .then(function (r) { return (r && r.candidates) ? r.candidates : mockDiscover(industry, location); });
    },

    // Audit one candidate's web presence (mock scoring until live).
    audit: function (candidate) {
      var params = 'action=audit&url=' + encodeURIComponent(candidate.websiteUrl || '') + '&name=' + encodeURIComponent(candidate.businessName || '');
      return tryFn(params, function () { return mockAudit(candidate); }, 'audit')
        .then(function (r) { return (r && (r.hasWebsite !== undefined)) ? r : mockAudit(candidate); });
    },

    // Enrich a candidate: phone, email, address, socials, GBP, logo, photos,
    // rating, reviews. Scrapes the business (live) or returns mock enrichment.
    enrich: function (candidate) {
      var url = candidate.websiteUrl || candidate.listingUrl || '';
      var params = 'action=enrich&url=' + encodeURIComponent(url) + '&industry=' + encodeURIComponent(candidate.industry || '');
      return tryFn(params, function () { return mockEnrich(candidate); }, 'discover')
        .then(function (r) { return (r && (r.phone !== undefined || r.email !== undefined)) ? r : mockEnrich(candidate); });
    },
  };
}());
