/**
 * Competencias Configuration
 * Centralized configuration for all competition types (approach, driver, etc.)
 * Designed to handle ~95 different competition pages dynamically
 * 
 * Each competition type can be enabled/disabled from admin panel
 * Data structure supports future API integration
 */

// ============= Types =============

/** Player result in a competition */
export interface CompetenciaPlayer {
  id: string;
  position: number;
  name: string;
  club: string;
  clubLogo?: string;
  /** Additional fields based on competition type */
  distance?: number;       // For driver distance
  precision?: number;      // For driver precision (0-100%)
  score?: number;          // Generic score
  round?: number;          // Round number
  date?: string;           // Date of result
}

/** Group within a competition (e.g., Campeonato, AA+A, etc.) */
export interface CompetenciaGroup {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  hoyo?: number;
  maxPlayers: number;
  players: CompetenciaPlayer[];
  lastUpdated?: string;
}

/** Competition type definition */
export interface CompetenciaTipo {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  icon: 'target' | 'trophy' | 'flag' | 'zap' | 'star' | 'award' | 'medal' | 'crosshair' | 'ruler';
  /** Column configuration for results table */
  columns: ColumnConfig[];
  /** Groups within this competition */
  groups: CompetenciaGroup[];
  /** Order in menu */
  order: number;
  /** Is visible (controlled by admin) */
  enabled: boolean;
}

/** Table column configuration */
export interface ColumnConfig {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  /** Format function name */
  format?: 'number' | 'distance' | 'percentage' | 'medal';
}

// ============= Default Column Configs =============

/** Standard columns for most competitions */
const standardColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '60px', format: 'medal' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '60px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'score', label: 'Score', align: 'center', width: '80px', format: 'number' },
];

/** Columns for distance competitions */
const distanceColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '60px', format: 'medal' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '60px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'distance', label: 'Distancia', align: 'center', width: '100px', format: 'distance' },
];

/** Columns for precision competitions */
const precisionColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '60px', format: 'medal' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '60px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'precision', label: 'Precisión', align: 'center', width: '100px', format: 'percentage' },
];

/** Columns for bracket/elimination competitions */
const bracketColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '60px' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '60px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'result', label: 'Resultado', align: 'center', width: '100px' },
];

