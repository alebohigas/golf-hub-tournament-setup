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

/** A single calendar entry (category playing on a date/time) */
export interface CalendarEntry {
  id: number;
  date: string;
  category: string;
  categoryName: string;
  shortName: string;
  startTime: string;
  course: string;
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
