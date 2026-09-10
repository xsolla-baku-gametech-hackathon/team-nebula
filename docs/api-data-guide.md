# API & data guide

> Current backend: [live collector](collector.md). `POST /api/games/collect` fetches selected games on demand without storing game data. The corpus-based routes and workflows described below are legacy plans and do not govern this endpoint.

Which source owns which field, how each is called, what it costs, and what we do when it lies.

**All of this runs offline**, in `scripts/`. None of it is on the demo path. See [corpus-build.md](corpus-build.md) for the pipeline that orchestrates it.

---

## Source-priority matrix

The rule in one sentence: **Steam tells you what is true on Steam. IGDB tells you what the game is. Gamalytic tells you how it probably performed.**

| Field | Primary | Fallback | Provenance shown as |
| --- | --- | --- | --- |
| Steam AppID | Steam | IGDB `external_games.uid` | — (identity) |
| Name | Steam | IGDB | — |
| Steam URL | derived from AppID | — | — |
| Description / summary | Steam `short_description` | IGDB `summary` | `steam` / `igdb` |
| Long description (for embedding) | Steam `detailed_description`, stripped | Steam `short_description` | `steam` |
| Steam user tags | Steam store page | — | `steam` |
| Genres | IGDB | Steam `genres` | `igdb` |
| Themes | IGDB | — | `igdb` |
| Keywords / mechanics | IGDB `keywords` | LLM extraction | `igdb` / `releasesignal` |
| Game modes | IGDB | — | `igdb` |
| Player perspective | IGDB | — | `igdb` |
| Developer / publisher | Steam | IGDB `involved_companies` | `steam` |
| Release date | Steam | IGDB `first_release_date` | `steam` |
| Price | Steam | Gamalytic | `steam` |
| Review counts | Steam `appreviews` | Gamalytic | `steam` |
| Positive ratio | computed from Steam | — | `steam` |
| Review text sample | Steam `appreviews` | — | `steam` |
| Estimated copies sold | Gamalytic | our Boxleiter estimator | `gamalytic` / `releasesignal` |
| Estimated revenue | Gamalytic | our estimator | `gamalytic` / `releasesignal` |
| Peak CCU history | Gamalytic | — | `gamalytic` |
| Wishlist insights | Gamalytic | — | `gamalytic` |
| Upcoming release dates | Steam upcoming pages | IGDB `first_release_date` future | `steam` |
| Follower counts (upcoming) | SteamDB-style scrape / Steam | — | `steam` |
| **Similarity score** | **us** | — | `releasesignal` |
| **Saturation** | **us** | — | `releasesignal` |
| **Revenue forecast** | **us** (over Gamalytic cohorts) | — | `releasesignal` |
| **Release risk** | **us** | — | `releasesignal` |

The bottom four rows are the product. Everything above them is input. If a judge asks what we built versus what we aggregated, that line in the table is the answer.

---

## Steam

No key required for the store endpoints. Undocumented, so treat them as fragile and cache aggressively — which we do by construction, since we call them once.

### Catalog

Valve deprecated `ISteamApps/GetAppList`; the current method scales better:

```
GET https://api.steampowered.com/IStoreService/GetAppList/v1/
  ?key={STEAM_WEB_API_KEY}
  &include_games=true
  &max_results=50000
  &last_appid={cursor}
  &if_modified_since={unix}
```

Returns `appid`, `name`, `last_modified`, `price_change_number`. Paginate with `last_appid` until `have_more_results` is false. We store the whole list to `data/raw/steam_catalog.json` — roughly 190k entries, 12 MB — and never call this again during the event.

Requires a Steam Web API key. It is free; get one at `steamcommunity.com/dev/apikey`. If key issuance is a problem, the legacy `ISteamApps/GetAppList/v2` still works and needs no key; it is just slower and unfiltered.

### App details

```
GET https://store.steampowered.com/api/appdetails
  ?appids={id}&cc=us&l=en
```

