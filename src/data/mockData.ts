// Mock data service - Replace with actual API calls
// All data structures are ready for database integration

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  enabled: boolean;
  order: number;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
}

export interface TournamentInfo {
  id: string;
  name: string;
  logoUrl: string;
  heroImageUrl: string;
  startDate: string;
  endDate: string;
  venue: string;
  phone: string;
}

export interface Category {
  id: string;
  name: string;
  handicapMin: number;
  handicapMax: number;
  format: 'STROKE PLAY' | 'STABLEFORD';
  ventajas: string;
  maxPlayers: number;
  rounds: string;
  teeMarker: string;
}

export interface TournamentStats {
  totalParticipants: number;
  holes: number;
  categories: number;
  yearsHistory: number;
}

// Menu Configuration - Binary enabled/disabled from DB
export const menuConfig: MenuItem[] = [
  { id: 'home', label: 'HOME', path: '/', enabled: true, order: 1 },
  { id: 'convocatoria', label: 'CONVOCATORIA', path: '/convocatoria', enabled: true, order: 2 },
  { id: 'eventos', label: 'EVENTOS', path: '/eventos', enabled: true, order: 3 },
  { id: 'jugadores', label: 'JUGADORES', path: '/jugadores', enabled: true, order: 4 },
  { id: 'salidas', label: 'SALIDAS', path: '/salidas', enabled: true, order: 5 },
  { id: 'live-scoring', label: 'LIVE-SCORING', path: '/live-scoring', enabled: false, order: 6 },
  { id: 'resultados', label: 'RESULTADOS', path: '/resultados', enabled: true, order: 7 },
  { id: 'competicion', label: 'COMPETICIÓN', path: '/competicion', enabled: true, order: 8 },
  { id: 'calendario', label: 'CALENDARIO', path: '/calendario', enabled: true, order: 9 },
  { id: 'avisos', label: 'AVISOS', path: '/avisos', enabled: true, order: 10 },
  { id: 'premios', label: 'PREMIOS', path: '/premios', enabled: true, order: 11 },
  { id: 'patrocinadores', label: 'PATROCINADORES', path: '/patrocinadores', enabled: true, order: 12 },
  { id: 'reglas', label: 'REGLAS Y CC', path: '/reglas', enabled: true, order: 13 },
];

