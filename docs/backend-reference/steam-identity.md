# Exact Steam identity resolution

Candidate names are insufficient for joining IGDB and Steam. Different games can share names, regional titles can differ, and editions can look nearly identical. The backend therefore resolves identities through IGDB `external_game` records.

A usable mapping must satisfy all of these conditions:

1. The external record belongs to the candidate IGDB ID.
2. `external_game_source` identifies Steam.
3. `uid` contains a positive numeric Steam AppID.
4. The AppID fits the accepted unsigned 32-bit range.
5. Exactly one distinct Steam AppID remains.

Missing and ambiguous mappings are omitted from the preview. The backend never falls back to fuzzy name matching.

During approved collection, the returned game's IGDB ID is compared with the candidate IGDB ID when enrichment is available. A mismatch becomes an `invalid_data` failure and the game is excluded.

This exact join protects every downstream price, review, and estimate from being attached to the wrong title.
