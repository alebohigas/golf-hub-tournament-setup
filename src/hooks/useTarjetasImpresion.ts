/**
 * useTarjetasImpresion
 * -----------------------------------------------------------------------------
 * Hooks del reporte imprimible de TARJETAS de juego (`/api/tarjetas_impresion.php`).
 * Se usan en:
 *   - Admin → pestaña "Tarjetas" (catálogo de días/categorías) → useTarjetasCatalogo
 *   - /admin/tarjetas-impresion (página imprimible)            → useTarjetasReport
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import {
  getTarjetasImpresionCatalogoUrl,
  getTarjetasImpresionUrl,
  POLL_STATIC,
} from '@/config/api';

// ============= Tipos =============

/** Categoría disponible para imprimir tarjetas en un día de juego. */
export interface TarjetaCategoria {
  id: string;
  name: string;
  shortName: string;
  /** STROKE PLAY / STABLEFORD (mayúsculas). */
  system: string;
}

/** Día de juego + campo con sus categorías. */
export interface TarjetasCatalogoDay {
  fecha: string;
  fechaFormato: string;
  campoid: string;
  campo: string;
  categories: TarjetaCategoria[];
}

/** Renglón de un hoyo dentro de la tarjeta. */
export interface TarjetaHole {
  numero: number;
  par: number | null;
  yardas: number | null;
  ventaja: number | null;
  /** Hora estimada de juego del hoyo ("HH:MM"). */
  parTime: string;
  /** Golpes de ventaja del jugador en ese hoyo. */
  handicap: number;
}

/** Totales de ida (Out/V1), vuelta (In/V2) y generales. */
export interface TarjetaTotals {
  parOut: number;
  parIn: number;
  par: number;
  yardasOut: number;
  yardasIn: number;
  yardas: number;
  handicapOut: number;
  handicapIn: number;
  handicap: number;
}

/** Una tarjeta de juego completa (un jugador). */
export interface TarjetaCard {
  groupId: string;
  hole: number | null;
  time: string;
  teeSal: string;
  tee: string;
  playerId: string;
  playerNumber: string;
  name: string;
  club: string;
  folio: string;
  categoryId: string;
  categoryName: string;
  shortName: string;
  system: string;
  hcp: number;
  holes: TarjetaHole[];
  totals: TarjetaTotals;
}

/** Respuesta del reporte de tarjetas. */
export interface TarjetasReport {
  tournament: string;
  club: string;
  course: string;
  /** Logo de encabezado del torneo (`torneo.logo_header`) ya proxeado. */
  logoHeader: string;
  fecha: string;
  fechaFormato: string;
  cards: TarjetaCard[];
}

// ============= Queries =============

/** Catálogo de días de juego + campos + categorías con salidas capturadas. */
export const useTarjetasCatalogo = () =>
  useQuery<{ days: TarjetasCatalogoDay[] }>({
    queryKey: ['tarjetas-impresion-catalogo'],
    queryFn: async () => {
      const res = await apiFetch(getTarjetasImpresionCatalogoUrl());
      if (!res.ok) throw new Error('No se pudo cargar el catálogo de tarjetas');
      return res.json();
    },
    staleTime: POLL_STATIC,
  });

/**
 * Reporte de tarjetas de un día + categorías.
 * Sin caché (`staleTime: 0`) para que cualquier cambio de salidas o de tiempos
 * por hoyo se refleje al abrir la página de impresión.
 */
export const useTarjetasReport = (filters: {
  fecha: string;
  catid: string;
  campoid?: string;
}) =>
  useQuery<TarjetasReport>({
    queryKey: ['tarjetas-impresion', filters],
    queryFn: async () => {
      const res = await apiFetch(getTarjetasImpresionUrl(filters));
      if (!res.ok) throw new Error('No se pudo cargar el reporte de tarjetas');
      return res.json();
    },
    enabled: !!filters.fecha && !!filters.catid,
    staleTime: 0,
  });
