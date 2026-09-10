# Corpus build

The offline pipeline. Produces the four files the runtime depends on, then never runs again.

```
data/
  games.json      NormalizedGame[] + meta      ~14 MB
  index.bin       Float32Array, n × 1536       ~25 MB
  upcoming.json   unreleased titles            ~2 MB
  upcoming.bin    their embeddings             ~4 MB
```

Everything here is Python 3.11 under `scripts/`. It is the only Python in the repo and it is never imported by the app.

---

## Stages

```
1  catalog        Steam GetAppList              → raw/steam_catalog.json
2  select         filter + sample to ~4,200     → raw/selected_appids.json
3  details        appdetails per app            → raw/appdetails/{id}.json
4  tags           store page tag scrape         → raw/tags/{id}.json
5  reviews        appreviews query_summary      → raw/reviews/{id}.json
6  igdb           metadata by Steam AppID       → raw/igdb/{id}.json
7  gamalytic      top 500 only                  → raw/gamalytic/{id}.json
8  upcoming       coming-soon pages             → raw/upcoming/*.json
9  normalize      collapse to NormalizedGame    → data/games.json
10 embed          descriptions → vectors        → data/index.bin
11 verify         invariants + spot checks      → exits non-zero on failure
```

```bash
pnpm corpus:fetch          # stages 1–8
pnpm corpus:build          # stages 9–11
pnpm corpus:verify         # stage 11 alone
```

Each stage is independently resumable. Every stage writes per-app files and skips anything already on disk, so a crash at app 3,100 costs seconds, not hours. This matters more than it sounds like it does — stage 3 is the long pole and it *will* get interrupted.

---

## Stage 2: selection

We are not indexing 190,000 apps. We want the ~4,000 that could plausibly be a comparable for an indie Steam release.

Filters, in order:

```python
type == 'game'                    # drops DLC, soundtracks, videos, demos
release_date.coming_soon == False # released titles only (upcoming go to stage 8)
release_year >= 2018              # older comparables mislead on pricing and discovery
review_total >= 15                # below this, revenue estimation is noise
has short_description
not is_free                       # F2P economics don't transfer to premium indies
```

Then stratified sampling so the corpus isn't 80% shooters:

- Group by primary Steam tag.
- Take up to 200 per tag, ranked by review count descending.
- Force-include every game above 5,000 reviews regardless of tag (the reference points people recognize).
- Force-include the full tag clusters our demo concept touches — horror, co-op, survival, psychological — at up to 400 each.

Lands around 4,200. Tune `TARGET_SIZE` in `scripts/select.py`; the pipeline is linear in corpus size and stage 3 dominates.

**Sizing note.** At 1.5 s/request, stage 3 alone is ~105 minutes for 4,200 apps. Stages 4 and 5 add another ~90 combined. Budget three hours wall-clock for a cold full fetch, run it early, and start the app against fixtures rather than waiting.

If you need something usable in 20 minutes: set `TARGET_SIZE=800` with the demo tag clusters force-included, build, ship, then re-run at full size and swap the files. The corpus is versioned and hot-swappable — the app reloads on file mtime change in dev.

---

## Stage 9: normalization

Where three schemas become one. `scripts/normalize.py` is the most important file in the pipeline and the one most worth reading before Best Code judging.

