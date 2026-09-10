# Architecture

> Current backend: [live collector](collector.md). `POST /api/games/collect` fetches selected games on demand without storing game data. The corpus-based routes and workflows described below are legacy plans and do not govern this endpoint.

## The governing constraint

Everything below follows from one decision: **no third-party API is called on the demo path.**

Steam's store endpoints are undocumented and rate-limited by IP. IGDB's MCP server is labelled beta and may change without notice. Gamalytic's free tier is 250 requests per day. Any of those three being slow or down at the wrong moment turns a live demo into a spinner.

So we invert the normal shape. Instead of a backend that proxies three APIs, we have an **offline pipeline** that consumes those APIs once, at build time, and produces two immutable files. The runtime reads those files and does math.

```
BUILD TIME (offline, hours before)        RUN TIME (demo path)
─────────────────────────────────         ────────────────────────────
Steam catalog                             user text
Steam appdetails                              │
Steam appreviews                              ▼
IGDB metadata (optional)                  concept extraction (LLM)
Gamalytic (optional, top ~500)                │
        │                                     ▼
        ▼                                 embed concept (1 API call)
   normalize                                  │
        │                                     ▼
        ▼                                 brute-force cosine over index.bin
   embed descriptions                          │
        │                                     ▼
        ▼                                 rerank (pure functions)
   games.json + index.bin                      │
                                              ▼
                                          score: saturation, revenue,
                                          release risk (pure functions)
                                              │
                                              ▼
                                          freeze snapshot → UI + export
```

The only network call at runtime is the LLM (twice: extraction, embedding). Both are cached by content hash. With the cache warm, the demo path touches nothing outside the process.

---

## System shape

Single Next.js repository. Frontend and API in the same deployment.

```
┌──────────────────────────────────────────────────────────┐
│ BROWSER                                                  │
│                                                          │
│  Sections 0–4 (React)                                    │
│  Zustand store  ── session state, persisted to           │
│                    localStorage. No server session.      │
└───────────────────────┬──────────────────────────────────┘
                        │ fetch /api/*
                        ▼
┌──────────────────────────────────────────────────────────┐
│ NEXT.JS ROUTE HANDLERS (node runtime, server-only)       │
│                                                          │
│  /api/concept/analyze   → lib/ai/concept-analyzer        │
│  /api/discover          → lib/corpus + lib/scoring       │
│  /api/analyze           → lib/scoring                    │
│  /api/games/search      → lib/corpus                     │
│                                                          │
│  Stateless. Every request carries the state it needs.    │
└───────────┬──────────────────────────┬───────────────────┘
            │                          │
            ▼                          ▼
┌───────────────────────┐   ┌──────────────────────────────┐
│ lib/corpus            │   │ lib/scoring                  │
│                       │   │                              │
│ games.json (in mem)   │   │ similarity.ts                │
│ index.bin (Float32)   │   │ saturation.ts                │
│ upcoming.json         │   │ revenue.ts                   │
│                       │   │ release-risk.ts              │
│ cosine, filter, fuzzy │   │                              │
│ Loaded once, cached   │   │ Pure. No I/O. No async.      │
│ on globalThis.        │   │ Fully unit-tested.           │
└───────────────────────┘   └──────────────────────────────┘
```

### Why stateless

There is no `sessions` table, no Redis, no `provider_cache`, no TTL policy, no snapshot table. The original design had all of these. They exist to solve a problem we removed — namely, that live API data goes stale between requests. Our data does not change during a session, because it is a file.

Session state lives in the browser. The server receives the full `GameConcept` on every call and returns a result. This means:

- Deploys are stateless and instant.
- Refreshing the page does not lose work (localStorage).
- Two people can demo simultaneously with zero contention.
- There is no migration, no connection pool, no ORM, no seed script.

The cost is that sessions do not sync across devices. Acceptable.

---

## Layers

**Provider layer** (`scripts/providers/`) — Python. Only runs offline. One module per source, each returning raw dicts. Never imported by the app.

**Normalization layer** (`scripts/normalize.py` → `lib/types.ts`) — collapses three source schemas into one `NormalizedGame`. Runs offline, output is `games.json`. The app never sees a raw Steam or Gamalytic response.

**Corpus layer** (`lib/corpus/`) — loads the two files into memory once, exposes `search()`, `byAppId()`, `filterByTags()`, `upcomingBetween()`. Pure reads over an immutable structure.

**Scoring layer** (`lib/scoring/`) — the product. Pure synchronous functions, no I/O, no `async`. Each takes plain data and returns plain data with an explanation attached. This is what makes the app more than an aggregator, and it is the only code we claim as IP.

**AI layer** (`lib/ai/`) — the two LLM touchpoints, isolated behind an interface so they can be swapped or stubbed. See [ai-integration.md](ai-integration.md).

**Route layer** (`app/api/`) — thin. Validate input with Zod, call one or two lib functions, wrap in the standard envelope, return. No business logic in routes.

**UI layer** (`app/`, `components/`) — see [frontend-workflow.md](frontend-workflow.md).

The dependency rule: **UI → routes → scoring/corpus/ai → types.** Nothing points back up. `lib/scoring` imports nothing but `lib/types` and `lib/utils`.

---

## Request flow: the main path

User has typed a description and clicked through to the dashboard.

