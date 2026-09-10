import { NextResponse } from 'next/server';

export async function GET() {
  const demoMode = process.env.DEMO_MODE === 'true';

  return NextResponse.json({
    ok: true,
    corpus: { loaded: false, count: 0, version: 'none', upcomingCount: 0 },
    ai: {
      extraction: process.env.ANTHROPIC_API_KEY ? 'available' : 'unavailable',
      embedding: process.env.OPENAI_API_KEY ? 'available' : 'unavailable',
    },
    demoMode,
  });
}
