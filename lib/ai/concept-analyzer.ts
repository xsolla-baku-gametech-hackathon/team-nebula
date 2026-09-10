import type { GameConcept, ClarifyingQuestion } from '@/lib/types';
import { fallbackExtract } from './fallback-extract';
import { generateQuestions } from './grok-questions';

export async function analyzeConcept(input: {
  text: string;
  previous?: GameConcept;
  answers?: Record<string, string>;
}): Promise<{ concept: GameConcept; questions: ClarifyingQuestion[]; degraded: boolean }> {
  // Extract concept using keyword fallback
  const { concept } = fallbackExtract(input.text);

  // Merge with previous if provided
  if (input.previous) {
    concept.version = input.previous.version + 1;
    if (!concept.taxonomy.primaryGenre && input.previous.taxonomy.primaryGenre) {
      concept.taxonomy.primaryGenre = input.previous.taxonomy.primaryGenre;
    }
    if (concept.taxonomy.mechanics.length === 0 && input.previous.taxonomy.mechanics.length > 0) {
      concept.taxonomy.mechanics = input.previous.taxonomy.mechanics;
    }
  }

  // Apply answers
  if (input.answers) {
    for (const [field, value] of Object.entries(input.answers)) {
      switch (field) {
        case 'primaryGenre': concept.taxonomy.primaryGenre = value; break;
        case 'perspective': concept.taxonomy.perspective = value as GameConcept['taxonomy']['perspective']; break;
        case 'priceUsd': concept.commercial.priceUsd = parseFloat(value) || null; break;
        case 'plannedRelease': concept.commercial.plannedRelease = value; break;
      }
    }
  }

  // Generate follow-up questions via Grok (falls back to hardcoded if no API key)
  const questions = await generateQuestions(concept);

  return { concept, questions, degraded: !process.env.XAI_API_KEY };
}
