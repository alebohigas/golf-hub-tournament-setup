/**
 * tarjetasSheet — geometría de hoja de la IMPRESIÓN DE TARJETAS
 * -----------------------------------------------------------------------------
 * Fuente ÚNICA de verdad de la hoja carta VERTICAL para el reporte
 * `/admin/tarjetas-impresion`, su vista previa, el PDF y el panel de
 * Admin → Tarjetas.
 *
 * Hoja carta vertical (portrait) → 215.9 × 279.4 mm · 2 tarjetas · 139.70 mm
 * cada una: los brincos de página nunca se desfasan porque cada tarjeta ocupa
 * un alto exacto de 1/2 hoja.
 */

/** Lado corto de la hoja carta (mm). */
export const LETTER_SHORT_MM = 215.9;
/** Lado largo de la hoja carta (mm). */
export const LETTER_LONG_MM = 279.4;

/**
 * Maquetación PREDETERMINADA (cabecera, margen, escala, alto de renglón y
 * padding inferior en mm).
 */
export const TARJETA_LAYOUT_DEFAULTS = {
  headerMm: 30,
  marginMm: 8,
  scale: 100,
  rowMm: 5.5,
  padMm: 3,
};

/** Alto máximo de cabecera permitido (mm). */
export const TARJETA_HEADER_MAX_MM = 60;

/**
 * Geometría de la hoja y del espacio (slot) que ocupa cada tarjeta, en mm.
 * @returns `width`/`height` de la hoja, `cardsPerSheet` (2) y `slot` (alto por
 *          tarjeta, 1/2 hoja). `half` se conserva como alias de `slot`.
 */
export const tarjetaSheetGeometry = () => {
  const width = LETTER_SHORT_MM;
  const height = LETTER_LONG_MM;
  const cardsPerSheet = 2;
  const slot = height / cardsPerSheet;
  return { width, height, cardsPerSheet, slot, half: slot };
};
