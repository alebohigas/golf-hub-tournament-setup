/**
 * Competencias API Functions
 * Data fetching layer for competition types, groups, and players
 * Currently uses mock data; designed for future API integration
 */

import { CompetenciaTipo, CompetenciaGroup, CompetenciaPlayer } from './types';
import { competenciasConfig } from './mockData';

// ============= Public API =============

/** Fetch all enabled competition types (sorted by order) */
export const fetchCompetencias = async (): Promise<CompetenciaTipo[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return competenciasConfig.filter(c => c.enabled).sort((a, b) => a.order - b.order);
};

/** Fetch all competition types including disabled (for admin panel) */
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