Structure: one `merge_*` function per field group, each taking the raw dicts and returning a `Sourced` value with explicit fallback order matching the matrix in [api-data-guide.md](api-data-guide.md#source-priority-matrix).

```python
def merge_revenue(steam, igdb, gamalytic, reviews, price):
    if gamalytic and gamalytic.get('revenue'):
        return sourced(gamalytic['revenue'], 'gamalytic', estimated=True)

    if reviews and price:
        copies = reviews['total'] * multiplier_for_price(price)
        rev = copies * price * 0.70 * (1 - REFUND_RATE) * (1 - AVG_DISCOUNT)
        return sourced(
            round(rev), 'releasesignal', estimated=True,
            method=f'boxleiter ×{multiplier_for_price(price)}'
        )

    return sourced(None, 'gamalytic', estimated=True)
```

Three rules the whole file follows:

- **Never blend.** First available source wins outright.
- **Never invent.** Missing stays `None`, and `None` propagates to the UI as an em-dash.
- **Always label.** Every return goes through `sourced()`. There is no path that produces a bare number.

### Description cleaning

`detailed_description` is HTML with marketing junk. The cleaner:

1. Parse with BeautifulSoup, take text.
2. Truncate at the first heading matching `/system requirements|about the (developer|studio)|follow us|wishlist/i`.
3. Collapse whitespace, drop lines under 20 chars (bullet-point noise).
4. Cap at 2,000 characters — beyond that, embeddings drift toward boilerplate.
5. If the result is under 100 chars, fall back to `short_description`.

Step 4 is not cosmetic. Long store pages are mostly feature bullets and press quotes, which are near-identical across games and dominate the vector if you let them.

---

## Stage 10: embedding

Model: `text-embedding-3-small`, 1536 dims. Cheap, fast, plenty good for this.

The embedded string is built the same way for corpus games and for user concepts. Symmetry matters — if the two sides are constructed differently, similarity degrades in ways that are hard to see and easy to blame on the model.

```python
def embed_text(g):
    return "\n".join([
        g['name'],
        g['cleanDescription'],
        "Genres: "     + ", ".join(g['genres']),
        "Themes: "     + ", ".join(g['themes']),
        "Mechanics: "  + ", ".join(g['keywords'][:12]),
        "Modes: "      + ", ".join(g['gameModes']),
    ])
```

The runtime concept-side builder in `lib/ai/embed.ts` mirrors this exactly, from `GameConcept.concept.shortDescription` and `GameConcept.taxonomy`. **If you change one, change both.** There is a test asserting the two builders produce structurally identical output for the same input (`tests/embed-symmetry.test.ts`).

Batching: 100 texts per request. ~42 requests for the full corpus, about 90 seconds.

Then L2-normalize every vector and write row-major:

```python
vecs = np.array(embeddings, dtype=np.float32)
vecs /= np.linalg.norm(vecs, axis=1, keepdims=True)
vecs.tofile('data/index.bin')
```

Normalizing here means the runtime hot loop is a plain dot product with no per-query normalization. It also removes the "everything scores 0.98" bug class that comes from comparing unnormalized vectors.

Row *i* in `index.bin` is `games[i]` in `games.json`. Nothing enforces this at runtime except stage 11, which is why stage 11 is not optional.

---

## Stage 11: verification

Exits non-zero and blocks the build if any invariant fails.

```
✓ games.json parses, meta.count == len(games)
✓ index.bin size == count × 1536 × 4 bytes
✓ every game has a unique steamAppId
✓ every game has non-empty cleanDescription
✓ every vector has ‖v‖ ≈ 1.0  (±1e-4)
✓ no NaN or Inf in index.bin
✓ every Sourced value has a valid source string
✓ no Sourced value has value != null with source == null
✓ upcoming.json: every entry has isReleased == false
✓ upcoming.json: every expectedDate parses, confidence set
✓ spot check: 'Phasmophobia' is in the top-5 nearest to the demo concept
```

That last one is a real assertion in `scripts/verify.py`. It is the cheapest possible early warning that the embedding pipeline has silently broken — if the canonical 4-player co-op ghost-hunting game isn't near the 4-player co-op ghost-hunting concept, something upstream is wrong and you want to know before the demo, not during it.

---

## Upcoming releases (stage 8)

Same shape, separate file, because it has different failure characteristics.

For each coming-soon app: description (for embedding), announced date string, follower count if obtainable, publisher.

Date parsing normalizes to `{ date, confidence }`:

| Steam string | Parsed | Confidence |
| --- | --- | --- |
| `15 Oct, 2026` | `2026-10-15` | `exact` |
| `October 2026` | `2026-10-15` | `month` |
| `Q4 2026` | `2026-11-15` | `quarter` |
| `Coming soon` | `null` | `vague` |

Month and quarter resolve to a midpoint, and the risk model spreads their weight across the whole span rather than piling it on one week. See [scoring-models.md](scoring-models.md#date-confidence-weighting).

Vague-dated games are retained in the file but contribute zero to weekly risk. They surface in the UI as a separate "undated competition" count, which is honest and also happens to be a good line in the demo.

Target: 800–1,500 upcoming titles covering the next six months. Fewer than ~400 and the calendar looks sparse, which reads as broken even when the data is correct.

---

## Refreshing

The corpus is immutable per version. To update, build a new one and swap the directory. `meta.corpusVersion` is stamped into every `Snapshot`, so any exported report can be traced to the exact data that produced it.

There is no incremental update path and there should not be one. It is a file. Rebuild it.
