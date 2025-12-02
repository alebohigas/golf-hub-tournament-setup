// Salidas data - prepared for API/database integration

export interface PlayerInFoursome {
  id: string;
  name: string;
  club: string;
  clubLogo?: string;
  score?: number;
  handicapIndex: number;
}

export interface Foursome {
  id: string;
  hole: number;
  time: string;
  players: PlayerInFoursome[];
}

export interface CategorySalidas {
  categoryId: string;
  categoryName: string;
  day: string;
  foursomes: Foursome[];
}

export interface DaySalidas {
  dayId: string;
  dayName: string;
  date: string;
  categories: CategorySalidas[];
}

// Mock data - replace with API calls
export const mockSalidasData: DaySalidas[] = [
  {
    dayId: '1',
    dayName: 'Día 1',
    date: '30 de Septiembre',
    categories: [
      {
        categoryId: '1',
        categoryName: 'CAMPEONATO',
        day: 'Día 1',
        foursomes: [
          {
            id: 'f1',
            hole: 1,
            time: '12:20',
            players: [
              { id: 'p1', name: 'Gilberto Chavez Ramos', club: 'Herradura', score: 257, handicapIndex: 1.2 },
              { id: 'p2', name: 'Rogelio Brandao', club: 'SCGA', score: 258, handicapIndex: 0.8 },
              { id: 'p3', name: 'Ricardo Castañeda Enriquez', club: 'Tigres', score: 272, handicapIndex: 1.5 },
              { id: 'p4', name: 'Federico Escalante Nuñez', club: 'Tigres', score: 277, handicapIndex: 1.1 },
            ],
          },
          {
            id: 'f2',
            hole: 1,
            time: '12:30',
            players: [
              { id: 'p5', name: 'Luis Geraldo Eboli Villegas', club: 'WAGR', score: 230, handicapIndex: 0.5 },
              { id: 'p6', name: 'Ricardo Samar', club: 'WAGR', score: 231, handicapIndex: 0.9 },
              { id: 'p7', name: 'Eduardo Gallegos', club: 'Herradura', score: 237, handicapIndex: 1.3 },
              { id: 'p8', name: 'Javier Fernandez González', club: 'Tigres', score: 240, handicapIndex: 1.0 },
            ],
          },
          {
            id: 'f3',
            hole: 1,
            time: '12:40',
            players: [
              { id: 'p9', name: 'Guillermo Farias Villarreal', club: 'WAGR', score: 234, handicapIndex: 0.7 },
              { id: 'p10', name: 'Milan Nieto Montes De Oca', club: 'WAGR', score: 234, handicapIndex: 0.6 },
              { id: 'p11', name: 'Mauricio Lopez Dueñes', club: 'CCT', score: 235, handicapIndex: 1.4 },
              { id: 'p12', name: 'Diego Allegre Pedroza', club: 'Tigres', score: 240, handicapIndex: 1.2 },
            ],
          },
        ],
      },
      {
        categoryId: '2',
        categoryName: 'AA',
        day: 'Día 1',
        foursomes: [
          {
            id: 'f4',
            hole: 1,
            time: '13:00',
            players: [
              { id: 'p13', name: 'Carlos Rodriguez Vega', club: 'CCT', score: 245, handicapIndex: 3.2 },
              { id: 'p14', name: 'Miguel Hernández Luna', club: 'CCL', score: 248, handicapIndex: 4.1 },
              { id: 'p15', name: 'Roberto Sanchez Mora', club: 'CCS', score: 251, handicapIndex: 3.8 },
              { id: 'p16', name: 'Fernando Ruiz Garza', club: 'CCT', score: 254, handicapIndex: 4.5 },
            ],
          },
        ],
      },
    ],
  },
  {
    dayId: '2',
    dayName: 'Día 2',
    date: '1 de Octubre',
    categories: [
      {
        categoryId: '1',
        categoryName: 'CAMPEONATO',
        day: 'Día 2',
        foursomes: [
          {
            id: 'f5',
            hole: 10,
            time: '12:20',
            players: [
              { id: 'p1', name: 'Gilberto Chavez Ramos', club: 'Herradura', score: 257, handicapIndex: 1.2 },
              { id: 'p2', name: 'Rogelio Brandao', club: 'SCGA', score: 258, handicapIndex: 0.8 },
              { id: 'p3', name: 'Ricardo Castañeda Enriquez', club: 'Tigres', score: 272, handicapIndex: 1.5 },
              { id: 'p4', name: 'Federico Escalante Nuñez', club: 'Tigres', score: 277, handicapIndex: 1.1 },
            ],
          },
        ],
      },
    ],
  },
  {
    dayId: '3',
    dayName: 'Día 3',
    date: '2 de Octubre',
    categories: [],
  },
];

// API simulation functions
export const fetchSalidasByDay = async (dayId: string): Promise<DaySalidas | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockSalidasData.find(d => d.dayId === dayId);
};

export const fetchAllSalidas = async (): Promise<DaySalidas[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockSalidasData;
};

export const fetchSalidasByCategory = async (dayId: string, categoryId: string): Promise<CategorySalidas | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const day = mockSalidasData.find(d => d.dayId === dayId);
  return day?.categories.find(c => c.categoryId === categoryId);
};
