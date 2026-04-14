/**
 * Competencias Data Hooks
 * React Query hooks for approach, driver, putt, and skin competitions
 * Fetches from competencias.php PHP endpoint
 * Uses POLL_ACTIVE for periodic updates during active competitions
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import {
  getCompetenciasUrl,
  getCompetenciaDetailUrl,
  POLL_ACTIVE,
} from '@/config/api';
import type { CompetenciaTipo } from '@/data/competencias/types';

// ============= All Competencias =============

/**
 * Fetch all enabled competencia types from the API
 * Returns types with group metadata (no player data)
 */
export const useCompetencias = () => {
  return useQuery<CompetenciaTipo[]>({
    queryKey: ['competencias'],
    queryFn: () => apiFetch<CompetenciaTipo[]>(getCompetenciasUrl()),
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });
};

// ============= Competencia Detail =============

/**
 * Fetch a specific competencia with full player data
 * Uses ?detalle=1 to include players in each group
 * @param tipo - Competition type identifier (oyes, oyesx-driver, putt, skin-game)
 * @param enabled - Whether to enable the query
 */
export const useCompetenciaDetail = (tipo: string | null, enabled = true) => {
  return useQuery<CompetenciaTipo[]>({
    queryKey: ['competencias', tipo, 'detail'],
    queryFn: async () => {
      const data = await apiFetch<CompetenciaTipo[]>(getCompetenciaDetailUrl(tipo!));
      // Transform API response to map 'descripcion' (backend) to 'description' (frontend)
      return data.map(comp => ({
        ...comp,
        groups: comp.groups?.map(group => ({
          ...group,
          description: group.description || (group as unknown as Record<string, string>)['descripcion'] || group.name,
        })) || [],
      }));
    },
    enabled: enabled && !!tipo,
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });
};
