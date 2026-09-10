import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail } from '@/lib/api/envelope';

const Schema = z.object({
  concept: z.unknown(),
  limit: z.number().min(1).max(30).optional().default(12),
  excludeAppIds: z.array(z.number()).optional(),
  includeAppIds: z.array(z.number()).optional(),
});

export async function POST(req: NextRequest) {
  const t0 = performance.now();
  try {
    Schema.parse(await req.json());

    // TODO: implement when corpus is loaded
    // 1. embed concept
    // 2. hard filter by tags
    // 3. cosine search
    // 4. rerank with similarity scoring
    return ok({ competitors: [], totalCandidates: 0, filterRelaxed: false }, t0);
  } catch (e) {
    return fail(e, t0);
  }
}
