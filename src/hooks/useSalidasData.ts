/**
 * Salidas (Tee Times) Data Hooks
 * React Query hooks for tee time data
 * Uses POLL_ACTIVE for updates during tournament
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getSalidasUrl, getSalidasDayUrl, POLL_ACTIVE } from '@/config/api';
import type { DaySalidas } from '@/data/salidasData';

// ============= Types =============

/** Day summary from API */
interface DaySummary {
  dayId: string;
  dayName: string;
  date: string;
  foursomeCount: number;
  playerCount: number;
}

// ============= All Days Summary =============

/** Fetch days summary with counts */
export const useSalidasDays = () => {
  return useQuery<DaySummary[]>({
    queryKey: ['salidas-days'],
    queryFn: () => apiFetch<DaySummary[]>(getSalidasUrl()),
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });
};

// ============= Day Detail =============

/**
 * Fetch foursomes for a specific day
 * @param dayId - Day identifier
 * @param enabled - Whether to enable the query
 */
export const useSalidasByDay = (dayId: string | null, enabled = true) => {
  return useQuery<DaySalidas>({
    queryKey: ['salidas', dayId],
    queryFn: () => apiFetch<DaySalidas>(getSalidasDayUrl(dayId!)),
    enabled: enabled && !!dayId,
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });
};
