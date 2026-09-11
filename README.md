# ReleaseSignal

**AI-powered launch-timing intelligence for Steam developers.**

Tags get you 300 roguelikes. Your description gets you the 15 that actually play like yours — and tells you who is launching against you next month.

---

## The problem

In the last week of August 2026, 720 games launched on Steam. 530 of them finished with fewer than ten reviews. Ten crossed a thousand. That is roughly 103 releases a day, and the rate is still climbing — ~12,000 games in H1 2026, up 19% year over year.

Every existing tool (SteamDB, Gamalytic, VG Insights, GameDiscoverCo, SteamPeek) answers one question: *how did last year's games do?* None answer the question that matters at 103 releases a day: **who am I launching against next month, and should I move?**

## What this does (implemented, not aspirational)

A four-step analysis session, fully functional end-to-end:

1. **Describe** your game in plain text. Grok extracts a structured concept; keyword fallback if Grok is unavailable.
2. **Discover** genuinely comparable games via IGDB semantic search + Grok ranking. Tag-overlap fallback if Grok is down.
3. **Collect** real data for approved games: Steam store details, reviews, Gamalytic revenue estimates, IGDB metadata. Boxleiter model fills revenue gaps when Gamalytic returns incomplete data.
4. **Analyze** with deterministic scoring: revenue percentiles, market saturation (Herfindahl index), reception prediction, release-window risk across 26–52 weeks. Verdict: **KEEP**, **MOVE**, or **MITIGATE**.

Every number carries a `Sourced<T>` provenance tag. Facts from Steam, estimates from Gamalytic, predictions from our scoring engine — visibly separated, never blended.

## Quick start (0-config)

```bash
git clone https://github.com/xsolla-baku-gametech-hackathon/team-nebula.git
cd team-nebula
pnpm install
cp .env.example .env.local    # fill in API keys (see below)
pnpm dev                      # → http://localhost:3000
```

**With API keys** (full experience): Set `XAI_API_KEY`, `IGDB_MCP_CLIENT_ID`, `IGDB_MCP_CLIENT_SECRET`, `STEAM_WEB_API_KEY` in `.env.local`.

**Without API keys** (graceful degradation): The app still runs. See degradation matrix below.

## Graceful degradation

| Service | When available | When unavailable | How it degrades |
|---------|---------------|------------------|-----------------|
| Grok (xAI) | LLM concept extraction, AI-ranked discovery, contextual questions | Keyword-based extraction, tag-overlap ranking, hardcoded questions | Automatic fallback, no user action needed |
| IGDB (MCP) | Semantic game search, Steam ID resolution, upcoming releases | Discovery unavailable | Error shown; user can retry |
| Steam | Store details, reviews, tags, prices | Individual games fail collection | Partial results returned with failure list |
| Gamalytic | Revenue & copies estimates | Boxleiter model (reviews × price multiplier) | Revenue computed from review count + price |
| Corpus files | Legacy tag-based search | Not needed for main flow | Main UI uses live APIs only |

## Test results

```
39 test files passed (39)
169 assertions passed (169)
0 failures
```

Run tests: `pnpm test` · Watch mode: `pnpm test:watch` · Coverage: `pnpm test:coverage`

Tests cover: API routes (6), application layer (3 dirs), domain scoring (5), infrastructure adapters (8), session management (2), architecture boundaries (1), component fixtures (1).

## API endpoints

