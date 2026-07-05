/* ═══════════════════════════════════════════════════════════════
   EP COMMAND CENTER — APP.JS
   Elite Prodigy Media Internal OS
   v2 — Operational: real data, editable pipeline/tasks, Call Mode.
   v2.1 — Added: Potential Clients, Calendar, Blockers, Next Actions,
           Agent Workforce, Automation Center, Integrations Map,
           Growth Stack, Knowledge Center, Personal Command,
           Investor Dashboard (placeholder), Banking Center (links).
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
    { name: 'EP Logo (Gold SVG)',        type: 'logo',  client: 'EPSG',           icon: '🏆', meta: 'SVG' },
    { name: '22Builds Chrome Logo',      type: 'logo',  client: '22 Builds',      icon: '🏗️', meta: 'JPG' },
    { name: 'Floor Plan Renders',        type: 'photo', client: '22 Builds',      icon: '🏠', meta: '19 files in repo' },
    { name: 'Renovation Interiors',      type: 'photo', client: '22 Builds',      icon: '📷', meta: '4 files in repo' },
    { name: 'Karate Class Photos',       type: 'photo', client: 'Wheeles Karate', icon: '🥋', meta: '4 files in repo' },
    { name: 'Metal & Mud Product Shots', type: 'photo', client: 'Metal & Mud',    icon: '🏺', meta: '9 files in repo' },
    { name: 'EP Media OS Docs',          type: 'doc',   client: 'Internal',       icon: '📄', meta: 'EP-Media-Agency repo' },
    { name: 'Client Registry',           type: 'doc',   client: 'Internal',       icon: '📋', meta: 'EP-Media-Agency repo' },
  ],

  pricing: [
    { name: 'Website — 5-Page Custom',   price: '$1,000',      detail: 'Mobile responsive · contact form · Google Maps · reviews · basic SEO · hosting setup · one revision · 48–72 hr delivery' },
    { name: 'Monthly Growth',            price: '$100/mo',     detail: 'Updates, edits, hosting management' },
    { name: 'Premium Growth',            price: '$250/mo',     detail: 'Growth plan + content refreshes + priority support' },
    { name: 'Brand: Team Starter',       price: 'from $500',   detail: 'Naming, logo, basic brand kit' },
    { name: 'Brand: Team Launch',        price: 'from $1,500', detail: 'Full identity + website + registration setup' },
    { name: 'Brand: Elite Org Buildout', price: 'from $3,500', detail: 'Complete organization launch: brand, site, ops' },
  ],

  industries: ['Roofers', 'HVAC', 'Landscaping', 'Realtors', 'Restaurants', 'Gyms', 'Sports orgs', 'Fishing charters', 'Auto detailing', 'Medical offices'],

  /* ── NEW v2.1 DATA ── */

  calendar: [
    { id: 'ev1', title: 'EP Summer Development Days',    date: 'Date TBD',    type: 'event',    client: 'EPSG',         note: 'LeagueApps registration open' },
    { id: 'ev2', title: 'Preseason Combine',             date: 'Date TBD',    type: 'event',    client: 'EPSG',         note: 'Athletes: combine evaluations' },
    { id: 'ev3', title: 'North vs South All-Star Game',  date: 'Date TBD',    type: 'event',    client: 'EPSG',         note: 'Selection-based — invite only' },
    { id: 'ev4', title: 'Follow up: Wheeles Karate',     date: 'Jul 7',       type: 'follow-up',client: 'EP Media',     note: 'Send demo link + pitch purchase' },
    { id: 'ev5', title: 'Follow up: Azalea Turf & Lawn', date: 'Jul 7',       type: 'follow-up',client: 'EP Media',     note: 'Demo live — close the sale' },
    { id: 'ev6', title: 'Follow up: 22 Builds',          date: 'Jul 7',       type: 'follow-up',client: 'EP Media',     note: 'Full site ready — close with Ryan' },
    { id: 'ev7', title: "Follow up: Head Loc'd",         date: 'Jul 7',       type: 'follow-up',client: 'EP Media',     note: 'Collect photos from Jay' },
    { id: 'ev8', title: 'Izaiah Walton profile launch',  date: 'TBD — awaiting data', type: 'milestone', client: 'EPSG', note: 'Need: position, school, grad yr, measurements, Hudl' },
    { id: 'ev9', title: 'EP Command Center → Netlify',   date: 'Jul 6',       type: 'task',     client: 'Internal',    note: 'Connect repo + enable password protection' },
  ],

  blockers: [
    { id: 'bl1', title: 'Izaiah Walton profile — missing combine data',  priority: 'high',   owner: 'Jonathan to provide', note: 'Need: position, school, grad year, height/weight, combine numbers, Hudl link' },
    { id: 'bl2', title: "Head Loc'd — Jay has not sent studio photos",   priority: 'high',   owner: 'Jay (client)',        note: 'Site is code-complete; photos are the last blocker' },
    { id: 'bl3', title: "Head Loc'd Netlify URL unconfirmed",            priority: 'medium', owner: 'Jonathan',            note: 'Confirm site is live and update tracker URL' },
    { id: 'bl4', title: 'Phone numbers for demo prospects',              priority: 'high',   owner: 'Research',            note: 'Need phones for: Azalea, Warren, Metal & Mud, 22 Builds, Wheeles Karate' },
    { id: 'bl5', title: 'Form notification emails not set up',           priority: 'high',   owner: 'Jonathan',            note: 'Netlify → each site → Forms → notifications' },
    { id: 'bl6', title: 'EP Command Center not yet on Netlify',          priority: 'medium', owner: 'Jonathan',            note: 'Connect repo + enable basic auth before sharing URL' },
  ],

  nextActions: [
    { id: 'na1', action: 'Call all 6 demo-built prospects today',                              due: 'Today',     priority: 'high',   context: 'Use Call Mode tab — scripts + outcome buttons ready' },
    { id: 'na2', action: 'Set up Netlify form notification emails for all client sites',       due: 'Today',     priority: 'high',   context: 'Netlify → each site → Forms → notifications → eliteprodigyway@gmail.com' },
    { id: 'na3', action: "Confirm Head Loc'd Netlify URL and send to Jay",                    due: 'Today',     priority: 'medium', context: 'Once confirmed, update the deployments list above' },
    { id: 'na4', action: 'Connect EP Command Center to Netlify + enable password protection', due: 'Today',     priority: 'high',   context: 'Do before sharing this dashboard URL with anyone' },
    { id: 'na5', action: 'Post EP Media work to @eliteprodigy_sg Instagram',                  due: 'This week', priority: 'medium', context: 'Show demo sites: before/after comparison, or finished builds' },
    { id: 'na6', action: 'Get Izaiah Walton combine data from Jonathan',                      due: 'This week', priority: 'medium', context: 'Profile is ready to launch once data is in hand' },
    { id: 'na7', action: 'Research 10 new local prospects for cold outreach',                 due: 'This week', priority: 'medium', context: 'Use Potential Clients tab — add to pipeline' },
    { id: 'na8', action: 'Send first Brand Development inquiry to a coach or local league',   due: 'This week', priority: 'low',    context: 'Brand Dev starts at $500 — target small youth sports organizations' },
  ],

  agentWorkforce: [
    { id: 'ag1', name: 'Claude Code',    role: 'Full-stack dev · site builds · dashboard · automation', status: 'active', platform: 'claude.ai/code',     usage: 'Daily',    tags: ['Code', 'Build', 'Strategy'] },
    { id: 'ag2', name: 'Claude Chat',    role: 'Copy · strategy · research · planning',                  status: 'active', platform: 'claude.ai',          usage: 'Daily',    tags: ['Copy', 'Strategy', 'Research'] },
    { id: 'ag3', name: 'ChatGPT',        role: 'SEO content · email drafts · alt research',              status: 'active', platform: 'chat.openai.com',    usage: 'Weekly',   tags: ['SEO', 'Email', 'Copy'] },
    { id: 'ag4', name: 'Higgsfield',     role: 'Cinematic video generation for hero sections',            status: 'active', platform: 'higgsfield.ai',      usage: 'On demand',tags: ['Video', 'Cinematic'] },
    { id: 'ag5', name: 'ElevenLabs',     role: 'Voiceover · audio branding · TTS',                       status: 'active', platform: 'elevenlabs.io',      usage: 'On demand',tags: ['Audio', 'Voice'] },
    { id: 'ag6', name: 'Canva AI',       role: 'Social graphics · brand templates · print',              status: 'active', platform: 'canva.com',          usage: 'Weekly',   tags: ['Design', 'Social'] },
    { id: 'ag7', name: 'Firecrawl',      role: 'Web scraping · competitor research · prospect data',     status: 'available', platform: 'firecrawl.dev',   usage: 'Research', tags: ['Research', 'Scraping'] },
    { id: 'ag8', name: 'Zapier Agent',   role: 'Workflow automation · form routing · notifications',     status: 'phase2', platform: 'zapier.com',        usage: 'Phase 2',  tags: ['Automation', 'Workflow'] },
  ],

  automations: [
    { id: 'au1', name: 'Netlify Form Notifications',   trigger: 'Form submission on any client site', action: 'Email notification → eliteprodigyway@gmail.com', status: 'setup-needed', platform: 'Netlify',          note: 'Enable per-site in Netlify dashboard' },
    { id: 'au2', name: 'GitHub → Netlify Auto-Deploy', trigger: 'Push to main branch on any repo',   action: 'Netlify build + deploy (< 2 min)',               status: 'live',          platform: 'Netlify + GitHub',  note: 'Live on all connected repos' },
    { id: 'au3', name: 'LeagueApps Event Registration',trigger: 'Parent submits LeagueApps form',    action: 'Confirmation email to parent',                   status: 'live',          platform: 'LeagueApps',        note: 'Handled by LeagueApps platform' },
    { id: 'au4', name: 'Zapier: Form → CRM',           trigger: 'New Netlify form submission',       action: 'Create lead in CRM / pipeline',                  status: 'phase2',        platform: 'Zapier',            note: 'Replaces manual pipeline entry in Phase 2' },
    { id: 'au5', name: 'Zapier: Email → Task',         trigger: 'Client email received',             action: 'Create task in command center',                  status: 'phase2',        platform: 'Zapier + Claude',   note: 'AI-assisted email triage in Phase 2' },
    { id: 'au6', name: 'GitHub Actions: CI/CD',        trigger: 'PR merge or push',                  action: 'Run build checks + deploy preview',              status: 'planned',       platform: 'GitHub Actions',    note: 'Add per repo as complexity grows' },
  ],

  integrationsMap: [
    { id: 'in1', name: 'Netlify',        type: 'Hosting / CI/CD',     status: 'connected', phase: 1, icon: '🚀', url: 'app.netlify.com' },
    { id: 'in2', name: 'GitHub',         type: 'Source Control',      status: 'connected', phase: 1, icon: '🐙', url: 'github.com/EliteProdigy1' },
    { id: 'in3', name: 'Google Forms',   type: 'Athlete / Event Forms',status: 'connected', phase: 1, icon: '📋', url: 'docs.google.com/forms' },
    { id: 'in4', name: 'LeagueApps',     type: 'Event Registration',  status: 'connected', phase: 1, icon: '🏅', url: 'eliteprodigy.leagueapps.com' },
    { id: 'in5', name: 'Venmo',          type: 'Payments',            status: 'connected', phase: 1, icon: '💳', url: 'venmo.com/eliteprodigy' },
    { id: 'in6', name: 'Cash App',       type: 'Payments',            status: 'connected', phase: 1, icon: '💵', url: 'cash.app/$ELITEPRODIGYLLC' },
    { id: 'in7', name: 'Zapier',         type: 'Workflow Automation', status: 'planned',   phase: 2, icon: '⚙️', url: 'zapier.com' },
    { id: 'in8', name: 'Claude API',     type: 'AI Automation',       status: 'planned',   phase: 2, icon: '🤖', url: 'api.anthropic.com' },
    { id: 'in9', name: 'Gmail API',      type: 'Email Triage',        status: 'planned',   phase: 2, icon: '📧', url: 'gmail.com' },
    { id:'in10', name: 'Google Calendar',type: 'Calendar Sync',       status: 'planned',   phase: 2, icon: '📅', url: 'calendar.google.com' },
    { id:'in11', name: 'Stripe',         type: 'Online Payments',     status: 'planned',   phase: 2, icon: '💰', url: 'stripe.com' },
    { id:'in12', name: 'Apollo.io',      type: 'Lead Intelligence',   status: 'planned',   phase: 2, icon: '🔍', url: 'apollo.io' },
    { id:'in13', name: 'ElevenLabs API', type: 'Voice Generation',    status: 'planned',   phase: 2, icon: '🎙️', url: 'api.elevenlabs.io' },
    { id:'in14', name: 'Firecrawl API',  type: 'Web Intelligence',    status: 'planned',   phase: 2, icon: '🕷️', url: 'firecrawl.dev' },
  ],

  growthStack: [
    { id: 'gs1', name: 'Demo-First Outreach',       status: 'active',  description: 'Build a full demo site before the first call. Prospect sees their real business already transformed — this is the pitch.', impact: 'High' },
    { id: 'gs2', name: 'Instagram Proof-of-Work',   status: 'active',  description: 'Post every finished site and client result to @eliteprodigy_sg. New prospects see the portfolio before we call.', impact: 'High' },
    { id: 'gs3', name: 'Industry Cluster Approach', status: 'active',  description: 'Work one industry at a time (landscaping → roofing → HVAC). Referrals flow between similar businesses.', impact: 'Medium' },
    { id: 'gs4', name: 'Monthly Growth Upsell',     status: 'active',  description: 'At every site handoff, pitch the $100/mo growth plan. Goal: 10 monthly clients = $1,000 MRR baseline.', impact: 'High' },
    { id: 'gs5', name: 'Brand Development Service', status: 'active',  description: 'Coach, league, or sports org needs full brand? Team Starter at $500 → Elite Buildout at $3,500.', impact: 'High' },
    { id: 'gs6', name: 'Athlete Platform Growth',   status: 'active',  description: 'Free athlete profiles build community → EP Select and future paid tiers drive revenue.', impact: 'Long-term' },
    { id: 'gs7', name: 'EP Media as a Brand',       status: 'building',description: 'EP Media should be known as the premium sports media and web agency in Baldwin County. Every site we build is a billboard.', impact: 'Long-term' },
    { id: 'gs8', name: 'Zapier Lead Automation',    status: 'phase2',  description: 'Netlify form submissions auto-create leads in pipeline. Zero manual entry for inbound leads.', impact: 'Medium' },
  ],

  knowledgeCenter: [
    { id: 'kb1',  title: 'CLAUDE.md — Project Constitution',          type: 'doc',    icon: '📖', url: 'https://github.com/EliteProdigy1/elite-prodigy-sports-group-website/blob/main/CLAUDE.md', note: 'Master spec for all EP projects. Read before every session.' },
    { id: 'kb2',  title: 'EP Command Center 2.0 Spec',                type: 'doc',    icon: '⚙️', url: 'docs/EP-COMMAND-CENTER-2.0-SPEC.md',           note: 'Full spec for this dashboard.' },
    { id: 'kb3',  title: 'Phase 2 API Plan',                          type: 'doc',    icon: '🔗', url: 'docs/PHASE-2-API-PLAN.md',                     note: 'Roadmap for live API integrations.' },
    { id: 'kb4',  title: 'EPSG Live Site',                            type: 'link',   icon: '🏆', url: 'https://eliteprodigysportsgroup.netlify.app',  note: 'Production — Elite Prodigy Sports Group.' },
    { id: 'kb5',  title: 'EP Youth Site',                             type: 'link',   icon: '⚡', url: 'https://eliteprodigysportsgroup.netlify.app/eliteprodigy.html', note: 'Youth program page.' },
    { id: 'kb6',  title: 'EP GitHub Org',                             type: 'link',   icon: '🐙', url: 'https://github.com/EliteProdigy1',             note: 'All repos — 10 active.' },
    { id: 'kb7',  title: 'Netlify Dashboard',                         type: 'link',   icon: '🚀', url: 'https://app.netlify.com',                      note: 'All deployments, forms, analytics.' },
    { id: 'kb8',  title: 'Athlete Intake Form',                       type: 'form',   icon: '📋', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdPFZPxP2ao94iU-Djvsi5GbICrr7w89WqNLcRD9P0YYsVz-w/viewform', note: 'Main athlete registration.' },
    { id: 'kb9',  title: 'All-Star Nominations Form',                 type: 'form',   icon: '⭐', url: 'https://docs.google.com/forms/d/e/1FAIpQLSexQjDuMKOB3vkXUItLvw-rBHCQkojXGoNMyir8Y9K_wXN4xg/viewform', note: 'All-Star selection form.' },
    { id: 'kb10', title: 'LeagueApps — Summer Preseason Camp',        type: 'form',   icon: '🏅', url: 'https://eliteprodigy.leagueapps.com/camps/5051773-summer-preseason-development-program', note: 'Event registration.' },
    { id: 'kb11', title: 'Social Checklist',                          type: 'link',   icon: '📱', url: 'https://eliteprodigysportsgroup.netlify.app/social-checklist', note: '@eliteprodigy_sg · @_eliteprodigy.' },
    { id: 'kb12', title: 'EP Brand Development Page',                 type: 'link',   icon: '🎨', url: 'https://eliteprodigysportsgroup.netlify.app/brand-development', note: 'Packages from $500–$3,500.' },
  ],

  personalCommand: {
    focusStatement: 'Build EP Media into the premier sports media and web agency on the Gulf Coast. Every day: 10 calls, one closed deal, one piece of content.',
    dailyHabits: [
      'Open Call Mode — work the pipeline',
      'Check Netlify Forms dashboard for submissions',
      'Post one piece of content to @eliteprodigy_sg',
      'Review Blockers — eliminate one',
      'Log every call outcome in Call Mode',
    ],
    quickLinks: [
      { label: 'Gmail',           url: 'https://mail.google.com',                           icon: '📧' },
      { label: 'Google Calendar', url: 'https://calendar.google.com',                       icon: '📅' },
      { label: 'Netlify Forms',   url: 'https://app.netlify.com',                           icon: '📋' },
      { label: 'Venmo',           url: 'https://venmo.com/u/eliteprodigy',                  icon: '💳' },
      { label: 'Cash App',        url: 'https://cash.app/$ELITEPRODIGYLLC',                 icon: '💵' },
      { label: 'Meta Business',   url: 'https://business.facebook.com',                     icon: '📘' },
      { label: 'EP Instagram',    url: 'https://instagram.com/eliteprodigy_sg',             icon: '📸' },
      { label: 'LeagueApps',      url: 'https://eliteprodigy.leagueapps.com',               icon: '🏅' },
    ],
    contacts: [
      { name: 'Jonathan Walton',  role: 'Founder',         phone: '251.223.0812', email: 'eliteprodigyway@gmail.com' },
      { name: 'Christine Walton', role: 'Co-Founder / Admin', phone: '', email: 'eliteprodigyway@gmail.com' },
    ],
  },

  investorDashboard: {
    note: 'This section is reserved for future investor reporting. No financial data is stored here.',
    placeholders: [
      { label: 'Total Revenue (YTD)',       value: 'Connect accounting in Phase 2' },
      { label: 'MRR (Monthly Recurring)',   value: 'Connect accounting in Phase 2' },
      { label: 'Clients Under Contract',    value: 'See Pipeline tab' },
      { label: 'Projected Q3 Revenue',      value: 'Manual entry in Phase 2' },
    ],
    securityNote: 'No real financial data is stored in this dashboard. All sensitive reporting must use authenticated backend routes with encrypted storage.',
  },

  bankingCenter: {
    note: 'This section contains links only. No account numbers, balances, or credentials are stored here.',
    securityNote: 'NEVER store banking credentials, account numbers, or API keys in frontend JavaScript. All banking integrations must route through secure backend functions with authentication.',
    links: [
      { name: 'Venmo Business',  desc: 'Receive client payments',  url: 'https://venmo.com/u/eliteprodigy', note: '@eliteprodigy', icon: '💳' },
      { name: 'Cash App',        desc: 'Receive client payments',  url: 'https://cash.app/$ELITEPRODIGYLLC', note: '$ELITEPRODIGYLLC', icon: '💵' },
      { name: 'Stripe (Phase 2)',desc: 'Online payment processing', url: 'https://stripe.com', note: 'Connect in Phase 2 for online checkout', icon: '💰' },
      { name: 'Robinhood',       desc: 'Personal investing',        url: 'https://robinhood.com', note: 'Read-only access — never store tokens here', icon: '📈' },
    ],
  },
};

