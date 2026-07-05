/* ═══════════════════════════════════════════════════════════════
   EP COMMAND CENTER — APP.JS
   Elite Prodigy Media Internal OS
   v2 — Operational: real data, editable pipeline/tasks, Call Mode.
   Working data persists in this browser via localStorage.
   Use Export regularly to back up (JSON file).
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── STATIC REFERENCE DATA (real as of 2026-07-05) ─── */
const DATA = {

  clients: [
    { id: 1, name: 'Elite Prodigy Sports Group', abbr: 'EP', industry: 'Sports Org (Internal)', status: 'live',  color: '#c9a84c', package: 'Internal flagship', repo: 'Elite-Prodigy-sports-group', site: 'eliteprodigysportsgroup.netlify.app' },
    { id: 2, name: 'Clay Retreat',               abbr: 'CR', industry: 'Pottery Studio',        status: 'live',  color: '#f59e0b', package: 'Starter — $1,000',  repo: 'Clay-Retreat',               site: 'clayretreat.netlify.app' },
    { id: 3, name: 'Azalea Turf & Lawn',         abbr: 'AT', industry: 'Landscaping',           status: 'live',  color: '#22c55e', package: 'Demo built',        repo: 'Azalea-Turf-and-Lawn',       site: 'azaleaturfandlawn.netlify.app' },
    { id: 4, name: 'Warren Landscape',           abbr: 'WL', industry: 'Landscaping',           status: 'live',  color: '#3b82f6', package: 'Demo built',        repo: 'Warren-Landscape',           site: 'warrenlandscape.netlify.app' },
    { id: 5, name: 'Metal & Mud',                abbr: 'MM', industry: 'Handmade Ceramics',     status: 'live',  color: '#ef4444', package: 'Demo built',        repo: 'Metal-and-Mud',              site: 'dwatts.netlify.app' },
    { id: 6, name: '22 Builds',                  abbr: '22', industry: 'Construction',          status: 'live',  color: '#a8b2bc', package: 'Demo built',        repo: '22-Builds',                  site: '22builds.netlify.app' },
    { id: 7, name: "Head Loc'd",                 abbr: 'HL', industry: 'Luxury Loc Studio',     status: 'review',color: '#8b5cf6', package: 'Demo built',        repo: 'Head-Locd',                  site: '(confirm Netlify URL)' },
    { id: 8, name: 'Wheeles Karate Academy',     abbr: 'WK', industry: 'Martial Arts',          status: 'live',  color: '#10b981', package: 'Demo built',        repo: 'WheelesKarate',              site: 'wheeleskarate.netlify.app' },
  ],

  repos: [
    { name: 'Elite-Prodigy-sports-group', purpose: 'EPSG site + media pages + sites tracker', status: 'active', lastCommit: 'Jul 5', branches: 11, warning: false },
    { name: 'EP-Media-Agency',            purpose: 'Agency ops hub: registry, client folders, EP Media OS', status: 'active', lastCommit: 'Jul 5', branches: 1, warning: false },
    { name: 'EP-Command-Center',          purpose: 'This dashboard',                    status: 'active', lastCommit: 'Jul 5', branches: 1, warning: false },
    { name: 'Clay-Retreat',               purpose: 'Client site — live',                status: 'active', lastCommit: 'Jul 2', branches: 1, warning: false },
    { name: 'Azalea-Turf-and-Lawn',       purpose: 'Client site — live',                status: 'active', lastCommit: 'Jul 5', branches: 1, warning: false },
    { name: 'Warren-Landscape',           purpose: 'Client site — live',                status: 'active', lastCommit: 'Jul 5', branches: 1, warning: false },
    { name: 'Metal-and-Mud',              purpose: 'Client site — live (dwatts)',       status: 'active', lastCommit: 'Jul 5', branches: 1, warning: false },
    { name: '22-Builds',                  purpose: 'Client site — live, full content',  status: 'active', lastCommit: 'Jul 5', branches: 1, warning: false },
    { name: 'Head-Locd',                  purpose: 'Client site — code live',           status: 'active', lastCommit: 'Jul 5', branches: 1, warning: true },
    { name: 'WheelesKarate',              purpose: 'Client site — live (Next.js)',      status: 'active', lastCommit: 'Jul 5', branches: 1, warning: false },
  ],

  deployments: [
    { name: 'Elite Prodigy Sports Group', url: 'eliteprodigysportsgroup.netlify.app', branch: 'Main', status: 'live',    lastDeploy: 'Jul 5', client: 'EPSG' },
    { name: 'Clay Retreat',               url: 'clayretreat.netlify.app',             branch: 'main', status: 'live',    lastDeploy: 'Jul 2', client: 'Clay Retreat' },
    { name: 'Azalea Turf & Lawn',         url: 'azaleaturfandlawn.netlify.app',       branch: 'main', status: 'live',    lastDeploy: 'Jul 5', client: 'Azalea' },
    { name: 'Warren Landscape',           url: 'warrenlandscape.netlify.app',         branch: 'main', status: 'live',    lastDeploy: 'Jul 5', client: 'Warren' },
    { name: 'Metal & Mud',                url: 'dwatts.netlify.app',                  branch: 'main', status: 'live',    lastDeploy: 'Jul 5', client: 'Metal & Mud' },
    { name: '22 Builds',                  url: '22builds.netlify.app',                branch: 'main', status: 'live',    lastDeploy: 'Jul 5', client: '22 Builds' },
    { name: "Head Loc'd",                 url: '(confirm URL)',                       branch: 'main', status: 'pending', lastDeploy: 'Jul 5', client: "Head Loc'd" },
    { name: 'Wheeles Karate',             url: 'wheeleskarate.netlify.app',           branch: 'main', status: 'live',    lastDeploy: 'Jul 5', client: 'Wheeles Karate' },
    { name: 'EP Command Center',          url: '(connect + password-protect)',        branch: 'main', status: 'pending', lastDeploy: '—',     client: 'Internal' },
  ],

  maintenance: [
    { title: 'Password-protect EP Command Center',      desc: 'After Netlify connect: Site configuration → Access control → Password protection. Do this before sharing any URL.', client: 'Internal', urgency: 'urgent', icon: '🔴', date: 'Before use' },
    { title: 'Set up form notification emails',         desc: 'Netlify → each site → Forms → notifications → eliteprodigyway@gmail.com (22builds-contact, head-locd-contact, metal-mud-contact)', client: 'Multiple', urgency: 'urgent', icon: '🔴', date: 'Jul 6' },
    { title: "Confirm Head Loc'd Netlify URL",          desc: 'Site code is live on main; verify the Netlify project URL and update sites/ tracker.', client: "Head Loc'd", urgency: 'warn', icon: '🟡', date: 'Jul 6' },
    { title: 'Replace placeholder photos',              desc: "Head Loc'd (studio/stylist photos from Jay) and Wheeles Karate (see public/PLACEHOLDER_IMAGES.md).", client: 'Multiple', urgency: 'warn', icon: '🟡', date: 'When clients send' },
    { title: 'Izaiah Walton profile data',              desc: 'Position, school, grad year, height/weight, combine numbers, Hudl link — needed from Jonathan.', client: 'EPSG', urgency: 'info', icon: '🔵', date: 'Open' },
  ],

  aiTools: [
    { name: 'Claude',     purpose: 'Code generation, content writing, strategy', icon: '🤖', tags: ['Code', 'Copy', 'Strategy'] },
    { name: 'ChatGPT',    purpose: 'Content drafts, SEO copy, email templates',  icon: '💬', tags: ['Copy', 'SEO', 'Email'] },
    { name: 'Higgsfield', purpose: 'Cinematic hero video generation',            icon: '🎬', tags: ['Video', 'Cinematic'] },
    { name: 'Seedream',   purpose: 'OG images, social graphics, thumbnails',     icon: '🎨', tags: ['Images', 'Social'] },
    { name: 'ElevenLabs', purpose: 'Voiceover, audio branding, TTS',             icon: '🎙️', tags: ['Audio', 'Voice'] },
    { name: 'Canva',      purpose: 'Brand kits, social templates, print assets', icon: '✏️', tags: ['Design', 'Brand'] },
    { name: 'Netlify',    purpose: 'Hosting, CI/CD, forms',                      icon: '🚀', tags: ['Deploy', 'Hosting'] },
    { name: 'GitHub',     purpose: 'Source control, repos',                      icon: '🐙', tags: ['Code', 'Version Control'] },
    { name: 'Firecrawl',  purpose: 'Web scraping, competitor research',          icon: '🔍', tags: ['Research', 'Scraping'] },
  ],

  assets: [
    { name: 'EP Logo (Gold SVG)',   type: 'logo',  client: 'EPSG',          icon: '🏆', meta: 'SVG' },
    { name: '22Builds Chrome Logo', type: 'logo',  client: '22 Builds',     icon: '🏗️', meta: 'JPG' },
    { name: 'Floor Plan Renders',   type: 'photo', client: '22 Builds',     icon: '🏠', meta: '19 files in repo' },
    { name: 'Renovation Interiors', type: 'photo', client: '22 Builds',     icon: '📷', meta: '4 files in repo' },
    { name: 'Karate Class Photos',  type: 'photo', client: 'Wheeles Karate', icon: '🥋', meta: '4 files in repo' },
    { name: 'Metal & Mud Product Shots', type: 'photo', client: 'Metal & Mud', icon: '🏺', meta: '9 files in repo' },
    { name: 'EP Media OS Docs',     type: 'doc',   client: 'Internal',      icon: '📄', meta: 'EP-Media-Agency repo' },
    { name: 'Client Registry',      type: 'doc',   client: 'Internal',      icon: '📋', meta: 'EP-Media-Agency repo' },
  ],

  pricing: [
    { name: 'Website — 5-Page Custom', price: '$1,000', detail: 'Mobile responsive · contact form · Google Maps · reviews · basic SEO · hosting setup · one revision · 48–72 hr delivery' },
    { name: 'Monthly Growth',          price: '$100/mo', detail: 'Updates, edits, hosting management' },
    { name: 'Premium Growth',          price: '$250/mo', detail: 'Growth plan + content refreshes + priority support' },
    { name: 'Brand: Team Starter',     price: 'from $500', detail: 'Naming, logo, basic brand kit' },
    { name: 'Brand: Team Launch',      price: 'from $1,500', detail: 'Full identity + website + registration setup' },
    { name: 'Brand: Elite Org Buildout', price: 'from $3,500', detail: 'Complete organization launch: brand, site, ops' },
  ],

  industries: ['Roofers', 'HVAC', 'Landscaping', 'Realtors', 'Restaurants', 'Gyms', 'Sports orgs', 'Fishing charters', 'Auto detailing', 'Medical offices'],
};

