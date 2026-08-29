/**
 * useSalidasImpresion
 * -----------------------------------------------------------------------------
 * Hooks del reporte imprimible de SALIDAS por día (`/api/salidas_impresion.php`).
 * Se usan en:
 *   - Admin → pestaña "Salidas" (formulario de filtros; usa useSalidasImpresionDays)
 *   - /admin/salidas-impresion (página imprimible; usa useSalidasImpresionReport)
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import {
  getSalidasImpresionDaysUrl,
  getSalidasImpresionUrl,
  POLL_STATIC,
} from '@/config/api';

// ============= Tipos =============

/** Día de juego con su campo (catálogo del formulario). */
export interface SalidasImpresionDay {
  fecha: string;
  fechaFormato: string;
  campoid: string;
  campo: string;
}

/** Jugador dentro de un grupo de salida. */
export interface SalidasImpresionPlayer {
  name: string;
  clubLogo: string;
}

/** Grupo (foursome) de salida. */
export interface SalidasImpresionGroup {
  id: string;
  hole: number | null;
  time: string;
  tee: string;
  categoryName: string;
  shortName: string;
  players: SalidasImpresionPlayer[];
}

/** Respuesta del reporte. */
export interface SalidasImpresionReport {
  tournament: string;
  club: string;
  course: string;
  fecha: string;
  fechaFormato: string;
  groups: SalidasImpresionGroup[];
}

/** Filtros del reporte (todos obligatorios al momento de consultar). */
export interface SalidasImpresionFilters {
  fecha: string;
  campoid: string;
  hi: string;
  hf: string;
  hri: string;
  hrf: string;
}

// ============= Catálogo de días/campos =============

/** Días de juego del torneo con su campo asignado. */
export const useSalidasImpresionDays = () =>
  useQuery<{ days: SalidasImpresionDay[] }>({
    queryKey: ['salidas-impresion-days'],
    queryFn: async () => {
      const data = await apiFetch<any>(getSalidasImpresionDaysUrl());
      return { days: Array.isArray(data?.days) ? data.days : [] };
    },
    staleTime: POLL_STATIC,
  });

// ============= Reporte =============

/**
 * Reporte de salidas para los filtros dados.
 * @param filters Filtros de fecha/campo/hoyos/horas
 * @param enabled Sólo consulta cuando hay fecha
 */
export const useSalidasImpresionReport = (
  filters: SalidasImpresionFilters | null,
  enabled = true
) =>
  useQuery<SalidasImpresionReport>({
    queryKey: ['salidas-impresion', filters],
    queryFn: async () => {
      const data = await apiFetch<any>(getSalidasImpresionUrl(filters!));
      return {
        tournament: data?.tournament ?? '',
        club: data?.club ?? '',
        course: data?.course ?? '',
        fecha: data?.fecha ?? '',
        fechaFormato: data?.fechaFormato ?? '',
        groups: Array.isArray(data?.groups) ? data.groups : [],
      };
    },
    enabled: enabled && !!filters?.fecha,
    staleTime: POLL_STATIC,
  });