One app per call in practice — the multi-ID form returns truncated objects. This is the slow part of the build. Rate limit: **1 request per 1.5 s**, hard. Exceeding it gets a 429 and then an IP timeout of several minutes, which is the single most likely thing to blow up the build. `scripts/rate_limit.py` enforces it with a token bucket, not `sleep()`.

Fields we take: `name`, `short_description`, `detailed_description`, `genres`, `categories`, `price_overview.final`, `release_date`, `developers`, `publishers`, `type`, `is_free`.

Filter out anything where `type !== 'game'` — DLC, videos, soundtracks and demos are ~60% of the catalog and pollute similarity badly.

`detailed_description` is HTML. Strip tags, collapse whitespace, drop anything after the first `<h2>` that looks like a system-requirements or "about the developer" block. `scripts/clean_description.py` does this; it is 40 lines and it materially improves embedding quality.

### Tags

Steam user tags are not in `appdetails`. They come from the store page HTML, in a JSON blob in an inline script. `scripts/providers/steam_tags.py` parses it. Tags are our hard pre-filter, so this is not optional.

If tag scraping breaks, fall back to `genres` + `categories` from `appdetails` and widen the pre-filter threshold. Quality drops but nothing breaks.

### Reviews

```
GET https://store.steampowered.com/appreviews/{appid}
  ?json=1&language=all&purchase_type=all&num_per_page=100&filter=recent
```

`query_summary` gives `total_positive`, `total_negative`, `total_reviews`, `review_score_desc`. That is what we store. We also keep 100 recent review texts per game for the top ~500 titles, for the sentiment feature. Not 50,000 — the marginal signal past a few hundred is nil and the fetch cost is linear.

### Current players

```
GET https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid={id}
```

We capture this once, at build time, and label it as a point observation with its timestamp. It is **not** a popularity metric and must never be rendered as one. Historical CCU comes from Gamalytic or not at all.

### Upcoming releases

This is the differentiator's data source, so it gets the most care.

Steam's "Coming Soon" browse pages, paginated:

```
GET https://store.steampowered.com/search/results/
  ?query&start={n}&count=50&dynamic_data=&sort_by=Released_DESC
  &category1=998&filter=comingsoon&infinite=1
```

Returns JSON with an HTML fragment. Parse out appids, then run each through `appdetails` for the description (needed for embedding) and the `release_date.date` string.

