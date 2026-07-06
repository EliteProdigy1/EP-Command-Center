/* ═══════════════════════════════════════════════════════════════
   EP COMMAND CENTER 2.0 — js/app.js
   Architecture:
   - mockData      : central static/reference state (Phase 2 APIs replace these keys)
   - S (working)   : editable state persisted in localStorage (leads, tasks,
                     prospects, call log) with Backup/Restore JSON
   - dashboardModules : module registry — Mission Control renders every
                     enabled module summary automatically
   - render*()     : every DOM section is drawn from data, never hardcoded
   PHASE 2: replace mockData keys with fetch() responses from secure
   Netlify Functions. Never put API keys in this file.
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ═══ CENTRAL MOCK DATA (Phase 2: replaced by APIs) ═══ */
const mockData = {

  user: { name: 'Jonathan Walton', role: 'Founder · EP Media', phone: '251.223.0812', email: 'eliteprodigyway@gmail.com' },

  clients: [
    { id: 'epsg',    name: 'Elite Prodigy Sports Group', industry: 'Sports Org (Internal)', status: 'Deployed',    site: 'eliteprodigysportsgroup.netlify.app', repo: 'Elite-Prodigy-sports-group', color: '#c9a84c' },
    { id: 'clay',    name: 'Clay Retreat',               industry: 'Pottery Studio',        status: 'Deployed',    site: 'clayretreat.netlify.app',             repo: 'Clay-Retreat',               color: '#f59e0b' },
    { id: 'azalea',  name: 'Azalea Turf & Lawn',         industry: 'Landscaping',           status: 'Deployed',    site: 'azaleaturfandlawn.netlify.app',       repo: 'Azalea-Turf-and-Lawn',       color: '#22c55e' },
    { id: 'warren',  name: 'Warren Landscape',           industry: 'Landscaping',           status: 'Deployed',    site: 'warrenlandscape.netlify.app',         repo: 'Warren-Landscape',           color: '#3b82f6' },
    { id: 'metal',   name: 'Metal & Mud',                industry: 'Handmade Ceramics',     status: 'Deployed',    site: 'dwatts.netlify.app',                  repo: 'Metal-and-Mud',              color: '#ef4444' },
    { id: '22b',     name: '22 Builds',                  industry: 'Construction',          status: 'Deployed',    site: '22builds.netlify.app',                repo: '22-Builds',                  color: '#a8b2bc' },
    { id: 'headlocd',name: "Head Loc'd",                 industry: 'Luxury Loc Studio',     status: 'Ready for Review', site: '(confirm Netlify URL)',          repo: 'Head-Locd',                  color: '#8b5cf6' },
    { id: 'karate',  name: 'Wheeles Karate Academy',     industry: 'Martial Arts',          status: 'Deployed',    site: 'wheeleskarate.netlify.app',           repo: 'WheelesKarate',              color: '#10b981' },
    { id: 'cine',    name: 'Cinematic Listings',         industry: 'Real Estate Media',     status: 'Maintenance', site: 'eliteprodigysportsgroup.netlify.app/cinematic-listings.html', repo: 'Elite-Prodigy-sports-group', color: '#7dd3fc' },
  ],

  deployments: [
    { name: 'EPSG',                  url: 'eliteprodigysportsgroup.netlify.app', status: 'Live' },
    { name: 'Clay Retreat',          url: 'clayretreat.netlify.app',             status: 'Live' },
    { name: 'Azalea Turf & Lawn',    url: 'azaleaturfandlawn.netlify.app',       status: 'Live' },
    { name: 'Warren Landscape',      url: 'warrenlandscape.netlify.app',         status: 'Live' },
    { name: 'Metal & Mud',           url: 'dwatts.netlify.app',                  status: 'Live' },
    { name: '22 Builds',             url: '22builds.netlify.app',                status: 'Live' },
    { name: "Head Loc'd",            url: 'confirm URL',                         status: 'Needs Review' },
    { name: 'Wheeles Karate',        url: 'wheeleskarate.netlify.app',           status: 'Live' },
    { name: 'EP Command Center',     url: 'connect + password-protect',          status: 'Needs Domain' },
  ],

  repos: [
    { name: 'Elite-Prodigy-sports-group', purpose: 'EPSG site + media pages + sites tracker' },
    { name: 'EP-Media-Agency',            purpose: 'Ops hub: client registry, EP Media OS docs' },
    { name: 'EP-Command-Center',          purpose: 'This dashboard' },
    { name: 'Clay-Retreat',               purpose: 'Client site' },
    { name: 'Azalea-Turf-and-Lawn',       purpose: 'Client site' },
    { name: 'Warren-Landscape',           purpose: 'Client site' },
    { name: 'Metal-and-Mud',              purpose: 'Client site' },
    { name: '22-Builds',                  purpose: 'Client site' },
    { name: 'Head-Locd',                  purpose: 'Client site' },
    { name: 'WheelesKarate',              purpose: 'Client site (Next.js)' },
  ],

  pricing: [
    { name: 'Website — 5-Page Custom',    price: '$1,000',      detail: 'Mobile responsive · contact form · Google Maps · reviews · basic SEO · hosting setup · one revision · 48–72 hr delivery' },
    { name: 'Monthly Growth',             price: '$100/mo',     detail: 'Updates, edits, hosting management' },
    { name: 'Premium Growth',             price: '$250/mo',     detail: 'Growth + content refreshes + priority support' },
    { name: 'Brand: Team Starter',        price: 'from $500',   detail: 'Naming, logo, basic brand kit' },
    { name: 'Brand: Team Launch',         price: 'from $1,500', detail: 'Full identity + website + registration setup' },
    { name: 'Brand: Elite Org Buildout',  price: 'from $3,500', detail: 'Complete organization launch' },
  ],
  industries: ['Roofers', 'HVAC', 'Landscaping', 'Realtors', 'Restaurants', 'Gyms', 'Sports orgs', 'Fishing charters', 'Auto detailing', 'Medical offices', 'Pressure washing', 'Barbers / studios'],

  aiTeam: [
    { name: 'Junior (ChatGPT)', icon: '🧠', url: 'https://chatgpt.com',        role: 'Strategy, sales angles, copy, systems thinking. First stop for planning the day.' },
    { name: 'Claude',           icon: '✦',  url: 'https://claude.ai',          role: 'Deep work: writing, analysis, client communication drafts.' },
    { name: 'Claude Code',      icon: '⌘',  url: 'https://claude.ai/code',     role: 'Builds, fixes, GitHub, Netlify. Ships the actual websites.' },
    { name: 'Manus',            icon: '◇',  url: 'https://manus.im',           role: 'Operations, SOPs, research runs, workflow reporting.' },
    { name: 'Grok',             icon: '𝕏',  url: 'https://grok.com',           role: 'Real-time social/X research and trend checks.' },
    { name: 'Perplexity',       icon: '?',  url: 'https://perplexity.ai',      role: 'Cited research: prospect background, market questions.' },
    { name: 'SiteDrop',         icon: '⚡', url: 'https://sitedrop.ai',        role: 'Rapid website concepts for prospect demos.' },
    { name: 'Firecrawl',        icon: '🔥', url: 'https://firecrawl.dev',      role: 'Web scraping: extract content + audit prospect websites.' },
    { name: 'Higgsfield',       icon: '🎬', url: 'https://higgsfield.ai',      role: 'Cinematic video + image generation for client media.' },
    { name: 'Canva',            icon: '✏️', url: 'https://canva.com',          role: 'Brand assets, decks, social templates.' },
    { name: 'ElevenLabs',       icon: '🎙️', url: 'https://elevenlabs.io',      role: 'Voiceover + future morning briefing audio.' },
    { name: 'Notion',           icon: '▤',  url: 'https://notion.so',          role: 'Knowledge base and SOP home.' },
  ],

  growthStack: [
    { cat: 'AI Agents',           tools: ['Junior / ChatGPT', 'Claude', 'Claude Code', 'Manus', 'Grok', 'Perplexity'] },
    { cat: 'Development',         tools: ['GitHub', 'Netlify', 'Cursor', 'Lovable'] },
    { cat: 'Automation',          tools: ['Zapier', 'MCP connections', 'Netlify Forms'] },
    { cat: 'CRM / Sales',         tools: ['Apollo', 'HighLevel (planned)', 'Call Mode (this dashboard)'] },
    { cat: 'Prospecting',         tools: ['Firecrawl', 'SiteDrop', 'Site Source', 'Google Search', 'Yelp / Facebook / Instagram'] },
    { cat: 'Creative',            tools: ['Higgsfield', 'Canva', 'ElevenLabs', 'Seedream'] },
    { cat: 'Business Ops',        tools: ['Gmail', 'Google Calendar', 'Google Drive', 'Notion'] },
    { cat: 'Personal Ops',        tools: ['Personal Command (placeholder)', 'Calendar', 'Docs'] },
    { cat: 'Investor / Finance',  tools: ['Robinhood (read-only, Phase 2)', 'Future banking dashboard', 'Stripe / QuickBooks (planned)'] },
  ],

  integrationsMap: [
    { from: 'ChatGPT',   via: 'Zapier',         to: 'Gmail',              status: 'Connected', why: 'Drafts and sends outreach follow-ups' },
    { from: 'Claude Code', via: 'GitHub',       to: 'Netlify',            status: 'Connected', why: 'Every push auto-deploys the client sites' },
    { from: 'Manus',     via: 'Zapier',         to: 'Google Calendar',    status: 'Connected', why: 'Ops scheduling and reminders' },
    { from: 'Apollo',    via: 'Claude',         to: 'Prospecting',        status: 'Pending',   why: 'Lead lists scored and routed to Potential Clients' },
    { from: 'Firecrawl', via: 'Command Center', to: 'Potential Clients',  status: 'Planned',   why: 'Website audits feed prospect scores automatically' },
    { from: 'ElevenLabs', via: 'Automation',    to: 'Morning Briefing',   status: 'Planned',   why: 'Daily audio summary of this dashboard' },
    { from: 'Robinhood', via: 'Secure backend', to: 'Investor Dashboard', status: 'Planned',   why: 'Read-only watchlist + portfolio state' },
    { from: 'Netlify Forms', via: 'Email',      to: 'Gmail',              status: 'Connected', why: 'Client site inquiries land in the inbox' },
  ],

  automations: [
    { name: 'Netlify form → Gmail notification', status: 'Connected', desc: 'Every client-site inquiry emails eliteprodigyway@gmail.com. Set per-site in Netlify → Forms.' },
    { name: 'Push → auto-deploy',                status: 'Connected', desc: 'GitHub main branch → Netlify build on all 9 sites.' },
    { name: 'Callback → task creation',          status: 'Connected', desc: 'Logging a Callback in Call Mode creates a follow-up task automatically (this dashboard).' },
    { name: 'Prospect scoring via Firecrawl',    status: 'Planned',   desc: 'Audit prospect sites, score opportunity, auto-fill Potential Clients.' },
    { name: 'Morning briefing (ElevenLabs)',     status: 'Planned',   desc: 'Daily voice summary: priorities, callbacks due, pipeline moves.' },
    { name: 'CRM sync (HighLevel)',              status: 'Planned',   desc: 'Pipeline stages mirrored to CRM once connected.' },
  ],

  knowledge: [
    { name: 'Client Registry',        where: 'EP-Media-Agency repo', url: 'https://github.com/EliteProdigy1/EP-Media-Agency/blob/main/CLIENT-REGISTRY.md', desc: 'Master roster, statuses, revenue tracker' },
    { name: 'EP Media OS',            where: 'EP-Media-Agency repo', url: 'https://github.com/EliteProdigy1/EP-Media-Agency/tree/main/ep-media-os', desc: 'Reusable CSS/JS core, templates, SOPs, AI workflows' },
    { name: 'Client folder template', where: 'EP-Media-Agency repo', url: 'https://github.com/EliteProdigy1/EP-Media-Agency/tree/main/templates/client-template', desc: 'Copy per new client: profile, content, assets-needed, deployment' },
    { name: 'EPSG Master Spec',       where: 'EPSG repo docs/',      url: 'https://github.com/EliteProdigy1/Elite-Prodigy-sports-group/tree/Main/docs', desc: 'Playbook, pricing strategy, operations, roadmap' },
    { name: 'Sites tracker',          where: 'EPSG repo sites/',     url: 'https://github.com/EliteProdigy1/Elite-Prodigy-sports-group/tree/Main/sites', desc: 'One file per Netlify site with live URLs' },
    { name: 'Command Center docs',    where: 'This repo docs/',      url: 'https://github.com/EliteProdigy1/EP-Command-Center/tree/main/docs', desc: '2.0 spec + Phase 2 API plan' },
  ],

  personalCommand: [
    { name: 'Personal Tasks',        icon: '☑', note: 'Placeholder — personal to-dos separate from business tasks.' },
    { name: 'Family / Calendar',     icon: '⌂', note: 'Placeholder — Google Calendar connects via secure backend in Phase 2.' },
    { name: 'Personal Goals',        icon: '◎', note: 'Placeholder — quarterly personal targets.' },
    { name: 'Subscriptions',         icon: '↻', note: 'Placeholder — track recurring tools & costs.' },
    { name: 'Documents',             icon: '▤', note: 'Placeholder — links to Drive folders, never file contents here.' },
    { name: 'Personal Automations',  icon: '⚡', note: 'Placeholder — reminders, briefings, routines.' },
  ],

  investorDashboard: [
    { name: 'Robinhood',            icon: '📈', note: 'Read-only connection planned via secure backend. No credentials in this app.' },
    { name: 'Stock Watchlist',      icon: '👁', note: 'Placeholder watchlist — informational only, not advice.' },
    { name: 'Crypto Watchlist',     icon: '◇', note: 'Placeholder watchlist — informational only.' },
    { name: 'Investment Notes',     icon: '✎', note: 'Thesis notes and research log.' },
    { name: 'Capital Goals',        icon: '◎', note: 'Targets for reinvesting EP Media revenue.' },
    { name: 'Risk Notes',           icon: '⚠', note: 'What could go wrong; position sizing rules.' },
  ],

  bankingFunding: [
    { name: 'Business Bank Accounts', icon: '▦', note: 'Future secure module — connect via backend only.' },
    { name: 'Credit Profile',         icon: '☰', note: 'Future secure module.' },
    { name: 'Funding Readiness',      icon: '✓', note: 'Docs checklist for lenders — links only, no numbers here.' },
    { name: 'Monthly Revenue',        icon: '$', note: 'Will compute from Stripe/QuickBooks in Phase 2.' },
    { name: 'Monthly Expenses',       icon: '−', note: 'Will compute from bookkeeping in Phase 2.' },
    { name: 'Runway',                 icon: '→', note: 'Revenue minus expenses over time — Phase 2.' },
  ],

  agentWorkforce: [
    { agent: 'Junior (ChatGPT)', role: 'COO / Strategy Agent',    area: 'Sales strategy, systems, daily planning', tools: 'ChatGPT + Zapier',        status: 'Active',  permissions: 'Draft-only', next: 'Tomorrow call-block plan' },
    { agent: 'Claude Code',      role: 'CTO / Build Agent',       area: 'Websites, repos, deploys',                tools: 'GitHub + Netlify',        status: 'Active',  permissions: 'Commit + deploy', next: 'Phase 2 API functions' },
    { agent: 'Manus',            role: 'Ops Agent',               area: 'SOPs, research runs, reporting',          tools: 'Zapier + Calendar',       status: 'Active',  permissions: 'Draft-only', next: 'Prospect research batch' },
    { agent: 'Apollo',           role: 'Prospecting Agent',       area: 'Lead lists, contact data',                tools: 'Apollo + Claude',         status: 'Pending', permissions: 'Read-only',  next: 'First scored lead list' },
    { agent: 'SiteDrop',         role: 'Concept Agent',           area: 'Rapid demo sites for prospects',          tools: 'SiteDrop',                status: 'Active',  permissions: 'Draft-only', next: 'Next prospect concept' },
    { agent: 'Higgsfield',       role: 'Video Producer Agent',    area: 'Client media, hero video',                tools: 'Higgsfield',              status: 'Active',  permissions: 'Draft-only', next: 'Athlete spotlight reel' },
    { agent: 'ElevenLabs',       role: 'Briefing Agent',          area: 'Morning audio briefing',                  tools: 'ElevenLabs + automation', status: 'Planned', permissions: 'Read-only',  next: 'Phase 2 pipeline' },
    { agent: '(Recruit)',        role: 'Finance Agent',           area: 'Bookkeeping, invoices, runway',           tools: 'Stripe / QuickBooks',     status: 'Planned', permissions: 'Read-only',  next: 'Pick the stack' },
  ],

  calendar: [
    { when: 'Tomorrow 9:00 AM', what: 'Call block #1 — demo-built prospects (6 calls)', kind: 'Outreach' },
    { when: 'Tomorrow 1:00 PM', what: 'Call block #2 — new prospects from Potential Clients', kind: 'Outreach' },
    { when: 'Tomorrow 4:00 PM', what: 'Log outcomes, set callbacks, backup data', kind: 'Ops' },
    { when: 'This week',        what: 'Netlify form notifications on all client sites', kind: 'Ops' },
  ],
};

