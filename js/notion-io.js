/* ═══════════════════════════════════════════════════════════════
   EP COMMAND CENTER — NOTION I/O  (Sprint 5A)
   ─────────────────────────────────────────────────────────────
   Notion is the source of truth. This module holds the write-side UX:
   Quick Add Prospect + Meeting Notes modals, and ONE shared intake API
   (window.EPIntake) that every writer goes through.

   EPIntake.prospect(record) / .meeting(record) / .callNote(record)
   each: build a plain record → write to Notion via the reusable
   notionService helpers → update local state → refresh UI → return
   Promise<{ok}> with a visible toast.

   VOICE-READY: a future "Talk to Junior" feature builds the SAME record
   object and calls the SAME EPIntake.* method — no backend/database
   change. The modal handlers are just one caller of that API.

   Uses globals from app.js (uid, todayStr, S, save, toast, goSection,
   renderAll) and services/notion.js (notionService.*).
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function modal(html) {
    var back = document.getElementById('ep-modal-back');
    if (!back) {
      back = document.createElement('div'); back.id = 'ep-modal-back'; back.className = 'ep-modal-back';
      back.addEventListener('click', function (e) { if (e.target === back) closeModal(); });
      document.body.appendChild(back);
    }
    back.innerHTML = '<div class="ep-modal" role="dialog" aria-modal="true">' + html + '</div>';
    back.classList.add('open');
    var f = back.querySelector('input, textarea, select'); if (f) setTimeout(function () { f.focus(); }, 60);
  }
  function closeModal() { var b = document.getElementById('ep-modal-back'); if (b) b.classList.remove('open'); }
  window.closeModal = closeModal;
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function field(id, label, type, dflt) { return '<label class="ep-field"><span>' + label + '</span><input id="' + id + '" type="' + (type || 'text') + '"' + (dflt ? ' value="' + dflt + '"' : '') + '></label>'; }
  function selectField(id, label, opts) { return '<label class="ep-field"><span>' + label + '</span><select id="' + id + '">' + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select></label>'; }

  // ── Shared intake API (voice-ready) ──────────────────────────────
  var Intake = {
    // Create a prospect: local-first (instant UI) → Notion → reconcile id.
    prospect: function (rec) {
      var loc = String(rec.city || rec.location || '').split(',');
      var record = {
        id: uid(), businessName: rec.company || rec.businessName || 'Untitled',
        industry: rec.industry || '', location: rec.city || rec.location || '',
        city: (rec.city || loc[0] || '').trim(), state: (rec.state || loc[1] || '').trim(),
        contactName: rec.contact || '', role: rec.role || '',
        phone: rec.phone || '', email: rec.email || '',
        websiteUrl: rec.websiteUrl || '', websiteStatus: rec.websiteStatus || 'Needs research',
        websiteScore: (typeof rec.websiteScore === 'number' ? rec.websiteScore : 0),
        opportunityScore: 0, mobileScore: 0, seoScore: 0, designScore: 0,
        sourceTool: rec.sourceTool || 'Manual', opportunityLevel: rec.opportunityLevel || 'Medium',
        pipelineStatus: rec.status || 'New Prospect',
        recommendedAction: rec.recommendedAction || 'Research + first call',
        socialLinks: {}, address: '', category: rec.industry || '', gbpUrl: '', logoUrl: '', photos: [], rating: null, reviews: 0,
        lastChecked: todayStr(), nextFollowUp: rec.nextFollowUp || '', notionUrl: '', notionId: '',
        notes: rec.notes || '',
      };
      S.prospects.unshift(record); save(); // instant UI
      if (!(window.notionService && notionService.createProspect)) { toast('Added “' + record.businessName + '” (local only)', true); return Promise.resolve({ ok: false }); }
      return notionService.createProspect(record).then(function (res) {
        if (res && res.ok) { record.notionId = res.id || ''; record.notionUrl = res.url || ''; save(); toast('“' + record.businessName + '” saved to Notion ✓'); }
        else toast('“' + record.businessName + '” added · Notion: ' + ((res && res.reason) || 'not saved'), true);
        return res;
      });
    },
    // Save a meeting note.
    meeting: function (rec) {
      var record = {
        title: rec.title || ('Meeting — ' + (rec.with || todayStr())), with: rec.with || '',
        date: rec.date || new Date().toISOString().slice(0, 10), attendees: rec.attendees || '',
        type: rec.type || 'Other', notes: rec.notes || '', source: rec.source || 'Typed',
      };
      if (!(window.notionService && notionService.createMeeting)) { toast('Meeting saved (local only)', true); return Promise.resolve({ ok: false }); }
      return notionService.createMeeting(record).then(function (res) {
        toast(res && res.ok ? 'Meeting saved to Notion ✓' : 'Meeting not saved · ' + ((res && res.reason) || ''), !(res && res.ok));
        return res;
      });
    },
    // Log a call note (also called from Call Mode).
    callNote: function (rec) {
      var record = {
        title: rec.title || ('Call — ' + (rec.business || 'prospect')), business: rec.business || '',
        outcome: rec.outcome || '', notes: rec.notes || '', date: rec.date || new Date().toISOString().slice(0, 10),
        nextFollowUp: rec.nextFollowUp || '', agent: rec.agent || 'Human', source: rec.source || 'Typed',
      };
      if (!(window.notionService && notionService.createCallNote)) return Promise.resolve({ ok: false });
      return notionService.createCallNote(record);
    },
  };
  window.EPIntake = Intake;

  // ── Quick Add Prospect modal ─────────────────────────────────────
  window.openQuickAddProspect = function () {
    modal(
      '<div class="ep-modal-head">＋ Quick Add Prospect</div>' +
      '<div class="ep-modal-sub">Saves straight to Notion and appears on every device.</div>' +
      '<div class="ep-form-grid">' +
        field('qa-company', 'Company *', 'text') +
        field('qa-contact', 'Contact', 'text') +
        field('qa-role', 'Role', 'text') +
        field('qa-phone', 'Phone', 'tel') +
        field('qa-email', 'Email', 'email') +
        field('qa-industry', 'Industry', 'text') +
        field('qa-city', 'City', 'text') +
        selectField('qa-status', 'Status', ['New Prospect', 'Needs Research', 'Website Audit', 'Concept Ready', 'Outreach Needed', 'Contacted', 'Follow-Up', 'Proposal Sent']) +
        field('qa-follow', 'Next Follow-up', 'text') +
      '</div>' +
      '<label class="ep-field ep-wide"><span>Notes</span><textarea id="qa-notes" rows="3"></textarea></label>' +
      '<div class="ep-modal-acts"><button class="btn btn-gold" onclick="saveQuickProspect(event)">Save to Notion</button><button class="btn btn-ghost" onclick="closeModal()">Cancel</button></div>'
    );
  };
  window.saveQuickProspect = function (ev) {
    var company = val('qa-company');
    if (!company) { toast('Company name is required', true); return; }
    var rec = { company: company, contact: val('qa-contact'), role: val('qa-role'), phone: val('qa-phone'), email: val('qa-email'), industry: val('qa-industry'), city: val('qa-city'), status: val('qa-status'), nextFollowUp: val('qa-follow'), notes: val('qa-notes') };
    var btn = ev && ev.target; if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    Intake.prospect(rec).then(function () { closeModal(); if (typeof goSection === 'function') goSection('prospects'); });
  };

  // ── Meeting Notes modal ──────────────────────────────────────────
  window.openMeetingNotes = function () {
    modal(
      '<div class="ep-modal-head">🗓 Meeting Notes</div>' +
      '<div class="ep-modal-sub">Type fast — this writes to the Notion Meetings database. (Voice input plugs into the same save.)</div>' +
      '<div class="ep-form-grid">' +
        field('mt-title', 'Title', 'text') +
        field('mt-with', 'With (client / person)', 'text') +
        field('mt-date', 'Date', 'date', new Date().toISOString().slice(0, 10)) +
        selectField('mt-type', 'Type', ['Discovery', 'Proposal', 'Check-in', 'Kickoff', 'Other']) +
      '</div>' +
      '<label class="ep-field ep-wide"><span>Attendees</span><input id="mt-attendees" type="text"></label>' +
      '<label class="ep-field ep-wide"><span>Notes</span><textarea id="mt-notes" rows="8" placeholder="Jot everything…"></textarea></label>' +
      '<div class="ep-modal-acts"><button class="btn btn-gold" onclick="saveMeetingNotes(event)">Save to Notion</button><button class="btn btn-ghost" onclick="closeModal()">Cancel</button></div>'
    );
  };
  window.saveMeetingNotes = function (ev) {
    var rec = { title: val('mt-title'), with: val('mt-with'), date: val('mt-date'), type: val('mt-type'), attendees: val('mt-attendees'), notes: val('mt-notes'), source: 'Typed' };
    if (!rec.notes && !rec.title) { toast('Add a title or some notes', true); return; }
    var btn = ev && ev.target; if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    Intake.meeting(rec).then(function () { closeModal(); });
  };

  // Pull the latest from Notion (source of truth) so every device converges.
  window.syncFromNotion = function () {
    if (typeof bootstrap === 'function') { bootstrap(); toast('Syncing from Notion…'); }
  };

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
}());
