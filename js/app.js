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

  /* ═══════════════════════════════════════════════════════════════
     SPRINT 1 — PROSPECTING ENGINE  (mock data; Phase 2 API targets noted)
     Answers: "Who should EP Media reach out to next?"
  ═══════════════════════════════════════════════════════════════ */

  // ── prospects ──────────────────────────────────────────────────
  // PHASE 2: replace with GET /.netlify/functions/prospects — merged
  //          output of Apollo (contacts), Firecrawl/Google Maps
  //          (discovery), and audit scores. Never expose keys client-side.
  prospects: [
    {
      id: 'p1', businessName: 'Gulf Shore Pressure Washing', industry: 'Pressure Washing', location: 'Gulf Shores, AL',
      websiteUrl: '', websiteStatus: 'No website found', websiteScore: 18, mobileScore: 0, seoScore: 5, designScore: 0,
      sourceTool: 'Firecrawl', opportunityLevel: 'High', pipelineStatus: 'New Prospect',
      recommendedAction: 'Build a quick SiteDrop concept, then cold call the owner',
      contactName: '', phone: '', email: '', socialLinks: { facebook: '', instagram: '' },
      lastChecked: 'Jul 5', nextFollowUp: 'Jul 6', notes: 'No site at all — strongest opportunity. Runs off a Facebook page only.',
    },
    {
      id: 'p2', businessName: 'Baldwin County Roofing', industry: 'Roofing', location: 'Foley, AL',
      websiteUrl: 'baldwincountyroofing.com', websiteStatus: 'Outdated website', websiteScore: 34, mobileScore: 28, seoScore: 40, designScore: 30,
      sourceTool: 'Google Maps', opportunityLevel: 'High', pipelineStatus: 'Needs Research',
      recommendedAction: 'Run audit, prep a before/after side-by-side for the pitch',
      contactName: '', phone: '', email: '', socialLinks: { facebook: '' },
      lastChecked: 'Jul 5', nextFollowUp: 'Jul 6', notes: 'Site is ~2015 template, not mobile-friendly. Good roofing reviews though.',
    },
    {
      id: 'p3', businessName: 'Coastal Comfort HVAC', industry: 'HVAC', location: 'Daphne, AL',
      websiteUrl: 'coastalcomforthvac.com', websiteStatus: 'Slow mobile site', websiteScore: 46, mobileScore: 32, seoScore: 55, designScore: 50,
      sourceTool: 'Yelp', opportunityLevel: 'Medium', pipelineStatus: 'Outreach Needed',
      recommendedAction: 'Call with the mobile-speed + booking-form angle',
      contactName: '', phone: '', email: '', socialLinks: { facebook: '', instagram: '' },
      lastChecked: 'Jul 5', nextFollowUp: 'Jul 7', notes: 'Loads slow on phones; no online booking. Busy season is now.',
    },
    {
      id: 'p4', businessName: 'Orange Beach Fishing Charters', industry: 'Fishing Charter', location: 'Orange Beach, AL',
      websiteUrl: 'obfishingcharters.com', websiteStatus: 'No clear CTA', websiteScore: 54, mobileScore: 60, seoScore: 48, designScore: 55,
      sourceTool: 'Instagram', opportunityLevel: 'Medium', pipelineStatus: 'New Prospect',
      recommendedAction: 'Concept with a big "Book a Trip" CTA and gallery',
      contactName: '', phone: '', email: '', socialLinks: { instagram: '@obfishing' },
      lastChecked: 'Jul 5', nextFollowUp: 'Jul 7', notes: 'Strong IG following, weak site conversion. Booking happens by DM.',
    },
    {
      id: 'p5', businessName: 'Fairhope Auto Detailing', industry: 'Auto Detailing', location: 'Fairhope, AL',
      websiteUrl: '', websiteStatus: 'No website found', websiteScore: 15, mobileScore: 0, seoScore: 8, designScore: 0,
      sourceTool: 'Apollo', opportunityLevel: 'High', pipelineStatus: 'Concept Ready',
      recommendedAction: 'Concept is built — send the demo link on first call',
      contactName: 'Marcus', phone: '', email: '', socialLinks: { instagram: '@fairhopedetail' },
      lastChecked: 'Jul 5', nextFollowUp: 'Jul 6', notes: 'Mobile detailing, booked solid but zero web presence. Owner name Marcus.',
    },
    {
      id: 'p6', businessName: 'Bayside Barbers', industry: 'Barber / Studio', location: 'Spanish Fort, AL',
      websiteUrl: 'baysidebarbers.square.site', websiteStatus: 'Poor website', websiteScore: 40, mobileScore: 55, seoScore: 25, designScore: 35,
      sourceTool: 'Google Maps', opportunityLevel: 'Medium', pipelineStatus: 'Needs Research',
      recommendedAction: 'Audit the Square page; pitch a real branded site + booking',
      contactName: '', phone: '', email: '', socialLinks: { instagram: '@baysidebarbers' },
      lastChecked: 'Jul 5', nextFollowUp: 'Jul 8', notes: 'Running on a generic Square site. Room to brand them properly.',
    },
    {
      id: 'p7', businessName: 'Eastern Shore Med Spa', industry: 'Medical / Wellness', location: 'Fairhope, AL',
      websiteUrl: 'easternshoremedspa.com', websiteStatus: 'Good website / low priority', websiteScore: 78, mobileScore: 80, seoScore: 72, designScore: 82,
      sourceTool: 'Apollo', opportunityLevel: 'Low', pipelineStatus: 'Not Fit',
      recommendedAction: 'Already has a solid site — low priority, revisit for growth plan',
      contactName: '', phone: '', email: '', socialLinks: { instagram: '' },
      lastChecked: 'Jul 5', nextFollowUp: '', notes: 'Site is already strong. Only a fit for a monthly growth plan later.',
    },
    {
      id: 'p8', businessName: 'Mobile Bay Landscaping', industry: 'Landscaping', location: 'Mobile, AL',
      websiteUrl: 'mobilebaylandscaping.net', websiteStatus: 'Outdated website', websiteScore: 36, mobileScore: 30, seoScore: 42, designScore: 34,
      sourceTool: 'Firecrawl', opportunityLevel: 'High', pipelineStatus: 'Outreach Needed',
      recommendedAction: 'Lead with the two landscaping demos already live (Azalea, Warren)',
      contactName: '', phone: '', email: '', socialLinks: { facebook: '' },
      lastChecked: 'Jul 5', nextFollowUp: 'Jul 6', notes: 'Same industry as two live demos — proof is ready. Strong angle.',
    },
  ],

  // ── leadSources ────────────────────────────────────────────────
  // PHASE 2: counts populate from each tool's API (Apollo, Firecrawl,
  //          Google Maps Places, manual entry, Zapier inbound).
  leadSources: [
    { tool: 'Firecrawl',    role: 'Website discovery + audit scraping',   count: 2, connected: 'Planned',   note: 'Will auto-audit sites and score opportunity' },
    { tool: 'Google Maps',  role: 'Local business discovery by area',      count: 2, connected: 'Planned',   note: 'Places API pulls businesses by industry + radius' },
    { tool: 'Apollo',       role: 'Contact + company enrichment',          count: 2, connected: 'Pending',   note: 'Names, phones, emails for discovered businesses' },
    { tool: 'Yelp',         role: 'Reviews + service-business signals',    count: 1, connected: 'Manual',    note: 'Manual for now; API later' },
    { tool: 'Instagram',    role: 'Social presence + DM-booking signals',  count: 1, connected: 'Manual',    note: 'Spot high-follower, weak-site businesses' },
    { tool: 'Manual',       role: 'Hand-entered prospects',                count: 0, connected: 'Active',    note: 'Add via the Potential Clients form' },
  ],

  // ── opportunityScores ──────────────────────────────────────────
  // Scoring rubric: overall websiteScore is the weighted blend of the
  // four sub-scores. Lower score = bigger opportunity for EP Media.
  // PHASE 2: sub-scores come from Firecrawl audit + Lighthouse/PSI.
  opportunityScores: {
    weights: { website: 0.30, mobile: 0.30, seo: 0.20, design: 0.20 },
    bands: [
      { level: 'High',   max: 45,  action: 'Build a concept + reach out now',        cls: 'good' },
      { level: 'Medium', max: 65,  action: 'Audit, then pitch the weakest area',      cls: 'warn' },
      { level: 'Low',    max: 100, action: 'Low priority — revisit for a growth plan', cls: 'info' },
    ],
    note: 'A business scoring under 45 is a strong opportunity: their web presence is costing them customers.',
  },

  // ── prospectAudits ─────────────────────────────────────────────
  // PHASE 2: replace with Firecrawl + PageSpeed Insights audit results.
  prospectAudits: [
    { businessName: 'Baldwin County Roofing', date: 'Jul 5', overall: 34, mobile: 28, seo: 40, design: 30, findings: ['Not mobile-responsive', 'No SSL on contact form', 'No Google Business embed'] },
    { businessName: 'Coastal Comfort HVAC',   date: 'Jul 5', overall: 46, mobile: 32, seo: 55, design: 50, findings: ['5.8s mobile load', 'No online booking', 'Weak call-to-action'] },
    { businessName: 'Bayside Barbers',         date: 'Jul 5', overall: 40, mobile: 55, seo: 25, design: 35, findings: ['Generic Square template', 'No local SEO', 'No brand identity'] },
  ],

  // ── dailyLeadReport ────────────────────────────────────────────
  // Template values; live counts are computed at render from working
  // prospect state. PHASE 2: generated each morning and optionally
  // voiced by ElevenLabs as the morning briefing.
  dailyLeadReport: {
    date: 'Today',
    goalCalls: 15,
    goalConcepts: 2,
    note: 'Work the High-opportunity list first — those businesses have the most to gain.',
  },

  // ── automationHealth ───────────────────────────────────────────
  // PHASE 2: each row reflects real connection status + last run time
  //          from the tool's API or Zapier task history.
  automationHealth: [
    { name: 'Firecrawl website audits',      status: 'Planned',   lastRun: '—',       note: 'Scrape + score prospect sites automatically' },
    { name: 'Google Maps discovery',         status: 'Planned',   lastRun: '—',       note: 'Pull new businesses by industry + area nightly' },
    { name: 'Apollo contact enrichment',     status: 'Pending',   lastRun: '—',       note: 'Fill names/phones/emails on new prospects' },
    { name: 'SiteDrop concept builds',       status: 'Manual',    lastRun: 'Jul 5',   note: 'Triggered by hand from the prospect panel for now' },
    { name: 'Zapier → CRM sync',             status: 'Planned',   lastRun: '—',       note: 'Push qualified prospects into HighLevel' },
    { name: 'Netlify form → Gmail',          status: 'Connected', lastRun: 'Live',    note: 'Client-site inquiries already flow to the inbox' },
  ],

  /* ═══════════════════════════════════════════════════════════════
     SPRINT 3 — FIRECRAWL INTELLIGENCE  (discovery pool — MOCK/TEST)
     Pipeline: Discover → Website Intelligence → Opportunity Score →
               Prospects → Call Queue.  No-website businesses first.
     This pool is what a Firecrawl / Google / Yelp search WOULD return.
     services/firecrawl.js reads it in mock mode; the Netlify Function
     replaces it with live results only when FIRECRAWL_LIVE=true.
  ═══════════════════════════════════════════════════════════════ */
  discoveryPool: [
    // ── No-website businesses (highest opportunity — EP's core offer) ──
    { id: 'd1', businessName: 'Gulf Breeze Mobile Detailing', industry: 'Auto Detailing',  location: 'Gulf Shores, AL',  source: 'Google', hasWebsite: false, websiteUrl: '', phone: '', rating: 4.9, reviews: 62, signal: 'Booked solid off Instagram DMs, zero website' },
    { id: 'd2', businessName: 'Coastal Kut Lawn Care',        industry: 'Landscaping',      location: 'Foley, AL',        source: 'Yelp',   hasWebsite: false, websiteUrl: '', phone: '', rating: 4.7, reviews: 28, signal: 'Facebook page only — same industry as Azalea & Warren demos' },
    { id: 'd3', businessName: 'Bama Coast Pressure Washing',  industry: 'Pressure Washing', location: 'Orange Beach, AL', source: 'Firecrawl', hasWebsite: false, websiteUrl: '', phone: '', rating: 4.8, reviews: 41, signal: 'No site at all, strong reviews — instant SiteDrop concept' },
    { id: 'd4', businessName: 'Sweet Bay Fish Co.',           industry: 'Restaurant',       location: 'Fairhope, AL',     source: 'Google', hasWebsite: false, websiteUrl: '', phone: '', rating: 4.6, reviews: 90, signal: 'Menu lives in Facebook photos — no real site' },
    { id: 'd5', businessName: 'Reel Time Inshore Charters',   industry: 'Fishing Charter',  location: 'Dauphin Island, AL', source: 'Yelp', hasWebsite: false, websiteUrl: '', phone: '', rating: 5.0, reviews: 34, signal: 'Books trips by phone/DM only — needs a booking site' },
    { id: 'd6', businessName: 'Faith & Fades Barber Studio',  industry: 'Barber / Studio',  location: 'Daphne, AL',       source: 'Google', hasWebsite: false, websiteUrl: '', phone: '', rating: 4.9, reviews: 55, signal: 'No online booking, no site — appointment chaos' },
    // ── Weak / outdated sites (still strong opportunity) ──
    { id: 'd7', businessName: 'Baldwin Breeze HVAC',          industry: 'HVAC',             location: 'Robertsdale, AL',  source: 'Firecrawl', hasWebsite: true, websiteUrl: 'baldwinbreezehvac.com', siteQuality: 'outdated', phone: '', rating: 4.4, reviews: 47, signal: 'Site is ~2015, not mobile — busy season now' },
    { id: 'd8', businessName: 'Eastern Shore Roofing Pros',   industry: 'Roofing',          location: 'Spanish Fort, AL', source: 'Google', hasWebsite: true, websiteUrl: 'esroofingpros.com', siteQuality: 'weak', phone: '', rating: 4.5, reviews: 33, signal: 'Generic template, weak CTA — before/after pitch' },
    { id: 'd9', businessName: 'Magnolia Nail Bar',            industry: 'Beauty / Studio',  location: 'Fairhope, AL',     source: 'Yelp',   hasWebsite: true, websiteUrl: 'magnolianailbar.square.site', siteQuality: 'weak', phone: '', rating: 4.7, reviews: 71, signal: 'Running on a generic Square page — needs branding' },
    { id: 'd10', businessName: 'Perdido Key Kayak Rentals',   industry: 'Recreation',       location: 'Perdido Key, AL',  source: 'Firecrawl', hasWebsite: true, websiteUrl: 'perdidokayaks.net', siteQuality: 'outdated', phone: '', rating: 4.6, reviews: 52, signal: 'Slow, dated site — no online reservations' },
    // ── Already-strong site (low priority — proves scoring works) ──
    { id: 'd11', businessName: 'Bay Area Dental Group',       industry: 'Medical / Wellness', location: 'Daphne, AL',     source: 'Google', hasWebsite: true, websiteUrl: 'bayareadentalgroup.com', siteQuality: 'ok', phone: '', rating: 4.8, reviews: 210, signal: 'Solid site already — growth-plan fit only' },
  ],
};