/* ═══ MODULE REGISTRY — Mission Control renders every enabled module ═══ */
const dashboardModules = [
  { id: 'priorities',        title: 'Priority Queue',      enabled: true, size: 'large',  section: 'tasks',        summary: sumPriorities },
  { id: 'callmode',          title: 'Call Mode',           enabled: true, size: 'large',  section: 'callmode',     summary: sumCallMode, urgent: true },
  { id: 'potential-clients', title: 'Potential Clients',   enabled: true, size: 'large',  section: 'prospects',    summary: sumProspects, urgent: true },
  { id: 'pipeline',          title: 'Client Pipeline',     enabled: true, size: 'large',  section: 'pipeline',     summary: sumPipeline, urgent: true },
  { id: 'clients',           title: 'Active Clients',      enabled: true, size: 'medium', section: 'clients',      summary: sumClients },
  { id: 'deployments',       title: 'Sites & Repos',       enabled: true, size: 'medium', section: 'deploys',      summary: sumDeploys },
  { id: 'revenue',           title: 'Revenue',             enabled: true, size: 'medium', section: 'revenue',      summary: sumRevenue },
  { id: 'calendar',          title: 'Calendar',            enabled: true, size: 'medium', section: 'mission',      summary: sumCalendar },
  { id: 'ai-team',           title: 'AI Team',             enabled: true, size: 'medium', section: 'aiteam',       summary: sumAiTeam },
  { id: 'growth-stack',      title: 'Growth Stack',        enabled: true, size: 'medium', section: 'growth',       summary: sumGrowth },
  { id: 'integrations-map',  title: 'Integrations Map',    enabled: true, size: 'medium', section: 'integrations', summary: sumIntegrations },
  { id: 'agent-workforce',   title: 'Agent Workforce',     enabled: true, size: 'medium', section: 'workforce',    summary: sumWorkforce },
  { id: 'blockers',          title: 'Blockers',            enabled: true, size: 'medium', section: 'tasks',        summary: sumBlockers, urgent: true },
  { id: 'personal-command',  title: 'Personal Command',    enabled: true, size: 'medium', section: 'personal',     summary: sumPersonal },
  { id: 'investor-dashboard',title: 'Investor Dashboard',  enabled: true, size: 'medium', section: 'investor',     summary: sumInvestor },
  { id: 'banking-funding',   title: 'Banking / Funding',   enabled: true, size: 'medium', section: 'banking',      summary: sumBanking },
];