/* ─── WORKING STATE (persisted in localStorage) ─── */
const STORE_KEY = 'epcc-v2';
const STAGES = ['Lead', 'Contacted', 'Interested', 'Proposal Sent', 'Closed Won', 'Lost'];

const SEED = {
  leads: [
    { id: 'l1', name: 'Azalea Turf & Lawn',    contact: '',            phone: '', industry: 'Landscaping',   value: 1100, stage: 'Proposal Sent', notes: 'Demo site LIVE: azaleaturfandlawn.netlify.app. Pitch: buy the site $1,000 + $100/mo growth.', next: 'Call — site is live, close the sale' },
    { id: 'l2', name: 'Warren Landscape',       contact: '',            phone: '', industry: 'Landscaping',   value: 1100, stage: 'Proposal Sent', notes: 'Demo site LIVE: warrenlandscape.netlify.app.', next: 'Call — walk them through their live site' },
    { id: 'l3', name: 'Metal & Mud',            contact: '',            phone: '', industry: 'Ceramics',      value: 1100, stage: 'Proposal Sent', notes: 'Demo site LIVE: dwatts.netlify.app.', next: 'Call — demo ready' },
    { id: 'l4', name: '22 Builds',              contact: 'Ryan Anderson', phone: '', industry: 'Construction', value: 1100, stage: 'Proposal Sent', notes: 'Full site LIVE: 22builds.netlify.app — logo, floor plans, renovation gallery, working contact form. He also runs 22builds.org (Wix store).', next: 'Show finished site; if purchased, switch form email to Ryan' },
    { id: 'l5', name: "Head Loc'd (Jay)",       contact: 'Jay',         phone: '', industry: 'Hair Studio',   value: 1100, stage: 'Proposal Sent', notes: 'Site code live; needs her real studio photos to finish.', next: 'Call — collect photos + close' },
    { id: 'l6', name: 'Wheeles Karate Academy', contact: '',            phone: '', industry: 'Martial Arts',  value: 1100, stage: 'Proposal Sent', notes: 'Demo site LIVE: wheeleskarate.netlify.app.', next: 'Call — send demo link, pitch' },
    { id: 'l7', name: 'Clay Retreat',           contact: '',            phone: '', industry: 'Pottery Studio', value: 1000, stage: 'Closed Won', notes: 'Starter package per registry — confirm deposit status.', next: 'Collect deposit / offer growth plan' },
  ],
  tasks: {
    todo: [
      { id: 't1', title: 'Connect EP Command Center to Netlify + enable password', client: 'Internal', priority: 'high', due: 'Jul 6' },
      { id: 't2', title: 'Set form notification emails (all client sites)', client: 'Multiple', priority: 'high', due: 'Jul 6' },
      { id: 't3', title: 'Collect phone numbers for all 6 demo-built prospects', client: 'Outreach', priority: 'high', due: 'Jul 6' },
      { id: 't4', title: 'First 10 cold calls — target industries list', client: 'Outreach', priority: 'high', due: 'Jul 6' },
      { id: 't5', title: "Confirm Head Loc'd Netlify URL", client: "Head Loc'd", priority: 'medium', due: 'Jul 6' },
    ],
    inprogress: [],
    done: [
      { id: 't6', title: 'All 6 client demo sites launched on Netlify', client: 'Multiple', priority: 'high', due: 'Jul 5' },
      { id: 't7', title: 'Agency ops moved to EP-Media-Agency repo', client: 'Internal', priority: 'medium', due: 'Jul 5' },
    ],
  },
  callLog: [],
};

