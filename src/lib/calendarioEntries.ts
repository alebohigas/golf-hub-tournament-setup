import type { CalendarEntry } from '@/data/calendarioData';

/** Merge multiple calendar records for the same category/day before rendering either calendar. */
export function mergeCalendarEntries(entries: CalendarEntry[]): CalendarEntry[] {
  const cells = new Map<string, CalendarEntry>();
  for (const entry of entries) {
    const key = `${entry.categoriaId || entry.category}:${entry.date}`;
    const previous = cells.get(key);
    if (!previous) {
      cells.set(key, { ...entry });
      continue;
    }
    cells.set(key, {
      ...previous,
      hasAM: previous.hasAM || entry.hasAM,
      hasPM: previous.hasPM || entry.hasPM,
      amTime: previous.amTime || entry.amTime,
      pmTime: previous.pmTime || entry.pmTime,
      amGroups: previous.amGroups + entry.amGroups,
      pmGroups: previous.pmGroups + entry.pmGroups,
    });
  }
  return Array.from(cells.values());
}