/* ═══ WORKING STATE (persisted) ═══ */
const STORE_KEY = 'epcc-v2';
const STAGES = ['Lead', 'Contacted', 'Interested', 'Proposal Sent', 'Closed Won', 'Lost'];
const PROSPECT_STAGES = ['New Prospect', 'Needs Research', 'Website Audit', 'Concept Ready', 'Outreach Needed', 'Contacted', 'Follow-Up', 'Proposal Sent', 'Won', 'Not Fit'];

const SEED = {
  leads: [
    { id: 'l1', name: 'Azalea Turf & Lawn',     contact: '',              phone: '', industry: 'Landscaping',    value: 1100, stage: 'Proposal Sent', notes: 'Demo LIVE: azaleaturfandlawn.netlify.app. Pitch: own it for $1,000 + $100/mo growth.', next: 'Call — close the sale' },
    { id: 'l2', name: 'Warren Landscape',        contact: '',              phone: '', industry: 'Landscaping',    value: 1100, stage: 'Proposal Sent', notes: 'Demo LIVE: warrenlandscape.netlify.app.', next: 'Call — walk them through their live site' },
    { id: 'l3', name: 'Metal & Mud',             contact: '',              phone: '', industry: 'Ceramics',       value: 1100, stage: 'Proposal Sent', notes: 'Demo LIVE: dwatts.netlify.app.', next: 'Call — demo ready' },
    { id: 'l4', name: '22 Builds',               contact: 'Ryan Anderson', phone: '', industry: 'Construction',   value: 1100, stage: 'Proposal Sent', notes: 'Full site LIVE: 22builds.netlify.app — logo, 4 floor plans, renovation gallery, working form. Also runs 22builds.org (Wix store).', next: 'Show finished site; on purchase, switch form email to Ryan' },
    { id: 'l5', name: "Head Loc'd (Jay)",        contact: 'Jay',           phone: '', industry: 'Hair Studio',    value: 1100, stage: 'Proposal Sent', notes: 'Site code live; needs her real studio photos to finish.', next: 'Call — collect photos + close' },
    { id: 'l6', name: 'Wheeles Karate Academy',  contact: '',              phone: '', industry: 'Martial Arts',   value: 1100, stage: 'Proposal Sent', notes: 'Demo LIVE: wheeleskarate.netlify.app.', next: 'Call — send demo link, pitch' },
    { id: 'l7', name: 'Clay Retreat',            contact: '',              phone: '', industry: 'Pottery Studio', value: 1000, stage: 'Closed Won',    notes: 'Starter package per registry — confirm deposit status.', next: 'Collect deposit / offer growth plan' },
  ],
  tasks: {
    todo: [
      { id: 't1', title: 'Connect EP Command Center to Netlify + password protection', client: 'Internal', priority: 'high', due: 'Jul 6' },
      { id: 't2', title: 'Set form notification emails on all client sites',            client: 'Multiple', priority: 'high', due: 'Jul 6' },
      { id: 't3', title: 'Collect phone numbers for all 6 demo-built prospects',        client: 'Outreach', priority: 'high', due: 'Jul 6' },
      { id: 't4', title: 'Call block #1 — 6 demo-built prospects',                      client: 'Outreach', priority: 'high', due: 'Jul 6' },
      { id: 't5', title: 'Call block #2 — 10 cold calls from Potential Clients',        client: 'Outreach', priority: 'high', due: 'Jul 6' },
      { id: 't6', title: "Confirm Head Loc'd Netlify URL",                              client: "Head Loc'd", priority: 'medium', due: 'Jul 6' },
    ],
    inprogress: [],
    done: [
      { id: 't7', title: 'All 6 client demo sites launched on Netlify', client: 'Multiple', priority: 'high', due: 'Jul 5' },
      { id: 't8', title: 'Command Center 2.0 build',                    client: 'Internal', priority: 'high', due: 'Jul 5' },
    ],
  },
  prospects: [
    { id: 'p1', businessName: 'Sample Pressure Washing Co.', industry: 'Pressure Washing', location: 'Gulf Shores, AL',   phone: '', websiteStatus: 'No website found',  websiteScore: 20, source: 'Firecrawl',      opportunity: 'High',   pipelineStatus: 'New Prospect',   recommendedAction: 'Create quick concept and contact owner' },
    { id: 'p2', businessName: 'Sample Roofing LLC',          industry: 'Roofing',          location: 'Foley, AL',          phone: '', websiteStatus: 'Outdated website',  websiteScore: 38, source: 'Google Search',  opportunity: 'High',   pipelineStatus: 'Needs Research', recommendedAction: 'Audit site, prep before/after pitch' },
    { id: 'p3', businessName: 'Sample HVAC Services',        industry: 'HVAC',             location: 'Daphne, AL',         phone: '', websiteStatus: 'Slow mobile site', websiteScore: 45, source: 'Yelp',           opportunity: 'Medium', pipelineStatus: 'Outreach Needed', recommendedAction: 'Call with mobile-speed angle' },
    { id: 'p4', businessName: 'Sample Fishing Charters',     industry: 'Fishing Charter',  location: 'Orange Beach, AL',   phone: '', websiteStatus: 'No clear CTA',     websiteScore: 52, source: 'Instagram',      opportunity: 'Medium', pipelineStatus: 'New Prospect',   recommendedAction: 'Concept with booking CTA' },
  ],
  callLog: [],
};

