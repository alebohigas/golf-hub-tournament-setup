/**
 * BracketView
 * ----------------------------------------------------------------------------
 * Render público read-only de uno de los dos brackets putt-finales (M o F).
 * Selecciona el bracket por `sexo`, hace polling cada POLL_ACTIVE y muestra
 * los rounds left-to-right (R1 → Final) con cada match como una tarjeta.
 *
 * Usado dentro de /competicion cuando el usuario entra a la pseudo-competencia
 * "Putt Finales Caballero" o "Putt Finales Dama" inyectada por competencias.php.
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy } from 'lucide-react';
import { usePuttFinales, type BracketMatch } from '@/hooks/useBrackets';
import PlayerSearchInput from '@/components/shared/PlayerSearchInput';
import { buildUniqueNameSuggestions, matchesPlayerName } from '@/lib/searchUtils';
import { useEffect, useMemo, useRef, useState } from 'react';

interface BracketViewProps {
  /** 'M' = Caballero, 'F' = Dama */
  sexo: 'M' | 'F';
}

/** Etiquetas humanas para cada ronda según total de rondas. */
const roundLabel = (round: number, totalRounds: number): string => {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinal';
  if (fromEnd === 2) return 'Cuartos';
  if (fromEnd === 3) return 'Octavos';
  return `R${round}`;
};

/** Normaliza nombres para comparar la trayectoria del campeón sin depender del ID. */
const normalizedPlayerName = (name: string | null | undefined): string | null => {
  const cleaned = name?.trim();
  return cleaned ? cleaned.toLocaleLowerCase('es-MX') : null;
};

/** Llaves posibles del jugador: ID y nombre, para pintar trayectoria aunque un dato venga inconsistente. */
const playerKeys = (id: number | string | null | undefined, name: string | null | undefined): string[] => {
  const keys: string[] = [];
  if (id !== null && id !== undefined && String(id).trim() !== '') keys.push(`id:${String(id).trim()}`);
  if (name && name.trim() !== '') keys.push(`name:${name.trim().toLocaleLowerCase('es-MX')}`);
  return keys;
};

/** Determina ganador por score: menor valor gana, 0 cuenta como mejor score. */
const scoreWinnerSlot = (score1: number | null, score2: number | null): 1 | 2 | null => {
  if (score1 === null || score2 === null) return null;
  const rounded1 = Number(Number(score1).toFixed(3));
  const rounded2 = Number(Number(score2).toFixed(3));
  if (rounded1 === rounded2) return null;
  return rounded1 < rounded2 ? 1 : 2;
};

/** Ancho compacto base por ronda; sólo se expande a pantalla completa si esto no cabe. */
const COMPACT_ROUND_WIDTH = 280;

/** Separación horizontal equivalente a `gap-2` para decidir si el bracket cabe compacto. */
const ROUND_GAP = 8;

