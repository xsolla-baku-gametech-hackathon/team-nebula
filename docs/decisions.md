# Decision records

Every significant architectural choice, with the alternative that was rejected and why.

The format is deliberate. A judge asking "why did you do it this way" is asking whether you considered the alternative. This file is the answer, and it is faster than remembering.

---

## ADR-001 — No live third-party calls on the demo path

**Status:** accepted · load-bearing

**Context.** The product consumes Steam, IGDB and Gamalytic. The obvious design is a backend that proxies all three with caching.

**Decision.** All external data is fetched offline and compiled into static files. The runtime reads files. The only runtime network calls are to the LLM (extraction) and the embedding API, both cached by content hash, both with non-network fallbacks.

**Rejected: live API proxying with a cache layer.**

Why: Steam's store endpoints are undocumented and IP-rate-limited — sustained requests get a 429 followed by a multi-minute block. IGDB's MCP server is labelled beta and may change without notice. Gamalytic's free tier is 250 requests/day, which one enthusiastic testing session consumes entirely. Any of the three being slow during a demo produces a spinner, and a spinner is the failure the audience remembers.

**Consequences.**

Positive: sub-50 ms responses. No rate limits, no quota anxiety, no credential handling at runtime. The app runs offline. Deletes the entire cache-invalidation problem — nothing expires because nothing is live.

Negative: data is as fresh as the last build. For launch-window analysis over a six-month horizon, day-old data is fine; upcoming release dates do not move hourly. If this became a real product, an incremental refresh job would be added, and the file-swap design already supports it.

---

## ADR-002 — No database

**Status:** accepted

**Context.** The original design specified twelve PostgreSQL tables plus Redis: sessions, competitors, snapshots, provider cache, price history, and so on.

**Decision.** No database. Corpus is a file loaded into memory. Session state is client-side Zustand persisted to localStorage.

**Rejected: PostgreSQL, or even SQLite.**

Why: a database stores mutable state. After ADR-001 there is no mutable server state. The tables existed to cache live API responses and to persist sessions across requests — both problems that no longer exist. Adding Postgres would mean a connection pool, migrations, an ORM, a seed script and a deployment dependency, in exchange for storing data that never changes.

**Consequences.**

Positive: stateless deploys. No migrations. Concurrent demos don't contend. A fresh clone runs with `pnpm dev`.

Negative: sessions don't sync across devices, and a cleared browser loses history. Both acceptable for a single-session analysis tool. The JSON export is the persistence story, and it round-trips through import.

---

## ADR-003 — Steam AppID is the only identifier

**Status:** accepted

**Context.** Three sources, three ID spaces. The original design had a runtime `identity-resolver` service reconciling IGDB IDs to Steam AppIDs with confidence scoring and fuzzy name matching.

**Decision.** Steam AppID is the canonical key. IGDB IDs are resolved once, offline, via `external_games.uid`, and stored in `games.json`. There is no runtime resolver.

**Rejected: a runtime identity service.**

Why: the product is Steam-market focused. A game not on Steam cannot be analyzed, so it does not need an identity. Resolution is a build-time join, and build-time joins can be verified once and then trusted.

**Consequences.**

Positive: an entire service and its failure modes deleted. Any ambiguity is caught during the build, when there is time to look at it, rather than during a demo.

Negative: no console or non-Steam analysis. That is the product's scope, not a limitation of the design.

The offline resolver still refuses to match on name alone — it requires name plus release year plus developer, and unmatched games simply carry `igdbId: null`. Silently joining two games called *Prey* would corrupt similarity in a way nobody would notice.

---

## ADR-004 — Brute-force vector search

**Status:** accepted

**Context.** ~4,200 games × 1536 dimensions. Semantic search is the core mechanic.

**Decision.** Linear scan with a dot product over a pre-normalized `Float32Array`, after a tag pre-filter.

**Rejected: HNSW, FAISS, sqlite-vec, pgvector, or any hosted vector database.**

Why: brute force over 4,200 rows takes ~14 ms. An ANN index would take ~2 ms. Saving 12 ms costs a dependency, a build step, an index-versioning problem, and a class of silent recall bugs where the right answer is simply not returned and nothing indicates it. At this corpus size, approximate search is strictly worse.

