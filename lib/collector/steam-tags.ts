import 'server-only';
import { load } from 'cheerio';
import { requestText } from './http';
import { ProviderError } from './types';

export function parseSteamTags(html: string, appId: number): string[] {
  const $ = load(html);
  const canonical = $('link[rel="canonical"]').attr('href');
  const canonicalId = canonical?.match(/\/app\/(\d+)/)?.[1];
  if (canonicalId && Number(canonicalId) !== appId) throw new ProviderError('steam','invalid_data','Steam tags page belongs to a different game');
  const tags = new Map<string,string>();
  $('a.app_tag').each((_, element) => {
    const tag = $(element).text().replace(/\s+/g,' ').trim();
    if (tag && tag !== '+' && tag.length <= 100) tags.set(tag.toLowerCase(),tag);
  });
  if (tags.size === 0) throw new ProviderError('steam','missing_field','Steam user tags are unavailable; store access may be restricted');
  return [...tags.values()].slice(0,30);
}

export async function fetchSteamTags(appId: number) {
  const data = parseSteamTags(await requestText('steam', `https://store.steampowered.com/app/${appId}/?l=english`), appId);
  return { data, fetchedAt: new Date().toISOString() };
}