let S = load();

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* corrupted store — fall through to seed */ }
  return JSON.parse(JSON.stringify(SEED));
}
function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(S));
  renderAll();
}
function uid() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function todayStr() { return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }

/* ─── EXPORT / IMPORT ─── */
function exportData() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ep-command-center-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed.leads || !parsed.tasks) throw new Error('bad shape');
      S = parsed;
      save();
      alert('Data imported.');
    } catch (e) { alert('Import failed — not a valid backup file.'); }
  };
  reader.readAsText(file);
}

/* ═══ HELPERS ═══ */
function statusTag(status) {
  const map = { live: 'tag-live', build: 'tag-build', review: 'tag-review', hold: 'tag-hold' };
  const labels = { live: 'Live', build: 'In Build', review: 'Pending', hold: 'On Hold' };
  return `<span class="status-tag ${map[status] || 'tag-hold'}">${labels[status] || status}</span>`;
}
function deployStatusTag(status) {
  const map = { live: 'tag-live', pending: 'tag-review', idle: 'tag-hold' };
  const labels = { live: 'Live', pending: 'Pending', idle: 'Not Deployed' };
  return `<span class="status-tag ${map[status] || 'tag-hold'}">${labels[status] || status}</span>`;
}
function priorityBadge(p) {
  const map = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
  return `<span class="priority-badge ${map[p] || 'badge-low'}">${p}</span>`;
}

