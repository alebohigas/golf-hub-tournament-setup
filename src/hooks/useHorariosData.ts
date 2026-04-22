/**
 * useHorariosData
 * React Query hook for the "Horarios de Salidas" page.
 * Fetches earliest kickoff time per category/day from /api/horarios.php
 * (sourced from `salidagrupo.horainicio1a`, ignoring '00:00:00').
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { API_BASE_URL, POLL_SLOW } from '@/config/api';
import { getTorneoId } from '@/hooks/useTorneoId';

// ============= Types =============

/** A tournament date used as a column in the matrix table. */
export interface HorarioDate {
  date: string;        // YYYY-MM-DD
  dayOfWeek: string;   // English day name (e.g. "Friday")
  dayNum: string;      // Day-of-month number as string
  month: string;       // English month name (e.g. "October")
}

/** A category row with one optional time per date. */
export interface HorarioEntry {
  categoryId: string;
  categoryName: string;
  shortName: string;
  /** Map YYYY-MM-DD → "HH:MM" (24h). Missing dates have no kickoff. */
  times: Record<string, string>;
}

/** Full response from /api/horarios.php. */
export interface HorariosResponse {
  dates: HorarioDate[];
  entries: HorarioEntry[];
}

// ============= URL builder =============

/** Build the /api/horarios.php URL with the active torneoid. */
const getHorariosUrl = (): string => {
  const torneoId = getTorneoId();
  const qs = torneoId ? `?torneoid=${encodeURIComponent(torneoId)}` : '';
  return `${API_BASE_URL}/horarios.php${qs}`;
};

// ============= Hook =============

/** Fetch kickoff times matrix (categories × days). */
export const useHorariosData = () => {
  return useQuery<HorariosResponse>({
    queryKey: ['horarios'],
    queryFn: async () => {
      const data = await apiFetch<any>(getHorariosUrl());
      return {
        dates:   Array.isArray(data?.dates)   ? data.dates   : [],
        entries: Array.isArray(data?.entries) ? data.entries : [],
      };
    },
    staleTime: POLL_SLOW,
    refetchInterval: POLL_SLOW,
  });
};