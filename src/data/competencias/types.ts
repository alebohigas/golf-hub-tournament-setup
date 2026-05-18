/**
 * Competencias Type Definitions
 * Shared interfaces for competition types, players, groups, and columns
 */

// ============= Player Types =============

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

// ============= Group Types =============

/** Group within a competition (e.g., Campeonato, AA+A, etc.) */
export interface CompetenciaGroup {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  hoyo?: number;
  maxPlayers?: number;
  /** Player count from API (available before detail load) */
  playerCount?: number;
  /** Player data (only available with detalle=1) */
  players?: CompetenciaPlayer[];
  lastUpdated?: string;
  /**
   * Cuando está presente, este grupo representa un bracket Putt Finales
   * ('M' = Caballero, 'F' = Dama). El front renderiza <BracketView sexo />
   * en lugar de la tabla estándar.
   */
  bracketSexo?: 'M' | 'F';
}

// ============= Competition Types =============

/** Icon options for competition types */
export type CompetenciaIcon = 'target' | 'trophy' | 'flag' | 'zap' | 'star' | 'award' | 'medal' | 'crosshair' | 'ruler';

/** Competition type definition */
export interface CompetenciaTipo {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  icon: CompetenciaIcon;
  /** Column configuration for results table */
  columns: ColumnConfig[];
  /** Groups within this competition */
  groups: CompetenciaGroup[];
  /** Order in menu */
  order: number;
  /** Is visible (controlled by admin) */
  enabled: boolean;
}

// ============= Column Types =============

/** Table column configuration */
export interface ColumnConfig {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  /** Format function name */
  format?: 'number' | 'distance' | 'yards' | 'percentage' | 'medal';
}
