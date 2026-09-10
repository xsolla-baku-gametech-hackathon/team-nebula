import { expect, it, vi } from 'vitest';
import { fetchSteamDetails } from '@/lib/collector/steam-details';
import { requestText } from '@/lib/collector/http';

vi.mock('@/lib/collector/http', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/collector/http')>(),
  requestText: vi.fn(),
}));

it('fetches the same game again and returns the new price without retaining data', async () => {
  const reply = (price: number) => JSON.stringify({739630:{success:true,data:{
    steam_appid:739630,type:'game',name:'Phasmophobia',
    release_date:{coming_soon:false,date:'Sep 18, 2020'},
    price_overview:{currency:'USD',initial:1999,final:price},
  }}});
  vi.mocked(requestText).mockResolvedValueOnce(reply(1399)).mockResolvedValueOnce(reply(1999));
  const first = await fetchSteamDetails(739630);
  const second = await fetchSteamDetails(739630);
  expect(first.data.price_overview?.final).toBe(1399);
  expect(second.data.price_overview?.final).toBe(1999);
  expect(requestText).toHaveBeenCalledTimes(2);
});
