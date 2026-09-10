import { NextResponse } from 'next/server';

export async function GET() {
  const demoMode = process.env.DEMO_MODE === 'true';

  return NextResponse.json({
    ok: true,
    collector: {
      service: 'similar-games-data-collector',
      mode: 'live',
      storage: 'none',
      igdbMcpConfigured: Boolean(process.env.IGDB_MCP_CLIENT_ID && process.env.IGDB_MCP_CLIENT_SECRET),
      // Configuration only; this health route does not probe upstream availability.
      grokConfigured: Boolean(process.env.XAI_API_KEY),
      discovery: {
        flow: 'preview_then_approve',
        pendingPreviewStorage: 'memory',
        previewTtlMinutes: 30,
        maxPendingPreviews: 100,
      },
    },
    corpus: { loaded: false, count: 0, version: 'none', upcomingCount: 0 },
    ai: {
      extraction: process.env.ANTHROPIC_API_KEY ? 'available' : 'unavailable',
      embedding: process.env.OPENAI_API_KEY ? 'available' : 'unavailable',
    },
    demoMode,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
