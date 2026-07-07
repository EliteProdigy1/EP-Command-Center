/* ═══════════════════════════════════════════════════════════════
   Netlify Function — Notion proxy  (Sprint 2)
   ─────────────────────────────────────────────────────────────
   The frontend (services/notion.js) calls:
     /.netlify/functions/notion?db=prospects
   This function reads the Notion key + database IDs from ENVIRONMENT
   VARIABLES (set in the Netlify dashboard — never committed), queries
   Notion server-side, maps the pages to the dashboard's data shape,
   and returns JSON.

   Until the env vars are set it returns 501 "not configured", which
   tells the frontend to fall back to mockData (yellow status).

   Column names below match the real EP OPERATING SYSTEM databases
   (Prospects, Projects, Tasks, AI Workforce, Revenue, Website
   Intelligence). Edit a mapper if you rename a Notion column.

   Required env vars (see .env.example):
     NOTION_API_KEY
     NOTION_DATABASE_PROSPECTS
     NOTION_DATABASE_PROJECTS
     NOTION_DATABASE_TASKS
     NOTION_DATABASE_AI_WORKFORCE
     NOTION_DATABASE_REVENUE
     NOTION_DATABASE_WEBSITE   (Website Intelligence — optional; falls
                                back to the Prospects DB if unset)

   No dependencies: uses the global fetch in the Netlify Node 18 runtime.
═══════════════════════════════════════════════════════════════ */

const NOTION_VERSION = '2022-06-28';

// Map the ?db= key to the environment variable(s) holding the database id.
// Each entry lists accepted names in priority order — the first one that is
// set wins. This tolerates the AI Workforce db being named either
// NOTION_DATABASE_AI_WORKFORCE (as set in Netlify) or NOTION_DATABASE_AI.
const DB_ENV = {
  prospects: ['NOTION_DATABASE_PROSPECTS'],
  projects:  ['NOTION_DATABASE_PROJECTS'],
  tasks:     ['NOTION_DATABASE_TASKS'],
  ai:        ['NOTION_DATABASE_AI_WORKFORCE', 'NOTION_DATABASE_AI'],
  revenue:   ['NOTION_DATABASE_REVENUE'],
  website:   ['NOTION_DATABASE_WEBSITE', 'NOTION_DATABASE_PROSPECTS'],
  callnotes: ['NOTION_DATABASE_CALLNOTES'],
  meetings:  ['NOTION_DATABASE_MEETINGS'],
};

