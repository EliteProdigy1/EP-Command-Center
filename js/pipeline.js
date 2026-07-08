/* ═══════════════════════════════════════════════════════════════
   EP MEDIA PRODUCTION PIPELINE v1 — Build Queue + Purchase Funnel
   ─────────────────────────────────────────────────────────────
   Reuses existing globals from app.js / website-intel.js / notion.js:
   S, esc, badge, siteUrl, toast, save, goSection, openProspect,
   meetingsData, upcomingMeetings, meetingDayLabel, MEETING_NEXT,
   exportToClaudeCode, createSiteDropPrompt, agentAudit, notionService.
   No new libraries. Notion stays the source of truth.
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const BUILD_STAGES = ['Research', 'Concept', 'SiteDrop', 'Claude Code', 'Review', 'Sent', 'Purchased', 'Launched'];
  const BUILD_TOOLS = {
    'Firecrawl':   { icon: '🔥', run: id => window.agentAudit && agentAudit(id) },
    'SiteDrop':    { icon: '⚡', run: id => window.createSiteDropPrompt && createSiteDropPrompt(id) },
    'Claude Code': { icon: '⌘', run: id => window.exportToClaudeCode && exportToClaudeCode(id) },
    'ChatGPT':     { icon: '🧠', url: 'https://chatgpt.com' },
    'Canva':       { icon: '✏️', url: 'https://canva.com' },
    'Higgsfield':  { icon: '🎬', url: 'https://higgsfield.ai' },
  };
  const PAY = ['Unpaid', 'Deposit Paid', 'Paid in Full'];
  const INTAKE = ['Not started', 'Sent', 'Received'];
  const MONTHLY = [
    { n: 'Basic',    p: '$100/mo', d: 'Updates + hosting support' },
    { n: 'Growth',   p: '$200/mo', d: 'Updates + monthly review + content/photo swaps + form checks' },
    { n: 'Priority', p: '$300/mo', d: 'Priority support + monthly improvements + lead-tracking review' },
  ];
  const BUILD_STATUSES = ['Website Audit', 'Concept Ready', 'Proposal Sent', 'Won'];

  function inBuild(p) { return BUILD_STATUSES.indexOf(p.pipelineStatus) !== -1 || !!p.buildStage; }
  function buildProspects() { return S.prospects.filter(p => !['Not Fit'].includes(p.pipelineStatus) && inBuild(p)); }
  function builtProspects() { return S.prospects.filter(p => (p.previewUrl || p.paymentStatus || ['Concept Ready', 'Proposal Sent', 'Won'].includes(p.pipelineStatus) || (p.buildStage && BUILD_STAGES.indexOf(p.buildStage) >= 2)) && p.pipelineStatus !== 'Not Fit'); }
  function preview(p) { return (typeof siteUrl === 'function') ? siteUrl(p.previewUrl || p.websiteUrl) : (p.previewUrl || ''); }
  function noteNotion(p, text) { if (p.notionId && window.notionService && notionService.appendTimelineEvent) notionService.appendTimelineEvent(p.notionId, text); }
  function find(id) { return S.prospects.find(x => x.id === id); }

  // ── Build Queue ──────────────────────────────────────────────────
  window.renderBuildQueue = function () {
    const el = document.getElementById('buildqueue-list'); if (!el) return;
    const rows = buildProspects();
    el.innerHTML = rows.length ? rows.map(p => {
      const stage = p.buildStage || 'Research', tool = p.buildTool || 'Claude Code', pv = preview(p);
      return `<div class="bq-row">
        <div class="bq-main">
          <div class="bq-name" onclick="goSection('prospects');openProspect('${p.id}')">${esc(p.businessName)} ${badge(p.pipelineStatus)}</div>
          <div class="bq-sub">${esc(p.industry)} · ${esc(p.location)}${pv ? ` · <a href="${esc(pv)}" target="_blank" rel="noopener" style="color:var(--gold);">preview ↗</a>` : ''}</div>
        </div>
        <div class="bq-controls">
          <select class="mini" onchange="setBuildStage('${p.id}',this.value)" title="Build stage">${BUILD_STAGES.map(s => `<option ${stage === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
          <select class="mini" onchange="assignBuildTool('${p.id}',this.value)" title="Tool / agent">${Object.keys(BUILD_TOOLS).map(t => `<option ${tool === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
          <button class="mini" style="color:var(--gold-light);" onclick="runBuildHandoff('${p.id}')">⚡ Run</button>
        </div>
      </div>`;
    }).join('') : '<div class="empty">No builds yet. Move a prospect to Website Audit / Concept Ready / Proposal Sent to start a build.</div>';
    const cnt = document.getElementById('buildqueue-count'); if (cnt) cnt.textContent = rows.length + ' in build';
  };
  window.setBuildStage = function (id, stage) {
    const p = find(id); if (!p) return;
    p.buildStage = stage;
    if (stage === 'Launched') p.pipelineStatus = 'Won';
    if (stage === 'Purchased' && (!p.paymentStatus || p.paymentStatus === 'Unpaid')) p.paymentStatus = 'Deposit Paid';
    save(); noteNotion(p, 'Build stage → ' + stage);
  };
  window.assignBuildTool = function (id, tool) { const p = find(id); if (!p) return; p.buildTool = tool; save(); };
  window.runBuildHandoff = function (id) {
    const p = find(id); if (!p) return;
    const tool = p.buildTool || 'Claude Code', cfg = BUILD_TOOLS[tool];
    if (cfg && cfg.run) { cfg.run(id); toast('Build handoff → ' + tool); return; }
    const brief = `EP MEDIA — build handoff for ${tool}\n\nBusiness: ${p.businessName}\nIndustry: ${p.industry} · ${p.location}\nBuild stage: ${p.buildStage || 'Research'}\nPreview: ${preview(p) || '(none yet)'}\n\nProduce the next asset for this website build and report back.`;
    if (navigator.clipboard) navigator.clipboard.writeText(brief).catch(() => {});
    if (cfg && cfg.url) { try { window.open(cfg.url, '_blank', 'noopener'); } catch (e) {} }
    toast('Build handoff → ' + tool + ' (brief copied)');
  };

  // ── Purchase Funnel ──────────────────────────────────────────────
  window.renderPurchaseFunnel = function () {
    const el = document.getElementById('funnel-list'); if (!el) return;
    const rows = builtProspects();
    el.innerHTML = rows.length ? rows.map(p => {
      const pv = preview(p), pay = p.paymentStatus || 'Unpaid', intake = p.intakeStatus || 'Not started';
      return `<div class="bq-row">
        <div class="bq-main">
          <div class="bq-name">${esc(p.businessName)}</div>
          <div class="bq-sub">${pv ? `<a href="${esc(pv)}" target="_blank" rel="noopener" style="color:var(--gold);">preview ↗</a>` : 'no preview yet'} · $500 deposit + $500 completion</div>
        </div>
        <div class="bq-controls">
          <select class="mini" onchange="setPayment('${p.id}',this.value)" title="Payment">${PAY.map(s => `<option ${pay === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
          <select class="mini" onchange="setIntake('${p.id}',this.value)" title="Intake">${INTAKE.map(s => `<option ${intake === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
          <button class="mini" style="color:var(--gold-light);" onclick="claimSite('${p.id}')">Claim link</button>
        </div>
      </div>`;
    }).join('') : '<div class="empty">Built sites appear here once a prospect has a preview URL or reaches Concept Ready.</div>';
    const plans = document.getElementById('funnel-plans');
    if (plans) plans.innerHTML =
      `<div class="fn-offer">Default offer — <b>$500 deposit + $500 on completion</b></div>` +
      MONTHLY.map(m => `<div class="fn-plan"><div class="fn-plan-p">${m.p}</div><div class="fn-plan-n">${esc(m.n)}</div><div class="fn-plan-d">${esc(m.d)}</div></div>`).join('');
  };
  window.setPayment = function (id, v) { const p = find(id); if (!p) return; p.paymentStatus = v; if (v === 'Paid in Full') { p.pipelineStatus = 'Won'; } save(); noteNotion(p, 'Payment → ' + v); };
  window.setIntake = function (id, v) { const p = find(id); if (!p) return; p.intakeStatus = v; save(); noteNotion(p, 'Intake → ' + v); };
  window.claimSite = function (id) {
    const p = find(id); if (!p) return;
    const pv = preview(p);
    const msg = `Hi${p.contactName ? ' ' + p.contactName : ''}! Your new ${(p.industry || 'business').toLowerCase()} website is ready to preview: ${pv || '(link)'}\n\nElite Prodigy Media — to claim it it's a $500 deposit ($500 on completion). Venmo @eliteprodigy · Cash App $ELITEPRODIGYLLC. Reply and I'll send your intake form.`;
    if (navigator.clipboard) navigator.clipboard.writeText(msg).catch(() => {});
    toast('Claim message copied — text it to ' + (p.contactName || p.businessName));
  };

  // ── Meetings section (full list from the Notion Meetings DB) ──────
  window.renderMeetingsSection = function () {
    const el = document.getElementById('meetings-list'); if (!el) return;
    const ms = (typeof meetingsData !== 'undefined' ? meetingsData : []).slice()
      .map(m => Object.assign({}, m, { _d: m.date ? new Date(m.date) : null }))
      .sort((a, b) => (b._d ? b._d.getTime() : 0) - (a._d ? a._d.getTime() : 0));
    el.innerHTML = ms.length ? ms.map(m => `
      <div class="home-meeting">
        <div class="hm-when">${esc((typeof meetingDayLabel === 'function') ? meetingDayLabel(m._d) : (m.date || 'Date TBD'))}</div>
        <div class="hm-title">${esc(m.with || m.title || 'Meeting')}${m.type ? ' ' + badge(m.type) : ''}</div>
        ${m.notes ? `<div class="hm-notes">${esc(String(m.notes).slice(0, 180))}</div>` : ''}
        ${m.type ? `<div class="hm-next">▸ ${esc((typeof MEETING_NEXT !== 'undefined' && MEETING_NEXT[m.type]) || 'Review & follow up')}</div>` : ''}
      </div>`).join('') : '<div class="empty">No meetings yet. Tap <b>🗓 Meeting</b> to add one — it saves to Notion.</div>';
  };
}());
