/**
 * Competencias Config - Legacy Barrel
 * This file re-exports everything from the modular competencias directory
 * for backward compatibility. New code should import from '@/data/competencias'.
 */

export type { CompetenciaPlayer, CompetenciaGroup, CompetenciaTipo, ColumnConfig, CompetenciaIcon } from './competencias/types';
export { competenciasConfig } from './competencias/mockData';
export { fetchCompetencias, fetchAllCompetencias, fetchCompetenciaById, fetchCompetenciaGroups, fetchGroupPlayers } from './competencias/api';
