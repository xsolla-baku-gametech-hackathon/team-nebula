import { z } from 'zod';

const SnapshotSchema = z.object({
  snapshotId: z.string().trim().min(1).max(100),
  generatedAt: z.string().datetime(),
  conceptVersion: z.number().int().nonnegative(),
  concept: z.record(z.unknown()),
  competitors: z.array(z.unknown()).max(10),
  report: z.record(z.unknown()),
  corpusVersion: z.string().trim().min(1).max(200),
}).strict();

const PayloadSchema = z.object({ snapshot: SnapshotSchema }).strict();

export async function POST(req: Request) {
  try {
    const { snapshot } = PayloadSchema.parse(await req.json());

    const exportData = {
      exportVersion: '1',
      exportedAt: new Date().toISOString(),
      corpusVersion: snapshot.corpusVersion,
      snapshot,
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="releasesignal-${snapshot.snapshotId}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const invalid = error instanceof z.ZodError;
    return Response.json({
      ok: false,
      error: {
        code: invalid ? 'INVALID_INPUT' : 'INTERNAL',
        message: invalid ? 'A complete analysis snapshot is required' : 'Export failed',
      },
    }, { status: invalid ? 400 : 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
