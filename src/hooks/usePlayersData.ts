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
    hc: string;
    hn: string;
  }[];
}

// ============= Categories =============

/** Fetch all tournament categories */
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
 * @param catId - Category API ID
 * @param enabled - Whether to enable the query (for conditional fetching)
 */
export const usePlayers = (catId: string | null, enabled = true) => {
  return useQuery<Player[]>({
    queryKey: ['players', catId],
    queryFn: async () => {
      if (!catId) return [];
      const data = await apiFetch<PlayersApiResponse>(getPlayersApiUrl(catId));
      
      // Transform API response to Player format
      const players = (data.players || []).map(p => ({
        id: p.id,
        clubLogo: p.logo, // Already full URL from server
        name: p.jugador,
        handicapIndex: parseFloat(p.hi) || 0,
        handicapJuego: parseFloat(p.hc) || 0,
        handicapNeto: parseFloat(p.hn) || 0,
        categoryId: catId,
      }));

      return players;
    },
    enabled: enabled && !!catId,
    staleTime: POLL_SLOW,
    refetchInterval: POLL_SLOW,
  });
};
