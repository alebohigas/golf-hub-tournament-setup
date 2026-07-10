/**
 * useShowcaseSlides
 * ----------------------------------------------------------------------------
 * Enumera TODOS los slides disponibles para rotar, leyendo en paralelo:
 *   - /api/showcase300.php?tipo=driver|approach|putt|oyes|oyesx (un slide por
 *     premio con jugadores)
 *   - /api/mejor_score_diario.php (un slide por fecha)
 *   - /api/brackets.php?action=get_putt_finales (slides M/F por
 *     bracket-completo / grupo / semis / final, según size y datos)
 *
 * Usado por:
 *   - AdminShowcaseRotacionPage: para listar checkboxes + segundos por slide.
 *   - ShowcaseRotator (solo el fallback "todo" si no hay hash).
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { API_BASE_URL, POLL_SHOWCASE } from '@/config/api';
import { getTorneoId } from '@/hooks/useTorneoId';
import { usePuttFinales } from '@/hooks/useBrackets';
import { useMatchPlayCategories } from '@/hooks/useMatchPlay';
import { useAllResults } from '@/hooks/useResultadosData';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import {
  buildBracketSlideId,
  buildMejorSlideId,
  buildS300SlideId,
  buildQualSlideId,
  buildMatchPlaySlideId,
  buildResultadosSlideId,
  buildLiveSlideId,
  type ShowcaseSlideMeta,
} from '@/lib/showcaseSlides';

// ============= Tipos auxiliares (subconjunto de las respuestas) =============

/** Subset de /api/showcase300.php usada aquí. */
interface S300Response {
  prizes: { description: string; players: unknown[] }[];
}

/** Subset de /api/mejor_score_diario.php. */
interface MejorResponse {
  fecha: string;
  fechaLabel: string;
  stableford: unknown[];
  strokePlay: unknown[];
}

/** Reportes 300 disponibles (mismo orden que en el admin). */
const TIPOS_300: { tipo: string; label: string }[] = [
  { tipo: 'driver',   label: 'Driver' },
  { tipo: 'driverp',  label: 'Driver Precisión' },
  { tipo: 'approach', label: 'Approach' },
  { tipo: 'putt',     label: 'Putt' },
  { tipo: 'oyes',     label: "O'Yes" },
  { tipo: 'oyesx',    label: 'Oyes-X' },
];

// ============= Hook =============

/**
 * Resultado de useShowcaseSlides — agrupa por sección (para el admin) +
 * la lista plana de todos los slides disponibles.
 */
export interface UseShowcaseSlidesResult {
  isLoading: boolean;
  /** Lista plana en orden de display (300 → mejor → brackets). */
  all: ShowcaseSlideMeta[];
  /** Agrupado por `group` para render en el admin. */
  groups: Record<string, ShowcaseSlideMeta[]>;
}

