/* ══════════════════════════════════════════════════════════════════
   EP COMMAND CENTER — AGENT OPERATIONS LAYER (Stage 1 + refinements)
   Additive. Mission command strip, Agent Operations (availability vs
   assignment, profiles), Skills Registry (filters + detail drawer),
   Knowledge Library (operable assets). Reuses esc/badge/goSection/toast.
   Handoff panels live in js/handoffs.js.

   HONESTY: every important number carries a provenance tag (srcTag) —
   Live · Registry · Manual · Demo · Not tracked. Nothing untracked is
   dressed up as a live metric.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const A = () => mockData.agentWorkforce;
  const SK = () => mockData.skills;
  const skillById = (id) => SK().find(s => s.id === id);
  const agentById = (id) => A().find(a => a.id === id);
  const agentByName = (n) => A().find(a => a.agent === n);

  /* ── provenance tag ── */
  window.srcTag = function (kind) {
    const p = (typeof PROVENANCE !== 'undefined' && PROVENANCE[kind]) || { label: kind, cls: 'src-untracked', title: '' };
    return `<span class="srctag ${p.cls}" title="${esc(p.title)}">${esc(p.label)}</span>`;
  };

  /* ── status pills: availability (the agent) vs assignment (its work) ── */
  function availPill(v) {
    const t = String(v).toLowerCase(); let cls = 'b-dim';
    if (t === 'available') cls = 'b-good'; else if (t === 'running') cls = 'b-good'; else if (t === 'planned') cls = 'b-info';
    return `<span class="badge ${cls}" title="Agent availability">${esc(v)}</span>`;
  }
  function assignPill(v) {
    const t = String(v).toLowerCase(); let cls = 'b-dim';
    if (t === 'in progress') cls = 'b-warn'; else if (t === 'awaiting approval') cls = 'b-gold';
    else if (t === 'blocked') cls = 'b-bad'; else if (t === 'complete') cls = 'b-good'; else if (t === 'queued') cls = 'b-info';
    return `<span class="badge ${cls}" title="Assignment status">${esc(v)}</span>`;
  }

  const GROUP_ORDER = ['Strategy & Orchestration', 'Website Production', 'Media & Creative', 'Sales & Client Success', 'Business Operations'];
  const GROUP_ICON = { 'Strategy & Orchestration': '◈', 'Website Production': '🏗', 'Media & Creative': '🎬', 'Sales & Client Success': '◎', 'Business Operations': '▦' };

  const handoffs = () => (typeof S !== 'undefined' && S.handoffs) ? S.handoffs : [];

  /* ══ MISSION — command strip: who / approvals / blocked / next ══ */
  window.renderMissionStrip = function () {
    const el = document.getElementById('mc-agentstrip');
    if (!el) return;
    const agents = A();
    const working = agents.filter(a => ['running', 'available'].includes(String(a.availability).toLowerCase()) && String(a.assignmentStatus).toLowerCase() !== 'idle');
    // Approvals now come from the handoff chain (Stage 4).
    const approvals = handoffs().filter(h => h.state === 'AWAITING HUMAN APPROVAL');
    const blocked = handoffs().filter(h => h.state === 'BLOCKED').concat(agents.filter(a => String(a.assignmentStatus).toLowerCase() === 'blocked'));
    const nextRows = agents.filter(a => a.next && ['running', 'available'].includes(String(a.availability).toLowerCase())).slice(0, 4);

    const workRows = working.map(a => `
      <button class="strip-agent" onclick="openAgentProfile('${a.id}')" title="Open ${esc(a.agent)}">
        <span class="strip-agent-dot ${String(a.availability).toLowerCase() === 'running' ? 'run' : ''}"></span>
        <span class="strip-agent-name">${esc(a.agent)}</span>
        <span class="strip-agent-task">${esc(a.activeTask && a.activeTask !== '—' ? a.activeTask : a.role)}</span>
        ${assignPill(a.assignmentStatus)}
      </button>`).join('') || '<div class="empty">No agents working.</div>';

    const apprRows = approvals.length ? approvals.map(h => `
      <button class="strip-line" onclick="openHandoff('${h.id}')">
        <span class="strip-line-b">Approve · ${esc(h.project)} ${h.demo ? srcTag('demo') : ''}</span>
        <span class="strip-line-s">${esc(h.task)} — ${esc(h.approvalOwner)}</span>
      </button>`).join('') : '<div class="empty">Nothing waiting on you. 🎉</div>';

    const blkRows = blocked.length ? blocked.map(x => x.state ? `
      <button class="strip-line" onclick="openHandoff('${x.id}')"><span class="strip-line-b">${esc(x.project)} ${x.demo ? srcTag('demo') : ''}</span>
        <span class="strip-line-s">${esc((x.blockers && x.blockers[0]) || x.task)}</span></button>` : `
      <div class="strip-line"><span class="strip-line-b">${esc(x.agent)}</span><span class="strip-line-s">${esc(x.activeTask || '')}</span></div>`).join('')
      : '<div class="empty">Nothing blocked.</div>';

    const nxtRows = nextRows.length ? nextRows.map(a => `
      <div class="strip-line"><span class="strip-line-b">${esc(a.agent)}</span><span class="strip-line-s">${esc(a.next)}</span></div>`).join('') : '<div class="empty">—</div>';

    el.innerHTML = `
      <div class="mc-strip">
        <div class="strip-panel strip-lead">
          <div class="strip-head"><span class="strip-q">Who is working</span><span class="strip-count">${working.length} active ${srcTag('registry')}</span></div>
          <div class="strip-agents">${workRows}</div>
        </div>
        <div class="strip-panel">
          <div class="strip-head"><span class="strip-q">Needs your approval</span>${approvals.length ? `<span class="strip-count warn">${approvals.length}</span>` : ''}</div>
          ${apprRows}
        </div>
        <div class="strip-panel">
          <div class="strip-head"><span class="strip-q">Blocked</span>${blocked.length ? `<span class="strip-count warn">${blocked.length}</span>` : ''}</div>
          ${blkRows}
        </div>
        <div class="strip-panel">
          <div class="strip-head"><span class="strip-q">What's next</span></div>
          ${nxtRows}
        </div>
      </div>`;
  };

  /* ══ MISSION — capabilities + command bar (below handoffs/activity) ══ */
  window.renderMissionActions = function () {
    const el = document.getElementById('mc-actions');
    if (!el) return;
    const ready = SK().filter(s => /ready|connected/i.test(s.status)).length;
    el.innerHTML = `
      <div class="mc-actions">
        <div class="mca-caps">
          <span class="strip-q">Capabilities</span>
          <button class="strip-metric" onclick="goSection('skills')"><b>${ready}</b><span>skills ready ${srcTag('registry')}</span></button>
          <button class="strip-metric" onclick="goSection('agentops')"><b>${A().length}</b><span>agents ${srcTag('registry')}</span></button>
          <button class="strip-metric" onclick="goSection('handoffs')"><b>${handoffs().length}</b><span>handoffs ${srcTag('demo')}</span></button>
        </div>
        <div class="strip-commands">
          <button onclick="stripCommand('new-client')">＋ New Client</button>
          <button onclick="stripCommand('build')">＋ Build Website</button>
          <button onclick="stripCommand('assets')">＋ Generate Assets</button>
          <button onclick="stripCommand('launch')">＋ Launch</button>
        </div>
      </div>`;
  };

  window.stripCommand = function (kind) {
    if (kind === 'new-client') { if (typeof openQuickAddProspect === 'function') { goSection('prospects'); openQuickAddProspect(); } else { goSection('prospects'); toast('New client: add a prospect, or run `npm run ep:new`'); } }
    else if (kind === 'build') { goSection('buildqueue'); toast('Build: move a client into the Build Queue (factory: `npm run ep:build -- <slug>`)'); }
    else if (kind === 'assets') { goSection('agentops'); openAgentProfile('vera'); }
    else if (kind === 'launch') { goSection('handoffs'); toast('Launch runs through the handoff chain — approve the review handoff first'); }
  };

  /* ══ AGENT OPERATIONS — cards grouped by profession ══ */
  window.renderAgentOps = function () {
    const el = document.getElementById('agentops-grid');
    if (!el) return;
    const groups = GROUP_ORDER.filter(g => A().some(a => a.group === g));
    el.innerHTML = `
      <div class="notice"><b>Your AI workforce.</b> <b>Availability</b> = the agent · <b>Assignment</b> = its current work — separate on purpose (an agent can be free while its task waits on you). Click a card for the full profile. ${srcTag('registry')} numbers are derived; ${srcTag('demo')} are seeded examples.</div>
      ${groups.map(g => `
        <div class="ao-group">
          <div class="ao-group-h"><span class="ao-group-ico">${GROUP_ICON[g] || '◆'}</span>${esc(g)}<span class="ao-group-rule"></span></div>
          <div class="ao-cards">${A().filter(a => a.group === g).map(agentCard).join('')}</div>
        </div>`).join('')}`;
  };

  function agentCard(a) {
    const skills = (a.skills || []).map(id => skillById(id)).filter(Boolean);
    const awaiting = String(a.assignmentStatus).toLowerCase() === 'awaiting approval';
    return `
      <button class="ao-card" onclick="openAgentProfile('${a.id}')">
        <div class="ao-card-top">
          <div class="ao-avatar">${esc(a.agent[0])}</div>
          <div class="ao-id"><div class="ao-name">${esc(a.agent)}</div><div class="ao-role">${esc(a.role)}</div></div>
        </div>
        <div class="ao-statuses">
          <span class="ao-slabel">Agent</span>${availPill(a.availability)}
          <span class="ao-slabel">Work</span>${assignPill(a.assignmentStatus)}
        </div>
        <div class="ao-now"><span class="ao-k">Now</span>${esc(a.activeTask && a.activeTask !== '—' ? a.activeTask : '—')}</div>
        <div class="ao-skills">${skills.slice(0, 4).map(s => `<span class="chip">${esc(s.name)}</span>`).join('') || '<span class="ao-k">No skills mapped</span>'}</div>
        ${awaiting ? `<div class="ao-flag">⚑ ${esc(a.approval)}</div>` : ''}
      </button>`;
  }

  /* ══ AGENT PROFILE drawer ══ */
  window.openAgentProfile = function (id) {
    const a = agentById(id);
    if (!a) return;
    const skills = (a.skills || []).map(sid => skillById(sid)).filter(Boolean);
    const sitesShipped = (mockData.clients || []).filter(c => /deployed|live|maintenance/i.test(c.status)).length;
    const metrics = [
      { v: skills.length, k: 'skills', src: 'registry' },
      { v: (a.runsOn || []).length, k: 'tools', src: 'registry' },
      a.id === 'colt' ? { v: sitesShipped, k: 'sites shipped', src: 'registry' } : { v: a.client && a.client !== '—' ? '1' : '0', k: 'assignment', src: 'registry' },
      { v: '—', k: 'build time', src: 'untracked', dim: true },
    ];
    const myHandoffs = handoffs().filter(h => h.owner === a.agent || h.prevOwner === a.agent || h.nextOwner === a.agent);
    const body = `
      <div class="drawer-head">
        <div class="ao-avatar lg">${esc(a.agent[0])}</div>
        <div><div class="drawer-title">${esc(a.agent)}</div><div class="drawer-sub">${esc(a.role)} · ${esc(a.group)}</div></div>
      </div>
      <div class="drawer-statuses">
        <div><span class="ao-slabel">Agent status</span>${availPill(a.availability)}</div>
        <div><span class="ao-slabel">Assignment</span>${assignPill(a.assignmentStatus)}</div>
      </div>
      <div class="drawer-metrics">
        ${metrics.map(m => `<div class="dm ${m.dim ? 'dim' : ''}"><b>${esc(m.v)}</b><span>${esc(m.k)}</span>${srcTag(m.src)}</div>`).join('')}
      </div>
      <div class="drawer-grid">
        <div><h4>Currently working</h4><p>${esc(a.activeTask && a.activeTask !== '—' ? a.activeTask : 'Idle')}${a.client ? ` · <span class="mut">${esc(a.client)}</span>` : ''}</p></div>
        <div><h4>Next task</h4><p>${esc(a.next || '—')}</p></div>
        <div><h4>Last action</h4><p>${esc(a.lastAction || '—')}</p></div>
        <div><h4>Human supervisor</h4><p>${esc(a.supervisor || '—')} · <span class="mut">${esc(a.permissions)}</span></p></div>
      </div>
      ${String(a.assignmentStatus).toLowerCase() === 'awaiting approval' ? `<div class="drawer-flag">⚑ ${esc(a.approval)} <button class="mini-btn" onclick="closeDrawer();goSection('handoffs')">Open handoff</button></div>` : ''}
      <h4 class="drawer-h">Skills</h4>
      <div class="drawer-skills">${skills.map(s => `<button class="chip chip-btn" onclick="closeDrawer();openSkillDrawer('${s.id}')">${esc(s.name)} · ${esc(s.status)}</button>`).join('') || '<span class="mut">None mapped</span>'}</div>
      <h4 class="drawer-h">Runs on (real tools)</h4>
      <div class="drawer-tools">${(a.runsOn || []).map(t => `<span class="chip tool">${esc(t)}</span>`).join('')}</div>
      <h4 class="drawer-h">Handoffs ${srcTag('demo')}</h4>
      <div class="drawer-skills">${myHandoffs.map(h => `<button class="chip chip-btn" onclick="closeDrawer();openHandoff('${h.id}')">${esc(h.id)} · ${esc(h.task)}</button>`).join('') || '<span class="mut">None yet.</span>'}</div>
      <h4 class="drawer-h">Recent activity</h4>
      <ul class="drawer-timeline">${(a.history || []).map(h => `<li>${esc(h)}</li>`).join('') || '<li class="mut">No history yet.</li>'}</ul>`;
    openDrawer(body);
  };

  /* ══ SKILLS REGISTRY — filters + cards + detail drawer ══ */
  let skillFilter = { status: 'all', category: 'all' };
  window.setSkillFilter = function (dim, val) { skillFilter[dim] = (skillFilter[dim] === val ? 'all' : val); renderSkills(); };

  window.renderSkills = function () {
    const el = document.getElementById('skills-grid');
    if (!el) return;
    const cats = [...new Set(SK().map(s => s.category))];
    const statuses = ['Ready', 'Connected', 'Ready to connect', 'Planned'];
    const ready = SK().filter(s => /ready|connected/i.test(s.status)).length;
    const chip = (dim, val) => `<button class="fchip ${skillFilter[dim] === val ? 'on' : ''}" onclick="setSkillFilter('${dim}','${val}')">${esc(val)}</button>`;

    let list = SK().slice();
    if (skillFilter.status !== 'all') list = list.filter(s => s.status === skillFilter.status);
    if (skillFilter.category !== 'all') list = list.filter(s => s.category === skillFilter.category);
    const shownCats = [...new Set(list.map(s => s.category))];

    el.innerHTML = `
      <div class="notice"><b>Your capability library.</b> A skill is something the workforce knows how to do — reusable across every client. <b>${ready}</b> of ${SK().length} ready. Click any skill for agents · tools · inputs · outputs · approval rules · limitations · related knowledge.</div>
      <div class="filterbar">
        <span class="fb-label">Status</span>${statuses.map(s => chip('status', s)).join('')}
        <span class="fb-sep"></span><span class="fb-label">Area</span>${cats.map(c => chip('category', c)).join('')}
      </div>
      ${shownCats.length ? shownCats.map(cat => `
        <div class="ao-group">
          <div class="ao-group-h"><span class="ao-group-ico">◆</span>${esc(cat)}<span class="ao-group-rule"></span></div>
          <div class="sk-cards">${list.filter(s => s.category === cat).map(skillCard).join('')}</div>
        </div>`).join('') : '<div class="empty" style="padding:40px;">No skills match this filter.</div>'}`;
  };

  function skillStatusPill(status) {
    const t = String(status).toLowerCase(); let cls = 'b-info';
    if (t === 'ready' || t === 'connected') cls = 'b-good'; else if (t === 'ready to connect') cls = 'b-gold';
    else if (t === 'needs credentials') cls = 'b-warn';
    return `<span class="badge ${cls}">${esc(status)}</span>`;
  }

  function skillCard(s) {
    const agents = (s.agents || []).map(id => agentById(id)).filter(Boolean);
    return `
      <div class="sk-card" id="skill-${s.id}" onclick="openSkillDrawer('${s.id}')">
        <div class="sk-top"><div class="sk-name">${esc(s.name)}</div>${skillStatusPill(s.status)}</div>
        <div class="sk-purpose">${esc(s.purpose)}</div>
        <div class="sk-meta">
          <div><span class="sk-k">Uses</span>${agents.map(a => `<span class="chip">${esc(a.agent)}</span>`).join('') || '—'}</div>
          <div><span class="sk-k">Tools</span>${(s.tools || []).slice(0, 4).map(t => `<span class="chip tool">${esc(t)}</span>`).join('')}</div>
        </div>
        <div class="sk-foot"><span class="sk-k">v${esc(s.version)}</span><span class="sk-k">Last: ${esc(s.lastUsed || '—')}</span><span class="sk-more">Details →</span></div>
      </div>`;
  }

  window.openSkillDrawer = function (id) {
    const s = skillById(id);
    if (!s) return;
    const agents = (s.agents || []).map(a => agentById(a)).filter(Boolean);
    const body = `
      <div class="drawer-head"><div class="ao-avatar lg">◆</div>
        <div><div class="drawer-title">${esc(s.name)}</div><div class="drawer-sub">${esc(s.category)} · v${esc(s.version)}</div></div>${skillStatusPill(s.status)}</div>
      <p class="sk-purpose" style="margin-bottom:16px;">${esc(s.purpose)}</p>
      <div class="drawer-grid">
        <div><h4>Input format</h4><p>${(s.inputs || []).map(esc).join(' · ') || '—'}</p></div>
        <div><h4>Output format</h4><p>${(s.outputs || []).map(esc).join(' · ') || '—'}</p></div>
        <div><h4>Approval rules</h4><p>${esc(s.approval && s.approval !== 'None' ? s.approval : 'No approval gate')}</p></div>
        <div><h4>Last successful run</h4><p>${esc(s.lastUsed || '—')}</p></div>
      </div>
      <h4 class="drawer-h">Agents who can use it</h4>
      <div class="drawer-skills">${agents.map(a => `<button class="chip chip-btn" onclick="closeDrawer();openAgentProfile('${a.id}')">${esc(a.agent)}</button>`).join('') || '<span class="mut">—</span>'}</div>
      <h4 class="drawer-h">Required tools</h4>
      <div class="drawer-tools">${(s.tools || []).map(t => `<span class="chip tool">${esc(t)}</span>`).join('')}</div>
      <h4 class="drawer-h">Known limitations</h4>
      <p class="mut" style="font-size:12.5px;line-height:1.5;">${esc(s.limitations || '—')}</p>
      <h4 class="drawer-h">Related knowledge</h4>
      <div class="drawer-skills">${(s.related || []).map(r => `<button class="chip chip-btn" onclick="closeDrawer();goSection('knowledge')">${esc(r)}</button>`).join('') || '<span class="mut">—</span>'}</div>
      <h4 class="drawer-h">Workflows</h4>
      <div class="drawer-tools">${(s.workflows || []).map(w => `<span class="chip">${esc(w)}</span>`).join('') || '<span class="mut">—</span>'}</div>`;
    openDrawer(body);
  };

  window.highlightSkill = function (id) {
    const el = document.getElementById('skill-' + id);
    if (!el) return; el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('sk-flash'); setTimeout(() => el.classList.remove('sk-flash'), 1600);
  };

  /* ══ KNOWLEDGE LIBRARY — operable assets ══ */
  window.renderKnowledgeLayer = function () {
    const el = document.getElementById('knowledge-library');
    if (!el || !mockData.knowledgeLibrary) return;
    const lib = mockData.knowledgeLibrary;
    el.innerHTML = `
      <div class="notice"><b>Knowledge layer.</b> Reusable production assets — every win compounds. <b>Ready</b> = usable now · <b>Reference</b> = a live site to fold in · <b>Planned</b>. Each asset can be previewed, used in a build, or assigned to an agent.</div>
      <div class="kl-grid">
        ${Object.entries(lib).map(([group, items]) => `
          <div class="kl-col"><div class="kl-h">${esc(group)}</div>
            ${items.map((it, i) => `
              <div class="kl-item">
                <div class="kl-row"><span class="kl-name">${esc(it.name)}</span>${knowledgeStatusPill(it.status)}</div>
                <div class="kl-note">${esc(it.note)}</div>
                <div class="kl-actions">
                  <button onclick="klAction('preview','${esc(group)}','${i}')" title="Preview">Preview</button>
                  <button onclick="klAction('use','${esc(group)}','${i}')" title="Use in a build">Use in Build</button>
                  <button onclick="klAction('assign','${esc(group)}','${i}')" title="Assign to an agent">Assign</button>
                  <button onclick="klAction('duplicate','${esc(group)}','${i}')" title="Duplicate">Duplicate</button>
                  <button onclick="klAction('version','${esc(group)}','${i}')" title="Version history">v1.0</button>
                </div>
              </div>`).join('')}
          </div>`).join('')}
      </div>`;
  };

  window.klAction = function (kind, group, i) {
    const it = (mockData.knowledgeLibrary[group] || [])[i] || {};
    if (kind === 'preview') {
      if (it.status === 'Reference') toast('Preview: ' + it.name + ' — live reference site (open from Sites)');
      else if (it.status === 'Ready') toast('Preview opens in the Website Review Studio (Stage 5)');
      else toast(it.name + ' is Planned — nothing to preview yet');
    } else if (kind === 'use') { goSection('buildqueue'); toast('Use “' + it.name + '” in a build — pick a client in the Build Queue'); }
    else if (kind === 'assign') { goSection('agentops'); toast('Assign “' + it.name + '” — open an agent to hand it to them (wired to handoffs)'); }
    else if (kind === 'duplicate') { toast('Duplicated “' + it.name + '” as a draft (demo — not persisted yet)'); }
    else if (kind === 'version') { toast(it.name + ' · v1.0 · created 2026 — full version history in a later stage'); }
  };

  function knowledgeStatusPill(status) {
    const t = String(status).toLowerCase(); let cls = 'b-info';
    if (t === 'ready') cls = 'b-good'; else if (t === 'reference') cls = 'b-gold';
    return `<span class="badge ${cls}">${esc(status)}</span>`;
  }

  /* ══ shared drawer (also used by handoffs.js) ══ */
  window.openDrawer = function (html) {
    let d = document.getElementById('ao-drawer');
    if (!d) {
      d = document.createElement('div'); d.id = 'ao-drawer';
      d.innerHTML = '<div class="drawer-back" onclick="closeDrawer()"></div><aside class="drawer-panel" role="dialog" aria-modal="true"><button class="drawer-x" aria-label="Close" onclick="closeDrawer()">✕</button><div class="drawer-body"></div></aside>';
      document.body.appendChild(d);
    }
    d.querySelector('.drawer-body').innerHTML = html;
    requestAnimationFrame(() => d.classList.add('open'));
    document.addEventListener('keydown', drawerEsc);
  };
  window.closeDrawer = function () { const d = document.getElementById('ao-drawer'); if (d) d.classList.remove('open'); document.removeEventListener('keydown', drawerEsc); };
  function drawerEsc(e) { if (e.key === 'Escape') closeDrawer(); }
})();
