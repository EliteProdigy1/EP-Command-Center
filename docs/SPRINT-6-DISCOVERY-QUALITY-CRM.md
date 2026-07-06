# Sprint 6 — Discovery Quality & CRM Automation

Individual businesses only, enriched on discovery, auto-saved to the Notion CRM.
The user never re-enters prospect data.

## 1. Discovery quality (individual businesses only)
`netlify/functions/firecrawl.js` filters every search result:
- **Excludes** listicles ("Top 10 / Best N …"), "near me" pages, and directory
  **search/category** pages (`/search`, `/companylist`, `/category`, `/browse`,
  aggregator hosts like Angi/Yelp-search/Thumbtack/BBB without a profile path).
- **Keeps** genuine single businesses: own domains, Yelp `/biz/` profiles,
  Facebook/Instagram business pages, Google Business (`/maps/place`, `g.page`).
- Results on a directory/social page (no own domain) are flagged **no-website =
  highest opportunity** and floated to the top.

## 2. Enrichment (per business)
`action=enrich` scrapes the business and extracts: **phone, email, address,
Facebook, Instagram, Google Business Profile, business category, logo, public
photos, rating, reviews**, plus the website if present. In mock mode a realistic
enrichment set is generated so the flow is fully testable offline. Enrichment
runs on **Run Website Intelligence** and again on **Add** (cached), so it's
credit-light — one scrape per business, never a mass run.

## 3. Auto-create Notion CRM record on "Add to Prospects"
`services/notion.js → createProspect(record)` POSTs to
`netlify/functions/notion.js?db=prospects&action=create`, which creates a Notion
page in the Prospects database. Real columns are mapped (Business Name,
Industry, City/State, Website, Phone, Email, Website/Speed/SEO/Opportunity
Score, Lead Source, Assigned Agent = Claude Code); everything enrichment
captured that has no dedicated column (address, socials, GBP, logo + photo URLs,
rating, signal) is packed into **Notes** so nothing is lost. A toast confirms
"saved to Notion CRM ✓"; if Notion isn't configured, the prospect is still kept
locally (nothing is ever lost).

## 4. Website Intelligence consumes the enriched record
The WI panel now leads with a **Contact & Presence** block (phone, email,
address, category, rating, GBP/Facebook/Instagram links, a photo strip, logo
source, and a link back to the Notion record). The **Export to Claude Code**
build spec now includes a *"REAL DATA — use these exact details, do not invent
contact info"* section with the real phone, socials, address, rating, logo, and
photo URLs — so the generated site uses the business's actual assets.

## Safety / cost
- All live behavior still gated by `FIRECRAWL_API_KEY` + `FIRECRAWL_LIVE=true`.
- Discovery hard-capped at 10; one scrape per enrich/audit; no messaging endpoint.
- Notion writes require the integration to have access to the Prospects DB
  (it already does — that's how Sprint 2 reads it).

## Note on "downloaded asset URLs"
Logo/photo **URLs** are captured and stored on the record + in the Notion Notes.
Actually downloading/rehosting the image bytes needs a storage bucket (S3 /
Netlify Blobs) — a small future add; the public URLs are captured now.
