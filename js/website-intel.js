/* ═══════════════════════════════════════════════════════════════
   EP COMMAND CENTER — WEBSITE INTELLIGENCE  (Sprint 4)
   ─────────────────────────────────────────────────────────────
   Turns one prospect into a complete, ready-to-sell website package:
     · Website brief          · Design direction (palette/type/mood)
     · Sitemap                · Sales talking points
     · Estimated project value
     · "Create SiteDrop Prompt" button
     · One-click "Export to Claude Code" (copies a full build spec
        + opens claude.ai/code) so a prospect becomes a proposal
        and a buildable site in seconds.

   All generated LOCALLY from prospect fields — no API, no keys, no
   credits. Depends on globals from app.js (esc, badge, money, openPanel,
   openProspect, S, todayStr).
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Industry kits: on-brand palettes (never generic AI purple/blue),
  //    type pairings, mood, imagery, sitemap, and the primary CTA. ──
  var KITS = [
    { key: ['land', 'lawn', 'turf', 'tree', 'fence', 'concrete', 'hardscape'],
      name: 'Landscaping / Outdoor', tier: 'mid',
      palette: [{ n: 'Deep Green', h: '#1f7a4d' }, { n: 'Earth', h: '#3a2e1f' }, { n: 'Sand', h: '#e8e0d0' }],
      fonts: 'Playfair Display (headings) + Inter (body)', mood: 'Fresh · trustworthy · outdoors · well-kept',
      imagery: 'Crisp before/after lawns, clean edges, golden-hour yards, real crew + trucks',
      pages: ['Home', 'Services', 'Service Areas', 'Gallery (Before & After)', 'Reviews', 'Get a Free Quote'], cta: 'Get a Free Quote' },
    { key: ['pressure', 'window clean', 'wash', 'soft wash', 'gutter'],
      name: 'Exterior Cleaning', tier: 'mid',
      palette: [{ n: 'Aqua', h: '#0ea5b7' }, { n: 'Deep Navy', h: '#0b2540' }, { n: 'Clean White', h: '#f4f7f9' }],
      fonts: 'Poppins (headings) + Inter (body)', mood: 'Clean · crisp · bright · satisfying',
      imagery: 'High-contrast before/after, water arcs, sparkling surfaces, driveway reveals',
      pages: ['Home', 'Services', 'Service Areas', 'Gallery (Before & After)', 'Reviews', 'Get a Free Quote'], cta: 'Get a Free Quote' },
    { key: ['roof', 'gutter', 'siding', 'exterior contractor'],
      name: 'Roofing / Exterior Contractor', tier: 'high',
      palette: [{ n: 'Slate', h: '#2b2f36' }, { n: 'Safety Red', h: '#d1352b' }, { n: 'Steel', h: '#c7ccd1' }],
      fonts: 'Oswald (headings) + Inter (body)', mood: 'Solid · dependable · storm-ready · licensed',
      imagery: 'Drone roof shots, crews on-site, before/after, insurance-claim trust cues',
      pages: ['Home', 'Services', 'Financing', 'Service Areas', 'Gallery', 'Reviews', 'Free Inspection'], cta: 'Book a Free Inspection' },
    { key: ['hvac', 'heating', 'cooling', 'air condition', 'electric', 'plumb'],
      name: 'HVAC / Trades', tier: 'high',
      palette: [{ n: 'Deep Blue', h: '#123a63' }, { n: 'Energy Orange', h: '#f08a24' }, { n: 'White', h: '#f5f7fa' }],
      fonts: 'Barlow (headings) + Inter (body)', mood: 'Reliable · fast · technical · 24/7',
      imagery: 'Techs in uniform, clean vans, tidy installs, emergency-service urgency',
      pages: ['Home', 'Services', 'Financing', 'Service Areas', 'Reviews', 'Emergency / Book'], cta: 'Book Service' },
    { key: ['auto', 'detail', 'car', 'ceramic'],
      name: 'Auto Detailing', tier: 'mid',
      palette: [{ n: 'Jet Black', h: '#0b0b0d' }, { n: 'Chrome', h: '#c7ccd1' }, { n: 'Electric Blue', h: '#2e6bf2' }],
      fonts: 'Sora (headings) + Inter (body)', mood: 'Sleek · premium · glossy · showroom',
      imagery: 'Water beading on paint, reflections, wheels, dramatic before/after interiors',
      pages: ['Home', 'Packages & Pricing', 'Gallery', 'Reviews', 'Book Now'], cta: 'Book Now' },
    { key: ['barber', 'hair', 'salon', 'beauty', 'nail', 'spa', 'loc', 'lash', 'brow'],
      name: 'Barber / Beauty Studio', tier: 'mid',
      palette: [{ n: 'Charcoal', h: '#141210' }, { n: 'Warm Gold', h: '#c9a84c' }, { n: 'Cream', h: '#efe7d8' }],
      fonts: 'Cormorant Garamond (headings) + Inter (body)', mood: 'Sharp · upscale · classic · personal',
      imagery: 'Chair details, fresh cuts/styles, warm studio light, real clients',
      pages: ['Home', 'Services & Pricing', 'Gallery', 'Meet the Team', 'Book Appointment'], cta: 'Book Appointment' },
    { key: ['gym', 'fitness', 'crossfit', 'train', 'martial', 'karate', 'yoga'],
      name: 'Gym / Fitness', tier: 'mid',
      palette: [{ n: 'Black', h: '#0a0a0a' }, { n: 'Volt', h: '#c6f135' }, { n: 'Concrete', h: '#8b9095' }],
      fonts: 'Anton (headings) + Inter (body)', mood: 'Bold · high-energy · disciplined · community',
      imagery: 'Motion shots, sweat + effort, group classes, transformations',
      pages: ['Home', 'Programs', 'Membership & Pricing', 'Trainers', 'Start Free Trial'], cta: 'Start Free Trial' },
    { key: ['chiro', 'medical', 'wellness', 'dental', 'dentist', 'clinic', 'therapy', 'med spa'],
      name: 'Health / Wellness', tier: 'high',
      palette: [{ n: 'Clean Blue', h: '#2f6fb0' }, { n: 'Teal', h: '#2bb5a3' }, { n: 'Soft White', h: '#f4f8fb' }],
      fonts: 'Fraunces (headings) + Inter (body)', mood: 'Calm · professional · trustworthy · modern',
      imagery: 'Bright clean rooms, friendly staff, patients at ease, credentials',
      pages: ['Home', 'Services', 'Conditions We Treat', 'About / Our Team', 'New Patient (Book)'], cta: 'Book a Visit' },
    { key: ['restaurant', 'food', 'cafe', 'grill', 'bar', 'kitchen', 'seafood', 'bbq', 'fish co'],
      name: 'Restaurant / Food', tier: 'mid',
      palette: [{ n: 'Warm Charcoal', h: '#211a17' }, { n: 'Terracotta', h: '#c05a2b' }, { n: 'Cream', h: '#f2e8dc' }],
      fonts: 'Playfair Display (headings) + Inter (body)', mood: 'Appetizing · warm · inviting · local-favorite',
      imagery: 'Hero food shots, steam, plating, packed dining room, coastal vibe',
      pages: ['Home', 'Menu', 'Order / Reserve', 'Gallery', 'About', 'Contact & Hours'], cta: 'Order / Reserve' },
    { key: ['real estate', 'realtor', 'realty', 'listing', 'home'],
      name: 'Real Estate', tier: 'high',
      palette: [{ n: 'Navy', h: '#17223b' }, { n: 'Brass', h: '#b08d57' }, { n: 'White', h: '#f6f6f4' }],
      fonts: 'Cormorant Garamond (headings) + Inter (body)', mood: 'Refined · high-end · editorial · local expert',
      imagery: 'Cinematic property shots, drone, twilight exteriors, agent portrait',
      pages: ['Home', 'Listings', 'Buy', 'Sell', 'About', 'Contact'], cta: 'Book a Consult' },
    { key: ['charter', 'fishing', 'kayak', 'boat', 'tour', 'recreation', 'rental'],
      name: 'Charter / Recreation', tier: 'mid',
      palette: [{ n: 'Ocean', h: '#0b6b8a' }, { n: 'Sunset', h: '#f2a03d' }, { n: 'Sand', h: '#efe3cf' }],
      fonts: 'Sora (headings) + Inter (body)', mood: 'Adventure · coastal · fun · book-the-trip',
      imagery: 'On-the-water action, catches, sunsets, happy groups aboard',
      pages: ['Home', 'Trips & Pricing', 'Gallery', 'Reviews', 'Book a Trip'], cta: 'Book a Trip' },
  ];
  var FALLBACK = {
    name: 'Local Service Business', tier: 'mid',
    palette: [{ n: 'Charcoal', h: '#1c1e22' }, { n: 'Gulf Blue', h: '#2f6fb0' }, { n: 'Warm White', h: '#f4f4f1' }],
    fonts: 'Playfair Display (headings) + Inter (body)', mood: 'Professional · local · trustworthy · clean',
    imagery: 'Real owner + team, work in action, local landmarks, genuine reviews',
    pages: ['Home', 'Services', 'Service Areas', 'Gallery', 'Reviews', 'Contact'], cta: 'Get a Free Quote',
  };

  function kitFor(industry) {
    var s = String(industry || '').toLowerCase();
    for (var i = 0; i < KITS.length; i++) {
      for (var j = 0; j < KITS[i].key.length; j++) { if (s.indexOf(KITS[i].key[j]) !== -1) return KITS[i]; }
    }
    return FALLBACK;
  }

  // ── Estimated project value: transparent breakdown, one-time + growth ──
  function estimateValue(p) {
    var kit = kitFor(p.industry);
    var noSite = (p.websiteStatus === 'No website found') || (Number(p.websiteScore) || 0) <= 20;
    var items = [];
    items.push({ item: '5-page custom website', amount: 1000 });
    if (noSite) items.push({ item: 'Brand Starter (logo + identity)', amount: 500 });
    if (kit.tier === 'high') items.push({ item: 'Booking / financing + service-area SEO', amount: 500 });
    var monthly = kit.tier === 'high' ? 250 : 100;
    var oneTime = items.reduce(function (a, x) { return a + x.amount; }, 0);
    var firstYearGrowth = monthly * 10; // conservative: 10 months of growth plan
    items.push({ item: 'Growth Plan ($' + monthly + '/mo · ≈' + money(firstYearGrowth) + '/yr)', amount: firstYearGrowth });
    return { oneTime: oneTime, monthly: monthly, total: oneTime + firstYearGrowth, items: items, noSite: noSite };
  }
  // Exposed for app.js (prospect card / call queue value math).
  window.estimateProjectValue = estimateValue;

  function talkingPoints(p) {
    var kit = kitFor(p.industry);
    var pts = [];
    var landscaping = /land|lawn|turf/i.test(p.industry || '');
    if (p.websiteStatus === 'No website found' || (Number(p.websiteScore) || 0) <= 20) {
      pts.push('They have NO website — every Google search for "' + p.businessName + '" hands the customer to a competitor who does.');
      pts.push('No way to book, quote, or contact online means every lead is phone tag. A site captures leads 24/7.');
    } else {
      pts.push('Their current site scores ' + (p.websiteScore || 0) + '/100 (' + (p.websiteStatus || 'weak') + ') — it\'s costing them calls, not earning them.');
      pts.push('Ask: "When did your website last bring you a paying customer?" Then offer a free before/after.');
    }
    pts.push(landscaping
      ? 'Proof, not promises: two landscaping sites are already LIVE (Azalea Turf, Warren Landscape) — same industry, same region.'
      : 'Proof, not promises: 6+ local Gulf Coast businesses are already LIVE on Netlify — show the demos on the call.');
    pts.push('Flat $1,000, mobile-ready, live in 48–72 hours, they own it. No contracts. One new ' + (kit.name.toLowerCase()) + ' customer covers it.');
    pts.push('Close: 50% deposit ($500) starts it — Venmo @eliteprodigy / Cash App $ELITEPRODIGYLLC — draft live in 2–3 days.');
    return pts;
  }

  function brief(p) {
    var kit = kitFor(p.industry);
    var val = estimateValue(p);
    return { p: p, kit: kit, val: val, points: talkingPoints(p) };
  }

  // ── Contact & Presence: everything enrichment captured (no re-entry) ──
  function contactBlock(p) {
    var s = p.socialLinks || {};
    var rows = [
      ['Phone', p.phone ? '<a href="tel:' + esc(p.phone) + '" style="color:var(--gold);">' + esc(p.phone) + '</a>' : ''],
      ['Email', p.email ? '<a href="mailto:' + esc(p.email) + '" style="color:var(--gold);">' + esc(p.email) + '</a>' : ''],
      ['Address', p.address ? esc(p.address) : ''],
      ['Category', p.category ? esc(p.category) : ''],
      ['Rating', p.rating ? '★ ' + esc(p.rating) + (p.reviews ? ' (' + p.reviews + ' reviews)' : '') : ''],
      ['Google', p.gbpUrl ? '<a href="' + esc(p.gbpUrl) + '" target="_blank" rel="noopener" style="color:var(--gold);">Business Profile ↗</a>' : ''],
      ['Facebook', s.facebook ? '<a href="' + esc(s.facebook) + '" target="_blank" rel="noopener" style="color:var(--gold);">Facebook ↗</a>' : ''],
      ['Instagram', s.instagram ? '<a href="' + esc(s.instagram) + '" target="_blank" rel="noopener" style="color:var(--gold);">Instagram ↗</a>' : ''],
      ['Notion CRM', p.notionUrl ? '<a href="' + esc(p.notionUrl) + '" target="_blank" rel="noopener" style="color:var(--gold);">Open record ↗</a>' : ''],
    ].filter(function (r) { return r[1]; });
    if (!rows.length && !(p.photos && p.photos.length)) return '';
    var photos = (p.photos && p.photos.length)
      ? '<div class="wi-photos">' + p.photos.slice(0, 6).map(function (u) { return '<img src="' + esc(u) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">'; }).join('') + '</div>'
      : '';
    return '<div class="kv-k" style="margin:2px 0 6px;">Contact &amp; Presence <span style="color:var(--text-3);font-weight:400;">· auto-captured, no manual entry</span></div>' +
      '<div class="panel-kv" style="margin-bottom:12px;">' +
      rows.map(function (r) { return '<div><div class="kv-k">' + esc(r[0]) + '</div><div class="kv-v">' + r[1] + '</div></div>'; }).join('') +
      '</div>' + photos +
      (p.logoUrl ? '<div class="wi-kv" style="margin-bottom:12px;"><b>Logo:</b> <a href="' + esc(p.logoUrl) + '" target="_blank" rel="noopener" style="color:var(--gold);">source ↗</a></div>' : '');
  }

  // ── The panel ──
  function renderWebsiteIntelligence(id) {
    var p = S.prospects.find(function (x) { return x.id === id; });
    if (!p) return;
    var b = brief(p);
    var kit = b.kit, val = b.val;
    var swatches = kit.palette.map(function (c) {
      return '<span style="display:inline-flex;align-items:center;gap:6px;margin:0 10px 8px 0;font-size:11px;color:var(--text-2);">' +
        '<span style="width:16px;height:16px;border-radius:4px;border:1px solid var(--hairline);background:' + c.h + ';"></span>' + esc(c.n) + ' <code style="color:var(--text-3);">' + c.h + '</code></span>';
    }).join('');
    openPanel(
      '<div class="panel-title">' + esc(p.businessName) + '</div>' +
      '<div class="panel-sub">' + esc(p.industry) + ' · ' + esc(p.location) + ' · Website Intelligence Brief</div>' +

      '<div class="wi-value">' +
        '<div><div class="kv-k">Estimated Project Value</div><div class="wi-total">' + money(val.total) + '</div>' +
        '<div style="font-size:11px;color:var(--text-3);">' + money(val.oneTime) + ' one-time + $' + val.monthly + '/mo growth</div></div>' +
        '<div>' + badge(p.opportunityLevel) + '<div style="font-size:11px;color:var(--text-3);margin-top:6px;text-align:right;">score ' + (p.websiteScore || 0) + '/100</div></div>' +
      '</div>' +
      '<div style="margin:6px 0 18px;">' + val.items.map(function (x) {
        return '<div class="wi-line"><span>' + esc(x.item) + '</span><span style="color:var(--gold-light);font-variant-numeric:tabular-nums;">' + money(x.amount) + '</span></div>';
      }).join('') + '</div>' +

      contactBlock(p) +

      '<div class="kv-k" style="margin-bottom:6px;">Website Brief</div>' +
      '<div class="wi-body">Build a modern, mobile-first site that turns "' + esc(kit.name) + '" searchers in ' + esc(p.location) +
        ' into booked jobs. Primary goal: <b>' + esc(kit.cta) + '</b>. ' +
        (val.noSite ? 'This business currently has <b>no website</b> — this is a from-scratch presence.' : 'Replacing a weak/outdated presence (score ' + (p.websiteScore || 0) + ').') +
        '</div>' +

      '<div class="kv-k" style="margin:16px 0 6px;">Design Direction</div>' +
      '<div style="margin-bottom:6px;">' + swatches + '</div>' +
      '<div class="wi-kv"><b>Type:</b> ' + esc(kit.fonts) + '</div>' +
      '<div class="wi-kv"><b>Mood:</b> ' + esc(kit.mood) + '</div>' +
      '<div class="wi-kv"><b>Imagery:</b> ' + esc(kit.imagery) + '</div>' +

      '<div class="kv-k" style="margin:16px 0 6px;">Sitemap</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:8px;">' +
        kit.pages.map(function (pg) { return '<span class="chip" style="cursor:default;">' + esc(pg) + '</span>'; }).join('') + '</div>' +

      '<div class="kv-k" style="margin:16px 0 6px;">Sales Talking Points</div>' +
      '<ul class="wi-points">' + b.points.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +

      '<div style="display:flex;flex-direction:column;gap:9px;margin-top:18px;">' +
        '<button class="btn btn-gold" onclick="exportToClaudeCode(\'' + p.id + '\')">⌘ Export to Claude Code — build the site now</button>' +
        '<button class="btn btn-ghost" onclick="createSiteDropPrompt(\'' + p.id + '\')">⚡ Create SiteDrop Prompt</button>' +
        '<button class="btn btn-ghost" onclick="copyProposal(\'' + p.id + '\')">▤ Copy Client Proposal</button>' +
        '<button class="btn btn-ghost" onclick="openProspect(\'' + p.id + '\')">← Back to prospect</button>' +
      '</div>'
    );
  }

  // ── SiteDrop concept prompt ──
  function createSiteDropPrompt(id) {
    var p = S.prospects.find(function (x) { return x.id === id; });
    if (!p) return;
    var kit = kitFor(p.industry);
    var txt =
      'Design a modern, mobile-first website concept for "' + p.businessName + '", a ' + p.industry +
      ' business in ' + p.location + '.\n\n' +
      'Aesthetic: ' + kit.mood + '.\n' +
      'Palette: ' + kit.palette.map(function (c) { return c.n + ' ' + c.h; }).join(', ') + '.\n' +
      'Type: ' + kit.fonts + '.\n' +
      'Imagery: ' + kit.imagery + '.\n' +
      'Pages: ' + kit.pages.join(', ') + '.\n' +
      'Primary call-to-action on every page: "' + kit.cta + '".\n' +
      'Tone: local, trustworthy, premium-but-approachable. Show a clear hero, services, social proof/reviews, and an easy contact/booking path. No stock-corporate clichés.';
    promptPanel('SiteDrop Prompt', p, txt, 'Paste into SiteDrop (sitedrop.ai) to generate the concept.');
  }

  // ── Full Claude Code build spec + one-click open ──
  function exportToClaudeCode(id) {
    var p = S.prospects.find(function (x) { return x.id === id; });
    if (!p) return;
    var kit = kitFor(p.industry);
    var val = estimateValue(p);
    var repo = p.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var vars = kit.palette.map(function (c, i) { return '  --brand-' + (i + 1) + ': ' + c.h + ';  /* ' + c.n + ' */'; }).join('\n');
    var txt =