Steam release dates for unreleased games are messy: `"Q4 2026"`, `"Coming soon"`, `"October 2026"`, `"15 Oct, 2026"`. `scripts/parse_release_date.py` normalizes to `{ date, confidence }` where confidence is `exact | month | quarter | vague`. Vague-dated games are kept but weighted down in risk scoring — see [scoring-models.md](scoring-models.md#date-confidence-weighting).

**They slip.** Announced dates are optimistic and a meaningful fraction move. We handle this by never presenting a single week as certain, and by labelling `dateConfidence` in the UI. Being visibly honest about date uncertainty is stronger than pretending precision.

---

## IGDB

Twitch OAuth. Two env vars: `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`. Token from:

```
POST https://id.twitch.tv/oauth2/token
  ?client_id=..&client_secret=..&grant_type=client_credentials
```

Then all calls carry `Client-ID` and `Authorization: Bearer`. Tokens last ~60 days; cache to disk.

Rate limit: **4 requests/second, max 8 concurrent open requests.** The offline queue respects both.

IGDB uses a POST body query language, not query params:

```
POST https://api.igdb.com/v4/games
Body:
  fields name, summary, genres.name, themes.name, keywords.name,
         game_modes.name, player_perspectives.name, platforms.name,
         first_release_date, involved_companies.company.name,
         external_games.uid, external_games.category,
         rating, rating_count, hypes;
  where external_games.category = 1 & external_games.uid = "{steamAppId}";
  limit 1;
```

`external_games.category = 1` is Steam. This is how we attach an IGDB record to a Steam AppID — the only join we need, done once, offline.

### On the MCP server

IGDB ships an official MCP server with a `semantic_search_games` tool. It is genuinely good and it directly matches our UX. We are not using it, for three reasons:

1. It is labelled **beta and subject to change without notice**. A dependency that can change under you is not a demo dependency.
2. It adds a network round-trip to the hot path, which contradicts the governing constraint.
3. Outsourcing semantic matching outsources the differentiator. "Tags get you 300 roguelikes, your description gets you 15" is only our claim if we compute it.

We do use IGDB's REST API offline for structured metadata — themes, keywords, game modes, perspectives — which is richer than anything Steam exposes and feeds the non-semantic components of the similarity score.

If IGDB is unavailable entirely, the corpus builds without it. `themes` and `keywords` come out empty, similarity reweights (see [scoring-models.md](scoring-models.md#missing-component-reweighting)), and the product still works on Steam data alone. This is worth stating out loud in Q&A: no single external dependency is load-bearing.

---

## Gamalytic

`X-API-KEY` header. **Free tier: 250 requests/day.** Starter: 2,500/day. Some endpoints have per-minute limits on top.

```
GET https://api.gamalytic.com/game/{steamAppId}
GET https://api.gamalytic.com/game/{steamAppId}/peak-ccu-history
GET https://api.gamalytic.com/game/{steamAppId}/review-sentiment
GET https://api.gamalytic.com/steam-games/stats
```

The quota discipline: **do not enrich the corpus, enrich the shortlist.** 4,200 games × several endpoints is 20,000+ requests and is not happening on a free tier.

Our budget:

| Purpose | Requests | Note |
| --- | --- | --- |
| `/game/{id}` for the 500 most likely comparables | 500 | spread over 2 days if on free tier |
| `/peak-ccu-history` for the top 60 | 60 | powers the history charts |
| `/steam-games/stats` | 1 | market-wide baselines for saturation |
| Reserve | ~50 | re-fetches, mistakes |

Which 500? Rank the corpus by `reviews.total` within the tag clusters our demo concept touches, take the top of each cluster. This is written down in `scripts/select_enrichment_targets.py` so the choice is reproducible rather than vibes.

### The fallback estimator

If Gamalytic access does not materialize, we estimate ourselves and say so.

```
copies ≈ reviews_total × multiplier
revenue ≈ copies × price × (1 − refund_rate) × (1 − discount_avg) × 0.70
```

The `0.70` is Valve's cut. The multiplier is the review-to-owner ratio, which is not a constant — it varies by price band, genre and era. We use a small table calibrated against games with known figures, in `lib/scoring/boxleiter.ts`:

| Price band | Multiplier |
| --- | --- |
| Free / <$5 | 60 |
| $5–$15 | 40 |
| $15–$30 | 32 |
| >$30 | 25 |

This is a rough public heuristic and we present it as one. The UI labels it `ⓘ ReleaseSignal estimate · Boxleiter ×32` and the tooltip shows the formula. A visible method with a stated error band is more defensible under questioning than an opaque third-party number, so this fallback is not purely a downgrade.

---

## Provenance rules

Non-negotiable, because the whole credibility story rests on them.

1. **Every rendered number carries a source.** No exceptions, including zero and null.
2. **Never blend sources into one number.** If Steam and Gamalytic disagree on price, show Steam and note the discrepancy. Do not average.
3. **`estimated: true` for anything modelled.** Including our own outputs. Especially our own outputs.
4. **Our predictions say `releasesignal` and carry a `method` string.** Never `steam`, never unlabelled.
5. **Ranges, not points.** Revenue is conservative/base/upside. `$273,841` is a lie with four significant figures of confidence we do not have.
6. **Missing is a state, not a zero.** `{ value: null, source: 'gamalytic', estimated: true }` renders as an em-dash with a tooltip, not `$0`.

---

## Environment

```bash
# .env.example

# Offline pipeline only — the app runs without these
STEAM_WEB_API_KEY=
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
GAMALYTIC_API_KEY=

# Runtime — required
ANTHROPIC_API_KEY=
OPENAI_API_KEY=              # embeddings only

# Runtime — optional
DEMO_MODE=false              # forces cached responses, see demo-runbook.md
CORPUS_PATH=./data
```

Nothing in the first block is read by any file under `app/` or `lib/`. CI has a grep check that fails if that stops being true.
