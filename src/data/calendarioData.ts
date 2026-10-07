/**
 * Calendario Data Types & Mock Data
 * Types for tournament calendar schedule from caljuego table
 */

/** Time slot indicator for AM/PM display */
export type TimeSlot = 'AM' | 'PM' | null;

/** A unique tournament date (column header) */
export interface CalendarDate {
  date: string;
  dayOfWeek: string;
  dayNum: string;
  month: string;
  course: string;
}

/** A single calendar entry (category playing on a date/time).
 *  hasAM/hasPM drive the AM/PM color split inside each cell. */
export interface CalendarEntry {
  id: number;
  date: string;
  category: string;
  /** categoria_id from the categorias DB table — used to sort rows. */
  categoriaId?: number;
  categoryName: string;
  shortName: string;
  course: string;
  /** True when this category has a morning tee time (04:50–10:59). */
  hasAM: boolean;
  /** True when this category has an afternoon tee time (11:00–16:00). */
  hasPM: boolean;
  /** Only occupied A and B subgroups authorize a mixed-color category/date cell. */
  hasSubgroupsAB?: boolean;
  /** Formatted AM tee time ("7:00 AM") or null. */
  amTime: string | null;
  /** Formatted PM tee time ("1:30 PM") or null. */
  pmTime: string | null;
  /** Number of groups starting in the AM half. */
  amGroups: number;
  /** Number of groups starting in the PM half. */
  pmGroups: number;
  /** @deprecated kept for backward compatibility. */
  startTime?: string;
}

/** Legacy types kept for backward compatibility */
export interface TournamentDay {
  dayId: string;
  dayName: string;
  shortName: string;
  date: string;
}

export interface CategorySchedule {
  categoryId: string;
  categoryName: string;
  shortName: string;
  schedule: {
    [dayId: string]: TimeSlot;
  };
}

// Legacy mock data exports (kept for compatibility, no longer used)
export const tournamentDays: TournamentDay[] = [];
export const categorySchedules: CategorySchedule[] = [];
export const fetchTournamentDays = async (): Promise<TournamentDay[]> => [];
export const fetchCategorySchedules = async (): Promise<CategorySchedule[]> => [];
