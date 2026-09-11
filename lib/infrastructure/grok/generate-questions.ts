/**
 * Uses the Grok API to generate relevant follow-up questions
 * that would help narrow down the game's niche.
 *
 * Falls back to hardcoded questions if Grok is not configured.
 */

import type { GameConcept, ConceptField } from "@/lib/domain/types";

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

interface GrokQuestion {
  field: ConceptField | "general";
  question: string;
}

const SYSTEM_PROMPT = `You are a game market analyst. Given a game description and what we already know about it, generate 3-5 follow-up questions that would help narrow down the game's exact niche and competitive position on Steam.

Focus on questions that would help differentiate this game from similar titles — gameplay loops, session structure, monetization, target audience, unique mechanics, tone, art style, etc.

Do NOT ask about things already mentioned in the description.

Return JSON only — an array of objects with "field" (one of: "primaryGenre", "mechanics", "gameModes", "perspective", "priceUsd", "plannedRelease", "platforms", or "general") and "question" (the question text).

Example output:
[
  {"field": "mechanics", "question": "Does the game have permadeath, or can players respawn during a session?"},
  {"field": "general", "question": "What makes your game different from Lethal Company or Phasmophobia?"},
  {"field": "priceUsd", "question": "Are you targeting the $10-15 impulse-buy range or the $25-30 premium indie range?"}
]`;

function buildUserPrompt(concept: GameConcept): string {
  const t = concept.taxonomy;
  const c = concept.commercial;
  const known: string[] = [];

  if (t.primaryGenre) known.push(`Genre: ${t.primaryGenre}`);
  if (t.secondaryGenres.length) known.push(`Sub-genres: ${t.secondaryGenres.join(", ")}`);
  if (t.mechanics.length) known.push(`Mechanics: ${t.mechanics.join(", ")}`);
  if (t.gameModes.length) known.push(`Modes: ${t.gameModes.join(", ")}`);
  if (t.perspective) known.push(`Perspective: ${t.perspective}`);
  if (c.priceUsd) known.push(`Price: $${c.priceUsd}`);
  if (c.plannedRelease) known.push(`Release: ${c.plannedRelease}`);

  return `Description: "${concept.concept.rawText}"

Already extracted:
${known.length ? known.join("\n") : "Nothing yet — very little info."}

Missing fields: ${concept.missingImportantFields.join(", ") || "none"}

Generate follow-up questions to narrow the niche.`;
}

export async function generateQuestions(
  concept: GameConcept,
): Promise<{ field: ConceptField; question: string; skippable: true }[]> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return fallbackQuestions(concept);

  try {
    const res = await fetch(GROK_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL?.trim() || "grok-3-mini-fast",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(concept) },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error("Grok API error:", res.status, await res.text().catch(() => ""));
      return fallbackQuestions(concept);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // Extract JSON from response (may be wrapped in ```json blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return fallbackQuestions(concept);

    const parsed = JSON.parse(jsonMatch[0]) as GrokQuestion[];
    return parsed.map((q) => ({
      field: (q.field === "general" ? "mechanics" : q.field) as ConceptField,
      question: q.question,
      skippable: true as const,
    }));
  } catch (e) {
    console.error("Grok question generation failed:", e);
    return fallbackQuestions(concept);
  }
}

/** Hardcoded fallback if Grok is not available */
function fallbackQuestions(
  concept: GameConcept,
): { field: ConceptField; question: string; skippable: true }[] {
  const qs: { field: ConceptField; question: string; skippable: true }[] = [];
  const t = concept.taxonomy;
  const c = concept.commercial;

  if (!t.primaryGenre) qs.push({ field: "primaryGenre", question: "What's the primary genre?", skippable: true });
  if (t.gameModes.length === 0) qs.push({ field: "gameModes", question: "How many players? (solo, co-op, multiplayer)", skippable: true });
  if (!t.perspective) qs.push({ field: "perspective", question: "What's the camera perspective?", skippable: true });
  if (t.mechanics.length < 2) qs.push({ field: "mechanics", question: "What are the core mechanics? (e.g. crafting, stealth, permadeath)", skippable: true });
  if (!c.priceUsd) qs.push({ field: "priceUsd", question: "What's your target price point?", skippable: true });
  if (!c.plannedRelease) qs.push({ field: "plannedRelease", question: "When are you planning to release?", skippable: true });

  return qs;
}
