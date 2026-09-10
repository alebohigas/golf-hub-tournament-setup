/**
 * banderasData.ts
 * ---------------------------------------------------------------
 * SOLO TIPOS. La data del pin sheet vive en la BD (tabla `banderas`)
 * y se consume vía `useBanderas()` (src/hooks/useBanderasData.ts).
 *
 * Nada de valores hardcodeados aquí — si el torneo no tiene filas
 * cargadas desde /admin → Banderas, la página /banderas mostrará
 * un mensaje de disculpa y el admin puede ocultarla manualmente.
 */

/** Lado desde el que se midió la distancia lateral. 'C' = bandera en el
 *  mero centro (lateral = 0); en la imagen sólo se dibuja la línea central. */
export type PinSide = 'L' | 'R' | 'C';

export interface PinSheetHole {
  hole: number;
  depth: number;
  pinFromFront: number;
  pinFromSide: number;
  pinSide: PinSide;
  /** Posición del pin respecto al centro del green (signed). */
  slope: number;
  title?: string | null;
}
