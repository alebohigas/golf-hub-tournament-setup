/**
 * Results Data Hooks
 * React Query hooks for tournament results
 * Uses POLL_ACTIVE for frequent updates during tournament
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getResultadosUrl, getResultadosCategoryUrl, getResultadosTarjetaUrl, POLL_ACTIVE } from '@/config/api';
import type { ResultCategory, RoundScorecard, HoleScore, ScorecardType } from '@/data/resultadosData';

// ============= All Results =============

/** Fetch all categories with results, including GROS when enabled */
export const useAllResults = () => {
  return useQuery<ResultCategory[]>({
    queryKey: ['resultados'],
    queryFn: async () => {
      // Step 1: Fetch category list from resultados.php
      const catListResp = await apiFetch<{
        strokePlay?: Array<{ categoryId: string; name: string; shortName?: string; gross?: number; [key: string]: any }>;
        matchPlay?: Array<{ categoryId: string; name: string; shortName?: string; gross?: number; [key: string]: any }>;
      } | Array<{ categoryId: string; name: string; gross?: number; [key: string]: any }>>(getResultadosUrl());

      // Flatten the category list
      let categories: Array<{ categoryId: string; name: string; shortName?: string; gross?: number; [key: string]: any }> = [];
      if (Array.isArray(catListResp)) {
        categories = catListResp;
      } else {
        const sp = catListResp.strokePlay ?? [];
        const mp = catListResp.matchPlay ?? [];
        categories = [...sp, ...mp];
      }

      // Step 2: For each category, fetch NETO results; if gross=1, also fetch GROS
      const categoriesWithDetails = await Promise.all(
        categories.map(async (cat) => {
          try {
            // Always fetch NETO (gross=0)
            const netoResp = await apiFetch<any>(getResultadosCategoryUrl(cat.categoryId, '0'));
            const netoPlayers = (netoResp.players || []).map((p: any, idx: number) => ({
              id: p.playerId || String(idx),
              position: p.position ?? idx + 1,
              name: p.name || '',
              club: p.club || '',
              clubLogo: p.clubLogo || '',
              r1: p.r1 ?? undefined,
              r2: p.r2 ?? undefined,
              r3: p.r3 ?? undefined,
              total: p.total ?? p.totalSA ?? 0,
              handicapIndex: p.handicapIndex,
            }));

            const scoringTypes: Array<{ scoringType: string; players: any[] }> = [
              { scoringType: 'NETO', players: netoPlayers },
            ];

            // If category has gross enabled, also fetch GROS results
            if (cat.gross === 1) {
              const grosResp = await apiFetch<any>(getResultadosCategoryUrl(cat.categoryId, '1'));
              const grosPlayers = (grosResp.players || []).map((p: any, idx: number) => ({
                id: p.playerId || String(idx),
                position: p.position ?? idx + 1,
                name: p.name || '',
                club: p.club || '',
                clubLogo: p.clubLogo || '',
                r1: p.r1 ?? undefined,
                r2: p.r2 ?? undefined,
                r3: p.r3 ?? undefined,
                total: p.total ?? p.totalSO ?? 0,
                handicapIndex: p.handicapIndex,
              }));
              scoringTypes.push({ scoringType: 'GROS', players: grosPlayers });
            }

            return {
              categoryId: cat.categoryId,
              categoryName: cat.name || '',
              shortName: cat.shortName || '',
              scoringTypes,
            } as ResultCategory;
          } catch (err) {
            console.error(`Failed to fetch details for category ${cat.categoryId}:`, err);
            return {
              categoryId: cat.categoryId,
              categoryName: cat.name || '',
              shortName: cat.shortName || '',
              scoringTypes: [],
            } as ResultCategory;
          }
        })
      );

      return categoriesWithDetails;
    },
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });
};

// ============= Category Results =============

/**
 * Fetch results for a specific category and scoring type
 * @param categoryId - Category identifier
 * @param scoringType - NETO or GROS (determines gross parameter)
 * @param enabled - Whether to enable the query
 */
