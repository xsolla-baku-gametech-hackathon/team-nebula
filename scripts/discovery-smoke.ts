import { config } from 'dotenv';
import { resolve } from 'node:path';

async function main() {
  config({ path: resolve('.env.local'), quiet: true });
  config({ path: resolve('.env'), quiet: true });
  const args = process.argv.slice(2);
  const approveAll = args.includes('--approve-all');
  const query = args.filter(argument => argument !== '--approve-all').join(' ').trim();
  if (!query) {
    console.error('Usage: corepack pnpm discovery:smoke [--approve-all] "multiplayer horror games"');
    process.exitCode = 1;
    return;
  }
  const { previewGames } = await import('../lib/discovery/preview');
  const started = Date.now();
  const preview = await previewGames({ query, limit: 10 });
  let collection;
  if (approveAll && preview.status === 'ready_for_approval') {
    const { approvePreview } = await import('../lib/discovery/approve');
    collection = await approvePreview({ previewId: preview.previewId, approveAll: true });
  }
  console.log(JSON.stringify({ preview, collection, durationMs: Date.now() - started }, null, 2));
  if (preview.status !== 'ready_for_approval' || !preview.discovery.complete || (approveAll && !collection?.approval.complete)) process.exitCode = 1;
}
void main().catch(() => {
  console.error('Discovery failed; check provider configuration and retry.');
  process.exitCode = 1;
});