**Consequences.**

Positive: exact results, zero dependencies, trivially testable against a naive reference implementation. Vectors normalized at build time make the hot loop a plain dot product.

Negative: linear in corpus size. At ~100k games this needs revisiting. That is a real threshold and worth naming when asked about scale, alongside the pre-filter that already cuts the scanned set by ~85%.

---

## ADR-005 — IGDB REST offline, not IGDB MCP live

**Status:** accepted

**Context.** IGDB ships an official MCP server with a `semantic_search_games` tool that maps almost exactly onto our "describe your game" UX.

**Decision.** Use IGDB's REST API offline for structured metadata. Do not use the MCP server.

**Rejected: IGDB MCP as the discovery engine.**

Why, in order of weight:

1. **It is the differentiator.** The pitch is "your description gets you the 15 games that actually play like yours." If IGDB computes that, the claim belongs to IGDB. The similarity engine is the product; outsourcing it hollows out the thing being judged.
2. **Beta, subject to change without notice.** Not a dependency to build a demo on.
3. **It contradicts ADR-001** — a network round-trip on the hot path.

**Consequences.**

Positive: full control over the ranking function, including the six-component weighted rerank and its per-component explanation. We can show *why* a game ranked where it did, which a black-box endpoint cannot.

Negative: our semantic search is probably not as good as a purpose-built one from a company with a full games database. We accept that, because a slightly worse result we can explain and improve beats a better result we cannot.

The `IGDBProvider` interface still exists in the offline pipeline, so switching to MCP later is an adapter swap rather than a rewrite.

---

## ADR-006 — Ranges, never point estimates

**Status:** accepted · load-bearing for credibility

**Context.** Revenue prediction is the headline number.

**Decision.** All monetary predictions are conservative/base/upside triples, rounded to two significant figures, with a confidence band and the comparable count displayed alongside.

**Rejected: a single number.**

Why: `$273,841` claims six significant figures of precision from a method that has maybe one. It is the single fastest way to lose a technically literate audience, because the false precision is visible on sight. A range with a stated confidence and a visible sample size communicates the same central estimate while being honest about the uncertainty.

**Consequences.** Slightly less punchy on a slide. Considerably more defensible in questioning. The exported PDF says the same thing, so there is no version of the artifact that overclaims.

---

## ADR-007 — No LLM produces a number

**Status:** accepted

**Context.** It would be easy to hand the concept and the comparables to a model and ask for a revenue figure.

**Decision.** The LLM converts prose to structure. All numbers come from arithmetic over comparables.

**Rejected: LLM-generated forecasts.**

Why: an LLM revenue estimate is confident, unfalsifiable and unexplainable. Asked "how did you get that," the only answer is "the model said so." Our arithmetic answers with a weighted percentile over twelve named games, each of which is on screen with a link to its store page.

**Consequences.**

Positive: every number is traceable to specific games. Deterministic — the same inputs always give the same output, which matters for demo reliability and for the snapshot guarantee. Fully unit-testable.

Negative: our model is cruder than a model could be. It does not know that a genre is cooling or that a particular mechanic is fashionable. It compensates by being inspectable.

---

## ADR-008 — Frozen client-side snapshot

**Status:** accepted

**Context.** The dashboard, the calendar, the PDF and the JSON export all display the same analysis.

**Decision.** `Analyze Market` builds one deep-frozen `Snapshot`. Every downstream consumer reads only from it. Editing the concept afterwards bumps a version and shows a stale banner; it does not mutate the snapshot.

**Rejected: components deriving values on demand.**

Why: without a freeze, the dashboard can show $230k and a PDF generated forty seconds later can show $260k, because something re-derived. That is indefensible in a demo and it is the kind of inconsistency that makes an audience distrust every other number on screen.

**Consequences.** The exported JSON is byte-reproducible from the same snapshot, stamped with `snapshotId` and `corpusVersion`. Any exported report can be traced to the exact data that produced it. Costs about twenty minutes to implement.

---

## ADR-009 — Client-side PDF via print stylesheet

**Status:** accepted

**Context.** PDF export is a listed deliverable.

