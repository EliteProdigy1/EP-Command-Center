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

const MAPPERS = { prospects: mapProspect, projects: mapProject, tasks: mapTask, ai: mapAgent, revenue: mapRevenue, website: mapWebsite };

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
