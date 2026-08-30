/**
 * tarjetasStartHole.ts — Utilidades para resaltar el HOYO DE INICIO (H01–H18)
 * en las tarjetas de impresión (Admin → Tarjetas).
 *
 * Objetivo: una ÚNICA fuente de verdad para (a) normalizar el hoyo de salida
 * que llega de la BD/URL en cualquier formato ("H01", "h10", "7", 10, null) y
 * (b) el estilo del recuadro resaltado, de modo que la pantalla, la impresión
 * y la exportación a PDF se rendericen exactamente igual.
 *
 * Se usan estilos INLINE (no clases de Tailwind ni tokens de tema) porque el
 * resaltado debe ser negro/blanco puro en todos los temas de diseño y debe
 * sobrevivir a la impresión, donde los navegadores eliminan fondos por
 * omisión (de ahí `printColorAdjust: 'exact'`).
 */

import type { CSSProperties } from 'react';

/** Colores fijos del resaltado (independientes del tema activo). */
export const START_HOLE_BG = '#666666';
export const START_HOLE_FG = '#FFFFFF';

/**
 * Normaliza el hoyo de inicio a un entero 1–18.
 *
 * Acepta `10`, `"10"`, `"H10"`, `"h01"`, `" H7 "`. Devuelve `null` cuando el
 * dato falta, no es numérico o queda fuera del rango 1–18.
 */
export const normalizeStartHole = (
  hole?: number | string | null,
): number | null => {
  if (hole == null) return null;
  const raw = typeof hole === 'number' ? String(hole) : hole;
  const digits = raw.trim().replace(/^h/i, '').trim();
  if (!/^\d{1,2}$/.test(digits)) return null;
  const n = Number(digits);
  return n >= 1 && n <= 18 ? n : null;
};

/**
 * ¿La celda del hoyo `holeNumber` corresponde al hoyo de inicio de la tarjeta?
 *
 * @param holeNumber Número de hoyo de la celda (1–18).
 * @param startHole  Hoyo de inicio de la tarjeta (cualquier formato admitido).
 */
export const isStartHole = (
  holeNumber?: number | string | null,
  startHole?: number | string | null,
): boolean => {
  const a = normalizeStartHole(holeNumber);
  const b = normalizeStartHole(startHole);
  return a != null && b != null && a === b;
};

/**
 * Estilo inline del recuadro del hoyo de inicio: fondo negro, número blanco,
 * negritas y conservación exacta del color al imprimir o exportar a PDF.
 *
 * Devuelve `undefined` cuando la celda NO es el hoyo de inicio, para no
 * alterar el estilo normal de la tabla.
 */
export const startHoleCellStyle = (
  active: boolean,
): CSSProperties | undefined =>
  active
    ? {
        background: START_HOLE_BG,
        backgroundColor: START_HOLE_BG,
        color: START_HOLE_FG,
        fontWeight: 700,
        // Fuerza al navegador a imprimir el fondo (pantalla · impresión · PDF).
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }
    : undefined;

/**
 * Atajo: estilo de la celda a partir del número de hoyo y del hoyo de inicio.
 */
export const startHoleStyleFor = (
  holeNumber?: number | string | null,
  startHole?: number | string | null,
): CSSProperties | undefined =>
  startHoleCellStyle(isStartHole(holeNumber, startHole));
