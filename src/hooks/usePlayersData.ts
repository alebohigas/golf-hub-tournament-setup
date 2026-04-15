/**
 * Players Data Hooks
 * React Query hooks for player data and categories
 * Uses POLL_SLOW since player lists change infrequently
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getCategoriesUrl, getPlayersApiUrl, POLL_SLOW } from '@/config/api';
import type { Player, CategoryDetail } from '@/data/playersData';

// ============= Types =============

/** API response format for players endpoint */
interface PlayersApiResponse {
  players: {
    id: string;
    numjugador: string;
    jugador: string;
    logo: string;
    hi: string;
    hj: string;
    hn: string;
  }[];
  fechaHandicap: string;  // Handicap date for the category (empty or YYYY-MM-DD)
}

// ============= Categories =============

/** Fetch all tournament categories from categories.php */
export const useCategories = () => {
  return useQuery<CategoryDetail[]>({
    queryKey: ['categories'],
    queryFn: () => apiFetch<CategoryDetail[]>(getCategoriesUrl()),
    staleTime: POLL_SLOW,
    refetchInterval: POLL_SLOW,
  });
};

// ============= Players by Category =============

/**
 * Fetch players for a specific category
 * @param catId - Category ID (categoria_id from DB)
 * @param enabled - Whether to enable the query
 */
export const usePlayers = (catId: string | null, enabled = true) => {
  return useQuery<{ players: Player[]; fechaHandicap: string }>({
    queryKey: ['players', catId],
    queryFn: async () => {
      if (!catId) return { players: [], fechaHandicap: '' };
      const data = await apiFetch<PlayersApiResponse>(getPlayersApiUrl(catId));

      // Transform API response to Player format and sort alphabetically by first name
      const players = (data.players || []).map(p => ({
        id: p.id,
        clubLogo: p.logo,
        name: p.jugador,
        handicapIndex: parseFloat(p.hi) || 0,
        handicapJuego: parseFloat(p.hj) || 0,
        handicapNeto: parseFloat(p.hn) || 0,
        categoryId: catId,
      })).sort((a, b) => a.name.localeCompare(b.name, 'es'));

      return { players, fechaHandicap: data.fechaHandicap || '' };
    },
    enabled: enabled && !!catId,
    staleTime: POLL_SLOW,
    refetchInterval: POLL_SLOW,
  });
};
