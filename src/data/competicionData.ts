// Types for competition winners - prepared for database integration
export interface CompetitionWinner {
  id: string;
  playerId: string;
  playerName: string;
  club: string;
  result?: string;
}

export interface CategoryGroup {
  id: string;
  name: string; // e.g., "A + AA", "B + C", "Campeonato"
  winners: CompetitionWinner[];
}

export interface Competition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: 'target' | 'trophy' | 'flag' | 'zap' | 'star' | 'award' | 'medal';
  categoryGroups: CategoryGroup[];
  maxWinnersPerGroup: number;
}

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
  ];
  const names = [
    'Carlos Rodríguez', 'Miguel Ángel Torres', 'Fernando Vega', 'Roberto Sánchez',
    'Alejandro Mendoza', 'Luis Hernández', 'Jorge Martínez', 'Eduardo Castro',
    'Ricardo Flores', 'Pablo Guzmán',
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    playerId: `p${prefix}-${i + 1}`,
    playerName: names[i % names.length],
    club: clubs[i % clubs.length],
    result: resultFn ? resultFn(i) : undefined,
  }));
};

// Category group templates
const standardCategoryGroups = (prefix: string, resultFn?: (i: number) => string): CategoryGroup[] => [
  { id: `${prefix}-camp`, name: 'Campeonato', winners: generateWinners(`${prefix}-camp`, 3, resultFn) },
  { id: `${prefix}-aa-a`, name: 'AA + A', winners: generateWinners(`${prefix}-aa-a`, 3, resultFn) },
  { id: `${prefix}-b-c`, name: 'B + C', winners: generateWinners(`${prefix}-b-c`, 3, resultFn) },
  { id: `${prefix}-d-e`, name: 'D + E', winners: generateWinners(`${prefix}-d-e`, 3, resultFn) },
  { id: `${prefix}-sen`, name: 'Seniors', winners: generateWinners(`${prefix}-sen`, 3, resultFn) },
];

// Mock data - will be replaced with database fetch
export const mockCompetitions: Competition[] = [
  {
    id: 'closest_putt',
    name: 'Closest to the Pin',
    shortName: 'Closest Pin',
    description: 'Tiro más cercano al hoyo',
    icon: 'target',
    maxWinnersPerGroup: 3,
    categoryGroups: standardCategoryGroups('cp', (i) => `${(0.5 + i * 0.4).toFixed(1)}m`),
  },
  {
    id: 'longest_drive',
    name: 'Longest Drive',
    shortName: 'Longest Drive',
    description: 'Drive más largo',
    icon: 'zap',
    maxWinnersPerGroup: 3,
    categoryGroups: standardCategoryGroups('ld', (i) => `${315 - i * 8} yds`),
  },
  {
    id: 'straightest_drive',
    name: 'Straightest Drive',
    shortName: 'Straightest',
    description: 'Drive más recto',
    icon: 'flag',
    maxWinnersPerGroup: 1,
    categoryGroups: [
      { id: 'sd-all', name: 'General', winners: generateWinners('sd', 1) },
    ],
  },
  {
    id: 'oyea',
    name: "O'Yea",
    shortName: "O'Yea",
    description: "Premio especial O'Yea",
    icon: 'star',
    maxWinnersPerGroup: 3,
    categoryGroups: standardCategoryGroups('oy'),
  },
  {
    id: 'daily_score',
    name: 'Daily Score',
    shortName: 'Daily Score',
    description: 'Mejor puntuación del día',
    icon: 'trophy',
    maxWinnersPerGroup: 3,
    categoryGroups: standardCategoryGroups('ds', (i) => `${67 + i}`),
  },
  {
    id: 'approach',
    name: 'Best Approach',
    shortName: 'Approach',
    description: 'Mejor approach',
    icon: 'award',
    maxWinnersPerGroup: 3,
    categoryGroups: [
      { id: 'ap-camp-aa', name: 'Campeonato + AA', winners: generateWinners('ap-camp', 3, (i) => `${(0.3 + i * 0.2).toFixed(1)}m`) },
      { id: 'ap-a-b', name: 'A + B', winners: generateWinners('ap-ab', 3, (i) => `${(0.4 + i * 0.3).toFixed(1)}m`) },
      { id: 'ap-c-d-e', name: 'C + D + E', winners: generateWinners('ap-cde', 3, (i) => `${(0.5 + i * 0.25).toFixed(1)}m`) },
    ],
  },
  {
    id: 'wager',
    name: 'WAGER',
    shortName: 'WAGER',
    description: 'Premio WAGER',
    icon: 'medal',
    maxWinnersPerGroup: 5,
    categoryGroups: [
      { id: 'wg-all', name: 'General', winners: generateWinners('wg', 5) },
    ],
  },
];

// Simulated API functions - will be replaced with Supabase calls
export const fetchAllCompetitions = async (): Promise<Competition[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCompetitions;
};

export const fetchCompetitionById = async (competitionId: string): Promise<Competition | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockCompetitions.find(c => c.id === competitionId) || null;
};
