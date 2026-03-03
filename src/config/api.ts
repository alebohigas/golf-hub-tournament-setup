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
  const torneoId = getTorneoId();
  const allParams = torneoId ? { torneoid: torneoId, ...params } : { ...params };
  const qs = new URLSearchParams(allParams).toString();
  return qs ? `?${qs}` : '';
};

// ============= Endpoint Builders =============

/** Health check */
export const getHealthUrl = (): string => `${API_BASE_URL}/health.php`;

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

/** Tournament days */
export const getCalendarioDaysUrl = (): string => `${API_BASE_URL}/calendario.php${buildQuery({ modo: 'days' })}`;

/** Category schedules */
export const getCalendarioSchedulesUrl = (): string => `${API_BASE_URL}/calendario.php${buildQuery({ modo: 'schedules' })}`;

/** All results (master: list of categories) */
export const getResultadosUrl = (): string => `${API_BASE_URL}/resultados.php${buildQuery()}`;

/** Results by category */
export const getResultadosCategoryUrl = (categoryId: string): string =>
  `${API_BASE_URL}/resultados_jug.php${buildQuery({ catid: categoryId })}`;

/** Tee times summary */
export const getSalidasUrl = (): string => `${API_BASE_URL}/salidas.php${buildQuery()}`;

/** Tee times by day */
export const getSalidasDayUrl = (dayId: string): string =>
  `${API_BASE_URL}/salidas_det.php${buildQuery({ caljgoid: dayId })}`;

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
 * Get full logo URL from logo filename
 * @param logoFilename - Logo filename from API response
 */
export const getLogoUrl = (logoFilename: string): string =>
  `${LOGOS_BASE_URL}${logoFilename}`;
