/**
 * Calendario Data Hooks
 * React Query hooks for tournament calendar from caljuego table
 * Uses POLL_SLOW since calendar rarely changes
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getCalendarioUrl, POLL_SLOW } from '@/config/api';
import type { CalendarDate, CalendarEntry, TournamentDay, CategorySchedule } from '@/data/calendarioData';

/** API response shape from calendario.php */
interface CalendarioResponse {
  dates: CalendarDate[];
  entries: CalendarEntry[];
}

/** Fetch full calendario data (dates + entries) from caljuego table */
export const useCalendarioData = () => {
  return useQuery<CalendarioResponse>({
    queryKey: ['calendario'],
    queryFn: () => apiFetch<CalendarioResponse>(getCalendarioUrl()),
    staleTime: POLL_SLOW,
    refetchInterval: POLL_SLOW,
  });
};

// ============= Legacy hooks (kept for backward compatibility) =============

/** @deprecated Use useCalendarioData instead */
export const useTournamentDays = () => {
  return useQuery<TournamentDay[]>({
    queryKey: ['calendario-days'],
    queryFn: async () => [],
    staleTime: POLL_SLOW,
  });
};

/** @deprecated Use useCalendarioData instead */
export const useCategorySchedules = () => {
  return useQuery<CategorySchedule[]>({
    queryKey: ['calendario-schedules'],
    queryFn: async () => [],
    staleTime: POLL_SLOW,
  });
};
