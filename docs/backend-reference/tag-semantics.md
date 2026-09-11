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

Tag names are unique case-insensitively, limited to 80 characters, and capped at twelve. The search-query builder includes every validated tag across its two semantic queries. The ranking stage may report only tag names from this validated set, matched on a normalized key so case or punctuation drift does not fail the request.

## Canonical names and normalization

`lib/domain/tag-vocabulary.ts` holds a curated vocabulary of canonical tag names with aliases. `lib/domain/discovery-tags.ts` applies it to every ready validation before any search happens, deterministically and without calling the model again:

- **`genre` is a closed set.** An off-vocabulary genre is dropped. Genre is compared by exact equality against IGDB and Steam genre fields, so a free-form value there is unmatchable and silently distorts similarity scoring.
- **Every other category stays free-form.** A setting such as `apartment` or a tone such as `dread` is kept. These feed the semantic query, which is free text, and discarding them would also risk falling below the two-tag readiness gate for a genuinely novel concept.
- **Spelling and category are canonicalized.** A vocabulary hit adopts the canonical name and, when the vocabulary says the term is a genre, the `genre` category — repairing a genre the model filed as a mechanic.
- **Stated genres are guaranteed.** Any genre named outright in the query becomes a `genre` / `required` / `explicit` tag. Matching is word-boundary aware, tolerates plurals, skips negated mentions such as "not a platformer", and prefers the longest overlapping genre so "survival horror" yields one tag rather than three.
- **Capping is priority-aware.** Trimming to twelve drops `preferred` and `inferred` claims first, so a full model response cannot push out a guaranteed genre.

Normalization re-validates its own output and keeps the original on failure. It can add or correct tags; it can never turn a searchable description into an error.

The vocabulary is curated, not derived from the corpus: `data/games.json` is a twelve-game demo set whose tags do not cover the genre space, and the offline fetch scripts populate `tags` from genres rather than real store tags.

After approval, Steam tags are fetched separately from the live store page. Those appear in `metadata.tags` and may differ from the earlier discovery facets. Keeping these concepts separate preserves provenance and avoids implying that Grok generated Steam facts.
