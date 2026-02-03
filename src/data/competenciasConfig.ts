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
