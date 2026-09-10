import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ appId: string }> },
) {
  const { appId } = await params;
  void appId;

  // TODO: look up game in corpus by appId
  return NextResponse.json(
    { ok: false, error: { code: 'INVALID_INPUT', message: 'Game not found in corpus' } },
    { status: 404 },
  );
}
