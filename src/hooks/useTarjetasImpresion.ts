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

/**
 * Segundo contendiente de una tarjeta de MATCH PLAY (`matchplay=1`).
 * Sus renglones Gross / Handicap / NETO se imprimen dentro de la MISMA tarjeta
 * que el jugador principal.
 */
export interface TarjetaOpponent {
  playerId: string;
  name: string;
  club: string;
  folio: string;
  hcp: number;
  hcpPorHoyo?: number[];
  /** Siembra/posición del jugador en la llave (columna de `jugadores`). */
  position?: string;
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
  /** Regla legible aplicada para elegir el valor impreso (modo auditoría). */
  hcpRule?: string;
  /** Valores crudos de las columnas netas de la BD (modo auditoría). */
  hcpDb?: Record<string, number>;
  /**
   * Golpes de ventaja por hoyo del jugador (18 valores). Dependen de la MESA
   * DE SALIDA registrada al jugador, no del handicap de la categoría.
   */
  hcpPorHoyo?: number[];
  holes: TarjetaHole[];
  totals: TarjetaTotals;
  /** MATCH PLAY: número de match de `elimin_salidas_cat` ('' si no existe). */
  matchNo?: string;
  /** MATCH PLAY: siembra/posición del jugador principal en la llave. */
  position?: string;
  /** MATCH PLAY: segundo contendiente del match (null si el match está incompleto). */
  opponent?: TarjetaOpponent | null;
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
  /** Columna de la BD del HANDICAP NETO (Admin → Tarjetas). */
  hcpfield?: string;
  /** '1' → tarjetas de MATCH PLAY (una tarjeta por enfrentamiento). */
  matchplay?: string;
}) =>
  useQuery<TarjetasReport>({
    queryKey: ['tarjetas-impresion', filters],
    queryFn: async () => {
      return apiFetch<TarjetasReport>(getTarjetasImpresionUrl(filters));
    },
    enabled: !!filters.fecha && !!filters.catid,
    staleTime: 0,
  });
