/* ══════════════════════════════════════════════════════════════════
   EP COMMAND CENTER — AGENT OPERATIONS LAYER (Stage 1)
   Additive. Renders: Mission Control command strip, Agent Operations
   (profession-grouped cards + profile drawer), Skills Registry, and the
   Knowledge Library. Reads existing mockData; reuses esc/badge/goSection/
   toast. Introduces NO new persisted state (no epcc-v2 bump).

   HONESTY RULE: only real, derivable numbers are shown. Anything the
   system does not actually track renders as "not tracked yet".
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── helpers ── */
  const A = () => mockData.agentWorkforce;
  const SK = () => mockData.skills;
  const skillById = (id) => SK().find(s => s.id === id);
  const agentById = (id) => A().find(a => a.id === id);
  const isWorking = (a) => ['active', 'working'].includes(String(a.status).toLowerCase());
  const needsApproval = (a) => /^awaiting/i.test(a.approval || '');
  const isBlocked = (a) => needsApproval(a) || /waiting/i.test(a.status || '');

  function statusPill(status) {
    const t = String(status).toLowerCase();
    let cls = 'b-dim';
    if (t === 'working' || t === 'active') cls = 'b-good';
    else if (t.includes('waiting')) cls = 'b-warn';
    else if (t === 'planned') cls = 'b-info';
    else if (t === 'idle') cls = 'b-dim';
    return `<span class="badge ${cls}">${esc(status)}</span>`;
  }

  const GROUP_ORDER = ['Strategy & Orchestration', 'Website Production', 'Media & Creative', 'Sales & Client Success', 'Business Operations'];
  const GROUP_ICON = {
    'Strategy & Orchestration': '◈', 'Website Production': '🏗', 'Media & Creative': '🎬',
    'Sales & Client Success': '◎', 'Business Operations': '▦',
  };

  /* Real, derivable pipeline snapshot from existing state. */
  function pipelineSnapshot() {
    const clients = mockData.clients || [];
    const prospects = (typeof S !== 'undefined' && S.prospects) ? S.prospects : (mockData.prospects || []);
    const deployed = clients.filter(c => /deployed|live|maintenance/i.test(c.status)).length;
    const review = clients.filter(c => /review/i.test(c.status)).length;
    const building = prospects.filter(p => p.buildStage || /audit|concept|proposal|won/i.test(p.pipelineStatus || '')).length;
    const waiting = prospects.filter(p => /new prospect|needs research|outreach/i.test(p.pipelineStatus || '')).length;
    return { deployed, review, building, waiting };
  }

  /* ══ MISSION CONTROL — command strip (the six questions) ══ */
  window.renderMissionStrip = function () {
    const el = document.getElementById('mc-agentstrip');
    if (!el) return;
    const agents = A();
    const working = agents.filter(isWorking);
    const approvals = agents.filter(needsApproval);
    const blocked = agents.filter(a => /waiting/i.test(a.status || ''));
    const skillsReady = SK().filter(s => ['ready', 'connected'].includes(String(s.status).toLowerCase())).length;
    const pipe = pipelineSnapshot();

    // 1 · who is working + 2 · what on
    const workingRows = working.map(a => `
      <button class="strip-agent" onclick="openAgentProfile('${a.id}')" title="Open ${esc(a.agent)}">
        <span class="strip-agent-dot"></span>
        <span class="strip-agent-name">${esc(a.agent)}</span>
        <span class="strip-agent-task">${esc(a.activeTask && a.activeTask !== '—' ? a.activeTask : a.role)}</span>
      </button>`).join('') || '<div class="empty">No agents working right now.</div>';

    // 4 · needs approval  (also surfaces as "what next")
    const approvalRows = approvals.length ? approvals.map(a => `
      <button class="strip-line" onclick="openAgentProfile('${a.id}')">
        <span class="strip-line-b">Approve · ${esc(a.client)}</span>
        <span class="strip-line-s">${esc(a.approval.replace(/^awaiting\s*/i, ''))}</span>
      </button>`).join('') : '<div class="empty">Nothing waiting on you. 🎉</div>';

    // 3 · blocked
    const blockedRows = blocked.length ? blocked.map(a => `
      <div class="strip-line"><span class="strip-line-b">${esc(a.agent)}</span>
        <span class="strip-line-s">${esc(a.activeTask && a.activeTask !== '—' ? a.activeTask : a.status)}</span></div>`).join('')
      : '<div class="empty">Nothing blocked.</div>';

    // 6 · what next (agent next-actions for working agents)
    const nextRows = working.filter(a => a.next).slice(0, 4).map(a => `
      <div class="strip-line"><span class="strip-line-b">${esc(a.agent)}</span>
        <span class="strip-line-s">${esc(a.next)}</span></div>`).join('') || '<div class="empty">—</div>';

    el.innerHTML = `
      <div class="mc-strip">
        <div class="strip-panel strip-lead">
          <div class="strip-head"><span class="strip-q">Who is working</span><span class="strip-count">${working.length} active</span></div>
          <div class="strip-agents">${workingRows}</div>
        </div>

        <div class="strip-panel">
          <div class="strip-head"><span class="strip-q">Needs your approval</span>${approvals.length ? `<span class="strip-count warn">${approvals.length}</span>` : ''}</div>
          ${approvalRows}
        </div>

        <div class="strip-panel">
          <div class="strip-head"><span class="strip-q">Blocked</span>${blocked.length ? `<span class="strip-count warn">${blocked.length}</span>` : ''}</div>
          ${blockedRows}
        </div>

        <div class="strip-panel">
          <div class="strip-head"><span class="strip-q">What's next</span></div>
          ${nextRows}
        </div>

        <div class="strip-panel strip-metrics">
          <div class="strip-head"><span class="strip-q">Capabilities &amp; flow</span></div>
          <div class="strip-mrow">
            <button class="strip-metric" onclick="goSection('skills')"><b>${skillsReady}</b><span>skills ready</span></button>
            <button class="strip-metric" onclick="goSection('agentops')"><b>${A().length}</b><span>agents</span></button>
          </div>
          <div class="strip-pipe">
            <span title="Waiting">${pipe.waiting} waiting</span><span title="Building">${pipe.building} building</span>
            <span title="In review">${pipe.review} review</span><span title="Deployed">${pipe.deployed} live</span>
          </div>
        </div>

        <div class="strip-commands">
          <button onclick="stripCommand('new-client')">＋ New Client</button>
          <button onclick="stripCommand('build')">＋ Build Website</button>
          <button onclick="stripCommand('assets')">＋ Generate Assets</button>
          <button onclick="stripCommand('launch')">＋ Launch</button>
        </div>
      </div>`;
  };

  /* Command palette shortcuts — route to real actions where they exist. */
  window.stripCommand = function (kind) {
    if (kind === 'new-client') {
      if (typeof openQuickAddProspect === 'function') { goSection('prospects'); openQuickAddProspect(); }
      else { goSection('prospects'); toast('New client: add a prospect, or run `npm run ep:new` in the factory'); }
    } else if (kind === 'build') { goSection('buildqueue'); toast('Build: move a client into the Build Queue (factory: `npm run ep:build -- <slug>`)'); }
    else if (kind === 'assets') { goSection('agentops'); openAgentProfile('vera'); }
    else if (kind === 'launch') { goSection('deploys'); toast('Launch: approve-for-launch, then deploy via Netlify'); }
  };

  /* ══ AGENT OPERATIONS — profession-grouped cards ══ */
  window.renderAgentOps = function () {
    const el = document.getElementById('agentops-grid');
    if (!el) return;
    const groups = GROUP_ORDER.filter(g => A().some(a => a.group === g));
    el.innerHTML = `
      <div class="notice"><b>Your AI workforce.</b> Each agent is a persona backed by real tools. Click a card to open its profile — role, skills, current assignment, and history. Numbers are real; anything untracked says so.</div>
      ${groups.map(g => `
        <div class="ao-group">
          <div class="ao-group-h"><span class="ao-group-ico">${GROUP_ICON[g] || '◆'}</span>${esc(g)}
            <span class="ao-group-rule"></span></div>
          <div class="ao-cards">
            ${A().filter(a => a.group === g).map(agentCard).join('')}
          </div>
        </div>`).join('')}`;
  };

  function agentCard(a) {
    const skills = (a.skills || []).map(id => skillById(id)).filter(Boolean);
    return `
      <button class="ao-card" onclick="openAgentProfile('${a.id}')">
        <div class="ao-card-top">
          <div class="ao-avatar">${esc(a.agent[0])}</div>
          <div class="ao-id"><div class="ao-name">${esc(a.agent)}</div><div class="ao-role">${esc(a.role)}</div></div>
          ${statusPill(a.status)}
        </div>
        <div class="ao-now"><span class="ao-k">Now</span>${esc(a.activeTask && a.activeTask !== '—' ? a.activeTask : '—')}</div>
        <div class="ao-skills">${skills.slice(0, 4).map(s => `<span class="chip">${esc(s.name)}</span>`).join('') || '<span class="ao-k">No skills mapped</span>'}</div>
        ${a.approval && needsApproval(a) ? `<div class="ao-flag">⚑ ${esc(a.approval)}</div>` : ''}
      </button>`;
  }

  /* ══ AGENT PROFILE — employee-style drawer ══ */
  window.openAgentProfile = function (id) {
    const a = agentById(id);
    if (!a) return;
    const skills = (a.skills || []).map(sid => skillById(sid)).filter(Boolean);
    const sitesShipped = (mockData.clients || []).filter(c => /deployed|live|maintenance/i.test(c.status)).length;
    // Real metrics only. Production agent shows sites shipped; the rest show what we can derive.
    const metrics = [
      { v: skills.length, k: 'skills' },
      { v: (a.runsOn || []).length, k: 'tools' },
      a.id === 'colt' ? { v: sitesShipped, k: 'sites shipped' } : { v: a.client && a.client !== '—' ? '1' : '0', k: 'assignment' },
      { v: 'not tracked', k: 'build time', dim: true },
    ];
    const body = `
      <div class="drawer-head">
        <div class="ao-avatar lg">${esc(a.agent[0])}</div>
        <div><div class="drawer-title">${esc(a.agent)}</div><div class="drawer-sub">${esc(a.role)} · ${esc(a.group)}</div></div>
        ${statusPill(a.status)}
      </div>
      <div class="drawer-metrics">
        ${metrics.map(m => `<div class="dm ${m.dim ? 'dim' : ''}"><b>${esc(m.v)}</b><span>${esc(m.k)}</span></div>`).join('')}
      </div>
      <div class="drawer-grid">
        <div><h4>Currently working</h4><p>${esc(a.activeTask && a.activeTask !== '—' ? a.activeTask : 'Idle')}${a.client ? ` · <span class="mut">${esc(a.client)}</span>` : ''}</p></div>
        <div><h4>Next task</h4><p>${esc(a.next || '—')}</p></div>
        <div><h4>Last action</h4><p>${esc(a.lastAction || '—')}</p></div>
        <div><h4>Human supervisor</h4><p>${esc(a.supervisor || '—')} · <span class="mut">${esc(a.permissions)}</span></p></div>
      </div>
      ${a.approval && needsApproval(a) ? `<div class="drawer-flag">⚑ ${esc(a.approval)} <button class="mini-btn" onclick="toast('Approval flow lands in Stage 4 — Work Handoffs')">Review</button></div>` : ''}
      <h4 class="drawer-h">Skills</h4>
      <div class="drawer-skills">${skills.map(s => `<button class="chip chip-btn" onclick="closeDrawer();goSection('skills');highlightSkill('${s.id}')">${esc(s.name)} · ${esc(s.status)}</button>`).join('') || '<span class="mut">None mapped</span>'}</div>
      <h4 class="drawer-h">Runs on (real tools)</h4>
      <div class="drawer-tools">${(a.runsOn || []).map(t => `<span class="chip tool">${esc(t)}</span>`).join('')}</div>
      <h4 class="drawer-h">Recent activity</h4>
      <ul class="drawer-timeline">${(a.history || []).map(h => `<li>${esc(h)}</li>`).join('') || '<li class="mut">No history yet.</li>'}</ul>`;
    openDrawer(esc(a.agent), body);
  };

  /* ══ SKILLS REGISTRY ══ */
  window.renderSkills = function () {
    const el = document.getElementById('skills-grid');
    if (!el) return;
    const cats = [...new Set(SK().map(s => s.category))];
    const ready = SK().filter(s => /ready|connected/i.test(s.status)).length;
    el.innerHTML = `
      <div class="notice"><b>Your capability library.</b> A skill is something the workforce knows how to do — reusable across every client. <b>${ready}</b> of ${SK().length} are ready to run today. Statuses are honest: Ready · Connected · Ready to connect · Planned.</div>
      ${cats.map(cat => `
        <div class="ao-group">
          <div class="ao-group-h"><span class="ao-group-ico">◆</span>${esc(cat)}<span class="ao-group-rule"></span></div>
          <div class="sk-cards">${SK().filter(s => s.category === cat).map(skillCard).join('')}</div>
        </div>`).join('')}`;
  };

  function skillStatusPill(status) {
    const t = String(status).toLowerCase();
    let cls = 'b-info';
    if (t === 'ready' || t === 'connected') cls = 'b-good';
    else if (t === 'ready to connect') cls = 'b-gold';
    else if (t === 'planned') cls = 'b-info';
    else if (t === 'needs credentials') cls = 'b-warn';
    return `<span class="badge ${cls}">${esc(status)}</span>`;
  }

  function skillCard(s) {
    const agents = (s.agents || []).map(id => agentById(id)).filter(Boolean);
    return `
      <div class="sk-card" id="skill-${s.id}">
        <div class="sk-top"><div class="sk-name">${esc(s.name)}</div>${skillStatusPill(s.status)}</div>
        <div class="sk-purpose">${esc(s.purpose)}</div>
        <div class="sk-meta">
          <div><span class="sk-k">Uses</span>${agents.map(a => `<button class="chip chip-btn" onclick="openAgentProfile('${a.id}')">${esc(a.agent)}</button>`).join('') || '—'}</div>
          <div><span class="sk-k">Tools</span>${(s.tools || []).map(t => `<span class="chip tool">${esc(t)}</span>`).join('')}</div>
          <div><span class="sk-k">Output</span><span class="mut">${(s.outputs || []).join(' · ')}</span></div>
        </div>
        <div class="sk-foot">
          <span class="sk-k">v${esc(s.version)}</span>
          <span class="sk-k">Last used: ${esc(s.lastUsed || '—')}</span>
          <span class="sk-k">${esc(s.approval && s.approval !== 'None' ? '⚑ ' + s.approval : 'No approval gate')}</span>
        </div>
      </div>`;
  }

  window.highlightSkill = function (id) {
    const el = document.getElementById('skill-' + id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('sk-flash');
    setTimeout(() => el.classList.remove('sk-flash'), 1600);
  };

  /* ══ KNOWLEDGE LIBRARY ══ */
  window.renderKnowledgeLayer = function () {
    const el = document.getElementById('knowledge-library');
    if (!el || !mockData.knowledgeLibrary) return;
    const lib = mockData.knowledgeLibrary;
    el.innerHTML = `
      <div class="notice"><b>Knowledge layer.</b> Every successful project should strengthen the system — templates, brand playbooks, prompts, and SOPs you can reuse across clients. <b>Ready</b> = usable now · <b>Reference</b> = exists as a live site to fold in · <b>Planned</b>.</div>
      <div class="kl-grid">
        ${Object.entries(lib).map(([group, items]) => `
          <div class="kl-col">
            <div class="kl-h">${esc(group)}</div>
            ${items.map(it => `
              <div class="kl-item">
                <div class="kl-row"><span class="kl-name">${esc(it.name)}</span>${knowledgeStatusPill(it.status)}</div>
                <div class="kl-note">${esc(it.note)}</div>
              </div>`).join('')}
          </div>`).join('')}
      </div>`;
  };

  function knowledgeStatusPill(status) {
    const t = String(status).toLowerCase();
    let cls = 'b-info';
    if (t === 'ready') cls = 'b-good';
    else if (t === 'reference') cls = 'b-gold';
    else if (t === 'planned') cls = 'b-info';
    return `<span class="badge ${cls}">${esc(status)}</span>`;
  }

  /* ══ shared drawer ══ */
  function openDrawer(title, html) {
    let d = document.getElementById('ao-drawer');
    if (!d) {
      d = document.createElement('div');
      d.id = 'ao-drawer';
      d.innerHTML = '<div class="drawer-back" onclick="closeDrawer()"></div><aside class="drawer-panel" role="dialog" aria-modal="true"><button class="drawer-x" aria-label="Close" onclick="closeDrawer()">✕</button><div class="drawer-body"></div></aside>';
      document.body.appendChild(d);
    }
    d.querySelector('.drawer-body').innerHTML = html;
    requestAnimationFrame(() => d.classList.add('open'));
    document.addEventListener('keydown', drawerEsc);
  }
  window.closeDrawer = function () {
    const d = document.getElementById('ao-drawer');
    if (d) d.classList.remove('open');
    document.removeEventListener('keydown', drawerEsc);
  };
  function drawerEsc(e) { if (e.key === 'Escape') closeDrawer(); }
})();
