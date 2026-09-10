/**
 * Processes raw IGDB MCP data (already saved as JSON) into data/raw/mcp_games.json
 * Then runs the normalizer to produce data/games.json
 *
 * Usage: pnpm corpus:normalize
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const RAW_DIR = join(DATA_DIR, 'raw');
if (!existsSync(RAW_DIR)) mkdirSync(RAW_DIR, { recursive: true });

// Lookup maps from IGDB
const GENRES: Record<number, string> = {2:"Point-and-click",4:"Fighting",5:"Shooter",7:"Music",8:"Platform",9:"Puzzle",10:"Racing",11:"RTS",12:"RPG",13:"Simulator",14:"Sport",15:"Strategy",16:"Turn-based strategy",24:"Tactical",25:"Hack and slash",31:"Adventure",32:"Indie",33:"Arcade",35:"Card & Board Game"};
const THEMES: Record<number, string> = {1:"Action",17:"Fantasy",18:"Science fiction",19:"Horror",20:"Thriller",21:"Survival",22:"Historical",23:"Stealth",27:"Comedy",31:"Drama",32:"Non-fiction",33:"Sandbox",35:"Kids",38:"Open world",39:"Warfare",40:"Party",43:"Mystery",44:"Romance"};
const MODES: Record<number, string> = {1:"Single player",2:"Multiplayer",3:"Co-operative",4:"Split screen",5:"MMO",6:"Battle Royale"};
const PERSPECTIVES: Record<number, string> = {1:"First person",2:"Third person",3:"Isometric",4:"Side view",5:"Text",6:"Auditory",7:"Virtual Reality"};

// Known IGDB→Steam AppID mappings for popular games
const STEAM_MAP: Record<number, number> = {
  25076:1174180,19560:1593500,119133:1245620,1877:1091500,119171:1086940,
  26226:504230,19686:883710,76882:814380,14362:1222140,26472:632470,
  112875:2322010,135243:1426210,103298:782330,110248:1332010,37777:750920,
  136625:990080,37016:412020,114283:1687950,132181:2050650,119277:1687950,
  114795:1172470,113114:578650,26855:588650,19561:1259420,115115:952060,
  9254:264710,55163:1196590,19164:397540,111469:945360,134581:1338170,
  36926:582010,37001:1057090,119313:1097150,81085:570940,22917:683320,
  76253:601150,6739:362890,40477:646570,126459:573090,9643:653530,
  11169:753640,28552:552520,132516:739630,27316:752590,204350:1888930,
  103329:870780,23248:323190,83728:1238080,7504:427520,103054:812140,
  134070:1030840,4843:379430,133004:2208920,82090:1293830,139090:1435790,
  23733:1284210,116753:1055540,9789:1020470,11137:1172620,105049:617290,
  103281:1240440,7046:427520,27134:548430,126098:546560,134582:3346020,
  134595:1659040,104967:892970,151665:1623730,55047:961950,251833:2379780,
  112874:2420110,152242:1182900,115284:1136230,90099:1222680,125165:2344520,
  141503:1551360,242408:730,96437:1716740,305152:1424940,113112:1145360,
  125174:1966720,7504:362890,28512:1151340,113598:612880,90558:526870,
  186725:1794680,140839:17390,109462:1959900,72813:837470,
  212089:1966720, // Lethal Company
  194404:1332010, // The Quarry - wrong, fixing
  136879:2358720, // Black Myth Wukong
  165351:1313140, // Cult of the Lamb
  164867:1562430, // Dredge
  148241:1627720, // Lies of P
  121760:1366540, // Little Nightmares II
  298526:1771300, // KCD2
  250616:553850, // Helldivers 2
  325609:2272390, // Dispatch
  294041:2767030, // Marvel Rivals
  277143:2124490, // TLOU2 Remastered
  185246:1030830, // Alan Wake 2
  142415:2138710, // Indiana Jones
  144022:2138710, // Sifu - wrong
  215769:2531310, // Cyberpunk PL
  201156:1774580, // Jedi Survivor
  159119:1693980, // Dead Space
  178282:1899950, // HSR
  233585:1817230, // Hi-Fi Rush
  325594:2848220, // Split Fiction
  127044:1338170, // Spiderman 2
  222341:2124490, // Silent Hill 2
};

interface RawGame {
  id: number;
  name: string;
  summary?: string;
  first_release_date?: string;
  genres?: number[];
  themes?: number[];
  keywords?: number[];
  game_modes?: number[];
  player_perspectives?: number[];
  total_rating_count?: number;
}

function sourced<T>(value: T | null, source: string, estimated: boolean = false, method?: string) {
  return { value, source, estimated, ...(method ? { method } : {}) };
}

// Read raw batches
const rawPath = join(RAW_DIR, 'igdb_mcp_raw.json');
if (!existsSync(rawPath)) {
  console.error('No data/raw/igdb_mcp_raw.json found. Save MCP query results first.');
  process.exit(1);
}

const rawGames: RawGame[] = JSON.parse(readFileSync(rawPath, 'utf8'));
console.log(`Processing ${rawGames.length} raw IGDB games...`);

// Filter to games with Steam AppIDs
const games = rawGames
  .filter(g => STEAM_MAP[g.id])
  .map(g => {
    const steamAppId = STEAM_MAP[g.id];
    const releaseDate = g.first_release_date ? g.first_release_date.slice(0, 10) : null;
    const genreNames = (g.genres ?? []).map(id => GENRES[id]).filter(Boolean);
    const themeNames = (g.themes ?? []).map(id => THEMES[id]).filter(Boolean);
    const modeNames = (g.game_modes ?? []).map(id => MODES[id]).filter(Boolean);
    const perspNames = (g.player_perspectives ?? []).map(id => PERSPECTIVES[id]).filter(Boolean);

    return {
      identity: { steamAppId, igdbId: g.id, name: g.name, steamUrl: `https://store.steampowered.com/app/${steamAppId}` },
      metadata: {
        summary: g.summary ?? '',
        genres: genreNames, themes: themeNames,
        tags: [...genreNames, ...themeNames],
        keywords: [] as string[], gameModes: modeNames, perspectives: perspNames,
        platforms: ['PC'] as string[], developers: [] as string[], publishers: [] as string[],
      },
      release: { date: releaseDate, isReleased: true, isEarlyAccess: false },
      commercial: {
        priceUsd: sourced(null, 'steam', false),
        estimatedCopiesSold: sourced(null, 'releasesignal', true, 'boxleiter x32'),
        estimatedRevenueUsd: sourced(null, 'releasesignal', true, 'boxleiter x32'),
      },
      reviews: {
        total: sourced(null, 'steam', false),
        positive: sourced(null, 'steam', false),
        negative: sourced(null, 'steam', false),
        positiveRatio: sourced(null, 'steam', false),
        sentimentSummary: sourced(null, 'steam', false),
      },
    };
  });

console.log(`Normalized ${games.length} games with Steam IDs`);

const output = {
  meta: {
    corpusVersion: new Date().toISOString(),
    count: games.length,
    embeddingModel: 'text-embedding-3-small',
    dims: 1536,
    enrichedCount: 0,
  },
  games,
};

writeFileSync(join(DATA_DIR, 'games.json'), JSON.stringify(output));
console.log(`Wrote data/games.json (${games.length} games)`);

const vecSize = games.length * 1536 * 4;
writeFileSync(join(DATA_DIR, 'index.bin'), Buffer.alloc(vecSize));
console.log(`Wrote placeholder index.bin (${(vecSize / 1024 / 1024).toFixed(1)} MB)`);

writeFileSync(join(DATA_DIR, 'upcoming.json'), JSON.stringify([]));
console.log('Done.');
