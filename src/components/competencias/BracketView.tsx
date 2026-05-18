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
import { useMemo, useState } from 'react';

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

const BracketView = ({ sexo }: BracketViewProps) => {
  const { data, isLoading, error } = usePuttFinales();
  const side = data?.[sexo];
  /** Texto de búsqueda para resaltar a un jugador en cualquier match del bracket. */
  const [search, setSearch] = useState('');
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

  const { config, matches } = side;
  const totalRounds = Math.log2(config.size);

  /**
   * Champion: ganador del match de la ronda final (si ya está decidido).
   * Se usa para resaltar TODAS sus filas en dorado a través del bracket.
   */
  const finalMatch = matches.find((m) => m.round === totalRounds);
  const championId: number | null = finalMatch?.winner_id ?? null;
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
        - Móvil/tablet: scroll horizontal con anchos mínimos por columna (min-w-max).
        - Desktop (lg+): se eliminan los mínimos y se usan columnas flex-1 para que
          TODAS las rondas quepan a lo ancho de la pantalla sin scroll.
      */}
      <div className="overflow-x-auto lg:overflow-visible pb-4">
      <div className="flex gap-3 lg:gap-2 min-w-max lg:min-w-0 lg:w-full px-2">
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => (
          <div key={round} className="flex flex-col gap-3 min-w-[220px] lg:min-w-0 lg:flex-1">
            <h4 className="text-xs font-bold uppercase text-center text-muted-foreground tracking-wide">
              {roundLabel(round, totalRounds)}
            </h4>
            <div className="flex flex-col gap-3 justify-around flex-1">
              {(byRound[round] ?? []).map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  highlight={search}
                  championId={championId}
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
  championId,
  dimChampion,
}: {
  match: BracketMatch;
  highlight?: string;
  /** Player id del campeón del bracket (final ya resuelta). */
  championId?: number | null;
  /** Cuando el usuario está buscando, atenuar el resaltado dorado del campeón. */
  dimChampion?: boolean;
}) => {
  const w1 = match.winner_id != null && match.winner_id === match.player1_id;
  const w2 = match.winner_id != null && match.winner_id === match.player2_id;
  /** Marca si la fila coincide con el término de búsqueda activo (resaltado amarillo). */
  const h1 = !!highlight && matchesPlayerName(match.player1_name, highlight);
  const h2 = !!highlight && matchesPlayerName(match.player2_name, highlight);
  /** Resalta TODAS las apariciones del campeón con el mismo dorado del search. */
  const c1 = championId != null && match.player1_id === championId;
  const c2 = championId != null && match.player2_id === championId;

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
          ? 'bg-accent ring-2 ring-accent'
          : isChampion
            ? dimChampion
              ? 'bg-accent/20'
              : 'bg-accent ring-2 ring-accent'
            : isWinner
              ? 'bg-primary/10'
              : ''
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {seed != null && (
          <Badge variant="outline" className="h-5 px-1.5 text-[10px] shrink-0">{seed}</Badge>
        )}
        <span
          className={`truncate text-sm ${
            isHighlighted
              ? 'font-bold text-accent-foreground'
              : isChampion && !dimChampion
                ? 'font-bold text-accent-foreground'
                : isChampion && dimChampion
                  ? 'font-semibold text-foreground/70'
                  : isWinner
                    ? 'font-bold text-primary'
                    : ''
          }`}
        >
          {name ?? <span className="text-muted-foreground italic">— por definir —</span>}
        </span>
      </div>
      <span
        className={`text-sm tabular-nums ${
          isHighlighted
            ? 'font-bold text-accent-foreground'
            : isChampion && !dimChampion
              ? 'font-bold text-accent-foreground'
              : isChampion && dimChampion
                ? 'font-semibold text-foreground/70'
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