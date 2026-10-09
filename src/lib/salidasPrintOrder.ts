/** Datos mínimos para ordenar los bloques del reporte de salidas. */
interface SalidasPrintOrderGroup {
  hole: number | null;
  time: string;
}

/** Orden numérico de hoyo, seguido de hora; conserva jugadores y datos originales. */
export function sortSalidasPrintGroups<T extends SalidasPrintOrderGroup>(groups: T[]): T[] {
  return [...groups].sort((a, b) =>
    (a.hole ?? Infinity) - (b.hole ?? Infinity) || a.time.localeCompare(b.time)
  );
}