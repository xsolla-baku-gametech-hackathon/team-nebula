# Candidate ranking

Grok ranks the normalized IGDB candidate pool after search. It receives the validated description, accepted tags, constraints, and bounded candidate evidence.

The ranking output contains up to twenty selections:

```json
{
  "igdbId": 140038,
  "reason": "Supports multiplayer monster-versus-survivor horror.",
  "matchedTags": ["Horror", "Multiplayer"]
}
```

The backend drops any selection whose ID is absent from the candidate pool or repeats an earlier one, and removes any matched tag that is not in the validated tag list. The surviving selections are returned, the response reports `complete:false`, and `discovery.issues` carries a count of what was discarded. Dropped IDs are logged server-side and never appear in the response. This validation makes model ranking advisory while the backend retains control of identity and output integrity.

A single invented ID is not worth discarding an entire ranking, two provider round-trips, and the user's validated concept. Only a ranking that cannot be parsed at all returns `INVALID_AI_OUTPUT`, because that response has nothing to salvage.

Matched tags are compared on a normalized key, so case and punctuation drift resolve to the validated spelling rather than counting as an invention. Two spellings of the same tag inside one selection collapse to one and are not reported.

Grok is instructed to return every candidate that plausibly fits, up to twenty, omitting only genuinely weak ones. Reasons must use candidate descriptions, semantic context, or game-mode evidence. Candidate prose is truncated before it reaches the model, because copying exact IDs out of a very long payload is what produces invented IDs in the first place. Titles named in the user's description are inspirations, never selectable candidates. The model cannot supply Steam AppIDs, prices, review counts, or sales estimates.

Twenty ranked results provide reserves for candidates that lack one exact Steam identity. Only the highest-ranked verified results up to the requested preview limit are shown. The approval stage never substitutes a candidate the user did not see.
