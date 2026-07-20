/* ══════════════════════════════════════════════════════════════════
   EP COMMAND CENTER — N1 UNIVERSAL NAVIGATION (additive)
   Wraps the EXISTING goSection + drawers. No new router, no new store.
   - browser-history-aware Back on every route + full-screen view
   - closes an open drawer/modal/panel/sidebar BEFORE navigating back
   - restores prior route + scroll position
   - breadcrumbs (desktop) + sticky back/title bar (mobile/iPad)
   - lightweight in-memory recent-locations history
   - deep-link (#section) on load; falls back to Mission Control safely
   Mission Control stays reachable via the existing sidebar.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var KNOWN = [];                 // valid section ids (from the sidebar)
  var scrollMap = {};             // section id -> last scrollY
  var recent = [];                // [{s, title}] in memory, capped
  var current = 'mission';
  var suppressPush = false;       // guard while handling popstate

  function titleText(section) {
    var raw = (typeof TITLES !== 'undefined' && TITLES[section]) || section;
    return String(raw).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
  }

  /* ── overlays: detect + close the top-most one ── */
  function overlayOpen() {
    return !!(
      (document.getElementById('ep-modal-back') && document.getElementById('ep-modal-back').classList.contains('open')) ||
      (document.getElementById('slide-panel') && document.getElementById('slide-panel').classList.contains('open')) ||
      (document.getElementById('ao-drawer') && document.getElementById('ao-drawer').classList.contains('open')) ||
      (document.getElementById('sidebar') && document.getElementById('sidebar').classList.contains('open'))
    );
  }
  function closeTopOverlay() {
    var m = document.getElementById('ep-modal-back');
    if (m && m.classList.contains('open')) { if (window.closeModal) closeModal(); return true; }
    var p = document.getElementById('slide-panel');
    if (p && p.classList.contains('open')) { if (window.closePanel) closePanel(); return true; }
    var d = document.getElementById('ao-drawer');
    if (d && d.classList.contains('open')) { if (window.closeDrawer) closeDrawer(); updateChrome(); return true; }
    var s = document.getElementById('sidebar');
    if (s && s.classList.contains('open')) { if (window.closeSidebar) closeSidebar(); return true; }
    return false;
  }

  /* ── the single Back entry point (topbar + mobile bar) ── */
  window.epBack = function () {
    if (closeTopOverlay()) return;      // requirement: close overlay first
    history.back();                     // popstate handler walks the section stack / falls back to mission
  };

  /* ── recent-locations ── */
  function pushRecent(section) {
    var title = titleText(section);
    recent = recent.filter(function (r) { return r.s !== section; });
    recent.unshift({ s: section, title: title });
    if (recent.length > 8) recent.length = 8;
  }
  window.toggleRecent = function (e) {
    if (e) e.stopPropagation();
    var menu = document.getElementById('recent-menu');
    if (!menu) return;
    var open = menu.classList.toggle('open');
    if (open) {
      menu.innerHTML = recent.length
        ? recent.map(function (r) { return '<button onclick="goSection(\'' + r.s + '\');closeRecent()">' + r.title + '</button>'; }).join('')
        : '<div class="recent-empty">No recent locations yet.</div>';
      setTimeout(function () { document.addEventListener('click', closeRecentOnce); }, 0);
    }
  };
  window.closeRecent = function () { var m = document.getElementById('recent-menu'); if (m) m.classList.remove('open'); };
  function closeRecentOnce() { closeRecent(); document.removeEventListener('click', closeRecentOnce); }

  /* ── chrome: breadcrumbs + mobile title + back-button state ── */
  function updateChrome() {
    var sectionTitle = titleText(current);
    var overlayTitle = '';
    var d = document.getElementById('ao-drawer');
    if (d && d.classList.contains('open')) {
      var t = d.querySelector('.drawer-title');
      overlayTitle = t ? t.textContent.trim() : 'Detail';
    }
    var bc = document.getElementById('breadcrumbs');
    if (bc) {
      var parts = ['<button class="crumb" onclick="goSection(\'mission\')">Mission Control</button>'];
      if (current !== 'mission') parts.push('<span class="crumb-sep">›</span><button class="crumb" onclick="goSection(\'' + current + '\')">' + sectionTitle + '</button>');
      if (overlayTitle) parts.push('<span class="crumb-sep">›</span><span class="crumb cur">' + overlayTitle + '</span>');
      bc.innerHTML = parts.join('');
    }
    var mt = document.getElementById('mnb-title');
    if (mt) mt.textContent = overlayTitle || sectionTitle;
    var back = document.getElementById('nav-back');
    if (back) back.classList.toggle('disabled', current === 'mission' && recent.length <= 1 && !overlayOpen());
  }
  window.updateChrome = updateChrome;

  /* ── wrap the EXISTING goSection (do not replace it) ── */
  function install() {
    KNOWN = Array.prototype.map.call(document.querySelectorAll('.nav-link[data-section]'), function (a) { return a.getAttribute('data-section'); });
    if (typeof window.goSection !== 'function') { setTimeout(install, 60); return; }
    var _go = window.goSection;

    window.goSection = function (target, opts) {
      if (target && target !== current) scrollMap[current] = window.scrollY || 0;   // save outgoing scroll
      _go(target);                                                                  // existing behavior (nav highlight, section swap, close overlays)
      current = target;
      if (!(opts && opts.pop)) { pushRecent(target); if (!suppressPush) history.pushState({ s: target }, '', '#' + target); }
      // scroll: forward → top (existing did this); back → restore saved
      window.scrollTo(0, (opts && opts.pop) ? (scrollMap[target] || 0) : 0);
      updateChrome();
    };

    // reflect drawer open/close in the breadcrumb + mobile title
    if (typeof window.openDrawer === 'function') {
      var _open = window.openDrawer;
      window.openDrawer = function (html) { _open(html); requestAnimationFrame(updateChrome); };
    }
    if (typeof window.closeDrawer === 'function') {
      var _close = window.closeDrawer;
      window.closeDrawer = function () { _close(); updateChrome(); };
    }

    // history: close overlay first, else render previous section, else Mission Control
    window.addEventListener('popstate', function (e) {
      if (overlayOpen()) { closeTopOverlay(); history.pushState({ s: current }, '', '#' + current); return; }
      var target = (e.state && e.state.s) || 'mission';
      if (!KNOWN.length || KNOWN.indexOf(target) === -1) target = 'mission';
      suppressPush = true;
      window.goSection(target, { pop: true });
      suppressPush = false;
    });

    // manual hash edits / hash-only navigation → normalize (unknown → mission)
    window.addEventListener('hashchange', function () {
      var h = (location.hash || '').replace('#', '');
      var t = (KNOWN.indexOf(h) !== -1) ? h : 'mission';
      if (t !== current || h !== t) {
        suppressPush = true; window.goSection(t, { pop: true }); suppressPush = false;
        if (h !== t) history.replaceState({ s: t }, '', '#' + t);
      }
    });

    // deep-link on load: #section if known, else safe fallback to mission
    var hash = (location.hash || '').replace('#', '');
    var start = (KNOWN.indexOf(hash) !== -1) ? hash : 'mission';
    history.replaceState({ s: start }, '', '#' + start);
    suppressPush = true; window.goSection(start, { pop: true }); suppressPush = false;
    updateChrome();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
