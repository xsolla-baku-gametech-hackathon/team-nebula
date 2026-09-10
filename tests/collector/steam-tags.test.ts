import { expect, it } from 'vitest';
import { parseSteamTags } from '@/lib/collector/steam-tags';

it('extracts Steam user tags without replacing them with genres', () => {
  expect(parseSteamTags('<a class="app_tag">Horror</a><a class="app_tag">Online Co-Op</a><a class="app_tag">Horror</a><a class="app_tag">+</a><div class="genre">Indie</div>',739630)).toEqual(['Horror','Online Co-Op']);
});
it('reports restricted pages and wrong identities', () => {
  expect(() => parseSteamTags('<h1>Age check</h1>',739630)).toThrow('unavailable');
  expect(() => parseSteamTags('<link rel="canonical" href="https://store.steampowered.com/app/570/"><a class="app_tag">Action</a>',739630)).toThrow('different game');
});