All routes return `{ ok: true, data, meta }` or `{ ok: false, error: { code, message } }`. Error messages are sanitized in production.

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/health` | System status + capability report | None |
| POST | `/api/concept/analyze` | Extract GameConcept from text (Grok → keyword fallback) | None |
| POST | `/api/concept/import` | Import concept from JSON/document | None |
| POST | `/api/games/discover` | Validate + find candidates (Grok → IGDB → rank) | XAI + IGDB |
| POST | `/api/games/discover/collect` | Collect approved games (Steam + Gamalytic + IGDB) | IGDB + Steam |
| POST | `/api/analyze` | Full market analysis (scoring engine) | None* |
| POST | `/api/export/json` | Export snapshot as downloadable JSON | None |
| GET | `/api/games/search?q=` | Fuzzy search in corpus | None |
| GET | `/api/games/:appId` | Lookup game by Steam App ID | None |

*Requires competitors from a prior discover/collect step.

## Architecture

```
app/api/                  Thin HTTP route adapters (Zod validation → use case → envelope)
components/               Landing, concept, comparables, analysis, shared UI
lib/domain/               Types, schemas, deterministic scoring (pure functions, no I/O)
lib/application/          Concept extraction, discovery orchestration, market analysis
lib/infrastructure/       Steam, IGDB, Gamalytic, Grok, MCP, corpus adapters
lib/session/              Browser session persistence (Zustand + localStorage)
lib/api/                  Response envelope, typed browser API client
tests/                    Mirrors domain, application, infrastructure, API layers
```

**Key design rules:**
- `lib/domain/scoring/` functions are **pure**: no async, no I/O, no `new Date()`. "Today" is always a parameter.
- Every rendered number carries a `Sourced<T>` provenance wrapper with source, estimated flag, and method.
- Routes are thin: validate with Zod, call use case, wrap in envelope, return.
- No `any` — use `unknown` + narrow.
- Error envelope hides internal details in production (`NODE_ENV === 'production'` → generic message).

## Security

- **No hardcoded secrets**: All API keys read from `process.env`. Zero secrets in source code (verified by grep).
- **`.env.example`** contains only empty placeholders. `.env.local` is gitignored by `.env*` pattern.
- **API key isolation**: Grok/IGDB/Steam keys are server-only (`'server-only'` import guard). Frontend never sees credentials.
- **Error sanitization**: API returns `{ code, message }` without stack traces. Production mode returns generic "Internal error".
- **Rate limiting**: Per-provider spacing (Steam 1.5s, IGDB/Gamalytic 250ms), queue backpressure (65s max), 429 handling with `Retry-After`.
- **Input validation**: Zod schemas on every endpoint. Query strings 3–2000 chars, limits 1–10, Steam App IDs validated as positive integers.
- **NSFW filtering**: Adult/sexual content filtered from IGDB discovery results by keyword blocklist.
- **Cache headers**: `Cache-Control: no-store` on all API responses.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS · Recharts · Zustand · Zod · Vitest

## Data providers

| Provider | What we get | How |
|----------|-------------|-----|
| **Steam** | Store details, reviews, tags, prices | REST API |
| **IGDB** | Semantic search, game metadata, upcoming releases | MCP SDK |
| **Gamalytic** | Revenue estimates, copies sold | Free list endpoint |
| **Grok (xAI)** | Concept extraction, discovery validation/ranking, follow-up questions | Chat completions API |

## Limitations (honest)

- **No user accounts or persistence**: Sessions live in browser localStorage only.
- **Revenue estimates are estimates**: Gamalytic numbers are modeled, not reported. Boxleiter fallback is even rougher.
- **IGDB semantic search is imperfect**: Returns results by description similarity which can include false positives.
- **No real-time Steam data**: Prices and reviews are fetched at collection time, not continuously updated.
- **Scoring confidence varies**: With <5 comparables, revenue predictions have LOW confidence. We show this explicitly.
- **Grok dependency for best results**: Without Grok, discovery uses keyword matching which is less precise.

## Documentation

| Doc | What's in it |
| --- | --- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Domain, application, infrastructure, API, and UI boundaries |
| [DATA_SOURCES.md](docs/DATA_SOURCES.md) | Live provider ownership, provenance, and missing-data rules |
| [SCORING.md](docs/SCORING.md) | Similarity, revenue, reception, saturation, and release-risk invariants |
| [API.md](docs/API.md) | HTTP routes and interactive request sequence |
| [TESTING.md](docs/TESTING.md) | Local and CI verification mapped to the architecture |
| [discovery.md](docs/discovery.md) | Grok validation, compact previews, approval, and verified collection |
| [collector.md](docs/collector.md) | Live collection API, setup, provenance, and limitations |

## Team

**Team Nebula** — Built during the Xsolla Baku Gametech Hackathon, September 2026.
