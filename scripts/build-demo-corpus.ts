/**
 * Builds a demo corpus (data/games.json + data/index.bin) with handcrafted
 * NormalizedGame entries. No API calls needed — runs offline.
 *
 * Usage: npx tsx scripts/build-demo-corpus.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { NormalizedGame, Sourced, CorpusMeta, GameMode, Perspective, Platform } from "@/lib/types";

const OUT = process.env.CORPUS_PATH ?? "./data";
const DIMS = 16; // tiny dims since we use tag matching, not real embeddings

function s<T>(value: T, source: "steam" | "igdb" | "gamalytic" | "releasesignal", estimated = false): Sourced<T> {
  return { value, source, estimated };
}

const games: NormalizedGame[] = [
  {
    identity: { steamAppId: 1966720, igdbId: null, name: "Lethal Company", steamUrl: "https://store.steampowered.com/app/1966720" },
    metadata: { summary: "A co-op horror game about scavenging at abandoned moons to sell scrap to the Company.", genres: ["Horror", "Action"], themes: ["Sci-Fi", "Dark"], tags: ["Co-op", "Horror", "Online Co-Op", "Multiplayer", "Indie", "Atmospheric"], keywords: ["scavenging", "co-op", "horror", "monsters", "sci-fi"], gameModes: ["Online Co-op"] as GameMode[], perspectives: ["First person"] as Perspective[], platforms: ["PC"] as Platform[], developers: ["Zeekerss"], publishers: ["Zeekerss"] },
    release: { date: "2023-10-23", isReleased: true, isEarlyAccess: true },
    commercial: { priceUsd: s(9.99, "steam"), estimatedCopiesSold: s(6800000, "gamalytic", true), estimatedRevenueUsd: s(68000000, "gamalytic", true) },
    reviews: { total: s(186420, "steam"), positive: s(178965, "steam"), negative: s(7455, "steam"), positiveRatio: s(0.96, "steam"), sentimentSummary: s("Overwhelmingly Positive", "steam") },
  },
  {
    identity: { steamAppId: 602960, igdbId: null, name: "Barotrauma", steamUrl: "https://store.steampowered.com/app/602960" },
    metadata: { summary: "A 2D co-op submarine simulator set on Jupiter's moon Europa. Manage your crew and survive.", genres: ["Simulation", "RPG"], themes: ["Sci-Fi", "Underwater"], tags: ["Co-op", "Submarine", "Survival", "Horror", "Online Co-Op", "2D"], keywords: ["submarine", "co-op", "survival", "underwater", "europa"], gameModes: ["Online Co-op"] as GameMode[], perspectives: ["Side view"] as Perspective[], platforms: ["PC"] as Platform[], developers: ["FakeFish", "Undertow Games"], publishers: ["Daedalic Entertainment"] },
    release: { date: "2023-03-13", isReleased: true, isEarlyAccess: false },
    commercial: { priceUsd: s(29.99, "steam"), estimatedCopiesSold: s(940000, "gamalytic", true), estimatedRevenueUsd: s(28000000, "gamalytic", true) },
    reviews: { total: s(42870, "steam"), positive: s(37726, "steam"), negative: s(5144, "steam"), positiveRatio: s(0.88, "steam"), sentimentSummary: s("Very Positive", "steam") },
  },
  {
    identity: { steamAppId: 739630, igdbId: null, name: "Phasmophobia", steamUrl: "https://store.steampowered.com/app/739630" },
    metadata: { summary: "4-player online co-op ghost hunting game. Use ghost hunting equipment to find paranormal activity.", genres: ["Horror", "Adventure"], themes: ["Supernatural", "Dark"], tags: ["Horror", "Co-op", "Online Co-Op", "Psychological Horror", "Multiplayer"], keywords: ["ghost", "hunting", "co-op", "paranormal", "investigation"], gameModes: ["Online Co-op"] as GameMode[], perspectives: ["First person"] as Perspective[], platforms: ["PC"] as Platform[], developers: ["Kinetic Games"], publishers: ["Kinetic Games"] },
    release: { date: "2020-09-18", isReleased: true, isEarlyAccess: true },
    commercial: { priceUsd: s(13.99, "steam"), estimatedCopiesSold: s(8000000, "gamalytic", true), estimatedRevenueUsd: s(112000000, "gamalytic", true) },
    reviews: { total: s(298540, "steam"), positive: s(268686, "steam"), negative: s(29854, "steam"), positiveRatio: s(0.90, "steam"), sentimentSummary: s("Very Positive", "steam") },
  },
  {
    identity: { steamAppId: 493520, igdbId: null, name: "GTFO", steamUrl: "https://store.steampowered.com/app/493520" },
    metadata: { summary: "Hardcore 4-player co-op action horror FPS. Work together to explore hostile environments.", genres: ["Action", "Horror"], themes: ["Sci-Fi", "Dark"], tags: ["Horror", "Co-op", "FPS", "Difficult", "Online Co-Op", "Atmospheric"], keywords: ["hardcore", "co-op", "shooter", "horror", "stealth"], gameModes: ["Online Co-op"] as GameMode[], perspectives: ["First person"] as Perspective[], platforms: ["PC"] as Platform[], developers: ["10 Chambers"], publishers: ["10 Chambers"] },
    release: { date: "2021-12-09", isReleased: true, isEarlyAccess: false },
    commercial: { priceUsd: s(39.99, "steam"), estimatedCopiesSold: s(450000, "gamalytic", true), estimatedRevenueUsd: s(18000000, "gamalytic", true) },
    reviews: { total: s(28910, "steam"), positive: s(23707, "steam"), negative: s(5203, "steam"), positiveRatio: s(0.82, "steam"), sentimentSummary: s("Very Positive", "steam") },
  },
  {
    identity: { steamAppId: 1304930, igdbId: null, name: "The Outlast Trials", steamUrl: "https://store.steampowered.com/app/1304930" },
    metadata: { summary: "Cold War era co-op survival horror. Subjects undergo mind-control experiments.", genres: ["Horror", "Action"], themes: ["Dark", "Psychological"], tags: ["Horror", "Co-op", "Survival Horror", "Stealth", "Online Co-Op", "Multiplayer"], keywords: ["outlast", "co-op", "horror", "stealth", "survival"], gameModes: ["Online Co-op", "Singleplayer"] as GameMode[], perspectives: ["First person"] as Perspective[], platforms: ["PC"] as Platform[], developers: ["Red Barrels"], publishers: ["Red Barrels"] },
    release: { date: "2024-03-05", isReleased: true, isEarlyAccess: false },
    commercial: { priceUsd: s(29.99, "steam"), estimatedCopiesSold: s(730000, "gamalytic", true), estimatedRevenueUsd: s(22000000, "gamalytic", true) },
    reviews: { total: s(34220, "steam"), positive: s(27034, "steam"), negative: s(7186, "steam"), positiveRatio: s(0.79, "steam"), sentimentSummary: s("Mostly Positive", "steam") },
  },
  {
    identity: { steamAppId: 307110, igdbId: null, name: "We Need to Go Deeper", steamUrl: "https://store.steampowered.com/app/307110" },
    metadata: { summary: "2-4 player co-op submarine roguelike. Dive into the depths, fight monsters, survive together.", genres: ["Action", "Adventure"], themes: ["Underwater", "Roguelike"], tags: ["Co-op", "Submarine", "Roguelike", "Adventure", "Online Co-Op", "Indie"], keywords: ["submarine", "co-op", "roguelike", "underwater", "monsters"], gameModes: ["Online Co-op", "Local Co-op"] as GameMode[], perspectives: ["Side view"] as Perspective[], platforms: ["PC"] as Platform[], developers: ["Deli Interactive"], publishers: ["Deli Interactive"] },
    release: { date: "2019-11-01", isReleased: true, isEarlyAccess: false },
    commercial: { priceUsd: s(14.99, "steam"), estimatedCopiesSold: s(160000, "gamalytic", true), estimatedRevenueUsd: s(2400000, "gamalytic", true) },
    reviews: { total: s(3870, "steam"), positive: s(3251, "steam"), negative: s(619, "steam"), positiveRatio: s(0.84, "steam"), sentimentSummary: s("Very Positive", "steam") },
  },
  {
    identity: { steamAppId: 945360, igdbId: null, name: "Among Us", steamUrl: "https://store.steampowered.com/app/945360" },
    metadata: { summary: "An online multiplayer social deduction game. Find the impostor among your crewmates.", genres: ["Casual", "Strategy"], themes: ["Sci-Fi", "Social"], tags: ["Multiplayer", "Social Deduction", "Online Co-Op", "Space", "Funny"], keywords: ["social deduction", "impostor", "multiplayer", "space", "crewmates"], gameModes: ["Online Co-op", "Online PvP"] as GameMode[], perspectives: ["Top down"] as Perspective[], platforms: ["PC"] as Platform[], developers: ["Innersloth"], publishers: ["Innersloth"] },
    release: { date: "2018-11-16", isReleased: true, isEarlyAccess: false },
    commercial: { priceUsd: s(4.99, "steam"), estimatedCopiesSold: s(12000000, "gamalytic", true), estimatedRevenueUsd: s(60000000, "gamalytic", true) },
    reviews: { total: s(612000, "steam"), positive: s(556920, "steam"), negative: s(55080, "steam"), positiveRatio: s(0.91, "steam"), sentimentSummary: s("Very Positive", "steam") },
  },
  {
    identity: { steamAppId: 552500, igdbId: null, name: "Deep Rock Galactic", steamUrl: "https://store.steampowered.com/app/548430" },
    metadata: { summary: "1-4 player co-op FPS featuring badass space dwarves, 100% destructible environments, and procedural caves.", genres: ["Action", "FPS"], themes: ["Sci-Fi", "Mining"], tags: ["Co-op", "FPS", "Online Co-Op", "Procedural Generation", "Multiplayer", "Indie"], keywords: ["dwarves", "mining", "co-op", "shooter", "caves", "procedural"], gameModes: ["Online Co-op", "Singleplayer"] as GameMode[], perspectives: ["First person"] as Perspective[], platforms: ["PC"] as Platform[], developers: ["Ghost Ship Games"], publishers: ["Coffee Stain Publishing"] },
    release: { date: "2020-05-13", isReleased: true, isEarlyAccess: false },
    commercial: { priceUsd: s(29.99, "steam"), estimatedCopiesSold: s(5600000, "gamalytic", true), estimatedRevenueUsd: s(168000000, "gamalytic", true) },
    reviews: { total: s(224000, "steam"), positive: s(218400, "steam"), negative: s(5600, "steam"), positiveRatio: s(0.975, "steam"), sentimentSummary: s("Overwhelmingly Positive", "steam") },
  },
  {
    identity: { steamAppId: 700580, igdbId: null, name: "Subnautica: Below Zero", steamUrl: "https://store.steampowered.com/app/848450" },
    metadata: { summary: "Dive into a freezing underwater adventure on an alien planet. Craft, build, and survive.", genres: ["Adventure", "Survival"], themes: ["Underwater", "Sci-Fi", "Open World"], tags: ["Survival", "Open World", "Underwater", "Crafting", "Exploration", "Sci-Fi"], keywords: ["underwater", "survival", "crafting", "alien", "exploration"], gameModes: ["Singleplayer"] as GameMode[], perspectives: ["First person"] as Perspective[], platforms: ["PC"] as Platform[], developers: ["Unknown Worlds Entertainment"], publishers: ["Unknown Worlds Entertainment"] },
    release: { date: "2021-05-14", isReleased: true, isEarlyAccess: false },
    commercial: { priceUsd: s(29.99, "steam"), estimatedCopiesSold: s(2100000, "gamalytic", true), estimatedRevenueUsd: s(63000000, "gamalytic", true) },
    reviews: { total: s(28400, "steam"), positive: s(23604, "steam"), negative: s(4796, "steam"), positiveRatio: s(0.83, "steam"), sentimentSummary: s("Very Positive", "steam") },
  },
  {
    identity: { steamAppId: 264710, igdbId: null, name: "Subnautica", steamUrl: "https://store.steampowered.com/app/264710" },
    metadata: { summary: "Descend into the depths of an alien underwater world filled with wonder and peril.", genres: ["Adventure", "Survival"], themes: ["Underwater", "Sci-Fi", "Open World"], tags: ["Survival", "Open World", "Underwater", "Crafting", "Exploration", "Horror"], keywords: ["underwater", "survival", "crafting", "alien", "ocean", "leviathan"], gameModes: ["Singleplayer"] as GameMode[], perspectives: ["First person"] as Perspective[], platforms: ["PC"] as Platform[], developers: ["Unknown Worlds Entertainment"], publishers: ["Unknown Worlds Entertainment"] },
    release: { date: "2018-01-23", isReleased: true, isEarlyAccess: false },
    commercial: { priceUsd: s(29.99, "steam"), estimatedCopiesSold: s(8500000, "gamalytic", true), estimatedRevenueUsd: s(255000000, "gamalytic", true) },
    reviews: { total: s(234000, "steam"), positive: s(222300, "steam"), negative: s(11700, "steam"), positiveRatio: s(0.95, "steam"), sentimentSummary: s("Overwhelmingly Positive", "steam") },
  },
  {
    identity: { steamAppId: 1313140, igdbId: null, name: "Content Warning", steamUrl: "https://store.steampowered.com/app/2881650" },
    metadata: { summary: "Film scary monsters with friends in the old world to go viral on SpookTube.", genres: ["Horror", "Action"], themes: ["Comedy", "Dark"], tags: ["Co-op", "Horror", "Funny", "Online Co-Op", "Multiplayer", "Indie"], keywords: ["filming", "co-op", "horror", "comedy", "viral", "monsters"], gameModes: ["Online Co-op"] as GameMode[], perspectives: ["First person"] as Perspective[], platforms: ["PC"] as Platform[], developers: ["Landfall"], publishers: ["Landfall"] },
    release: { date: "2024-04-01", isReleased: true, isEarlyAccess: false },
    commercial: { priceUsd: s(7.99, "steam"), estimatedCopiesSold: s(3200000, "gamalytic", true), estimatedRevenueUsd: s(25600000, "gamalytic", true) },
    reviews: { total: s(48900, "steam"), positive: s(44988, "steam"), negative: s(3912, "steam"), positiveRatio: s(0.92, "steam"), sentimentSummary: s("Very Positive", "steam") },
  },
  {
    identity: { steamAppId: 1229490, igdbId: null, name: "Devour", steamUrl: "https://store.steampowered.com/app/1274570" },
    metadata: { summary: "1-4 player co-op horror survival game. Stop possessed cultists before they drag you to hell.", genres: ["Horror", "Action"], themes: ["Supernatural", "Dark"], tags: ["Horror", "Co-op", "Online Co-Op", "Survival", "Multiplayer", "Indie"], keywords: ["cultist", "co-op", "horror", "demons", "ritual"], gameModes: ["Online Co-op", "Singleplayer"] as GameMode[], perspectives: ["First person"] as Perspective[], platforms: ["PC"] as Platform[], developers: ["Straight Back Games"], publishers: ["Straight Back Games"] },
    release: { date: "2021-01-28", isReleased: true, isEarlyAccess: false },
    commercial: { priceUsd: s(4.99, "steam"), estimatedCopiesSold: s(1800000, "gamalytic", true), estimatedRevenueUsd: s(9000000, "gamalytic", true) },
    reviews: { total: s(32400, "steam"), positive: s(29484, "steam"), negative: s(2916, "steam"), positiveRatio: s(0.91, "steam"), sentimentSummary: s("Very Positive", "steam") },
  },
];

const meta: CorpusMeta = {
  corpusVersion: "demo-1.0",
  count: games.length,
  embeddingModel: "none-tag-only",
  dims: DIMS,
  enrichedCount: games.length,
};

// Write games.json
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "games.json"), JSON.stringify({ meta, games }, null, 2));
console.log(`✓ Wrote ${games.length} games to ${join(OUT, "games.json")}`);

// Write zero-filled index.bin (tag matching doesn't need real embeddings)
const buf = new Float32Array(games.length * DIMS);
writeFileSync(join(OUT, "index.bin"), Buffer.from(buf.buffer));
console.log(`✓ Wrote ${join(OUT, "index.bin")} (${buf.byteLength} bytes, ${DIMS} dims × ${games.length} games)`);
