import { config } from 'dotenv';
import { resolve } from 'node:path';

async function main() {
  config({ path: resolve('.env.local'), quiet: true });
  config({ path: resolve('.env'), quiet: true });
  const query = process.argv.slice(2).join(' ').trim();
  if (!query) {
    console.error('Usage: corepack pnpm discovery:smoke "multiplayer horror games"');
    process.exitCode = 1;
    return;
  }
  const { previewGames } = await import('../lib/discovery/preview');
  const started = Date.now();
  const result = await previewGames({ query, limit: 10 });
  console.log(JSON.stringify({ ...result, durationMs: Date.now() - started }, null, 2));
  if (result.status !== 'ready_for_approval' || !result.discovery.complete) process.exitCode = 1;
}
void main().catch(() => {
  console.error('Discovery failed; check provider configuration and retry.');
  process.exitCode = 1;
});
