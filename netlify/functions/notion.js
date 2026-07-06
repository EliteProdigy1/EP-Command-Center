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

   Required env vars (see .env.example):
     NOTION_API_KEY
     NOTION_DATABASE_PROSPECTS
     NOTION_DATABASE_PROJECTS
     NOTION_DATABASE_TASKS
     NOTION_DATABASE_AI
     NOTION_DATABASE_REVENUE
     (Website Intelligence reuses the prospects DB's audit fields)

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
  website:   ['NOTION_DATABASE_PROSPECTS'], // website intelligence = audit fields on prospects
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

// ── Notion property readers (defensive: tolerate missing fields) ──
function readText(p) {
  if (!p) return '';
  if (p.title) return (p.title[0] && p.title[0].plain_text) || '';
  if (p.rich_text) return (p.rich_text[0] && p.rich_text[0].plain_text) || '';
  if (p.select) return (p.select && p.select.name) || '';
  if (p.url) return p.url || '';
  if (p.email) return p.email || '';
  if (p.phone_number) return p.phone_number || '';
  if (typeof p.number === 'number') return p.number;
  return '';
}
function readNum(p) { return p && typeof p.number === 'number' ? p.number : 0; }

// ── Adapters: Notion page → dashboard shape ──────────────────────
// Adjust the property names on the right to match your Notion columns.
function mapProspect(page) {
  const f = page.properties || {};
  return {
    id: page.id,
    businessName: readText(f['Business Name']) || readText(f['Name']),
    industry: readText(f['Industry']),
    location: readText(f['Location']),
    websiteUrl: readText(f['Website URL']),
    websiteStatus: readText(f['Website Status']),
    websiteScore: readNum(f['Website Score']),
    mobileScore: readNum(f['Mobile Score']),
    seoScore: readNum(f['SEO Score']),
    designScore: readNum(f['Design Score']),
    sourceTool: readText(f['Source Tool']),
    opportunityLevel: readText(f['Opportunity Level']) || 'Medium',
    pipelineStatus: readText(f['Pipeline Status']) || 'New Prospect',
    recommendedAction: readText(f['Recommended Action']),
    contactName: readText(f['Contact Name']),
    phone: readText(f['Phone']),
    email: readText(f['Email']),
    socialLinks: {},
    lastChecked: readText(f['Last Checked']),
    nextFollowUp: readText(f['Next Follow-Up']),
    notes: readText(f['Notes']),
  };
}
function mapProject(page) {
  const f = page.properties || {};
  return {
    id: page.id,
    name: readText(f['Name']) || readText(f['Client']),
    industry: readText(f['Industry']),
    status: readText(f['Status']) || 'In Build',
    site: readText(f['Site']),
    repo: readText(f['Repo']),
    color: '#c9a84c',
  };
}
function mapTask(page) {
  const f = page.properties || {};
  return {
    id: page.id,
    title: readText(f['Title']) || readText(f['Name']),
    client: readText(f['Client']),
    priority: (readText(f['Priority']) || 'medium').toLowerCase(),
    due: readText(f['Due']),
    _status: (readText(f['Status']) || 'todo').toLowerCase(),
  };
}
function mapAgent(page) {
  const f = page.properties || {};
  return {
    agent: readText(f['Agent']) || readText(f['Name']),
    role: readText(f['Role']),
    area: readText(f['Area']),
    tools: readText(f['Tools']),
    status: readText(f['Status']) || 'Active',
    permissions: readText(f['Permissions']) || 'Read-only',
    next: readText(f['Next Assignment']),
  };
}
function mapRevenue(page) {
  const f = page.properties || {};
  return {
    name: readText(f['Name']),
    price: readText(f['Price']),
    detail: readText(f['Detail']),
  };
}

const MAPPERS = { prospects: mapProspect, projects: mapProject, tasks: mapTask, ai: mapAgent, revenue: mapRevenue, website: mapProspect };

exports.handler = async function (event) {
  const db = (event.queryStringParameters && event.queryStringParameters.db) || '';
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
    const rows = (data.results || []).map(MAPPERS[db]);

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
