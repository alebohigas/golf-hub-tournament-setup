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
  maxWinners: number; // How many winners to display (1-15)
}

export type CompetitionType = 
  | 'closest_putt'
  | 'longest_drive'
  | 'straightest_drive'
  | 'oyea'
  | 'daily_score'
  | 'approach'
  | 'wager';

// Helper to generate mock winners
const generateWinners = (prefix: string, count: number, resultFn?: (i: number) => string): CompetitionWinner[] => {
  const clubs = [
    'Club Campestre Monterrey',
    'Club de Golf Santa Anita',
    'Club Campestre de Querétaro',
    'Club de Golf Vallescondido',
    'Club Campestre de León',
    'Club de Golf La Hacienda',
    'Club Campestre El Campanario',
    'Club de Golf Bosques',
    'Club Atlas Colomos',
    'Club Campestre de Celaya',
    'Club de Golf Pulgas Pandas',
    'Club Campestre Tampico',
    'Club de Golf Malanquín',
    'Club de Golf El Cielo',
    'Club Campestre Chihuahua',
  ];
  const names = [
    'Carlos Rodríguez', 'Miguel Ángel Torres', 'Fernando Vega', 'Roberto Sánchez',
    'Alejandro Mendoza', 'Luis Hernández', 'Jorge Martínez', 'Eduardo Castro',
    'Ricardo Flores', 'Pablo Guzmán', 'Antonio López', 'Daniel Ramírez',
    'Sergio Navarro', 'Raúl Jiménez', 'Óscar Pérez'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    playerId: `p${prefix}-${i + 1}`,
    playerName: names[i % names.length],
    club: clubs[i % clubs.length],
    result: resultFn ? resultFn(i) : undefined,
  }));
};

// Mock data - will be replaced with database fetch
export const mockCompetitions: Competition[] = [
  {
    id: 'closest_putt',
    name: 'Closest to the Pin',
    description: 'Tiro más cercano al hoyo',
    icon: 'target',
    maxWinners: 10,
    winners: generateWinners('cp', 10, (i) => `${(0.5 + i * 0.3).toFixed(1)}m`),
  },
  {
    id: 'longest_drive',
    name: 'Longest Drive',
    description: 'Drive más largo',
    icon: 'zap',
    maxWinners: 10,
    winners: generateWinners('ld', 10, (i) => `${315 - i * 5} yds`),
  },
  {
    id: 'straightest_drive',
    name: 'Straightest Drive',
    description: 'Drive más recto',
    icon: 'flag',
    maxWinners: 10,
    winners: generateWinners('sd', 10),
  },
  {
    id: 'oyea',
    name: "O'Yea",
    description: 'Premio especial O\'Yea',
    icon: 'star',
    maxWinners: 10,
    winners: generateWinners('oy', 10),
  },
  {
    id: 'daily_score',
    name: 'Daily Score',
    description: 'Mejor puntuación del día',
    icon: 'trophy',
    maxWinners: 10,
    winners: generateWinners('ds', 10, (i) => `${67 + i}`),
  },
  {
    id: 'approach',
    name: 'Best Approach',
    description: 'Mejor approach',
    icon: 'award',
    maxWinners: 10,
    winners: generateWinners('ap', 10, (i) => `${(0.3 + i * 0.2).toFixed(1)}m`),
  },
  {
    id: 'wager',
    name: 'WAGER',
    description: 'Premio WAGER',
    icon: 'medal',
    maxWinners: 10,
    winners: generateWinners('wg', 10),
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
