// Types for competition winners - prepared for database integration
export interface CompetitionWinner {
  id: string;
  playerId: string;
  playerName: string;
  club: string;
  result?: string; // e.g., "1.2m" for closest putt, "285 yds" for longest drive
}

export interface Competition {
  id: string;
  name: string;
  description: string;
  icon: 'target' | 'trophy' | 'flag' | 'zap' | 'star' | 'award' | 'medal';
  winners: CompetitionWinner[];
  maxWinners: number; // How many winners to display
}

export type CompetitionType = 
  | 'closest_putt'
  | 'longest_drive'
  | 'straightest_drive'
  | 'oyea'
  | 'daily_score'
  | 'approach'
  | 'wager';

// Mock data - will be replaced with database fetch
export const mockCompetitions: Competition[] = [
  {
    id: 'closest_putt',
    name: 'Closest to the Pin',
    description: 'Tiro más cercano al hoyo',
    icon: 'target',
    maxWinners: 3,
    winners: [
      { id: '1', playerId: 'p1', playerName: 'Carlos Rodríguez', club: 'Club Campestre Monterrey', result: '0.8m' },
      { id: '2', playerId: 'p2', playerName: 'Miguel Ángel Torres', club: 'Club de Golf Santa Anita', result: '1.2m' },
      { id: '3', playerId: 'p3', playerName: 'Fernando Vega', club: 'Club Campestre de Querétaro', result: '1.5m' },
    ]
  },
  {
    id: 'longest_drive',
    name: 'Longest Drive',
    description: 'Drive más largo',
    icon: 'zap',
    maxWinners: 2,
    winners: [
      { id: '4', playerId: 'p4', playerName: 'Roberto Sánchez', club: 'Club de Golf Vallescondido', result: '312 yds' },
      { id: '5', playerId: 'p5', playerName: 'Alejandro Mendoza', club: 'Club Campestre de León', result: '298 yds' },
    ]
  },
  {
    id: 'straightest_drive',
    name: 'Straightest Drive',
    description: 'Drive más recto',
    icon: 'flag',
    maxWinners: 1,
    winners: [
      { id: '6', playerId: 'p6', playerName: 'Luis Hernández', club: 'Club de Golf La Hacienda', result: 'Fairway center' },
    ]
  },
  {
    id: 'oyea',
    name: "O'Yea",
    description: 'Premio especial O\'Yea',
    icon: 'star',
    maxWinners: 1,
    winners: [
      { id: '7', playerId: 'p7', playerName: 'Jorge Martínez', club: 'Club Campestre El Campanario' },
    ]
  },
  {
    id: 'daily_score',
    name: 'Daily Score',
    description: 'Mejor puntuación del día',
    icon: 'trophy',
    maxWinners: 3,
    winners: [
      { id: '8', playerId: 'p8', playerName: 'Eduardo Castro', club: 'Club de Golf Bosques', result: '68' },
      { id: '9', playerId: 'p9', playerName: 'Ricardo Flores', club: 'Club Atlas Colomos', result: '69' },
      { id: '10', playerId: 'p10', playerName: 'Pablo Guzmán', club: 'Club Campestre de Celaya', result: '70' },
    ]
  },
  {
    id: 'approach',
    name: 'Best Approach',
    description: 'Mejor approach',
    icon: 'award',
    maxWinners: 2,
    winners: [
      { id: '11', playerId: 'p11', playerName: 'Antonio López', club: 'Club de Golf Pulgas Pandas', result: '0.5m' },
      { id: '12', playerId: 'p12', playerName: 'Daniel Ramírez', club: 'Club Campestre Tampico', result: '0.9m' },
    ]
  },
  {
    id: 'wager',
    name: 'WAGER',
    description: 'Premio WAGER',
    icon: 'medal',
    maxWinners: 1,
    winners: [
      { id: '13', playerId: 'p13', playerName: 'Sergio Navarro', club: 'Club de Golf Malanquín' },
    ]
  },
];

// Simulated API functions - will be replaced with Supabase calls
export const fetchAllCompetitions = async (): Promise<Competition[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCompetitions;
};

export const fetchCompetitionById = async (competitionId: string): Promise<Competition | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockCompetitions.find(c => c.id === competitionId) || null;
};
