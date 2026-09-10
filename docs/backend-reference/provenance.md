# Field provenance and issues

Every collected fact carries enough metadata to distinguish provider facts from estimates and AI judgments.

Numeric values use the shared `Sourced<T>` shape:

```ts
{
  value: number | null;
  source: "steam" | "igdb" | "gamalytic" | "releasesignal" | "user";
  estimated: boolean;
  method?: string;
}
```

The game-level `collection.sources` map identifies the owner of identity, description, genres, tags, themes, keywords, perspective, modes, platforms, release data, and reviews. `collection.fetches` records when each live provider call completed. These timestamps indicate retrieval time, not the upstream dataset's update time.

Optional omissions and failures appear in `collection.issues` with provider, stable code, safe message, and optional field path. Missing data stays null or empty; it is never silently replaced by a value from another source.

Grok ranking evidence is separate under `match`. Its reason and discovery tags explain why a game was proposed but do not change the provenance of any collected fact.