**Decision.** `window.print()` against a `@media print` stylesheet. No server route, no library.

**Rejected: Puppeteer, react-pdf, or a server-side renderer.**

Why: a headless-browser route is a deployment dependency, a memory consumer and a new runtime failure mode, for an output the browser already produces. Recharts renders SVG, which prints correctly.

**Consequences.**

Positive: thirty minutes instead of several hours. Cannot fail at runtime because there is no runtime.

Negative: no custom pagination, no per-page headers, and it depends on the browser's print dialog. Page-break behaviour must be verified in Chrome print preview early — leaving it until the end is how you discover a chart clipping across a break with no time to fix it.

---

## ADR-010 — Steam user tags as a hard pre-filter

**Status:** accepted

**Context.** Pure semantic search over store descriptions returns occasional nonsense — a well-written visual novel can sit close to a horror shooter in embedding space.

**Decision.** Require at least one Steam tag overlap before semantic ranking. Relax to zero if fewer than 60 candidates survive.

**Rejected: pure semantic search, and pure tag matching.**

Why pure semantic fails: embeddings capture tone and prose style alongside mechanics. Two atmospherically-written descriptions converge regardless of what the games actually are.

Why pure tags fail: that is the incumbent approach and the thing we are explicitly differentiating from. Tags get you 300 roguelikes.

**Consequences.** The filter cuts ~85% of the corpus in about 2 ms, which is also a performance win. The relaxation rule keeps genuinely novel concepts from returning three results. `filterRelaxed` is returned to the UI so the user knows when it happened.

The framing that matters: tags are the coarse filter, description is the ranking. Neither alone. That is a more precise version of the pitch line and a better answer under questioning than the slogan.

---

## ADR-011 — Date confidence weighting instead of point dates

**Status:** accepted

**Context.** Announced Steam release dates are vague (`"Q4 2026"`, `"Coming soon"`) and they slip.

**Decision.** Parse to `{ date, confidence }` across four levels. Spread risk weight across the announced span: exact concentrates on one week, month divides across four, quarter across thirteen, vague contributes nothing but is counted separately in the UI.

**Rejected: resolving everything to a single date, and dropping imprecise entries.**

Why not single dates: it manufactures precision the source does not have and it produces false spikes in the risk curve.

Why not dropping: imprecise entries are a large share of upcoming releases, and discarding them would systematically understate competition.

**Consequences.** The risk curve is smoother and more honest. More importantly, it converts the sharpest available criticism — *release dates slip, why should I trust your calendar* — into a demonstration of rigour. The undated count is shown on screen rather than hidden.

---

## ADR-012 — Boxleiter fallback with the multiplier displayed

**Status:** accepted

**Context.** Gamalytic access may not materialize, and its free tier is 250 requests/day regardless.

**Decision.** Where Gamalytic data is absent, estimate copies from review count using a price-banded multiplier, and display the multiplier and formula in the UI.

**Rejected: showing nothing, and showing an unlabelled estimate.**

Why not nothing: revenue context is the reason competitor cards are useful at all.

Why not unlabelled: passing off our heuristic as third-party data is the one thing that would genuinely damage the product's credibility if noticed.

**Consequences.** The label reads `ⓘ ReleaseSignal estimate · Boxleiter ×32` with the formula in the tooltip. Compounding an estimate on an estimate is acceptable when it is visible.

There is an argument this is *better* than a black-box third-party number: a stated method with a stated error band can be challenged and corrected. An opaque figure can only be believed or not.

---

## ADR-013 — Desktop-first

**Status:** accepted

**Context.** Limited build time; responsive design is not free.

**Decision.** Design for ≥1280 px. Below 1024 px the layout stacks to one column and the calendar becomes a vertical list. Not broken on mobile, not excellent there.

**Rejected: mobile-first, and desktop-only.**

Why not mobile-first: this is a professional analysis tool with dense data. Nobody evaluates a launch window on a phone. And the demo runs on a projector.

Why not desktop-only: someone will open it on their phone, and a broken layout reads as carelessness regardless of the reason.

**Consequences.** Data density where it matters, and a degraded-but-usable experience where it does not.