/* ─── WORKING STATE (persisted in localStorage) ─── */
const STORE_KEY = 'epcc-v2';
const STAGES = ['Lead', 'Contacted', 'Interested', 'Proposal Sent', 'Closed Won', 'Lost'];

const SEED = {
  leads: [
    { id: 'l1', name: 'Azalea Turf & Lawn',    contact: '',            phone: '', industry: 'Landscaping',   value: 1100, stage: 'Proposal Sent', notes: 'Demo site LIVE: azaleaturfandlawn.netlify.app. Pitch: buy the site $1,000 + $100/mo growth.', next: 'Call — site is live, close the sale' },
    { id: 'l2', name: 'Warren Landscape',       contact: '',            phone: '', industry: 'Landscaping',   value: 1100, stage: 'Proposal Sent', notes: 'Demo site LIVE: warrenlandscape.netlify.app.', next: 'Call — walk them through their live site' },
    { id: 'l3', name: 'Metal & Mud',            contact: '',            phone: '', industry: 'Ceramics',      value: 1100, stage: 'Proposal Sent', notes: 'Demo site LIVE: dwatts.netlify.app.', next: 'Call — demo ready' },
    { id: 'l4', name: '22 Builds',              contact: 'Ryan Anderson', phone: '', industry: 'Construction', value: 1100, stage: 'Proposal Sent', notes: 'Full site LIVE: 22builds.netlify.app — logo, floor plans, renovation gallery, working contact form.', next: 'Show finished site; close deal' },
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
  prospects: [
    { id: 'pc1', business: 'Gulf Shores HVAC Co',      industry: 'HVAC',          contact: '', phone: '', website: '', note: 'No visible web presence — strong candidate', status: 'research',   addedDate: 'Jul 5', value: 1000 },
    { id: 'pc2', business: 'Baldwin Roofing Pros',     industry: 'Roofing',       contact: '', phone: '', website: '', note: 'Listed on Google — outdated site',          status: 'research',   addedDate: 'Jul 5', value: 1000 },
    { id: 'pc3', business: 'Gulf Coast Auto Detail',   industry: 'Auto Detailing',contact: '', phone: '', website: '', note: 'Facebook page only — no website',           status: 'research',   addedDate: 'Jul 5', value: 1000 },
    { id: 'pc4', business: 'Foley Landscaping LLC',    industry: 'Landscaping',   contact: '', phone: '', website: '', note: 'Weak existing site — easy upgrade pitch',   status: 'research',   addedDate: 'Jul 5', value: 1000 },
    { id: 'pc5', business: 'Orange Beach Charter Co',  industry: 'Fishing Charter',contact: '', phone: '', website: '', note: 'Tourist traffic — website is money',        status: 'research',   addedDate: 'Jul 5', value: 1100 },
  ],
};

let S = load();

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.prospects) parsed.prospects = JSON.parse(JSON.stringify(SEED.prospects));
      return parsed;
    }
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
      if (!parsed.prospects) parsed.prospects = JSON.parse(JSON.stringify(SEED.prospects));
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

