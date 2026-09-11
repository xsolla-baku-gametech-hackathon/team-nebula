import { config } from 'dotenv';
import { resolve } from 'node:path';

async function main() {
config({ path: resolve('.env.local'), quiet: true });
config({ path: resolve('.env'), quiet: true });
  const { collectGames } = await import('../lib/infrastructure/collector/collect-games');
const ids = process.argv.slice(2);
if (!ids.length || ids.some(id => !/^\d+$/.test(id))) {
  console.error('Usage: corepack pnpm collector:smoke <Steam AppID> [AppID ...]');
  process.exitCode = 1;
} else {
  try {
    const result = await collectGames({ steamAppIds: ids.map(Number) });
    console.log(JSON.stringify(result, null, 2));
    if (!result.games.length || result.failures.length) process.exitCode = 1;
  } catch {
    console.error('Collection failed: check input and provider configuration.');
    process.exitCode = 1;
  }
}
}

void main().catch(() => { console.error("Smoke command failed"); process.exitCode = 1; });
