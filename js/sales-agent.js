/* ═══════════════════════════════════════════════════════════════
   EP COMMAND CENTER — SALES AGENT  (Sprint 5)
   ─────────────────────────────────────────────────────────────
   One orchestration layer that moves every prospect through the whole
   EP Media pipeline. It COORDINATES the existing modules — it does not
   reimplement any of them:

     discovery   → services/firecrawl.js  (firecrawlService.discover/audit)
     scoring     → app.js                 (computeOpportunity)
     brief/value → website-intel.js       (renderWebsiteIntelligence, estimateProjectValue)
     proposal    → website-intel.js       (copyProposal)
     Claude Code → website-intel.js       (exportToClaudeCode)
     SiteDrop    → website-intel.js       (createSiteDropPrompt)
     pipeline    → app.js                 (promoteProspect, hookScheduleFollowUp)
     follow-up   → app.js working state (S.prospects / S.leads / tasks)

   The agent decides the single NEXT BEST ACTION for each prospect, runs
   the workflow on command, recommends a maintenance plan, and rolls the
   whole book up into dashboard KPIs + a funnel.
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // The pipeline the agent drives everyone through (discovery → client).
  var PIPELINE = [
    { key: 'discover', label: 'Discovered' },
    { key: 'audit',    label: 'Website Intel' },
    { key: 'proposal', label: 'Proposal / Concept' },
    { key: 'outreach', label: 'Outreach' },
    { key: 'followup', label: 'Follow-Up' },
    { key: 'won',      label: 'Signed Client' },
  ];

  function leadFor(p) { return S.leads.find(function (l) { return l.name === p.businessName; }); }

  // Where is this prospect in the pipeline? (reads working state, no new state)
  function stageOf(p) {
    var lead = leadFor(p);
    if (lead && lead.stage === 'Closed Won') return 'won';
    if (lead && lead.stage === 'Proposal Sent') return 'proposal';
    if (lead && ['Lead', 'Contacted', 'Interested'].indexOf(lead.stage) !== -1) return 'outreach';
    var s = p.pipelineStatus;
    if (s === 'Won') return 'won';
    if (s === 'Proposal Sent') return 'proposal';
    if (s === 'Follow-Up') return 'followup';
    if (['Outreach Needed', 'Contacted'].indexOf(s) !== -1) return 'outreach';
    if (s === 'Concept Ready') return 'proposal';
    if (s === 'Website Audit') return 'audit';
    return 'discover'; // New Prospect / Needs Research
  }

  // The single next action — with the existing function it delegates to.
  function nextAction(p) {
    var st = stageOf(p);
    var lead = leadFor(p);
    switch (st) {
      case 'discover': return { label: 'Run Website Intelligence', why: 'Not audited — score the opportunity', fn: "agentAudit('" + p.id + "')" };
      case 'audit':    return { label: 'Generate Proposal & Concept', why: 'Audited — build brief, value & exports', fn: "renderWebsiteIntelligence('" + p.id + "')" };
      case 'proposal':
        if (!lead) return { label: 'Move to Pipeline + Call', why: 'Concept ready — start selling', fn: "promoteProspect('" + p.id + "')" };
        return { label: 'Close / Log Outcome', why: 'Proposal is out — close it in Call Mode', fn: "goSection('callmode')" };
      case 'outreach': return { label: 'Schedule Follow-Up', why: 'Contacted — lock the next touch', fn: "hookScheduleFollowUp('" + p.id + "')" };
      case 'followup': return { label: 'Send Proposal', why: 'Warm — send price + proposal', fn: "copyProposal('" + p.id + "')" };
      case 'won':      return { label: 'Recommend Maintenance', why: 'Signed — set recurring revenue', fn: "agentMaintenance('" + p.id + "')" };
      default:         return { label: 'Open', why: 'Review', fn: "openProspect('" + p.id + "')" };
    }
  }

  // Maintenance recommendation — reuses the value model (no new pricing logic).
  function maintenancePlan(p) {
    var est = (typeof estimateProjectValue === 'function') ? estimateProjectValue(p) : { monthly: 100 };
    var premium = est.monthly >= 250;
    return {
      plan: premium ? 'Premium Growth' : 'Monthly Growth',
      price: '$' + est.monthly + '/mo',
      monthly: est.monthly,
      why: premium
        ? 'Higher-value industry — content refreshes, priority support, and ongoing SEO keep this client winning jobs.'
        : 'Keep the site fresh: updates, edits, and hosting management so it stays a lead machine.',
    };
  }

  function activeProspects() { return S.prospects.filter(function (p) { return ['Won', 'Not Fit'].indexOf(p.pipelineStatus) === -1; }); }

  // Roll the whole book up into KPIs.
  function kpis() {
    var active = activeProspects();
    var estVal = active.reduce(function (a, p) { return a + ((typeof estimateProjectValue === 'function') ? estimateProjectValue(p).total : 0); }, 0);
    var audited = active.filter(function (p) { return stageOf(p) !== 'discover'; }).length;
    var proposals = active.filter(function (p) { return stageOf(p) === 'proposal'; }).length;
    var followups = active.filter(function (p) { return p.nextFollowUp; }).length;
    var won = S.leads.filter(function (l) { return l.stage === 'Closed Won'; });
    var mrr = won.reduce(function (a, l) { return a + ((typeof estimateProjectValue === 'function') ? estimateProjectValue({ industry: l.industry, websiteStatus: '' }).monthly : 0); }, 0);
    return {
      active: active.length, audited: audited, proposals: proposals, followups: followups,
      estValue: estVal, won: won.length, mrr: mrr,
      calls: (typeof callsToday === 'function') ? callsToday().length : 0,
    };
  }

  function funnel() {
    var counts = {}; PIPELINE.forEach(function (s) { counts[s.key] = 0; });
    S.prospects.forEach(function (p) { if (p.pipelineStatus !== 'Not Fit') counts[stageOf(p)]++; });
    return PIPELINE.map(function (s) { return { label: s.label, key: s.key, n: counts[s.key] }; });
  }

  // Prospects ranked by what the agent should push next (hottest first).
  function actionQueue() {
    return activeProspects()
      .slice()
      .sort(function (a, b) { return (a.websiteScore || 0) - (b.websiteScore || 0); })
      .slice(0, 12);
  }

  window.EPSalesAgent = {
    pipeline: PIPELINE, stageOf: stageOf, nextAction: nextAction,
    maintenancePlan: maintenancePlan, kpis: kpis, funnel: funnel, actionQueue: actionQueue,
  };

  /* ── Agent actions (coordinate existing modules) ───────────────── */

  // Audit an existing prospect: firecrawlService.audit → computeOpportunity →
  // write scores back → open the Website Intelligence brief. Pure coordination.
  window.agentAudit = async function (id) {
    var p = S.prospects.find(function (x) { return x.id === id; });
    if (!p) return;
    var candidate = {
      businessName: p.businessName, industry: p.industry, location: p.location,
      hasWebsite: p.websiteStatus !== 'No website found' && !!p.websiteUrl,
      websiteUrl: p.websiteUrl,
      siteQuality: (p.websiteScore || 0) < 35 ? 'weak' : (p.websiteScore || 0) < 55 ? 'outdated' : 'ok',
      source: p.sourceTool,
    };
    var audit = window.firecrawlService ? await window.firecrawlService.audit(candidate) : null;
    var opp = (typeof computeOpportunity === 'function') ? computeOpportunity(audit) : { overall: p.websiteScore || 0, level: p.opportunityLevel, websiteStatus: p.websiteStatus };
    p.websiteScore = opp.overall;
    if (audit) { p.mobileScore = audit.mobile || 0; p.seoScore = audit.seo || 0; p.designScore = audit.design || 0; }
    p.opportunityLevel = opp.level;
    if (!p.websiteStatus) p.websiteStatus = opp.websiteStatus;
    if (['New Prospect', 'Needs Research'].indexOf(p.pipelineStatus) !== -1) p.pipelineStatus = 'Website Audit';
    p.lastChecked = (typeof todayStr === 'function') ? todayStr() : '';
    save();
    if (typeof renderWebsiteIntelligence === 'function') renderWebsiteIntelligence(id);
  };

  // Run the whole workflow on a prospect in one click: audit → brief (with the
  // Claude Code / SiteDrop / proposal exports all one tap away in the brief).
  window.agentRunWorkflow = function (id) { return window.agentAudit(id); };

  // Recommend + apply a maintenance plan (records it on the prospect notes).
  window.agentMaintenance = function (id) {
    var p = S.prospects.find(function (x) { return x.id === id; });
    if (!p) return;
    var m = maintenancePlan(p);
    openPanel(
      '<div class="panel-title">Maintenance Plan</div>' +
      '<div class="panel-sub">' + esc(p.businessName) + ' · recurring revenue after the build</div>' +
      '<div class="wi-value"><div><div class="kv-k">Recommended</div><div class="wi-total">' + esc(m.plan) + '</div>' +
      '<div style="font-size:12px;color:var(--text-3);">' + esc(m.price) + '</div></div><div>' + badge('Growth') + '</div></div>' +
      '<div class="wi-body" style="margin:12px 0 18px;">' + esc(m.why) + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:9px;">' +
      '<button class="btn btn-gold" onclick="copyProposal(\'' + p.id + '\')">▤ Copy Proposal (includes growth plan)</button>' +
      '<button class="btn btn-ghost" onclick="openProspect(\'' + p.id + '\')">← Back to prospect</button>' +
      '</div>'
    );
  };

  /* ── The Sales Agent console ───────────────────────────────────── */
  window.renderSalesAgent = function () {
    var el = document.getElementById('agent-body');
    if (!el) return;
    var k = kpis();
    var tiles = [
      { ico: '🎯', val: k.active, label: 'Active Prospects' },
      { ico: '◍', val: k.audited, label: 'Audited & Scored' },
      { ico: '▤', val: k.proposals, label: 'Proposals Ready' },
      { ico: '💰', val: money(k.estValue), label: 'Est. Pipeline Value' },
      { ico: '↻', val: money(k.mrr) + '/mo', label: 'Maintenance MRR (won)' },
      { ico: '📞', val: k.calls, label: 'Calls Today' },
    ];
    var fn = funnel();
    var maxN = Math.max.apply(null, fn.map(function (s) { return s.n; }).concat([1]));
    var queue = actionQueue();

    el.innerHTML =
      '<div class="cq-stats" style="grid-template-columns:repeat(6,1fr);">' +
        tiles.map(function (t) { return '<div class="cq-stat"><div class="cq-ico">' + t.ico + '</div><div><div class="cq-val">' + esc(String(t.val)) + '</div><div class="cq-label">' + esc(t.label) + '</div></div></div>'; }).join('') +
      '</div>' +

      '<div class="card" style="margin-bottom:16px;">' +
        '<div class="card-head"><div class="card-title">Pipeline Funnel</div><div class="card-tag">Discovery → Signed Client</div></div>' +
        '<div class="agent-funnel">' +
          fn.map(function (s) {
            return '<div class="funnel-stage"><div class="funnel-bar" style="height:' + Math.round(14 + (s.n / maxN) * 70) + 'px;"><span>' + s.n + '</span></div><div class="funnel-label">' + esc(s.label) + '</div></div>';
          }).join('<div class="funnel-arrow">›</div>') +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head"><div class="card-title">Next Best Action <span class="card-tag" style="margin-left:8px;">agent-driven</span></div><div class="card-tag">Hottest first</div></div>' +
        (queue.length ? queue.map(function (p) {
          var st = stageOf(p); var na = nextAction(p);
          var stageLabel = (PIPELINE.filter(function (x) { return x.key === st; })[0] || {}).label || st;
          return '<div class="row agent-row">' +
            '<div class="row-main"><div class="row-title" style="cursor:pointer;" onclick="goSection(\'prospects\');openProspect(\'' + p.id + '\')">' + esc(p.businessName) +
              ' <span class="badge b-dim">' + esc(stageLabel) + '</span>' + (p.websiteStatus === 'No website found' ? ' <span class="badge b-gold">NO SITE</span>' : '') + '</div>' +
              '<div class="row-sub">' + esc(p.industry) + ' · ' + esc(p.location) + ' · <b style="color:var(--gold-light);">' + esc(na.label) + '</b> — ' + esc(na.why) + '</div></div>' +
            '<div class="row-end">' + badge(p.opportunityLevel) +
              '<button class="btn btn-gold btn-sm" onclick="' + na.fn + '">' + esc(na.label) + '</button></div>' +
          '</div>';
        }).join('') : '<div class="empty">No active prospects yet. Discover businesses or add them in Potential Clients — the agent picks up each one automatically.</div>') +
      '</div>';
  };

  // Mission Control summary (defined here, referenced lazily by app.js).
  window.sumSalesAgentBody = function () {
    var k = kpis();
    return '<div class="mc-big">' + k.active + '</div><div class="mc-list"><b>' + k.proposals + '</b> proposals ready · <b>' + money(k.estValue) + '</b> est. pipeline · agent drives each next step</div>';
  };
}());
