/**
 * useResultadosFinalesCompeticion
 * -----------------------------------------------------------------------------
 * Hook del reporte imprimible "RESULTADOS FINALES COMPETICIÓN"
 * (Admin → ALIEN SYSTEM → Resultados Finales Competición).
 *
 * Reúne, en BLOQUES imprimibles, los resultados oficiales de:
 *   · O'Yes X            (competencias.php ?tipo=oyes300)
 *   · O'Yes              (competencias.php ?tipo=oyes)
 *   · Driver (distancia) (competencias.php ?tipo=driverd)
 *   · Driver Precisión   (competencias.php ?tipo=driverp)
 *   · Approach           (competencias.php ?tipo=approach)
 *   · Putt               (competencias.php ?tipo=putt) + FINALISTAS de los
 *                        brackets (brackets.php → campeón / subcampeón / 3º)
 *   · Mejor Score del Día (mejor_score_diario.php, Stableford y Stroke Play)
 *
 * No se recalcula nada: cada bloque respeta el orden y los lugares que ya
 * publican las páginas públicas (/competicion).
 */

import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import {
  API_BASE_URL,
  LOGOS_BASE_URL,
  POLL_STATIC,
  getCompetenciaDetailUrl,
} from '@/config/api';
import { getTorneoId } from '@/hooks/useTorneoId';
import { usePuttFinales, type PuttBracketSide } from '@/hooks/useBrackets';
import type { CompetenciaTipo, ColumnConfig } from '@/data/competencias/types';

// ============= Tipos =============

/** Renglón imprimible de un bloque de competición. */
export interface CompeticionFinalRow {
  /** Lugar premiado (o 0 cuando el bloque no maneja posiciones). */
  position: number;
  name: string;
  club: string;
  clubLogo: string;
  /** Categoría del jugador (cuando el reporte la publica). */
  category: string;
  /** Valor principal ya formateado: distancia, yardas, score… */
  value: string;
}

/** Bloque imprimible (una competencia + grupo/premio). */
export interface CompeticionFinalBloque {
  /** Clave estable y url-safe usada en `?bloques=`. */
  key: string;
  /** Nombre de la competencia (encabezado grande del bloque). */
  competencia: string;
  /** Grupo / premio / día dentro de la competencia. */
  groupName: string;
  /** Lugares premiados publicados por el reporte (0 = no aplica). */
  places: number;
  /** Etiqueta de la columna de valor ("Dist.", "Yds", "Score"…). */
  valueLabel: string;
  /** Mostrar columna de categoría. */
  showCategory: boolean;
  rows: CompeticionFinalRow[];
}

// ============= Constantes =============

/** Tipos base de competencia en el orden pedido para el reporte. */
const TIPOS: { tipo: string; label: string }[] = [
  { tipo: 'oyes300', label: "O'Yes X" },
  { tipo: 'oyes', label: "O'Yes" },
  { tipo: 'driverd', label: 'Driver' },
  { tipo: 'driverp', label: 'Driver Precisión' },
  { tipo: 'approach', label: 'Approach' },
  { tipo: 'putt', label: 'Putt' },
];

// ============= Helpers =============

/** Convierte una clave en un fragmento url-safe (sin comas ni espacios). */
const slug = (s: string) =>
  String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

/** Formatea el valor principal según el `format` declarado por el backend. */
const formatValue = (raw: unknown, format?: ColumnConfig['format']): string => {
  if (raw === null || raw === undefined || raw === '') return '';
  const n = Number(raw);
  switch (format) {
    case 'distance':
      return Number.isFinite(n) ? n.toFixed(2) : String(raw);
    case 'distance3':
      return Number.isFinite(n) ? n.toFixed(3) : String(raw);
    case 'yards':
      return Number.isFinite(n) ? `${n.toFixed(1)}` : String(raw);
    case 'percentage':
      return Number.isFinite(n) ? `${n.toFixed(2)}%` : String(raw);
    default:
      return String(raw);
  }
};

