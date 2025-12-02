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
  name: string;
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

// Helper to generate mock winners (up to 20 for detail view)
const generateWinners = (prefix: string, count: number, resultFn?: (i: number) => string): CompetitionWinner[] => {
  const clubs = [
    'Club Campestre Monterrey', 'Club de Golf Santa Anita', 'Club Campestre de Querétaro',
    'Club de Golf Vallescondido', 'Club Campestre de León', 'Club de Golf La Hacienda',
    'Club Campestre El Campanario', 'Club de Golf Bosques', 'Club Atlas Colomos',
    'Club Campestre de Celaya', 'Club de Golf Pulgas Pandas', 'Club Campestre Tampico',
    'Club de Golf Malanquín', 'Club de Golf El Cielo', 'Club Campestre Chihuahua',
    'Club de Golf Las Misiones', 'Club Campestre de Saltillo', 'Club de Golf Guadalajara',
    'Club Campestre Torreón', 'Club de Golf San Gil',
  ];
  const names = [
    'Carlos Rodríguez', 'Miguel Ángel Torres', 'Fernando Vega', 'Roberto Sánchez',
    'Alejandro Mendoza', 'Luis Hernández', 'Jorge Martínez', 'Eduardo Castro',
    'Ricardo Flores', 'Pablo Guzmán', 'Antonio López', 'Daniel Ramírez',
    'Sergio Navarro', 'Raúl Jiménez', 'Óscar Pérez', 'Andrés García',
    'Manuel Ortiz', 'Francisco Díaz', 'Javier Morales', 'Arturo Reyes',
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    playerId: `p${prefix}-${i + 1}`,
    playerName: names[i % names.length],
    club: clubs[i % clubs.length],
    result: resultFn ? resultFn(i) : undefined,
  }));
};

// Category group templates with 20 winners each
const standardCategoryGroups = (prefix: string, resultFn?: (i: number) => string): CategoryGroup[] => [
  { id: `${prefix}-camp`, name: 'Campeonato', winners: generateWinners(`${prefix}-camp`, 20, resultFn) },
  { id: `${prefix}-aa-a`, name: 'AA + A', winners: generateWinners(`${prefix}-aa-a`, 20, resultFn) },
  { id: `${prefix}-b-c`, name: 'B + C', winners: generateWinners(`${prefix}-b-c`, 20, resultFn) },
  { id: `${prefix}-d-e`, name: 'D + E', winners: generateWinners(`${prefix}-d-e`, 20, resultFn) },
  { id: `${prefix}-sen`, name: 'Seniors', winners: generateWinners(`${prefix}-sen`, 20, resultFn) },
];

// Mock data
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
    categoryGroups: standardCategoryGroups('ld', (i) => `${315 - i * 5} yds`),
  },
  {
    id: 'straightest_drive',
    name: 'Straightest Drive',
    shortName: 'Straightest',
    description: 'Drive más recto',
    icon: 'flag',
    maxWinnersPerGroup: 1,
    categoryGroups: [
      { id: 'sd-all', name: 'General', winners: generateWinners('sd', 20) },
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
      { id: 'ap-camp-aa', name: 'Campeonato + AA', winners: generateWinners('ap-camp', 20, (i) => `${(0.3 + i * 0.15).toFixed(1)}m`) },
      { id: 'ap-a-b', name: 'A + B', winners: generateWinners('ap-ab', 20, (i) => `${(0.4 + i * 0.2).toFixed(1)}m`) },
      { id: 'ap-c-d-e', name: 'C + D + E', winners: generateWinners('ap-cde', 20, (i) => `${(0.5 + i * 0.18).toFixed(1)}m`) },
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
      { id: 'wg-all', name: 'General', winners: generateWinners('wg', 20) },
    ],
  },
];

// API functions
export const fetchAllCompetitions = async (): Promise<Competition[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCompetitions;
};

export const fetchCompetitionById = async (competitionId: string): Promise<Competition | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockCompetitions.find(c => c.id === competitionId) || null;
};