/* ═══ KPIs ═══ */
function renderKPIs() {
  const liveSites = DATA.deployments.filter(d => d.status === 'live').length;
  const activeLeads = S.leads.filter(l => l.stage !== 'Closed Won' && l.stage !== 'Lost').length;
  const openTasks = S.tasks.todo.length + S.tasks.inprogress.length;
  const pipelineValue = S.leads.filter(l => l.stage !== 'Closed Won' && l.stage !== 'Lost').reduce((a, l) => a + (Number(l.value) || 0), 0);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('kpi-sites', liveSites);
  set('kpi-leads', activeLeads);
  set('kpi-tasks', openTasks);
  set('kpi-pipeline', '$' + pipelineValue.toLocaleString());

  const today = new Date().toDateString();
  const callsToday = S.callLog.filter(c => new Date(c.ts).toDateString() === today);
  set('kpi-calls-today', callsToday.length);
  const closedValue = S.leads.filter(l => l.stage === 'Closed Won').reduce((a, l) => a + (Number(l.value) || 0), 0);
  set('rev-closed', '$' + closedValue.toLocaleString());
  set('rev-pipeline', '$' + pipelineValue.toLocaleString());
  set('rev-leads', activeLeads);
  set('rev-won', S.leads.filter(l => l.stage === 'Closed Won').length);
}

/* ═══ DASHBOARD ═══ */
function renderClientList() {
  const el = document.getElementById('client-list');
  if (!el) return;
  el.innerHTML = DATA.clients.map(c => `
    <div class="client-row">
      <div class="client-row-left">
        <span class="client-dot" style="background:${c.color}"></span>
        <div>
          <div class="client-name">${c.name}</div>
          <div class="client-type">${c.industry}</div>
        </div>
      </div>
      ${statusTag(c.status)}
    </div>
  `).join('');
}

function renderDeployList() {
  const el = document.getElementById('deploy-list');
  if (!el) return;
  el.innerHTML = DATA.deployments.filter(d => d.status === 'live').map(d => `
    <div class="deploy-row">
      <div>
        <div class="deploy-name">${d.name}</div>
        <div class="deploy-url"><a href="https://${d.url}" target="_blank" rel="noopener" style="color:inherit;">${d.url}</a></div>
      </div>
      <div class="deploy-meta">
        ${deployStatusTag(d.status)}
        <div class="deploy-time">${d.lastDeploy}</div>
      </div>
    </div>
  `).join('');
}