/**
 * Columna de valor del reporte: la última columna que no sea posición, club,
 * nombre, categoría u hoyo (normalmente distancia, yardas o score).
 */
const valueColumn = (columns: ColumnConfig[] = []): ColumnConfig | null => {
  const skip = new Set(['position', 'clubLogo', 'club', 'name', 'category', 'hole', 'hoyo']);
  const candidates = columns.filter((c) => !skip.has(c.key));
  return candidates.length ? candidates[candidates.length - 1] : null;
};

/** Logo del club listo para imprimir (evita doble prefijo del proxy). */
const logoUrl = (raw?: string): string => {
  const v = String(raw ?? '');
  if (!v) return '';
  return v.startsWith('http') || v.startsWith('/api/') ? v : `${LOGOS_BASE_URL}${v}`;
};

/** Construye los bloques de una competencia estándar (tabla de lugares). */
const blocksFromCompetencia = (comps: CompetenciaTipo[]): CompeticionFinalBloque[] => {
  const out: CompeticionFinalBloque[] = [];
  comps.forEach((comp) => {
    const col = valueColumn(comp.columns);
    const showCategory = (comp.columns ?? []).some((c) => c.key === 'category');
    (comp.groups ?? []).forEach((g) => {
      // Los brackets de Putt Finales se imprimen aparte (podio de finalistas).
      if (g.bracketSexo) return;
      const players = g.players ?? [];
      if (!players.length) return;
      const rows: CompeticionFinalRow[] = players
        .map((p) => ({
          position: Number(p.position ?? 0),
          name: String(p.name ?? ''),
          club: String(p.club ?? ''),
          clubLogo: logoUrl(p.clubLogo),
          category: String(p.category ?? ''),
          value: formatValue(
            col ? (p as unknown as Record<string, unknown>)[col.key] : undefined,
            col?.format,
          ),
        }))
        // Orden ASCENDENTE de la posición impresa (…3, 2, 1) igual que el
        // reporte final de categorías.
        .sort((a, b) => b.position - a.position);
      out.push({
        key: `c:${slug(comp.id)}:${slug(g.id)}`,
        competencia: comp.name,
        groupName: g.description || g.name,
        places: Number(g.maxPlayers ?? 0) || rows.length,
        valueLabel: col?.label ?? '',
        showCategory,
        rows,
      });
    });
  });
  return out;
};

/** Podio (finalistas) de un bracket de Putt Finales. */
const blockFromBracket = (
  side: PuttBracketSide | undefined,
  label: string,
  keyId: string,
): CompeticionFinalBloque | null => {
  if (!side?.config || !side.matches?.length) return null;
  const third = side.matches.find((m) => Number(m.position) === 99) ?? null;
  const matches = side.matches.filter((m) => Number(m.position) !== 99);
  const totalRounds = Math.log2(Number(side.config.size));
  const finalMatch = matches.find((m) => Number(m.round) === totalRounds);
  const championId = finalMatch?.winner_id ?? null;
  const champion =
    championId != null && finalMatch
      ? finalMatch.player1_id === championId
        ? finalMatch.player1_name
        : finalMatch.player2_name
      : null;
  const runnerUp =
    championId != null && finalMatch
      ? finalMatch.player1_id === championId
        ? finalMatch.player2_name
        : finalMatch.player1_name
      : null;
  const thirdName =
    third && third.winner_id != null
      ? third.winner_id === third.player1_id
        ? third.player1_name
        : third.player2_name
      : null;

  const rows: CompeticionFinalRow[] = [];
  /** Se imprime en orden ascendente: 3, 2, 1. */
  if (thirdName) rows.push({ position: 3, name: thirdName, club: '', clubLogo: '', category: '', value: '3er lugar' });
  if (runnerUp) rows.push({ position: 2, name: runnerUp, club: '', clubLogo: '', category: '', value: 'Sub Campeón' });
  if (champion) rows.push({ position: 1, name: champion, club: '', clubLogo: '', category: '', value: 'Campeón' });
  if (!rows.length) return null;

  return {
    key: `b:${slug(keyId)}`,
    competencia: 'Putt · Finalistas',
    groupName: label,
    places: rows.length,
    valueLabel: 'Premio',
    showCategory: false,
    rows,
  };
};