/* ═══ MODULE REGISTRY — Mission Control renders every enabled module ═══ */
const dashboardModules = [
  { id: 'priorities',        title: 'Priority Queue',      enabled: true, size: 'large',  section: 'tasks',        summary: sumPriorities },
  { id: 'callmode',          title: 'Call Mode',           enabled: true, size: 'large',  section: 'callmode',     summary: sumCallMode, urgent: true },
  { id: 'sales-agent',       title: 'Sales Agent',         enabled: true, size: 'large',  section: 'agent',        summary: sumSalesAgent, urgent: true },
  { id: 'intelligence',      title: 'Intelligence Center', enabled: true, size: 'large',  section: 'intelligence', summary: sumIntelligence, urgent: true },
  { id: 'prospect-discovery', title: 'Prospect Discovery', enabled: true, size: 'large',  section: 'discovery',    summary: sumDiscovery, urgent: true },
  { id: 'potential-clients', title: 'Potential Clients',   enabled: true, size: 'large',  section: 'prospects',    summary: sumProspects, urgent: true },
  { id: 'opportunity-scoring', title: 'Opportunity Scoring', enabled: true, size: 'medium', section: 'intelligence', summary: sumScoring },
  { id: 'lead-source-tracker', title: 'Lead Source Tracker', enabled: true, size: 'medium', section: 'intelligence', summary: sumSources },
  { id: 'daily-lead-report', title: 'Daily Lead Report',   enabled: true, size: 'medium', section: 'intelligence', summary: sumDailyReport },
  { id: 'automation-health', title: 'Automation Health',   enabled: true, size: 'medium', section: 'intelligence', summary: sumAutomationHealth },
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
  // Prospects seed from the canonical mockData.prospects (20-field records).
  prospects: JSON.parse(JSON.stringify(mockData.prospects)),
  callLog: [],
};

let S = load();
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (!d.prospects) d.prospects = JSON.parse(JSON.stringify(SEED.prospects)); // migrate v2 → 2.0
      // migrate 2.0 → Sprint 1: old 4-field prospects lack websiteUrl → reseed with full records
      if (d.prospects.length && d.prospects[0].websiteUrl === undefined) {
        d.prospects = JSON.parse(JSON.stringify(SEED.prospects));
      }
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

