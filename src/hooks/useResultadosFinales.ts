/**
 * useResultadosFinales
 * -----------------------------------------------------------------------------
 * Hooks del reporte imprimible "RESULTADOS FINALES" (Admin → ALIEN SYSTEM).
 *
 *   · useResultadosFinalesCatalogo → categorías del torneo con su avance de
 *     rondas (`concluded = true` cuando todas las rondas están terminadas).
 *   · useResultadosFinalesBloques  → resultados finales de cada bloque
 *     (categoría + formato GROSS/NETO) leídos de `resultados_jug.php`.
 *
 * Los leaderboards NO se recalculan: se reutiliza el endpoint oficial de
 * resultados para que las posiciones y desempates sean idénticos a /resultados.
 */

import { useQueries, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import {
  getResultadosCategoryUrl,
  getResultadosFinalesUrl,
  POLL_STATIC,
} from '@/config/api';

// ============= Tipos =============

/** Categoría del catálogo con su avance de rondas. */
export interface ResultadosFinalesCategoria {
  categoryId: string;
  name: string;
  shortName: string;
  system: string;
  previousSystem: string;
  format: string;
  /** 1 = la categoría también premia GROSS. */
  gross: number;
  rounds: number;
  roundsDone: number;
  concluded: boolean;
}

/** Catálogo completo (encabezado del torneo + categorías). */
export interface ResultadosFinalesCatalogo {
  tournament: string;
  club: string;
  logoHeader: string;
  categories: ResultadosFinalesCategoria[];
}

/** Renglón de resultado final (posición premiada). */
export interface ResultadoFinalRow {
  position: number;
  name: string;
  clubLogo: string;
  club: string;
  total: number;
}

/** Identificador de un bloque del reporte: categoría + formato. */
export interface BloqueKey {
  categoryId: string;
  /** '0' = NETO, '1' = GROSS */
  gross: '0' | '1';
}

/** Bloque renderizable del reporte. */
export interface ResultadosFinalesBloque extends BloqueKey {
  categoryName: string;
  shortName: string;
  /** Sistema a imprimir (STROKE PLAY / STABLEFORD / PAREJAS…). */
  system: string;
  /** GROSS o NETO. */
  formatLabel: 'GROSS' | 'NETO';
  /** Número de lugares premiados. */
  places: number;
  rows: ResultadoFinalRow[];
  isLoading: boolean;
  isError: boolean;
}

// ============= Catálogo =============

/** Categorías del torneo activo con su avance de rondas. */
export const useResultadosFinalesCatalogo = () =>
  useQuery<ResultadosFinalesCatalogo>({
    queryKey: ['resultados-finales-catalogo'],
    queryFn: async () => {
      const d = await apiFetch<any>(getResultadosFinalesUrl());
      return {
        tournament: d?.tournament ?? '',
        club: d?.club ?? '',
        logoHeader: d?.logoHeader ?? '',
        categories: Array.isArray(d?.categories) ? d.categories : [],
      };
    },
    staleTime: POLL_STATIC,
  });

/**
 * Etiqueta del sistema de juego a imprimir.
 * Las categorías de PAREJAS se rotulan como tal; las que pasaron a MATCH PLAY
 * usan el sistema previo (clasificación) porque es el que produjo los scores.
 */
const systemLabel = (raw: any): string => {
  const format = String(raw?.format ?? '').toUpperCase();
  const system = String(raw?.system ?? '').toUpperCase();
  const prev = String(raw?.previousSystem ?? '').toUpperCase();
  const base = system === 'MATCH PLAY' && prev ? prev : system;
  return format === 'PAREJAS' ? `${base} / PAREJAS`.trim() : base;
};

// ============= Bloques del reporte =============

/**
 * Lee los resultados finales de cada bloque solicitado.
 * @param bloques Lista de categoría + formato en el orden en que se imprimen.
 */
export const useResultadosFinalesBloques = (
  bloques: BloqueKey[]
): ResultadosFinalesBloque[] => {
  const results = useQueries({
    queries: bloques.map((b) => ({
      queryKey: ['resultados-finales-bloque', b.categoryId, b.gross],
      queryFn: () =>
        apiFetch<any>(getResultadosCategoryUrl(b.categoryId, b.gross)),
      staleTime: POLL_STATIC,
    })),
  });

  return bloques.map((b, i) => {
    const q = results[i];
    const raw: any = q?.data ?? {};
    const isGross = b.gross === '1';
    const places = Math.max(
      1,
      Number(isGross ? raw?.medalCountGross : raw?.medalCountNeto) ||
        Number(raw?.medalCount) ||
        (isGross ? 1 : 3)
    );
    const players: any[] = Array.isArray(raw?.players) ? raw.players : [];
    const rows: ResultadoFinalRow[] = players
      .filter((p) => Number(p?.position) <= places)
      .map((p) => ({
        position: Number(p?.position ?? 0),
        // En parejas el nombre imprimible es la dupla completa.
        name: String(p?.pairName || p?.name || ''),
        clubLogo: String(p?.clubLogo || ''),
        club: String(p?.club || ''),
        total: Number(p?.total ?? 0),
      }))
      // Orden ASCENDENTE de la posición impresa: 3, 2, 1.
      .sort((a, c) => c.position - a.position);

    return {
      ...b,
      categoryName: String(raw?.categoryName || ''),
      shortName: String(raw?.shortName || ''),
      system: systemLabel(raw),
      formatLabel: isGross ? 'GROSS' : 'NETO',
      places,
      rows,
      isLoading: !!q?.isLoading,
      isError: !!q?.isError,
    };
  });
};
