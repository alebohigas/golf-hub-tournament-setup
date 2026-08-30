/**
 * timelineStartHole.ts — Hoyo de inicio del bloque en el reporte TIME LINE
 * -----------------------------------------------------------------------------
 * Una sola fuente de verdad para:
 *   (a) DEDUCIR el hoyo donde arranca cada grupo a partir de los datos de la BD,
 *       aun cuando la columna del hoyo venga vacía o falten hoyos intermedios
 *       en el catálogo del campo, y
 *   (b) el ESTILO del resaltado (#666666 de fondo, #FFFFFF de número), que debe
 *       verse idéntico en pantalla, impresión y exportación a PDF.
 *
 * Reutiliza `normalizeStartHole` / `startHoleCellStyle` de las tarjetas para no
 * duplicar reglas de normalización ni colores.
 */

import type { CSSProperties } from 'react';
import { normalizeStartHole, startHoleCellStyle } from '@/lib/tarjetasStartHole';

/** Forma mínima del grupo que necesita el cálculo (subconjunto de TimeLineGroup). */
export interface StartHoleGroupLike {
  /** Hoyo de salida tal como lo entrega el API (puede faltar). */
  hole?: number | string | null;
  /** Hora de salida del grupo ("06:20", "6:20:00"…). */
  time?: string | null;
  /** Marca de salida / tee ("C", "H10", "10"…). */
  tee?: string | null;
  /** Mapa hoyo → hora estimada. */
  times?: Record<string, string> | null;
}

/** Forma mínima del hoyo del campo. */
export interface StartHoleHoleLike {
  numero: number;
}

/** Normaliza una hora a "H:MM" comparable (sin espacios ni segundos). */
const compactTime = (raw?: string | null): string => {
  if (!raw) return '';
  const m = String(raw).replace(/\s+/g, '').match(/^(\d{1,2}):(\d{2})/);
  return m ? `${Number(m[1])}:${m[2]}` : '';
};

/**
 * Deduce el hoyo de inicio del bloque de un grupo.
 *
 * Orden de resolución (el primero que aplique gana):
 *  1. `group.hole` normalizado (1–18) — dato explícito de la BD.
 *  2. El hoyo cuya hora estimada coincide con la hora de salida del grupo
 *     (`times`), que es siempre el hoyo donde arranca la vuelta. Esto cubre
 *     grupos sin columna de hoyo y catálogos con hoyos intermedios faltantes.
 *  3. Un número 1–18 embebido en la marca de salida (`tee`, p. ej. "H10").
 *
 * @param group Grupo de salida.
 * @param holes Hoyos del campo (opcional; sólo se usa para acotar el paso 2).
 * @returns Hoyo 1–18, o `null` si no puede determinarse con los datos dados.
 */
export const resolveTimeLineStartHole = (
  group?: StartHoleGroupLike | null,
  holes?: StartHoleHoleLike[] | null,
): number | null => {
  if (!group) return null;

  // 1) Dato explícito.
  const explicit = normalizeStartHole(group.hole ?? null);
  if (explicit != null) return explicit;

  // 2) Coincidencia por hora de salida dentro de la línea de tiempo.
  const start = compactTime(group.time);
  const times = group.times ?? {};
  if (start) {
    const candidates =
      holes && holes.length > 0
        ? holes.map((h) => h.numero)
        : Object.keys(times)
            .map((k) => Number(k))
            .filter((n) => Number.isInteger(n))
            .sort((a, b) => a - b);
    for (const n of candidates) {
      const hole = normalizeStartHole(n);
      if (hole == null) continue;
      if (compactTime(times[String(hole)]) === start) return hole;
    }
  }

  // 3) Número embebido en la marca de salida.
  const fromTee = String(group.tee ?? '').match(/(\d{1,2})/);
  return fromTee ? normalizeStartHole(fromTee[1]) : null;
};

/**
 * Estilo de la celda del hoyo de inicio en el TIME LINE.
 *
 * Añade al estilo base de tarjetas las reglas necesarias para que el número
 * NUNCA se corte al reducir la densidad/tamaño de letra ni al rasterizar el
 * PDF: sin padding lateral que empuje el texto, sin salto de línea y con
 * ajuste automático del glifo dentro de la columna.
 *
 * @param holeNumber Número de hoyo de la celda.
 * @param startHole  Hoyo de inicio del grupo (ya resuelto).
 */
export const timeLineStartHoleStyle = (
  holeNumber: number,
  startHole: number | null,
): CSSProperties | undefined => {
  const base = startHoleCellStyle(
    normalizeStartHole(holeNumber) != null && normalizeStartHole(holeNumber) === startHole,
  );
  if (!base) return undefined;
  return {
    ...base,
    paddingLeft: 0,
    paddingRight: 0,
    whiteSpace: 'nowrap',
    overflow: 'visible',
    // El fondo debe cubrir toda la celda también en impresión/PDF.
    backgroundClip: 'padding-box',
  };
};
