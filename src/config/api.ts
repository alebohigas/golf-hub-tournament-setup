/**
 * API Configuration
 * Central configuration for all API endpoints
 * Points to PHP JSON API wrappers on the same domain
 */

import { getTorneoId } from '@/hooks/useTorneoId';

// ============= Base URL Configuration =============

/**
 * Base URL for the API server
 * Points to the /api/ folder where PHP wrappers live
 */
export const API_BASE_URL = '/api';

// ============= Logos Base URL =============
/** Base URL for club logo images - proxied through our own domain to avoid ad-blocker issues */
export const LOGOS_BASE_URL = '/api/logo.php?file=';

// ============= Polling Intervals (ms) =============
/** Polling for live scoring data - fast refresh */
export const POLL_LIVE = 10_000;       // 10 seconds
/** Polling for active tournament data (results, salidas) */
export const POLL_ACTIVE = 30_000;     // 30 seconds
/** Polling for semi-static data (players, categories) */
export const POLL_SLOW = 120_000;      // 2 minutes
/** No polling - static data (menu, tournament info) */
export const POLL_STATIC = 0;

// ============= Helper: Append torneoid =============

/**
 * Build query string with torneoid and optional extra params
 * @param params - Additional query parameters
 * @returns Query string starting with ?
 */
const buildQuery = (params: Record<string, string> = {}): string => {
  /** Enable backend debug mode when route includes ?debug=1 */
  const debugMode = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('debug')
    : null;
  const torneoId = getTorneoId();
  const baseParams = torneoId ? { torneoid: torneoId } : {};
  const allParams = {
    ...baseParams,
    ...params,
    ...(debugMode === '1' ? { debug: '1' } : {}),
  };
  const qs = new URLSearchParams(allParams).toString();
  return qs ? `?${qs}` : '';
};

// ============= Endpoint Builders =============

/** Health check */
export const getHealthUrl = (): string => `${API_BASE_URL}/health.php`;

/** Site config (torneoid per domain) */
export const getSiteConfigUrl = (): string => `${API_BASE_URL}/site_config.php`;

/** Menu items */
export const getMenuUrl = (): string => `${API_BASE_URL}/menu.php${buildQuery()}`;

/** Sponsors */
export const getSponsorsUrl = (): string => `${API_BASE_URL}/sponsors.php${buildQuery()}`;

/** Tournament info */
export const getTournamentUrl = (): string => `${API_BASE_URL}/tournament.php${buildQuery()}`;

/** Tournament statistics (included in tournament endpoint) */
export const getTournamentStatsUrl = (): string => `${API_BASE_URL}/tournament.php${buildQuery()}`;

/** Categories list */
export const getCategoriesUrl = (): string => `${API_BASE_URL}/categories.php${buildQuery()}`;

/**
 * Players by category ID
 * @param catId - Category ID from the database
 */
export const getPlayersApiUrl = (catId: string): string =>
  `${API_BASE_URL}/players.php${buildQuery({ catid: catId })}`;

/** Calendario - tournament calendar from caljuego table */
export const getCalendarioUrl = (): string => `${API_BASE_URL}/calendario.php${buildQuery()}`;

/** @deprecated Use getCalendarioUrl instead */
export const getCalendarioDaysUrl = (): string => `${API_BASE_URL}/calendario.php${buildQuery({ modo: 'days' })}`;

/** @deprecated Use getCalendarioUrl instead */
export const getCalendarioSchedulesUrl = (): string => `${API_BASE_URL}/calendario.php${buildQuery({ modo: 'schedules' })}`;

/** All results (master: list of categories) */
export const getResultadosUrl = (): string => `${API_BASE_URL}/resultados.php${buildQuery()}`;
/** Results by category - gross=1 for GROSS scoring, gross=0 (default) for NETO */
export const getResultadosCategoryUrl = (categoryId: string, gross: '0' | '1' = '0'): string =>
  `${API_BASE_URL}/resultados_jug.php${buildQuery({ catid: categoryId, gross })}`;

/** Tee times summary */
export const getSalidasUrl = (): string => `${API_BASE_URL}/salidas.php${buildQuery()}`;

/** Tee times by day (legacy-compatible: send only caljgoid, no extra params) */
export const getSalidasDayUrl = (dayId: string, _formato: string = 'individual'): string =>
  `${API_BASE_URL}/salidas_det.php?caljgoid=${encodeURIComponent(dayId)}`;

/** All competitions (competición - trofeos) */
export const getCompeticionUrl = (): string => `${API_BASE_URL}/competicion.php${buildQuery()}`;

/** Competition detail */
export const getCompeticionDetailUrl = (id: string): string =>
  `${API_BASE_URL}/competicion.php${buildQuery({ id })}`;

/** All competencias (approach, driver, putt, skin) */
export const getCompetenciasUrl = (): string => `${API_BASE_URL}/competencias.php${buildQuery()}`;

/** Competencia detail with full player data */
export const getCompetenciaDetailUrl = (id: string): string =>
  `${API_BASE_URL}/competencias.php${buildQuery({ tipo: id, detalle: '1' })}`;

/** Group players within a competencia - uses specific endpoint */
export const getCompetenciaGroupUrl = (compId: string, groupId: string): string =>
  `${API_BASE_URL}/competencias.php${buildQuery({ tipo: compId, detalle: '1' })}`;

/** Events */
export const getEventosUrl = (): string => `${API_BASE_URL}/eventos.php${buildQuery()}`;

/**
 * Live Scoring leaderboard for a specific category
 * @param catId - Category ID
 * @param tipo - Scoring type: stroke | stableford
 * @param gross - 0 for net, 1 for gross
 */
export const getLiveScoringUrl = (catId: string, tipo: string = 'stroke', gross: string = '0'): string =>
  `${API_BASE_URL}/live_scoring.php${buildQuery({ catid: catId, tipo, gross })}`;

/**
 * Player scorecard (hole-by-hole) for a specific round
 * @param jugadorId - Player ID
 * @param categoriaId - Category ID
 * @param fecha - Round date (YYYY-MM-DD)
 * @param tipo - Scoring type: stroke | stableford | parejas
 */
export const getResultadosTarjetaUrl = (
  jugadorId: string,
  categoriaId: string,
  fecha: string,
  tipo: string = 'stroke'
): string =>
  `${API_BASE_URL}/resultados_tarjeta.php${buildQuery({
    jugadorid: jugadorId,
    categoriaid: categoriaId,
    fecha,
    tipo,
  })}`;

/**
 * Get full logo URL from logo filename
 * @param logoFilename - Logo filename from API response
 */
export const getLogoUrl = (logoFilename: string): string =>
  `${LOGOS_BASE_URL}${logoFilename}`;
