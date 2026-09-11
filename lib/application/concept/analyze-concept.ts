import type { GameConcept, ClarifyingQuestion } from '@/lib/domain/types';
import { fallbackExtract } from './fallback-extract';
import { generateQuestions } from '@/lib/infrastructure/grok/generate-questions';
import { grokExtract } from '@/lib/infrastructure/grok/extract-concept';

export async function analyzeConcept(input: {
  text: string;
  previous?: GameConcept;
  answers?: Record<string, string>;
}): Promise<{ concept: GameConcept; questions: ClarifyingQuestion[]; degraded: boolean }> {
  // Try Grok LLM extraction first, fall back to keywords
  let concept = await grokExtract(input.text);
  let degraded = false;

  if (!concept) {
    const fallback = fallbackExtract(input.text);
    concept = fallback.concept;
    degraded = true;
  }

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

  // Generate follow-up questions via Grok
  const questions = await generateQuestions(concept);

  return { concept, questions, degraded };
}
