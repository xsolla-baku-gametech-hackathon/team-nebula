# Grok description validation

Description validation answers whether the input contains enough evidence for similarity search. It is a relevance check, not content moderation.

Grok returns a structured object with:

- `status`: `ready` or `needs_clarification`.
- `normalizedDescription`: a concise restatement of the request.
- `confidence`: a number from 0 through 1.
- `tags`: two to twelve categorized discovery facets when ready.
- `mustHave` and `avoid`: explicit constraints.
- `multiplayer`: true, false, or null when unspecified.
- `questions`: up to three clarification questions.

The backend accepts `ready` only when confidence is at least 0.65, at least two unique tags exist, one tag is required, and no questions remain. A clarification result must contain at least one question.

Compact but clear requests remain valid. For example, “multiplayer horror games” provides a theme and game-mode constraint. Inputs such as “fun game” do not describe enough gameplay, theme, mode, setting, or perspective to search reliably.

All fields are schema-validated after generation. Invalid model output becomes `INVALID_AI_OUTPUT` or the safe AI-unavailable response rather than silently falling back to manually selected games.
