/**
 * Competencias Column Configurations
 * Reusable column definitions for different competition table layouts
 */

import { ColumnConfig } from './types';

// ============= Standard Columns =============

/** Standard columns for most competitions (Pos, Club, Jugador, Score) */
export const standardColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '60px', format: 'medal' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '60px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'score', label: 'Score', align: 'center', width: '80px', format: 'number' },
];

// ============= Distance & Precision Columns =============

/** Columns for distance competitions (e.g., Drive Largo) */
export const distanceColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '60px', format: 'medal' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '60px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'distance', label: 'Distancia', align: 'center', width: '100px', format: 'distance' },
];

/** Columns for precision competitions (e.g., Drive Recto) */
export const precisionColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '60px', format: 'medal' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '60px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'precision', label: 'Precisión', align: 'center', width: '100px', format: 'percentage' },
];

// ============= Bracket & Elimination Columns =============

/** Columns for bracket/elimination competitions */
export const bracketColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '60px' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '60px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'result', label: 'Resultado', align: 'center', width: '100px' },
];

// ============= Player & Pairs Columns =============

/** Columns for player listings (field, parejas, skin) */
export const playerListColumns: ColumnConfig[] = [
  { key: 'clubLogo', label: 'Club', align: 'center', width: '60px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'hi', label: 'HI', align: 'center', width: '60px', format: 'number' },
  { key: 'hc', label: 'HC', align: 'center', width: '60px', format: 'number' },
  { key: 'hn', label: 'HN', align: 'center', width: '60px', format: 'number' },
];

/** Columns for pairs/couples competitions */
export const parejasColumns: ColumnConfig[] = [
  { key: 'clubLogo', label: 'Club', align: 'center', width: '60px' },
  { key: 'name', label: 'Pareja', align: 'left' },
  { key: 'hi', label: 'HI Prom', align: 'center', width: '70px', format: 'number' },
  { key: 'hc', label: 'HC', align: 'center', width: '60px', format: 'number' },
  { key: 'hn', label: 'HN', align: 'center', width: '60px', format: 'number' },
];

// ============= Live Scoring Columns =============

/** Columns for live scoring competitions (Stroke Play) */
export const liveScoringColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '50px', format: 'medal' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '50px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'thru', label: 'Thru', align: 'center', width: '50px' },
  { key: 'today', label: 'Hoy', align: 'center', width: '60px', format: 'number' },
  { key: 'total', label: 'Total', align: 'center', width: '60px', format: 'number' },
];

/** Columns for stableford scoring */
export const stablefordColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '50px', format: 'medal' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '50px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'thru', label: 'Thru', align: 'center', width: '50px' },
  { key: 'points', label: 'Puntos', align: 'center', width: '70px', format: 'number' },
];

// ============= Specialty Columns =============

/** Columns for O'YES (Closest to Pin) competitions */
export const oyesColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '50px', format: 'medal' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '50px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'distance', label: 'Distancia', align: 'center', width: '80px', format: 'distance' },
];

/** Columns for Putt competitions */
export const puttColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '50px', format: 'medal' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '50px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'distance', label: 'Distancia', align: 'center', width: '80px', format: 'distance' },
];

// ============= Results Columns =============

/** Columns for final results (multi-round) */
export const resultadosColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '50px', format: 'medal' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '50px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'r1', label: 'R1', align: 'center', width: '50px', format: 'number' },
  { key: 'r2', label: 'R2', align: 'center', width: '50px', format: 'number' },
  { key: 'r3', label: 'R3', align: 'center', width: '50px', format: 'number' },
  { key: 'total', label: 'Total', align: 'center', width: '60px', format: 'number' },
];

// ============= Inline Column Sets (used once per competition) =============

/** Columns for pairs results (Pos, Pareja, R1, R2, Total) */
export const parejasResultColumns: ColumnConfig[] = [
  { key: 'position', label: 'Pos', align: 'center', width: '50px', format: 'medal' },
  { key: 'name', label: 'Pareja', align: 'left' },
  { key: 'r1', label: 'R1', align: 'center', width: '50px', format: 'number' },
  { key: 'r2', label: 'R2', align: 'center', width: '50px', format: 'number' },
  { key: 'total', label: 'Total', align: 'center', width: '60px', format: 'number' },
];

