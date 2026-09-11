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
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Current domain, application, infrastructure, API, and UI boundaries |
| [DATA_SOURCES.md](docs/DATA_SOURCES.md) | Live provider ownership, provenance, and missing-data rules |
| [SCORING.md](docs/SCORING.md) | Current similarity, revenue, reception, saturation, and release-risk invariants |
| [API.md](docs/API.md) | Current HTTP routes and interactive request sequence |
| [TESTING.md](docs/TESTING.md) | Local and CI verification mapped to the architecture |
| [DEMO.md](docs/DEMO.md) | Investor-ready product walkthrough and preflight checks |
| [backend-reference](docs/backend-reference/README.md) | Code-oriented reference for the complete discovery and collection backend |
| [discovery.md](docs/discovery.md) | Grok validation, compact previews, approval, and verified collection |
| [collector.md](docs/collector.md) | Current live collection API, setup, provenance, and limitations |
| [data-model.md](docs/data-model.md) | The frozen type contract every lane codes against |
| [corpus-build.md](docs/corpus-build.md) | The offline pipeline that produces `games.json` + `index.bin` |
| [ai-integration.md](docs/ai-integration.md) | LLM extraction, the diff loop, embeddings, prompts, failure modes |
| [frontend-workflow.md](docs/frontend-workflow.md) | Sections 0–4, state machine, component tree, snapshot freeze |
| [contributing.md](docs/contributing.md) | Commit conventions, branch model, CI, definition of done |
| [decisions.md](docs/decisions.md) | ADR log — every significant choice with its rejected alternative |

## Source layout

```text
app/api/                 HTTP route adapters
components/              landing, concept, comparables, analysis, shared UI
lib/domain/              contracts, schemas, deterministic scoring
lib/application/         concept, discovery, and analysis use cases
lib/infrastructure/      Steam, IGDB, Gamalytic, Grok, MCP, and corpus adapters
lib/session/             browser session and immutable snapshots
lib/api/                 response envelope and browser API client
tests/                   mirrors domain, application, infrastructure, and API
```

## Quick start

```bash
pnpm install
cp .env.example .env.local        # see docs/DATA_SOURCES.md
pnpm collector:smoke 739630       # optional live backend check; no data files
pnpm dev
```

The interactive discovery flow requires `XAI_API_KEY` plus the IGDB MCP credentials. It validates with Grok, searches IGDB, and fetches approved records and upcoming releases live. The browser retains the latest completed session in localStorage and can export its frozen snapshot as JSON or a complete print-to-PDF report. `data/games.json` and `data/index.bin` remain available only to legacy corpus routes; the main UI does not use them.

## Stack

Next.js 16 (App Router) · React 19 · strict TypeScript · Tailwind CSS · Recharts · Zustand · Vitest.
