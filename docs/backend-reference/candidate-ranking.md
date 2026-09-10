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

The backend rejects the entire ranking when Grok selects an ID absent from the candidate pool, repeats an ID, invents a matched tag, or repeats a matched tag. This validation makes model ranking advisory while the backend retains control of identity and output integrity.

Grok is instructed to omit weak candidates rather than fill the requested count. Reasons must use candidate descriptions, semantic context, or game-mode evidence. The model cannot supply Steam AppIDs, prices, review counts, or sales estimates.

Twenty ranked results provide reserves for candidates that lack one exact Steam identity. Only the highest-ranked verified results up to the requested preview limit are shown. The approval stage never substitutes a candidate the user did not see.
