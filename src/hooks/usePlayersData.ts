/**
 * Players Data Hooks
 * React Query hooks for player data and categories
 * Uses POLL_SLOW since player lists change infrequently
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getCategoriesUrl, getPlayersApiUrl, POLL_SLOW } from '@/config/api';
import type { Player, CategoryDetail, ParejaGroup } from '@/data/playersData';

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
    grupoid?: string;
  }[];
  fechaHandicap: string;  // Handicap date for the category (empty or YYYY-MM-DD)
  /** Bandera de la categoría (formato='PAREJAS'). Si true, el frontend
   *  agrupa por `grupoid` para mostrar parejas. */
  isParejas?: boolean;
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
  return useQuery<{ players: Player[]; fechaHandicap: string; isParejas: boolean; groups: ParejaGroup[] }>({
    queryKey: ['players', catId],
    queryFn: async () => {
      if (!catId) return { players: [], fechaHandicap: '', isParejas: false, groups: [] };
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
        grupoid: (p.grupoid || '').trim(),
      })).sort((a, b) => a.name.localeCompare(b.name, 'es'));

      const isParejas = !!data.isParejas;
      let groups: ParejaGroup[] = [];
      if (isParejas) {
        // Agrupar por grupoid; ordenar grupos por suma de HN ascendente.
        const byGrupo = new Map<string, Player[]>();
        players.forEach((pl) => {
          const key = pl.grupoid || '— Sin grupo —';
          if (!byGrupo.has(key)) byGrupo.set(key, []);
          byGrupo.get(key)!.push(pl);
        });
        groups = Array.from(byGrupo.entries())
          .map(([grupoid, pls]) => ({
            grupoid,
            handicapTotal: pls.reduce((s, p) => s + (p.handicapNeto || 0), 0),
            // Dentro del grupo: HCP neto ascendente para que el de menor HN
            // (el mejor jugador) aparezca arriba.
            players: [...pls].sort((a, b) => a.handicapNeto - b.handicapNeto),
          }))
          .sort((a, b) => a.handicapTotal - b.handicapTotal);
      }

      return { players, fechaHandicap: data.fechaHandicap || '', isParejas, groups };
    },
    enabled: enabled && !!catId,
    staleTime: POLL_SLOW,
    refetchInterval: POLL_SLOW,
  });
};