function renderTaskListDash() {
  const el = document.getElementById('task-list-dash');
  if (!el) return;
  const all = [...S.tasks.todo, ...S.tasks.inprogress].slice(0, 6);
  el.innerHTML = all.length ? all.map(t => `
    <div class="task-item">
      <div class="task-check"></div>
      <div class="task-text">${esc(t.title)}</div>
      <div class="task-client">${esc(t.client)}</div>
      <div class="priority-dot p-${t.priority}"></div>
    </div>
  `).join('') : '<div class="empty-note">No open tasks — add some in the Tasks tab.</div>';
}

function renderOutreachToday() {
  const el = document.getElementById('outreach-today');
  if (!el) return;
  const today = new Date().toDateString();
  const calls = S.callLog.filter(c => new Date(c.ts).toDateString() === today);
  const counts = {};
  calls.forEach(c => { counts[c.outcome] = (counts[c.outcome] || 0) + 1; });
  const queue = S.leads.filter(l => ['Lead', 'Contacted', 'Interested', 'Proposal Sent'].includes(l.stage));
  el.innerHTML = `
    <div class="outreach-stat-row">
      <div class="outreach-stat"><div class="os-num">${calls.length}</div><div class="os-label">Calls today</div></div>
      <div class="outreach-stat"><div class="os-num">${counts['Interested'] || 0}</div><div class="os-label">Interested</div></div>
      <div class="outreach-stat"><div class="os-num">${counts['Callback'] || 0}</div><div class="os-label">Callbacks</div></div>
      <div class="outreach-stat"><div class="os-num">${queue.length}</div><div class="os-label">In queue</div></div>
    </div>
    <button class="btn-primary" style="width:100%;margin-top:14px;" onclick="goSection('callmode')">☎ Open Call Mode</button>
  `;
}

/* ═══ STATIC SECTIONS ═══ */
function renderClientCards() {
  const el = document.getElementById('client-cards-grid');
  if (!el) return;
  el.innerHTML = DATA.clients.map(c => `
    <div class="client-card">
      <div class="client-card-header">
        <div>
          <div class="client-card-name">${c.name}</div>
          <div class="client-card-industry">${c.industry}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
          ${statusTag(c.status)}
          <div class="client-card-icon" style="background:linear-gradient(135deg,${c.color}33,${c.color}22);color:${c.color};font-size:14px;width:36px;height:36px;border-radius:8px;">${c.abbr}</div>
        </div>
      </div>
      <div class="client-card-stats">
        <div class="stat-item"><div class="stat-label">Package</div><div class="stat-value" style="font-size:12px;">${c.package}</div></div>
        <div class="stat-item"><div class="stat-label">Site</div><div class="stat-value" style="font-size:11px;"><a href="https://${c.site}" target="_blank" rel="noopener" style="color:var(--gold);">${c.site}</a></div></div>
        <div class="stat-item"><div class="stat-label">Repository</div><div class="stat-value" style="font-size:11px;font-family:monospace;color:var(--gold)">${c.repo}</div></div>
      </div>
    </div>
  `).join('');
}

function renderRepoTable() {
  const el = document.getElementById('repo-tbody');
  if (!el) return;
  el.innerHTML = DATA.repos.map(r => {
    const statusColor = r.status === 'active' ? 'var(--green)' : 'var(--text-muted)';
    const warn = r.warning ? ' <span style="color:var(--yellow);font-size:11px;" title="Needs attention">⚠</span>' : '';
    return `
      <tr>
        <td><span class="repo-name">EliteProdigy1/${r.name}</span>${warn}</td>
        <td class="repo-purpose">${r.purpose}</td>
        <td><span style="color:${statusColor};font-size:12px;font-weight:600;">Active</span></td>
        <td style="color:var(--text-muted);font-size:12px;">${r.lastCommit}</td>
        <td style="color:var(--text-secondary);">${r.branches}</td>
      </tr>
    `;
  }).join('');
}

function renderDeployCards() {
  const el = document.getElementById('deploy-cards');
  if (!el) return;
  el.innerHTML = DATA.deployments.map(d => `
    <div class="deploy-card">
      <div class="deploy-card-header">
        <div class="deploy-card-name">${d.name}</div>
        ${deployStatusTag(d.status)}
      </div>
      <div class="deploy-card-url">${d.url.includes('.') ? `<a href="https://${d.url}" target="_blank" rel="noopener" style="color:var(--gold)">${d.url} ↗</a>` : d.url}</div>
      <div class="deploy-card-meta">
        <div class="stat-item"><div class="stat-label">Branch</div><div class="stat-value" style="font-size:11px;font-family:monospace;">${d.branch}</div></div>
        <div class="stat-item"><div class="stat-label">Last Deploy</div><div class="stat-value" style="font-size:11px;">${d.lastDeploy}</div></div>
        <div class="stat-item"><div class="stat-label">Client</div><div class="stat-value" style="font-size:11px;">${d.client}</div></div>
      </div>
    </div>
  `).join('');
}