// First env var in the list that has a value, else '' (keeping the primary
// name so error hints point at the expected variable).
function resolveDbId(names) {
  for (var i = 0; i < names.length; i++) {
    if (process.env[names[i]]) return { id: process.env[names[i]], name: names[i] };
  }
  return { id: '', name: names[0] };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

// ── Notion property readers (defensive: tolerate any property type) ──
function readText(p) {
  if (!p) return '';
  if (p.title) return (p.title[0] && p.title[0].plain_text) || '';
  if (p.rich_text) return (p.rich_text[0] && p.rich_text[0].plain_text) || '';
  if (p.select) return (p.select && p.select.name) || '';
  if (p.status) return (p.status && p.status.name) || '';
  if (p.multi_select) return (p.multi_select || []).map(function (s) { return s.name; }).join(', ');
  if (p.date) return (p.date && p.date.start) || '';
  if (p.url) return p.url || '';
  if (p.email) return p.email || '';
  if (p.phone_number) return p.phone_number || '';
  if (p.formula) return p.formula.string || (typeof p.formula.number === 'number' ? p.formula.number : '') || '';
  if (typeof p.checkbox === 'boolean') return p.checkbox;
  if (typeof p.number === 'number') return p.number;
  return '';
}
function readNum(p) {
  if (!p) return 0;
  if (typeof p.number === 'number') return p.number;
  if (p.formula && typeof p.formula.number === 'number') return p.formula.number;
  return 0;
}
// Opportunity Score (0–100) → the High/Medium/Low label the UI expects.
function oppLevel(score) { return score >= 67 ? 'High' : score >= 34 ? 'Medium' : 'Low'; }

// ── Adapters: Notion page → dashboard shape ──────────────────────
// Column names on the right match the live EP OPERATING SYSTEM schema.
function mapProspect(page) {
  const f = page.properties || {};
  const city = readText(f['City']);
  const state = readText(f['State']);
  const opp = readNum(f['Opportunity Score']);
  return {
    id: page.id,
    businessName: readText(f['Business Name']),
    industry: readText(f['Industry']),
    location: [city, state].filter(Boolean).join(', '),
    websiteUrl: readText(f['Website']),
    websiteStatus: readText(f['Status']),
    websiteScore: readNum(f['Website Score']),
    mobileScore: readNum(f['Speed Score']),
    seoScore: readNum(f['SEO Score']),
    designScore: 0,
    sourceTool: readText(f['Lead Source']),
    opportunityScore: opp,
    opportunityLevel: oppLevel(opp),
    pipelineStatus: readText(f['Status']) || 'New Prospect',
    recommendedAction: readText(f['Proposal']),
    contactName: readText(f['Owner']),
    phone: readText(f['Phone']),
    email: readText(f['Email']),
    socialLinks: {},
    assignedAgent: readText(f['Assigned Agent']),
    lastChecked: '',
    nextFollowUp: readText(f['Next Follow Up']),
    notes: readText(f['Notes']),
  };
}
function mapProject(page) {
  const f = page.properties || {};
  return {
    id: page.id,
    name: readText(f['Client']),
    industry: '',
    status: readText(f['Status']) || readText(f['Stage']) || 'In Build',
    stage: readText(f['Stage']),
    site: readText(f['Domain']),
    repo: '',
    hosting: readText(f['Hosting']),
    maintenance: readText(f['Maintenance Plan']),
    launch: readText(f['Launch Date']),
    color: '#c9a84c',
  };
}
function mapTask(page) {
  const f = page.properties || {};
  return {
    id: page.id,
    title: readText(f['Task']),
    client: readText(f['Owner']) || readText(f['Department']),
    priority: (readText(f['Priority']) || 'medium').toLowerCase(),
    due: readText(f['Due Date']),
    _status: (readText(f['Status']) || 'todo').toLowerCase(),
  };
}
function mapAgent(page) {
  const f = page.properties || {};
  return {
    agent: readText(f['Role']),
    role: readText(f['Role']),
    area: readText(f['Responsibilities']),
    tools: readText(f['Tools']),
    status: readText(f['Status']) || 'Active',
    health: readText(f['Health']),
    permissions: readText(f['Permissions']) || 'Read-only',
    next: readText(f['Current Sprint']),
    connectedApps: readText(f['Connected Apps']),
  };
}
function mapRevenue(page) {
  const f = page.properties || {};
  const monthly = readNum(f['Monthly Value']);
  const deposit = readNum(f['Deposit']);
  return {
    name: readText(f['Client']),
    price: monthly ? '$' + monthly + '/mo' : (deposit ? '$' + deposit : ''),
    detail: readText(f['Invoice Status']),
    monthly: monthly,
    deposit: deposit,
    balance: readNum(f['Balance']),
    maintenance: readNum(f['Maintenance']),
    annual: readNum(f['Annual Value']),
    renewal: readText(f['Renewal']),
  };
}
function mapWebsite(page) {
  const f = page.properties || {};
  return {
    id: page.id,
    business: readText(f['Business']),
    url: readText(f['URL']),
    websiteGrade: readText(f['Website Grade']),
    mobileGrade: readText(f['Mobile Grade']),
    performance: readNum(f['Performance']),
    seo: readNum(f['SEO']),
    accessibility: readNum(f['Accessibility']),
    opportunityLevel: readText(f['Opportunity Level']),
    branding: readText(f['Branding']),
    photos: readText(f['Photos']),
    firecrawlStatus: readText(f['Firecrawl Status']),
    apolloStatus: readText(f['Apollo Status']),
    auditComplete: readText(f['Audit Complete']) === true,
    dateScanned: readText(f['Date Scanned']),
  };
}

function mapMeeting(page) {
  const f = page.properties || {};
  return {
    id: page.id,
    title: readText(f['Name']),
    with: readText(f['With']),
    date: readText(f['Date']),
    attendees: readText(f['Attendees']),
    type: readText(f['Type']),
    notes: readText(f['Notes']),
    source: readText(f['Source']),
  };
}
const MAPPERS = { prospects: mapProspect, projects: mapProject, tasks: mapTask, ai: mapAgent, revenue: mapRevenue, website: mapWebsite, meetings: mapMeeting };

// ── CREATE: enriched prospect record → Notion Prospects page properties ──
// Only real columns are set; extras (socials, GBP, address, logo, photo URLs)
// are packed into Notes so no data is lost even without dedicated columns.
const LEAD_SOURCE_OK = { Firecrawl: 1, Apollo: 1, Referral: 1, Manual: 1, 'Cold Outreach': 1 };
// Prospects "Status" is a status-type column with fixed options (Not started /
// In progress / Done). Map the dashboard's pipeline stage onto one of those.
function mapPipelineToNotionStatus(stage) {
  var s = String(stage || '').toLowerCase();
  if (/(won)/.test(s)) return 'Done';
  if (/(not fit|lost)/.test(s)) return 'Done';
  if (/(new prospect|needs research)/.test(s)) return 'Not started';
  return 'In progress'; // audit / concept / contacted / follow-up / proposal
}
// Freeform follow-up text → ISO date if we can parse it, else '' (folded to note).
function toISODate(str) {
  var s = String(str || '').trim();
  if (!s || /^(tbd|tomorrow|next week|this week)$/i.test(s)) return '';
  var d = new Date(/\d{4}/.test(s) ? s : s + ' ' + new Date().getFullYear());
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}
function notesBlock(r) {
  var lines = [];
  if (r.address) lines.push('Address: ' + r.address);
  if (r.category) lines.push('Category: ' + r.category);
  if (r.rating) lines.push('Rating: ' + r.rating + (r.reviews ? ' (' + r.reviews + ' reviews)' : ''));
  if (r.gbpUrl) lines.push('Google Business: ' + r.gbpUrl);
  if (r.facebook) lines.push('Facebook: ' + r.facebook);
  if (r.instagram) lines.push('Instagram: ' + r.instagram);
  if (r.logoUrl) lines.push('Logo: ' + r.logoUrl);
  if (r.photos && r.photos.length) lines.push('Photos: ' + r.photos.slice(0, 6).join(' | '));
  if (r.signal) lines.push('Signal: ' + r.signal);
  if (r.notes) lines.push(r.notes);
  return lines.join('\n');
}
function buildProspectProperties(r) {
  var p = {};
  p['Business Name'] = { title: [{ text: { content: String(r.businessName || 'Untitled').slice(0, 200) } }] };
  if (r.industry) p['Industry'] = { select: { name: String(r.industry).slice(0, 100) } };
  if (r.city) p['City'] = { rich_text: [{ text: { content: String(r.city) } }] };
  if (r.state) p['State'] = { rich_text: [{ text: { content: String(r.state) } }] };
  if (r.websiteUrl) p['Website'] = { url: (/^https?:/i.test(r.websiteUrl) ? r.websiteUrl : 'https://' + r.websiteUrl) };
  if (r.phone) p['Phone'] = { phone_number: String(r.phone) };
  if (r.email) p['Email'] = { email: String(r.email) };
  if (r.contactName) p['Owner'] = { rich_text: [{ text: { content: String(r.contactName) } }] };
  if (typeof r.websiteScore === 'number') p['Website Score'] = { number: r.websiteScore };
  if (typeof r.mobileScore === 'number') p['Speed Score'] = { number: r.mobileScore };
  if (typeof r.seoScore === 'number') p['SEO Score'] = { number: r.seoScore };
  if (typeof r.opportunityScore === 'number') p['Opportunity Score'] = { number: r.opportunityScore };
  var src = LEAD_SOURCE_OK[r.sourceTool] ? r.sourceTool : (/(google|yelp|firecrawl)/i.test(r.sourceTool || '') ? 'Firecrawl' : 'Manual');
  p['Lead Source'] = { select: { name: src } };
  p['Assigned Agent'] = { select: { name: 'Claude Code' } };
  var notes = notesBlock(r);
  if (notes) p['Notes'] = { rich_text: [{ text: { content: notes.slice(0, 1900) } }] };
  return p;
}
function rt(v) { return v ? { rich_text: [{ text: { content: String(v).slice(0, 1900) } }] } : undefined; }
function ti(v) { return { title: [{ text: { content: String(v || 'Untitled').slice(0, 200) } }] }; }
function sel(v) { return v ? { select: { name: String(v).slice(0, 100) } } : undefined; }
function dt(v, dflt) { var iso = toISODate(v); return (iso || dflt) ? { date: { start: iso || dflt } } : undefined; }
function strip(p) { Object.keys(p).forEach(function (k) { if (p[k] === undefined) delete p[k]; }); return p; }

// Call Notes DB — every call outcome + note.
function buildCallNoteProperties(r) {
  var today = new Date().toISOString().slice(0, 10);
  return strip({
    'Name': ti(r.title || ('Call — ' + (r.business || 'prospect') + ' · ' + (r.date || today))),
    'Business': rt(r.business),
    'Outcome': sel(r.outcome),
    'Notes': rt(r.notes),
    'Date': dt(r.date, today),
    'Next Follow Up': dt(r.nextFollowUp, ''),
    'Agent': sel(r.agent || 'Human'),
    'Source': sel(r.source || 'Typed'),
  });
}
// Meetings DB — typed today; voice ("Talk to Junior") later, same shape.
function buildMeetingProperties(r) {
  var today = new Date().toISOString().slice(0, 10);
  return strip({
    'Name': ti(r.title || 'Meeting'),
    'With': rt(r.with),
    'Date': dt(r.date, today),
    'Attendees': rt(r.attendees),
    'Type': sel(r.type),
    'Notes': rt(r.notes),
    'Source': sel(r.source || 'Typed'),
  });
}
// Projects DB — website projects.
function buildProjectProperties(r) {
  var domain = r.site || r.domain || '';
  return strip({
    'Client': ti(r.name || r.client),
    'Stage': sel(r.stage || 'Discovery'),
    'Status': { status: { name: 'Not started' } },
    'Domain': domain ? { url: (/^https?:/i.test(domain) ? domain : 'https://' + domain) } : undefined,
    'Notes': rt(r.notes),
  });
}
const CREATE_BUILDERS = { prospects: buildProspectProperties, callnotes: buildCallNoteProperties, meetings: buildMeetingProperties, projects: buildProjectProperties };

exports.handler = async function (event) {
  const db = (event.queryStringParameters && event.queryStringParameters.db) || '';
  const action = (event.queryStringParameters && event.queryStringParameters.action) || '';
  const probe = !!(event.queryStringParameters && event.queryStringParameters.probe);
  if (!DB_ENV[db]) return json(400, { error: 'Unknown db "' + db + '"' });

  const key = process.env.NOTION_API_KEY;
  const resolved = resolveDbId(DB_ENV[db]);
  const dbId = resolved.id;

  // Not configured yet → tell the frontend to use mockData (yellow).
  if (!key || !dbId) {
    return json(501, {
      error: 'Notion not configured',
      db,
      missing: !key ? 'NOTION_API_KEY' : resolved.name,
      hint: 'Set NOTION_API_KEY and one of [' + DB_ENV[db].join(', ') + '] in Netlify env vars.',
    });
  }

  // UPDATE a prospect's Notion page — call notes, follow-ups, status, scores.
  // This is how "call notes write to Notion" keeps Notion the source of truth.
  if (action === 'update') {
    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Bad JSON body' }); }
    const pageId = body.pageId;
    const patch = body.patch || {};
    if (!pageId) return json(400, { error: 'pageId required' });
    const authH = { 'Authorization': 'Bearer ' + key, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json' };
    try {
      const props = {};
      if (patch.status) { const s = mapPipelineToNotionStatus(patch.status); if (s) props['Status'] = { status: { name: s } }; }
      if (patch.stage) props['Stage'] = { select: { name: String(patch.stage).slice(0, 100) } }; // Projects DB
      if (typeof patch.websiteScore === 'number') props['Website Score'] = { number: patch.websiteScore };
      if (typeof patch.opportunityScore === 'number') props['Opportunity Score'] = { number: patch.opportunityScore };
      if (patch.phone) props['Phone'] = { phone_number: String(patch.phone) };
      if (patch.email) props['Email'] = { email: String(patch.email) };
      // Follow-up: set the date if parseable; otherwise fold it into the note.
      let noteExtra = '';
      if (patch.nextFollowUp) {
        const iso = toISODate(patch.nextFollowUp);
        if (iso) props['Next Follow Up'] = { date: { start: iso } };
        else noteExtra = 'Follow-up: ' + patch.nextFollowUp;
      }
      // Append a note to the existing Notes (read-then-write preserves history).
      const noteText = [patch.note, noteExtra].filter(Boolean).join(' · ');
      if (noteText) {
        let existing = '';
        try {
          const g = await fetch('https://api.notion.com/v1/pages/' + pageId, { headers: authH });
          if (g.ok) { const pg = await g.json(); existing = readText((pg.properties || {})['Notes']) || ''; }
        } catch (e) { /* keep going with just the new note */ }
        const stamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        const combined = (existing ? existing + '\n' : '') + '[' + stamp + '] ' + noteText;
        props['Notes'] = { rich_text: [{ text: { content: combined.slice(-1900) } }] };
      }
      if (!Object.keys(props).length) return json(200, { ok: true, noop: true });
      const res = await fetch('https://api.notion.com/v1/pages/' + pageId, { method: 'PATCH', headers: authH, body: JSON.stringify({ properties: props }) });
      const text = await res.text();
      if (!res.ok) return json(502, { error: 'Notion update failed', status: res.status, detail: text.slice(0, 400) });
      return json(200, { ok: true, id: pageId });
    } catch (e) {
      return json(502, { error: 'Notion update request failed', detail: String(e && e.message || e).slice(0, 300) });
    }
  }

  // CREATE a record in any writable DB (prospects/callnotes/meetings/projects).
  if (action === 'create') {
    let record = {};
    try { record = JSON.parse(event.body || '{}').record || {}; } catch (e) { return json(400, { error: 'Bad JSON body' }); }
    const builder = CREATE_BUILDERS[db];
    if (!builder) return json(400, { error: 'No create builder for db "' + db + '"' });
    try {
      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent: { database_id: dbId }, properties: builder(record) }),
      });
      const text = await res.text();
      if (!res.ok) return json(502, { error: 'Notion create failed', db, status: res.status, detail: text.slice(0, 400) });
      const page = JSON.parse(text);
      return json(200, { ok: true, id: page.id, url: page.url });
    } catch (e) {
      return json(502, { error: 'Notion create request failed', detail: String(e && e.message || e).slice(0, 300) });
    }
  }

  // Website Intelligence, when no dedicated DB is set, falls back to the
  // Prospects DB — read it with the prospect mapper so it stays coherent.
  const mapper = (db === 'website' && resolved.name !== 'NOTION_DATABASE_WEBSITE') ? mapProspect : MAPPERS[db];

  try {
    const res = await fetch('https://api.notion.com/v1/databases/' + dbId + '/query', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: probe ? 1 : 100 }),
    });
    if (!res.ok) {
      const text = await res.text();
      // Surface the exact reason without leaking the key or full payload.
      return json(502, {
        error: 'Notion API error',
        db,
        envVar: resolved.name,
        status: res.status,
        reason: res.status === 401 ? 'Authentication failed — check NOTION_API_KEY.'
              : res.status === 404 ? 'Database not found or not shared with the integration — check ' + resolved.name + ' and share the DB with your integration.'
              : 'Notion returned ' + res.status + '.',
        detail: text.slice(0, 300),
      });
    }
    const data = await res.json();
    // Probe mode: report readability + row count only, never the data itself.
    if (probe) return json(200, { db, envVar: resolved.name, connected: true, rowCount: (data.results || []).length });

    const rows = (data.results || []).map(mapper);

    // Tasks group into the board shape the frontend expects.
    if (db === 'tasks') {
      const board = { todo: [], inprogress: [], done: [] };
      rows.forEach(function (t) {
        const s = t._status;
        const col = s.indexOf('progress') !== -1 ? 'inprogress' : s.indexOf('done') !== -1 ? 'done' : 'todo';
        delete t._status;
        board[col].push(t);
      });
      return json(200, board);
    }
    if (db === 'revenue') return json(200, { pricing: rows, industries: [] });

    return json(200, rows);
  } catch (e) {
    return json(502, { error: 'Notion request failed', detail: String(e).slice(0, 300) });
  }
};