const BracketView = ({ sexo }: BracketViewProps) => {
  const { data, isLoading, error } = usePuttFinales();
  const side = data?.[sexo];
  /** Ref del área disponible para decidir si conviene compactar o expandir el bracket. */
  const bracketAreaRef = useRef<HTMLDivElement | null>(null);
  /** Texto de búsqueda para resaltar a un jugador en cualquier match del bracket. */
  const [search, setSearch] = useState('');
  /** True sólo cuando el formato compacto no cabe y habría columnas escondidas. */
  const [shouldFillWidth, setShouldFillWidth] = useState(false);
  /**
   * Lista única de nombres de jugadores presentes en cualquier match (para autocomplete).
   * Debe declararse ANTES de cualquier `return` condicional para no romper el orden de
   * hooks de React (error #310 cuando data cambia y aparecen/desaparecen hooks).
   */
  const nameSuggestions = useMemo(
    () =>
      buildUniqueNameSuggestions(
        (side?.matches ?? []).flatMap((m) => [m.player1_name, m.player2_name]),
      ),
    [side?.matches],
  );

  /** Total de rondas disponible aun antes de renderizar, para conservar orden de hooks. */
  const totalRounds = side?.config ? Math.log2(side.config.size) : 0;

  /** Mide el contenedor: 16 jugadores o menos conserva formato compacto original. */
  useEffect(() => {
    const el = bracketAreaRef.current;
    if (!el || totalRounds <= 0) return;

    const updateWidthMode = () => {
      if ((side?.config?.size ?? 0) <= 16) {
        setShouldFillWidth(false);
        return;
      }
      const compactWidth = (totalRounds * COMPACT_ROUND_WIDTH) + ((totalRounds - 1) * ROUND_GAP);
      setShouldFillWidth(compactWidth > el.clientWidth);
    };

    updateWidthMode();
    const observer = new ResizeObserver(updateWidthMode);
    observer.observe(el);
    return () => observer.disconnect();
  }, [side?.config?.size, totalRounds]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Cargando bracket...</span>
      </div>
    );
  }

  if (error || !side?.config) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">El bracket aún no se ha generado.</p>
      </div>
    );
  }

  const { matches } = side;

  /** Champion: ganador real de la última ronda visible; se prioriza score menor (0 es mejor). */
  const finalRound = Math.max(...matches.map((m) => m.round));
  const finalMatch = matches.find((m) => m.round === finalRound);
  const finalScoreWinnerSlot = finalMatch
    ? scoreWinnerSlot(finalMatch.player1_score, finalMatch.player2_score)
    : null;
  const finalWinnerSlot = finalScoreWinnerSlot ?? (
    finalMatch?.winner_id != null
      ? String(finalMatch.winner_id) === String(finalMatch.player1_id)
        ? 1
        : String(finalMatch.winner_id) === String(finalMatch.player2_id)
          ? 2
          : null
      : null
  );
  const championKeys = finalMatch && finalWinnerSlot === 1
    ? playerKeys(finalMatch.player1_id, finalMatch.player1_name)
    : finalMatch && finalWinnerSlot === 2
      ? playerKeys(finalMatch.player2_id, finalMatch.player2_name)
      : [];
  const championName = finalMatch && finalWinnerSlot === 1
    ? normalizedPlayerName(finalMatch.player1_name)
    : finalMatch && finalWinnerSlot === 2
      ? normalizedPlayerName(finalMatch.player2_name)
      : null;
  const searching = search.trim().length > 0;

  // Agrupar matches por ronda
  const byRound: Record<number, BracketMatch[]> = {};
  for (const m of matches) {
    if (!byRound[m.round]) byRound[m.round] = [];
    byRound[m.round].push(m);
  }

  return (
    <div className="space-y-4">
      <PlayerSearchInput
        value={search}
        onChange={setSearch}
        suggestions={nameSuggestions}
        placeholder="Buscar jugador en el bracket..."
        className="max-w-md"
      />
      {/*
        Layout responsivo:
        - Móvil/tablet (<md): scroll horizontal con ancho mínimo por columna.
        - Desktop (md+): queda compacto cuando todas las rondas caben; sólo se
          expande a pantalla completa cuando el formato compacto escondería rondas.
        Los nombres NO se truncan: usamos break-words y whitespace-normal para
        mostrarlos completos, ajustándose verticalmente si hace falta.
      */}
      <div ref={bracketAreaRef} className={`overflow-x-auto pb-4 ${shouldFillWidth ? 'relative left-1/2 w-screen -translate-x-1/2 px-2 sm:px-4 lg:px-8' : 'w-full'}`}>
      <div className={`flex gap-2 min-w-max ${shouldFillWidth ? 'md:min-w-0 md:w-full' : 'md:w-max md:mx-auto'}`}>
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => (
          <div key={round} className={`flex flex-col gap-3 min-w-[240px] ${shouldFillWidth ? 'md:min-w-0 md:flex-1 md:basis-0' : 'md:w-[280px] md:min-w-[280px]'}`}>
            <h4 className="text-xs font-bold uppercase text-center text-muted-foreground tracking-wide">
              {roundLabel(round, totalRounds)}
            </h4>
            <div className="flex flex-col gap-3 justify-around flex-1">
              {(byRound[round] ?? []).map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  highlight={search}
                  championKeys={championKeys}
                  championName={championName}
                  dimChampion={searching}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

/** Tarjeta de un match — dos filas (player1 / player2) con ganador resaltado. */
const MatchCard = ({
  match,
  highlight,
  championKeys,
  championName,
  dimChampion,
}: {
  match: BracketMatch;
  highlight?: string;
  /** Llaves estables del campeón del bracket (ID y nombre). */
  championKeys?: string[];
  /** Nombre normalizado del campeón; fallback principal para pintar toda la trayectoria. */
  championName?: string | null;
  /** Cuando el usuario está buscando, atenuar el resaltado dorado del campeón. */
  dimChampion?: boolean;
}) => {
  const w1 = match.winner_id != null && match.winner_id === match.player1_id;
  const w2 = match.winner_id != null && match.winner_id === match.player2_id;
  /** Marca si la fila coincide con el término de búsqueda activo (resaltado amarillo). */
  const h1 = !!highlight && matchesPlayerName(match.player1_name, highlight);
  const h2 = !!highlight && matchesPlayerName(match.player2_name, highlight);
  /** Resalta TODAS las apariciones del campeón con la misma lógica visual del buscador. */
  const championKeySet = new Set(championKeys ?? []);
  const c1 = (championName != null && normalizedPlayerName(match.player1_name) === championName) || playerKeys(match.player1_id, match.player1_name).some((key) => championKeySet.has(key));
  const c2 = (championName != null && normalizedPlayerName(match.player2_name) === championName) || playerKeys(match.player2_id, match.player2_name).some((key) => championKeySet.has(key));

  /** Dorado original del buscador; el campeón se difumina con opacidad al buscar. */
  const goldRow = 'bg-accent ring-2 ring-accent';
  const goldRowDim = 'bg-accent/30';
  const goldText = 'font-bold text-accent-foreground';
  const goldTextDim = 'font-semibold text-accent-foreground/60';

  const renderRow = (
    name: string | null,
    seed: number | null,
    score: number | null,
    isWinner: boolean,
    isHighlighted: boolean,
    isChampion: boolean,
  ) => (
    <div
      className={`flex items-center justify-between px-3 py-2 ${
        isHighlighted
          ? goldRow
          : isChampion
            ? dimChampion
              ? goldRowDim
              : goldRow
            : isWinner
              ? 'bg-primary/10'
              : ''
      }`}
    >
      <div className="flex items-start gap-2 min-w-0 flex-1">
        {seed != null && (
          <Badge variant="outline" className="h-5 px-1.5 text-[10px] shrink-0 mt-0.5">{seed}</Badge>
        )}
        <span
          className={`text-sm min-w-0 break-words whitespace-normal leading-tight ${
            isHighlighted
              ? goldText
              : isChampion && !dimChampion
                ? goldText
                : isChampion && dimChampion
                  ? goldTextDim
                  : isWinner
                    ? 'font-bold text-primary'
                    : ''
          }`}
        >
          {name ?? <span className="text-muted-foreground italic">— por definir —</span>}
        </span>
      </div>
      <span
        className={`text-sm tabular-nums shrink-0 self-start pl-2 ${
          isHighlighted
            ? goldText
            : isChampion && !dimChampion
              ? goldText
              : isChampion && dimChampion
                ? goldTextDim
                : isWinner
                  ? 'font-bold text-primary'
                  : 'text-muted-foreground'
        }`}
      >
        {score ?? '–'}
      </span>
    </div>
  );

  return (
    <Card
      className={`border-border overflow-hidden divide-y divide-border ${
        h1 || h2
          ? 'ring-2 ring-accent shadow-md'
          : (c1 || c2) && !dimChampion
            ? 'ring-2 ring-accent shadow-md'
            : ''
      }`}
    >
      {renderRow(match.player1_name, match.player1_seed, match.player1_score, w1, h1, c1)}
      {renderRow(match.player2_name, match.player2_seed, match.player2_score, w2, h2, c2)}
    </Card>
  );
};

export default BracketView;