function renderMaintenanceList() {
  const el = document.getElementById('maintenance-list');
  if (!el) return;
  el.innerHTML = DATA.maintenance.map(m => `
    <div class="maint-item">
      <div class="maint-icon ${m.urgency}">${m.icon}</div>
      <div class="maint-body">
        <div class="maint-title">${m.title}</div>
        <div class="maint-desc">${m.desc}</div>
      </div>
      <div class="maint-meta">
        <div class="maint-client">${m.client}</div>
        <div class="maint-date">${m.date}</div>
      </div>
    </div>
  `).join('');
}

function renderAITools() {
  const el = document.getElementById('ai-tools-grid');
  if (!el) return;
  el.innerHTML = DATA.aiTools.map(t => `
    <div class="ai-tool-card">
      <div class="ai-tool-icon">${t.icon}</div>
      <div class="ai-tool-name">${t.name}</div>
      <div class="ai-tool-purpose">${t.purpose}</div>
      <div class="ai-tool-tags">${t.tags.map(tag => `<span class="ai-tag">${tag}</span>`).join('')}</div>
    </div>
  `).join('');
}

function renderAssetGrid() {
  const el = document.getElementById('asset-grid');
  if (!el) return;
  el.innerHTML = DATA.assets.map(a => `
    <div class="asset-card">
      <div class="asset-thumb">${a.icon}</div>
      <div class="asset-info">
        <div class="asset-name">${a.name}</div>
        <div class="asset-meta">${a.client} · ${a.meta}</div>
      </div>
    </div>
  `).join('');
}