export const useCategoryResults = (categoryId: string | null, enabled = true, scoringType: string = 'NETO') => {
  const gross: '0' | '1' = scoringType === 'GROS' ? '1' : '0';

  return useQuery<ResultCategory>({
    queryKey: ['resultados', categoryId, gross],
    queryFn: async () => {
      const raw = await apiFetch<any>(getResultadosCategoryUrl(categoryId!, gross));

      // Normalize into ResultCategory with scoringTypes array
      const scoringTypes = Array.isArray(raw.scoringTypes)
        ? raw.scoringTypes
        : raw.scoringTypes
          ? [raw.scoringTypes]
          : [{
              scoringType: raw.gross === 1 ? 'GROS' as const : 'NETO' as const,
              players: (raw.players || []).map((p: any, idx: number) => ({
                id: p.playerId || String(idx),
                position: p.position ?? idx + 1,
                name: p.name || '',
                club: p.club || '',
                clubLogo: p.clubLogo || '',
                r1: p.r1 ?? undefined,
                r2: p.r2 ?? undefined,
                r3: p.r3 ?? undefined,
                total: p.total ?? (raw.gross === 1 ? p.totalSO : p.totalSA) ?? 0,
                handicapIndex: p.handicapIndex,
              })),
            }];

      return {
        categoryId: raw.categoryId || categoryId!,
        categoryName: raw.categoryName || '',
        shortName: raw.shortName || '',
        system: raw.system || '',
        days: raw.days || [],
        scoringTypes,
      } as ResultCategory;
    },
    enabled: enabled && !!categoryId,
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });
};

// ============= Player Scorecard =============

/**
 * Map API scoring system string to scorecard tipo parameter
 * @param system - API system value (STROKE PLAY, STABLEFORD, etc.)
 */
const mapSystemToTipo = (system?: string): string => {
  if (!system) return 'stroke';
  const s = system.toUpperCase();
  if (s.includes('STABLEFORD')) return 'stableford';
  return 'stroke';
};

/**
 * Map API scoring system to ScorecardType for display
 * @param system - API system value
 * @param scoringType - NETO or GROS
 */
const mapScorecardType = (system?: string, scoringType?: string): ScorecardType => {
  if (!system) return 'hcp';
  const s = system.toUpperCase();
  if (s.includes('STABLEFORD')) return 'stableford';
  if (scoringType === 'GROS') return 'scratch';
  return 'hcp';
};

/**
 * Fetch a player's hole-by-hole scorecard from the API
 * @param playerId - Player ID from the results
 * @param categoryId - Category ID
 * @param fecha - Round date (YYYY-MM-DD)
 * @param system - Scoring system (STROKE PLAY, STABLEFORD, etc.)
 * @param scoringType - NETO or GROS
 * @param round - Round number (1, 2, 3)
 */
export const fetchPlayerScorecardFromApi = async (
  playerId: string,
  categoryId: string,
  fecha: string,
  system: string,
  scoringType: string,
  round: number
): Promise<RoundScorecard> => {
  const tipo = mapSystemToTipo(system);
  const scType = mapScorecardType(system, scoringType);

  const url = getResultadosTarjetaUrl(playerId, categoryId, fecha, tipo);
  const raw = await apiFetch<any>(url);

  // Map API holes to HoleScore[]
  const holes: HoleScore[] = (raw.holes || []).map((h: any) => {
    const golpes = h.scoreSO ?? 0;
    const par = h.par ?? 0;
    const hcpStrokes = h.hcpStrokes ?? 0;
    const diff = golpes - par;

    // For Stableford: scoreSA = stableford points, neto = gross - hcpStrokes
    // For Stroke: scoreSA = net score
    const isStableford = scType === 'stableford';
    const neto = isStableford ? (golpes - hcpStrokes) : (h.scoreSA ?? golpes);
    const puntos = isStableford ? (h.scoreSA ?? 0) : undefined;

    return {
      hoyo: h.hole,
      par,
      hcp: h.ventaja ?? 0,
      golpes,
      neto,
      hcpStrokes,
      puntos,
      resultado: diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`,
    } as HoleScore;
  });

  const front9 = holes.slice(0, 9);
  const back9 = holes.slice(9, 18);

  const isStableford = scType === 'stableford';
  const totalNeto = isStableford
    ? holes.reduce((s, h) => s + h.neto, 0)
    : (raw.totals?.SA ?? holes.reduce((s, h) => s + h.neto, 0));
  const totalPuntos = isStableford
    ? (raw.totals?.SA ?? holes.reduce((s, h) => s + (h.puntos || 0), 0))
    : undefined;

  return {
    round,
    scorecardType: scType,
    holes,
    totalGolpes: raw.totals?.SO ?? holes.reduce((s, h) => s + h.golpes, 0),
    totalNeto,
    totalPuntos,
    out: raw.totals?.outSO ?? front9.reduce((s, h) => s + h.golpes, 0),
    in: raw.totals?.inSO ?? back9.reduce((s, h) => s + h.golpes, 0),
  };
};
