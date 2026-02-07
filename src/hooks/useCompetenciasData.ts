/**
 * Competencias Data Hooks
 * React Query hooks for approach, driver, and special competitions
 * Uses POLL_LIVE for real-time updates during active competitions
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import {
  getCompetenciasUrl,
  getCompetenciaDetailUrl,
  getCompetenciaGroupUrl,
  POLL_LIVE,
  POLL_ACTIVE,
} from '@/config/api';
import type { CompetenciaTipo, CompetenciaPlayer } from '@/data/competencias/types';

// ============= All Competencias =============

/** Fetch all enabled competencia types */
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
 * Fetch a specific competencia with groups
 * @param id - Competencia identifier
 * @param enabled - Whether to enable the query
 */
export const useCompetenciaDetail = (id: string | null, enabled = true) => {
  return useQuery<CompetenciaTipo>({
    queryKey: ['competencias', id],
    queryFn: () => apiFetch<CompetenciaTipo>(getCompetenciaDetailUrl(id!)),
    enabled: enabled && !!id,
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });
};

// ============= Group Players =============

/**
 * Fetch players for a specific group in a competencia
 * Uses POLL_LIVE for real-time score updates
 * @param compId - Competencia ID
 * @param groupId - Group ID within the competencia
 * @param enabled - Whether to enable the query
 */
export const useCompetenciaGroupPlayers = (
  compId: string | null,
  groupId: string | null,
  enabled = true
) => {
  return useQuery<CompetenciaPlayer[]>({
    queryKey: ['competencias', compId, 'groups', groupId],
    queryFn: () => apiFetch<CompetenciaPlayer[]>(getCompetenciaGroupUrl(compId!, groupId!)),
    enabled: enabled && !!compId && !!groupId,
    staleTime: POLL_LIVE,
    refetchInterval: POLL_LIVE, // Real-time polling
  });
};
