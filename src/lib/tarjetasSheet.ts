/**
 * tarjetasSheet — geometría de hoja de la IMPRESIÓN DE TARJETAS
 * -----------------------------------------------------------------------------
 * Fuente ÚNICA de verdad de la orientación de la hoja carta para el reporte
 * `/admin/tarjetas-impresion`, su vista previa, el PDF y el panel de
 * Admin → Tarjetas.
 *
 * En ambas orientaciones se imprimen SIEMPRE 2 tarjetas por hoja (1/2 hoja
 * cada una), de modo que los brincos de página nunca se desfasan:
 *   · VERTICAL   (portrait)  → hoja 215.9 × 279.4 mm · 1/2 hoja = 139.70 mm
 *   · HORIZONTAL (landscape) → hoja 279.4 × 215.9 mm · 1/2 hoja = 107.95 mm
 */

/** Lado corto de la hoja carta (mm). */
export const LETTER_SHORT_MM = 215.9;
/** Lado largo de la hoja carta (mm). */
export const LETTER_LONG_MM = 279.4;

/** Orientaciones soportadas por el reporte de tarjetas. */
export type TarjetaOrient = 'portrait' | 'landscape';

/** Etiquetas para el selector de Admin → Tarjetas. */
export const TARJETA_ORIENT_LABELS: Record<TarjetaOrient, string> = {
  portrait: 'Vertical · 2 tarjetas por carta',
  landscape: 'Horizontal · 2 tarjetas por carta (1/2 carta)',
};

/** Normaliza el valor recibido por URL o base de datos. */
export const normalizeTarjetaOrient = (value: unknown): TarjetaOrient =>
  String(value ?? '').toLowerCase() === 'landscape' ? 'landscape' : 'portrait';

/**
 * Geometría de la hoja y de la mitad que ocupa cada tarjeta, en mm.
 * @param landscape `true` para hoja carta acostada (horizontal).
 */
export const tarjetaSheetGeometry = (landscape: boolean) => {
  const width = landscape ? LETTER_LONG_MM : LETTER_SHORT_MM;
  const height = landscape ? LETTER_SHORT_MM : LETTER_LONG_MM;
  return { width, height, half: height / 2 };
};

/**
 * Maquetación PREDETERMINADA por orientación (cabecera, margen, escala y alto
 * de renglón en mm). En horizontal hay menos alto por tarjeta (107.95 mm), así
 * que la cabecera y el renglón son más compactos para que todo quepa exacto.
 */
export const TARJETA_ORIENT_DEFAULTS: Record<
  TarjetaOrient,
  { headerMm: number; marginMm: number; scale: number; rowMm: number; padMm: number }
> = {
  portrait: { headerMm: 30, marginMm: 8, scale: 100, rowMm: 5.5, padMm: 3 },
  landscape: { headerMm: 20, marginMm: 10, scale: 100, rowMm: 4.2, padMm: 1 },
};

/** Alto máximo de cabecera permitido según la orientación (mm). */
export const tarjetaHeaderMaxMm = (landscape: boolean) => (landscape ? 34 : 60);
