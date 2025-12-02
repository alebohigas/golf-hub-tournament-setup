// Types for calendar schedule - prepared for database integration
export type TimeSlot = 'AM' | 'PM' | null;

export interface CategorySchedule {
  categoryId: string;
  categoryName: string;
  shortName: string;
  schedule: {
    [dayId: string]: TimeSlot;
  };
}

export interface TournamentDay {
  dayId: string;
  dayName: string;
  shortName: string;
  date: string;
}

// Tournament days
export const tournamentDays: TournamentDay[] = [
  { dayId: 'mar30', dayName: 'Martes 30', shortName: 'Mar.30', date: '30 de Septiembre' },
  { dayId: 'mie1', dayName: 'Miércoles 1', shortName: 'Mié.1', date: '1 de Octubre' },
  { dayId: 'jue2', dayName: 'Jueves 2', shortName: 'Jue.2', date: '2 de Octubre' },
  { dayId: 'vie3', dayName: 'Viernes 3', shortName: 'Vie.3', date: '3 de Octubre' },
  { dayId: 'sab4', dayName: 'Sábado 4', shortName: 'Sáb.4', date: '4 de Octubre' },
];

// Category schedules - shows which day and time slot each category plays
export const categorySchedules: CategorySchedule[] = [
  {
    categoryId: 'camp',
    categoryName: 'Campeonato',
    shortName: 'Camp',
    schedule: { mar30: null, mie1: null, jue2: 'PM', vie3: 'PM', sab4: 'PM' }
  },
  {
    categoryId: 'aa',
    categoryName: 'AA',
    shortName: 'AA',
    schedule: { mar30: null, mie1: null, jue2: 'PM', vie3: 'PM', sab4: 'PM' }
  },
  {
    categoryId: 'a',
    categoryName: 'A',
    shortName: 'A',
    schedule: { mar30: null, mie1: null, jue2: 'PM', vie3: 'PM', sab4: 'PM' }
  },
  {
    categoryId: 'b',
    categoryName: 'B',
    shortName: 'B',
    schedule: { mar30: null, mie1: 'PM', jue2: 'AM', vie3: null, sab4: 'AM' }
  },
  {
    categoryId: 'c',
    categoryName: 'C',
    shortName: 'C',
    schedule: { mar30: 'AM', mie1: null, jue2: 'PM', vie3: null, sab4: 'AM' }
  },
  {
    categoryId: 'd',
    categoryName: 'D',
    shortName: 'D',
    schedule: { mar30: 'AM', mie1: 'AM', jue2: null, vie3: null, sab4: 'PM' }
  },
  {
    categoryId: 'e',
    categoryName: 'E',
    shortName: 'E',
    schedule: { mar30: 'AM', mie1: 'AM', jue2: 'AM', vie3: null, sab4: null }
  },
  {
    categoryId: 'sen_camp',
    categoryName: 'Senior Campeonato',
    shortName: 'Sen Camp',
    schedule: { mar30: 'AM', mie1: 'AM', jue2: null, vie3: 'PM', sab4: null }
  },
  {
    categoryId: 'sen_a',
    categoryName: 'Senior A',
    shortName: 'Sen A',
    schedule: { mar30: 'AM', mie1: 'AM', jue2: null, vie3: 'PM', sab4: null }
  },
  {
    categoryId: 'sen_b',
    categoryName: 'Senior B',
    shortName: 'Sen B',
    schedule: { mar30: 'AM', mie1: 'AM', jue2: null, vie3: 'PM', sab4: null }
  },
  {
    categoryId: 'super_sr',
    categoryName: 'Super Senior',
    shortName: 'Super SR',
    schedule: { mar30: 'AM', mie1: 'AM', jue2: null, vie3: 'PM', sab4: null }
  },
  {
    categoryId: 'dama_a',
    categoryName: 'Damas A',
    shortName: 'Dama A',
    schedule: { mar30: 'AM', mie1: 'AM', jue2: null, vie3: 'PM', sab4: null }
  },
  {
    categoryId: 'dama_b',
    categoryName: 'Damas B',
    shortName: 'Dama B',
    schedule: { mar30: 'AM', mie1: 'AM', jue2: null, vie3: 'PM', sab4: null }
  },
];

// API functions - will be replaced with Supabase calls
export const fetchTournamentDays = async (): Promise<TournamentDay[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return tournamentDays;
};

export const fetchCategorySchedules = async (): Promise<CategorySchedule[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return categorySchedules;
};