/** Columns for salidas (tee times) */
export const salidasColumns: ColumnConfig[] = [
  { key: 'hora', label: 'Hora', align: 'center', width: '70px' },
  { key: 'tee', label: 'Tee', align: 'center', width: '50px' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '50px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'score', label: 'Score', align: 'center', width: '60px', format: 'number' },
];

/** Columns for salidas parejas (pairs tee times) */
export const salidasParejasColumns: ColumnConfig[] = [
  { key: 'hora', label: 'Hora', align: 'center', width: '70px' },
  { key: 'tee', label: 'Tee', align: 'center', width: '50px' },
  { key: 'name', label: 'Pareja', align: 'left' },
  { key: 'score', label: 'Score', align: 'center', width: '60px', format: 'number' },
];

/** Columns for tarjeta individual (hole-by-hole with handicap) */
export const tarjetaHcpColumns: ColumnConfig[] = [
  { key: 'hoyo', label: 'Hoyo', align: 'center', width: '50px' },
  { key: 'par', label: 'Par', align: 'center', width: '50px' },
  { key: 'hcp', label: 'HCP', align: 'center', width: '50px' },
  { key: 'golpes', label: 'Golpes', align: 'center', width: '60px', format: 'number' },
  { key: 'neto', label: 'Neto', align: 'center', width: '60px', format: 'number' },
];

/** Columns for tarjeta stableford (hole-by-hole with points) */
export const tarjetaStablefordColumns: ColumnConfig[] = [
  { key: 'hoyo', label: 'Hoyo', align: 'center', width: '50px' },
  { key: 'par', label: 'Par', align: 'center', width: '50px' },
  { key: 'hcp', label: 'HCP', align: 'center', width: '50px' },
  { key: 'golpes', label: 'Golpes', align: 'center', width: '60px', format: 'number' },
  { key: 'puntos', label: 'Puntos', align: 'center', width: '60px', format: 'number' },
];

/** Columns for tarjeta scratch (gross, no handicap) */
export const tarjetaScratchColumns: ColumnConfig[] = [
  { key: 'hoyo', label: 'Hoyo', align: 'center', width: '50px' },
  { key: 'par', label: 'Par', align: 'center', width: '50px' },
  { key: 'golpes', label: 'Golpes', align: 'center', width: '80px', format: 'number' },
  { key: 'resultado', label: '+/-', align: 'center', width: '60px' },
];

/** Columns for score live XML feed (with accumulated) */
export const scoreLiveColumns: ColumnConfig[] = [
  { key: 'hoyo', label: 'Hoyo', align: 'center', width: '50px' },
  { key: 'par', label: 'Par', align: 'center', width: '50px' },
  { key: 'golpes', label: 'Golpes', align: 'center', width: '60px', format: 'number' },
  { key: 'puntos', label: 'Puntos', align: 'center', width: '60px', format: 'number' },
  { key: 'acumulado', label: 'Acum.', align: 'center', width: '60px', format: 'number' },
];

/** Columns for score live golfista de oro (neto instead of puntos) */
export const scoreLiveGoroColumns: ColumnConfig[] = [
  { key: 'hoyo', label: 'Hoyo', align: 'center', width: '50px' },
  { key: 'par', label: 'Par', align: 'center', width: '50px' },
  { key: 'golpes', label: 'Golpes', align: 'center', width: '60px', format: 'number' },
  { key: 'neto', label: 'Neto', align: 'center', width: '60px', format: 'number' },
  { key: 'acumulado', label: 'Acum.', align: 'center', width: '60px', format: 'number' },
];

/** Columns for skin game (hoyo, club, jugador, categoría, score) */
export const skinGameColumns: ColumnConfig[] = [
  { key: 'hoyo', label: 'Hoyo', align: 'center', width: '50px' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '50px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'categoria', label: 'Cat.', align: 'center', width: '60px' },
  { key: 'score', label: 'Score', align: 'center', width: '60px', format: 'number' },
];

/** Columns for skin game neto variant */
export const skinGameNetoColumns: ColumnConfig[] = [
  { key: 'hoyo', label: 'Hoyo', align: 'center', width: '50px' },
  { key: 'clubLogo', label: 'Club', align: 'center', width: '50px' },
  { key: 'name', label: 'Jugador', align: 'left' },
  { key: 'categoria', label: 'Cat.', align: 'center', width: '60px' },
  { key: 'neto', label: 'Neto', align: 'center', width: '60px', format: 'number' },
];
