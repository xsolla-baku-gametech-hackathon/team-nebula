/**
 * Uses Grok to extract a structured GameConcept from a game description.
 * Falls back to keyword extraction if Grok is unavailable.
 */

import type { GameConcept, GameMode, Perspective, Platform } from "@/lib/domain/types";

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

const SYSTEM_PROMPT = `You are a game market analyst. Extract structured data from a game description.

Return JSON only with this exact shape:
{
  "title": string | null,
  "primaryGenre": string | null,
  "secondaryGenres": string[],
  "themes": string[],
  "mechanics": string[],
  "gameModes": string[],
  "perspective": string | null,
  "platforms": string[],
  "priceUsd": number | null,
  "plannedRelease": string | null,
  "teamSize": number | null,
  "isFirstTitle": boolean | null
}

Rules:
- primaryGenre: one of Horror, RPG, Shooter, Platformer, Strategy, Survival, Simulation, Adventure, Puzzle, Racing, Fighting, Sandbox, Roguelike, Metroidvania, Visual Novel, or other
- gameModes: array of "Singleplayer", "Online Co-op", "Local Co-op", "Online PvP", "Local PvP", "MMO"
- perspective: one of "First person", "Third person", "Isometric", "Side view", "Top down", "Text", or null
- platforms: array of "PC", "Mac", "Linux", "Switch", "PS5", "Xbox"
- mechanics: gameplay mechanics like "permadeath", "crafting", "base building", "procedural generation", "stealth", etc.
- themes: narrative/aesthetic themes like "Sci-Fi", "Dark", "Underwater", "Post-apocalyptic", etc.
- priceUsd: extract price if mentioned, null otherwise
- plannedRelease: extract date/quarter if mentioned, null otherwise
- Be thorough — infer from context when not explicitly stated`;

export async function grokExtract(text: string): Promise<GameConcept | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

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
          { role: "user", content: text },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      console.error("Grok extract error:", res.status);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    const concept: GameConcept = {
      version: 1,
      concept: {
        title: parsed.title ?? null,
        shortDescription: text.slice(0, 300),
        rawText: text,
        platforms: (parsed.platforms as Platform[]) ?? ["PC"],
        targetSteam: true,
      },
      taxonomy: {
        primaryGenre: parsed.primaryGenre ?? null,
        secondaryGenres: parsed.secondaryGenres ?? [],
        themes: parsed.themes ?? [],
        mechanics: parsed.mechanics ?? [],
        gameModes: (parsed.gameModes as GameMode[]) ?? [],
        perspective: (parsed.perspective as Perspective) ?? null,
      },
      commercial: {
        priceUsd: parsed.priceUsd ?? null,
        plannedRelease: parsed.plannedRelease ?? null,
        teamSize: parsed.teamSize ?? null,
        isFirstTitle: parsed.isFirstTitle ?? null,
      },
      confidence: {
        primaryGenre: parsed.primaryGenre ? 0.8 : 0,
        mechanics: parsed.mechanics?.length >= 2 ? 0.7 : 0.3,
        gameModes: parsed.gameModes?.length > 0 ? 0.8 : 0.2,
        perspective: parsed.perspective ? 0.8 : 0,
        priceUsd: parsed.priceUsd ? 0.9 : 0,
        plannedRelease: parsed.plannedRelease ? 0.7 : 0,
      },
      missingImportantFields: [],
    };

    // Compute missing fields
    if (!concept.taxonomy.primaryGenre) concept.missingImportantFields.push("primaryGenre");
    if (concept.taxonomy.mechanics.length < 2) concept.missingImportantFields.push("mechanics");
    if (concept.taxonomy.gameModes.length === 0) concept.missingImportantFields.push("gameModes");
    if (!concept.taxonomy.perspective) concept.missingImportantFields.push("perspective");
    if (!concept.commercial.priceUsd) concept.missingImportantFields.push("priceUsd");
    if (!concept.commercial.plannedRelease) concept.missingImportantFields.push("plannedRelease");

    return concept;
  } catch (e) {
    console.error("Grok extract failed:", e);
    return null;
  }
}
