# Provider resilience

Live collection coordinates independent providers with bounded waits and sanitized failures.

| Provider | Minimum request spacing | Request timeout |
| --- | ---: | ---: |
| Steam | 1,500 ms | 12 seconds |
| IGDB MCP | 250 ms | 15–20 seconds |
| Gamalytic | 250 ms | 12 seconds |
| xAI | Provider-managed | 45 seconds per AI stage |

Ordinary HTTP and MCP calls retry one transient connection or server failure. Grok structured generation also allows one bounded retry. Authentication errors refresh the IGDB OAuth token once. A 429 response establishes at least a 60-second cooldown and is not immediately retried.

Request gates reserve slots synchronously, preventing concurrent calls from taking the same provider slot. Queue waits are bounded to avoid holding requests indefinitely. Gates are process-local and do not coordinate separate deployment instances.

Steam enrichment can require four calls per game, so ten approved games commonly take at least one minute. Preview latency includes two Grok stages, IGDB semantic search, and identity resolution. API duration limits are 300 seconds for preview and 180 seconds for approved collection.

Partial provider failures are expected output. Operators should use issue codes and safe diagnostic categories rather than logging provider bodies or credentials.