/* ═══ DASHBOARD WIDGETS ═══ */
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
  const ni = Math.min(Math.max(i + dir, 0), STAGES.length - 2);
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
    `).join('') : '<div class="empty-note">No calls logged yet.</div>';
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

/* ═══════════════════════════════════════════════════════════════
   NEW v2.1 RENDER FUNCTIONS
═══════════════════════════════════════════════════════════════ */

/* ── POTENTIAL CLIENTS ── */
const PROSPECT_STATUSES = ['research', 'demo-ready', 'pitched', 'follow-up', 'not-interested'];
const PROSPECT_STATUS_LABELS = { 'research': 'Research', 'demo-ready': 'Demo Ready', 'pitched': 'Pitched', 'follow-up': 'Follow Up', 'not-interested': 'Not Interested' };
const PROSPECT_STATUS_CLASSES = { 'research': 'tag-hold', 'demo-ready': 'tag-build', 'pitched': 'tag-review', 'follow-up': 'tag-live', 'not-interested': '' };

function renderPotentialClients() {
  const listEl = document.getElementById('prospect-list');
  const filterEl = document.getElementById('prospect-filter-row');
  if (!listEl) return;

  if (filterEl) {
    filterEl.innerHTML = `<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
      <button class="filter-btn active" data-pfilter="all" onclick="filterProspects('all',this)">All (${S.prospects.length})</button>
      ${PROSPECT_STATUSES.map(s => {
        const count = S.prospects.filter(p => p.status === s).length;
        return `<button class="filter-btn" data-pfilter="${s}" onclick="filterProspects('${s}',this)">${PROSPECT_STATUS_LABELS[s]} (${count})</button>`;
      }).join('')}
    </div>`;
  }

  listEl.innerHTML = S.prospects.map(p => `
    <div class="prospect-card" data-pstatus="${p.status}" style="display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:10px;transition:border-color var(--transition);">
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${esc(p.business)}</div>
          <span class="status-tag ${PROSPECT_STATUS_CLASSES[p.status] || 'tag-hold'}">${PROSPECT_STATUS_LABELS[p.status] || p.status}</span>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">${esc(p.industry)}${p.contact ? ' · ' + esc(p.contact) : ''}${p.website ? ' · <a href="' + esc(p.website) + '" target="_blank" style="color:var(--gold);">' + esc(p.website) + '</a>' : ''}</div>
        ${p.note ? `<div style="font-size:12px;color:var(--text-secondary);">${esc(p.note)}</div>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
        <div style="font-size:12px;color:var(--gold);font-weight:600;">$${(p.value||1000).toLocaleString()}</div>
        <div class="row-actions" style="margin-top:0;">
          ${p.phone ? `<a class="mini-btn call" href="tel:${esc(p.phone)}">📞 ${esc(p.phone)}</a>` : ''}
          <button class="mini-btn" onclick="advanceProspect('${p.id}')">▶ Advance</button>
          <button class="mini-btn" onclick="editProspect('${p.id}')">✎ Edit</button>
          <button class="mini-btn danger" onclick="deleteProspect('${p.id}')">✕</button>
        </div>
      </div>
    </div>
  `).join('') || '<div class="empty-note">No prospects yet — add one above.</div>';
}