/** Columns for player listings (field, parejas, skin) */
const playerListColumns: ColumnConfig[] = [
  { key: 'clubLogo', label: 'Club', align: 'center', width: '60px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'hi', label: 'HI', align: 'center', width: '60px', format: 'number' },
  { key: 'hc', label: 'HC', align: 'center', width: '60px', format: 'number' },
  { key: 'hn', label: 'HN', align: 'center', width: '60px', format: 'number' },
];

/** Columns for pairs/couples competitions */
const parejasColumns: ColumnConfig[] = [
  { key: 'clubLogo', label: 'Club', align: 'center', width: '60px' },
  { key: 'name', label: 'Pareja', align: 'left' },
  { key: 'hi', label: 'HI Prom', align: 'center', width: '70px', format: 'number' },
  { key: 'hc', label: 'HC', align: 'center', width: '60px', format: 'number' },
  { key: 'hn', label: 'HN', align: 'center', width: '60px', format: 'number' },
];

// ============= Mock Data =============

/** 
 * Competition types configuration
 * This will be the central registry for all competition pages
 */
export const competenciasConfig: CompetenciaTipo[] = [
  {
    id: 'approach',
    name: 'Approach',
    shortName: 'Approach',
    description: 'Competencia de approach al green',
    icon: 'target',
    columns: standardColumns,
    order: 1,
    enabled: true,
    groups: [
      {
        id: 'approach-camp',
        name: 'Campeonato + AA',
        shortName: 'Camp+AA',
        hoyo: 8,
        maxPlayers: 5,
        players: [
          { id: 'a1', position: 1, name: 'Juan García López', club: 'Herradura', score: 15 },
          { id: 'a2', position: 2, name: 'Pedro Martínez', club: 'SCGA', score: 28 },
          { id: 'a3', position: 3, name: 'Carlos Rodríguez', club: 'Tigres', score: 45 },
          { id: 'a4', position: 4, name: 'Miguel Hernández', club: 'CCT', score: 52 },
          { id: 'a5', position: 5, name: 'Roberto Sánchez', club: 'WAGR', score: 68 },
        ],
        lastUpdated: '2025-10-02 14:30',
      },
      {
        id: 'approach-ab',
        name: 'A + B',
        shortName: 'A+B',
        hoyo: 12,
        maxPlayers: 5,
        players: [
          { id: 'a6', position: 1, name: 'Luis Fernández', club: 'CCL', score: 22 },
          { id: 'a7', position: 2, name: 'Antonio Gómez', club: 'CCS', score: 35 },
          { id: 'a8', position: 3, name: 'Francisco López', club: 'CCT', score: 48 },
        ],
        lastUpdated: '2025-10-02 14:30',
      },
      {
        id: 'approach-cde',
        name: 'C + D + E',
        shortName: 'C+D+E',
        hoyo: 16,
        maxPlayers: 5,
        players: [
          { id: 'a9', position: 1, name: 'José Ramírez', club: 'Herradura', score: 18 },
          { id: 'a10', position: 2, name: 'Manuel Torres', club: 'SCGA', score: 32 },
        ],
        lastUpdated: '2025-10-02 14:30',
      },
      {
        id: 'approach-seniors',
        name: 'Seniors',
        shortName: 'Seniors',
        hoyo: 4,
        maxPlayers: 5,
        players: [
          { id: 'a11', position: 1, name: 'Alberto Pérez', club: 'Tigres', score: 25 },
          { id: 'a12', position: 2, name: 'Fernando Reyes', club: 'CCT', score: 38 },
        ],
        lastUpdated: '2025-10-02 14:30',
      },
      {
        id: 'approach-damas',
        name: 'Damas',
        shortName: 'Damas',
        hoyo: 6,
        maxPlayers: 5,
        players: [
          { id: 'a13', position: 1, name: 'María González', club: 'SCGA', score: 20 },
          { id: 'a14', position: 2, name: 'Laura Martínez', club: 'Tigres', score: 42 },
        ],
        lastUpdated: '2025-10-02 14:30',
      },
    ],
  },
  {
    id: 'driver-distancia',
    name: 'Drive de Distancia',
    shortName: 'Drive Dist.',
    description: 'Competencia de drive largo',
    icon: 'ruler',
    columns: distanceColumns,
    order: 2,
    enabled: true,
    groups: [
      {
        id: 'driver-camp',
        name: 'Campeonato + AA',
        shortName: 'Camp+AA',
        hoyo: 10,
        maxPlayers: 5,
        players: [
          { id: 'd1', position: 1, name: 'Juan García López', club: 'Herradura', distance: 295 },
          { id: 'd2', position: 2, name: 'Pedro Martínez', club: 'SCGA', distance: 288 },
          { id: 'd3', position: 3, name: 'Carlos Rodríguez', club: 'Tigres', distance: 275 },
        ],
        lastUpdated: '2025-10-02 15:00',
      },
      {
        id: 'driver-ab',
        name: 'A + B',
        shortName: 'A+B',
        hoyo: 10,
        maxPlayers: 5,
        players: [
          { id: 'd4', position: 1, name: 'Luis Fernández', club: 'CCL', distance: 268 },
          { id: 'd5', position: 2, name: 'Antonio Gómez', club: 'CCS', distance: 255 },
        ],
        lastUpdated: '2025-10-02 15:00',
      },
    ],
  },
  {
    id: 'driver-precision',
    name: 'Drive de Precisión',
    shortName: 'Drive Prec.',
    description: 'Competencia de drive recto',
    icon: 'crosshair',
    columns: precisionColumns,
    order: 3,
    enabled: true,
    groups: [
      {
        id: 'precision-camp',
        name: 'Campeonato + AA',
        shortName: 'Camp+AA',
        hoyo: 14,
        maxPlayers: 5,
        players: [
          { id: 'p1', position: 1, name: 'Miguel Hernández', club: 'CCT', precision: 98 },
          { id: 'p2', position: 2, name: 'Roberto Sánchez', club: 'WAGR', precision: 95 },
        ],
        lastUpdated: '2025-10-02 15:30',
      },
    ],
  },
  {
    id: 'driver-300',
    name: 'Driver 300',
    shortName: 'Driver 300',
    description: 'Competencia de drive especial 300 yardas',
    icon: 'ruler',
    columns: distanceColumns,
    order: 4,
    enabled: true,
    groups: [
      {
        id: 'driver300-camp',
        name: 'Campeonato + AA',
        shortName: 'Camp+AA',
        hoyo: 10,
        maxPlayers: 5,
        players: [
          { id: 'd300-1', position: 1, name: 'Juan García López', club: 'Herradura', distance: 312 },
          { id: 'd300-2', position: 2, name: 'Pedro Martínez', club: 'SCGA', distance: 305 },
          { id: 'd300-3', position: 3, name: 'Carlos Rodríguez', club: 'Tigres', distance: 298 },
        ],
        lastUpdated: '2025-10-02 16:00',
      },
    ],
  },
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
      {
        id: 'elim16-campeonato',
        name: 'Campeonato',
        shortName: 'Camp',
        maxPlayers: 16,
        players: [],
        lastUpdated: '2025-10-02 16:30',
      },
      {
        id: 'elim16-seniors',
        name: 'Seniors',
        shortName: 'Seniors',
        maxPlayers: 16,
        players: [],
        lastUpdated: '2025-10-02 16:30',
      },
    ],
  },
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
      {
        id: 'elimsf-campeonato',
        name: 'Campeonato',
        shortName: 'Camp',
        maxPlayers: 8,
        players: [],
        lastUpdated: '2025-10-02 17:00',
      },
    ],
  },
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
      {
        id: 'elimpe-campeonato',
        name: 'Campeonato',
        shortName: 'Camp',
        maxPlayers: 16,
        players: [],
        lastUpdated: '2025-10-02 17:30',
      },
    ],
  },
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
      {
        id: 'field-aa',
        name: 'AA',
        shortName: 'AA',
        maxPlayers: 50,
        players: [],
        lastUpdated: '2025-10-02 18:00',
      },
    ],
  },
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
      {
        id: 'skin-grupo2',
        name: 'Grupo 2',
        shortName: 'G2',
        maxPlayers: 20,
        players: [],
        lastUpdated: '2025-10-02 19:00',
      },
    ],
  },
];

// ============= API Functions =============

/** Fetch all competition types */
export const fetchCompetencias = async (): Promise<CompetenciaTipo[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return competenciasConfig.filter(c => c.enabled).sort((a, b) => a.order - b.order);
};

/** Fetch all competition types including disabled (for admin) */
export const fetchAllCompetencias = async (): Promise<CompetenciaTipo[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return competenciasConfig.sort((a, b) => a.order - b.order);
};

/** Fetch a specific competition by ID */
export const fetchCompetenciaById = async (id: string): Promise<CompetenciaTipo | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return competenciasConfig.find(c => c.id === id);
};

/** Fetch groups for a competition */
export const fetchCompetenciaGroups = async (competenciaId: string): Promise<CompetenciaGroup[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const competencia = competenciasConfig.find(c => c.id === competenciaId);
  return competencia?.groups || [];
};

/** Fetch players for a specific group */
export const fetchGroupPlayers = async (
  competenciaId: string, 
  groupId: string
): Promise<CompetenciaPlayer[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const competencia = competenciasConfig.find(c => c.id === competenciaId);
  const group = competencia?.groups.find(g => g.id === groupId);
  return group?.players || [];
};
