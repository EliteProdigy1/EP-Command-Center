/* ═══════════════════════════════════════════════════════════════
   EP COMMAND CENTER — DATA SERVICE (Sprint 2: Notion)
   ─────────────────────────────────────────────────────────────
   All dashboard data flows through this service. It reads from a
   Netlify Function that proxies Notion (the API key + database IDs
   live server-side, never in this file — see .env.example).

   If Notion is not configured, or the API errors, every getter
   returns the matching mockData set, so the dashboard keeps running.
   The Integration Status panel reflects per-source state:
     connected  → live from Notion
     fallback   → running on mockData (default until keys are set)
     error      → Notion configured but the call failed

   NOTHING here reads a secret. NOTHING renders. It only fetches +
   maps data. Render functions consume what this service returns.
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Per-source status. 'fallback' until a live call succeeds.
  var STATUS = {
    prospects: 'fallback',
    projects: 'fallback',
    tasks: 'fallback',
    ai: 'fallback',
    revenue: 'fallback',
    website: 'fallback',
  };

  // Human labels for the Integration Status panel.
  var SOURCE_LABELS = {
    prospects: 'Prospects',
    projects: 'Projects',
    tasks: 'Tasks',
    ai: 'AI Workforce',
    revenue: 'Revenue',
    website: 'Website Intelligence',
  };

  // Single Netlify Function proxies every database by ?db= key.
  // PHASE 2: with empty env vars it returns 501 → we fall back.
  var ENDPOINT = '/.netlify/functions/notion';

  function fallbackFor(key) {
    // mockData is a global defined in js/app.js (shared script scope).
    if (typeof mockData === 'undefined') return [];
    switch (key) {
      case 'prospects': return (typeof S !== 'undefined' && S.prospects) ? S.prospects : mockData.prospects;
      case 'projects':  return mockData.clients;
      case 'tasks':     return (typeof S !== 'undefined' && S.tasks) ? S.tasks : { todo: [], inprogress: [], done: [] };
      case 'ai':        return mockData.agentWorkforce;
      case 'revenue':   return { pricing: mockData.pricing, industries: mockData.industries };
      case 'website':   return mockData.prospectAudits;
      default:          return [];
    }
  }

  // Core fetch: try the function, map status, always resolve to usable data.
  async function fetchDB(key) {
    var fallback = fallbackFor(key);
    try {
      var res = await fetch(ENDPOINT + '?db=' + encodeURIComponent(key), {
        headers: { 'Accept': 'application/json' },
      });
      // 501/503 = function present but Notion not configured → fallback (yellow)
      if (res.status === 501 || res.status === 503 || res.status === 404) {
        STATUS[key] = 'fallback';
        return fallback;
      }
      if (!res.ok) { STATUS[key] = 'error'; return fallback; }
      var data = await res.json();
      // A successful response is LIVE — even if the database is empty.
      // Showing mock data while connected would defeat Sprint 2 ("live data,
      // not mock"). Only the not-configured / error / offline paths fall back.
      STATUS[key] = 'connected';
      return data;
    } catch (e) {
      // Function not deployed / offline / blocked → fallback, not error.
      STATUS[key] = 'fallback';
      return fallback;
    }
  }

  window.notionService = {
    status: STATUS,
    sourceLabels: SOURCE_LABELS,

    // ── Adapters (Sprint 2) ──────────────────────────────────────
    getProspects:           function () { return fetchDB('prospects'); },
    getProjects:            function () { return fetchDB('projects'); },
    getTasks:               function () { return fetchDB('tasks'); },
    getAiWorkforce:         function () { return fetchDB('ai'); },
    getRevenue:             function () { return fetchDB('revenue'); },
    getWebsiteIntelligence: function () { return fetchDB('website'); },

    // Roll up per-source status into one indicator for the topbar.
    overall: function () {
      var vals = Object.keys(STATUS).map(function (k) { return STATUS[k]; });
      if (vals.indexOf('error') !== -1) return 'error';
      if (vals.every(function (v) { return v === 'connected'; })) return 'connected';
      if (vals.indexOf('connected') !== -1) return 'partial';
      return 'fallback';
    },
  };

  /* ── PHASE 3 HOOKS (do not connect yet) ──────────────────────────
     Firecrawl (website audits) and Apollo (contact enrichment) will
     add their own services behind the same pattern: a Netlify Function
     holds the key, this file exposes getters, render code is unchanged.

     window.firecrawlService = {
       auditSite: (url) => fetch('/.netlify/functions/firecrawl?url=' + url) ...
       // returns { websiteScore, mobileScore, seoScore, designScore, findings }
     };
     window.apolloService = {
       enrich: (businessName) => fetch('/.netlify/functions/apollo?q=' + businessName) ...
       // returns { contactName, phone, email, socialLinks }
     };
     Both stay OFF until Sprint 3. Env placeholders:
       FIRECRAWL_API_KEY=   APOLLO_API_KEY=
  ──────────────────────────────────────────────────────────────── */
}());
