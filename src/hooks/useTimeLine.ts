/**
 * useTimeLine
 * -----------------------------------------------------------------------------
 * Hook del reporte TIME LINE (`/api/timeline.php`): por cada grupo de salida
 * muestra la hora estimada en cada uno de los 18 hoyos del campo.
 * Se usa en:
 *   - Admin → pestaña "Time Line" (formulario; reutiliza useSalidasImpresionDays)
 *   - /admin/time-line (página imprimible)
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getTimeLineUrl, POLL_STATIC } from '@/config/api';
import type { SalidasImpresionFilters } from '@/hooks/useSalidasImpresion';

// ============= Tipos =============

/** Hoyo del campo con su par y los minutos de juego estimados. */
export interface TimeLineHole {
  numero: number;
  par: number;
  minutes: number;
}

/** Jugador dentro de un grupo. */
export interface TimeLinePlayer {
  id: string;
  name: string;
  clubLogo: string;
}

/** Grupo de salida con su línea de tiempo (mapa hoyo → "HH:MM"). */
export interface TimeLineGroup {
  id: string;
  hole: number | null;
  time: string;
  tee: string;
  categoryName: string;
  shortName: string;
  times: Record<string, string>;
  players: TimeLinePlayer[];
}

/** Respuesta del reporte. */
export interface TimeLineReport {
  tournament: string;
  club: string;
  course: string;
  fecha: string;
  fechaFormato: string;
  holes: TimeLineHole[];
  groups: TimeLineGroup[];
}

/** Filtros del reporte (los mismos que el reporte de salidas). */
export type TimeLineFilters = SalidasImpresionFilters;

// ============= Reporte =============

/**
 * Reporte TIME LINE para los filtros dados.
 * @param filters Filtros de fecha/campo/hoyos/horas
 * @param enabled Sólo consulta cuando los filtros son válidos
 */
export const useTimeLineReport = (filters: TimeLineFilters | null, enabled = true) =>
  useQuery<TimeLineReport>({
    queryKey: ['timeline', filters],
    queryFn: async () => {
      const data = await apiFetch<any>(getTimeLineUrl(filters!));
      return {
        tournament: data?.tournament ?? '',
        club: data?.club ?? '',
        course: data?.course ?? '',
        fecha: data?.fecha ?? '',
        fechaFormato: data?.fechaFormato ?? '',
        holes: Array.isArray(data?.holes) ? data.holes : [],
        groups: Array.isArray(data?.groups) ? data.groups : [],
      };
    },
    enabled: enabled && !!filters?.fecha,
    staleTime: POLL_STATIC,
  });
