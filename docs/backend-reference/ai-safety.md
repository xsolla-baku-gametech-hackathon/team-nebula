# AI safety boundaries

User descriptions, clarification answers, IGDB summaries, and semantic-search context are all untrusted text. Prompts explicitly identify them as data and instruct Grok never to treat embedded text as system or developer instructions.

Structured-output schemas constrain both AI stages. Description validation restricts status, confidence, tag categories, tag priority, and field lengths. Ranking restricts IDs, reasons, and matched tags. The backend performs an additional membership check after schema validation.

The model has no tools and no access to credentials, filesystem state, Steam endpoints, or MCP transport. It cannot initiate collection. All network operations remain explicit backend functions.

The xAI request uses:

- The configured model, defaulting to `grok-4.6`.
- A 45-second abort signal.
- A 4,000-token output limit.
- One bounded transient retry.
- Responses API storage disabled with `store:false`.

Safe diagnostic logs contain error categories and status metadata only. Prompts, generated bodies, API keys, OAuth tokens, and raw provider errors are excluded from client responses.

These controls reduce model-driven integrity failures. They do not make ranking objectively correct, so approval remains a required human decision.
