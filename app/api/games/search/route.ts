import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '8', 10);

  if (q.length < 2) {
    return NextResponse.json({ ok: true, data: { results: [] } });
  }

  // TODO: fuzzySearch over loaded corpus
  void limit;
  return NextResponse.json({ ok: true, data: { results: [] } });
}
