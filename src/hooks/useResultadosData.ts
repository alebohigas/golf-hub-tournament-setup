/**
 * Results Data Hooks
 * React Query hooks for tournament results
 * Uses POLL_ACTIVE for frequent updates during tournament
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getResultadosUrl, getResultadosCategoryUrl, getResultadosTarjetaUrl, getLiveTarjetaUrl, getTarjetaParejasUrl, POLL_ACTIVE } from '@/config/api';
import type { ResultCategory, RoundScorecard, HoleScore, ScorecardType, CutPlayer } from '@/data/resultadosData';

/**
 * Build a 1-indexed `rounds` array from any `r1`, `r2`, ... `rN` keys returned
 * by the backend. Index `i` corresponds to round `i + 1`. Missing rounds are
 * filled with `null`. `length` is the count of scheduled rounds (`days.length`)
 * when provided, or the highest `r{N}` key found otherwise. This lets the UI
 * render any number of rounds without hardcoding to r1/r2/r3.
 */
const buildRoundsArray = (
  raw: Record<string, any>,
  daysLength?: number,
): Array<number | null> => {
  // Collect all r{N} keys present on the row
  const numericRoundKeys = Object.keys(raw)
    .map((k) => /^r(\d+)$/.exec(k))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => parseInt(m[1], 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  const maxFromKeys = numericRoundKeys.length ? Math.max(...numericRoundKeys) : 0;
  const length = Math.max(daysLength ?? 0, maxFromKeys);
  const out: Array<number | null> = [];
  for (let i = 1; i <= length; i++) {
    const v = raw[`r${i}`];
    out.push(v === undefined || v === null ? null : Number(v));
  }
  return out;
};

// ============= All Results =============

/** Extracts every dynamic round score from an API player object without capping at R3. */
const mapRoundScores = (p: Record<string, unknown> | null | undefined): Record<`r${number}`, number | undefined> => {
  return Object.fromEntries(
    Object.entries(p || {})
      .filter(([key]) => /^r\d+$/.test(key))
      .map(([key, value]) => [key, value == null ? undefined : Number(value)])
  ) as Record<`r${number}`, number | undefined>;
};

/** Extracts every dynamic cut-player round score, preserving null for unplayed rounds. */
const mapCutRoundScores = (p: Record<string, unknown> | null | undefined): Record<`r${number}`, number | null | undefined> => {
  return Object.fromEntries(
    Object.entries(p || {})
      .filter(([key]) => /^r\d+$/.test(key))
      .map(([key, value]) => [key, value == null ? null : Number(value)])
  ) as Record<`r${number}`, number | null | undefined>;
};

/** Fetch all categories with results, including GROSS when enabled */
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

      // Step 2: For each category, fetch NETO results; if gross=1, also fetch GROSS
      const categoriesWithDetails = await Promise.all(
        categories.map(async (cat) => {
          try {
            // Always fetch NETO (gross=0)
            const netoResp = await apiFetch<any>(getResultadosCategoryUrl(cat.categoryId, '0'));
            const netoDaysLen = Array.isArray(netoResp.days) ? netoResp.days.length : undefined;
            const netoPlayers = (netoResp.players || []).map((p: any, idx: number) => ({
              ...mapRoundScores(p),
              id: p.playerId || String(idx),
              position: p.position ?? idx + 1,
              name: p.pairName || p.name || '',
              club: p.club || '',
              clubLogo: p.clubLogo || '',
              clubLogo2: p.clubLogo2 || '',
              partner: p.partner || '',
              pairName: p.pairName || '',
              total: p.total ?? p.totalSA ?? 0,
              handicapIndex: p.handicapIndex,
            }));

            const scoringTypes: Array<{ scoringType: string; players: any[] }> = [
              { scoringType: 'NETO', players: netoPlayers },
            ];

            // If category has gross enabled, also fetch GROSS results
            if (cat.gross === 1) {
              const grosResp = await apiFetch<any>(getResultadosCategoryUrl(cat.categoryId, '1'));
              const grosDaysLen = Array.isArray(grosResp.days) ? grosResp.days.length : undefined;
              const grosPlayers = (grosResp.players || []).map((p: any, idx: number) => ({
                ...mapRoundScores(p),
                id: p.playerId || String(idx),
                position: p.position ?? idx + 1,
                name: p.pairName || p.name || '',
                club: p.club || '',
                clubLogo: p.clubLogo || '',
                clubLogo2: p.clubLogo2 || '',
                partner: p.partner || '',
                pairName: p.pairName || '',
                total: p.total ?? p.totalSO ?? 0,
                handicapIndex: p.handicapIndex,
              }));
              scoringTypes.push({ scoringType: 'GROSS', players: grosPlayers });
            }

            return {
              categoryId: cat.categoryId,
              categoryName: cat.name || '',
              shortName: cat.shortName || '',
              isParejas: !!(cat as any).isParejas || (cat as any).format === 'PAREJAS',
              format: (cat as any).format,
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
 * @param scoringType - NETO or GROSS (determines gross parameter)
 * @param enabled - Whether to enable the query
 */
export const useCategoryResults = (categoryId: string | null, enabled = true, scoringType: string = 'NETO') => {
  const gross: '0' | '1' = scoringType === 'GROSS' ? '1' : '0';

  return useQuery<ResultCategory>({
    queryKey: ['resultados', categoryId, gross],
    queryFn: async () => {
      const raw = await apiFetch<any>(getResultadosCategoryUrl(categoryId!, gross));
      const daysLen = Array.isArray(raw.days) ? raw.days.length : undefined;

      // Normalize into ResultCategory with scoringTypes array
      const scoringTypes = Array.isArray(raw.scoringTypes)
        ? raw.scoringTypes
        : raw.scoringTypes
          ? [raw.scoringTypes]
          : [{
              scoringType: raw.gross === 1 ? 'GROSS' as const : 'NETO' as const,
              players: (raw.players || []).map((p: any, idx: number) => ({
                ...mapRoundScores(p),
                id: p.playerId || String(idx),
                position: p.position ?? idx + 1,
                name: p.pairName || p.name || '',
                club: p.club || '',
                clubLogo: p.clubLogo || '',
                clubLogo2: p.clubLogo2 || '',
                partner: p.partner || '',
                pairName: p.pairName || '',
                total: p.total ?? (raw.gross === 1 ? p.totalSO : p.totalSA) ?? 0,
                // Number of CLOSED scorecards (statlsc=1) — used to compute Stroke diff total.
                closedRounds: typeof p.closedRounds === 'number' ? p.closedRounds : 0,
                handicapIndex: p.handicapIndex,
              })),
            }];

      // Map cut players (non-NORMAL status)
      const cutPlayers: CutPlayer[] = (raw.cutPlayers || []).map((cp: any) => ({
        ...mapCutRoundScores(cp),
        playerId: cp.playerId || '',
        number: cp.number || '',
        name: cp.name || '',
        club: cp.club || '',
        clubLogo: cp.clubLogo || '',
        statusCode: cp.statusCode || 'D',
        statusLabel: cp.statusLabel || 'Descalificado',
        // Accumulated closed-card total
        total: typeof cp.total === 'number' ? cp.total : 0,
        closedRounds: typeof cp.closedRounds === 'number' ? cp.closedRounds : 0,
      }));

      return {
        categoryId: raw.categoryId || categoryId!,
        categoryName: raw.categoryName || '',
        shortName: raw.shortName || '',
        system: raw.system || '',
        isParejas: !!raw.isParejas || (raw.format === 'PAREJAS'),
        format: raw.format,
        days: raw.days || [],
        daysPartial: Array.isArray(raw.daysPartial)
          ? raw.daysPartial.map((v: unknown) => Boolean(v))
          : [],
        // Course par (e.g. 72) — needed to compute Stroke Play differential total
        // from the raw stroke total: diff = total - coursePar * closedRounds.
        coursePar: raw.course?.par ?? 72,
        medalCount: raw.medalCount ?? 3,
        medalCountNeto: raw.medalCountNeto ?? raw.medalCount ?? 3,
        medalCountGross: raw.medalCountGross ?? 1,
        cutPlayers,
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
 * @param scoringType - NETO or GROSS
 */
const mapScorecardType = (system?: string, scoringType?: string): ScorecardType => {
  if (!system) return 'hcp';
  const s = system.toUpperCase();
  if (s.includes('STABLEFORD')) return 'stableford';
  if (scoringType === 'GROSS') return 'scratch';
  return 'hcp';
};

/**
 * Fetch a player's hole-by-hole scorecard from the API
 * @param playerId - Player ID from the results
 * @param categoryId - Category ID
 * @param fecha - Round date (YYYY-MM-DD)
 * @param system - Scoring system (STROKE PLAY, STABLEFORD, etc.)
 * @param scoringType - NETO or GROSS
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
    date: raw.date || '',
    // Last capture timestamp (tarjetas.fecha_cap) — used in /LIVE to show
    // the exact moment the scorecard was last updated.
    fechaCap: raw.fechaCap || undefined,
  };
};

// ============= Live Scorecard =============

// ============= Parejas Scorecard =============

/** Estilos de juego de pareja soportados por la tarjeta detallada. */
export type EstiloJuegoParejas = 'Go Go' | 'Bola Baja' | 'Suma Scores' | 'Personal';

/** Por-hoyo del componente ScorecardParejas. */
export interface ParejaHoleScore {
  hole: number;
  par: number;
  ventaja: number;
  yardaje: number;
  /** Score original del jugador 1 (gross) */
  p1SO: number;
  /** Ventajas (hcp strokes) del jugador 1 en el hoyo */
  p1Hcp: number;
  /** Score original del jugador 2 (gross) */
  p2SO: number;
  /** Ventajas (hcp strokes) del jugador 2 en el hoyo */
  p2Hcp: number;
  /** Neto del equipo (h{n}_a de la tabla tarjetas) */
  neto: number;
  /** Bola baja seleccionada para el hoyo + qué jugador la aportó (1|2|0). */
  bolaBaja: { value: number; fromPlayer: 0 | 1 | 2 };
  /** Suma de scores de ambos jugadores (modo Suma Scores). */
  suma: number;
}

/** Respuesta normalizada de /api/tarjeta_parejas.php para el componente. */
export interface ParejaScorecard {
  estilojuego: EstiloJuegoParejas;
  player1: { id: string; name: string; club: string; logo: string };
  player2: { id: string; name: string; club: string; logo: string };
  holes: ParejaHoleScore[];
  fecha: string;
  campo: string;
  totals: {
    pair: { SO: number; SA: number };
    player1: { SO: number; SA: number };
    player2: { SO: number; SA: number };
  };
}

/**
 * Descarga la tarjeta detallada de una pareja para un día específico.
 * Reemplaza `fetchPlayerScorecardFromApi` cuando la categoría es de parejas.
 */
export const fetchParejasScorecardFromApi = async (
  playerId: string,
  categoryId: string,
  fecha: string,
): Promise<ParejaScorecard> => {
  const raw = await apiFetch<any>(getTarjetaParejasUrl(playerId, categoryId, fecha));
  const holes: ParejaHoleScore[] = [];
  const baseHoles = raw.holes || [];
  const p1SO = raw.player1?.scoreSO || [];
  const p1Hcp = raw.player1?.hcpStrokes || [];
  const p2SO = raw.player2?.scoreSO || [];
  const p2Hcp = raw.player2?.hcpStrokes || [];
  const neto = raw.neto || [];
  const bola = raw.bolaBaja || [];
  const suma = raw.suma || [];
  for (let i = 0; i < 18; i++) {
    const meta = baseHoles[i] || { hole: i + 1, par: 0, ventaja: 0, yardaje: 0 };
    holes.push({
      hole: meta.hole ?? i + 1,
      par: meta.par ?? 0,
      ventaja: meta.ventaja ?? 0,
      yardaje: meta.yardaje ?? 0,
      p1SO: Number(p1SO[i] ?? 0),
      p1Hcp: Number(p1Hcp[i] ?? 0),
      p2SO: Number(p2SO[i] ?? 0),
      p2Hcp: Number(p2Hcp[i] ?? 0),
      neto: Number(neto[i] ?? 0),
      bolaBaja: bola[i] || { value: 0, fromPlayer: 0 },
      suma: Number(suma[i] ?? 0),
    });
  }
  return {
    estilojuego: (raw.estilojuego || 'Personal') as EstiloJuegoParejas,
    player1: {
      id: raw.player1?.id || '',
      name: raw.player1?.name || '',
      club: raw.player1?.club || '',
      logo: raw.player1?.logo || '',
    },
    player2: {
      id: raw.player2?.id || '',
      name: raw.player2?.name || '',
      club: raw.player2?.club || '',
      logo: raw.player2?.logo || '',
    },
    holes,
    fecha: raw.fecha || fecha,
    campo: raw.campo || '',
    totals: raw.totals || { pair: { SO: 0, SA: 0 }, player1: { SO: 0, SA: 0 }, player2: { SO: 0, SA: 0 } },
  };
};

/**
 * Fetch a player's live (real-time) scorecard from live_tarjeta.php
 * Maps the flat response into the same RoundScorecard structure used by Resultados
 * @param playerId - Player ID
 * @param tipo - Scoring type: stroke | stableford
 * @param scoringType - NETO or GROSS (for display purposes)
 */
export const fetchLiveScorecardFromApi = async (
  playerId: string,
  tipo: string,
  scoringType: string = 'NETO',
  categoryId?: string
): Promise<RoundScorecard> => {
  const scType = tipo === 'stableford' ? 'stableford' : (scoringType === 'GROSS' ? 'scratch' : 'hcp');

  const url = getLiveTarjetaUrl(playerId, tipo, categoryId);
  const raw = await apiFetch<any>(url);

  // Parse par and actual player handicap-stroke arrays from the response
  const parArr: number[] = raw.par || [];
  const ventajasArr: number[] = raw.ventajas || [];
  const hcpArr: number[] = raw.hcp || [];
  const holesSOArr: (number | null)[] = raw.holes || [];
  const holesSAArr: (number | null)[] = raw.holesSA || [];

  const isStableford = scType === 'stableford';

  // Map into HoleScore[]
  const holes: HoleScore[] = [];
  for (let i = 0; i < 18; i++) {
    const par = parArr[i] ?? 0;
    const golpes = holesSOArr[i] ?? 0;
    const hcpStrokes = ventajasArr[i] ?? 0;
    const scoreSA = holesSAArr[i] ?? 0;
    const diff = golpes - par;

    const neto = isStableford ? (golpes - hcpStrokes) : scoreSA;
    const puntos = isStableford ? scoreSA : undefined;

    holes.push({
      hoyo: i + 1,
      par,
      hcp: hcpArr[i] ?? 0,
      golpes,
      neto,
      hcpStrokes,
      puntos,
      resultado: diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`,
    });
  }

  const front9 = holes.slice(0, 9);
  const back9 = holes.slice(9, 18);

  const totalNeto = isStableford
    ? holes.reduce((s, h) => s + h.neto, 0)
    : (raw.totals?.SA ?? holes.reduce((s, h) => s + h.neto, 0));
  const totalPuntos = isStableford
    ? (raw.totals?.SA ?? holes.reduce((s, h) => s + (h.puntos || 0), 0))
    : undefined;

  return {
    round: 0,
    scorecardType: scType,
    holes,
    totalGolpes: raw.totals?.SO ?? holes.reduce((s, h) => s + h.golpes, 0),
    totalNeto,
    totalPuntos,
    out: raw.totals?.outSO ?? front9.reduce((s, h) => s + h.golpes, 0),
    in: raw.totals?.inSO ?? back9.reduce((s, h) => s + h.golpes, 0),
    date: raw.date || '',
    // Last capture timestamp (tarjetas.fecha_cap) for live cards.
    fechaCap: raw.fechaCap || undefined,
  };
};
