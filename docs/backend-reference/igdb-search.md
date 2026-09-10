# IGDB MCP candidate search

The backend talks directly to the hosted IGDB MCP endpoint through the JavaScript MCP SDK. Grok does not open the MCP connection and cannot choose arbitrary tool arguments.

For a ready description, the backend creates up to two semantic queries from the normalized description and validated tags. Each query asks `semantic_search_games` for at most forty games with only the fields needed for preview ranking: ID, name, summary, and game modes.

Results are normalized before reaching Grok:

- Duplicate IGDB IDs are removed.
- Empty descriptions are discarded.
- HTML is converted to bounded plain text.
- Explicit multiplayer requirements are checked against IGDB mode IDs.
- The combined pool is capped at sixty candidates.

The MCP session is authenticated with the `igdb-mcp/read` client-credentials scope. Requests use a shared rate gate, timeouts, no-store fetch semantics, and one retry for transient connection or server failures. Authentication is refreshed after a 401, while quota responses create a cooldown instead of immediate retries.

Provider bodies, credentials, and raw MCP errors never enter public API responses.
