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

The current backend collects selected Steam games live from Steam, IGDB MCP, and Gamalytic through `POST /api/games/collect`, with no game storage or result caching. See [the collector guide](docs/collector.md). The older corpus and scoring architecture below remains reference material for later stages.

---

## Documentation

| Doc | What's in it |
| --- | --- |
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

The app runs without API keys if `data/games.json` and `data/index.bin` are present. That is deliberate — see [decisions.md](docs/decisions.md#adr-001).

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind + shadcn/ui · Recharts · Zustand · Vitest · Python 3.11 for the offline corpus builder only.
