import type { GameConcept } from '@/lib/types';

export const conceptHorrorCoop: GameConcept = {
  version: 1,

  concept: {
    title: 'Spectral Protocol',
    shortDescription:
      'A 4-player cooperative supernatural investigation game where teams use specialized equipment to identify, track, and document paranormal entities across increasingly hostile haunted locations.',
    rawText: `Spectral Protocol is a cooperative horror experience built around asymmetric tension and team communication.
Up to four investigators enter a procedurally-dressed haunted location — an asylum, a farmhouse, a derelict hotel —
armed with EMF readers, spirit boxes, UV torches, and motion sensors. Your job is to gather evidence, identify the
entity type from a bestiary of twelve supernatural creatures, and extract before your sanity collapses or the ghost
enters hunt mode.

What sets us apart from Phasmophobia is a proximity voice chat system that the ghost actively listens to: say the
wrong thing near a Wraith and it teleports to you. Coordination becomes a puzzle in itself. We're also leaning into
session-based runs of 20-35 minutes with a persistent meta-progression layer — equipment loadouts, unlockable
locations, and an in-world case file system that builds across sessions.

We are a team of four developers with two shipped indie titles between us. Target Early Access: October 2026 on
Steam (PC), with Mac/Linux to follow post-EA. Price point $14.99, matching the genre leader.`,
    platforms: ['PC', 'Mac'],
    targetSteam: true,
  },

  taxonomy: {
    primaryGenre: 'Horror',
    secondaryGenres: ['Survival', 'Investigation'],
    themes: ['Supernatural', 'Psychological', 'Atmospheric', 'Paranormal'],
    mechanics: [
      'proximity voice chat',
      'creature identification',
      'evidence gathering',
      'session-based runs',
      'sanity system',
      'equipment loadouts',
      'procedural location dressing',
      'cooperative objectives',
    ],
    gameModes: ['Online Co-op'],
    perspective: 'First person',
  },

  commercial: {
    priceUsd: 14.99,
    plannedRelease: '2026-10',
    teamSize: 4,
    isFirstTitle: false,
  },

  confidence: {
    primaryGenre: 0.97,
    mechanics: 0.93,
    gameModes: 0.99,
    perspective: 0.98,
    priceUsd: 0.95,
    plannedRelease: 0.88,
    platforms: 0.96,
  },

  missingImportantFields: [],
};