// Non-blocking toast (used by auto-save-to-Notion so it never interrupts).
let _toastTimer = null;
function toast(msg, warn) {
  let el = document.getElementById('ep-toast');
  if (!el) { el = document.createElement('div'); el.id = 'ep-toast'; el.className = 'ep-toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.toggle('warn', !!warn);
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3400);
}

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
  const hot = S.prospects.filter(p => p.opportunityLevel === 'High' && !['Won', 'Not Fit'].includes(p.pipelineStatus));
  return `<div class="mc-big">${S.prospects.length}</div><div class="mc-list"><b>${hot.length}</b> high-opportunity prospects waiting for outreach</div>`;
}
function sumIntelligence() {
  const tp = (typeof topProspects === 'function') ? topProspects(1)[0] : null;
  const hot = S.prospects.filter(p => p.opportunityLevel === 'High' && !['Won', 'Not Fit'].includes(p.pipelineStatus)).length;
  return `<div class="mc-big">${hot}</div><div class="mc-list">high-opportunity leads${tp ? ' · call <b>' + esc(tp.businessName) + '</b> first' : ''}</div>`;
}
function sumScoring() {
  return `<div class="mc-list">Lower web score = bigger opportunity. Bands: <b>High</b> ≤45 · <b>Medium</b> ≤65 · <b>Low</b> >65.</div>`;
}
function sumDiscovery() {
  const noSite = (mockData.discoveryPool || []).filter(b => !b.hasWebsite).length;
  return `<div class="mc-big">${(mockData.discoveryPool || []).length}</div><div class="mc-list"><b>${noSite}</b> no-website businesses ready to discover &amp; score · <span style="color:var(--yellow);">mock mode</span></div>`;
}
function sumSalesAgent() {
  return (typeof window.sumSalesAgentBody === 'function')
    ? window.sumSalesAgentBody()
    : `<div class="mc-list">Coordinates discovery → intelligence → proposal → follow-up → client.</div>`;
}
function sumSources() {
  return `<div class="mc-big">${mockData.leadSources.length}</div><div class="mc-list">lead sources · Firecrawl, Google Maps, Apollo, manual</div>`;
}
function sumDailyReport() {
  const active = S.prospects.filter(p => !['Won', 'Not Fit'].includes(p.pipelineStatus)).length;
  return `<div class="mc-big">${active}</div><div class="mc-list">prospects to work today · goal <b>${mockData.dailyLeadReport.goalCalls}</b> calls</div>`;
}
function sumAutomationHealth() {
  const conn = mockData.automationHealth.filter(a => a.status === 'Connected').length;
  return `<div class="mc-big">${conn}</div><div class="mc-list">automations live · <b>${mockData.automationHealth.length - conn}</b> pending/planned</div>`;
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

/* ═══ TODAY'S MEETINGS (reads the Notion Meetings DB) ═══ */
let meetingsData = [];
const MEETING_NEXT = {
  Discovery: 'Prep proposal & pricing', Proposal: 'Follow up to close',
  'Check-in': 'Log outcome + next step', Kickoff: 'Confirm assets & timeline', Other: 'Review notes & follow up',
};
function meetingDayLabel(d) {
  if (!d || isNaN(d.getTime())) return 'Date TBD';
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const dd = new Date(d); dd.setHours(0, 0, 0, 0);
  const diff = Math.round((dd - t) / 86400000);
  if (diff === 0) return 'Today'; if (diff === 1) return 'Tomorrow'; if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return dd.toLocaleDateString('en-US', { weekday: 'long' });
  return dd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function meetingTime(m) { return (m.date && /T\d\d:/.test(m.date)) ? new Date(m.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''; }
function upcomingMeetings(limit) {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return (meetingsData || [])
    .filter(m => m && (m.date || m.title || m.with))
    .map(m => Object.assign({}, m, { _d: m.date ? new Date(m.date) : null }))
    .filter(m => !m._d || isNaN(m._d.getTime()) || m._d >= t)
    .sort((a, b) => (a._d && !isNaN(a._d) ? a._d.getTime() : Infinity) - (b._d && !isNaN(b._d) ? b._d.getTime() : Infinity))
    .slice(0, limit || 4);
}
function homeMeetingsHTML() {
  const ms = upcomingMeetings(4);
  if (!ms.length) return '<div class="empty">No meetings scheduled. Tap <b>🗓 Meeting</b> to add one.</div>';
  return ms.map(m => `
    <div class="home-meeting">
      <div class="hm-when">${esc(meetingDayLabel(m._d))}${meetingTime(m) ? ' · ' + esc(meetingTime(m)) : ''}</div>
      <div class="hm-title">${esc(m.with || m.title || 'Meeting')}${m.type ? ' ' + badge(m.type) : ''}</div>
      ${m.notes ? `<div class="hm-notes">${esc(String(m.notes).slice(0, 130))}${String(m.notes).length > 130 ? '…' : ''}</div>` : ''}
      <div class="hm-next">▸ ${esc(MEETING_NEXT[m.type] || 'Review notes & follow up')}</div>
    </div>`).join('');
}

/* ═══ HOME / MISSION CONTROL — 5 focus cards only ═══ */
function renderMissionControl() {
  const el = document.getElementById('mc-grid');
  if (!el) return;

  // Call Queue (top prospects to dial)
  const cq = (typeof callQueueProspects === 'function') ? callQueueProspects().slice(0, 5) : [];
  const cqHTML = cq.length ? cq.map(p => `
    <div class="home-row" onclick="goSection('prospects');openProspect('${p.id}')">
      <div><div class="home-row-t">${esc(p.businessName)}${p.websiteStatus === 'No website found' ? ' <span class="badge b-gold">NO SITE</span>' : ''}</div>
      <div class="home-row-s">${esc(p.industry)} · ${esc(p.location)}</div></div>
      <div class="home-row-e">${badge(p.opportunityLevel)}${p.phone ? `<a class="mini" href="tel:${esc(p.phone)}" onclick="event.stopPropagation()">☎</a>` : ''}</div>
    </div>`).join('') : '<div class="empty">Queue empty — discover or add prospects.</div>';

  // Hot Prospects (high opportunity)
  const hot = S.prospects.filter(p => p.opportunityLevel === 'High' && !['Won', 'Not Fit'].includes(p.pipelineStatus))
    .sort((a, b) => (a.websiteScore || 0) - (b.websiteScore || 0)).slice(0, 5);
  const hotHTML = hot.length ? hot.map(p => `
    <div class="home-row" onclick="goSection('prospects');openProspect('${p.id}')">
      <div><div class="home-row-t">${esc(p.businessName)}</div><div class="home-row-s">${esc(p.websiteStatus)} · score ${p.websiteScore}</div></div>
      <div class="home-row-e">${badge('High')}</div>
    </div>`).join('') : '<div class="empty">No hot prospects yet.</div>';

  // Active Client Sites (live deployments)
  const sites = mockData.deployments.filter(d => d.status === 'Live').slice(0, 6);
  const sitesHTML = sites.length ? sites.map(d => `
    <div class="home-row">
      <div><div class="home-row-t">${esc(d.name)}</div><div class="home-row-s">${esc(d.url)}</div></div>
      <a class="mini" href="https://${esc(d.url)}" target="_blank" rel="noopener">↗</a>
    </div>`).join('') : '<div class="empty">No live sites.</div>';

  // Tasks Due Today (due today or high priority)
  const today = todayStr();
  const tasks = S.tasks.todo.filter(t => t.due === today || t.priority === 'high').slice(0, 6);
  const tasksHTML = tasks.length ? tasks.map(t => `
    <div class="home-row" onclick="goSection('tasks')">
      <div><div class="home-row-t">${esc(t.title)}</div><div class="home-row-s">${esc(t.client)} · due ${esc(t.due)}</div></div>
      <div class="home-row-e">${badge(t.priority)}</div>
    </div>`).join('') : '<div class="empty">Nothing due today — go sell.</div>';

  const card = (title, section, tag, body, cls) => `
    <div class="card home-card ${cls || ''}">
      <div class="card-head"><div class="card-title">${title}</div>
        <button class="card-tag home-open" onclick="goSection('${section}')">${tag} →</button></div>
      ${body}
    </div>`;

  const meetingsCard = `
    <div class="card home-card home-wide home-accent">
      <div class="card-head"><div class="card-title">🗓 Today’s Meetings</div>
        <button class="card-tag home-open" onclick="openMeetingNotes()">＋ Add →</button></div>
      ${homeMeetingsHTML()}
    </div>`;

  el.innerHTML =
    meetingsCard +
    card('☎ Call Queue', 'callmode', 'Call Mode', cqHTML) +
    card('🔥 Hot Prospects', 'prospects', 'Prospects', hotHTML) +
    card('🌐 Active Client Sites', 'deploys', 'Sites', sitesHTML) +
    card('✓ Tasks Due Today', 'tasks', 'Tasks', tasksHTML);
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
  // Notion is the source of truth: write the call note + update the prospect.
  if (window.EPIntake) {
    EPIntake.callNote({ business: l.name, outcome: outcome, notes: l.notes || '', nextFollowUp: outcome === 'Callback' ? (l.next || '') : '', agent: 'Human', source: 'Typed' })
      .then(res => { if (res && res.ok) toast('Call note → Notion ✓'); });
  }
  if (window.notionService && l.notionId) {
    const st = outcome === 'Not Interested' ? 'Lost' : outcome === 'Interested' ? 'Interested' : 'Contacted';
    notionService.updateProspect(l.notionId, { status: st, note: 'Call: ' + outcome, nextFollowUp: outcome === 'Callback' ? (l.next || '') : undefined });
  }
  save();
}

/* ═══ POTENTIAL CLIENTS ═══ */
/* ═══ POTENTIAL CLIENTS — 6 filters, 20-field records ═══ */
const prospectFilters = { industry: 'All', location: 'All', opportunity: 'All', source: 'All', status: 'All', website: 'All' };

function uniq(key) { return ['All', ...Array.from(new Set(S.prospects.map(p => p[key]).filter(Boolean)))]; }

function renderProspectFilters() {
  const el = document.getElementById('prospect-filters');
  if (!el) return;
  const chip = (group, label) => `<button class="chip ${prospectFilters[group] === label ? 'on' : ''}" onclick="setProspectFilter('${group}','${esc(label)}')">${esc(label)}</button>`;
  const groups = [
    ['Opportunity', 'opportunity', ['All', 'High', 'Medium', 'Low']],
    ['Status', 'status', ['All', ...PROSPECT_STAGES]],
    ['Website', 'website', ['All', 'No website found', 'Poor website', 'Outdated website', 'Slow mobile site', 'No clear CTA', 'Good website / low priority']],
    ['Industry', 'industry', uniq('industry')],
    ['Location', 'location', uniq('location')],
    ['Source', 'source', uniq('sourceTool')],
  ];
  el.innerHTML = groups.map(([label, group, opts]) =>
    `<div class="filter-group"><span class="filter-label">${label}</span>${opts.map(o => chip(group, o)).join('')}</div>`
  ).join('');
}
function setProspectFilter(group, val) { prospectFilters[group] = val; renderProspectFilters(); renderProspects(); }

function prospectMatches(p) {
  const q = (document.getElementById('prospect-search')?.value || '').toLowerCase();
  return (prospectFilters.industry === 'All' || p.industry === prospectFilters.industry)
    && (prospectFilters.location === 'All' || p.location === prospectFilters.location)
    && (prospectFilters.opportunity === 'All' || p.opportunityLevel === prospectFilters.opportunity)
    && (prospectFilters.source === 'All' || p.sourceTool === prospectFilters.source)
    && (prospectFilters.status === 'All' || p.pipelineStatus === prospectFilters.status)
    && (prospectFilters.website === 'All' || p.websiteStatus === prospectFilters.website)
    && (!q || (p.businessName + p.industry + p.location + p.sourceTool + (p.contactName || '')).toLowerCase().includes(q));
}

function renderProspects() {
  const el = document.getElementById('prospect-table');
  if (!el) return;
  const rows = S.prospects.filter(prospectMatches);
  el.innerHTML = `
    <thead><tr><th>Business</th><th>Website</th><th>Phone</th><th>Opportunity</th><th>Status</th><th></th></tr></thead>
    <tbody>${rows.map(p => `
      <tr>
        <td data-k="Business"><b style="color:var(--text);cursor:pointer;" onclick="openProspect('${p.id}')">${esc(p.businessName)}</b><br><span style="font-size:11px;color:var(--text-3);">${esc(p.industry)} · ${esc(p.location)}</span></td>
        <td data-k="Website">${siteUrl(p.websiteUrl) ? `<a href="${esc(siteUrl(p.websiteUrl))}" target="_blank" rel="noopener" style="color:var(--gold);">Visit ↗</a>` : esc(p.websiteStatus)}</td>
        <td data-k="Phone">${p.phone ? `<a href="tel:${esc(p.phone)}" style="color:var(--gold);">${esc(p.phone)}</a>` : `<button class="mini" onclick="addPhone('${p.id}')">＋ phone</button>`}</td>
        <td data-k="Opportunity">${badge(p.opportunityLevel)} <span style="color:var(--text-3);font-size:11px;">${p.websiteScore}</span></td>
        <td data-k="Status">${badge(p.pipelineStatus)}</td>
        <td data-k="Actions"><div class="acts">
          <button class="mini" onclick="openProspect('${p.id}')">Open</button>
          <button class="mini" onclick="promoteProspect('${p.id}')">→ Pipeline</button>
          <button class="mini danger" onclick="deleteProspect('${p.id}')">🗑</button>
        </div></td>
      </tr>`).join('') || '<tr><td colspan="6" class="empty">No prospects match these filters.</td></tr>'}
    </tbody>`;
  const cnt = document.getElementById('prospect-count');
  if (cnt) cnt.textContent = rows.length + ' of ' + S.prospects.length;
}

function addProspect() {
  const name = document.getElementById('pf-name').value.trim();
  if (!name) return alert('Prospect needs a business name.');
  const web = document.getElementById('pf-web').value;
  S.prospects.unshift({
    id: uid(), businessName: name,
    industry: document.getElementById('pf-industry').value.trim() || '—',
    location: document.getElementById('pf-location').value.trim() || '—',
    websiteUrl: '', websiteStatus: web, websiteScore: 0, mobileScore: 0, seoScore: 0, designScore: 0,
    sourceTool: document.getElementById('pf-source').value,
    opportunityLevel: document.getElementById('pf-opp').value,
    pipelineStatus: 'New Prospect',
    recommendedAction: document.getElementById('pf-notes').value.trim() || 'Research + first call',
    contactName: '', phone: document.getElementById('pf-phone').value.trim(), email: '',
    socialLinks: {}, lastChecked: todayStr(), nextFollowUp: '', notes: '',
  });
  ['pf-name', 'pf-industry', 'pf-location', 'pf-phone', 'pf-notes'].forEach(i => document.getElementById(i).value = '');
  toggleForm('prospect-form', false);
  save();
  // Write through to Notion (source of truth) and keep the page id.
  const rec = S.prospects[0];
  if (window.notionService && notionService.createProspect) {
    notionService.createProspect(rec).then(res => {
      if (res && res.ok) { rec.notionId = res.id || ''; rec.notionUrl = res.url || ''; toast('“' + rec.businessName + '” saved to Notion ✓'); save(); }
      else { toast('“' + rec.businessName + '” added · Notion: ' + ((res && res.reason) || 'not saved'), true); }
    });
  }
}

function scoreBar(label, val) {
  var col = val < 45 ? 'var(--red)' : val < 65 ? 'var(--yellow)' : 'var(--green)';
  return `<div style="margin-bottom:8px;">
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-3);margin-bottom:3px;"><span>${label}</span><span style="font-variant-numeric:tabular-nums;">${val}</span></div>
    <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${Math.max(2, val)}%;background:${col};"></div></div>
  </div>`;
}

// Normalize any user/scraped URL into a safe absolute https link.
function siteUrl(u) { u = String(u || '').trim().replace(/^https?:\/\//i, ''); return u ? 'https://' + u : ''; }
function callProspect(id) { const p = S.prospects.find(x => x.id === id); if (!p) return; if (!p.phone) { const n = prompt('Add a phone number for ' + p.businessName + ':', ''); if (n && n.trim()) { p.phone = n.trim(); save(); pushProspectToNotion(p); } else return; } window.location.href = 'tel:' + p.phone; }
function addPhone(id) { const p = S.prospects.find(x => x.id === id); if (!p) return; const n = prompt('Phone number for ' + p.businessName + ':', p.phone || ''); if (n !== null) { p.phone = n.trim(); save(); pushProspectToNotion(p); openProspect(id); } }
function pushProspectToNotion(p) { if (p.notionId && window.notionService) notionService.updateProspect(p.notionId, { phone: p.phone }); }
function deleteProspect(id) {
  const p = S.prospects.find(x => x.id === id);
  if (p && confirm('Delete "' + p.businessName + '" from prospects? This cannot be undone.')) {
    S.prospects = S.prospects.filter(x => x.id !== id); save(); closePanel(); toast('Deleted “' + p.businessName + '”');
  }
}

function openProspect(id) {
  const p = S.prospects.find(x => x.id === id);
  if (!p) return;
  const url = siteUrl(p.websiteUrl);
  openPanel(`
    <div class="panel-title">${esc(p.businessName)}</div>
    <div class="panel-sub">${esc(p.industry)} · ${esc(p.location)} · via ${esc(p.sourceTool)}</div>

    <div style="display:flex;gap:9px;flex-wrap:wrap;margin:14px 0 18px;">
      ${p.phone
        ? `<a class="btn btn-gold btn-sm" href="tel:${esc(p.phone)}">☎ ${esc(p.phone)}</a>`
        : `<button class="btn btn-gold btn-sm" onclick="addPhone('${p.id}')">☎ Add phone</button>`}
      ${url ? `<a class="btn btn-ghost btn-sm" href="${esc(url)}" target="_blank" rel="noopener">🌐 Visit website ↗</a>` : ''}
      ${p.email ? `<a class="btn btn-ghost btn-sm" href="mailto:${esc(p.email)}">✉ Email</a>` : ''}
    </div>

    <div class="panel-kv">
      <div><div class="kv-k">Opportunity</div><div class="kv-v">${badge(p.opportunityLevel)}</div></div>
      <div><div class="kv-k">Est. Value</div><div class="kv-v" style="color:var(--gold-light);">${typeof estimateProjectValue === 'function' ? money(estimateProjectValue(p).total) : '—'}</div></div>
      <div><div class="kv-k">Pipeline</div><div class="kv-v">${badge(p.pipelineStatus)}</div></div>
      <div><div class="kv-k">Website</div><div class="kv-v">${url ? `<a href="${esc(url)}" target="_blank" rel="noopener" style="color:var(--gold);">${esc(p.websiteUrl)} ↗</a>` : esc(p.websiteStatus)}</div></div>
      <div><div class="kv-k">Score</div><div class="kv-v">${p.websiteScore}/100</div></div>
      <div><div class="kv-k">Next Follow-Up</div><div class="kv-v">${esc(p.nextFollowUp || '—')}</div></div>
    </div>

    <div class="kv-k" style="margin:14px 0 6px;">Recommended Action</div>
    <div style="font-size:13px;color:var(--text);line-height:1.6;margin-bottom:${p.notes ? '8px' : '16px'};">${esc(p.recommendedAction)}</div>
    ${p.notes ? `<div class="kv-k" style="margin-bottom:6px;">Notes</div><div style="font-size:12.5px;color:var(--text-2);line-height:1.6;margin-bottom:16px;">${esc(p.notes)}</div>` : ''}

    <div style="display:flex;flex-direction:column;gap:9px;">
      <button class="btn btn-gold" onclick="renderWebsiteIntelligence('${p.id}')">◍ Website Intelligence — brief, value &amp; build</button>
      <button class="btn btn-gold" onclick="promoteProspect('${p.id}');closePanel();">→ Move to Pipeline (start selling)</button>
      <button class="btn btn-ghost" onclick="hookScheduleFollowUp('${p.id}')">📅 Schedule Follow-Up</button>
      <button class="btn btn-ghost" onclick="hookOutreachMessage('${p.id}')">✉ Outreach Message</button>
      <button class="btn btn-ghost" onclick="editProspect('${p.id}')">✎ Edit details</button>
      <button class="btn btn-ghost" style="color:var(--red);" onclick="deleteProspect('${p.id}')">🗑 Delete prospect</button>
    </div>`);
}

/* ── Placeholder action hooks — Phase 2 wires each to a real tool ──
   Each keeps the UI functional now (updates local state) and carries a
   clear comment for where the API call goes. No keys client-side. */
function hookRunAudit(id) {
  const p = S.prospects.find(x => x.id === id); if (!p) return;
  // PHASE 2: POST /.netlify/functions/audit { url } → Firecrawl + PageSpeed
  //          returns { websiteScore, mobileScore, seoScore, designScore, findings }
  alert('Run Audit — Phase 2 hook.\n\nWill call a Firecrawl + PageSpeed audit and fill the scores for ' + p.businessName + ' automatically. For now, use “Edit details” to enter scores by hand.');
  if (p.pipelineStatus === 'New Prospect') { p.pipelineStatus = 'Website Audit'; p.lastChecked = todayStr(); save(); openProspect(id); }
}
function hookBuildConcept(id) {
  const p = S.prospects.find(x => x.id === id); if (!p) return;
  // PHASE 2: POST /.netlify/functions/sitedrop-concept { businessName, industry }
  alert('Build SiteDrop Concept — Phase 2 hook.\n\nWill kick off a SiteDrop concept build for ' + p.businessName + ' and attach the preview link here.');
  p.pipelineStatus = 'Concept Ready'; save(); openProspect(id);
}
function hookMoveToCRM(id) {
  const p = S.prospects.find(x => x.id === id); if (!p) return;
  // PHASE 2: POST /.netlify/functions/crm-upsert { prospect } → HighLevel
  alert('Move to CRM — Phase 2 hook.\n\nWill push ' + p.businessName + ' into HighLevel and start an outreach sequence. For now it also drops into your Pipeline.');
  promoteProspect(id); closePanel();
}
function hookMarkContacted(id) {
  const p = S.prospects.find(x => x.id === id); if (!p) return;
  p.pipelineStatus = 'Contacted'; p.lastChecked = todayStr();
  S.callLog.push({ ts: Date.now(), leadId: id, name: p.businessName, outcome: 'Contacted (prospect)' });
  save(); openProspect(id);
}
function hookScheduleFollowUp(id) {
  const p = S.prospects.find(x => x.id === id); if (!p) return;
  const when = prompt('Follow-up when? (e.g. "Jul 9")', p.nextFollowUp || 'Jul 9');
  if (when === null) return;
  p.nextFollowUp = when.trim(); if (p.pipelineStatus === 'Contacted') p.pipelineStatus = 'Follow-Up';
  // PHASE 2: also create a Google Calendar event via secure backend
  S.tasks.todo.unshift({ id: uid(), title: 'Follow up — ' + p.businessName, client: 'Outreach', priority: 'medium', due: p.nextFollowUp || 'TBD' });
  save(); openProspect(id);
}
function hookOutreachMessage(id) {
  const p = S.prospects.find(x => x.id === id); if (!p) return;
  // PHASE 2: call an LLM (Claude/ChatGPT) via backend to draft tailored copy.
  const msg =
`Hi${p.contactName ? ' ' + p.contactName : ''} — this is Jonathan with Elite Prodigy Media on the Gulf Coast.\n\n` +
`I came across ${p.businessName} while looking at ${p.industry.toLowerCase()} businesses around ${p.location}. ` +
`${p.websiteStatus === 'No website found'
  ? "I noticed you don't have a website yet — that's likely sending customers to competitors who do."
  : 'I took a look at your site and saw a few quick wins (' + p.websiteStatus.toLowerCase() + ') that are probably costing you calls.'}\n\n` +
`We build clean, mobile-ready 5-page sites for local businesses — flat $1,000, live in 48–72 hours. ` +
`I can text you a working preview built just for ${p.businessName}. Worth a look?\n\n— Jonathan · 251.223.0812`;
  openPanel(`
    <div class="panel-title">Outreach Draft</div>
    <div class="panel-sub">${esc(p.businessName)} · edit before sending (Phase 2 tailors this via AI)</div>
    <textarea id="outreach-text" style="width:100%;min-height:280px;line-height:1.6;">${esc(msg)}</textarea>
    <div style="display:flex;gap:9px;margin-top:12px;">
      <button class="btn btn-gold" onclick="copyOutreach()">Copy</button>
      <button class="btn btn-ghost" onclick="openProspect('${p.id}')">← Back</button>
    </div>`);
}
function copyOutreach() {
  const t = document.getElementById('outreach-text');
  if (!t) return;
  t.select();
  navigator.clipboard && navigator.clipboard.writeText(t.value).then(
    () => { const b = event.target; const o = b.textContent; b.textContent = 'Copied ✓'; setTimeout(() => b.textContent = o, 1400); },
    () => alert('Select the text and copy manually.')
  );
}

function editProspect(id) {
  const p = S.prospects.find(x => x.id === id);
  if (!p) return;
  const contact = prompt('Contact name:', p.contactName || ''); if (contact !== null) p.contactName = contact.trim();
  const phone = prompt('Phone:', p.phone || ''); if (phone !== null) p.phone = phone.trim();
  const email = prompt('Email:', p.email || ''); if (email !== null) p.email = email.trim();
  const site = prompt('Website URL:', p.websiteUrl || ''); if (site !== null) p.websiteUrl = site.trim().replace(/^https?:\/\//, '');
  const ws = prompt('Overall website score (0–100):', p.websiteScore); if (ws !== null && !isNaN(Number(ws))) p.websiteScore = Number(ws);
  const ms = prompt('Mobile score (0–100):', p.mobileScore); if (ms !== null && !isNaN(Number(ms))) p.mobileScore = Number(ms);
  const ss = prompt('SEO score (0–100):', p.seoScore); if (ss !== null && !isNaN(Number(ss))) p.seoScore = Number(ss);
  const ds = prompt('Design score (0–100):', p.designScore); if (ds !== null && !isNaN(Number(ds))) p.designScore = Number(ds);
  const act = prompt('Recommended action:', p.recommendedAction || ''); if (act !== null) p.recommendedAction = act.trim();
  const notes = prompt('Notes:', p.notes || ''); if (notes !== null) p.notes = notes.trim();
  // keep opportunityLevel honest to the score if user changed it
  p.opportunityLevel = p.websiteScore < 45 ? 'High' : p.websiteScore < 65 ? 'Medium' : 'Low';
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
    id: uid(), name: p.businessName, contact: p.contactName || '', phone: p.phone || '',
    industry: p.industry, value: 1000, stage: 'Lead',
    notes: (p.websiteStatus ? p.websiteStatus + '. ' : '') + (p.recommendedAction || ''),
    next: 'First call', notionId: p.notionId || '', // carry the Notion page so calls write back
  });
  p.pipelineStatus = 'Contacted';
  save();
  alert(p.businessName + ' added to Pipeline + Call Mode queue.');
}

/* ═══ INTELLIGENCE CENTER — the prospecting hub ═══
   Answers: "Who should EP Media reach out to next?" */
function opportunityBand(score) {
  const b = mockData.opportunityScores.bands;
  for (let i = 0; i < b.length; i++) if (score <= b[i].max) return b[i];
  return b[b.length - 1];
}
function topProspects(n) {
  return S.prospects
    .filter(p => !['Won', 'Not Fit'].includes(p.pipelineStatus))
    .sort((a, b) => a.websiteScore - b.websiteScore) // lowest score = biggest opportunity
    .slice(0, n || 5);
}

function renderIntelligenceCenter() {
  // Daily lead report
  const dr = document.getElementById('daily-report');
  if (dr) {
    const active = S.prospects.filter(p => !['Won', 'Not Fit'].includes(p.pipelineStatus));
    const high = active.filter(p => p.opportunityLevel === 'High');
    const dueToday = active.filter(p => p.nextFollowUp && p.nextFollowUp !== '').length;
    const rep = mockData.dailyLeadReport;
    dr.innerHTML = `
      <div class="grid cols-4" style="margin-bottom:14px;">
        <div class="stat-tile" style="padding:14px;"><div class="stat-num">${active.length}</div><div class="stat-label">Active Prospects</div></div>
        <div class="stat-tile" style="padding:14px;"><div class="stat-num">${high.length}</div><div class="stat-label">High Opportunity</div></div>
        <div class="stat-tile" style="padding:14px;"><div class="stat-num">${mockData.prospectAudits.length}</div><div class="stat-label">Audits On File</div></div>
        <div class="stat-tile" style="padding:14px;"><div class="stat-num">${dueToday}</div><div class="stat-label">Follow-Ups Set</div></div>
      </div>
      <div class="row-sub" style="margin-bottom:12px;">${esc(rep.note)} Goal: <b style="color:var(--gold-light);">${rep.goalCalls} calls</b> · <b style="color:var(--gold-light);">${rep.goalConcepts} concepts</b> today.</div>
      <div class="kv-k" style="margin-bottom:8px;">Call these first (lowest web score = biggest opportunity)</div>
      ${topProspects(5).map(p => `
        <div class="row">
          <div class="row-main"><div class="row-title" style="cursor:pointer;" onclick="goSection('prospects');openProspect('${p.id}')">${esc(p.businessName)}</div><div class="row-sub">${esc(p.industry)} · ${esc(p.location)} · ${esc(p.recommendedAction)}</div></div>
          <div class="row-end">${badge(p.opportunityLevel)}<span class="badge b-dim" style="font-variant-numeric:tabular-nums;">${p.websiteScore}</span></div>
        </div>`).join('')}`;
  }

  // Opportunity scoring rubric
  const os = document.getElementById('scoring-rubric');
  if (os) {
    const w = mockData.opportunityScores.weights;
    os.innerHTML = `
      <div class="row-sub" style="margin-bottom:12px;">${esc(mockData.opportunityScores.note)}</div>
      <div class="kv-k" style="margin-bottom:6px;">Weights → overall score</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
        <span class="chip" style="cursor:default;">Website ${Math.round(w.website*100)}%</span>
        <span class="chip" style="cursor:default;">Mobile ${Math.round(w.mobile*100)}%</span>
        <span class="chip" style="cursor:default;">SEO ${Math.round(w.seo*100)}%</span>
        <span class="chip" style="cursor:default;">Design ${Math.round(w.design*100)}%</span>
      </div>
      ${mockData.opportunityScores.bands.map(b => `
        <div class="row">
          <div class="row-main"><div class="row-title">${badge(b.level)} <span style="color:var(--text-3);font-size:12px;">score ≤ ${b.max}</span></div><div class="row-sub">${esc(b.action)}</div></div>
        </div>`).join('')}`;
  }

  // Lead source tracker
  const ls = document.getElementById('lead-sources');
  if (ls) {
    // recompute counts live from working prospects
    const live = {};
    S.prospects.forEach(p => { live[p.sourceTool] = (live[p.sourceTool] || 0) + 1; });
    ls.innerHTML = mockData.leadSources.map(s => `
      <div class="row">
        <div class="row-main"><div class="row-title">${esc(s.tool)} <span style="font-variant-numeric:tabular-nums;color:var(--gold-light);">· ${live[s.tool] || 0}</span></div><div class="row-sub">${esc(s.role)} — ${esc(s.note)}</div></div>
        ${badge(s.connected)}
      </div>`).join('');
  }

  // Automation health
  const ah = document.getElementById('automation-health');
  if (ah) {
    ah.innerHTML = mockData.automationHealth.map(a => `
      <div class="row">
        <div class="row-main"><div class="row-title">${esc(a.name)}</div><div class="row-sub">${esc(a.note)} · last run: ${esc(a.lastRun)}</div></div>
        ${badge(a.status)}
      </div>`).join('');
  }

  // Recent audits
  const au = document.getElementById('recent-audits');
  if (au) {
    au.innerHTML = mockData.prospectAudits.map(a => `
      <div class="row">
        <div class="row-main"><div class="row-title">${esc(a.businessName)} <span style="color:var(--text-3);font-size:11px;">· ${esc(a.date)}</span></div><div class="row-sub">${a.findings.map(esc).join(' · ')}</div></div>
        <div class="row-end"><span class="badge ${opportunityBand(a.overall).cls === 'good' ? 'b-good' : opportunityBand(a.overall).cls === 'warn' ? 'b-warn' : 'b-info'}" style="font-variant-numeric:tabular-nums;">${a.overall}/100</span></div>
      </div>`).join('');
  }
}

/* ═══════════════════════════════════════════════════════════════
   SPRINT 3 — FIRECRAWL INTELLIGENCE (prospect-pool pipeline · MOCK)
   Discover → Website Intelligence → Opportunity Score → Prospects →
   Call Queue.  No-website businesses first. Runs on mock data via
   services/firecrawl.js until FIRECRAWL_LIVE=true. No live enrichment
   or messaging happens here.
═══════════════════════════════════════════════════════════════ */

// One rubric for the whole dashboard: audit signals → opportunity.
// Lower overall score = bigger opportunity for EP Media.
function computeOpportunity(audit) {
  if (!audit || audit.hasWebsite === false) {
    return { overall: 10, level: 'High', cls: 'good', websiteStatus: 'No website found' };
  }
  const overall = Math.round((audit.mobile || 0) * 0.35 + (audit.seo || 0) * 0.30 + (audit.design || 0) * 0.35);
  const band = opportunityBand(overall); // High ≤45 · Medium ≤65 · Low >65
  const status = overall < 45 ? 'Poor website' : overall < 65 ? 'Outdated website' : 'Good website / low priority';
  return { overall, level: band.level, cls: band.cls, websiteStatus: status };
}

let discoveryResults = [];
const discoveryPicker = { industry: 'All', location: 'All' };

// Full EP target verticals + Gulf Coast markets for LIVE discovery (the mock
// pool only covers a few; live search should reach every target industry/city).
const TARGET_INDUSTRIES = [
  'Landscaping', 'Lawn Care', 'Pressure Washing', 'Window Cleaning', 'Roofing', 'Concrete',
  'Fence Companies', 'Tree Service', 'Auto Detailing', 'Barber', 'Hair Studio', 'Gym',
  'Chiropractor', 'Restaurant', 'Realtor', 'HVAC', 'Electrician', 'Pest Control', 'Fishing Charter',
];
const TARGET_CITIES = [
  'Gulf Shores, AL', 'Orange Beach, AL', 'Foley, AL', 'Daphne, AL', 'Fairhope, AL',
  'Spanish Fort, AL', 'Robertsdale, AL', 'Mobile, AL', 'Perdido Key, FL',
];

function discoveryEngineLabel() {
  const svc = window.firecrawlService;
  if (svc && svc.status && svc.status.discover === 'connected') return '<span class="badge b-good">LIVE — Firecrawl</span>';
  return '<span class="badge b-warn">MOCK MODE — test data, no live calls</span>';
}

function renderDiscoveryControls() {
  const el = document.getElementById('discovery-controls');
  if (!el) return;
  // Union of target verticals/markets with anything already in the pool.
  const inds = ['All', ...Array.from(new Set([...TARGET_INDUSTRIES, ...(mockData.discoveryPool || []).map(b => b.industry)]))];
  const locs = ['All', ...Array.from(new Set([...TARGET_CITIES, ...(mockData.discoveryPool || []).map(b => b.location)]))];
  el.innerHTML = `
    <div class="disc-bar">
      <label class="disc-field"><span>Industry</span>
        <select id="disc-industry" onchange="discoveryPicker.industry=this.value">${inds.map(i => `<option ${i === discoveryPicker.industry ? 'selected' : ''}>${esc(i)}</option>`).join('')}</select>
      </label>
      <label class="disc-field"><span>Location</span>
        <select id="disc-location" onchange="discoveryPicker.location=this.value">${locs.map(l => `<option ${l === discoveryPicker.location ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
      </label>
      <button class="btn btn-gold" onclick="runDiscovery()">⌕ Run Discovery <span style="opacity:.7;">(test)</span></button>
      <span style="margin-left:auto;">${discoveryEngineLabel()}</span>
    </div>`;
}

async function runDiscovery() {
  const el = document.getElementById('discovery-results');
  if (el) el.innerHTML = '<div class="empty">Searching ' + esc(discoveryPicker.industry) + ' in ' + esc(discoveryPicker.location) + '…</div>';
  const svc = window.firecrawlService;
  let candidates = [];
  try {
    candidates = svc ? await svc.discover(discoveryPicker.industry, discoveryPicker.location) : [];
  } catch (e) { candidates = []; }
  // Attach live-run state (audit + added) without mutating the source pool.
  discoveryResults = candidates.map(c => Object.assign({}, c, { audit: null, added: false }));
  renderDiscoveryControls();
  renderDiscovery();
}

function renderDiscovery() {
  const el = document.getElementById('discovery-results');
  if (!el) return;
  // Once a business is added (or already a prospect), drop it from this list.
  const list = discoveryResults.filter(c => !c.added && !S.prospects.some(p => p.businessName === c.businessName));
  if (!list.length) {
    el.innerHTML = discoveryResults.length
      ? '<div class="empty">All discovered businesses added to Prospects ✓ — run another search to find more.</div>'
      : '<div class="empty">Pick an industry + location and press <b>Run Discovery</b>. No-website businesses surface first — those are the strongest opportunities.</div>';
    renderCallQueue();
    return;
  }
  el.innerHTML = list.map(c => {
    const a = c.audit;
    const opp = a ? computeOpportunity(a) : null;
    const inProspects = S.prospects.some(p => p.businessName === c.businessName);
    return `
      <div class="disc-card ${!c.hasWebsite ? 'no-site' : ''}">
        <div class="disc-top">
          <div>
            <div class="disc-name">${esc(c.businessName)}</div>
            <div class="disc-sub">${esc(c.industry)} · ${esc(c.location)} · via ${esc(c.source)} · ★ ${c.rating || '—'} (${c.reviews || 0})</div>
          </div>
          ${c.hasWebsite
            ? `<span class="badge b-info">Has site</span>`
            : `<span class="badge b-gold">NO WEBSITE</span>`}
        </div>
        <div class="disc-signal">${esc(c.signal)}</div>
        ${c.enrich ? `<div class="disc-enrich">${[
          c.enrich.phone ? '☎ ' + esc(c.enrich.phone) : '',
          c.enrich.email ? '✉ ' + esc(c.enrich.email) : '',
          c.enrich.facebook ? '<span>ⓕ FB</span>' : '',
          c.enrich.instagram ? '<span>IG</span>' : '',
          c.enrich.gbpUrl ? '<span>Google</span>' : '',
          (c.rating ? '★ ' + c.rating : ''),
        ].filter(Boolean).join(' · ')}</div>` : ''}
        ${a ? `
          <div class="disc-audit">
            ${scoreBar('Overall opportunity score', opp.overall)}
            <div class="disc-scorerow">
              <span>Grade <b>${esc(a.grade)}</b></span>
              <span>Mobile ${a.mobile}</span>
              <span>SEO ${a.seo}</span>
              <span>Design ${a.design}</span>
              ${badge(opp.level)}
            </div>
            <ul class="disc-findings">${a.findings.map(f => '<li>' + esc(f) + '</li>').join('')}</ul>
          </div>` : ''}
        <div class="disc-acts">
          ${!a ? `<button class="btn btn-ghost btn-sm" onclick="auditCandidate('${c.id}')">◍ Run Website Intelligence</button>` : ''}
          ${inProspects
            ? `<span class="badge b-good">✓ In Prospects</span>`
            : `<button class="btn btn-gold btn-sm" onclick="addCandidateToProspects('${c.id}')">→ Add to Prospects</button>`}
        </div>
      </div>`;
  }).join('');
  renderCallQueue();
}

// Website Intelligence + enrichment together — one click fills the whole record.
async function auditCandidate(id) {
  const c = discoveryResults.find(x => x.id === id);
  if (!c) return;
  const svc = window.firecrawlService;
  const [audit, enr] = await Promise.all([
    svc ? svc.audit(c) : Promise.resolve(null),
    svc ? svc.enrich(c) : Promise.resolve({}),
  ]);
  c.audit = audit; c.enrich = enr;
  if (enr) { if (enr.rating != null) c.rating = enr.rating; if (enr.reviews) c.reviews = enr.reviews; }
  renderDiscovery();
}

// Build a fully enriched prospect (no manual entry) and auto-create the Notion
// CRM record. Website Intelligence then consumes this record as-is.
async function addCandidateToProspects(id) {
  const c = discoveryResults.find(x => x.id === id);
  if (!c) return;
  if (S.prospects.some(p => p.businessName === c.businessName)) { renderDiscovery(); return; }
  c.added = true; renderDiscovery(); toast('Adding “' + c.businessName + '”…'); // instant: drop it from the list now
  const svc = window.firecrawlService;
  const [audit, enr] = await Promise.all([
    c.audit ? Promise.resolve(c.audit) : (svc ? svc.audit(c) : Promise.resolve(null)),
    c.enrich ? Promise.resolve(c.enrich) : (svc ? svc.enrich(c) : Promise.resolve({})),
  ]);
  c.audit = audit; c.enrich = enr || {};
  const opp = computeOpportunity(audit);
  const loc = String(c.location || '').split(',');
  const record = {
    id: uid(), businessName: c.businessName, industry: c.industry, location: c.location,
    city: (loc[0] || '').trim(), state: (loc[1] || '').trim(),
    websiteUrl: c.websiteUrl || '', websiteStatus: opp.websiteStatus,
    websiteScore: opp.overall, opportunityScore: opp.overall,
    mobileScore: audit ? (audit.mobile || 0) : 0,
    seoScore: audit ? (audit.seo || 0) : 0,
    designScore: audit ? (audit.design || 0) : 0,
    sourceTool: c.source === 'Google' ? 'Google Maps' : c.source,
    opportunityLevel: opp.level, pipelineStatus: 'Website Audit',
    recommendedAction: c.hasWebsite ? 'Audit done — prep a before/after and call' : 'Build a SiteDrop concept, then cold call — they have no site at all',
    contactName: '', phone: c.enrich.phone || c.phone || '', email: c.enrich.email || '',
    socialLinks: { facebook: c.enrich.facebook || '', instagram: c.enrich.instagram || '' },
    address: c.enrich.address || '', category: c.enrich.category || c.industry,
    gbpUrl: c.enrich.gbpUrl || '', logoUrl: c.enrich.logoUrl || '', photos: c.enrich.photos || [],
    rating: (c.enrich.rating != null ? c.enrich.rating : c.rating) || null, reviews: c.enrich.reviews || c.reviews || 0,
    lastChecked: todayStr(), nextFollowUp: '', notionUrl: '',
    notes: c.signal + ' (discovered via ' + c.source + ')',
  };
  S.prospects.unshift(record);
  c.added = true;
  save(); // persists + re-renders everything

  // Auto-create the Notion CRM record — no re-entry. Non-blocking.
  if (window.notionService && notionService.createProspect) {
    notionService.createProspect(record).then(res => {
      if (res && res.ok) { record.notionId = res.id || ''; record.notionUrl = res.url || ''; toast('“' + record.businessName + '” saved to Notion CRM ✓'); save(); }
      else { toast('“' + record.businessName + '” added · Notion: ' + ((res && res.reason) || 'not saved'), true); }
    });
  }
}

// ── Call Queue: prospects ready to dial, ranked by opportunity ──
function callQueueProspects() {
  return S.prospects
    .filter(p => !['Won', 'Not Fit'].includes(p.pipelineStatus))
    .filter(p => !S.leads.some(l => l.name === p.businessName)) // not already in pipeline
    .sort((a, b) => a.websiteScore - b.websiteScore) // lowest = biggest opportunity, no-website first
    .slice(0, 8);
}
function renderCallQueue() {
  const el = document.getElementById('call-queue-list');
  if (!el) return;
  const q = callQueueProspects();
  el.innerHTML = q.length ? q.map(p => `
    <div class="row">
      <div class="row-main">
        <div class="row-title" style="cursor:pointer;" onclick="goSection('prospects');openProspect('${p.id}')">${esc(p.businessName)} ${p.websiteStatus === 'No website found' ? '<span class="badge b-gold">NO SITE</span>' : ''}</div>
        <div class="row-sub">${esc(p.industry)} · ${esc(p.location)} · ${esc(p.recommendedAction)}</div>
      </div>
      <div class="row-end">
        ${badge(p.opportunityLevel)}<span class="badge b-dim" style="font-variant-numeric:tabular-nums;">${p.websiteScore}</span>
        ${p.phone ? `<a class="mini" href="tel:${esc(p.phone)}">☎</a>` : ''}
        <button class="mini" onclick="promoteProspect('${p.id}')">→ Call Mode</button>
      </div>
    </div>`).join('') : '<div class="empty">Add discovered businesses to Prospects and they queue here, hottest first. Your daily targets are live above.</div>';
  const cnt = document.getElementById('call-queue-count');
  if (cnt) cnt.textContent = q.length + ' ready';
  if (typeof renderCallQueueStats === 'function') renderCallQueueStats();
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
// Agents a task can be handed off to (name → where it opens + what it does).
const TASK_AGENTS = {
  'Claude Code': { url: 'https://claude.ai/code',        icon: '⌘',  how: 'builds/fixes/deploys sites on GitHub + Netlify' },
  'ChatGPT':     { url: 'https://chatgpt.com',           icon: '🧠', how: 'strategy, sales angles, copy, planning' },
  'Claude':      { url: 'https://claude.ai',             icon: '✦',  how: 'writing, analysis, client communication' },
  'Manus':       { url: 'https://manus.im',              icon: '◇',  how: 'ops, research runs, workflow reporting' },
  'Apollo':      { url: 'https://app.apollo.io',         icon: '◎',  how: 'lead lists + contact enrichment' },
  'Firecrawl':   { url: 'https://www.firecrawl.dev/app', icon: '🔥', how: 'website audits + scraping' },
};
function findTask(id) { for (const c of ['todo', 'inprogress', 'done']) { const t = S.tasks[c].find(x => x.id === id); if (t) return { t, col: c }; } return {}; }
function assignTask(id, agent) { const { t } = findTask(id); if (!t) return; t.agent = agent || ''; save(); }
// Hand the task off to its agent: build a brief, copy it, and open the agent.
function runTask(id) {
  const { t, col } = findTask(id); if (!t) return;
  if (!t.agent) t.agent = 'Claude Code';
  const a = TASK_AGENTS[t.agent] || TASK_AGENTS['Claude Code'];
  const brief =
`EP MEDIA — task assignment for ${t.agent}

Task: ${t.title}
Client: ${t.client || 'Internal'}
Priority: ${t.priority} · Due: ${t.due}
Agent role: ${a.how}

Please carry this out and report back. This is an Elite Prodigy Media operations
task handed off from the EP Command Center.`;
  if (navigator.clipboard) navigator.clipboard.writeText(brief).catch(() => {});
  try { window.open(a.url, '_blank', 'noopener'); } catch (e) { /* popup blocked */ }
  if (col === 'todo') moveTask('todo', id, 'inprogress'); // now in progress with the agent
  else save();
  toast('Handed “' + t.title + '” to ' + t.agent + ' ✓  (brief copied — paste it in)');
}

function renderTasks() {
  const el = document.getElementById('task-board');
  if (!el) return;
  const cols = [
    { key: 'todo', label: 'To Do', next: 'inprogress', nextLabel: 'Start ▶' },
    { key: 'inprogress', label: 'In Progress', next: 'done', nextLabel: 'Done ✓' },
    { key: 'done', label: 'Done', next: null },
  ];
  const agentOpts = t => Object.keys(TASK_AGENTS).map(a => `<option ${t.agent === a ? 'selected' : ''}>${a}</option>`).join('');
  el.innerHTML = cols.map(col => `
    <div class="pipe-col">
      <div class="pipe-head">${col.label}<span class="count">${S.tasks[col.key].length}</span></div>
      ${S.tasks[col.key].map(t => `
        <div class="pipe-card">
          <div style="font-size:13px;font-weight:500;">${esc(t.title)}</div>
          <div style="font-size:11px;color:var(--text-3);margin-top:4px;">${esc(t.client)} · due ${esc(t.due)} · ${badge(t.priority)}${t.agent ? ` · <span style="color:var(--gold-light);">${TASK_AGENTS[t.agent] ? TASK_AGENTS[t.agent].icon : ''} ${esc(t.agent)}</span>` : ''}</div>
          <div class="acts">
            <select class="mini task-agent" onchange="assignTask('${t.id}',this.value)"><option value=""${!t.agent ? ' selected' : ''}>Assign agent…</option>${agentOpts(t)}</select>
            <button class="mini" style="color:var(--gold-light);" onclick="runTask('${t.id}')">⚡ Run</button>
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
    agent: (document.getElementById('nt-agent') || {}).value || '',
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
  intelligence: 'Intelligence <em>Center</em>', discovery: 'Prospect <em>Discovery</em>', agent: 'Sales <em>Agent</em>',
  pipeline: 'Client <em>Pipeline</em>', tasks: 'Task <em>Queue</em>', clients: 'Active <em>Clients</em>',
  deploys: 'Sites &amp; <em>Repos</em>', revenue: 'Revenue &amp; <em>Pricing</em>', aiteam: 'AI <em>Team</em>',
  growth: 'Growth <em>Stack</em>', integrations: 'Integrations <em>Map</em>', workforce: 'Agent <em>Workforce</em>',
  automations: 'Automation <em>Center</em>', knowledge: 'Knowledge <em>Center</em>', personal: 'Personal <em>Command</em>',
  datastatus: 'Integration <em>Status</em>',
  investor: 'Investor <em>Dashboard</em>', banking: 'Banking &amp; <em>Funding</em>',
};

function toggleNavGroup(btn) { const g = btn.closest('.nav-group'); if (g) g.classList.toggle('open'); }

function goSection(target) {
  document.querySelectorAll('.nav-link').forEach(n => n.classList.toggle('active', n.getAttribute('data-section') === target));
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById('section-' + target);
  if (sec) sec.classList.add('active');
  // Keep the active link's group expanded so the highlight is visible.
  const active = document.querySelector('.nav-link.active[data-section="' + target + '"]');
  const grp = active && active.closest ? active.closest('.nav-group') : null;
  if (grp) grp.classList.add('open');
  const t = document.getElementById('page-title');
  if (t) t.innerHTML = TITLES[target] || target;
  closeSidebar();
  closePanel(); // close any open slide panel so its backdrop can't block clicks
  if (typeof closeModal === 'function') closeModal();
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
  renderIntelligenceCenter();
  if (typeof renderSalesAgent === 'function') renderSalesAgent();
  renderDiscoveryControls();
  renderDiscovery();
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
  renderIntegrationStatus();
}

/* ═══ SPRINT 2 — DATA SERVICE BOOTSTRAP ═══
   All data flows through notionService. It returns mockData when Notion
   isn't configured (fallback), so behavior is identical until keys are
   set. When connected, Notion becomes the source of truth and the same
   render pipeline draws it — no render/UI changes. */
async function bootstrap() {
  renderAll(); // paint immediately with local/mock data
  if (!window.notionService) return;
  // Today's Meetings reads straight from the Notion Meetings DB (source of truth).
  if (notionService.getMeetings) {
    notionService.getMeetings().then(m => { if (Array.isArray(m)) { meetingsData = m; renderMissionControl(); } });
  }
  try {
    const [prospects, projects, tasks, ai, revenue, website] = await Promise.all([
      notionService.getProspects(),
      notionService.getProjects(),
      notionService.getTasks(),
      notionService.getAiWorkforce(),
      notionService.getRevenue(),
      notionService.getWebsiteIntelligence(),
    ]);
    const st = notionService.status;
    // Only overwrite when a source is actually live from Notion; fallback
    // keeps the editable local working state (S) and the mock reference data.
    if (st.projects === 'connected' && Array.isArray(projects)) mockData.clients = projects;
    if (st.ai === 'connected' && Array.isArray(ai)) mockData.agentWorkforce = ai;
    if (st.website === 'connected' && Array.isArray(website)) mockData.prospectAudits = website;
    if (st.revenue === 'connected' && revenue && revenue.pricing) mockData.pricing = revenue.pricing;
    if (st.prospects === 'connected' && Array.isArray(prospects)) S.prospects = prospects;
    if (st.tasks === 'connected' && tasks && tasks.todo) S.tasks = tasks;
    renderAll();
  } catch (e) {
    // stay on fallback; status panel will show it
  }
  renderIntegrationStatus();
}

function renderIntegrationStatus() {
  const svc = window.notionService;
  const overall = svc ? svc.overall() : 'fallback';
  const cls = { connected: 'ds-green', partial: 'ds-yellow', fallback: 'ds-yellow', error: 'ds-red' }[overall] || 'ds-yellow';
  const dot = document.getElementById('ds-dot');
  const lbl = document.getElementById('ds-label');
  if (dot) dot.className = 'ds-dot ' + cls;
  if (lbl) lbl.textContent = overall === 'connected' ? 'Notion' : overall === 'partial' ? 'Partial' : overall === 'error' ? 'API Error' : 'Mock Data';

  const list = document.getElementById('ds-list');
  if (list && svc) {
    const map = { connected: ['ds-green', 'Connected', 'Live from Notion'], fallback: ['ds-yellow', 'Fallback', 'Running on mock data'], error: ['ds-red', 'API Error', 'Notion call failed'] };
    list.innerHTML = Object.keys(svc.sourceLabels).map(k => {
      const s = svc.status[k] || 'fallback';
      const [c, label, desc] = map[s] || map.fallback;
      return `<div class="row">
        <div class="row-main"><div class="row-title"><span class="ds-dot ${c}"></span> ${esc(svc.sourceLabels[k])}</div><div class="row-sub">${desc}</div></div>
        <span class="badge ${c === 'ds-green' ? 'b-good' : c === 'ds-red' ? 'b-bad' : 'b-warn'}">${label}</span>
      </div>`;
    }).join('');
  }
  const ov = document.getElementById('ds-overall');
  if (ov) ov.textContent = overall === 'connected' ? 'All live' : overall === 'error' ? 'Error' : 'Fallback (mock data)';
}

document.addEventListener('DOMContentLoaded', () => {
  tickClock();
  setInterval(tickClock, 30000);
  initChrome();
  bootstrap();
  // Reflect the real Firecrawl env state in the MOCK/LIVE badge on load,
  // before any discovery run (no Firecrawl call is made by the probe).
  if (window.firecrawlService && firecrawlService.probeStatus) {
    firecrawlService.probeStatus().then(() => {
      renderDiscoveryControls();
      if (typeof renderCallQueueStats === 'function') renderCallQueueStats();
      if (typeof renderSalesAgent === 'function') renderSalesAgent();
    });
  }
});
