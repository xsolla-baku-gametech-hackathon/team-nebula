export const EXTRACT_SYSTEM = `You extract structured game-design metadata from developer descriptions.

Output ONLY a JSON object matching the provided schema. No prose, no markdown fences, no explanation.

Rules:
- Never invent a value. If the text does not state or clearly imply a field, set it to null and add it to missingImportantFields.
- confidence is per field, 0..1. Explicitly stated: >0.9. Strongly implied: 0.6-0.9. Guessed from genre convention: <0.5.
- mechanics should be specific and player-facing ("proximity voice chat", "permadeath", "deck construction"), never generic ("fun", "immersive").
- shortDescription: rewrite the developer's text as 1-3 neutral sentences describing what the player does. Strip marketing language. This text is used for semantic matching.
- Use only the enum values given for platforms, gameModes and perspective.`;

export function extractUserMessage(text: string, schema: string, previous?: string): string {
  let msg = `Schema:\n${schema}\n\nDeveloper description:\n${text}`;
  if (previous) msg += `\n\nPrevious concept (update only changed fields):\n${previous}`;
  return msg;
}
