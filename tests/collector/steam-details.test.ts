import { describe, expect, it } from 'vitest';
import { SteamDetailsSchema, plainText, steamDate, steamPrices } from '@/lib/infrastructure/steam/details';

export const detailsFixture = (extra: Record<string, unknown> = {}) => SteamDetailsSchema.parse({
  steam_appid:739630, type:'game', name:'Phasmophobia', short_description:'Co-op horror',
  release_date:{coming_soon:false,date:'Sep 18, 2020'},
  price_overview:{currency:'USD',initial:1999,final:1399}, ...extra,
});
describe('Steam facts', () => {
  it('keeps sale and regular prices distinct in dollars', () => {
    expect(steamPrices(detailsFixture())).toEqual({current:13.99,regular:19.99});
    expect(steamPrices(detailsFixture({is_free:true,price_overview:undefined}))).toEqual({current:0,regular:0});
    expect(steamPrices(detailsFixture({price_overview:undefined}))).toEqual({current:null,regular:null});
    expect(steamPrices(detailsFixture({price_overview:{currency:'EUR',initial:1999,final:999}}))).toEqual({current:null,regular:null});
  });
  it.each(['Sep 18, 2020','18 Sep, 2020','2020-09-18'])('parses exact date %s', input => {
    expect(steamDate(input)).toEqual({date:'2020-09-18',precision:'exact'});
  });
  it('retains uncertainty and rejects impossible dates', () => {
    expect(steamDate('October 2026')).toEqual({date:null,precision:'month'});
    expect(steamDate('Q4 2026')).toEqual({date:null,precision:'quarter'});
    expect(steamDate('Coming soon').date).toBeNull();
    expect(steamDate('Feb 31, 2026').date).toBeNull();
  });
  it('decodes entities and excludes script/style contents', () => {
    expect(plainText('<script>bad()</script><p>A &amp; B</p><p>Investigate<br>together</p>')).toBe('A & B Investigate together');
  });
});
