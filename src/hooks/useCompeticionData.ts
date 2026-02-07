/**
 * Competición Data Hooks
 * React Query hooks for competition types (closest pin, longest drive, etc.)
 * Uses POLL_ACTIVE for tournament-day updates
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getCompeticionUrl, getCompeticionDetailUrl, POLL_ACTIVE } from '@/config/api';
import type { Competition } from '@/data/competicionData';

// ============= All Competitions =============

/** Fetch all active competitions */
export const useCompetitions = () => {
  return useQuery<Competition[]>({
    queryKey: ['competicion'],
    queryFn: () => apiFetch<Competition[]>(getCompeticionUrl()),
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });
};

// ============= Competition Detail =============

/**
 * Fetch a specific competition with winners
 * @param id - Competition identifier
 * @param enabled - Whether to enable the query
 */
export const useCompetitionDetail = (id: string | null, enabled = true) => {
  return useQuery<Competition>({
    queryKey: ['competicion', id],
    queryFn: () => apiFetch<Competition>(getCompeticionDetailUrl(id!)),
    enabled: enabled && !!id,
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });
};
