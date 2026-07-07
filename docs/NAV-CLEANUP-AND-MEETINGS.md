# Navigation Cleanup + Today's Meetings

Cleanup only — no new major features. Notion sync/write-through, Firecrawl,
Sales Agent, Website Intelligence, and Call Mode are unchanged.

## Home (Mission Control) — 5 focus cards
The home grid now shows only what matters today:
1. **🗓 Today's Meetings** — reads the Notion **Meetings** database (source of
   truth). Shows business/with, day + time, type, notes, and a derived **next
   action** (Discovery → "Prep proposal & pricing", Proposal → "Follow up to
   close", etc.). Surfaces today + upcoming, so **tomorrow's meeting is visible**
   (e.g. Elvin Little / Azalea Turf & Lawn appears if it's in Notion).
2. **☎ Call Queue** — top prospects to dial.
3. **🔥 Hot Prospects** — high-opportunity prospects.
4. **🌐 Active Client Sites** — live Netlify deployments.
5. **✓ Tasks Due Today** — due-today / high-priority tasks.

Every card links to its full section; the Meetings card's **＋ Add** opens the
Meeting Notes modal.

## Sidebar — grouped + collapsible
Home sits at the top; everything else is grouped into collapsible sections so
the sidebar isn't crowded: **Sales · Operations · Sites & Repos · AI Team ·
Integrations · Knowledge · Personal**. Sales is open by default; clicking a
group header toggles it, and navigating to a section auto-expands its group.

## Topbar quick buttons (kept)
**＋ Prospect · 🗓 Meeting · ⟳ Sync · Notion** (the data-status pill), plus
Focus / Backup / Restore.

## Data plumbing
- `netlify/functions/notion.js`: added a `meetings` read-mapper so `?db=meetings`
  returns meeting rows.
- `services/notion.js`: `getMeetings()` (read-only; kept out of the Integration
  Status roll-up).
- `js/app.js`: `bootstrap()` loads meetings from Notion and re-renders Home.

## Bonus hardening (data quality)
Enrichment now filters template placeholder values (`555-555-5555`,
`mymail@mailservice.com`, bare `facebook.com/`) so theme boilerplate never
reaches Notion records.
