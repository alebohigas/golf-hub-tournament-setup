/**
 * Tests del cálculo del hoyo de inicio del bloque en el reporte TIME LINE.
 * Cubren: dato explícito, deducción por hora de salida (con hoyos intermedios
 * faltantes), fallback por marca de salida y el estilo del resaltado.
 */

import { describe, expect, it } from 'vitest';
import { resolveTimeLineStartHole, timeLineStartHoleStyle } from '../timelineStartHole';
import { START_HOLE_BG, START_HOLE_FG } from '../tarjetasStartHole';

const holes = Array.from({ length: 18 }, (_, i) => ({ numero: i + 1 }));

describe('resolveTimeLineStartHole', () => {
  it('usa el hoyo explícito de la BD en cualquier formato', () => {
    expect(resolveTimeLineStartHole({ hole: 10 }, holes)).toBe(10);
    expect(resolveTimeLineStartHole({ hole: 'H01' }, holes)).toBe(1);
    expect(resolveTimeLineStartHole({ hole: '7' }, holes)).toBe(7);
  });

  it('deduce el hoyo por la hora de salida cuando falta el dato', () => {
    const group = {
      hole: null,
      time: '06:20',
      times: { '10': '06:20', '11': '06:36', '12': '06:51' },
    };
    expect(resolveTimeLineStartHole(group, holes)).toBe(10);
  });

  it('funciona con hoyos intermedios faltantes en el catálogo', () => {
    const parciales = [{ numero: 1 }, { numero: 5 }, { numero: 7 }, { numero: 12 }];
    const group = { hole: '', time: '7:05:00', times: { '7': '7 :05', '12': '07:45' } };
    expect(resolveTimeLineStartHole(group, parciales)).toBe(7);
  });

  it('usa la marca de salida como último recurso', () => {
    expect(resolveTimeLineStartHole({ hole: null, time: '', tee: 'H10' }, holes)).toBe(10);
  });

  it('devuelve null si no hay datos suficientes', () => {
    expect(resolveTimeLineStartHole(null, holes)).toBeNull();
    expect(resolveTimeLineStartHole({ hole: null, time: '06:20', times: {} }, holes)).toBeNull();
    expect(resolveTimeLineStartHole({ hole: 0, tee: 'C' }, holes)).toBeNull();
  });
});

describe('timeLineStartHoleStyle', () => {
  it('resalta exactamente el hoyo de inicio con #666666 / #FFFFFF', () => {
    const marcados = holes.filter((h) => timeLineStartHoleStyle(h.numero, 10) !== undefined);
    expect(marcados.map((h) => h.numero)).toEqual([10]);
    const style = timeLineStartHoleStyle(10, 10)!;
    expect(style.backgroundColor).toBe(START_HOLE_BG);
    expect(style.color).toBe(START_HOLE_FG);
    expect(style.printColorAdjust).toBe('exact');
  });

  it('evita cortar el número en tamaños pequeños', () => {
    const style = timeLineStartHoleStyle(1, 1)!;
    expect(style.paddingLeft).toBe(0);
    expect(style.paddingRight).toBe(0);
    expect(style.whiteSpace).toBe('nowrap');
  });

  it('no aplica estilo cuando no hay hoyo de inicio', () => {
    expect(timeLineStartHoleStyle(5, null)).toBeUndefined();
  });
});
