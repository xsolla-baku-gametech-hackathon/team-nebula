import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail } from '@/lib/api/envelope';
import { analyzeConcept } from '@/lib/application/concept/analyze-concept';

const Schema = z.object({
  text: z.string().min(1).max(8000),
  previous: z.unknown().optional(),
  answers: z.record(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const t0 = performance.now();
  try {
    const body = Schema.parse(await req.json());
    const result = await analyzeConcept({
      text: body.text,
      previous: body.previous as Parameters<typeof analyzeConcept>[0]['previous'],
      answers: body.answers,
    });
    return ok(
      { concept: result.concept, questions: result.questions, readyToProceed: result.concept.missingImportantFields.length === 0 },
      t0,
      '',
      result.degraded ? ['llm_fallback'] : undefined,
    );
  } catch (e) {
    return fail(e, t0);
  }
}
