# Sprint 5 — Sales Agent (pipeline orchestration)

One agent that runs the whole EP Media sales workflow. It **coordinates** the
existing modules — it does not duplicate any of them.

## What it does
For every prospect, the agent knows the pipeline stage and the single **next
best action**, and runs it by calling the module that already owns that job:

| Step | Module the agent calls |
|------|------------------------|
| Prospect discovery | `services/firecrawl.js` → `firecrawlService.discover` |
| Website intelligence (audit) | `firecrawlService.audit` + `computeOpportunity` |
| Opportunity scoring | `computeOpportunity` (app.js) |
| Proposal generation | `copyProposal` (website-intel.js) |
| Claude Code export | `exportToClaudeCode` (website-intel.js) |
| SiteDrop export | `createSiteDropPrompt` (website-intel.js) |
| Follow-up tracking | `hookScheduleFollowUp` + working state (app.js) |
| Maintenance recommendation | `agentMaintenance` (reuses `estimateProjectValue`) |
| Dashboard KPIs | `EPSalesAgent.kpis()` / `funnel()` |

## The console (sidebar → Sales Agent)
- **KPIs:** Active Prospects · Audited & Scored · Proposals Ready · Est. Pipeline
  Value · Maintenance MRR (won) · Calls Today.
- **Pipeline Funnel:** Discovered → Website Intel → Proposal/Concept → Outreach →
  Follow-Up → Signed Client, counted live from working state.
- **Next Best Action:** every active prospect, hottest first, with the agent's
  recommended move and a one-click button that runs it.

## How "coordinate, not duplicate" is enforced
`js/sales-agent.js` holds **no** scoring, brief, proposal, or pricing logic. It
reads working state (`S.prospects` / `S.leads`), decides the stage
(`stageOf`) and action (`nextAction`), and delegates to the existing global
functions. Change a module once and the agent uses the new behavior everywhere.

## Agent actions
- `agentAudit(id)` — audit an existing prospect (firecrawl → score → write back →
  open the Website Intelligence brief).
- `agentRunWorkflow(id)` — one-click: audit → brief (with Claude Code / SiteDrop /
  proposal exports one tap away).
- `agentMaintenance(id)` — recommend + surface the maintenance plan.

## Pipeline coverage
`Search → Find → Audit → Prospect Queue → Concept → Proposal → (Invoice →
Client Project → Maintenance)`. The agent now drives discovery → proposal →
follow-up → maintenance recommendation. Invoicing + project management are the
next sprint.
