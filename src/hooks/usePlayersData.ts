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
    hi: string;     // hcpindex from DB
    hj: string;     // indexjgo from DB  
    hn: string;     // handicap neto (calculated)
  }[];
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
  return useQuery<Player[]>({
    queryKey: ['players', catId],
    queryFn: async () => {
      if (!catId) return [];
      const data = await apiFetch<PlayersApiResponse>(getPlayersApiUrl(catId));

      // Transform API response to Player format and sort alphabetically by first name
      return (data.players || []).map(p => ({
        id: p.id,
        clubLogo: p.logo,       // Already full URL from server (proxied via logo.php)
        name: p.jugador,
        handicapIndex: parseFloat(p.hi) || 0,
        handicapJuego: parseFloat(p.hj) || 0,  // Fixed: was p.hc, now p.hj
        handicapNeto: parseFloat(p.hn) || 0,   // Now correctly mapped
        categoryId: catId,
      })).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    },
    enabled: enabled && !!catId,
    staleTime: POLL_SLOW,
    refetchInterval: POLL_SLOW,
  });
};
