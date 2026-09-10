# Clarification flow

When validation returns `needs_clarification`, the response contains no preview ID and the backend stops before IGDB MCP. This is an intentional control point: searching a vague description would spend provider capacity on broad candidates that the user is unlikely to approve.

A client displays the returned questions and resubmits the original query with up to three objects:

```json
{
  "query": "a fun game",
  "clarifications": [
    {"question": "What does the player do?", "answer": "Investigates haunted buildings"},
    {"question": "Single-player or multiplayer?", "answer": "Online co-op"}
  ]
}
```

Questions are limited to 500 characters and answers to 1,000 characters. Grok receives the original query and answers together, then produces a fresh validation result. The backend does not merge free text into hidden state.

A clarified request can still return more questions when essential information remains missing. It proceeds to search only after satisfying the normal readiness rules.

Clarification text is treated as untrusted data. It cannot change the output schema, provider policy, or instruction hierarchy. No preview record is created until the description is ready.