export const sponsors: Sponsor[] = [
  { id: '1', name: 'BMW', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png' },
  { id: '2', name: 'Rolex', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Rolex_logo.svg/200px-Rolex_logo.svg.png' },
  { id: '3', name: 'Titleist', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Titleist_wordmark.svg/200px-Titleist_wordmark.svg.png' },
  { id: '4', name: 'Callaway', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Callaway_Golf_Company_logo.svg/200px-Callaway_Golf_Company_logo.svg.png' },
  { id: '5', name: 'TaylorMade', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/TaylorMade_logo.svg/200px-TaylorMade_logo.svg.png' },
  { id: '6', name: 'Ping', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ping_logo.svg/200px-Ping_logo.svg.png' },
];

export const tournamentInfo: TournamentInfo = {
  id: '51',
  name: '51° Torneo Anual de Golf',
  logoUrl: '/tournament-logo.png',
  heroImageUrl: '/hero-golf.jpg',
  startDate: '2025-09-30',
  endDate: '2025-10-04',
  venue: 'Club Campestre Torreón',
  phone: '(52) 871 721 2323',
};

export const categories: Category[] = [
  { id: '1', name: 'CAMPEONATO', handicapMin: -5, handicapMax: 1.8, format: 'STROKE PLAY', ventajas: 'SIN VENTAJAS', maxPlayers: 36, rounds: '54 HOYOS', teeMarker: 'AZULES' },
  { id: '2', name: 'AA', handicapMin: 1.9, handicapMax: 5.3, format: 'STROKE PLAY', ventajas: 'SIN VENTAJAS', maxPlayers: 32, rounds: '54 HOYOS', teeMarker: 'AZULES' },
  { id: '3', name: 'A', handicapMin: 5.4, handicapMax: 9.5, format: 'STABLEFORD', ventajas: 'SIN VENTAJAS', maxPlayers: 40, rounds: '54 HOYOS', teeMarker: 'BLANCAS' },
  { id: '4', name: 'B', handicapMin: 9.6, handicapMax: 13.9, format: 'STABLEFORD', ventajas: 'SIN VENTAJAS', maxPlayers: 36, rounds: '54 HOYOS', teeMarker: 'BLANCAS' },
  { id: '5', name: 'C', handicapMin: 14.0, handicapMax: 18.3, format: 'STABLEFORD', ventajas: 'SIN VENTAJAS', maxPlayers: 36, rounds: '54 HOYOS', teeMarker: 'BLANCAS' },
  { id: '6', name: 'D', handicapMin: 18.4, handicapMax: 22.7, format: 'STABLEFORD', ventajas: 'SIN VENTAJAS', maxPlayers: 32, rounds: '54 HOYOS', teeMarker: 'BLANCAS' },
  { id: '7', name: 'E', handicapMin: 22.8, handicapMax: 32.4, format: 'STABLEFORD', ventajas: 'AL 70%', maxPlayers: 24, rounds: '54 HOYOS', teeMarker: 'BLANCAS' },
  { id: '8', name: 'SENIORS CAMPEONATO', handicapMin: 0.1, handicapMax: 9.4, format: 'STROKE PLAY', ventajas: '80%', maxPlayers: 16, rounds: '54 HOYOS', teeMarker: 'DORADAS' },
  { id: '9', name: 'SENIORS A', handicapMin: 9.5, handicapMax: 18.0, format: 'STABLEFORD', ventajas: '70%', maxPlayers: 20, rounds: '54 HOYOS', teeMarker: 'DORADAS' },
  { id: '10', name: 'SENIORS B', handicapMin: 18.1, handicapMax: 37.9, format: 'STABLEFORD', ventajas: 'AL 70%', maxPlayers: 20, rounds: '54 HOYOS', teeMarker: 'DORADAS' },
  { id: '11', name: 'SUPER SENIORS 70 Y MÁS', handicapMin: 3.5, handicapMax: 33, format: 'STABLEFORD', ventajas: 'AL 70%', maxPlayers: 20, rounds: '54 HOYOS', teeMarker: 'AMARILLAS' },
  { id: '12', name: 'DAMAS 1ra. 2da.', handicapMin: 3.5, handicapMax: 33, format: 'STABLEFORD', ventajas: 'AL 80%', maxPlayers: 32, rounds: '54 HOYOS', teeMarker: 'ROJAS' },
];

export const tournamentStats: TournamentStats = {
  totalParticipants: 344,
  holes: 18,
  categories: 12,
  yearsHistory: 51,
};

export const eligibilityText = "Ser golfista amateur, mayor de 18 años cumplidos al 1° de octubre de 2025, excepto en la categoría Campeonato donde podrán jugar juveniles de 14 a 17 años.";

export const notesText = [
  "Las Damas se dividirán en 2 categorías, de acuerdo al número de participantes y en base al hándicap índice.",
  "Los campeones del Torneo Anual 2022−2023 jugarán en la categoría inmediata superior.",
  "En la categoría Campeonato sólo podrán participar jugadores invitados por el Club.",
  "Las categorías Seniors serán de 60 años cumplidos a la fecha del Torneo. Súper Seniors será de 70 y mayores.",
  "En la categoría que se inscriban menos de 10 jugadores se declarará desierta; sin embargo, los jugadores afectados pasarán a la categoría inmediata superior, siempre y cuando en esta haya cupo.",
  "El cupo máximo del Torneo será de 344 jugadores.",
];

// API simulation functions - replace with actual fetch calls
export const fetchMenuConfig = async (): Promise<MenuItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return menuConfig.filter(item => item.enabled).sort((a, b) => a.order - b.order);
};

export const fetchSponsors = async (): Promise<Sponsor[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return sponsors;
};

export const fetchTournamentInfo = async (): Promise<TournamentInfo> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return tournamentInfo;
};

export const fetchCategories = async (): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return categories;
};

export const fetchTournamentStats = async (): Promise<TournamentStats> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return tournamentStats;
};
