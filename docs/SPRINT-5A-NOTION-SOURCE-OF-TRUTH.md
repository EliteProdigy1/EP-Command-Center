# Sprint 5A — Notion as the Single Source of Truth

Notion is the master database for the EP Command Center. The dashboard reads
from Notion on open and writes back on every change; localStorage is only an
offline cache, never the source of truth once Notion is available.

```
Open:  Notion ──► Dashboard
Edit:  Dashboard ──► Notion ──► refresh ──► every device shows the same data
```

## One reusable write layer (no duplicated Notion code)
All writes go through `writeNotion(db, action, payload)` in `services/notion.js`,
which always resolves to `{ ok, ... }` (never throws) so callers can show a
visible success/failure toast. Named helpers sit on top:

| Helper | Writes to |
|--------|-----------|
| `createProspect(record)` | Prospects DB |
| `updateProspect(pageId, patch)` | Prospects page (status, follow-up, **appended call note**, scores) |
| `createCallNote(record)` | **Call Notes DB** (new) |
| `createMeeting(record)` | **Meetings DB** (new) |
| `createWebsiteProject(record)` | Projects DB |
| `updateProjectStatus(pageId, patch)` | Projects page (Stage / Status) |
| `appendTimelineEvent(pageId, text, db)` | appends a timestamped note to any record |

Server side, `netlify/functions/notion.js` has `action=create` (per-DB property
builders) and `action=update` (PATCH a page; notes are read-then-appended so
history is preserved). The key stays in Netlify env vars.

## New Notion databases (created under ⚡️EP OPERATING SYSTEM)
| DB | Env var | ID |
|----|---------|----|
| 📞 Call Notes | `NOTION_DATABASE_CALLNOTES` | `cfb42da5a0c04ae88a4ab1b24a8776ad` |
| 🗓️ Meetings | `NOTION_DATABASE_MEETINGS` | `10d1b652f19b418d9e9a6e0fc0c5b510` |

**Add these two variables in Netlify → Environment variables and redeploy.**
They live under the shared EP OPERATING SYSTEM page, so your integration already
has access.

## What now writes to Notion
- **Firecrawl discovery → Prospect** (Sprint 6 `createProspect`).
- **Quick Add Prospect** modal (topbar **＋ Prospect**): Company, Contact, Role,
  Phone, Email, Industry, City, Notes, Status, Next Follow-up → creates the
  Notion record, refreshes the dashboard, no reload.
- **Call Mode outcomes** → a Call Notes record **and** an update to the
  prospect's page (status + follow-up + appended note).
- **Meeting Notes** modal (topbar **🗓 Meeting**) → Meetings DB.
- **⟳ Sync** re-pulls from Notion so every device converges.

## Voice-ready ("Talk to Junior")
Every write goes through `window.EPIntake.{prospect,meeting,callNote}(record)` —
plain record objects in, Notion out. A future voice feature builds the **same
record** and calls the **same method**; no database or backend change is needed.
The typed modals are simply the first caller of that API.

## Honest scope
- Sync is on-open + on-demand (⟳ Sync) + write-through, i.e. eventual
  consistency across devices — not live websocket push.
- Records created while Notion is unconfigured/offline are kept locally and get
  a Notion page (and `notionId`) the next time a write succeeds.
- Not modified this sprint: Firecrawl discovery, Website Intelligence, Sales
  Agent logic.
