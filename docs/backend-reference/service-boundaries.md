# Service purpose and boundaries

The `similar-games-data-collector` backend turns a game description into an approved set of comparable Steam games and then retrieves live facts for those games. It separates discovery judgments from provider facts so callers can tell why a title matched and where every statistic originated.

The service owns three operations:

1. Validate a user description and derive search facets with Grok.
2. Search and rank IGDB candidates, then hold a compact approval preview.
3. Collect live Steam, IGDB, and Gamalytic data for explicitly approved AppIDs.

The service does not render UI, persist full game records, predict revenue, generate sales-history charts, or perform the later market analysis. The frontend decides how to display clarification questions and candidate approval controls.

Grok contributes interpretation and ranking. It never supplies prices, review totals, release dates, sales estimates, or Steam identities. IGDB MCP supplies candidates and cross-service identities. Steam remains authoritative for store facts and reviews. Gamalytic supplies optional estimates.

The public entry points are:

- `POST /api/games/discover` for validation and preview.
- `POST /api/games/discover/collect` for approved collection.
- `POST /api/games/collect` for direct collection from known Steam AppIDs.

These boundaries keep model output reviewable before the expensive provider stage and prevent unapproved candidates from entering a result.
