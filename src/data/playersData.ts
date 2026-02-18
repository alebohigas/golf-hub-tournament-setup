/**
 * Players data module
 * Handles fetching player data from webservice API
 * Prepared for API/database integration
 */

import { getPlayersApiUrl, getLogoUrl } from '@/config/api';

// ============= API Response Interface =============
// Represents the raw player data from the webservice
interface ApiPlayer {
  id: string;
  numjugador: string;
  jugador: string;       // Player name
  logo: string;          // Logo filename
  hi: string;            // Handicap Index (string from API)
  hc: string;            // Handicap de Juego (string from API)
  hn: string;            // Handicap Neto (string from API)
}

// ============= Player Interface =============
// Represents a player with club logo URL instead of text
export interface Player {
  id: string;
  clubLogo: string;      // Full URL of the club logo image
  name: string;          // Player full name
  handicapIndex: number; // HI - Handicap Index
  handicapJuego: number; // HJ - Handicap de Juego
  handicapNeto: number;  // HN - Handicap Neto
  categoryId: string;    // Category ID reference
}

// ============= Category Interface =============
// Represents a tournament category with API mapping
export interface CategoryDetail {
  id: string;              // Internal ID
  apiCatId: string;        // Webservice category ID (catid parameter)
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

// ============= Categories with API ID Mapping =============
// apiCatId maps to the webservice catid parameter
// TODO: Update these apiCatId values to match your webservice category IDs
export const categoriesWithPlayers: CategoryDetail[] = [
  { id: '1', apiCatId: '6107', name: 'CAMPEONATO', shortName: 'Camp', teeSalida: 'AZULES', rating: 72.4, slope: 130, par: 71, format: 'STROKE PLAY', handicapMin: -5, handicapMax: 1.8, handicapPercentage: '0%', playerCount: 32 },
  { id: '2', apiCatId: '6108', name: 'AA', shortName: 'AA', teeSalida: 'AZULES', rating: 72.4, slope: 130, par: 71, format: 'STROKE PLAY', handicapMin: 1.9, handicapMax: 5.3, handicapPercentage: '0%', playerCount: 28 },
  { id: '3', apiCatId: '6109', name: 'A', shortName: 'A', teeSalida: 'BLANCAS', rating: 70.2, slope: 125, par: 71, format: 'STABLEFORD', handicapMin: 5.4, handicapMax: 9.5, handicapPercentage: '0%', playerCount: 48 },
  { id: '4', apiCatId: '6110', name: 'B', shortName: 'B', teeSalida: 'BLANCAS', rating: 70.2, slope: 125, par: 71, format: 'STABLEFORD', handicapMin: 9.6, handicapMax: 13.9, handicapPercentage: '0%', playerCount: 40 },
  { id: '5', apiCatId: '6111', name: 'C', shortName: 'C', teeSalida: 'BLANCAS', rating: 70.2, slope: 125, par: 71, format: 'STABLEFORD', handicapMin: 14.0, handicapMax: 18.3, handicapPercentage: '0%', playerCount: 40 },
  { id: '6', apiCatId: '6112', name: 'D', shortName: 'D', teeSalida: 'BLANCAS', rating: 70.2, slope: 125, par: 71, format: 'STABLEFORD', handicapMin: 18.4, handicapMax: 22.7, handicapPercentage: '0%', playerCount: 29 },
  { id: '7', apiCatId: '6113', name: 'E', shortName: 'E', teeSalida: 'BLANCAS', rating: 70.2, slope: 125, par: 71, format: 'STABLEFORD', handicapMin: 22.8, handicapMax: 32.4, handicapPercentage: '70%', playerCount: 27 },
  { id: '8', apiCatId: '6114', name: 'SENIORS CAMPEONATO', shortName: 'Sr Cam', teeSalida: 'DORADAS', rating: 68.5, slope: 120, par: 71, format: 'STROKE PLAY', handicapMin: 0.1, handicapMax: 9.4, handicapPercentage: '80%', playerCount: 12 },
  { id: '9', apiCatId: '6115', name: 'SENIORS A', shortName: 'Sen A', teeSalida: 'DORADAS', rating: 68.5, slope: 120, par: 71, format: 'STABLEFORD', handicapMin: 9.5, handicapMax: 18.0, handicapPercentage: '70%', playerCount: 26 },
  { id: '10', apiCatId: '6116', name: 'SENIORS B', shortName: 'Sen B', teeSalida: 'DORADAS', rating: 68.5, slope: 120, par: 71, format: 'STABLEFORD', handicapMin: 18.1, handicapMax: 37.9, handicapPercentage: '70%', playerCount: 13 },
  { id: '11', apiCatId: '6117', name: 'SUPER SENIORS', shortName: 'Sup Sr', teeSalida: 'AMARILLAS', rating: 66.8, slope: 115, par: 71, format: 'STABLEFORD', handicapMin: 3.5, handicapMax: 33, handicapPercentage: '70%', playerCount: 16 },
  { id: '12', apiCatId: '6118', name: 'DAMAS 1ra', shortName: 'Dam A', teeSalida: 'ROJAS', rating: 71.5, slope: 128, par: 72, format: 'STABLEFORD', handicapMin: 3.5, handicapMax: 18.0, handicapPercentage: '80%', playerCount: 13 },
  { id: '13', apiCatId: '6119', name: 'DAMAS 2da', shortName: 'Dam B', teeSalida: 'ROJAS', rating: 71.5, slope: 128, par: 72, format: 'STABLEFORD', handicapMin: 18.1, handicapMax: 33.0, handicapPercentage: '80%', playerCount: 14 },
];

// ============= Mock Players Data (Fallback) =============
// Used when API is unavailable - includes clubLogo URLs
/** SVG placeholder for mock club logos */
const mockLogoSvg = (text: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23166534" rx="4"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10" font-family="sans-serif">${text}</text></svg>`)}`;

const mockPlayers: Player[] = [
  // CAMPEONATO
  { id: '1', clubLogo: mockLogoSvg('CCT'), name: 'Juan García López', handicapIndex: 1.2, handicapJuego: 1, handicapNeto: 0, categoryId: '1' },
  { id: '2', clubLogo: mockLogoSvg('CCT'), name: 'Pedro Martínez Silva', handicapIndex: 0.8, handicapJuego: 1, handicapNeto: 0, categoryId: '1' },
  { id: '3', clubLogo: mockLogoSvg('CCL'), name: 'Carlos Rodríguez Vega', handicapIndex: 1.5, handicapJuego: 2, handicapNeto: 0, categoryId: '1' },
  // AA
  { id: '4', clubLogo: mockLogoSvg('CCT'), name: 'Miguel Hernández', handicapIndex: 3.5, handicapJuego: 4, handicapNeto: 3, categoryId: '2' },
  { id: '5', clubLogo: mockLogoSvg('CCS'), name: 'Roberto Sánchez', handicapIndex: 4.2, handicapJuego: 5, handicapNeto: 4, categoryId: '2' },
  // A
  { id: '6', clubLogo: mockLogoSvg('CCT'), name: 'Luis González', handicapIndex: 7.2, handicapJuego: 8, handicapNeto: 6, categoryId: '3' },
  { id: '7', clubLogo: mockLogoSvg('CCL'), name: 'Fernando Ruiz', handicapIndex: 8.5, handicapJuego: 9, handicapNeto: 7, categoryId: '3' },
  // B
  { id: '8', clubLogo: mockLogoSvg('CCT'), name: 'Antonio López', handicapIndex: 11.5, handicapJuego: 13, handicapNeto: 10, categoryId: '4' },
  // C
  { id: '9', clubLogo: mockLogoSvg('CCT'), name: 'José Ramírez', handicapIndex: 16.0, handicapJuego: 18, handicapNeto: 14, categoryId: '5' },
  // SENIORS A
  { id: '10', clubLogo: mockLogoSvg('CCT'), name: 'Ricardo Moreno', handicapIndex: 12.3, handicapJuego: 14, handicapNeto: 10, categoryId: '9' },
];

// ============= API Functions =============

/**
 * Fetch all categories
 * Returns mock data (can be extended to fetch from API)
 */
export const fetchCategories = async (): Promise<CategoryDetail[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return categoriesWithPlayers;
};

/**
 * Transform API player data to internal Player format
 * @param apiPlayer - Raw player data from API
 * @param categoryId - Category ID to assign
 */
const transformApiPlayer = (apiPlayer: ApiPlayer, categoryId: string): Player => ({
  id: apiPlayer.id,
  clubLogo: getLogoUrl(apiPlayer.logo),
  name: apiPlayer.jugador,
  handicapIndex: parseFloat(apiPlayer.hi) || 0,
  handicapJuego: parseFloat(apiPlayer.hc) || 0,
  handicapNeto: parseFloat(apiPlayer.hn) || 0,
  categoryId: categoryId,
});

/**
 * Fetch players by category from webservice
 * Falls back to mock data if API fails
 * @param categoryId - The category ID to filter players (maps to catid in API)
 */
/**
 * Fetch players by category from webservice
 * Uses the apiCatId to call the webservice
 * @param category - The category object with apiCatId for API calls
 */
export const fetchPlayersByCategory = async (category: CategoryDetail): Promise<Player[]> => {
  try {
    // Use apiCatId for webservice call
    const response = await fetch(getPlayersApiUrl(category.apiCatId));
    
    if (!response.ok) {
      throw new Error('API response not ok');
    }
    
    const data = await response.json();
    
    // Expected format: { players: ApiPlayer[] }
    if (data.players && Array.isArray(data.players)) {
      return data.players.map((p: ApiPlayer) => transformApiPlayer(p, category.id));
    }
    
    // If response is array directly
    if (Array.isArray(data)) {
      return data.map((p: ApiPlayer) => transformApiPlayer(p, category.id));
    }
    
    throw new Error('Invalid data format');
  } catch (error) {
    // Fallback to mock data if API fails
    console.warn('Failed to fetch from API, using mock data:', error);
    return mockPlayers.filter(p => p.categoryId === category.id);
  }
};

/**
 * Fetch total player count
 * Returns sum from categories
 */
export const fetchTotalPlayers = async (): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return categoriesWithPlayers.reduce((sum, cat) => sum + cat.playerCount, 0);
};
