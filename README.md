# ReleaseSignal

**Launch-timing intelligence for Steam developers.**

Tags get you 300 roguelikes. Your description gets you the 15 that actually play like yours — and tells you who is launching against you next month.

---

## The problem

In the last week of August 2026, 720 games launched on Steam. 530 of them finished with fewer than ten reviews. Ten crossed a thousand. That is roughly 103 releases a day, and the rate is still climbing — ~12,000 games in H1 2026, up 19% year over year.

Every existing tool (SteamDB, Gamalytic, VG Insights, GameDiscoverCo, SteamPeek) is good at one question: *how did last year's games do?* None of them answer the question that matters at 103 releases a day: *who am I launching against next month, and should I move?*

## What this is

A four-step analysis session:

1. Describe your game in plain text.
2. We extract a structured concept and find genuinely comparable games — matched on gameplay description, not genre tags.
3. We show you what those comparables actually did: revenue, copies, reviews, price, timing.
4. We score every candidate release week ahead of you and tell you to **KEEP**, **MOVE**, or **MITIGATE**.

Every number on screen carries a provenance label. Facts from Steam, estimates from our model, predictions from our engines — visibly separated, never blended.

## Architecture in one line

The current backend validates natural-language descriptions with Grok, previews IGDB MCP matches at `POST /api/games/discover`, and collects Steam/Gamalytic facts only after `POST /api/games/discover/collect` approval. `POST /api/analyze` then queries IGDB MCP for similar upcoming PC releases and scores a 26–52 week launch calendar. Pending previews live in memory for 30 minutes; game and report data are not stored on the server. See [the discovery guide](docs/discovery.md).

---

## Documentation

| Doc | What's in it |
| --- | --- |
| [backend-reference](docs/backend-reference/README.md) | Code-oriented reference for the complete discovery and collection backend |
| [discovery.md](docs/discovery.md) | Grok validation, compact previews, approval, and verified collection |
| [collector.md](docs/collector.md) | Current live collection API, setup, provenance, and limitations |
| [architecture.md](docs/architecture.md) | System shape, request flow, what we cut and why |
| [data-model.md](docs/data-model.md) | The frozen type contract every lane codes against |
| [api-data-guide.md](docs/api-data-guide.md) | Source-priority matrix, endpoints, rate limits, provenance rules |
| [corpus-build.md](docs/corpus-build.md) | The offline pipeline that produces `games.json` + `index.bin` |
| [ai-integration.md](docs/ai-integration.md) | LLM extraction, the diff loop, embeddings, prompts, failure modes |
| [scoring-models.md](docs/scoring-models.md) | Similarity, saturation, revenue range, release risk — the actual math |
| [backend-api.md](docs/backend-api.md) | Every route, request/response shape, error envelope |
| [frontend-workflow.md](docs/frontend-workflow.md) | Sections 0–4, state machine, component tree, snapshot freeze |
| [testing.md](docs/testing.md) | What is tested, what is deliberately not, how to run it |
| [contributing.md](docs/contributing.md) | Commit conventions, branch model, CI, definition of done |
| [decisions.md](docs/decisions.md) | ADR log — every significant choice with its rejected alternative |
| [demo-runbook.md](docs/demo-runbook.md) | Freeze protocol, cached queries, fallback chain |

## Quick start

```bash
pnpm install
cp .env.example .env.local        # see api-data-guide.md
pnpm collector:smoke 739630       # optional live backend check; no data files
pnpm dev
```

The interactive discovery flow requires `XAI_API_KEY` plus the IGDB MCP credentials. It validates with Grok, searches IGDB, and fetches approved records and upcoming releases live. The browser retains the latest completed session in localStorage and can export its frozen snapshot as JSON or a complete print-to-PDF report. `data/games.json` and `data/index.bin` remain available only to legacy corpus routes; the main UI does not use them.

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind + shadcn/ui · Recharts · Zustand · Vitest · Python 3.11 for the offline corpus builder only.
