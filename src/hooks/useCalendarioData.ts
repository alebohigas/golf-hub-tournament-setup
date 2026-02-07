/**
 * Calendario Data Hooks
 * React Query hooks for tournament calendar and schedules
 * Uses POLL_SLOW since calendar rarely changes
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getCalendarioDaysUrl, getCalendarioSchedulesUrl, POLL_SLOW } from '@/config/api';
import type { TournamentDay, CategorySchedule } from '@/data/calendarioData';

// ============= Tournament Days =============

/** Fetch tournament days list */
export const useTournamentDays = () => {
  return useQuery<TournamentDay[]>({
    queryKey: ['calendario-days'],
    queryFn: () => apiFetch<TournamentDay[]>(getCalendarioDaysUrl()),
    staleTime: POLL_SLOW,
    refetchInterval: POLL_SLOW,
  });
};

// ============= Category Schedules =============

/** Fetch which category plays on which day/time */
export const useCategorySchedules = () => {
  return useQuery<CategorySchedule[]>({
    queryKey: ['calendario-schedules'],
    queryFn: () => apiFetch<CategorySchedule[]>(getCalendarioSchedulesUrl()),
    staleTime: POLL_SLOW,
    refetchInterval: POLL_SLOW,
  });
};
