# Discovery tag semantics

Discovery tags describe the requested game and drive candidate retrieval. They are not copied from Steam and should not be presented as verified store tags.

Each tag contains:

| Field | Meaning |
| --- | --- |
| `name` | Short human-readable facet |
| `category` | Genre, theme, mechanic, mode, perspective, setting, or tone |
| `priority` | Required or preferred |
| `basis` | Explicitly stated or inferred |

Required tags represent constraints the user actually supplied. Inferred details must remain preferred so Grok cannot convert a guess into a hard filter. A ready validation needs at least one required tag.

Tag names are unique case-insensitively, limited to 80 characters, and capped at twelve. The search-query builder includes every validated tag across its two semantic queries. The ranking stage may report only exact tag names from this validated set.

After approval, Steam tags are fetched separately from the live store page. Those appear in `metadata.tags` and may differ from the earlier discovery facets. Keeping these concepts separate preserves provenance and avoids implying that Grok generated Steam facts.
