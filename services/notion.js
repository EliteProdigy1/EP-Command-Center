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

  // Single Notion write primitive. db → ?db= route, action → create|update.
  // Always resolves (never throws) to { ok, ... } so the UI can confirm.
  function writeNotion(db, action, payload) {
    return fetch(ENDPOINT + '?db=' + encodeURIComponent(db) + '&action=' + encodeURIComponent(action), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload || {}),
    }).then(function (res) {
      if (res.status === 501) return { ok: false, reason: 'Notion not configured' };
      return res.json().then(function (d) {
        return res.ok ? Object.assign({ ok: true }, d) : { ok: false, reason: (d && (d.detail || d.error)) || ('HTTP ' + res.status) };
      }).catch(function () { return { ok: false, reason: 'HTTP ' + res.status }; });
    }).catch(function (e) { return { ok: false, reason: String(e && e.message || e) }; });
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
    // Meetings are read-only on the dashboard (Today's Meetings card). Kept out
    // of the Integration Status roll-up; just returns rows or [] if unwired.
    getMeetings: function () {
      return fetch(ENDPOINT + '?db=meetings', { headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (d) { return Array.isArray(d) ? d : []; })
        .catch(function () { return []; });
    },

    // ── ONE reusable write layer (Sprint 5A) ────────────────────────
    // Every Notion write goes through writeNotion(). It resolves to
    // { ok:true, ... } or { ok:false, reason } so callers can show a
    // visible success/failure confirmation. No duplicated Notion code.
    write: writeNotion,

    // Thin, named helpers on top of the single writer — the whole app uses
    // these, never raw fetch. Records are plain objects, so a future
    // "Talk to Junior" voice feature can build the same object and call the
    // same helper with zero backend changes.
    createProspect:      function (record) { return writeNotion('prospects', 'create', { record: record }); },
    updateProspect:      function (pageId, patch) { return pageId ? writeNotion('prospects', 'update', { pageId: pageId, patch: patch || {} }) : Promise.resolve({ ok: false, reason: 'no notion id' }); },
    createCallNote:      function (record) { return writeNotion('callnotes', 'create', { record: record }); },
    createMeeting:       function (record) { return writeNotion('meetings', 'create', { record: record }); },
    createWebsiteProject:function (record) { return writeNotion('projects', 'create', { record: record }); },
    updateProjectStatus: function (pageId, patch) { return pageId ? writeNotion('projects', 'update', { pageId: pageId, patch: (typeof patch === 'string' ? { stage: patch, status: patch } : (patch || {})) }) : Promise.resolve({ ok: false, reason: 'no notion id' }); },
    appendTimelineEvent: function (pageId, text, db) { return pageId ? writeNotion(db || 'prospects', 'update', { pageId: pageId, patch: { note: text } }) : Promise.resolve({ ok: false, reason: 'no notion id' }); },

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