function filterProspects(filter, btn) {
  document.querySelectorAll('[data-pfilter]').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.prospect-card').forEach(card => {
    card.style.display = (filter === 'all' || card.dataset.pstatus === filter) ? '' : 'none';
  });
}

function addProspectFromForm() {
  const business = document.getElementById('np-business').value.trim();
  if (!business) return alert('Business name required.');
  S.prospects.unshift({
    id: uid(),
    business,
    industry: document.getElementById('np-industry').value.trim(),
    contact: document.getElementById('np-contact').value.trim(),
    phone: document.getElementById('np-phone').value.trim(),
    website: document.getElementById('np-website').value.trim(),
    note: document.getElementById('np-note').value.trim(),
    status: 'research',
    value: 1000,
    addedDate: todayStr(),
  });
  ['np-business','np-industry','np-contact','np-phone','np-website','np-note'].forEach(id => { document.getElementById(id).value = ''; });
  toggleForm('prospect-form', false);
  save();
}

function advanceProspect(id) {
  const p = S.prospects.find(x => x.id === id);
  if (!p) return;
  const i = PROSPECT_STATUSES.indexOf(p.status);
  if (i < PROSPECT_STATUSES.length - 1) p.status = PROSPECT_STATUSES[i + 1];
  save();
}

function editProspect(id) {
  const p = S.prospects.find(x => x.id === id);
  if (!p) return;
  const phone = prompt('Phone:', p.phone || '');
  if (phone !== null) p.phone = phone.trim();
  const note = prompt('Note:', p.note || '');
  if (note !== null) p.note = note.trim();
  const website = prompt('Website:', p.website || '');
  if (website !== null) p.website = website.trim();
  save();
}

