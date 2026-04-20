/**
 * useAllCompetenciasData Hook
 * Fetches ALL competition types with full player detail data
 * Used by Premios page for cross-competition player search
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getCompetenciasUrl, getCompetenciaDetailUrl, POLL_ACTIVE } from '@/config/api';
import type { CompetenciaTipo } from '@/data/competencias/types';

// ============= Types =============

/** Player result across a specific competition */
export interface PlayerCompetitionResult {
  /** Competition type info */
  competenciaId: string;
  competenciaName: string;
  competenciaIcon: string;
  /** Group info */
  groupId: string;
  groupName: string;
  /** Player position in this group */
  position: number;
  /** Player name */
  playerName: string;
  /** All player fields for display */
  playerData: Record<string, unknown>;
}

// ============= Hook =============

/**
 * Fetch the master list of competencias (without detail)
 * then fetch detail for ALL types to enable cross-search
 */
export const useAllCompetenciasWithPlayers = () => {
  // Step 1: Fetch master list to know all types
  const masterQuery = useQuery<CompetenciaTipo[]>({
    queryKey: ['competencias', 'all-master'],
    queryFn: async () => {
      const data = await apiFetch<CompetenciaTipo[]>(getCompetenciasUrl());
      // Transform API response to map 'descripcion' (backend) to 'description' (frontend)
      return data.map(comp => ({
        ...comp,
        groups: comp.groups?.map(group => ({
          ...group,
          description: group.description || (group as unknown as Record<string, string>)['descripcion'] || group.name,
        })) || [],
      }));
    },
    staleTime: POLL_ACTIVE,
  });

  // Step 2: Fetch all detail data (all types at once using tipo=all or iteratively)
  // We'll fetch each type's detail and merge
  const allTypes = masterQuery.data || [];
  
  // Extract unique base types from IDs (e.g., "oyes-1" → "oyes")
  const uniqueBaseTypes = [...new Set(allTypes.map(c => c.id.split('-')[0]))];

  const detailQuery = useQuery<CompetenciaTipo[]>({
    queryKey: ['competencias', 'all-details', uniqueBaseTypes.join(',')],
    queryFn: async () => {
      // Fetch detail for each unique base type in parallel
      const results = await Promise.all(
        uniqueBaseTypes.map(async tipo => {
          const data = await apiFetch<CompetenciaTipo[]>(getCompetenciaDetailUrl(tipo))
            .catch(() => [] as CompetenciaTipo[]);
          // Transform API response to map 'descripcion' (backend) to 'description' (frontend)
          return data.map(comp => ({
            ...comp,
            groups: comp.groups?.map(group => ({
              ...group,
              description: group.description || (group as unknown as Record<string, string>)['descripcion'] || group.name,
            })) || [],
          }));
        })
      );
      // Flatten all results into a single array
      return results.flat();
    },
    enabled: uniqueBaseTypes.length > 0,
    staleTime: POLL_ACTIVE,
  });

  return {
    /** All competencias with player detail */
    competencias: detailQuery.data || allTypes,
    /** Loading state */
    isLoading: masterQuery.isLoading || detailQuery.isLoading,
  };
};

// ============= Search Helper =============

import { normalizeSearchText, buildUniqueNameSuggestions } from '@/lib/searchUtils';

/**
 * Search for a player across all competitions and groups.
 * Uses normalizeSearchText to be tolerant of:
 *  - Leading/trailing whitespace in DB records
 *  - Double/triple spaces between names
 *  - Accents (Núñez ↔ Nunez)
 *  - Mixed casing
 * Returns grouped results by competition type
 */
export const searchPlayerAcrossCompetencias = (
  competencias: CompetenciaTipo[],
  query: string
): PlayerCompetitionResult[] => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const results: PlayerCompetitionResult[] = [];

  for (const comp of competencias) {
    for (const group of comp.groups || []) {
      for (const player of group.players || []) {
        if (normalizeSearchText(player.name).includes(normalizedQuery)) {
          results.push({
            competenciaId: comp.id,
            competenciaName: comp.name,
            competenciaIcon: comp.icon,
            groupId: group.id,
            groupName: group.name,
            position: player.position,
            playerName: (player.name || '').replace(/\s+/g, ' ').trim(),
            playerData: player as unknown as Record<string, unknown>,
          });
        }
      }
    }
  }

  return results;
};

/**
 * Build the unique-name suggestion list for autocomplete from all competencias.
 * Cleaned (whitespace-collapsed) and alphabetically sorted.
 */
export const collectUniquePlayerNames = (competencias: CompetenciaTipo[]): string[] => {
  const allNames: string[] = [];
  for (const comp of competencias) {
    for (const group of comp.groups || []) {
      for (const player of group.players || []) {
        if (player?.name) allNames.push(player.name);
      }
    }
  }
  return buildUniqueNameSuggestions(allNames);
};
