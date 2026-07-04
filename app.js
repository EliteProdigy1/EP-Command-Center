/* ═══════════════════════════════════════════════════════════════
   EP COMMAND CENTER — APP.JS
   Elite Prodigy Media Internal OS
   All data is placeholder / mock only. No real APIs connected.
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── MOCK DATA ─── */
const DATA = {

  clients: [
    { id: 1, name: 'Elite Prodigy Sports Group', abbr: 'EP', industry: 'Sports Agency', status: 'live',   color: '#c9a84c', retainer: '$1,200/mo', repo: 'Elite-Prodigy-sports-group-website', site: 'eliteprodigysports.com', tasks: 3, lastActivity: '2 hours ago' },
    { id: 2, name: 'Azalea Turf & Lawns',        abbr: 'AT', industry: 'Landscaping',   status: 'build',  color: '#22c55e', retainer: '$800/mo',   repo: 'Azalea-Turf-and-Lawn',              site: 'azaleaturfandlawn.com', tasks: 5, lastActivity: '1 day ago' },
    { id: 3, name: 'Warren Landscape',            abbr: 'WL', industry: 'Landscaping',   status: 'build',  color: '#3b82f6', retainer: '$800/mo',   repo: 'Warren-Landscape',                  site: 'warrenlandscape.com', tasks: 4, lastActivity: '3 days ago' },
    { id: 4, name: '22 Builds',                   abbr: '22', industry: 'Construction',  status: 'review', color: '#a8b2bc', retainer: '$1,000/mo', repo: '22-Builds',                         site: '22builds.com', tasks: 2, lastActivity: '1 week ago' },
    { id: 5, name: "Head Loc'd",                  abbr: 'HL', industry: 'Beauty',        status: 'hold',   color: '#8b5cf6', retainer: 'TBD',       repo: 'Head-Locd',                         site: 'headlocd.com', tasks: 1, lastActivity: '2 weeks ago' },
    { id: 6, name: 'Metal & Mud',                 abbr: 'MM', industry: 'Fabrication',   status: 'build',  color: '#ef4444', retainer: '$800/mo',   repo: 'Metal-and-Mud',                     site: 'metalandmud.com', tasks: 3, lastActivity: '4 days ago' },
    { id: 7, name: 'Clay Retreat',                abbr: 'CR', industry: 'Art Studio',    status: 'live',   color: '#f59e0b', retainer: '$600/mo',   repo: 'Clay-Retreat',                      site: 'clayretreat.com', tasks: 2, lastActivity: '5 hours ago' },
  ],

  repos: [
    { name: 'Elite-Prodigy-sports-group-website', purpose: 'EPSG + EP Media (Monorepo)',     status: 'active',  lastCommit: '2 hours ago',   branches: 11, warning: true },
    { name: 'Clay-Retreat',                        purpose: 'Clay Retreat standalone site',  status: 'active',  lastCommit: '17 hours ago',  branches: 1,  warning: false },
    { name: 'EP-Command-Center',                   purpose: 'Internal OS Dashboard',         status: 'init',    lastCommit: 'Just now',      branches: 1,  warning: false },
    { name: 'EP-Media-Agency',                     purpose: 'EP Media Agency site',          status: 'empty',   lastCommit: '—',             branches: 0,  warning: true },
    { name: 'EP-Media',                            purpose: 'EP Media (general)',            status: 'empty',   lastCommit: '—',             branches: 0,  warning: true },
    { name: 'Azalea-Turf-and-Lawn',               purpose: 'Azalea Turf & Lawns website',  status: 'empty',   lastCommit: '—',             branches: 0,  warning: true },
    { name: 'Warren-Landscape',                    purpose: 'Warren Landscape website',      status: 'empty',   lastCommit: '—',             branches: 0,  warning: true },
    { name: '22-Builds',                           purpose: '22 Builds website',             status: 'empty',   lastCommit: '—',             branches: 0,  warning: true },
    { name: 'Head-Locd',                           purpose: "Head Loc'd website",            status: 'empty',   lastCommit: '—',             branches: 0,  warning: false },
    { name: 'Metal-and-Mud',                       purpose: 'Metal & Mud website',           status: 'empty',   lastCommit: '—',             branches: 0,  warning: true },
  ],

  deployments: [
    { name: 'Elite Prodigy Sports Group', url: 'eliteprodigysports.netlify.app', branch: 'claude/great-keller-ku4ha0', status: 'live',    lastDeploy: '2 hours ago',   buildTime: '1m 12s', client: 'EPSG' },
    { name: 'Clay Retreat',               url: 'clay-retreat.netlify.app',       branch: 'main',                       status: 'live',    lastDeploy: '17 hours ago',  buildTime: '0m 58s', client: 'Clay Retreat' },
    { name: 'EP Command Center',          url: 'ep-command-center.netlify.app',  branch: 'main',                       status: 'pending', lastDeploy: 'Not deployed',  buildTime: '—',      client: 'Internal' },
    { name: 'Azalea Turf & Lawns',        url: '—',                              branch: 'Not connected',              status: 'idle',    lastDeploy: '—',             buildTime: '—',      client: 'Azalea' },
    { name: 'Warren Landscape',           url: '—',                              branch: 'Not connected',              status: 'idle',    lastDeploy: '—',             buildTime: '—',      client: 'Warren' },
    { name: '22 Builds',                  url: '—',                              branch: 'Not connected',              status: 'idle',    lastDeploy: '—',             buildTime: '—',      client: '22 Builds' },
  ],

  tasks: {
    todo: [
      { title: 'Migrate Azalea site to standalone repo',    client: 'Azalea Turf & Lawns', priority: 'high',   due: 'Jul 5' },
      { title: 'Initialize EP-Media-Agency repo',           client: 'EP Media',            priority: 'high',   due: 'Jul 5' },
      { title: 'Connect Warren Landscape to Netlify',       client: 'Warren Landscape',    priority: 'medium', due: 'Jul 7' },
      { title: 'Build Head Loc\'d discovery brief',         client: "Head Loc'd",          priority: 'low',    due: 'Jul 10' },
      { title: 'Write Metal & Mud content copy',            client: 'Metal & Mud',         priority: 'medium', due: 'Jul 8' },
    ],
    inprogress: [
      { title: 'EP Command Center dashboard build',         client: 'Internal',            priority: 'high',   due: 'Jul 4' },
      { title: 'Repository audit documentation',           client: 'Internal',            priority: 'high',   due: 'Jul 4' },
      { title: '22 Builds Next.js site review',            client: '22 Builds',           priority: 'medium', due: 'Jul 6' },
    ],
    done: [
      { title: 'Clay Retreat site launched',               client: 'Clay Retreat',        priority: 'high',   due: 'Jul 3' },
      { title: 'EPSG EP Media section added',              client: 'EPSG',                priority: 'medium', due: 'Jul 3' },
      { title: 'EP Media OS framework built',              client: 'Internal',            priority: 'high',   due: 'Jul 2' },
    ],
  },

  pipeline: {
    'Lead': [
      { name: 'Gulf Coast Karate', value: '$2,400', date: 'Jul 3' },
    ],
    'Discovery': [
      { name: 'Unnamed Roofing Co.', value: '$3,200', date: 'Jul 5' },
    ],
    'Proposal': [
      { name: 'Local Restaurant Group', value: '$4,800', date: 'Jul 8' },
    ],
    'Negotiation': [
      { name: 'Medical Practice', value: '$6,000', date: 'Jul 10' },
    ],
    'Closed': [
      { name: 'Clay Retreat', value: '$600/mo', date: 'Jun 28' },
      { name: 'EPSG', value: '$1,200/mo', date: 'Jun 1' },
    ],
  },

  maintenance: [
    { title: 'Migrate client sites out of monorepo',     desc: 'Azalea, Warren, Metal & Mud, 22 Builds branches need standalone repos', client: 'Multiple',    urgency: 'urgent', icon: '⚠️', date: 'Overdue' },
    { title: 'Initialize 8 empty GitHub repos',          desc: 'EP-Media-Agency, EP-Media, and all client repos have no code',          client: 'Internal',    urgency: 'urgent', icon: '🔴', date: 'Jul 5' },
    { title: 'Connect client repos to Netlify',          desc: 'Azalea, Warren, 22 Builds, Metal & Mud need Netlify sites',             client: 'Multiple',    urgency: 'urgent', icon: '🔴', date: 'Jul 7' },
    { title: 'Review cinematic-listings CSP headers',    desc: 'Cloudinary media sources may need updated Content-Security-Policy',     client: 'EP Media',    urgency: 'warn',   icon: '🟡', date: 'Jul 10' },
    { title: 'Add 404.html to Clay Retreat repo',        desc: 'Standalone repo missing custom 404 page',                              client: 'Clay Retreat', urgency: 'warn',   icon: '🟡', date: 'Jul 8' },
    { title: 'Audit netlify.toml redirect coverage',     desc: 'Ensure all new standalone sites have their own netlify.toml',          client: 'Internal',    urgency: 'info',   icon: '🔵', date: 'Jul 12' },
  ],

  revenue: [
    { client: 'Elite Prodigy Sports Group', amount: 1200, type: 'retainer' },
    { client: 'Azalea Turf & Lawns',        amount: 800,  type: 'retainer' },
    { client: 'Warren Landscape',           amount: 800,  type: 'retainer' },
    { client: '22 Builds',                  amount: 1000, type: 'project'  },
    { client: 'Metal & Mud',                amount: 800,  type: 'project'  },
    { client: 'Clay Retreat',               amount: 600,  type: 'retainer' },
    { client: "Head Loc'd",                 amount: 400,  type: 'project'  },
  ],

  aiTools: [
    { name: 'Claude',        purpose: 'Code generation, content writing, strategy',  icon: '🤖', tags: ['Code', 'Copy', 'Strategy'] },
    { name: 'ChatGPT',       purpose: 'Content drafts, SEO copy, email templates',   icon: '💬', tags: ['Copy', 'SEO', 'Email'] },
    { name: 'Higgsfield',    purpose: 'Cinematic hero video generation',             icon: '🎬', tags: ['Video', 'Cinematic'] },
    { name: 'Seedream',      purpose: 'OG images, social graphics, thumbnails',      icon: '🎨', tags: ['Images', 'Social'] },
    { name: 'ElevenLabs',    purpose: 'Voiceover, audio branding, TTS',              icon: '🎙️', tags: ['Audio', 'Voice'] },
    { name: 'Canva',         purpose: 'Brand kits, social templates, print assets',  icon: '✏️', tags: ['Design', 'Brand'] },
    { name: 'HeyGen',        purpose: 'AI avatar videos, talking head content',      icon: '📹', tags: ['Video', 'Avatar'] },
    { name: 'Netlify',       purpose: 'Hosting, CI/CD, forms, edge functions',       icon: '🚀', tags: ['Deploy', 'Hosting'] },
    { name: 'GitHub',        purpose: 'Source control, version history, repos',      icon: '🐙', tags: ['Code', 'Version Control'] },
    { name: 'Zapier',        purpose: 'Workflow automation, CRM sync, triggers',     icon: '⚡', tags: ['Automation', 'CRM'] },
    { name: 'Notion',        purpose: 'Project docs, SOPs, client wikis',            icon: '📋', tags: ['Docs', 'SOPs'] },
    { name: 'Firecrawl',     purpose: 'Web scraping, competitor research',           icon: '🔍', tags: ['Research', 'Scraping'] },
  ],

  assets: [
    { name: 'EP Logo (Gold SVG)',        type: 'logo',  client: 'EPSG',         icon: '🏆', meta: 'SVG · 4.2 KB' },
    { name: 'EP Logo (Clean SVG)',       type: 'logo',  client: 'EPSG',         icon: '🏆', meta: 'SVG · 3.8 KB' },
    { name: 'Helmet Explode Video',      type: 'video', client: 'EPSG',         icon: '🎥', meta: 'MP4 · 8.4 MB' },
    { name: 'Allstar Tunnel Video',      type: 'video', client: 'EPSG',         icon: '🎥', meta: 'MP4 · 12.1 MB' },
    { name: 'Jonathan Walton Photo',     type: 'photo', client: 'EPSG',         icon: '📷', meta: 'JPG · 1.2 MB' },
    { name: 'Christine Walton Photo',    type: 'photo', client: 'EPSG',         icon: '📷', meta: 'JPG · 980 KB' },
    { name: 'Izaiah Walton Profile',     type: 'photo', client: 'EPSG',         icon: '📷', meta: 'PNG · 2.1 MB' },
    { name: 'Clay Retreat Assets',       type: 'photo', client: 'Clay Retreat', icon: '🏺', meta: 'Folder · 3 files' },
    { name: 'Azalea Logo Full',          type: 'logo',  client: 'Azalea',       icon: '🌿', meta: 'JPG · 340 KB' },
    { name: 'EP Media OS Docs',          type: 'doc',   client: 'Internal',     icon: '📄', meta: 'MD · 12 files' },
    { name: 'Client Template Pack',      type: 'doc',   client: 'Internal',     icon: '📄', meta: 'MD · 6 files' },
    { name: 'Uniform Lineup Photo',      type: 'photo', client: 'EPSG',         icon: '📷', meta: 'JPG · 3.4 MB' },
  ],

};

