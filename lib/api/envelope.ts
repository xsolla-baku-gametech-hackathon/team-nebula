import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ResponseMeta, DegradedFlag } from '@/lib/types';

export function ok<T>(data: T, t0: number, corpusVersion: string = '', degraded?: DegradedFlag[]) {
  const meta: ResponseMeta = {
    durationMs: Math.round(performance.now() - t0),
    corpusVersion,
    ...(degraded?.length ? { degraded } : {}),
  };
  return NextResponse.json({ ok: true, data, meta });
}

export function fail(e: unknown, _t0: number) {
  if (e instanceof ZodError) {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_INPUT', message: 'Invalid request body', details: e.issues } },
      { status: 400 },
    );
  }

  const message = e instanceof Error ? e.message : 'Internal error';
  const code = message.includes('corpus') ? 'CORPUS_UNAVAILABLE' : 'INTERNAL';
  const status = code === 'CORPUS_UNAVAILABLE' ? 503 : 500;

  return NextResponse.json(
    { ok: false, error: { code, message: process.env.NODE_ENV === 'production' ? 'Internal error' : message } },
    { status },
  );
}
