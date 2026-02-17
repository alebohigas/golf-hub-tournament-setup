/**
 * Competencias Mock Data
 * Central registry of all competition types with their groups and sample players
 * This will eventually be replaced by API calls to the production server
 */

import { CompetenciaTipo } from './types';
import {
  standardColumns,
  distanceColumns,
  precisionColumns,
  bracketColumns,
  playerListColumns,
  parejasColumns,
  liveScoringColumns,
  stablefordColumns,
  oyesColumns,
  puttColumns,
  resultadosColumns,
  parejasResultColumns,
  salidasColumns,
  salidasParejasColumns,
  tarjetaHcpColumns,
  tarjetaStablefordColumns,
  tarjetaScratchColumns,
  scoreLiveColumns,
  scoreLiveGoroColumns,
  skinGameColumns,
  skinGameNetoColumns,
} from './columns';

// ============= Competition Registry =============

/**
 * Master list of all competition types
 * Each entry defines: metadata, column layout, and mock groups/players
 */
export const competenciasConfig: CompetenciaTipo[] = [
  // ---------- Eliminación Directa 16 ----------
  {
    id: 'elimin-directa-16',
    name: 'Eliminación Directa 16',
    shortName: 'Elim. 16',
    description: 'Bracket de eliminación directa con 16 jugadores',
    icon: 'trophy',
    columns: bracketColumns,
    order: 5,
    enabled: true,
    groups: [
      { id: 'elim16-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 16, players: [], lastUpdated: '2025-10-02 16:30' },
      { id: 'elim16-seniors', name: 'Seniors', shortName: 'Seniors', maxPlayers: 16, players: [], lastUpdated: '2025-10-02 16:30' },
    ],
  },

  // ---------- Eliminación Directa Semifinal ----------
  {
    id: 'elimin-directa-16-sf',
    name: 'Eliminación Directa Semifinal',
    shortName: 'Elim. SF',
    description: 'Bracket de eliminación con semifinales',
    icon: 'trophy',
    columns: bracketColumns,
    order: 6,
    enabled: true,
    groups: [
      { id: 'elimsf-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 8, players: [], lastUpdated: '2025-10-02 17:00' },
    ],
  },

  // ---------- Eliminación Play-off Extra ----------
  {
    id: 'elimin-directa-pe',
    name: 'Eliminación Play-off Extra',
    shortName: 'Elim. PE',
    description: 'Bracket de eliminación con play-off extra',
    icon: 'award',
    columns: bracketColumns,
    order: 7,
    enabled: true,
    groups: [
      { id: 'elimpe-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 16, players: [], lastUpdated: '2025-10-02 17:30' },
    ],
  },

  // ---------- Jugadores Field ----------
  {
    id: 'jugadores-field',
    name: 'Jugadores Field',
    shortName: 'Field',
    description: 'Lista de jugadores inscritos por categoría',
    icon: 'flag',
    columns: playerListColumns,
    order: 8,
    enabled: true,
    groups: [
      {
        id: 'field-campeonato',
        name: 'Campeonato',
        shortName: 'Camp',
        maxPlayers: 50,
        players: [
          { id: 'jf1', position: 1, name: 'Juan García López', club: 'Herradura', score: 12.5 },
          { id: 'jf2', position: 2, name: 'Pedro Martínez', club: 'SCGA', score: 8.2 },
          { id: 'jf3', position: 3, name: 'Carlos Rodríguez', club: 'Tigres', score: 15.1 },
        ],
        lastUpdated: '2025-10-02 18:00',
      },
      { id: 'field-aa', name: 'AA', shortName: 'AA', maxPlayers: 50, players: [], lastUpdated: '2025-10-02 18:00' },
    ],
  },

  // ---------- Jugadores Parejas ----------
  {
    id: 'jugadores-parejas',
    name: 'Jugadores Parejas',
    shortName: 'Parejas',
    description: 'Lista de parejas inscritas',
    icon: 'star',
    columns: parejasColumns,
    order: 9,
    enabled: true,
    groups: [
      {
        id: 'parejas-campeonato',
        name: 'Campeonato',
        shortName: 'Camp',
        maxPlayers: 25,
        players: [
          { id: 'jp1', position: 1, name: 'García / Martínez', club: 'Herradura', score: 10.3 },
          { id: 'jp2', position: 2, name: 'Rodríguez / López', club: 'SCGA', score: 11.8 },
        ],
        lastUpdated: '2025-10-02 18:30',
      },
    ],
  },

  // ---------- Jugadores Skin ----------
  {
    id: 'jugadores-skin',
    name: 'Skin Game',
    shortName: 'Skin',
    description: 'Jugadores inscritos en Skin Game',
    icon: 'zap',
    columns: playerListColumns,
    order: 10,
    enabled: true,
    groups: [
      {
        id: 'skin-grupo1',
        name: 'Grupo 1',
        shortName: 'G1',
        maxPlayers: 20,
        players: [
          { id: 'js1', position: 1, name: 'Miguel Hernández', club: 'CCT', score: 14.2 },
          { id: 'js2', position: 2, name: 'Roberto Sánchez', club: 'WAGR', score: 9.5 },
        ],
        lastUpdated: '2025-10-02 19:00',
      },
      { id: 'skin-grupo2', name: 'Grupo 2', shortName: 'G2', maxPlayers: 20, players: [], lastUpdated: '2025-10-02 19:00' },
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
    order: 11,
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
    order: 12,
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

  // ---------- Live Scoring Neto ----------
  {
    id: 'livescoring-neto',
    name: 'Live Scoring Neto',
    shortName: 'Live Neto',
    description: 'Resultados en vivo - Puntaje Neto',
    icon: 'zap',
    columns: liveScoringColumns,
    order: 13,
    enabled: true,
    groups: [
      { id: 'live-neto-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 50, players: [], lastUpdated: '2025-10-02 20:30' },
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
    order: 14,
    enabled: true,
    groups: [
      { id: 'live-gross-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 50, players: [], lastUpdated: '2025-10-02 21:00' },
    ],
  },

  // ---------- O'YES ----------
  {
    id: 'oyes',
    name: "O'YES",
    shortName: "O'YES",
    description: 'Competencia Closest to the Pin',
    icon: 'target',
    columns: oyesColumns,
    order: 15,
    enabled: true,
    groups: [
      {
        id: 'oyes-grupo1',
        name: 'Grupo 1',
        shortName: 'G1',
        hoyo: 3,
        maxPlayers: 10,
        players: [
          { id: 'oy1', position: 1, name: 'Juan García López', club: 'Herradura', distance: 0.45 },
          { id: 'oy2', position: 2, name: 'Pedro Martínez', club: 'SCGA', distance: 1.20 },
          { id: 'oy3', position: 3, name: 'Carlos Rodríguez', club: 'Tigres', distance: 2.15 },
        ],
        lastUpdated: '2025-10-02 21:30',
      },
      { id: 'oyes-grupo2', name: 'Grupo 2', shortName: 'G2', hoyo: 7, maxPlayers: 10, players: [], lastUpdated: '2025-10-02 21:30' },
      { id: 'oyes-grupo3', name: 'Grupo 3', shortName: 'G3', hoyo: 12, maxPlayers: 10, players: [], lastUpdated: '2025-10-02 21:30' },
    ],
  },

  // ---------- O'YES por Hoyo ----------
  {
    id: 'oyes-por-hoyo',
    name: "O'YES por Hoyo",
    shortName: "O'YES Hoyo",
    description: 'Closest to the Pin por hoyo específico',
    icon: 'target',
    columns: oyesColumns,
    order: 16,
    enabled: true,
    groups: [
      { id: 'oyesh-hoyo3', name: 'Hoyo 3', shortName: 'H3', hoyo: 3, maxPlayers: 5, players: [], lastUpdated: '2025-10-02 22:00' },
      { id: 'oyesh-hoyo7', name: 'Hoyo 7', shortName: 'H7', hoyo: 7, maxPlayers: 5, players: [], lastUpdated: '2025-10-02 22:00' },
      { id: 'oyesh-hoyo12', name: 'Hoyo 12', shortName: 'H12', hoyo: 12, maxPlayers: 5, players: [], lastUpdated: '2025-10-02 22:00' },
    ],
  },

  // ---------- Live Scoring Golfista de Oro ----------
  {
    id: 'livescoring-golfista-oro',
    name: 'Live Scoring Golfista de Oro',
    shortName: 'Live GO',
    description: 'Resultados en vivo - Golfista de Oro',
    icon: 'award',
    columns: liveScoringColumns,
    order: 17,
    enabled: true,
    groups: [
      { id: 'live-go-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 50, players: [], lastUpdated: '2025-10-02 22:30' },
    ],
  },


  // ---------- Resultados Stroke Play ----------
  {
    id: 'resultados-stroke',
    name: 'Resultados Stroke Play',
    shortName: 'Res. Stroke',
    description: 'Resultados finales Stroke Play',
    icon: 'trophy',
    columns: resultadosColumns,
    order: 19,
    enabled: true,
    groups: [
      {
        id: 'res-stroke-campeonato',
        name: 'Campeonato',
        shortName: 'Camp',
        maxPlayers: 50,
        players: [
          { id: 'rs1', position: 1, name: 'Juan García López', club: 'Herradura', score: 210 },
          { id: 'rs2', position: 2, name: 'Pedro Martínez', club: 'SCGA', score: 215 },
          { id: 'rs3', position: 3, name: 'Carlos Rodríguez', club: 'Tigres', score: 218 },
        ],
        lastUpdated: '2025-10-02 23:30',
      },
      { id: 'res-stroke-aa', name: 'AA', shortName: 'AA', maxPlayers: 50, players: [], lastUpdated: '2025-10-02 23:30' },
    ],
  },

  // ---------- Resultados Match Play ----------
  {
    id: 'resultados-match',
    name: 'Resultados Match Play',
    shortName: 'Res. Match',
    description: 'Resultados finales Match Play (Eliminación Directa)',
    icon: 'trophy',
    columns: bracketColumns,
    order: 20,
    enabled: true,
    groups: [
      { id: 'res-match-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 32, players: [], lastUpdated: '2025-10-03 00:00' },
    ],
  },

  // ---------- Resultados Gross ----------
  {
    id: 'resultados-gross',
    name: 'Resultados Gross',
    shortName: 'Res. Gross',
    description: 'Resultados finales categoría Gross',
    icon: 'medal',
    columns: resultadosColumns,
    order: 21,
    enabled: true,
    groups: [
      { id: 'res-gross-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 50, players: [], lastUpdated: '2025-10-03 00:30' },
    ],
  },

  // ---------- Resultados Parciales ----------
  {
    id: 'resultados-parciales',
    name: 'Resultados Parciales',
    shortName: 'Res. Parciales',
    description: 'Resultados parciales durante el torneo',
    icon: 'zap',
    columns: resultadosColumns,
    order: 22,
    enabled: true,
    groups: [
      {
        id: 'res-parcial-campeonato',
        name: 'Campeonato',
        shortName: 'Camp',
        maxPlayers: 50,
        players: [
          { id: 'rp1', position: 1, name: 'Juan García López', club: 'Herradura', score: 140 },
          { id: 'rp2', position: 2, name: 'Pedro Martínez', club: 'SCGA', score: 142 },
          { id: 'rp3', position: 3, name: 'Carlos Rodríguez', club: 'Tigres', score: 145 },
        ],
        lastUpdated: '2025-10-03 12:30',
      },
      { id: 'res-parcial-aa', name: 'AA', shortName: 'AA', maxPlayers: 50, players: [], lastUpdated: '2025-10-03 12:30' },
    ],
  },

  // ---------- Resultados Parejas ----------
  {
    id: 'resultados-parejas',
    name: 'Resultados Parejas',
    shortName: 'Res. Parejas',
    description: 'Resultados de competencia por parejas',
    icon: 'star',
    columns: parejasResultColumns,
    order: 23,
    enabled: true,
    groups: [
      {
        id: 'parejas-mixto',
        name: 'Mixto',
        shortName: 'Mixto',
        maxPlayers: 30,
        players: [
          { id: 'par1', position: 1, name: 'García / Martínez', club: 'Herradura', score: 125 },
          { id: 'par2', position: 2, name: 'López / Rodríguez', club: 'SCGA', score: 128 },
        ],
        lastUpdated: '2025-10-03 13:00',
      },
      { id: 'parejas-varonil', name: 'Varonil', shortName: 'Varonil', maxPlayers: 30, players: [], lastUpdated: '2025-10-03 13:00' },
    ],
  },

  // ---------- Resultados Neto ----------
  {
    id: 'resultados-neto',
    name: 'Resultados Neto',
    shortName: 'Res. Neto',
    description: 'Resultados finales categoría Neto',
    icon: 'medal',
    columns: resultadosColumns,
    order: 24,
    enabled: true,
    groups: [
      {
        id: 'res-neto-campeonato',
        name: 'Campeonato',
        shortName: 'Camp',
        maxPlayers: 50,
        players: [
          { id: 'rn1', position: 1, name: 'Roberto Sánchez', club: 'Herradura', score: 205 },
          { id: 'rn2', position: 2, name: 'Miguel Ángel Torres', club: 'SCGA', score: 208 },
          { id: 'rn3', position: 3, name: 'Luis Fernando Pérez', club: 'Tigres', score: 211 },
        ],
        lastUpdated: '2025-10-03 14:00',
      },
      { id: 'res-neto-aa', name: 'AA', shortName: 'AA', maxPlayers: 50, players: [], lastUpdated: '2025-10-03 14:00' },
      { id: 'res-neto-a', name: 'A', shortName: 'A', maxPlayers: 50, players: [], lastUpdated: '2025-10-03 14:00' },
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
    order: 27,
    enabled: true,
    groups: [
      { id: 'autoload-campeonato', name: 'Campeonato', shortName: 'Camp', maxPlayers: 50, players: [], lastUpdated: '2025-10-03 16:00' },
    ],
  },

  // ---------- Salidas ----------
  {
    id: 'salidas',
    name: 'Salidas',
    shortName: 'Salidas',
    description: 'Horarios de salida por día y categoría',
    icon: 'flag',
    columns: salidasColumns,
    order: 28,
    enabled: true,
    groups: [
      { id: 'salidas-dia1', name: 'Día 1 - Viernes', shortName: 'Día 1', maxPlayers: 100, players: [], lastUpdated: '2025-10-03 17:00' },
      { id: 'salidas-dia2', name: 'Día 2 - Sábado', shortName: 'Día 2', maxPlayers: 100, players: [], lastUpdated: '2025-10-03 17:00' },
      { id: 'salidas-dia3', name: 'Día 3 - Domingo', shortName: 'Día 3', maxPlayers: 100, players: [], lastUpdated: '2025-10-03 17:00' },
    ],
  },

  // ---------- Salidas Parejas ----------
  {
    id: 'salidas-parejas',
    name: 'Salidas Parejas',
    shortName: 'Sal. Parejas',
    description: 'Horarios de salida para competencia de parejas',
    icon: 'flag',
    columns: salidasParejasColumns,
    order: 29,
    enabled: true,
    groups: [
      { id: 'salidas-parejas-dia1', name: 'Día 1 - Viernes', shortName: 'Día 1', maxPlayers: 50, players: [], lastUpdated: '2025-10-03 17:30' },
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
    order: 33,
    enabled: true,
    groups: [
      { id: 'score-live-ejemplo', name: 'Jugador Activo', shortName: 'Activo', maxPlayers: 1, players: [], lastUpdated: '2025-10-03 19:30' },
    ],
  },

  // ---------- Skin Game ----------
  {
    id: 'skin-game',
    name: 'Skin Game',
    shortName: 'Skin',
    description: 'Competencia Skin Game por categoría',
    icon: 'award',
    columns: skinGameColumns,
    order: 34,
    enabled: true,
    groups: [
      {
        id: 'skin-grupo1',
        name: 'Grupo 1',
        shortName: 'G1',
        maxPlayers: 20,
        players: [
          { id: 'sk1', position: 1, name: 'Juan García López', club: 'Herradura', score: 3 },
          { id: 'sk2', position: 2, name: 'Pedro Martínez', club: 'SCGA', score: 3 },
        ],
        lastUpdated: '2025-10-03 20:00',
      },
      { id: 'skin-grupo2', name: 'Grupo 2', shortName: 'G2', maxPlayers: 20, players: [], lastUpdated: '2025-10-03 20:00' },
    ],
  },

  // ---------- Skin Game Gross ----------
  {
    id: 'skin-game-gross',
    name: 'Skin Game Gross',
    shortName: 'Skin Gross',
    description: 'Skin Game con puntaje Gross por hoyo',
    icon: 'award',
    columns: skinGameColumns,
    order: 35,
    enabled: true,
    groups: [
      { id: 'skin-gross-grupo1', name: 'Grupo 1 - Gross', shortName: 'G1 Gross', maxPlayers: 20, players: [], lastUpdated: '2025-10-03 20:30' },
    ],
  },

  // ---------- Skin Game Neto ----------
  {
    id: 'skin-game-neto',
    name: 'Skin Game Neto',
    shortName: 'Skin Neto',
    description: 'Skin Game con puntaje Neto por hoyo',
    icon: 'award',
    columns: skinGameNetoColumns,
    order: 36,
    enabled: true,
    groups: [
      { id: 'skin-neto-grupo1', name: 'Grupo 1 - Neto', shortName: 'G1 Neto', maxPlayers: 20, players: [], lastUpdated: '2025-10-03 20:30' },
    ],
  },

  // ---------- Golfista de Oro ----------
  {
    id: 'golfista-oro',
    name: 'Golfista de Oro',
    shortName: 'Golf. Oro',
    description: 'Competencia especial Golfista de Oro',
    icon: 'star',
    columns: resultadosColumns,
    order: 37,
    enabled: true,
    groups: [
      {
        id: 'goro-campeonato',
        name: 'Campeonato',
        shortName: 'Camp',
        maxPlayers: 50,
        players: [
          { id: 'go1', position: 1, name: 'Roberto Sánchez', club: 'Herradura', score: 72 },
          { id: 'go2', position: 2, name: 'Miguel Torres', club: 'SCGA', score: 74 },
          { id: 'go3', position: 3, name: 'Luis Pérez', club: 'Tigres', score: 75 },
        ],
        lastUpdated: '2025-10-03 21:00',
      },
      { id: 'goro-aa', name: 'AA', shortName: 'AA', maxPlayers: 50, players: [], lastUpdated: '2025-10-03 21:00' },
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
    order: 38,
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
    order: 39,
    enabled: true,
    groups: [
      { id: 'score-live-stb-ejemplo', name: 'Jugador Stableford', shortName: 'Stb', maxPlayers: 1, players: [], lastUpdated: '2025-10-03 22:00' },
    ],
  },
];
