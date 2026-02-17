/**
 * Live Data Configuration
 * Contains all live/real-time scoring competition types
 * Separated from competencias to keep concerns distinct
 */

import { CompetenciaTipo } from '@/data/competencias/types';
import {
  liveScoringColumns,
  stablefordColumns,
  resultadosColumns,
  scoreLiveColumns,
  scoreLiveGoroColumns,
} from '@/data/competencias/columns';

// ============= Live Competition Types =============

/** All live scoring competition entries */
export const liveConfig: CompetenciaTipo[] = [
  // ---------- Live Scoring Golfista de Oro ----------
  {
    id: 'livescoring-golfista-oro',
    name: 'Live Scoring Golfista de Oro',
    shortName: 'Live GO',
    description: 'Resultados en vivo - Golfista de Oro',
    icon: 'award',
    columns: liveScoringColumns,
    order: 1,
    enabled: true,
    groups: [
      { id: 'live-go-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 50, players: [], lastUpdated: '2025-10-02 22:30' },
    ],
  },

  // ---------- Resultados en Vivo (autoload) ----------
  {
    id: 'resultados-autoload',
    name: 'Resultados en Vivo',
    shortName: 'Res. Vivo',
    description: 'Resultados con actualización automática',
    icon: 'zap',
    columns: resultadosColumns,
    order: 2,
    enabled: true,
    groups: [
      { id: 'autoload-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 50, players: [], lastUpdated: '2025-10-03 16:00' },
    ],
  },

  // ---------- Live Scoring Neto ----------
  {
    id: 'livescoring-neto',
    name: 'Live Scoring Neto',
    shortName: 'Live Neto',
    description: 'Resultados en vivo - Puntaje Neto',
    icon: 'zap',
    columns: liveScoringColumns,
    order: 3,
    enabled: true,
    groups: [
      { id: 'live-neto-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 50, players: [], lastUpdated: '2025-10-02 20:30' },
    ],
  },

  // ---------- Live Scoring Stroke Play ----------
  {
    id: 'livescoring-stroke',
    name: 'Live Scoring Stroke Play',
    shortName: 'Live Stroke',
    description: 'Resultados en vivo - Sistema Stroke Play',
    icon: 'zap',
    columns: liveScoringColumns,
    order: 4,
    enabled: true,
    groups: [
      {
        id: 'live-stroke-campeonato',
        name: 'Campeonato',
        shortName: 'Camp',
        maxPlayers: 50,
        players: [
          { id: 'ls1', position: 1, name: 'Juan García López', club: 'Herradura', score: -3 },
          { id: 'ls2', position: 2, name: 'Pedro Martínez', club: 'SCGA', score: -1 },
          { id: 'ls3', position: 3, name: 'Carlos Rodríguez', club: 'Tigres', score: 2 },
        ],
        lastUpdated: '2025-10-02 19:30',
      },
      { id: 'live-stroke-aa', name: 'AA', shortName: 'AA', maxPlayers: 50, players: [], lastUpdated: '2025-10-02 19:30' },
    ],
  },

  // ---------- Live Scoring Stableford ----------
  {
    id: 'livescoring-stableford',
    name: 'Live Scoring Stableford',
    shortName: 'Live Stable',
    description: 'Resultados en vivo - Sistema Stableford',
    icon: 'zap',
    columns: stablefordColumns,
    order: 5,
    enabled: true,
    groups: [
      {
        id: 'live-stableford-campeonato',
        name: 'Campeonato',
        shortName: 'Camp',
        maxPlayers: 50,
        players: [
          { id: 'lstb1', position: 1, name: 'Miguel Hernández', club: 'CCT', score: 38 },
          { id: 'lstb2', position: 2, name: 'Roberto Sánchez', club: 'WAGR', score: 36 },
        ],
        lastUpdated: '2025-10-02 20:00',
      },
    ],
  },

  // ---------- Live Scoring Gross ----------
  {
    id: 'livescoring-gross',
    name: 'Live Scoring Gross',
    shortName: 'Live Gross',
    description: 'Resultados en vivo - Puntaje Gross',
    icon: 'zap',
    columns: liveScoringColumns,
    order: 6,
    enabled: true,
    groups: [
      { id: 'live-gross-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 50, players: [], lastUpdated: '2025-10-02 21:00' },
    ],
  },

  // ---------- Score en Vivo (XML) ----------
  {
    id: 'score-live',
    name: 'Score en Vivo',
    shortName: 'Score Live',
    description: 'Puntuación en tiempo real (XML feed)',
    icon: 'zap',
    columns: scoreLiveColumns,
    order: 7,
    enabled: true,
    groups: [
      { id: 'score-live-ejemplo', name: 'Jugador Activo', shortName: 'Activo', maxPlayers: 1, players: [], lastUpdated: '2025-10-03 19:30' },
    ],
  },

  // ---------- Score en Vivo Golfista de Oro ----------
  {
    id: 'score-live-goro',
    name: 'Score en Vivo Golfista de Oro',
    shortName: 'Live GORO',
    description: 'Puntuación en tiempo real para Golfista de Oro',
    icon: 'zap',
    columns: scoreLiveGoroColumns,
    order: 8,
    enabled: true,
    groups: [
      { id: 'score-live-goro-ejemplo', name: 'Jugador Activo', shortName: 'Activo', maxPlayers: 1, players: [], lastUpdated: '2025-10-03 21:30' },
    ],
  },

  // ---------- Score en Vivo Stableford ----------
  {
    id: 'score-live-stableford',
    name: 'Score en Vivo Stableford',
    shortName: 'Live Stb',
    description: 'Puntuación Stableford en tiempo real',
    icon: 'zap',
    columns: scoreLiveColumns,
    order: 9,
    enabled: true,
    groups: [
      { id: 'score-live-stb-ejemplo', name: 'Jugador Stableford', shortName: 'Stb', maxPlayers: 1, players: [], lastUpdated: '2025-10-03 22:00' },
    ],
  },
];
