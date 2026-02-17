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

];
