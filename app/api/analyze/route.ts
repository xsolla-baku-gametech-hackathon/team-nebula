import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail } from '@/lib/api/envelope';

const Schema = z.object({
  concept: z.unknown(),
  competitorAppIds: z.array(z.number()).min(3).max(30),
  horizonWeeks: z.number().optional().default(26),
});

export async function POST(req: NextRequest) {
  const t0 = performance.now();
  try {
    Schema.parse(await req.json());

    // TODO: run saturation, revenue, reception, release-risk scoring
    return ok({ report: null }, t0);
  } catch (e) {
    return fail(e, t0);
  }
}