export const useShowcaseSlides = (): UseShowcaseSlidesResult => {
  const torneoid = getTorneoId() || '';

  // ----- Reportes 300 (uno por tipo) — desenrollado para respetar
  // las rules-of-hooks (no llamar hooks dentro de loops). El orden y
  // longitud de TIPOS_300 es constante. -----
  const make300Query = (tipo: string) =>
    useQuery<S300Response>({
      queryKey: ['showcase300', tipo, torneoid, 'meta'],
      queryFn: () =>
        apiFetch<S300Response>(
          `${API_BASE_URL}/showcase300.php?torneoid=${torneoid}&tipo=${tipo}`,
        ),
      enabled: !!torneoid,
      staleTime: POLL_SHOWCASE,
    });
  const qDriver   = make300Query('driver');
  const qDriverP  = make300Query('driverp');
  const qApproach = make300Query('approach');
  const qPutt     = make300Query('putt');
  const qOyes     = make300Query('oyes');
  const qOyesx    = make300Query('oyesx');
  const s300Queries = [qDriver, qDriverP, qApproach, qPutt, qOyes, qOyesx];

  // ----- Mejor Score Diario -----
  const mejor = useQuery<MejorResponse[]>({
    queryKey: ['mejor-score-diario', torneoid, 'meta'],
    queryFn: () =>
      apiFetch<MejorResponse[]>(
        `${API_BASE_URL}/mejor_score_diario.php?torneoid=${torneoid}`,
      ),
    enabled: !!torneoid,
    staleTime: POLL_SHOWCASE,
  });

  // ----- Brackets putt -----
  const brackets = usePuttFinales();

  // ----- Match Play categorías (un slide por categoría con matches) -----
  const matchplay = useMatchPlayCategories();

  // ----- Resultados (leaderboard clásico Stroke Play / Stableford) -----
  // useAllResults ya excluye categorías MATCH PLAY, así que aquí solo
  // aparecen las que hoy se ven en /resultados.
  const resultados = useAllResults();

  // ----- LIVE (categorías configuradas en /admin como visibles) -----
  // Se toma la misma fuente de verdad que la página /live: las entradas
  // marcadas `enabled: true` en site_config.live_scoring_config. Categorías
  // ocultas desde /admin quedan automáticamente fuera del rotador.
  const siteCfg = useSiteConfig();

  const isLoading =
    s300Queries.some((q) => q.isLoading) ||
    mejor.isLoading ||
    brackets.isLoading ||
    matchplay.isLoading ||
    resultados.isLoading ||
    siteCfg.isLoading;

  // ----- Aplanar -----
  const all: ShowcaseSlideMeta[] = [];
  const groups: Record<string, ShowcaseSlideMeta[]> = {};
  const push = (s: ShowcaseSlideMeta) => {
    all.push(s);
    (groups[s.group] ||= []).push(s);
  };

  // 300 reports: un slide por premio con jugadores
  TIPOS_300.forEach(({ tipo, label }, i) => {
    const q = s300Queries[i];
    const prizes = q.data?.prizes ?? [];
    prizes.forEach((p, idx) => {
      if (!p.players || p.players.length === 0) return;
      push({
        id: buildS300SlideId(tipo, idx),
        label: `${label} — ${p.description}`,
        group: label,
      });
    });
  });

  // Mejor score diario: un slide por fecha con datos
  const seenFechas = new Set<string>();
  (mejor.data ?? []).forEach((sec) => {
    if (seenFechas.has(sec.fecha)) return;
    if (!sec.stableford?.length && !sec.strokePlay?.length) return;
    seenFechas.add(sec.fecha);
    push({
      id: buildMejorSlideId(sec.fecha),
      label: `Mejor Score — ${sec.fechaLabel}`,
      group: 'Mejor Score Diario',
    });
  });

  // Brackets — un slide por grupo / semis / final, por sexo (M y F)
  (['M', 'F'] as const).forEach((sexo) => {
    const side = brackets.data?.[sexo];
    if (!side?.config) return;
    const size = Number(side.config.size);
    const totalRounds = Math.log2(size);
    const matches = side.matches || [];
    const groupLabel = sexo === 'M' ? 'Brackets Caballeros' : 'Brackets Damas';

    // ----- Clasificados al bracket (lista de seeds que ya entraron) -----
    // Slide independiente que muestra cómo se va llenando el cupo 1..N.
    if ((side.qualifiers?.length ?? 0) > 0) {
      push({
        id: buildQualSlideId(sexo),
        label: `Calificados ${sexo === 'M' ? 'Caballeros' : 'Damas'}`,
        group: groupLabel,
      });
    }

    if (size <= 16) {
      // un único slide con el bracket completo
      push({
        id: buildBracketSlideId(sexo, 'full'),
        label: `Bracket completo ${sexo === 'M' ? 'Caballeros' : 'Damas'}`,
        group: groupLabel,
      });
      return;
    }

    // size > 16: 4 grupos, semis y final
    const groupsCount = 4;
    const groupRoundsCount = totalRounds - 2;
    const groupSize = Math.floor(size / groupsCount);

    for (let g = 0; g < groupsCount; g++) {
      // Cada grupo tiene matches en rondas 1..groupRoundsCount
      const hasAnyMatch = matches.some((m) => {
        const r = Number(m.round);
        if (r < 1 || r > groupRoundsCount) return false;
        const perGroup = Math.max(1, Math.floor(groupSize / Math.pow(2, r)));
        const pos = Number(m.position);
        return pos >= g * perGroup && pos < (g + 1) * perGroup;
      });
      if (!hasAnyMatch) continue;
      push({
        id: buildBracketSlideId(sexo, `group${g}`),
        label: `Grupo ${g + 1} — ${sexo === 'M' ? 'Caballeros' : 'Damas'}`,
        group: groupLabel,
      });
    }

    // Semifinales (round = totalRounds - 1)
    const semisRound = totalRounds - 1;
    const semis = matches.filter((m) => Number(m.round) === semisRound);
    const semisHasPlayers = semis.some((m) => m.player1_id || m.player2_id);
    if (semisHasPlayers) {
      push({
        id: buildBracketSlideId(sexo, 'semis'),
        label: `Semifinales — ${sexo === 'M' ? 'Caballeros' : 'Damas'}`,
        group: groupLabel,
      });
    }

    // Final + Campeón (round = totalRounds)
    const finalMatch = matches.find((m) => Number(m.round) === totalRounds);
    if (finalMatch && (finalMatch.player1_id || finalMatch.player2_id)) {
      push({
        id: buildBracketSlideId(sexo, 'final'),
        label: `Final + Campeón — ${sexo === 'M' ? 'Caballeros' : 'Damas'}`,
        group: groupLabel,
      });
    }
  });

  // ----- Match Play: un slide por categoría con al menos 1 match -----
  (matchplay.data ?? []).forEach((cat) => {
    if (!cat.matchCount) return;
    push({
      id: buildMatchPlaySlideId(cat.categoryId),
      label: `Match Play — ${cat.shortName || cat.categoryName}`,
      group: 'Match Play',
    });
  });

  // ----- Resultados: un slide por categoría × scoringType (NETO / GROSS) -----
  // La lista de categorías ya viene filtrada (sin MATCH PLAY). Se emite un
  // slide por cada scoringType que el endpoint declaró disponible para la
  // categoría (siempre NETO, y GROSS si `gross=1`).
  (resultados.data ?? []).forEach((cat) => {
    (cat.scoringTypes ?? []).forEach((st) => {
      const scoring = (st.scoringType as 'NETO' | 'GROSS');
      push({
        id: buildResultadosSlideId(cat.categoryId, scoring),
        label: `Resultados — ${cat.shortName || cat.categoryName} · ${scoring}`,
        group: 'Resultados',
      });
    });
  });

  // ----- LIVE: un slide por categoría habilitada en /admin -----
  // Se respeta el mismo orden que usa la página /live (order asc, luego
  // categoryId asc como desempate).
  const liveEntries = (siteCfg.data?.live_scoring_config ?? [])
    .filter((e) => e.enabled)
    .sort((a, b) => (a.order ?? Number(a.categoryId)) - (b.order ?? Number(b.categoryId)));
  liveEntries.forEach((entry) => {
    const grossFlag = (entry.gross === 1 ? 1 : 0) as 0 | 1;
    const label = `LIVE — ${entry.categoryName}`
      + (grossFlag === 1 ? ' · GROSS' : '');
    push({
      id: buildLiveSlideId(entry.categoryId, entry.tipo, grossFlag),
      label,
      group: 'LIVE',
    });
  });

  return { isLoading, all, groups };
};