let S = load();
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (!d.prospects) d.prospects = JSON.parse(JSON.stringify(SEED.prospects)); // migrate v2 → 2.0
      return d;
    }
  } catch (e) { /* fall through */ }
  return JSON.parse(JSON.stringify(SEED));
}
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(S)); renderAll(); }
function uid() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function money(n) { return '$' + (Number(n) || 0).toLocaleString(); }
function todayStr() { return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }

function exportData() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ep-command-center-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click(); URL.revokeObjectURL(a.href);
}
function importData(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const p = JSON.parse(r.result);
      if (!p.leads || !p.tasks) throw 0;
      S = p; if (!S.prospects) S.prospects = [];
      save(); alert('Data restored.');
    } catch (e) { alert('Import failed — not a valid backup.'); }
  };
  r.readAsText(file);
}

/* ═══ badge helper ═══ */
function badge(text) {
  const t = String(text).toLowerCase();
  let cls = 'b-dim';
  if (['live', 'deployed', 'active', 'connected', 'won', 'closed won', 'high'].includes(t)) cls = 'b-good';
  else if (['pending', 'building', 'needs review', 'needs domain', 'ready for review', 'in build', 'follow-up', 'callback', 'medium', 'in design'].includes(t)) cls = 'b-warn';
  else if (['failed', 'blocked', 'lost', 'not fit'].includes(t)) cls = 'b-bad';
  else if (['planned', 'lead', 'new prospect', 'maintenance', 'low', 'draft-only', 'read-only'].includes(t)) cls = 'b-info';
  else if (['proposal sent', 'interested', 'contacted', 'outreach needed', 'concept ready'].includes(t)) cls = 'b-gold';
  return `<span class="badge ${cls}">${esc(text)}</span>`;
}

/* ═══ MODULE SUMMARIES (Mission Control) ═══ */
function activeLeads() { return S.leads.filter(l => l.stage !== 'Closed Won' && l.stage !== 'Lost'); }
function pipelineValue() { return activeLeads().reduce((a, l) => a + (Number(l.value) || 0), 0); }
function callsToday() { const t = new Date().toDateString(); return S.callLog.filter(c => new Date(c.ts).toDateString() === t); }

function sumPriorities() {
  const top = S.tasks.todo.filter(t => t.priority === 'high').slice(0, 3);
  return `<div class="mc-big">${S.tasks.todo.length + S.tasks.inprogress.length}</div><div class="mc-list">${top.map(t => '· ' + esc(t.title)).join('<br>') || 'No high-priority tasks'}</div>`;
}
function sumCallMode() {
  const q = S.leads.filter(l => ['Lead', 'Contacted', 'Interested', 'Proposal Sent'].includes(l.stage));
  return `<div class="mc-big">${q.length}</div><div class="mc-list"><b>${callsToday().length}</b> calls logged today · queue is loaded — <b>start dialing</b></div>`;
}
function sumProspects() {
  const hot = S.prospects.filter(p => p.opportunity === 'High' && !['Won', 'Not Fit'].includes(p.pipelineStatus));
  return `<div class="mc-big">${S.prospects.length}</div><div class="mc-list"><b>${hot.length}</b> high-opportunity prospects waiting for outreach</div>`;
}
function sumPipeline() {
  return `<div class="mc-big">${money(pipelineValue())}</div><div class="mc-list"><b>${activeLeads().length}</b> active deals · <b>${S.leads.filter(l => l.stage === 'Proposal Sent').length}</b> at Proposal Sent</div>`;
}
function sumClients() {
  return `<div class="mc-big">${mockData.clients.length}</div><div class="mc-list"><b>${mockData.clients.filter(c => c.status === 'Deployed').length}</b> deployed · full roster inside</div>`;
}
function sumDeploys() {
  const live = mockData.deployments.filter(d => d.status === 'Live').length;
  return `<div class="mc-big">${live}</div><div class="mc-list">live Netlify sites · <b>${mockData.deployments.length - live}</b> need attention</div>`;
}
function sumRevenue() {
  const won = S.leads.filter(l => l.stage === 'Closed Won').reduce((a, l) => a + (Number(l.value) || 0), 0);
  return `<div class="mc-big">${money(won)}</div><div class="mc-list">closed/won · <b>${money(pipelineValue())}</b> still in pipeline</div>`;
}
function sumCalendar() {
  return `<div class="mc-list">${mockData.calendar.map(c => `<b>${esc(c.when)}</b> — ${esc(c.what)}`).join('<br>')}</div>`;
}
function sumAiTeam() {
  return `<div class="mc-big">${mockData.aiTeam.length}</div><div class="mc-list">agents one tap away · ChatGPT, Claude, Manus, Firecrawl…</div>`;
}
function sumGrowth() {
  return `<div class="mc-big">${mockData.growthStack.reduce((a, g) => a + g.tools.length, 0)}</div><div class="mc-list">tools across ${mockData.growthStack.length} categories</div>`;
}
function sumIntegrations() {
  const c = mockData.integrationsMap.filter(i => i.status === 'Connected').length;
  return `<div class="mc-big">${c}</div><div class="mc-list">connected flows · <b>${mockData.integrationsMap.length - c}</b> pending/planned</div>`;
}
function sumWorkforce() {
  return `<div class="mc-big">${mockData.agentWorkforce.filter(a => a.status === 'Active').length}</div><div class="mc-list">active agents · every area has an owner</div>`;
}
function sumBlockers() {
  const b = [];
  if (S.leads.some(l => ['Lead', 'Contacted', 'Interested', 'Proposal Sent'].includes(l.stage) && !l.phone)) b.push('Missing phone numbers on queue leads');
  if (mockData.deployments.some(d => d.status !== 'Live')) b.push('Sites needing review/connection');
  return `<div class="mc-big">${b.length}</div><div class="mc-list">${b.map(x => '· ' + x).join('<br>') || 'Nothing blocking — go sell'}</div>`;
}
function sumPersonal() { return `<div class="mc-list">Personal ops placeholders — tasks, calendar, goals, docs. Secure integrations in Phase 2.</div>`; }
function sumInvestor() { return `<div class="mc-list">Watchlists + notes placeholders. Robinhood read-only in Phase 2. Not advice.</div>`; }
function sumBanking() { return `<div class="mc-list">Funding-readiness placeholder. Real banking only via secure backend — never here.</div>`; }

