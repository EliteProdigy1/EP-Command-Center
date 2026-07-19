/* ══════════════════════════════════════════════════════════════════
   EP COMMAND CENTER — WORK HANDOFFS (Stage 4)
   Additive chain-of-custody for every unit of work. Records persist in
   S.handoffs (localStorage). Seeded with the H&M chain (labeled DEMO);
   user actions (accept/approve/request-changes/reassign/escalate) mutate
   the record and append a VERIFIED timeline entry — real events, honestly
   distinguished from the demo seed.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const H = () => (S && S.handoffs) ? S.handoffs : [];
  const byId = (id) => H().find(h => h.id === id);
  const today = () => (typeof todayStr === 'function') ? todayStr() : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const tag = (k) => (typeof srcTag === 'function') ? srcTag(k) : '';

  /* Order + colour for the 11 workflow states. */
  const STATE_ORDER = (typeof HANDOFF_STATES !== 'undefined') ? HANDOFF_STATES
    : ['REQUESTED', 'PLANNED', 'ASSIGNED', 'IN PROGRESS', 'READY TO HAND OFF', 'AWAITING ACCEPTANCE', 'AWAITING HUMAN APPROVAL', 'BLOCKED', 'ACCEPTED', 'COMPLETED', 'MONITORING'];
  function statePill(state) {
    const t = String(state); let cls = 'b-info';
    if (['IN PROGRESS', 'READY TO HAND OFF', 'ASSIGNED'].includes(t)) cls = 'b-warn';
    else if (['AWAITING ACCEPTANCE', 'AWAITING HUMAN APPROVAL'].includes(t)) cls = 'b-gold';
    else if (t === 'BLOCKED') cls = 'b-bad';
    else if (['ACCEPTED', 'COMPLETED', 'MONITORING'].includes(t)) cls = 'b-good';
    else cls = 'b-dim';
    return `<span class="badge ${cls}">${esc(state)}</span>`;
  }
  const ownerType = (t) => t === 'human' ? '👤' : '✦';
  const isActive = (h) => !['COMPLETED', 'MONITORING'].includes(h.state);

  function log(h, who, what, src) {
    h.timeline = h.timeline || [];
    h.timeline.push({ t: today(), who, what, src: src || 'verified' });
  }

  /* ══ A. ACTIVE HANDOFFS panel (Mission Control) ══ */
  window.renderActiveHandoffs = function () {
    const el = document.getElementById('mc-handoffs');
    if (!el) return;
    const active = H().filter(isActive);
    const rows = active.length ? active.map(h => `
      <button class="ho-row" onclick="openHandoff('${h.id}')">
        <div class="ho-row-main">
          <span class="ho-id">${esc(h.id)}</span>
          <span class="ho-task">${esc(h.task)}</span>
          <span class="ho-proj">${esc(h.project)} ${h.demo ? tag('demo') : ''}</span>
        </div>
        <div class="ho-row-chain">${esc(h.prevOwner || '—')} <span class="ho-arr">→</span> <b>${esc(h.owner)}</b> <span class="ho-arr">→</span> ${esc(h.nextOwner || 'done')}</div>
        <div class="ho-row-end">${statePill(h.state)}</div>
      </button>`).join('') : '<div class="empty">No active handoffs.</div>';
    el.innerHTML = `
      <div class="card mc-block">
        <div class="card-head"><div class="card-title">⇄ Active Handoffs</div>
          <button class="card-tag home-open" onclick="goSection('handoffs')">All handoffs →</button></div>
        <div class="ho-rows">${rows}</div>
      </div>`;
  };

  /* ══ E. RECENT AGENT ACTIVITY (Mission Control) ══ */
  window.renderRecentActivity = function () {
    const el = document.getElementById('mc-activity');
    if (!el) return;
    const events = [];
    H().forEach(h => (h.timeline || []).forEach(ev => events.push({ ...ev, hid: h.id, project: h.project })));
    events.reverse(); // newest first (seed is chronological)
    const rows = events.slice(0, 7).map(ev => `
      <button class="act-row" onclick="openHandoff('${ev.hid}')">
        <span class="act-dot ${ev.src === 'verified' ? 'v' : ''}"></span>
        <span class="act-who">${esc(ev.who)}</span>
        <span class="act-what">${esc(ev.what)}</span>
        <span class="act-meta">${esc(ev.project)} · ${esc(ev.t)} ${tag(ev.src)}</span>
      </button>`).join('') || '<div class="empty">No activity yet.</div>';
    el.innerHTML = `
      <div class="card mc-block">
        <div class="card-head"><div class="card-title">◷ Recent Agent Activity</div>
          <button class="card-tag home-open" onclick="goSection('handoffs')">Handoffs →</button></div>
        <div class="act-rows">${rows}</div>
      </div>`;
  };

  /* ══ B + D. FULL HANDOFFS route — pipeline rail + board grouped by state ══ */
  window.renderHandoffs = function () {
    const el = document.getElementById('handoffs-grid');
    if (!el) return;
    const counts = {}; STATE_ORDER.forEach(s => counts[s] = 0);
    H().forEach(h => { counts[h.state] = (counts[h.state] || 0) + 1; });
    const rail = STATE_ORDER.map(s => `
      <div class="rail-stage ${counts[s] ? 'has' : ''}">
        <span class="rail-n">${counts[s]}</span><span class="rail-s">${esc(s)}</span>
      </div>`).join('<span class="rail-arr">›</span>');

    const statesPresent = STATE_ORDER.filter(s => counts[s] > 0);
    const board = statesPresent.map(s => `
      <div class="ho-col">
        <div class="ho-col-h">${statePill(s)}<span class="ho-col-n">${counts[s]}</span></div>
        <div class="ho-col-cards">${H().filter(h => h.state === s).map(handoffCard).join('')}</div>
      </div>`).join('');

    el.innerHTML = `
      <div class="notice"><b>Chain of custody.</b> Every unit of work records who had it, what they produced, who has it now, and who receives it next. Seed records are ${tag('demo')}; your actions append ${tag('verified')} events. Click any card to open it and act.</div>
      <div class="ho-rail">${rail}</div>
      <div class="ho-board">${board}</div>`;
  };

  function handoffCard(h) {
    return `
      <button class="ho-card" onclick="openHandoff('${h.id}')">
        <div class="ho-card-top"><span class="ho-id">${esc(h.id)}</span>${h.demo ? tag('demo') : ''}${h.escalation ? '<span class="ho-esc">⚑ escalated</span>' : ''}</div>
        <div class="ho-card-task">${esc(h.task)}</div>
        <div class="ho-card-proj">${esc(h.project)}</div>
        <div class="ho-card-chain">${ownerType(h.prevType)} ${esc(h.prevOwner || '—')} <span class="ho-arr">→</span> <b>${ownerType(h.ownerType)} ${esc(h.owner)}</b> <span class="ho-arr">→</span> ${esc(h.nextOwner || 'done')}</div>
        ${h.approvalRequired ? `<div class="ho-card-appr">⚑ approval: ${esc(h.approvalOwner)}</div>` : ''}
      </button>`;
  }

  /* ══ C + E. HANDOFF DETAIL DRAWER (all fields + timeline + actions) ══ */
  window.openHandoff = function (id) {
    const h = byId(id);
    if (!h) return;
    const list = (arr) => (arr && arr.length) ? `<ul class="ho-list">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<span class="mut">—</span>';
    const atts = (h.attachments && h.attachments.length) ? h.attachments.map(a => `<span class="chip ${a.kind === 'preview' ? 'tool' : ''}" title="${esc(a.ref || '')}">${esc(a.label)}</span>`).join('') : '<span class="mut">—</span>';
    const skills = (h.skills || []).map(sid => (typeof mockData !== 'undefined' && mockData.skills.find(s => s.id === sid))).filter(Boolean);

    // R4 — approval record structured to open the Website Review Studio (Stage 5).
    let reviewBlock = '';
    if (h.review) {
      const r = h.review, lh = r.lighthouse || {};
      reviewBlock = `
        <div class="ho-review">
          <div class="hor-head">Review record ${tag('demo')} <button class="mini-btn" onclick="toast('Website Review Studio arrives in Stage 5 — this record already holds the preview, scores, changes and blockers it will show')">Open Review Studio →</button></div>
          <div class="hor-grid">
            <div><h4>Preview</h4><a href="${esc(r.previewUrl)}" target="_blank" rel="noopener" class="hor-link">Open preview ↗</a> · <span class="mut">${esc(r.branch || '')}</span></div>
            <div><h4>Lighthouse ${tag('registry')}</h4><span class="hor-lh">${lh.performance}<i>P</i> ${lh.accessibility}<i>A</i> ${lh.bestPractices}<i>BP</i> ${lh.seo}<i>SEO</i></span></div>
          </div>
          <h4 class="drawer-h">What changed</h4>${list(r.changes)}
          <h4 class="drawer-h">Launch blockers</h4>${list(r.launchBlockers)}
        </div>`;
    }

    const body = `
      <div class="drawer-head">
        <div class="ao-avatar lg">⇄</div>
        <div><div class="drawer-title">${esc(h.task)}</div><div class="drawer-sub">${esc(h.id)} · ${esc(h.project)} ${h.demo ? tag('demo') : ''}</div></div>
        ${statePill(h.state)}
      </div>

      <div class="ho-chainbar">
        <div class="hc ${h.prevOwner ? 'done' : ''}"><span>${ownerType(h.prevType)}</span>${esc(h.prevOwner || 'start')}<i>previous</i></div>
        <span class="hc-arr">→</span>
        <div class="hc cur"><span>${ownerType(h.ownerType)}</span>${esc(h.owner)}<i>current</i></div>
        <span class="hc-arr">→</span>
        <div class="hc"><span>${h.nextOwner ? ownerType(h.nextType) : '✓'}</span>${esc(h.nextOwner || 'done')}<i>next</i></div>
      </div>

      ${h.escalation ? `<div class="drawer-flag">⚑ Escalated — ${esc(h.escalation)}</div>` : ''}
      ${reviewBlock}

      <div class="drawer-grid">
        <div><h4>Deliverables</h4>${list(h.deliverables)}</div>
        <div><h4>Attachments / links</h4><div class="drawer-skills">${atts}</div></div>
        <div><h4>Missing information</h4>${list(h.missing)}</div>
        <div><h4>Blockers</h4>${list(h.blockers)}</div>
        <div><h4>Decisions made</h4>${list(h.decisions)}</div>
        <div><h4>Approval</h4><p>${h.approvalRequired ? '⚑ Required · ' + esc(h.approvalOwner) : 'Not required'}</p></div>
      </div>

      <h4 class="drawer-h">Skills invoked</h4>
      <div class="drawer-skills">${skills.map(s => `<button class="chip chip-btn" onclick="closeDrawer();openSkillDrawer('${s.id}')">${esc(s.name)}</button>`).join('') || '<span class="mut">—</span>'}</div>
      <h4 class="drawer-h">Tools used</h4>
      <div class="drawer-tools">${(h.tools || []).map(t => `<span class="chip tool">${esc(t)}</span>`).join('') || '<span class="mut">—</span>'}</div>

      <div class="ho-times">
        <span>Created ${esc(h.createdAt || '—')}</span><span>Accepted ${esc(h.acceptedAt || '—')}</span><span>Completed ${esc(h.completedAt || '—')}</span>
      </div>

      <h4 class="drawer-h">Activity timeline</h4>
      <ul class="drawer-timeline ho-tl">${(h.timeline || []).map(ev => `<li><span class="tl-who">${esc(ev.who)}</span> ${esc(ev.what)} <span class="tl-meta">${esc(ev.t)} ${tag(ev.src)}</span></li>`).join('') || '<li class="mut">No activity.</li>'}</ul>

      <div class="ho-actions">
        ${['AWAITING ACCEPTANCE', 'ASSIGNED', 'REQUESTED'].includes(h.state) ? `<button class="ha accept" onclick="acceptHandoff('${h.id}')">Accept</button>` : ''}
        ${h.approvalRequired && h.state === 'AWAITING HUMAN APPROVAL' ? `<button class="ha approve" onclick="approveHandoff('${h.id}','review')">Approve for client review</button><button class="ha approve alt" onclick="approveHandoff('${h.id}','launch')">Approve for launch</button>` : ''}
        <button class="ha changes" onclick="requestChanges('${h.id}')">Request changes</button>
        <button class="ha reassign" onclick="reassignHandoff('${h.id}')">Reassign</button>
        <button class="ha escalate" onclick="escalateHandoff('${h.id}')">Escalate</button>
        <button class="ha comment" onclick="commentHandoff('${h.id}')">Comment</button>
      </div>`;
    openDrawer(body);
  };

  function refresh(id) { save(); if (id) openHandoff(id); }

  /* ══ F–J. ACTIONS (persist + append verified timeline) ══ */
  window.acceptHandoff = function (id) {
    const h = byId(id); if (!h) return;
    h.state = 'IN PROGRESS'; h.acceptedAt = today();
    log(h, h.owner, `Accepted the handoff · now in progress`, 'verified');
    toast(h.owner + ' accepted ' + h.id); refresh(id);
  };

  window.approveHandoff = function (id, kind) {
    const h = byId(id); if (!h) return;
    h.state = 'COMPLETED'; h.completedAt = today();
    log(h, h.approvalOwner || 'Jonathan', kind === 'launch' ? 'Approved for launch' : 'Approved for client review', 'verified');
    // Move the chain forward: unlock the next PLANNED handoff owned by nextOwner.
    const nxt = H().find(x => x.project === h.project && x.state === 'PLANNED' && x.owner === h.nextOwner);
    if (nxt) { nxt.state = 'ASSIGNED'; nxt.blockers = (nxt.blockers || []).filter(b => !/waiting on/i.test(b)); log(nxt, 'Atlas', `Unblocked by ${h.id} approval · assigned to ${nxt.owner}`, 'verified'); }
    toast('Approved ' + h.id + (nxt ? ` → ${nxt.id} assigned to ${nxt.owner}` : '')); refresh(id);
  };

  window.requestChanges = function (id) {
    const h = byId(id); if (!h) return;
    const reason = window.prompt('Request changes — what needs to change?', '');
    if (reason === null) return;
    h.state = 'IN PROGRESS';
    const back = h.prevOwner || h.owner;
    h.decisions = h.decisions || []; h.decisions.push('Changes requested: ' + reason);
    log(h, 'Jonathan', `Requested changes → back to ${back}: ${reason}`, 'verified');
    // bounce ownership back to whoever produced the work
    if (h.prevOwner) { h.nextOwner = h.owner; h.nextType = h.ownerType; h.owner = h.prevOwner; h.ownerType = h.prevType; }
    toast('Changes requested on ' + h.id); refresh(id);
  };

  window.reassignHandoff = function (id) {
    const h = byId(id); if (!h) return;
    const names = (typeof mockData !== 'undefined') ? mockData.agentWorkforce.map(a => a.agent).join(', ') : '';
    const who = window.prompt('Reassign current owner to which agent?\n(' + names + ')', h.owner);
    if (!who) return;
    const agent = (typeof mockData !== 'undefined') && mockData.agentWorkforce.find(a => a.agent.toLowerCase() === who.trim().toLowerCase());
    h.owner = agent ? agent.agent : who.trim(); h.ownerType = agent ? 'agent' : 'human';
    log(h, 'Jonathan', `Reassigned to ${h.owner}`, 'verified');
    toast(h.id + ' reassigned to ' + h.owner); refresh(id);
  };

  window.escalateHandoff = function (id) {
    const h = byId(id); if (!h) return;
    const reason = window.prompt('Escalation reason?', '');
    if (!reason) return;
    h.escalation = reason;
    log(h, 'Jonathan', `Escalated: ${reason}`, 'verified');
    toast('Escalated ' + h.id); refresh(id);
  };

  window.commentHandoff = function (id) {
    const h = byId(id); if (!h) return;
    const c = window.prompt('Add a comment / note to this handoff:', '');
    if (!c) return;
    log(h, 'Jonathan', 'Comment: ' + c, 'manual');
    toast('Comment added to ' + h.id); refresh(id);
  };
})();
