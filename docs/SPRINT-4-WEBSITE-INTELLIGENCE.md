# Sprint 4 — Website Intelligence (prospect → proposal → buildable site)

Turns one prospect into a complete, sellable website package — generated
**locally from the prospect's data. No API, no keys, no credits.**

## Where it lives
- **UI:** open any prospect (Potential Clients or the Call Queue) →
  **◍ Website Intelligence — brief, value & build**.
- **Engine:** `js/website-intel.js` (industry kits + generators).
- Estimated value also shows on the prospect detail panel.

## What it generates
Select a prospect and get:
- **Estimated project value** — transparent breakdown (5-page site, Brand
  Starter if no site, high-tier booking/SEO add-on, first-year growth plan).
  A no-website landscaping business ≈ **$2,500**.
- **Website brief** — goal, primary conversion, current-state.
- **Design direction** — an on-brand palette (never generic AI purple/blue),
  type pairing, mood, and imagery direction — chosen by industry.
- **Sitemap** — the right pages for that industry.
- **Sales talking points** — the pitch angle based on their web gap, local
  proof (live Azalea/Warren demos for landscaping), the $1,000 offer, the close.

## The three exports
- **⌘ Export to Claude Code** — copies a full production build spec (client,
  goal, brand-token CSS, sitemap, design, tech: static HTML + Netlify Forms +
  netlify.toml + local SEO, copy tone) **and opens claude.ai/code**. Paste →
  Claude Code builds the site. One prospect → a real website in minutes.
- **⚡ Create SiteDrop Prompt** — a concise natural-language concept prompt for
  SiteDrop.
- **▤ Copy Client Proposal** — client-facing proposal text with the price
  breakdown, deposit, and payment handles, ready to text or email.

## Industry kits
`kitFor(industry)` keyword-matches to a kit (palette / type / mood / imagery /
sitemap / CTA / value tier) covering landscaping, exterior cleaning, roofing,
HVAC & trades, auto detailing, barber/beauty, gym/fitness, health/wellness,
restaurant, real estate, and charter/recreation — with a solid local-service
fallback. Add or tune a kit in `js/website-intel.js`.

## CRM Call Queue stats
The Call Queue now leads with a live stats strip so the dashboard feels alive
even before leads exist: 🔥 Today's Goal · 📞 Calls Completed · 💰 Est. Pipeline
Value · ⭐ Top Opportunity Category · ⏱ Last Scan (Mock/Live).

## Pipeline position
`Search → Find → Audit → Prospect Queue → **Website Concept → Proposal** →
(Invoice → Client Project → Maintenance)`. Sprint 4 delivers the Concept +
Proposal steps; invoicing/project/maintenance are the next sprints.