/* ═══ MISSION CONTROL ═══ */
function renderKPIs() {
  const el = document.getElementById('kpi-row');
  if (!el) return;
  const kpis = [
    { n: mockData.deployments.filter(d => d.status === 'Live').length, l: 'Live Sites', s: 'every demo deployed' },
    { n: activeLeads().length, l: 'Active Deals', s: S.leads.filter(l => l.stage === 'Proposal Sent').length + ' at proposal' },
    { n: money(pipelineValue()), l: 'Pipeline Value', s: callsToday().length + ' calls today' },
    { n: S.tasks.todo.length + S.tasks.inprogress.length, l: 'Open Tasks', s: S.tasks.todo.filter(t => t.priority === 'high').length + ' high priority' },
  ];
  el.innerHTML = kpis.map(k => `<div class="card stat-tile lift"><div class="stat-num">${k.n}</div><div class="stat-label">${k.l}</div><div class="stat-sub">${k.s}</div></div>`).join('');
}

function renderMissionControl() {
  const el = document.getElementById('mc-grid');
  if (!el) return;
  el.innerHTML = dashboardModules.filter(m => m.enabled).map(m => `
    <div class="card mc-card lift ${m.urgent ? 'urgent' : ''}" onclick="goSection('${m.section}')" role="button" tabindex="0"
         onkeydown="if(event.key==='Enter')goSection('${m.section}')" data-module="${m.id}">
      <span class="go">→</span>
      <div class="card-tag" style="margin-bottom:8px;">${m.title}</div>
      ${m.summary()}
    </div>
  `).join('');
}

/* ═══ CALL MODE ═══ */
const OUTCOMES = [
  { key: 'No Answer', cls: '' }, { key: 'Left Voicemail', cls: '' },
  { key: 'Callback', cls: 'chip on' }, { key: 'Interested', cls: '' }, { key: 'Not Interested', cls: '' },
];

function renderCallMode() {
  const el = document.getElementById('call-queue');
  if (!el) return;
  const queue = S.leads.filter(l => ['Lead', 'Contacted', 'Interested', 'Proposal Sent'].includes(l.stage));
  el.innerHTML = queue.length ? queue.map(l => `
    <div class="call-card">
      <div class="call-top">
        <div>
          <div class="call-name">${esc(l.name)}</div>
          <div class="call-sub">${esc(l.contact || '')}${l.contact && l.industry ? ' · ' : ''}${esc(l.industry || '')} · <span class="stage">${l.stage}</span></div>
        </div>
        ${l.phone
          ? `<a class="dial" href="tel:${esc(l.phone)}">☎ ${esc(l.phone)}</a>`
          : `<button class="dial nophone" onclick="editLead('${l.id}')">＋ Add phone</button>`}
      </div>
      ${l.notes ? `<div class="call-notes">${esc(l.notes)}</div>` : ''}
      ${l.next ? `<div class="call-next">NEXT — ${esc(l.next)}</div>` : ''}
      <div class="outcomes">
        <button class="chip" onclick="logCall('${l.id}','No Answer')">No Answer</button>
        <button class="chip" onclick="logCall('${l.id}','Left Voicemail')">Left Voicemail</button>
        <button class="chip" style="color:var(--yellow);border-color:rgba(250,204,21,0.35);" onclick="logCall('${l.id}','Callback')">Callback</button>
        <button class="chip" style="color:var(--green);border-color:rgba(74,222,128,0.35);" onclick="logCall('${l.id}','Interested')">Interested</button>
        <button class="chip" style="color:var(--red);border-color:rgba(248,113,113,0.3);" onclick="logCall('${l.id}','Not Interested')">Not Interested</button>
      </div>
    </div>
  `).join('') : '<div class="empty">Queue is empty — add leads in Pipeline or promote a Potential Client.</div>';

  const logEl = document.getElementById('call-log');
  const cnt = document.getElementById('call-log-count');
  if (cnt) cnt.textContent = callsToday().length + ' today';
  if (logEl) {
    const recent = [...S.callLog].reverse().slice(0, 30);
    logEl.innerHTML = recent.length ? recent.map(c => `
      <div class="log-row">
        <span class="log-time">${new Date(c.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
        <span class="log-name">${esc(c.name)}</span>
        <span class="log-outcome">${esc(c.outcome)}</span>
      </div>`).join('') : '<div class="empty">Every outcome press is recorded here.</div>';
  }

  const sc = document.getElementById('script-stack');
  if (sc && !sc.innerHTML) {
    sc.innerHTML = `
      <div class="card script" style="margin-bottom:16px;">
        <div class="card-head"><div class="card-title">Opening Script</div></div>
        <p>“Hey, this is Jonathan with Elite Prodigy Media here on the Gulf Coast. Quick question — who handles the website for <strong>[BUSINESS]</strong>?”</p>
        <p><span class="cue">If it's them</span>“The reason I'm calling — we build clean, professional websites for [INDUSTRY] businesses around Baldwin County. Five pages, mobile-ready, contact form, Google Maps, done in 48 to 72 hours, flat <strong>$1,000</strong>. No contracts. Worth ten minutes for me to show you what that looks like for [BUSINESS]?”</p>
        <p><span class="cue">If their demo is already built</span>“I actually went ahead and built a full working version of your website — it's live right now. I can text you the link while we're talking. Take a look and tell me what you think.”</p>
      </div>
      <div class="card script" style="margin-bottom:16px;">
        <div class="card-head"><div class="card-title">Objections</div></div>
        <p><strong>“We already have a website.”</strong><br>“Totally fair — when's the last time it brought you a customer? I'll do a free side-by-side. If yours wins, no hard feelings.”</p>
        <p><strong>“That's too much money.”</strong><br>“One new customer likely covers it. $1,000 once — you own it. No monthly required.”</p>
        <p><strong>“Not right now.”</strong><br>“No problem — when should I check back? I'll put it on my calendar.” <em>(press Callback)</em></p>
        <p><strong>“Send me something.”</strong><br>“Even better — I'll text you a live link, not a brochure. Best number?”</p>
      </div>
      <div class="card script">
        <div class="card-head"><div class="card-title">Close</div></div>
        <p>“To get started it's a 50% deposit — <strong>$500</strong> — Venmo or Cash App, and your draft is live in 2–3 days. One round of revisions included. Sound good?”</p>
        <p><span class="cue">Payment</span>Venmo @eliteprodigy · Cash App $ELITEPRODIGYLLC</p>
        <p><span class="cue">After every call</span>Press the outcome on the lead card — pipeline updates itself.</p>
      </div>`;
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
  } else if (outcome === 'Not Interested') {
    l.stage = 'Lost';
  } else {
    if (l.stage === 'Lead') l.stage = 'Contacted';
    l.next = 'Try again';
  }
  save();
}

/* ═══ POTENTIAL CLIENTS ═══ */
const prospectFilters = { opportunity: 'All', source: 'All', status: 'All' };

function renderProspectFilters() {
  const el = document.getElementById('prospect-filters');
  if (!el) return;
  const mk = (group, label) => `<button class="chip ${prospectFilters[group] === label ? 'on' : ''}" onclick="setProspectFilter('${group}','${esc(label)}')">${esc(label)}</button>`;
  el.innerHTML =
    ['All', 'High', 'Medium', 'Low'].map(o => mk('opportunity', o)).join('') +
    '<span style="width:10px;"></span>' +
    ['All', 'New Prospect', 'Outreach Needed', 'Contacted', 'Follow-Up', 'Proposal Sent'].map(s => mk('status', s)).join('');
}
function setProspectFilter(group, val) { prospectFilters[group] = val; renderProspectFilters(); renderProspects(); }

