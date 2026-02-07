/**
 * Competencias Module - Barrel Export
 * Re-exports all types, columns, data, and API functions
 * Import from '@/data/competencias' or '@/data/competenciasConfig' (legacy)
 */

// Types
export type { CompetenciaPlayer, CompetenciaGroup, CompetenciaTipo, ColumnConfig, CompetenciaIcon } from './types';

// Column configurations
export {
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

// Mock data
export { competenciasConfig } from './mockData';

// API functions
export {
  fetchCompetencias,
  fetchAllCompetencias,
  fetchCompetenciaById,
  fetchCompetenciaGroups,
  fetchGroupPlayers,
} from './api';
