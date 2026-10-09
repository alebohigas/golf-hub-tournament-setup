/** Comprueba el orden solicitado para los bloques, sin alterar sus jugadores. */
import { describe, expect, it } from 'vitest';
import { sortSalidasPrintGroups } from '../salidasPrintOrder';

describe('orden de impresión de salidas', () => {
  it('prioriza el hoyo numérico antes de la hora', () => {
    const groups = [
      { hole: 10, time: '06:30' },
      { hole: 2, time: '06:32' },
      { hole: 1, time: '07:00' },
    ];
    expect(sortSalidasPrintGroups(groups).map(g => g.hole)).toEqual([1, 2, 10]);
    expect(groups.map(g => g.hole)).toEqual([10, 2, 1]);
  });

  it('ordena por hora dentro de cada hoyo como la referencia H10 y H11', () => {
    const groups = [
      { hole: 11, time: '06:32', players: ['Roberto', 'Juan'] },
      { hole: 10, time: '06:32', players: ['José', 'Isaías'] },
      { hole: 11, time: '06:30', players: ['Pablo', 'Daniel'] },
      { hole: 10, time: '06:30', players: ['Leonardo', 'Francisco'] },
    ];
    const sorted = sortSalidasPrintGroups(groups);
    expect(sorted.map(g => `${g.hole}/${g.time}`)).toEqual([
      '10/06:30', '10/06:32', '11/06:30', '11/06:32',
    ]);
    expect(sorted[0].players).toEqual(['Leonardo', 'Francisco']);
  });
});