function deleteProspect(id) {
  if (confirm('Remove prospect?')) { S.prospects = S.prospects.filter(x => x.id !== id); save(); }
}

/* ── CALENDAR ── */
function renderCalendar() {
  const el = document.getElementById('calendar-list');
  if (!el) return;
  const typeColors = { event: 'var(--gold)', 'follow-up': 'var(--blue)', milestone: 'var(--green)', task: 'var(--yellow)' };
  const typeIcons  = { event: '🏟️', 'follow-up': '📞', milestone: '🏆', task: '✅' };
  el.innerHTML = DATA.calendar.map(ev => `
    <div style="display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:var(--bg-card);border:1px solid var(--border);border-left:3px solid ${typeColors[ev.type] || 'var(--border)'};border-radius:var(--radius);margin-bottom:10px;">
      <div style="font-size:22px;flex-shrink:0;padding-top:2px;">${typeIcons[ev.type] || '📅'}</div>
      <div style="flex:1;">
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">${esc(ev.title)}</div>
        <div style="font-size:12px;color:var(--text-muted);">${esc(ev.client)}${ev.note ? ' · ' + esc(ev.note) : ''}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:13px;font-weight:600;color:${typeColors[ev.type] || 'var(--text-secondary)'};">${esc(ev.date)}</div>
        <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.07em;margin-top:2px;">${ev.type}</div>
      </div>
    </div>
  `).join('');
}