function renderProspects() {
  const el = document.getElementById('prospect-table');
  if (!el) return;
  const q = (document.getElementById('prospect-search')?.value || '').toLowerCase();
  let rows = S.prospects.filter(p =>
    (prospectFilters.opportunity === 'All' || p.opportunity === prospectFilters.opportunity) &&
    (prospectFilters.status === 'All' || p.pipelineStatus === prospectFilters.status) &&
    (!q || (p.businessName + p.industry + p.location + p.source).toLowerCase().includes(q))
  );
  el.innerHTML = `
    <thead><tr><th>Business</th><th>Website</th><th>Score</th><th>Opportunity</th><th>Status</th><th></th></tr></thead>
    <tbody>${rows.map(p => `
      <tr>
        <td data-k="Business"><b style="color:var(--text);cursor:pointer;" onclick="openProspect('${p.id}')">${esc(p.businessName)}</b><br><span style="font-size:11px;color:var(--text-3);">${esc(p.industry)} · ${esc(p.location)}</span></td>
        <td data-k="Website">${esc(p.websiteStatus)}</td>
        <td data-k="Score">${p.websiteScore}</td>
        <td data-k="Opportunity">${badge(p.opportunity)}</td>
        <td data-k="Status">${badge(p.pipelineStatus)}</td>
        <td data-k="Actions"><div class="acts">
          <button class="mini" onclick="openProspect('${p.id}')">Open</button>
          <button class="mini" onclick="promoteProspect('${p.id}')">→ Pipeline</button>
        </div></td>
      </tr>`).join('') || '<tr><td colspan="6" class="empty">No prospects match.</td></tr>'}
    </tbody>`;
}

function addProspect() {
  const name = document.getElementById('pf-name').value.trim();
  if (!name) return alert('Prospect needs a business name.');
  S.prospects.unshift({
    id: uid(), businessName: name,
    industry: document.getElementById('pf-industry').value.trim(),
    location: document.getElementById('pf-location').value.trim(),
    phone: document.getElementById('pf-phone').value.trim(),
    websiteStatus: document.getElementById('pf-web').value,
    websiteScore: 0,
    source: document.getElementById('pf-source').value,
    opportunity: document.getElementById('pf-opp').value,
    pipelineStatus: 'New Prospect',
    recommendedAction: document.getElementById('pf-notes').value.trim() || 'Research + first call',
  });
  ['pf-name', 'pf-industry', 'pf-location', 'pf-phone', 'pf-notes'].forEach(i => document.getElementById(i).value = '');
  toggleForm('prospect-form', false);
  save();
}

function openProspect(id) {
  const p = S.prospects.find(x => x.id === id);
  if (!p) return;
  openPanel(`
    <div class="panel-title">${esc(p.businessName)}</div>
    <div class="panel-sub">${esc(p.industry)} · ${esc(p.location)} · via ${esc(p.source)}</div>
    <div class="panel-kv">
      <div><div class="kv-k">Website</div><div class="kv-v">${esc(p.websiteStatus)}</div></div>
      <div><div class="kv-k">Audit Score</div><div class="kv-v">${p.websiteScore}/100</div></div>
      <div><div class="kv-k">Opportunity</div><div class="kv-v">${badge(p.opportunity)}</div></div>
      <div><div class="kv-k">Status</div><div class="kv-v">${badge(p.pipelineStatus)}</div></div>
      <div><div class="kv-k">Phone</div><div class="kv-v">${p.phone ? `<a href="tel:${esc(p.phone)}" style="color:var(--gold);">${esc(p.phone)}</a>` : '—'}</div></div>
      <div><div class="kv-k">Recommended</div><div class="kv-v">${esc(p.recommendedAction)}</div></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:9px;">
      <button class="btn btn-gold" onclick="promoteProspect('${p.id}');closePanel();">→ Move to Pipeline (start selling)</button>
      <button class="btn btn-ghost" onclick="advanceProspect('${p.id}')">Advance status: ${esc(nextProspectStage(p.pipelineStatus))}</button>
      <button class="btn btn-ghost" onclick="editProspect('${p.id}')">✎ Edit details</button>
      <button class="btn btn-ghost" title="Phase 2: Firecrawl audit hook" onclick="alert('Phase 2: this button runs a Firecrawl website audit and fills the score automatically.')">Run Audit (Phase 2)</button>
      <button class="btn btn-ghost" title="Phase 2: SiteDrop concept hook" onclick="alert('Phase 2: this button kicks off a SiteDrop concept build for this prospect.')">Build Concept (Phase 2)</button>
      <button class="btn btn-ghost" title="Phase 2: CRM hook" onclick="alert('Phase 2: this button pushes the prospect into the CRM (HighLevel).')">Move to CRM (Phase 2)</button>
      <button class="btn btn-ghost" style="color:var(--red);" onclick="dropProspect('${p.id}')">Mark Not Fit</button>
    </div>`);
}
function nextProspectStage(s) {
  const i = PROSPECT_STAGES.indexOf(s);
  return PROSPECT_STAGES[Math.min(i + 1, PROSPECT_STAGES.length - 3)];
}
function advanceProspect(id) {
  const p = S.prospects.find(x => x.id === id);
  if (!p) return;
  p.pipelineStatus = nextProspectStage(p.pipelineStatus);
  save(); openProspect(id);
}
function editProspect(id) {
  const p = S.prospects.find(x => x.id === id);
  if (!p) return;
  const phone = prompt('Phone:', p.phone || ''); if (phone !== null) p.phone = phone.trim();
  const score = prompt('Website audit score (0–100):', p.websiteScore); if (score !== null && !isNaN(Number(score))) p.websiteScore = Number(score);
  const act = prompt('Recommended action:', p.recommendedAction || ''); if (act !== null) p.recommendedAction = act.trim();
  save(); openProspect(id);
}
function dropProspect(id) {
  const p = S.prospects.find(x => x.id === id);
  if (p && confirm('Mark "' + p.businessName + '" as Not Fit?')) { p.pipelineStatus = 'Not Fit'; save(); closePanel(); }
}
function promoteProspect(id) {
  const p = S.prospects.find(x => x.id === id);
  if (!p) return;
  if (S.leads.some(l => l.name === p.businessName)) return alert('Already in the pipeline.');
  S.leads.unshift({
    id: uid(), name: p.businessName, contact: '', phone: p.phone || '',
    industry: p.industry, value: 1000, stage: 'Lead',
    notes: (p.websiteStatus ? p.websiteStatus + '. ' : '') + (p.recommendedAction || ''),
    next: 'First call',
  });
  p.pipelineStatus = 'Contacted';
  save();
  alert(p.businessName + ' added to Pipeline + Call Mode queue.');
}

