/**
 * Test de regresión del resaltado del HOYO DE INICIO en tarjetas de impresión.
 *
 * Garantiza que:
 *  - cualquier valor H01–H18 (número o texto) se normaliza correctamente,
 *  - sólo la celda del hoyo de inicio recibe estilo,
 *  - el estilo es negro/blanco puro con `printColorAdjust: 'exact'`, es decir
 *    idéntico en pantalla, impresión y exportación a PDF (misma función,
 *    estilo inline, sin depender de clases ni del tema de diseño).
 */

import { describe, expect, it } from 'vitest';
import {
  START_HOLE_BG,
  START_HOLE_FG,
  isStartHole,
  normalizeStartHole,
  startHoleCellStyle,
  startHoleStyleFor,
} from '../tarjetasStartHole';

describe('normalizeStartHole', () => {
  it('acepta números, texto y prefijo H', () => {
    expect(normalizeStartHole(1)).toBe(1);
    expect(normalizeStartHole('10')).toBe(10);
    expect(normalizeStartHole('H01')).toBe(1);
    expect(normalizeStartHole(' h18 ')).toBe(18);
  });

  it('rechaza datos faltantes o fuera de rango', () => {
    expect(normalizeStartHole(null)).toBeNull();
    expect(normalizeStartHole(undefined)).toBeNull();
    expect(normalizeStartHole('')).toBeNull();
    expect(normalizeStartHole('H--')).toBeNull();
    expect(normalizeStartHole(0)).toBeNull();
    expect(normalizeStartHole(19)).toBeNull();
  });
});

describe('isStartHole', () => {
  it('resalta exactamente un hoyo para todo H01–H18', () => {
    for (let start = 1; start <= 18; start += 1) {
      const label = `H${String(start).padStart(2, '0')}`;
      const marcados = Array.from({ length: 18 }, (_, i) => i + 1).filter((h) =>
        isStartHole(h, label),
      );
      expect(marcados).toEqual([start]);
    }
  });

  it('no resalta nada si falta el hoyo de inicio', () => {
    expect(isStartHole(1, null)).toBe(false);
    expect(isStartHole(1, 'H--')).toBe(false);
  });
});

describe('startHoleCellStyle', () => {
  it('usa negro/blanco puro y fuerza el color al imprimir', () => {
    const style = startHoleCellStyle(true)!;
    expect(style.background).toBe(START_HOLE_BG);
    expect(style.backgroundColor).toBe(START_HOLE_BG);
    expect(style.color).toBe(START_HOLE_FG);
    expect(style.fontWeight).toBe(700);
    expect(style.printColorAdjust).toBe('exact');
    expect(style.WebkitPrintColorAdjust).toBe('exact');
  });

  it('no aplica estilo a celdas normales', () => {
    expect(startHoleCellStyle(false)).toBeUndefined();
    expect(startHoleStyleFor(5, 'H10')).toBeUndefined();
  });

  it('produce el MISMO estilo para H01 y H10 (paridad pantalla/impresión/PDF)', () => {
    expect(startHoleStyleFor(1, 'H01')).toEqual(startHoleStyleFor(10, 'H10'));
    expect(startHoleStyleFor(10, 10)).toEqual(startHoleStyleFor(10, 'H10'));
  });
});
