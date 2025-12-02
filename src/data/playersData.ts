// Players data - prepared for API/database integration

export interface Player {
  id: string;
  club: string;
  name: string;
  handicapIndex: number;
  handicapJuego: number;
  handicapNeto: number;
  categoryId: string;
}

export interface CategoryDetail {
  id: string;
  name: string;
  shortName: string;
  teeSalida: string;
  rating: number;
  slope: number;
  par: number;
  format: 'STROKE PLAY' | 'STABLEFORD';
  handicapMin: number;
  handicapMax: number;
  handicapPercentage: string;
  playerCount: number;
}

// Mock categories with player counts
export const categoriesWithPlayers: CategoryDetail[] = [
  { id: '1', name: 'CAMPEONATO', shortName: 'Camp', teeSalida: 'AZULES', rating: 72.4, slope: 130, par: 71, format: 'STROKE PLAY', handicapMin: -5, handicapMax: 1.8, handicapPercentage: '0%', playerCount: 32 },
  { id: '2', name: 'AA', shortName: 'AA', teeSalida: 'AZULES', rating: 72.4, slope: 130, par: 71, format: 'STROKE PLAY', handicapMin: 1.9, handicapMax: 5.3, handicapPercentage: '0%', playerCount: 28 },
  { id: '3', name: 'A', shortName: 'A', teeSalida: 'BLANCAS', rating: 70.2, slope: 125, par: 71, format: 'STABLEFORD', handicapMin: 5.4, handicapMax: 9.5, handicapPercentage: '0%', playerCount: 48 },
  { id: '4', name: 'B', shortName: 'B', teeSalida: 'BLANCAS', rating: 70.2, slope: 125, par: 71, format: 'STABLEFORD', handicapMin: 9.6, handicapMax: 13.9, handicapPercentage: '0%', playerCount: 40 },
  { id: '5', name: 'C', shortName: 'C', teeSalida: 'BLANCAS', rating: 70.2, slope: 125, par: 71, format: 'STABLEFORD', handicapMin: 14.0, handicapMax: 18.3, handicapPercentage: '0%', playerCount: 40 },
  { id: '6', name: 'D', shortName: 'D', teeSalida: 'BLANCAS', rating: 70.2, slope: 125, par: 71, format: 'STABLEFORD', handicapMin: 18.4, handicapMax: 22.7, handicapPercentage: '0%', playerCount: 29 },
  { id: '7', name: 'E', shortName: 'E', teeSalida: 'BLANCAS', rating: 70.2, slope: 125, par: 71, format: 'STABLEFORD', handicapMin: 22.8, handicapMax: 32.4, handicapPercentage: '70%', playerCount: 27 },
  { id: '8', name: 'SENIORS CAMPEONATO', shortName: 'Sr Cam', teeSalida: 'DORADAS', rating: 68.5, slope: 120, par: 71, format: 'STROKE PLAY', handicapMin: 0.1, handicapMax: 9.4, handicapPercentage: '80%', playerCount: 12 },
  { id: '9', name: 'SENIORS A', shortName: 'Sen A', teeSalida: 'DORADAS', rating: 68.5, slope: 120, par: 71, format: 'STABLEFORD', handicapMin: 9.5, handicapMax: 18.0, handicapPercentage: '70%', playerCount: 26 },
  { id: '10', name: 'SENIORS B', shortName: 'Sen B', teeSalida: 'DORADAS', rating: 68.5, slope: 120, par: 71, format: 'STABLEFORD', handicapMin: 18.1, handicapMax: 37.9, handicapPercentage: '70%', playerCount: 13 },
  { id: '11', name: 'SUPER SENIORS', shortName: 'Sup Sr', teeSalida: 'AMARILLAS', rating: 66.8, slope: 115, par: 71, format: 'STABLEFORD', handicapMin: 3.5, handicapMax: 33, handicapPercentage: '70%', playerCount: 16 },
  { id: '12', name: 'DAMAS 1ra', shortName: 'Dam A', teeSalida: 'ROJAS', rating: 71.5, slope: 128, par: 72, format: 'STABLEFORD', handicapMin: 3.5, handicapMax: 18.0, handicapPercentage: '80%', playerCount: 13 },
  { id: '13', name: 'DAMAS 2da', shortName: 'Dam B', teeSalida: 'ROJAS', rating: 71.5, slope: 128, par: 72, format: 'STABLEFORD', handicapMin: 18.1, handicapMax: 33.0, handicapPercentage: '80%', playerCount: 14 },
];

// Mock players data - replace with API call
export const mockPlayers: Player[] = [
  // CAMPEONATO
  { id: '1', club: 'CCT', name: 'Juan García López', handicapIndex: 1.2, handicapJuego: 1, handicapNeto: 0, categoryId: '1' },
  { id: '2', club: 'CCT', name: 'Pedro Martínez Silva', handicapIndex: 0.8, handicapJuego: 1, handicapNeto: 0, categoryId: '1' },
  { id: '3', club: 'CCL', name: 'Carlos Rodríguez Vega', handicapIndex: 1.5, handicapJuego: 2, handicapNeto: 0, categoryId: '1' },
  // AA
  { id: '4', club: 'CCT', name: 'Miguel Hernández', handicapIndex: 3.5, handicapJuego: 4, handicapNeto: 3, categoryId: '2' },
  { id: '5', club: 'CCS', name: 'Roberto Sánchez', handicapIndex: 4.2, handicapJuego: 5, handicapNeto: 4, categoryId: '2' },
  // A
  { id: '6', club: 'CCT', name: 'Luis González', handicapIndex: 7.2, handicapJuego: 8, handicapNeto: 6, categoryId: '3' },
  { id: '7', club: 'CCL', name: 'Fernando Ruiz', handicapIndex: 8.5, handicapJuego: 9, handicapNeto: 7, categoryId: '3' },
  // B
  { id: '8', club: 'CCT', name: 'Antonio López', handicapIndex: 11.5, handicapJuego: 13, handicapNeto: 10, categoryId: '4' },
  // C
  { id: '9', club: 'CCT', name: 'José Ramírez', handicapIndex: 16.0, handicapJuego: 18, handicapNeto: 14, categoryId: '5' },
  // SENIORS A
  { id: '10', club: 'CCT', name: 'Ricardo Moreno', handicapIndex: 12.3, handicapJuego: 14, handicapNeto: 10, categoryId: '9' },
];

// API simulation functions
export const fetchCategories = async (): Promise<CategoryDetail[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return categoriesWithPlayers;
};

export const fetchPlayersByCategory = async (categoryId: string): Promise<Player[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockPlayers.filter(p => p.categoryId === categoryId);
};

export const fetchTotalPlayers = async (): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return categoriesWithPlayers.reduce((sum, cat) => sum + cat.playerCount, 0);
};