/* ═══ PIPELINE ═══ */
function renderPipeline() {
  const el = document.getElementById('pipe-board');
  if (!el) return;
  el.innerHTML = STAGES.map(stage => {
    const leads = S.leads.filter(l => l.stage === stage);
    return `
    <div class="pipe-col">
      <div class="pipe-head">${stage}<span class="count">${leads.length}</span></div>
      ${leads.map(p => {
        const si = STAGES.indexOf(stage);
        return `
        <div class="pipe-card">
          <div class="pipe-name">${esc(p.name)}</div>
          ${p.contact ? `<div style="font-size:11px;color:var(--text-3);margin-top:2px;">${esc(p.contact)}</div>` : ''}
          <div class="pipe-val">${money(p.value)}</div>
          ${p.phone ? `<a class="mini" style="margin-top:8px;" href="tel:${esc(p.phone)}">☎ ${esc(p.phone)}</a>` : ''}
          ${p.notes ? `<div class="pipe-notes">${esc(p.notes)}</div>` : ''}
          <div class="acts">
            ${si > 0 && si < 4 ? `<button class="mini" onclick="moveLead('${p.id}',-1)">◀</button>` : ''}
            ${si < 4 ? `<button class="mini" onclick="moveLead('${p.id}',1)">▶</button>` : ''}
            <button class="mini" onclick="editLead('${p.id}')">✎</button>
            ${stage !== 'Lost' ? `<button class="mini danger" onclick="loseLead('${p.id}')">Lost</button>` : `<button class="mini danger" onclick="deleteLead('${p.id}')">✕</button>`}
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
    id: uid(), name,
    contact: document.getElementById('nl-contact').value.trim(),
    phone: document.getElementById('nl-phone').value.trim(),
    industry: document.getElementById('nl-industry').value.trim(),
    value: Number(document.getElementById('nl-value').value) || 1000,
    stage: 'Lead',
    notes: document.getElementById('nl-notes').value.trim(),
    next: 'First call',
  });
  ['nl-name', 'nl-contact', 'nl-phone', 'nl-industry', 'nl-value', 'nl-notes'].forEach(i => document.getElementById(i).value = '');
  toggleForm('lead-form', false);
  save();
}
function moveLead(id, dir) {
  const l = S.leads.find(x => x.id === id); if (!l) return;
  const i = STAGES.indexOf(l.stage);
  l.stage = STAGES[Math.min(Math.max(i + dir, 0), STAGES.length - 2)];
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
  const l = S.leads.find(x => x.id === id); if (!l) return;
  const phone = prompt('Phone number:', l.phone || ''); if (phone !== null) l.phone = phone.trim();
  const contact = prompt('Contact person:', l.contact || ''); if (contact !== null) l.contact = contact.trim();
  const notes = prompt('Notes:', l.notes || ''); if (notes !== null) l.notes = notes.trim();
  const value = prompt('Deal value ($):', l.value); if (value !== null && !isNaN(Number(value))) l.value = Number(value);
  save();
}

/* ═══ TASKS ═══ */
function renderTasks() {
  const el = document.getElementById('task-board');
  if (!el) return;
  const cols = [
    { key: 'todo', label: 'To Do', next: 'inprogress', nextLabel: 'Start ▶' },
    { key: 'inprogress', label: 'In Progress', next: 'done', nextLabel: 'Done ✓' },
    { key: 'done', label: 'Done', next: null },
  ];
  el.innerHTML = cols.map(col => `
    <div class="pipe-col">
      <div class="pipe-head">${col.label}<span class="count">${S.tasks[col.key].length}</span></div>
      ${S.tasks[col.key].map(t => `
        <div class="pipe-card">
          <div style="font-size:13px;font-weight:500;">${esc(t.title)}</div>
          <div style="font-size:11px;color:var(--text-3);margin-top:4px;">${esc(t.client)} · due ${esc(t.due)} · ${badge(t.priority)}</div>
          <div class="acts">
            ${col.next ? `<button class="mini" onclick="moveTask('${col.key}','${t.id}','${col.next}')">${col.nextLabel}</button>` : ''}
            <button class="mini danger" onclick="deleteTask('${col.key}','${t.id}')">✕</button>
          </div>
        </div>`).join('')}
    </div>`).join('');
}
function addTaskFromForm() {
  const title = document.getElementById('nt-title').value.trim();
  if (!title) return alert('Task needs a title.');
  S.tasks.todo.unshift({
    id: uid(), title,
    client: document.getElementById('nt-client').value.trim() || 'Internal',
    priority: document.getElementById('nt-priority').value,
    due: document.getElementById('nt-due').value.trim() || todayStr(),
  });
  ['nt-title', 'nt-client', 'nt-due'].forEach(i => document.getElementById(i).value = '');
  toggleForm('task-form', false);
  save();
}
function moveTask(from, id, to) {
  const i = S.tasks[from].findIndex(t => t.id === id); if (i < 0) return;
  S.tasks[to].unshift(S.tasks[from].splice(i, 1)[0]);
  save();
}
function deleteTask(col, id) { S.tasks[col] = S.tasks[col].filter(t => t.id !== id); save(); }

/* ═══ CLIENTS / SITES ═══ */
function renderClients() {
  const el = document.getElementById('client-grid');
  if (!el) return;
  el.innerHTML = mockData.clients.map(c => `
    <div class="card lift">
      <div class="card-head">
        <div class="card-title" style="color:${c.color};">${esc(c.name)}</div>
        ${badge(c.status)}
      </div>
      <div class="row"><div class="row-main"><div class="row-sub">Industry</div><div class="row-title" style="font-size:12.5px;">${esc(c.industry)}</div></div></div>
      <div class="row"><div class="row-main"><div class="row-sub">Site</div><div class="row-title" style="font-size:12px;"><a href="https://${esc(c.site)}" target="_blank" rel="noopener" style="color:var(--gold);text-decoration:none;">${esc(c.site)} ↗</a></div></div></div>
      <div class="row"><div class="row-main"><div class="row-sub">Repo</div><div class="row-title" style="font-size:12px;font-family:monospace;color:var(--text-2);">${esc(c.repo)}</div></div></div>
    </div>`).join('');
}

function renderDeploys() {
  const d = document.getElementById('deploy-list');
  if (d) d.innerHTML = mockData.deployments.map(x => `
    <div class="row">
      <div class="row-main"><div class="row-title">${esc(x.name)}</div><div class="row-sub">${esc(x.url)}</div></div>
      <div class="row-end">${badge(x.status)}${x.url.includes('.') ? `<a class="mini" href="https://${esc(x.url)}" target="_blank" rel="noopener">↗</a>` : ''}</div>
    </div>`).join('');
  const r = document.getElementById('repo-list');
  if (r) r.innerHTML = mockData.repos.map(x => `
    <div class="row">
      <div class="row-main"><div class="row-title" style="font-family:monospace;font-size:12.5px;">${esc(x.name)}</div><div class="row-sub">${esc(x.purpose)}</div></div>
      <a class="mini" href="https://github.com/EliteProdigy1/${esc(x.name)}" target="_blank" rel="noopener">↗</a>
    </div>`).join('');
}

/* ═══ REVENUE ═══ */
function renderRevenue() {
  const el = document.getElementById('rev-kpis');
  if (!el) return;
  const won = S.leads.filter(l => l.stage === 'Closed Won');
  const wonVal = won.reduce((a, l) => a + (Number(l.value) || 0), 0);
  el.innerHTML = [
    { n: money(wonVal), l: 'Closed / Won', s: won.length + ' deals' },
    { n: money(pipelineValue()), l: 'Pipeline Value', s: activeLeads().length + ' active deals' },
    { n: money(activeLeads().filter(l => l.stage === 'Proposal Sent').reduce((a, l) => a + (Number(l.value) || 0), 0)), l: 'At Proposal', s: 'closest to cash' },
    { n: callsToday().length, l: 'Calls Today', s: 'activity drives revenue' },
  ].map(k => `<div class="card stat-tile"><div class="stat-num">${k.n}</div><div class="stat-label">${k.l}</div><div class="stat-sub">${k.s}</div></div>`).join('');

  const p = document.getElementById('pricing-list');
  if (p) p.innerHTML = mockData.pricing.map(x => `
    <div class="row">
      <div class="row-main"><div class="row-title">${esc(x.name)}</div><div class="row-sub">${esc(x.detail)}</div></div>
      <div style="font-family:var(--serif);font-size:16px;color:var(--gold-light);white-space:nowrap;">${esc(x.price)}</div>
    </div>`).join('');
  const ind = document.getElementById('industry-list');
  if (ind) ind.innerHTML = mockData.industries.map(i => `<span class="chip" style="cursor:default;">${esc(i)}</span>`).join('');
  const w = document.getElementById('won-list');
  if (w) w.innerHTML = won.length ? won.map(l => `
    <div class="row"><div class="row-main"><div class="row-title">${esc(l.name)}</div><div class="row-sub">${esc(l.next || '')}</div></div><div style="color:var(--gold-light);">${money(l.value)}</div></div>`).join('')
    : '<div class="empty">First close goes here. Go get it.</div>';
}

