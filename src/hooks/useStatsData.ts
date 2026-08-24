/**
 * useStatsData
 * ---------------------------------------------------------------
 * React Query hooks that back the /stats page. Each hook maps 1:1 to a
 * PHP endpoint under /api/stats_*.php and forwards the active tournament
 * id through the standard `buildQuery()` helper in config/api.ts (kept
 * inline here to avoid touching that file).
 *
 *  - useStatsClubes()             → /api/stats_clubes.php
 *  - useStatsCategoria(catId)     → /api/stats_categoria.php?categoriaid=..
 *  - useStatsJugadoresList()      → /api/stats_jugador.php   (list mode)
 *  - useStatsJugador(jugadorId)   → /api/stats_jugador.php?jugadorid=..
 * ---------------------------------------------------------------
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { API_BASE_URL, POLL_SLOW } from '@/config/api';
import { getTorneoId } from '@/hooks/useTorneoId';

// ============= Types =============

export interface StatsClub {
  id: number | null;
  name: string;
  abr: string;
  logo: string | null;
  /** Per-tee breakdown: salidaId → branch counts. */
  byTee: Record<string, {
    caballeros: number;
    seniors: number;
    supersenior: number;
    damas: number;
    total: number;
  }>;
  total: number;
}

export interface StatsTee {
  id: number;
  tee: string;
  color: string;
  bgcolor?: string;
}

export interface StatsNoShow {
  retiro: number;
  noShow: number;
  descalificado: number;
  /** Jugadores con estatus "NO CONTIENDE" (N). */
  noContiende?: number;
  total: number;
}

export interface StatsClubesResponse {
  total: number;
  clubs: StatsClub[];
  tees: StatsTee[];
  noShow: StatsNoShow;
}

export interface StatsCategoriaHole {
  hole: number;
  par: number | null;
  promedio: number | null;
  rank: number | null;
  aguilas: number;
  birdies: number;
  pares: number;
  bogeys: number;
  dobles: number;
  triples: number;
}
export interface StatsCategoriaSubtotal {
  par: number;
  promedio: number | null;
  aguilas: number;
  birdies: number;
  pares: number;
  bogeys: number;
  dobles: number;
  triples: number;
}
export interface StatsCategoriaResponse {
  categoryName: string;
  tee: string;
  teeColor?: string;
  course: string;
  rounds: number;
  updatedAt: string | null;
  holesToPlay: number;
  holes: StatsCategoriaHole[];
  subtotals: {
    out: StatsCategoriaSubtotal | null;
    in: StatsCategoriaSubtotal | null;
    total: StatsCategoriaSubtotal | null;
  };
}

export interface StatsJugadorListItem {
  id: string;
  name: string;
  club: string;
  categoria: string;
}
export interface StatsJugadorRound {
  label: string;
  date: string | null;
  scores: (number | null)[];
  out: number;
  in: number;
  total: number;
}
export interface StatsJugadorResponse {
  player: {
    id: string;
    name: string;
    club: string;
    categoria: string;
    tee: string;
    teeColor?: string;
    course: string;
  } | null;
  holes: { hole: number; par: number | null; rango: number | null }[];
  rounds: StatsJugadorRound[];
  averages: (number | null)[];
}

// ============= Tee (mesa de salida) stats =============

/** A tee option from stats_tee.php list mode (chip selector source). */
export interface StatsTeeOption {
  id: number;
  tee: string;
  color: string;
  bgcolor?: string;
}

/**
 * Detail response from stats_tee.php for one or several tees.
 * holes/subtotals intentionally reuse the StatsCategoria* shapes so the
 * shared holes matrix component renders them without mapping.
 */
export interface StatsTeeDetailResponse {
  /** "Negras" for one tee, "Negras + Azules" for several. */
  teeName: string;
  /** Tee color — only set when exactly one tee is selected. */
  teeColor?: string;
  /** How many of the requested tees exist in the salidas table. */
  teeCount: number;
  course: string;
  rounds: number;
  updatedAt: string | null;
  holes: StatsCategoriaHole[];
  subtotals: StatsCategoriaResponse['subtotals'];
}

// ============= Helpers =============

/** Build a URL with the current torneoid appended plus optional extras. */
const buildUrl = (path: string, extra: Record<string, string> = {}) => {
  const torneoid = getTorneoId();
  const params = new URLSearchParams({
    ...(torneoid ? { torneoid } : {}),
    ...extra,
  }).toString();
  return `${API_BASE_URL}/${path}${params ? `?${params}` : ''}`;
};

// ============= Hooks =============

/** Clubes asistentes — aggregated player counts per club. */
export const useStatsClubes = () =>
  useQuery<StatsClubesResponse>({
    queryKey: ['stats-clubes', getTorneoId()],
    queryFn: () => apiFetch<StatsClubesResponse>(buildUrl('stats_clubes.php')),
    staleTime: POLL_SLOW,
  });

/** Estadísticas por categoría — hoyo por hoyo. */
export const useStatsCategoria = (categoriaId: string | null) =>
  useQuery<StatsCategoriaResponse>({
    queryKey: ['stats-categoria', getTorneoId(), categoriaId],
    queryFn: () =>
      apiFetch<StatsCategoriaResponse>(
        buildUrl('stats_categoria.php', { categoriaid: String(categoriaId) }),
      ),
    enabled: !!categoriaId,
    staleTime: POLL_SLOW,
  });

/** Player list for search autocomplete on the Jugador stats section. */
export const useStatsJugadoresList = () =>
  useQuery<{ players: StatsJugadorListItem[] }>({
    queryKey: ['stats-jugadores-list', getTorneoId()],
    queryFn: () =>
      apiFetch<{ players: StatsJugadorListItem[] }>(buildUrl('stats_jugador.php')),
    staleTime: POLL_SLOW,
  });

/** Per-player hole-by-hole stats. */
export const useStatsJugador = (jugadorId: string | null) =>
  useQuery<StatsJugadorResponse>({
    queryKey: ['stats-jugador', getTorneoId(), jugadorId],
    queryFn: () =>
      apiFetch<StatsJugadorResponse>(
        buildUrl('stats_jugador.php', { jugadorid: String(jugadorId) }),
      ),
    enabled: !!jugadorId,
    staleTime: POLL_SLOW,
  });

/** List of tees (mesas de salida) used by the tournament's categories. */
export const useStatsTeesList = () =>
  useQuery<{ tees: StatsTeeOption[] }>({
    queryKey: ['stats-tees', getTorneoId()],
    queryFn: () => apiFetch<{ tees: StatsTeeOption[] }>(buildUrl('stats_tee.php')),
    staleTime: POLL_SLOW,
  });

/**
 * Aggregated hole-by-hole stats for one or several tees.
 * @param salidaIds — explicit tee id list; the caller passes ALL tee ids
 *                    when the "Todas" (no selection) filter is active.
 *                    Empty array → query disabled.
 */
export const useStatsTee = (salidaIds: number[]) =>
  useQuery<StatsTeeDetailResponse>({
    queryKey: ['stats-tee', getTorneoId(), salidaIds.join(',')],
    queryFn: () =>
      apiFetch<StatsTeeDetailResponse>(
        buildUrl('stats_tee.php', { salidaids: salidaIds.join(',') }),
      ),
    enabled: salidaIds.length > 0,
    staleTime: POLL_SLOW,
  });