/* ═══ TASKS (editable) ═══ */
function renderTaskBoard() {
  const el = document.getElementById('task-board');
  if (!el) return;
  const cols = [
    { key: 'todo', label: 'To Do', next: 'inprogress', nextLabel: 'Start ▶' },
    { key: 'inprogress', label: 'In Progress', next: 'done', nextLabel: 'Done ✓' },
    { key: 'done', label: 'Done', next: null },
  ];
  el.innerHTML = cols.map(col => `
    <div class="task-column">
      <div class="task-column-header">${col.label}<span class="task-count">${S.tasks[col.key].length}</span></div>
      ${S.tasks[col.key].map(t => `
        <div class="task-card">
          <div class="task-card-title">${esc(t.title)}</div>
          <div class="task-card-client">${esc(t.client)}</div>
          <div class="task-card-footer">
            <span class="task-due">Due ${esc(t.due)}</span>
            ${priorityBadge(t.priority)}
          </div>
          <div class="row-actions">
            ${col.next ? `<button class="mini-btn" onclick="moveTask('${col.key}','${t.id}','${col.next}')">${col.nextLabel}</button>` : ''}
            <button class="mini-btn danger" onclick="deleteTask('${col.key}','${t.id}')">✕</button>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function addTaskFromForm() {
  const title = document.getElementById('nt-title').value.trim();
  if (!title) return alert('Task needs a title.');
  S.tasks.todo.unshift({
    id: uid(),
    title,
    client: document.getElementById('nt-client').value.trim() || 'Internal',
    priority: document.getElementById('nt-priority').value,
    due: document.getElementById('nt-due').value.trim() || todayStr(),
  });
  document.getElementById('nt-title').value = '';
  document.getElementById('nt-client').value = '';
  document.getElementById('nt-due').value = '';
  toggleForm('task-form', false);
  save();
}
function moveTask(from, id, to) {
  const i = S.tasks[from].findIndex(t => t.id === id);
  if (i < 0) return;
  S.tasks[to].unshift(S.tasks[from].splice(i, 1)[0]);
  save();
}
function deleteTask(col, id) {
  S.tasks[col] = S.tasks[col].filter(t => t.id !== id);
  save();
}

/* ═══ PIPELINE (editable) ═══ */
function renderPipelineBoard() {
  const el = document.getElementById('pipeline-board');
  if (!el) return;
  el.innerHTML = STAGES.map(stage => {
    const leads = S.leads.filter(l => l.stage === stage);
    return `
    <div class="pipeline-col">
      <div class="pipeline-col-header">${stage}<span class="task-count">${leads.length}</span></div>
      ${leads.map(p => {
        const si = STAGES.indexOf(stage);
        return `
        <div class="pipeline-card">
          <div class="pipeline-card-name">${esc(p.name)}</div>
          ${p.contact ? `<div class="pipeline-card-date">${esc(p.contact)}</div>` : ''}
          <div class="pipeline-card-value">$${(Number(p.value) || 0).toLocaleString()}</div>
          ${p.phone ? `<a class="mini-btn call" href="tel:${esc(p.phone)}">📞 ${esc(p.phone)}</a>` : ''}
          ${p.notes ? `<div class="pipeline-notes">${esc(p.notes)}</div>` : ''}
          <div class="row-actions">
            ${si > 0 && si < 4 ? `<button class="mini-btn" onclick="moveLead('${p.id}',-1)">◀</button>` : ''}
            ${si < 4 ? `<button class="mini-btn" onclick="moveLead('${p.id}',1)">▶</button>` : ''}
            <button class="mini-btn" onclick="editLead('${p.id}')">✎</button>
            ${stage !== 'Lost' ? `<button class="mini-btn danger" onclick="loseLead('${p.id}')">Lost</button>` : `<button class="mini-btn danger" onclick="deleteLead('${p.id}')">✕</button>`}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

function addLeadFromForm() {
  const name = document.getElementById('nl-name').value.trim();
  if (!name) return alert('Lead needs a business name.');
  S.leads.unshift({
    id: uid(),
    name,
    contact: document.getElementById('nl-contact').value.trim(),
    phone: document.getElementById('nl-phone').value.trim(),
    industry: document.getElementById('nl-industry').value.trim(),
    value: Number(document.getElementById('nl-value').value) || 1000,
    stage: 'Lead',
    notes: document.getElementById('nl-notes').value.trim(),
    next: 'First call',
  });
  ['nl-name', 'nl-contact', 'nl-phone', 'nl-industry', 'nl-value', 'nl-notes'].forEach(id => { document.getElementById(id).value = ''; });
  toggleForm('lead-form', false);
  save();
}
function moveLead(id, dir) {
  const l = S.leads.find(x => x.id === id);
  if (!l) return;
  const i = STAGES.indexOf(l.stage);
  const ni = Math.min(Math.max(i + dir, 0), STAGES.length - 2); // can't arrow into Lost
  l.stage = STAGES[ni];
  save();
}
function loseLead(id) {
  const l = S.leads.find(x => x.id === id);
  if (l && confirm('Mark "' + l.name + '" as Lost?')) { l.stage = 'Lost'; save(); }
}
function deleteLead(id) {
  if (confirm('Delete this lead permanently?')) { S.leads = S.leads.filter(x => x.id !== id); save(); }
}
function editLead(id) {
  const l = S.leads.find(x => x.id === id);
  if (!l) return;
  const phone = prompt('Phone number:', l.phone || '');
  if (phone !== null) l.phone = phone.trim();
  const contact = prompt('Contact person:', l.contact || '');
  if (contact !== null) l.contact = contact.trim();
  const notes = prompt('Notes:', l.notes || '');
  if (notes !== null) l.notes = notes.trim();
  const value = prompt('Deal value ($):', l.value);
  if (value !== null && !isNaN(Number(value))) l.value = Number(value);
  save();
}

/* ═══ CALL MODE ═══ */
const OUTCOMES = [
  { key: 'No Answer',      cls: '',        effect: null },
  { key: 'Left Voicemail', cls: '',        effect: null },
  { key: 'Callback',       cls: 'warn',    effect: 'callback' },
  { key: 'Interested',     cls: 'good',    effect: 'interested' },
  { key: 'Not Interested', cls: 'danger',  effect: 'lost' },
];

function renderCallMode() {
  const el = document.getElementById('call-queue');
  if (!el) return;
  const queue = S.leads.filter(l => ['Lead', 'Contacted', 'Interested', 'Proposal Sent'].includes(l.stage));
  el.innerHTML = queue.length ? queue.map(l => `
    <div class="call-card">
      <div class="call-card-top">
        <div>
          <div class="call-name">${esc(l.name)}</div>
          <div class="call-sub">${esc(l.contact || '')}${l.contact && l.industry ? ' · ' : ''}${esc(l.industry || '')} · <span class="call-stage">${l.stage}</span></div>
        </div>
        ${l.phone
          ? `<a class="call-dial" href="tel:${esc(l.phone)}">📞 Call ${esc(l.phone)}</a>`
          : `<button class="call-dial nophone" onclick="editLead('${l.id}')">＋ Add phone</button>`}
      </div>
      ${l.notes ? `<div class="call-notes">${esc(l.notes)}</div>` : ''}
      ${l.next ? `<div class="call-next">Next: ${esc(l.next)}</div>` : ''}
      <div class="outcome-row">
        ${OUTCOMES.map(o => `<button class="outcome-btn ${o.cls}" onclick="logCall('${l.id}','${o.key}')">${o.key}</button>`).join('')}
      </div>
    </div>
  `).join('') : '<div class="empty-note">Call queue is empty — add leads in the Pipeline tab.</div>';

  const logEl = document.getElementById('call-log');
  if (logEl) {
    const recent = [...S.callLog].reverse().slice(0, 25);
    logEl.innerHTML = recent.length ? recent.map(c => `
      <div class="log-row">
        <span class="log-time">${new Date(c.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
        <span class="log-name">${esc(c.name)}</span>
        <span class="log-outcome">${esc(c.outcome)}</span>
      </div>
    `).join('') : '<div class="empty-note">No calls logged yet. Every outcome button press is recorded here.</div>';
  }
}

function logCall(id, outcome) {
  const l = S.leads.find(x => x.id === id);
  if (!l) return;
  S.callLog.push({ ts: Date.now(), leadId: id, name: l.name, outcome });

  if (outcome === 'Interested') {
    if (STAGES.indexOf(l.stage) < STAGES.indexOf('Interested')) l.stage = 'Interested';
    l.next = 'Send proposal / demo link';
  } else if (outcome === 'Callback') {
    const when = prompt('Callback when? (e.g. "Jul 7 2pm")', 'Tomorrow');
    l.next = 'Callback: ' + (when || 'TBD');
    S.tasks.todo.unshift({ id: uid(), title: 'Callback — ' + l.name + (when ? ' (' + when + ')' : ''), client: l.name, priority: 'high', due: when || 'Tomorrow' });
  } else if (outcome === 'Lost') {
    l.stage = 'Lost';
  } else {
    if (l.stage === 'Lead') l.stage = 'Contacted';
    l.next = 'Try again';
  }
  save();
}

function renderPricing() {
  const el = document.getElementById('pricing-list');
  if (!el) return;
  el.innerHTML = DATA.pricing.map(p => `
    <div class="price-row">
      <div><div class="price-name">${p.name}</div><div class="price-detail">${p.detail}</div></div>
      <div class="price-tag">${p.price}</div>
    </div>
  `).join('');
  const ind = document.getElementById('industry-chips');
  if (ind) ind.innerHTML = DATA.industries.map(i => `<span class="ai-tag">${i}</span>`).join('');
}

/* ═══ NAV / CHROME ═══ */
function goSection(target) {
  const item = document.querySelector(`.nav-item[data-section="${target}"]`);
  if (item) item.click();
}

function toggleForm(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  const want = show !== undefined ? show : el.style.display === 'none' || !el.style.display;
  el.style.display = want ? 'block' : 'none';
}

function updateDate() {
  const el = document.getElementById('live-date');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function initNav() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');
  const pageTitle = document.getElementById('page-title');
  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const target = item.getAttribute('data-section');
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      sections.forEach(s => s.classList.remove('active'));
      const targetSection = document.getElementById('section-' + target);
      if (targetSection) targetSection.classList.add('active');
      if (pageTitle) pageTitle.textContent = item.textContent.trim();
      closeSidebar();
    });
  });
}

function initMobileSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (hamburger) hamburger.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('open'); });
  if (overlay) overlay.addEventListener('click', closeSidebar);
}
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

function initFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.asset-filters').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.getAttribute('data-filter');
      document.querySelectorAll('#asset-grid .asset-card').forEach((card, i) => {
        card.style.display = (f === 'all' || DATA.assets[i].type === f) ? '' : 'none';
      });
    });
  });
}

function initDataButtons() {
  const ex = document.getElementById('btn-export');
  if (ex) ex.addEventListener('click', exportData);
  const imp = document.getElementById('import-file');
  if (imp) imp.addEventListener('change', e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; });
  const impBtn = document.getElementById('btn-import');
  if (impBtn) impBtn.addEventListener('click', () => document.getElementById('import-file').click());
}

/* ═══ RENDER ALL + INIT ═══ */
function renderAll() {
  renderKPIs();
  renderClientList();
  renderDeployList();
  renderTaskListDash();
  renderOutreachToday();
  renderClientCards();
  renderRepoTable();
  renderDeployCards();
  renderTaskBoard();
  renderPipelineBoard();
  renderMaintenanceList();
  renderCallMode();
  renderPricing();
  renderAITools();
  renderAssetGrid();
}

function init() {
  updateDate();
  renderAll();
  initNav();
  initMobileSidebar();
  initFilterButtons();
  initDataButtons();
}

document.addEventListener('DOMContentLoaded', init);