/* ─── CHART DATA ─── */
const CHART_DATA = {
  months: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  retainer: [3200, 3600, 4000, 4400, 4800, 5200],
  project:  [1200, 800,  1600, 2000, 3200, 3200],
};

/* ═══════════════════════════════════════════════════════════════
   RENDER FUNCTIONS
═══════════════════════════════════════════════════════════════ */

function statusTag(status) {
  const map = { live: 'tag-live', build: 'tag-build', review: 'tag-review', hold: 'tag-hold' };
  const labels = { live: 'Live', build: 'In Build', review: 'In Review', hold: 'On Hold' };
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
  const live = DATA.deployments.filter(d => d.status === 'live' || d.status === 'pending');
  el.innerHTML = live.map(d => `
    <div class="deploy-row">
      <div>
        <div class="deploy-name">${d.name}</div>
        <div class="deploy-url">${d.url}</div>
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
  const all = [...DATA.tasks.todo, ...DATA.tasks.inprogress].slice(0, 6);
  el.innerHTML = all.map(t => `
    <div class="task-item">
      <div class="task-check"></div>
      <div class="task-text">${t.title}</div>
      <div class="task-client">${t.client}</div>
      <div class="priority-dot p-${t.priority}"></div>
    </div>
  `).join('');
}

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
        <div class="stat-item">
          <div class="stat-label">Retainer</div>
          <div class="stat-value">${c.retainer}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Open Tasks</div>
          <div class="stat-value">${c.tasks}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Repository</div>
          <div class="stat-value" style="font-size:11px;font-family:monospace;color:var(--gold)">${c.repo}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Last Activity</div>
          <div class="stat-value" style="font-size:11px;color:var(--text-muted)">${c.lastActivity}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderRepoTable() {
  const el = document.getElementById('repo-tbody');
  if (!el) return;
  el.innerHTML = DATA.repos.map(r => {
    const statusColor = r.status === 'active' ? 'var(--green)' : r.status === 'init' ? 'var(--yellow)' : 'var(--text-muted)';
    const statusLabel = r.status === 'active' ? 'Active' : r.status === 'init' ? 'Initializing' : 'Empty';
    const warn = r.warning ? ' <span style="color:var(--yellow);font-size:11px;" title="Needs attention">⚠</span>' : '';
    return `
      <tr>
        <td><span class="repo-name">EliteProdigy1/${r.name}</span>${warn}</td>
        <td class="repo-purpose">${r.purpose}</td>
        <td><span style="color:${statusColor};font-size:12px;font-weight:600;">${statusLabel}</span></td>
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
      <div class="deploy-card-url">${d.url !== '—' ? `<a href="https://${d.url}" target="_blank" style="color:var(--gold)">${d.url} ↗</a>` : '—'}</div>
      <div class="deploy-card-meta">
        <div class="stat-item">
          <div class="stat-label">Branch</div>
          <div class="stat-value" style="font-size:11px;font-family:monospace;">${d.branch}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Last Deploy</div>
          <div class="stat-value" style="font-size:11px;">${d.lastDeploy}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Build Time</div>
          <div class="stat-value" style="font-size:11px;">${d.buildTime}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Client</div>
          <div class="stat-value" style="font-size:11px;">${d.client}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderTaskBoard() {
  const el = document.getElementById('task-board');
  if (!el) return;
  const cols = [
    { key: 'todo',       label: 'To Do' },
    { key: 'inprogress', label: 'In Progress' },
    { key: 'done',       label: 'Done' },
  ];
  el.innerHTML = cols.map(col => `
    <div class="task-column">
      <div class="task-column-header">
        ${col.label}
        <span class="task-count">${DATA.tasks[col.key].length}</span>
      </div>
      ${DATA.tasks[col.key].map(t => `
        <div class="task-card">
          <div class="task-card-title">${t.title}</div>
          <div class="task-card-client">${t.client}</div>
          <div class="task-card-footer">
            <span class="task-due">Due ${t.due}</span>
            ${priorityBadge(t.priority)}
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function renderPipelineBoard() {
  const el = document.getElementById('pipeline-board');
  if (!el) return;
  const stages = Object.keys(DATA.pipeline);
  el.innerHTML = stages.map(stage => `
    <div class="pipeline-col">
      <div class="pipeline-col-header">
        ${stage}
        <span class="task-count">${DATA.pipeline[stage].length}</span>
      </div>
      ${DATA.pipeline[stage].map(p => `
        <div class="pipeline-card">
          <div class="pipeline-card-name">${p.name}</div>
          <div class="pipeline-card-value">${p.value}</div>
          <div class="pipeline-card-date">${p.date}</div>
        </div>
      `).join('')}
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

function renderRevenueBreakdown() {
  const el = document.getElementById('revenue-breakdown');
  if (!el) return;
  const max = Math.max(...DATA.revenue.map(r => r.amount));
  el.innerHTML = DATA.revenue.map(r => `
    <div class="rev-row">
      <div class="rev-client">${r.client}</div>
      <div class="rev-bar-wrap">
        <div class="rev-bar" style="width:${Math.round((r.amount / max) * 100)}%"></div>
      </div>
      <div class="rev-amount">$${r.amount.toLocaleString()}</div>
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

/* ─── REVENUE CHART ─── */
function renderRevenueChart() {
  const canvas = document.getElementById('revenue-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 400;
  const H = 180;
  canvas.width = W;
  canvas.height = H;

  const pad = { top: 16, right: 16, bottom: 28, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const months = CHART_DATA.months;
  const n = months.length;
  const allVals = [...CHART_DATA.retainer, ...CHART_DATA.project];
  const maxVal = Math.max(...allVals) * 1.15;

  function xPos(i) { return pad.left + (i / (n - 1)) * chartW; }
  function yPos(v) { return pad.top + chartH - (v / maxVal) * chartH; }

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i / 4) * chartH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
  }

  // Y axis labels
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '10px Inter';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const v = Math.round((maxVal * (4 - i)) / 4);
    const y = pad.top + (i / 4) * chartH;
    ctx.fillText('$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v), pad.left - 6, y + 4);
  }

  // X axis labels
  ctx.textAlign = 'center';
  months.forEach((m, i) => {
    ctx.fillText(m, xPos(i), H - 6);
  });

  // Draw area + line helper
  function drawLine(data, color, fillColor) {
    // Fill area
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(data[0]));
    data.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
    ctx.lineTo(xPos(n - 1), pad.top + chartH);
    ctx.lineTo(xPos(0), pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(data[0]));
    data.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots
    data.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(xPos(i), yPos(v), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  drawLine(CHART_DATA.retainer, '#c9a84c', 'rgba(201,168,76,0.08)');
  drawLine(CHART_DATA.project,  '#5a6470', 'rgba(90,100,112,0.06)');
}

/* ─── COUNTER ANIMATION ─── */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ─── LIVE DATE ─── */
function updateDate() {
  const el = document.getElementById('live-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

/* ─── NAVIGATION ─── */
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

      // Re-render chart when revenue section is shown
      if (target === 'revenue' || target === 'dashboard') {
        setTimeout(renderRevenueChart, 50);
      }

      // Close mobile sidebar
      closeSidebar();
    });
  });
}

/* ─── MOBILE SIDEBAR ─── */
function initMobileSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

/* ─── FILTER BUTTONS ─── */
function initFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.asset-filters').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* ─── INIT ─── */
function init() {
  updateDate();

  // Render all components
  renderClientList();
  renderDeployList();
  renderTaskListDash();
  renderClientCards();
  renderRepoTable();
  renderDeployCards();
  renderTaskBoard();
  renderPipelineBoard();
  renderMaintenanceList();
  renderRevenueBreakdown();
  renderAITools();
  renderAssetGrid();

  // Chart (after layout paint)
  setTimeout(renderRevenueChart, 100);

  // Counters
  setTimeout(animateCounters, 200);

  // Nav
  initNav();
  initMobileSidebar();
  initFilterButtons();

  // Re-render chart on window resize
  window.addEventListener('resize', () => {
    const revenueActive = document.getElementById('section-revenue')?.classList.contains('active');
    const dashActive = document.getElementById('section-dashboard')?.classList.contains('active');
    if (revenueActive || dashActive) renderRevenueChart();
  });
}

document.addEventListener('DOMContentLoaded', init);