```
1. POST /api/concept/analyze   { text, previousConcept? }
   └─ lib/ai/concept-analyzer
      ├─ hash(text) → check cache
      ├─ LLM structured extraction
      └─ returns GameConcept + clarifyingQuestions[]

   If clarifyingQuestions is non-empty, the UI asks and loops.
   The next call sends the diff, not the whole history.

2. POST /api/discover          { concept }
   └─ lib/ai/embed(concept.searchText)        ← 1 network call, cached
   └─ lib/corpus.candidates(concept)
      ├─ hard filter: tag overlap ≥ 1, has description, released
      ├─ cosine over the filtered subset (~2–4k vectors, <20 ms)
      └─ top 40 by raw semantic score
   └─ lib/scoring/similarity.rerank(concept, candidates)
      └─ weighted blend, returns top 12 with per-component breakdown

3. POST /api/analyze           { concept, competitorAppIds[] }
   └─ lib/scoring/saturation
   └─ lib/scoring/revenue
   └─ lib/scoring/release-risk    ← uses upcoming.json
   └─ returns MarketReport

4. Client freezes { concept, competitors, report } into a Snapshot.
   Dashboard, calendar and both exporters read only from the Snapshot.
```

Steps 2 and 3 are separate because step 2 is editable — the user can add or remove competitors before analysis, and manual edits should not trigger an LLM call.

---

## The snapshot

Kept from the original design, simplified to a client-side object.

When the user runs **Analyze Market**, we build:

```ts
type Snapshot = {
  snapshotId: string;        // nanoid
  generatedAt: string;       // ISO
  conceptVersion: number;    // increments on every concept edit
  concept: GameConcept;      // deep-frozen copy
  competitors: NormalizedGame[];
  report: MarketReport;
  corpusVersion: string;     // from games.json meta
};
```

`Object.freeze` applied deeply. Every downstream consumer — dashboard, forward calendar, PDF export, JSON export — reads from this object and nothing else.

The reason: without it, the dashboard can say $230k and a PDF generated forty seconds later can say $260k because a component re-derived something. That inconsistency is fatal in a demo and indefensible in Q&A. With it, the exported JSON is byte-reproducible from the same snapshot.

Editing the concept after a snapshot exists does not mutate it. It bumps `conceptVersion` and shows a **stale** banner with a re-analyze button.

---

## What we cut, and why

| Cut | Reason |
| --- | --- |
| PostgreSQL, Redis, all 12 tables | No mutable server state exists. The corpus is a file. |
| Session persistence server-side | localStorage covers it. Removes auth, migrations, cleanup. |
| `identity-resolver` service | Steam AppID is the only ID. IGDB IDs are resolved once, offline, and stored in `games.json`. Nothing to resolve at runtime. |
| Live IGDB MCP discovery | Beta, may change without notice, adds latency and a failure mode. Used offline for metadata enrichment only. |
| Live Gamalytic calls | 250/day would evaporate. Used offline to enrich the ~500 most relevant titles. |
| TTL / cache-invalidation policy | Nothing expires. The corpus has a version string; that is the whole cache story. |
| Provider queues, rate limiters, backoff | Only the offline pipeline needs these, and it has them (`scripts/rate_limit.py`). Runtime needs none. |
| Level 0–3 enrichment tiers | Everything is enriched at build time. There is one level. |
| PDF via server-side renderer | `window.print()` plus a print stylesheet. See [frontend-workflow.md](frontend-workflow.md#pdf-export). |
| docx/pdf document import | `.txt`, `.md`, `.json` only. Same analyzer endpoint. |

## What survives from the original design

Two ideas were load-bearing and are kept in full:

**Provenance on every value.** Every number rendered in the UI carries `{ value, source, estimated }`. Steam facts, Gamalytic estimates and our predictions look different on screen. This is a small component and it answers the single most likely hostile question: *how do you know that?*

**One normalized entity.** The frontend never sees a raw provider response. `NormalizedGame` is the only shape it knows. Swapping Gamalytic for our own estimator changed one field's `source` string and nothing else.

---

## Failure model

The runtime has three failure modes, all handled.

| Failure | Behaviour |
| --- | --- |
| LLM extraction fails | Fall back to keyword extraction (`lib/ai/fallback-extract.ts`). Concept is lower-confidence, flow continues, banner shown. |
| Embedding call fails | Fall back to tag-only candidate selection. Similarity scores drop the semantic component and reweight. Banner shown: *reduced-precision matching*. |
| Corpus file missing | Hard failure at boot, loud error. This is a deploy bug, not a runtime condition. |

There is deliberately no partial-data path for market data, because market data cannot be partial — it is a local file. This is a large simplification over the original `fresh / cached / stale / missing / failed` state machine, which existed to describe live API health we no longer have.

## Performance envelope

Measured on the target corpus (4,200 games, 1536-dim vectors, 25 MB `index.bin`).

| Operation | Cost |
| --- | --- |
| Corpus load (cold, once per process) | ~180 ms |
| Tag pre-filter | ~2 ms |
| Cosine over 4,200 vectors | ~14 ms |
| Rerank top 40 | <1 ms |
| Full `/api/analyze` | ~30 ms |
| `/api/discover` with warm embedding cache | ~50 ms |
| `/api/discover` cold (embedding API) | ~600 ms |

Brute force is correct at this scale. An ANN index would save 12 ms and cost a dependency, a build step and a class of silent recall bugs. See [decisions.md](decisions.md#adr-004).
