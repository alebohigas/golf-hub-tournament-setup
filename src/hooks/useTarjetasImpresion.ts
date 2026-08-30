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
  getTarjetasTorneosUrl,
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
  /** Día de juego de esta tarjeta (relevante al imprimir un rango). */
  fecha: string;
  /** Día de juego en formato largo español. */
  fechaFormato: string;
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
  /** HCP. NETO impreso (según el campo configurado en Admin → Tarjetas). */
  hcp: number;
  /** Neto derivado de la suma de golpes de ventaja por hoyo (validación). */
  hcpVentajas?: number;
  /** Columna de la BD de la que salió `hcp` ('hcpneto', 'ventajas', …). */
  hcpSource?: string;
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
  /** Todos los días incluidos en el reporte (rango). */
  fechas?: string[];
  cards: TarjetaCard[];
}

/** Torneo disponible para imprimir tarjetas (selector de Admin). */
export interface TarjetaTorneo {
  id: string;
  name: string;
  club: string;
  year: string;
}

// ============= Queries =============

/** Catálogo de días de juego + campos + categorías con salidas capturadas. */
export const useTarjetasCatalogo = (torneoid?: string) =>
  useQuery<{ days: TarjetasCatalogoDay[] }>({
    queryKey: ['tarjetas-impresion-catalogo', torneoid ?? 'activo'],
    queryFn: async () => {
      return apiFetch<{ days: TarjetasCatalogoDay[] }>(getTarjetasImpresionCatalogoUrl(torneoid));
    },
    staleTime: POLL_STATIC,
  });

/** Torneos con calendario capturado (selector de torneo en Admin → Tarjetas). */
export const useTarjetasTorneos = () =>
  useQuery<{ tournaments: TarjetaTorneo[] }>({
    queryKey: ['tarjetas-impresion-torneos'],
    queryFn: async () => apiFetch<{ tournaments: TarjetaTorneo[] }>(getTarjetasTorneosUrl()),
    staleTime: POLL_STATIC,
  });

/**
 * Reporte de tarjetas de un día + categorías.
 * Sin caché (`staleTime: 0`) para que cualquier cambio de salidas o de tiempos
 * por hoyo se refleje al abrir la página de impresión.
 */
export const useTarjetasReport = (filters: {
  /** Un día o varios separados por coma (rango). */
  fecha: string;
  catid: string;
  campoid?: string;
  sistema?: string;
  torneoid?: string;
}) =>
  useQuery<TarjetasReport>({
    queryKey: ['tarjetas-impresion', filters],
    queryFn: async () => {
      return apiFetch<TarjetasReport>(getTarjetasImpresionUrl(filters));
    },
    enabled: !!filters.fecha && !!filters.catid,
    staleTime: 0,
  });