/* ── BLOCKERS ── */
function renderBlockers() {
  const el = document.getElementById('blockers-list');
  if (!el) return;
  const priorityColors = { high: 'var(--red)', medium: 'var(--yellow)', low: 'var(--text-muted)' };
  const priorityIcons  = { high: '🔴', medium: '🟡', low: '🔵' };
  el.innerHTML = DATA.blockers.map(b => `
    <div style="display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:var(--bg-card);border:1px solid var(--border);border-left:3px solid ${priorityColors[b.priority] || 'var(--border)'};border-radius:var(--radius);margin-bottom:10px;">
      <div style="font-size:18px;flex-shrink:0;padding-top:2px;">${priorityIcons[b.priority] || '⚪'}</div>
      <div style="flex:1;">
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">${esc(b.title)}</div>
        ${b.note ? `<div style="font-size:12px;color:var(--text-muted);">${esc(b.note)}</div>` : ''}
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:11px;color:var(--text-muted);">Owner</div>
        <div style="font-size:12px;color:var(--text-secondary);font-weight:500;">${esc(b.owner)}</div>
      </div>
    </div>
  `).join('') || '<div class="empty-note">No blockers — all clear.</div>';
}

/* ── NEXT ACTIONS ── */
function renderNextActions() {
  const el = document.getElementById('next-actions-list');
  if (!el) return;
  const priorityColors = { high: 'var(--gold)', medium: 'var(--yellow)', low: 'var(--text-muted)' };
  el.innerHTML = DATA.nextActions.map((a, i) => `
    <div style="display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:10px;transition:border-color var(--transition);">
      <div style="width:28px;height:28px;border-radius:50%;background:var(--bg-elevated);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:12px;font-weight:700;color:${priorityColors[a.priority]};flex-shrink:0;">${i+1}</div>
      <div style="flex:1;">
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">${esc(a.action)}</div>
        ${a.context ? `<div style="font-size:12px;color:var(--text-muted);">${esc(a.context)}</div>` : ''}
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:12px;font-weight:600;color:${priorityColors[a.priority]};">${esc(a.due)}</div>
        ${priorityBadge(a.priority)}
      </div>
    </div>
  `).join('');
}

