import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api/envelope';
import { analyzeConcept } from '@/lib/ai/concept-analyzer';

export async function POST(req: NextRequest) {
  const t0 = performance.now();
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return fail(new Error('No file provided'), t0);

    const text = await file.text();

    // JSON direct import
    if (file.name.endsWith('.json')) {
      const concept = JSON.parse(text);
      return ok({ concept, questions: [], importMethod: 'json_direct', truncated: false }, t0);
    }

    // Text/Markdown extraction
    const truncated = text.length > 20000;
    const input = truncated ? text.slice(0, 20000) : text;
    const result = await analyzeConcept({ text: input });
    return ok({ concept: result.concept, questions: result.questions, importMethod: 'llm_extraction', truncated }, t0);
  } catch (e) {
    return fail(e, t0);
  }
}