// ============= Mejor Score del Día =============

/** Jugador del reporte de mejor score. */
interface MejorScorePlayer {
  jugador: string;
  cat: string;
  score: number;
  clubLogo: string;
}

/** Sección (día + premio) del reporte de mejor score. */
interface MejorScoreSection {
  premio: number;
  fecha: string;
  fechaLabel: string;
  stableford: MejorScorePlayer[];
  strokePlay: MejorScorePlayer[];
}

/** Bloques del reporte "Mejor Score del Día" (uno por día y formato). */
const blocksFromMejorScore = (sections: MejorScoreSection[]): CompeticionFinalBloque[] => {
  const out: CompeticionFinalBloque[] = [];
  sections.forEach((s, i) => {
    const build = (players: MejorScorePlayer[], formato: string, id: string) => {
      if (!players.length) return;
      out.push({
        key: `m:${i}:${id}`,
        competencia: 'Mejor Score del Día',
        groupName: `${s.fechaLabel || s.fecha} · ${formato}`,
        places: players.length,
        valueLabel: 'Score',
        showCategory: true,
        rows: players.map((p, idx) => ({
          position: idx + 1,
          name: p.jugador,
          club: '',
          clubLogo: logoUrl(p.clubLogo),
          category: p.cat ?? '',
          value: String(p.score ?? ''),
        })),
      });
    };
    build(s.stableford, 'Stableford', 'stb');
    build(s.strokePlay, 'Stroke Play', 'stroke');
  });
  return out;
};

// ============= Hook principal =============

/**
 * Todos los bloques imprimibles de competición del torneo activo.
 * @returns blocks en el orden del reporte + estado de carga global.
 */
export const useResultadosFinalesCompeticion = () => {
  const tid = getTorneoId();

  /** Detalle (con jugadores) de cada tipo de competencia. */
  const compQueries = useQueries({
    queries: TIPOS.map((t) => ({
      queryKey: ['resultados-finales-competicion', t.tipo, tid],
      queryFn: () => apiFetch<CompetenciaTipo[]>(getCompetenciaDetailUrl(t.tipo)),
      staleTime: POLL_STATIC,
    })),
  });

  /** Mejor Score del Día. */
  const mejorQuery = useQuery<MejorScoreSection[]>({
    queryKey: ['resultados-finales-competicion', 'mejor-score', tid],
    queryFn: () =>
      apiFetch<MejorScoreSection[]>(
        `${API_BASE_URL}/mejor_score_diario.php${tid ? `?torneoid=${tid}` : ''}`,
      ),
    staleTime: POLL_STATIC,
  });

  /** Brackets de Putt Finales (finalistas). */
  const puttFinales = usePuttFinales();

  const blocks = useMemo<CompeticionFinalBloque[]>(() => {
    const out: CompeticionFinalBloque[] = [];
    compQueries.forEach((q) => {
      const data = Array.isArray(q.data) ? q.data : [];
      out.push(...blocksFromCompetencia(data));
    });

    const d = puttFinales.data;
    const bracketBlocks = [
      blockFromBracket(d?.A, 'Putt Finales', 'putt-finales-a'),
      blockFromBracket(d?.M, 'Putt Finales · Caballeros', 'putt-finales-m'),
      blockFromBracket(d?.F, 'Putt Finales · Damas', 'putt-finales-f'),
    ].filter(Boolean) as CompeticionFinalBloque[];
    out.push(...bracketBlocks);

    out.push(...blocksFromMejorScore(Array.isArray(mejorQuery.data) ? mejorQuery.data : []));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compQueries.map((q) => q.dataUpdatedAt).join(','), puttFinales.dataUpdatedAt, mejorQuery.dataUpdatedAt]);

  const isLoading =
    compQueries.some((q) => q.isLoading) || mejorQuery.isLoading || puttFinales.isLoading;

  return { blocks, isLoading };
};