'Build a complete, production-ready website for an Elite Prodigy Media client.\n\n' +
'CLIENT\n' +
'- Business: ' + p.businessName + '\n' +
'- Industry: ' + p.industry + ' (' + kit.name + ')\n' +
'- Location: ' + p.location + ' — Gulf Coast, Alabama\n' +
'- Current site: ' + (p.websiteUrl || 'none') + ' (' + (p.websiteStatus || 'n/a') + ')\n' +
(function () {
  var lines = [];
  if (p.phone) lines.push('- Phone: ' + p.phone);
  if (p.email) lines.push('- Email: ' + p.email);
  if (p.address) lines.push('- Address: ' + p.address);
  var s = p.socialLinks || {};
  if (s.facebook) lines.push('- Facebook: ' + s.facebook);
  if (s.instagram) lines.push('- Instagram: ' + s.instagram);
  if (p.gbpUrl) lines.push('- Google Business: ' + p.gbpUrl);
  if (p.rating) lines.push('- Rating: ' + p.rating + (p.reviews ? ' (' + p.reviews + ' reviews) — feature this as social proof' : ''));
  if (p.logoUrl) lines.push('- Existing logo (reuse or refine): ' + p.logoUrl);
  if (p.photos && p.photos.length) lines.push('- Real photos to use: ' + p.photos.slice(0, 6).join('  '));
  return lines.length ? 'REAL DATA — use these exact details, do not invent contact info:\n' + lines.join('\n') + '\n\n' : '\n';
}()) +
'GOAL\n' +
'A modern, fast, mobile-first site whose primary conversion is "' + kit.cta + '". ' + kit.mood + '.\n\n' +
'BRAND TOKENS (CSS :root)\n' +
vars + '\n' +
'  /* Type: ' + kit.fonts + ' */\n\n' +
'SITEMAP (one page each, sections stacked)\n- ' + kit.pages.join('\n- ') + '\n\n' +
'DESIGN\n- Mood: ' + kit.mood + '\n- Imagery: ' + kit.imagery + '\n- Clear hero with the CTA, services grid, reviews/social proof, service areas, strong footer with click-to-call.\n- Accessible, semantic HTML5. No generic AI look (no Inter-purple gradients, no cards-in-cards).\n\n' +
'TECH\n- Static HTML/CSS/JS (no framework needed). Mobile-first, fast, Lighthouse-friendly.\n- Contact/quote form wired to Netlify Forms: <form name="contact" data-netlify="true"> + hidden form-name input.\n- Deploy target: Netlify. Repo name suggestion: ' + repo + '.\n- Include a netlify.toml (publish "."), favicon, and meta/OG tags with the business name + location for local SEO.\n\n' +
'COPY\n- Write real, specific copy for a ' + p.industry + ' business in ' + p.location + '. Local, confident, benefit-led. No lorem ipsum.\n- Every page ends with the "' + kit.cta + '" CTA.\n\n' +
'DELIVERABLE\nA ready-to-deploy site folder. This is a paid EP Media build (est. value ' + money(val.total) + '). Make it look like a premium local brand, not a template.';
    promptPanel('Export to Claude Code', p, txt, 'Copied — opening claude.ai/code. Paste this to build the site.', true);
  }

  // ── Client-facing proposal text ──
  function copyProposal(id) {
    var p = S.prospects.find(function (x) { return x.id === id; });
    if (!p) return;
    var kit = kitFor(p.industry); var val = estimateValue(p);
    var txt =
'ELITE PRODIGY MEDIA — Website Proposal\n' +
'Prepared for: ' + p.businessName + ' · ' + p.location + '\n\n' +
'What you get:\n' +
'• A custom, mobile-ready ' + kit.pages.length + '-page website (' + kit.pages.join(', ') + ')\n' +
'• Designed around one goal: ' + kit.cta + '\n' +
'• Contact/quote form, Google Maps, reviews, local SEO, hosting setup\n' +
'• Live in 48–72 hours · one round of revisions · you own it\n\n' +
'Investment:\n' +
val.items.map(function (x) { return '• ' + x.item + ' — ' + money(x.amount); }).join('\n') + '\n' +
'Estimated first-year value: ' + money(val.total) + ' (' + money(val.oneTime) + ' to build + $' + val.monthly + '/mo growth)\n\n' +
'To start: 50% deposit (' + money(Math.round(val.oneTime / 2)) + ') — Venmo @eliteprodigy · Cash App $ELITEPRODIGYLLC\n' +
'— Jonathan Walton · Elite Prodigy Media · 251.223.0812';
    promptPanel('Client Proposal', p, txt, 'Copy and text/email it to the prospect.');
  }

  // ── Shared prompt/textarea panel with copy (+ optional open Claude Code) ──
  function promptPanel(title, p, text, hint, openClaude) {
    openPanel(
      '<div class="panel-title">' + esc(title) + '</div>' +
      '<div class="panel-sub">' + esc(p.businessName) + ' · ' + esc(hint || 'Copy and use.') + '</div>' +
      '<textarea id="wi-out" style="width:100%;min-height:340px;line-height:1.55;font-family:ui-monospace,Menlo,monospace;font-size:12px;">' + esc(text) + '</textarea>' +
      '<div style="display:flex;gap:9px;margin-top:12px;flex-wrap:wrap;">' +
        '<button class="btn btn-gold" onclick="copyWiOut()">Copy</button>' +
        (openClaude ? '<a class="btn btn-ghost" href="https://claude.ai/code" target="_blank" rel="noopener">Open Claude Code ↗</a>' : '') +
        '<button class="btn btn-ghost" onclick="renderWebsiteIntelligence(\'' + p.id + '\')">← Back to brief</button>' +
      '</div>'
    );
    if (openClaude) { try { window.open('https://claude.ai/code', '_blank', 'noopener'); } catch (e) { /* popup blocked — button still works */ } }
  }
  function copyWiOut() {
    var t = document.getElementById('wi-out'); if (!t) return;
    t.select();
    navigator.clipboard && navigator.clipboard.writeText(t.value).then(
      function () { var b = event.target; var o = b.textContent; b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = o; }, 1400); },
      function () { alert('Select the text and copy manually.'); }
    );
  }

  // ── CRM stats strip (makes the Call Queue feel alive even when empty) ──
  function renderCallQueueStats() {
    var el = document.getElementById('call-queue-stats');
    if (!el) return;
    var goal = (mockData.dailyLeadReport && mockData.dailyLeadReport.goalCalls) || 10;
    var done = (typeof callsToday === 'function') ? callsToday().length : 0;
    var queue = (typeof callQueueProspects === 'function') ? callQueueProspects() : [];
    var pipeVal = queue.reduce(function (a, p) { return a + estimateValue(p).total; }, 0);
    // Top opportunity category among active prospects (fallback to discovery pool).
    var counts = {};
    var pool = (S.prospects && S.prospects.length) ? S.prospects.filter(function (p) { return !['Won', 'Not Fit'].includes(p.pipelineStatus); }) : (mockData.discoveryPool || []);
    pool.forEach(function (p) { counts[p.industry] = (counts[p.industry] || 0) + 1; });
    var topCat = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0] || '—';
    var mock = window.firecrawlService && window.firecrawlService.status && window.firecrawlService.status.discover === 'connected' ? 'Live' : 'Mock Mode';
    var tiles = [
      { ico: '🔥', label: "Today's Goal", val: 'Contact ' + goal },
      { ico: '📞', label: 'Calls Completed', val: done + ' / ' + goal },
      { ico: '💰', label: 'Est. Pipeline Value', val: money(pipeVal) },
      { ico: '⭐', label: 'Top Opportunity', val: topCat },
      { ico: '⏱', label: 'Last Scan', val: mock },
    ];
    el.innerHTML = tiles.map(function (t) {
      return '<div class="cq-stat"><div class="cq-ico">' + t.ico + '</div><div><div class="cq-val">' + esc(String(t.val)) + '</div><div class="cq-label">' + esc(t.label) + '</div></div></div>';
    }).join('');
  }

  // Expose to global (onclick handlers + app.js render loop).
  window.renderWebsiteIntelligence = renderWebsiteIntelligence;
  window.createSiteDropPrompt = createSiteDropPrompt;
  window.exportToClaudeCode = exportToClaudeCode;
  window.copyProposal = copyProposal;
  window.copyWiOut = copyWiOut;
  window.renderCallQueueStats = renderCallQueueStats;
}());
