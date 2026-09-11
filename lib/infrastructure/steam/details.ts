import 'server-only';
import { load } from 'cheerio';
import { z } from 'zod';
import { parseJson, parseProvider, requestText } from '@/lib/infrastructure/collector/http';
import { ProviderError } from '@/lib/infrastructure/collector/types';

const money = z.number().int().nonnegative().finite();
export const SteamDetailsSchema = z.object({
  steam_appid: z.number().int().positive(),
  type: z.string(),
  name: z.string().min(1),
  short_description: z.string().default(''),
  detailed_description: z.string().default(''),
  is_free: z.boolean().default(false),
  price_overview: z.object({ currency: z.string(), initial: money, final: money }).optional(),
  release_date: z.object({ coming_soon: z.boolean(), date: z.string().default('') }),
  genres: z.array(z.object({ id: z.string(), description: z.string() })).default([]),
  categories: z.array(z.object({ id: z.number(), description: z.string() })).default([]),
  platforms: z.object({ windows: z.boolean().optional(), mac: z.boolean().optional(), linux: z.boolean().optional() }).default({}),
  developers: z.array(z.string()).default([]),
  publishers: z.array(z.string()).default([]),
});
export type SteamDetails = z.infer<typeof SteamDetailsSchema>;

export function plainText(html: string, maxLength = 8000): string {
  const $ = load(html);
  $('script, style, head').remove();
  $('br').replaceWith(' ');
  $('p, div, li, h1, h2, h3').append(' ');
  return $.root().text().replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function steamPrices(game: SteamDetails) {
  if (game.is_free) return { current: 0, regular: 0 };
  if (!game.price_overview || game.price_overview.currency !== 'USD') return { current: null, regular: null };
  return { current: game.price_overview.final / 100, regular: game.price_overview.initial / 100 };
}

export function steamDate(text: string): { date: string | null; precision: 'exact' | 'month' | 'quarter' | 'unknown' } {
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const clean = text.trim();
  let parts: number[] | undefined;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean);
  const mdy = /^([A-Za-z]+) (\d{1,2}),? (\d{4})$/.exec(clean);
  const dmy = /^(\d{1,2}) ([A-Za-z]+),? (\d{4})$/.exec(clean);
  if (iso) parts = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  else if (mdy) parts = [Number(mdy[3]), months.indexOf(mdy[1].slice(0,3).toLowerCase()) + 1, Number(mdy[2])];
  else if (dmy) parts = [Number(dmy[3]), months.indexOf(dmy[2].slice(0,3).toLowerCase()) + 1, Number(dmy[1])];
  if (parts) {
    const [year, month, day] = parts;
    if (year >= 1970 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const d = new Date(Date.UTC(year, month - 1, day));
      if (d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day) return {date:d.toISOString().slice(0,10),precision:'exact'};
    }
    return { date: null, precision: 'unknown' };
  }
  if (/^Q[1-4]\s+\d{4}$/i.test(clean)) return { date:null, precision:'quarter' };
  const month = /^([A-Za-z]+)\s+\d{4}$/.exec(clean);
  if (month && months.includes(month[1].slice(0,3).toLowerCase())) return {date:null,precision:'month'};
  return { date: null, precision: 'unknown' };
}

export async function fetchSteamDetails(appId: number) {
    const raw = parseJson('steam', await requestText('steam', `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`));
    const outer = parseProvider('steam', z.record(z.object({success:z.boolean(),data:z.unknown().optional()})), raw);
    const entry = outer[String(appId)];
    if (!entry?.success) throw new ProviderError('steam','not_found','Steam game is unavailable in the US store');
    const game = parseProvider('steam', SteamDetailsSchema, entry.data);
    if (game.steam_appid !== appId) throw new ProviderError('steam','invalid_data','Steam returned a different AppID');
    if (game.type !== 'game') throw new ProviderError('steam','not_found','Selected Steam app is not a game');
    return { data: game, fetchedAt: new Date().toISOString() };
}