/* ── AGENT WORKFORCE ── */
function renderAgentWorkforce() {
  const el = document.getElementById('agent-grid');
  if (!el) return;
  const statusColors = { active: 'var(--green)', available: 'var(--blue)', phase2: 'var(--text-muted)' };
  const statusLabels = { active: 'Active', available: 'Available', phase2: 'Phase 2' };
  el.innerHTML = `<div class="ai-tools-grid">${DATA.agentWorkforce.map(a => `
    <div class="ai-tool-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div style="font-size:26px;">🤖</div>
        <span class="status-tag" style="background:${statusColors[a.status]}18;color:${statusColors[a.status]};border-color:${statusColors[a.status]}40;">${statusLabels[a.status] || a.status}</span>
      </div>
      <div class="ai-tool-name">${esc(a.name)}</div>
      <div class="ai-tool-purpose">${esc(a.role)}</div>
      <div style="font-size:11px;color:var(--text-muted);margin:6px 0 10px;font-family:monospace;">${esc(a.platform)}</div>
      <div class="ai-tool-tags">${a.tags.map(t => `<span class="ai-tag">${t}</span>`).join('')}</div>
    </div>
  `).join('')}</div>`;
}

/* ── AUTOMATION CENTER ── */
function renderAutomationCenter() {
  const el = document.getElementById('automation-list');
  if (!el) return;
  const statusMap = { live: { cls: 'tag-live', label: 'Live' }, 'setup-needed': { cls: 'tag-review', label: 'Setup Needed' }, phase2: { cls: 'tag-hold', label: 'Phase 2' }, planned: { cls: 'tag-hold', label: 'Planned' } };
  el.innerHTML = DATA.automations.map(a => {
    const s = statusMap[a.status] || { cls: 'tag-hold', label: a.status };
    return `
    <div style="display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:10px;">
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${esc(a.name)}</div>
          <span class="status-tag ${s.cls}">${s.label}</span>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Trigger: ${esc(a.trigger)}</div>
        <div style="font-size:12px;color:var(--text-secondary);">Action: ${esc(a.action)}</div>
        ${a.note ? `<div style="font-size:11px;color:var(--text-muted);margin-top:6px;">${esc(a.note)}</div>` : ''}
      </div>
      <div style="text-align:right;flex-shrink:0;font-size:11px;color:var(--text-muted);white-space:nowrap;">${esc(a.platform)}</div>
    </div>`;
  }).join('');
}

/* ── INTEGRATIONS MAP ── */
function renderIntegrationsMap() {
  const el = document.getElementById('integrations-grid');
  if (!el) return;
  const phase1 = DATA.integrationsMap.filter(i => i.phase === 1);
  const phase2 = DATA.integrationsMap.filter(i => i.phase === 2);
  const renderGroup = (items) => `<div class="ai-tools-grid">${items.map(i => `
    <div class="ai-tool-card" style="${i.status === 'connected' ? 'border-color:rgba(34,197,94,0.2);' : ''}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div style="font-size:24px;">${i.icon}</div>
        <span class="status-tag ${i.status === 'connected' ? 'tag-live' : 'tag-hold'}">${i.status === 'connected' ? 'Connected' : i.status === 'planned' ? 'Phase 2' : i.status}</span>
      </div>
      <div class="ai-tool-name">${esc(i.name)}</div>
      <div class="ai-tool-purpose">${esc(i.type)}</div>
      ${i.url ? `<div style="margin-top:10px;"><a href="https://${i.url}" target="_blank" rel="noopener" class="mini-btn">Open ↗</a></div>` : ''}
    </div>
  `).join('')}</div>`;
  el.innerHTML = `
    <div style="margin-bottom:8px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);">Phase 1 — Active</div>
    ${renderGroup(phase1)}
    <div style="margin:24px 0 8px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);">Phase 2 — Planned</div>
    ${renderGroup(phase2)}
  `;
}

/* ── GROWTH STACK ── */
function renderGrowthStack() {
  const el = document.getElementById('growth-list');
  if (!el) return;
  const statusColors = { active: 'var(--green)', building: 'var(--blue)', phase2: 'var(--text-muted)' };
  const impactColors = { High: 'var(--gold)', Medium: 'var(--yellow)', 'Long-term': 'var(--silver)' };
  el.innerHTML = DATA.growthStack.map(g => `
    <div style="display:flex;align-items:flex-start;gap:14px;padding:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:10px;">
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="font-size:15px;font-weight:600;color:var(--text-primary);">${esc(g.name)}</div>
          <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;background:${statusColors[g.status]}18;color:${statusColors[g.status]};border:1px solid ${statusColors[g.status]}30;text-transform:uppercase;letter-spacing:0.06em;">${g.status}</span>
        </div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">${esc(g.description)}</div>
      </div>
      <div style="flex-shrink:0;text-align:right;">
        <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Impact</div>
        <div style="font-size:13px;font-weight:600;color:${impactColors[g.impact] || 'var(--text-secondary)'};">${g.impact}</div>
      </div>
    </div>
  `).join('');
}

