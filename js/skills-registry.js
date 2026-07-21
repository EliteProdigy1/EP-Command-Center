/* ═══════════════════════════════════════════════════════════════
   SKILLS REGISTRY CONSUMPTION  (N2B)

   The Command Center does NOT hand-maintain skill definitions. The
   Website Factory owns them in EP-Media-Agency/skills/<slug>/, generates
   skills/REGISTRY.json from the folder manifests, and that file is copied
   here verbatim as data/skills-registry.json (a generated artifact).

   This service:
     1. fetches the generated registry,
     2. adapts each registry record into the existing skill card/drawer
        shape (no new skill schema),
     3. layers OPERATIONAL metadata BY SKILL ID onto it, reusing objects
        that already exist — agentWorkforce (assignment), S.handoffs
        (execution history / last run), and the integrations probe
        (connector live-status). No new project/agent/connector/skill
        registry is created.

   The pilot ports 3 skills. Any skill id present in mockData.skills but
   NOT in the registry stays as an INTERIM definition (sourceOfTruth:
   'interim') until it is ported — clearly tagged, never silently mixed
   with source-of-truth records.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Adapt a generated registry record → the shape renderSkills/openSkillDrawer expect.
  // Definitional fields come straight from the manifest; nothing is invented here.
  function adapt(m) {
    return {
      id: m.id,
      name: m.name,
      category: m.category,
      status: m.status,
      version: m.version,
      purpose: m.summary || '',
      inputs: m.inputs || [],
      outputs: m.outputs || [],
      agents: m.authorizedAgents || [],
      tools: [].concat(m.requiredTools || [], m.optionalTools || []),
      approval: m.approvalRules || 'None',
      workflows: m.workflows || [],
      related: m.relatedKnowledge || [],
      limitations: m.limitations || '—',
      // registry-only detail (rendered when present; interim skills lack it)
      requiredTools: m.requiredTools || [],
      optionalTools: m.optionalTools || [],
      connectors: m.connectors || [],
      compatibility: m.compatibility || {},
      sourceRepo: m.sourceRepo || '',
      sourcePaths: m.sourcePaths || [],
      skillPath: m.skillPath || '',
      lastVerified: m.lastVerified || '',
      sourceOfTruth: 'registry',
    };
  }

  // Layer live operational metadata onto a skill, keyed by its id.
  // Reuses S.handoffs, mockData.agentWorkforce, mockData.integrationsMap/automations.
  function layerOps(skill) {
    // Execution history + last run come from the handoff chain-of-custody.
    var hs = (typeof S !== 'undefined' && S && Array.isArray(S.handoffs)) ? S.handoffs : [];
    var runs = hs.filter(function (h) { return (h.skills || []).indexOf(skill.id) !== -1; });
    skill.execHistory = runs.map(function (r) {
      return { project: r.project, task: r.task, state: r.state, when: r.completedAt || r.acceptedAt || r.createdAt || '' };
    });
    skill.execCount = runs.length;
    var done = runs.filter(function (r) { return r.state === 'COMPLETED'; });
    var last = done.length ? done[done.length - 1] : (runs.length ? runs[runs.length - 1] : null);
    skill.lastUsed = last ? (last.project + ' — ' + last.task) : (skill.lastUsed || '—');

    // Assigned agents = authorized agents, each tagged with its live workforce state.
    var wf = (mockData.agentWorkforce || []);
    skill.assignedAgents = (skill.agents || []).map(function (id) {
      var a = wf.find(function (x) { return x.id === id; });
      return a ? { id: a.id, name: a.agent, availability: a.availability || a.status || '—', assignment: a.assignmentStatus || '—' } : { id: id, name: id, availability: '—', assignment: '—' };
    });

    // Connector live-status: cross-reference the existing integrations/automations probe.
    var probe = [].concat(mockData.integrationsMap || [], mockData.automations || []);
    skill.connectorStatus = (skill.connectors || []).map(function (c) {
      var live = probe.some(function (i) {
        var hay = [i.name, i.from, i.to, i.via, i.desc].filter(Boolean).join(' ');
        return new RegExp('\\b' + c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(hay) && /connected/i.test(i.status || '');
      });
      return { name: c.name, declared: c.status, live: live };
    });

    // Usage metric (honest: derived from handoff history only).
    skill.usage = { runs: skill.execCount, lastVerified: skill.lastVerified || null };
    return skill;
  }

  window.skillsRegistry = {
    status: 'fallback',     // 'connected' once the generated registry loads
    generatedAt: null,
    source: null,
    count: 0,
    audit: null,            // the generated non-destructive audit report (N2C)

    // Load the generated audit report (skills/AUDIT.json → data/skills-audit.json).
    // Read-only: the Command Center only records human review INTENT locally; it
    // never renames/moves/deletes/merges or marks a skill Ready.
    async loadAudit() {
      try {
        var res = await fetch('data/skills-audit.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('http ' + res.status);
        var rep = await res.json();
        if (!rep || !Array.isArray(rep.findings)) throw new Error('bad audit shape');
        this.audit = rep;
        return true;
      } catch (e) {
        this.audit = null;
        return false;
      }
    },

    // Merge the generated registry into mockData.skills, in place.
    async load() {
      try {
        var res = await fetch('data/skills-registry.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('http ' + res.status);
        var reg = await res.json();
        if (!reg || !Array.isArray(reg.skills)) throw new Error('bad registry shape');

        this.generatedAt = reg.generatedAt || null;
        this.source = reg.source || null;
        this.count = reg.count || reg.skills.length;

        var byId = {};
        reg.skills.forEach(function (m) { byId[m.id] = m; });

        // Replace ported skills with source-of-truth records; tag the rest interim.
        mockData.skills = (mockData.skills || []).map(function (existing) {
          var m = byId[existing.id];
          if (!m) { existing.sourceOfTruth = 'interim'; return existing; }
          delete byId[existing.id];
          return layerOps(adapt(m));
        });
        // Any registry skill not already present is appended (future-proof; pilot: none).
        Object.keys(byId).forEach(function (id) {
          mockData.skills.push(layerOps(adapt(byId[id])));
        });

        this.status = 'connected';
        return true;
      } catch (e) {
        // Stay on the interim mockData definitions; mark them so the UI is honest.
        (mockData.skills || []).forEach(function (s) { if (!s.sourceOfTruth) s.sourceOfTruth = 'interim'; });
        this.status = 'fallback';
        return false;
      }
    },
  };
})();