/* ═══ AI TEAM / GROWTH / INTEGRATIONS / WORKFORCE / AUTOMATIONS / KNOWLEDGE ═══ */
function renderAiTeam() {
  const el = document.getElementById('aiteam-grid');
  if (!el) return;
  el.innerHTML = mockData.aiTeam.map(t => `
    <div class="card tool-card lift">
      <div class="tool-top"><div class="tool-name">${esc(t.name)}</div><div class="tool-ico">${t.icon}</div></div>
      <div class="tool-role">${esc(t.role)}</div>
      <div class="tool-foot">
        <span class="badge b-good">Connected</span>
        <a class="btn btn-gold btn-sm" href="${esc(t.url)}" target="_blank" rel="noopener">Open ↗</a>
      </div>
    </div>`).join('');
}

let growthFilter = 'All';
function renderGrowth() {
  const f = document.getElementById('growth-filters');
  if (f) f.innerHTML = ['All', ...mockData.growthStack.map(g => g.cat)].map(c =>
    `<button class="chip ${growthFilter === c ? 'on' : ''}" onclick="growthFilter='${esc(c)}';renderGrowth();">${esc(c)}</button>`).join('');
  const el = document.getElementById('growth-grid');
  if (!el) return;
  const cats = mockData.growthStack.filter(g => growthFilter === 'All' || g.cat === growthFilter);
  el.innerHTML = cats.map(g => `
    <div class="card lift">
      <div class="card-head"><div class="card-title">${esc(g.cat)}</div><div class="card-tag">${g.tools.length} tools</div></div>
      <div class="mc-list">${g.tools.map(t => '· ' + esc(t)).join('<br>')}</div>
    </div>`).join('');
}

function renderIntegrations() {
  const el = document.getElementById('flow-list');
  if (!el) return;
  el.innerHTML = mockData.integrationsMap.map(f => `
    <div class="flow-row">
      <span class="flow-node">${esc(f.from)}</span><span class="flow-arrow">→</span>
      <span class="flow-node">${esc(f.via)}</span><span class="flow-arrow">→</span>
      <span class="flow-node">${esc(f.to)}</span>
      ${badge(f.status)}
      <span class="flow-why">${esc(f.why)}</span>
    </div>`).join('');
}

function renderWorkforce() {
  const el = document.getElementById('workforce-table');
  if (!el) return;
  el.innerHTML = `
    <thead><tr><th>Agent</th><th>Role</th><th>Area</th><th>Tools</th><th>Status</th><th>Permissions</th><th>Next Assignment</th></tr></thead>
    <tbody>${mockData.agentWorkforce.map(a => `
      <tr>
        <td data-k="Agent"><b style="color:var(--text);">${esc(a.agent)}</b></td>
        <td data-k="Role">${esc(a.role)}</td>
        <td data-k="Area">${esc(a.area)}</td>
        <td data-k="Tools">${esc(a.tools)}</td>
        <td data-k="Status">${badge(a.status)}</td>
        <td data-k="Permissions">${badge(a.permissions)}</td>
        <td data-k="Next">${esc(a.next)}</td>
      </tr>`).join('')}
    </tbody>`;
}

function renderAutomations() {
  const el = document.getElementById('automation-list');
  if (!el) return;
  el.innerHTML = mockData.automations.map(a => `
    <div class="row">
      <div class="row-main"><div class="row-title">${esc(a.name)}</div><div class="row-sub">${esc(a.desc)}</div></div>
      ${badge(a.status)}
    </div>`).join('');
}

function renderKnowledge() {
  const el = document.getElementById('knowledge-grid');
  if (!el) return;
  el.innerHTML = mockData.knowledge.map(k => `
    <div class="card lift">
      <div class="card-head"><div class="card-title" style="font-size:15px;">${esc(k.name)}</div></div>
      <div class="row-sub" style="margin-bottom:10px;">${esc(k.desc)}</div>
      <div class="tool-foot"><span class="card-tag">${esc(k.where)}</span><a class="btn btn-ghost btn-sm" href="${esc(k.url)}" target="_blank" rel="noopener">Open ↗</a></div>
    </div>`).join('');
}

/* ═══ PERSONAL / INVESTOR / BANKING (placeholder cards) ═══ */
function placeholderCards(elId, items) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = items.map(x => `
    <div class="card lift">
      <div class="card-head"><div class="card-title" style="font-size:15px;">${x.icon} ${esc(x.name)}</div><span class="badge b-info">Phase 2</span></div>
      <div class="row-sub">${esc(x.note)}</div>
    </div>`).join('');
}

/* ═══ SLIDE PANEL ═══ */
function openPanel(html) {
  document.getElementById('panel-content').innerHTML = html;
  document.getElementById('slide-panel').classList.add('open');
  document.getElementById('panel-back').classList.add('open');
}
function closePanel() {
  document.getElementById('slide-panel').classList.remove('open');
  document.getElementById('panel-back').classList.remove('open');
}

/* ═══ CHROME ═══ */
const TITLES = {
  mission: 'Mission <em>Control</em>', callmode: 'Call <em>Mode</em>', prospects: 'Potential <em>Clients</em>',
  pipeline: 'Client <em>Pipeline</em>', tasks: 'Task <em>Queue</em>', clients: 'Active <em>Clients</em>',
  deploys: 'Sites &amp; <em>Repos</em>', revenue: 'Revenue &amp; <em>Pricing</em>', aiteam: 'AI <em>Team</em>',
  growth: 'Growth <em>Stack</em>', integrations: 'Integrations <em>Map</em>', workforce: 'Agent <em>Workforce</em>',
  automations: 'Automation <em>Center</em>', knowledge: 'Knowledge <em>Center</em>', personal: 'Personal <em>Command</em>',
  investor: 'Investor <em>Dashboard</em>', banking: 'Banking &amp; <em>Funding</em>',
};

function goSection(target) {
  document.querySelectorAll('.nav-link').forEach(n => n.classList.toggle('active', n.getAttribute('data-section') === target));
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById('section-' + target);
  if (sec) sec.classList.add('active');
  const t = document.getElementById('page-title');
  if (t) t.innerHTML = TITLES[target] || target;
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleForm(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  const want = show !== undefined ? show : (el.style.display === 'none' || !el.style.display);
  el.style.display = want ? 'block' : 'none';
}

function tickClock() {
  const d = new Date();
  const dd = document.getElementById('live-date');
  const cc = document.getElementById('live-clock');
  if (dd) dd.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  if (cc) cc.textContent = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

function initChrome() {
  document.querySelectorAll('.nav-link').forEach(item => {
    item.addEventListener('click', e => { e.preventDefault(); goSection(item.getAttribute('data-section')); });
  });
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
  });
  document.getElementById('overlay').addEventListener('click', closeSidebar);
  document.getElementById('btn-export').addEventListener('click', exportData);
  document.getElementById('btn-import').addEventListener('click', () => document.getElementById('import-file').click());
  document.getElementById('import-file').addEventListener('change', e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; });
  document.getElementById('btn-focus').addEventListener('click', () => document.body.classList.toggle('focus'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
}

/* ═══ RENDER ALL ═══ */
function renderAll() {
  renderKPIs();
  renderMissionControl();
  renderCallMode();
  renderProspectFilters();
  renderProspects();
  renderPipeline();
  renderTasks();
  renderClients();
  renderDeploys();
  renderRevenue();
  renderAiTeam();
  renderGrowth();
  renderIntegrations();
  renderWorkforce();
  renderAutomations();
  renderKnowledge();
  placeholderCards('personal-grid', mockData.personalCommand);
  placeholderCards('investor-grid', mockData.investorDashboard);
  placeholderCards('banking-grid', mockData.bankingFunding);
}

document.addEventListener('DOMContentLoaded', () => {
  tickClock();
  setInterval(tickClock, 30000);
  renderAll();
  initChrome();
});
