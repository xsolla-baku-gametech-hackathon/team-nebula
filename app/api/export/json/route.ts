import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { snapshot } = await req.json();

    const exportData = {
      exportVersion: '1',
      exportedAt: new Date().toISOString(),
      corpusVersion: snapshot?.corpusVersion ?? 'unknown',
      snapshot,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="releasesignal-${Date.now()}.json"`,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL', message: 'Export failed' } },
      { status: 500 },
    );
  }
}
