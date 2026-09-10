# Two-stage discovery sequence

The preview request performs only the work needed to propose names:

1. Parse `query`, `limit`, and optional clarification answers.
2. Ask Grok for a structured readiness decision and normalized tags.
3. Return questions immediately when the description is insufficient.
4. Build semantic queries from every accepted tag.
5. Search IGDB MCP and discard candidates lacking required mode evidence.
6. Ask Grok to rank only the retrieved candidates.
7. Validate ranked IDs and matched tags against the supplied sets.
8. Resolve one exact Steam AppID per IGDB game.
9. Store and return up to the requested number of compact candidates.

The approval request performs the expensive work:

1. Parse either `approveAll:true` or a selected AppID subset.
2. Claim the preview atomically.
3. Verify each AppID belongs to the preview.
4. Fetch live provider data for exactly those games.
5. Attach the stored Grok reason and matched tags.
6. Consume the preview after a normal result.

No prices, reviews, comments, full Steam descriptions, or sales estimates are fetched before approval. This reduces unnecessary provider traffic and lets a user reject poor matches before waiting for collection.