/* ── KNOWLEDGE CENTER ── */
function renderKnowledgeCenter() {
  const el = document.getElementById('knowledge-list');
  if (!el) return;
  const typeColors = { doc: 'var(--blue)', link: 'var(--gold)', form: 'var(--green)' };
  el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">${DATA.knowledgeCenter.map(k => `
    <a href="${esc(k.url)}" target="_blank" rel="noopener" style="display:flex;align-items:flex-start;gap:12px;padding:14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);text-decoration:none;transition:border-color var(--transition);" onmouseover="this.style.borderColor='var(--border-gold)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="font-size:22px;flex-shrink:0;">${k.icon}</div>
      <div>
        <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">${esc(k.title)}</div>
        <div style="font-size:11px;color:var(--text-muted);">${esc(k.note)}</div>
        <div style="font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${typeColors[k.type] || 'var(--text-muted)'};margin-top:6px;">${k.type}</div>
      </div>
    </a>
  `).join('')}</div>`;
}

/* ── PERSONAL COMMAND ── */
function renderPersonalCommand() {
  const el = document.getElementById('personal-content');
  if (!el) return;
  const p = DATA.personalCommand;
  el.innerHTML = `
    <div class="two-col-grid">
      <div>
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><h2 class="card-title">Focus Statement</h2></div>
          <p style="font-size:15px;line-height:1.7;color:var(--text-secondary);border-left:3px solid var(--gold);padding-left:14px;margin:0;">${esc(p.focusStatement)}</p>
        </div>
        <div class="card">
          <div class="card-header"><h2 class="card-title">Daily Habits</h2></div>
          <ol style="list-style:none;counter-reset:habit;display:flex;flex-direction:column;gap:10px;">
            ${p.dailyHabits.map(h => `
              <li style="counter-increment:habit;display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-secondary);">
                <span style="width:22px;height:22px;border-radius:50%;background:var(--bg-elevated);border:1px solid var(--border-gold);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--gold);flex-shrink:0;">${p.dailyHabits.indexOf(h)+1}</span>
                ${esc(h)}
              </li>
            `).join('')}
          </ol>
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><h2 class="card-title">Quick Links</h2></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${p.quickLinks.map(l => `
              <a href="${esc(l.url)}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:8px;padding:9px 12px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-sm);text-decoration:none;color:var(--text-secondary);font-size:13px;transition:all var(--transition);" onmouseover="this.style.borderColor='var(--border-gold)';this.style.color='var(--gold)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-secondary)'">
                <span style="font-size:15px;">${l.icon}</span>${esc(l.label)}
              </a>
            `).join('')}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h2 class="card-title">Key Contacts</h2></div>
          ${p.contacts.map(c => `
            <div style="padding:10px 0;border-bottom:1px solid var(--border);">
              <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${esc(c.name)}</div>
              <div style="font-size:12px;color:var(--text-muted);margin:2px 0;">${esc(c.role)}</div>
              ${c.phone ? `<a href="tel:${esc(c.phone)}" style="font-size:12px;color:var(--gold);text-decoration:none;">📞 ${esc(c.phone)}</a>` : ''}
              ${c.email ? ` <a href="mailto:${esc(c.email)}" style="font-size:12px;color:var(--text-secondary);text-decoration:none;margin-left:${c.phone?'10px':'0'};">✉ ${esc(c.email)}</a>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ── INVESTOR DASHBOARD (placeholder) ── */
function renderInvestorDashboard() {
  const el = document.getElementById('investor-content');
  if (!el) return;
  const d = DATA.investorDashboard;
  el.innerHTML = `
    <div class="card" style="margin-bottom:16px;border-color:rgba(201,168,76,0.2);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
        <span style="font-size:20px;">🔒</span>
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text-primary);">Phase 2 Feature</div>
          <div style="font-size:12px;color:var(--text-muted);">${esc(d.note)}</div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--red);background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:8px;padding:10px 14px;">${esc(d.securityNote)}</div>
    </div>
    <div class="revenue-grid">
      ${d.placeholders.map(p => `
        <div class="kpi-card">
          <div class="kpi-label">${esc(p.label)}</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:8px;font-style:italic;">${esc(p.value)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ── BANKING CENTER (links only) ── */
function renderBankingCenter() {
  const el = document.getElementById('banking-content');
  if (!el) return;
  const b = DATA.bankingCenter;
  el.innerHTML = `
    <div class="card" style="margin-bottom:16px;border-color:rgba(239,68,68,0.15);">
      <div style="display:flex;align-items:flex-start;gap:10px;">
        <span style="font-size:20px;">🔒</span>
        <div style="font-size:13px;color:var(--red);line-height:1.6;">${esc(b.securityNote)}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2 class="card-title">Payment &amp; Finance Links</h2><span class="card-badge">Links only · No data stored</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">
        ${b.links.map(l => `
          <a href="${esc(l.url)}" target="_blank" rel="noopener" style="display:flex;align-items:flex-start;gap:12px;padding:14px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius);text-decoration:none;transition:border-color var(--transition);" onmouseover="this.style.borderColor='var(--border-gold)'" onmouseout="this.style.borderColor='var(--border)'">
            <div style="font-size:24px;">${l.icon}</div>
            <div>
              <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:3px;">${esc(l.name)}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">${esc(l.desc)}</div>
              <div style="font-size:11px;color:var(--gold);">${esc(l.note)}</div>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;
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
  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.asset-filters');
      if (!group) return;
      group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
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
  /* existing */
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
  /* new v2.1 */
  renderPotentialClients();
  renderCalendar();
  renderBlockers();
  renderNextActions();
  renderAgentWorkforce();
  renderAutomationCenter();
  renderIntegrationsMap();
  renderGrowthStack();
  renderKnowledgeCenter();
  renderPersonalCommand();
  renderInvestorDashboard();
  renderBankingCenter();
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
