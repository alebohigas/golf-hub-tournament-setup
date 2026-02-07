/**
 * API Configuration
 * Central configuration for all API endpoints
 * Points to the Express TypeScript server (replaces PHP endpoints)
 */

// ============= Base URL Configuration =============

/**
 * Base URL for the API server
 * Development: http://localhost:3001
 * Production: Update to your server's domain
 */
export const API_BASE_URL = 'http://localhost:3001/api';

// ============= Logos Base URL =============
/** Base URL for club logo images */
export const LOGOS_BASE_URL = 'https://alien2019.speitour.mx/logos';

// ============= Polling Intervals (ms) =============
/** Polling for live scoring data - fast refresh */
export const POLL_LIVE = 10_000;       // 10 seconds
/** Polling for active tournament data (results, salidas) */
export const POLL_ACTIVE = 30_000;     // 30 seconds
/** Polling for semi-static data (players, categories) */
export const POLL_SLOW = 120_000;      // 2 minutes
/** No polling - static data (menu, tournament info) */
export const POLL_STATIC = 0;

// ============= Endpoint Builders =============

/** Health check */
export const getHealthUrl = (): string => `${API_BASE_URL}/health`;

/** Menu items */
export const getMenuUrl = (): string => `${API_BASE_URL}/menu`;

/** Sponsors */
export const getSponsorsUrl = (): string => `${API_BASE_URL}/sponsors`;

/** Tournament info */
export const getTournamentUrl = (): string => `${API_BASE_URL}/tournament`;

/** Tournament statistics */
export const getTournamentStatsUrl = (): string => `${API_BASE_URL}/tournament/stats`;

/** Categories list */
export const getCategoriesUrl = (): string => `${API_BASE_URL}/categories`;

/**
 * Players by category ID
 * @param catId - Category ID from the database
 */
export const getPlayersApiUrl = (catId: string): string =>
  `${API_BASE_URL}/players/${catId}`;

/** Tournament days */
export const getCalendarioDaysUrl = (): string => `${API_BASE_URL}/calendario/days`;

/** Category schedules */
export const getCalendarioSchedulesUrl = (): string => `${API_BASE_URL}/calendario/schedules`;

/** All results */
export const getResultadosUrl = (): string => `${API_BASE_URL}/resultados`;

/** Results by category */
export const getResultadosCategoryUrl = (categoryId: string): string =>
  `${API_BASE_URL}/resultados/${categoryId}`;

/** Tee times summary */
export const getSalidasUrl = (): string => `${API_BASE_URL}/salidas`;

/** Tee times by day */
export const getSalidasDayUrl = (dayId: string): string =>
  `${API_BASE_URL}/salidas/${dayId}`;

/** All competitions */
export const getCompeticionUrl = (): string => `${API_BASE_URL}/competicion`;

/** Competition detail */
export const getCompeticionDetailUrl = (id: string): string =>
  `${API_BASE_URL}/competicion/${id}`;

/** All competencias */
export const getCompetenciasUrl = (): string => `${API_BASE_URL}/competencias`;

/** Competencia detail */
export const getCompetenciaDetailUrl = (id: string): string =>
  `${API_BASE_URL}/competencias/${id}`;

/** Group players within a competencia */
export const getCompetenciaGroupUrl = (compId: string, groupId: string): string =>
  `${API_BASE_URL}/competencias/${compId}/groups/${groupId}`;

/** Events */
export const getEventosUrl = (): string => `${API_BASE_URL}/eventos`;

/**
 * Get full logo URL from logo filename
 * @param logoFilename - Logo filename from API response
 */
export const getLogoUrl = (logoFilename: string): string =>
  `${LOGOS_BASE_URL}/${logoFilename}`;
