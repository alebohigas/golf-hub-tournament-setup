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
      // A duplicate category/date must not reintroduce bicolor for a category without A/B subgroups.
      hasAM: previous.hasSubgroupsAB || entry.hasSubgroupsAB ? previous.hasAM || entry.hasAM : previous.hasAM,
      hasPM: previous.hasSubgroupsAB || entry.hasSubgroupsAB ? previous.hasPM || entry.hasPM : previous.hasPM,
      hasSubgroupsAB: previous.hasSubgroupsAB || entry.hasSubgroupsAB,
      amTime: previous.amTime || entry.amTime,
      pmTime: previous.pmTime || entry.pmTime,
      amGroups: previous.amGroups + entry.amGroups,
      pmGroups: previous.pmGroups + entry.pmGroups,
    });
  }
  return Array.from(cells.values());
}