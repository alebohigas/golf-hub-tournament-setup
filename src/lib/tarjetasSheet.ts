/**
 * tarjetasSheet — geometría de hoja de la IMPRESIÓN DE TARJETAS
 * -----------------------------------------------------------------------------
 * Fuente ÚNICA de verdad de la orientación de la hoja carta para el reporte
 * `/admin/tarjetas-impresion`, su vista previa, el PDF y el panel de
 * Admin → Tarjetas.
 *
 * Tarjetas por hoja según la orientación (los brincos de página nunca se
 * desfasan porque cada tarjeta ocupa un alto exacto):
 *   · VERTICAL   (portrait)  → hoja 215.9 × 279.4 mm · 2 tarjetas · 139.70 mm
 *   · HORIZONTAL (landscape) → hoja 279.4 × 215.9 mm · 1 tarjeta  · 215.90 mm
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
  landscape: 'Horizontal · 1 tarjeta por carta (carta acostada)',
};

/** Normaliza el valor recibido por URL o base de datos. */
export const normalizeTarjetaOrient = (value: unknown): TarjetaOrient =>
  String(value ?? '').toLowerCase() === 'landscape' ? 'landscape' : 'portrait';

/** Tarjetas que caben por hoja en cada orientación. */
export const tarjetaCardsPerSheet = (landscape: boolean) => (landscape ? 1 : 2);

/**
 * Geometría de la hoja y del espacio (slot) que ocupa cada tarjeta, en mm.
 * @param landscape `true` para hoja carta acostada (horizontal, 1 tarjeta).
 * @returns `width`/`height` de la hoja, `cardsPerSheet` y `slot` (alto por
 *          tarjeta). `half` se conserva como alias de `slot` por compatibilidad.
 */
export const tarjetaSheetGeometry = (landscape: boolean) => {
  const width = landscape ? LETTER_LONG_MM : LETTER_SHORT_MM;
  const height = landscape ? LETTER_SHORT_MM : LETTER_LONG_MM;
  const cardsPerSheet = tarjetaCardsPerSheet(landscape);
  const slot = height / cardsPerSheet;
  return { width, height, cardsPerSheet, slot, half: slot };
};

/**
 * Maquetación PREDETERMINADA por orientación (cabecera, margen, escala y alto
 * de renglón en mm). En horizontal la tarjeta usa la hoja completa acostada
 * (279.4 × 215.9 mm), así que hay más alto disponible (215.90 mm) y más ancho:
 * la cabecera y el renglón pueden ser más holgados.
 */
export const TARJETA_ORIENT_DEFAULTS: Record<
  TarjetaOrient,
  { headerMm: number; marginMm: number; scale: number; rowMm: number; padMm: number }
> = {
  portrait: { headerMm: 30, marginMm: 8, scale: 100, rowMm: 5.5, padMm: 3 },
  /* HORIZONTAL: tamaño validado en impresión real (1 tarjeta por carta
     acostada) con una cabecera compacta de 18 mm: logo del torneo arriba a la
     izquierda y nombre + campo/fecha arriba a la derecha. */
  landscape: { headerMm: 18, marginMm: 12, scale: 100, rowMm: 9, padMm: 2 },
};


/** Alto máximo de cabecera permitido según la orientación (mm). */
export const tarjetaHeaderMaxMm = (landscape: boolean) => (landscape ? 60 : 60);
