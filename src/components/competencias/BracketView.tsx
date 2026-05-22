/**
 * BracketView
 * ----------------------------------------------------------------------------
 * Render público read-only de uno de los dos brackets putt-finales (M o F).
 *
 * Cambios clave:
 *   - Los brackets > 16 se separan en "Grupo 1..N" (16 jugadores cada uno,
 *     con sus 4 rondas internas: Octavos → Final del grupo).
 *   - Para tamaños 32/64/128 se agrega una sección extra "Gran Final" con
 *     layout bilateral (mitad izquierda, mitad derecha convergen al centro)
 *     y al campeón resaltado arriba en dorado.
 *   - El score de match-play se reemplaza por "G" (ganador) / "-" (perdedor)
 *     en lugar de la distancia (los jugadores son sensibles a ver distancias
 *     comparativas tras perder).
 *   - El buscador hace auto-scroll hacia el primer match donde aparezca el
 *     jugador resaltado.
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Crown } from 'lucide-react';
import { usePuttFinales, type BracketMatch } from '@/hooks/useBrackets';
import PlayerSearchInput from '@/components/shared/PlayerSearchInput';
import { buildUniqueNameSuggestions, matchesPlayerName } from '@/lib/searchUtils';
import { useMemo, useRef, useState } from 'react';

interface BracketViewProps {
  /** 'M' = Caballero, 'F' = Dama */
  sexo: 'M' | 'F';
}

/**
 * Etiqueta de ronda dentro de un grupo: simple "Ronda N" para no confundir a
 * los jugadores con nomenclatura tipo Octavos/Cuartos.
 */
const groupRoundLabel = (round: number, _lastRound: number): string => `Ronda ${round}`;

const BracketView = ({ sexo }: BracketViewProps) => {
  const { data, isLoading, error } = usePuttFinales();
  const side = data?.[sexo];
  /** Texto de búsqueda para resaltar a un jugador en cualquier match del bracket. */
  const [search, setSearch] = useState('');
  /** Refs por matchId → permite hacer scroll automático al primer resultado. */
  const matchRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
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

  /**
   * Scroll al primer match con el jugador SOLO cuando el usuario confirma la
   * búsqueda (selección de sugerencia o Enter). Mientras tipea no salta.
   */
  const handleSearchSubmit = (term: string) => {
    const q = term.trim();
    if (!q || !side?.matches) return;
    const hit = side.matches.find(
      (m) =>
        matchesPlayerName(m.player1_name, q) ||
        matchesPlayerName(m.player2_name, q),
    );
    if (!hit) return;
    setTimeout(() => {
      const el = matchRefs.current.get(hit.id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }, 50);
  };

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
  const totalRounds = Math.log2(Number(config.size));

  /**
   * Champion: ganador del match de la ronda final (si ya está decidido).
   * Se usa para resaltar TODAS sus filas en dorado a través del bracket.
   */
  const finalMatch = matches.find((m) => Number(m.round) === totalRounds);
  const championId: number | null = finalMatch?.winner_id ?? null;
  const championName: string | null =
    championId != null
      ? finalMatch?.player1_id === championId
        ? finalMatch?.player1_name ?? null
        : finalMatch?.player2_name ?? null
      : null;
  const searching = search.trim().length > 0;

  /**
   * Reparto en grupos:
   *   - Seed 16 → un único bracket sin sección Gran Final.
   *   - Seed > 16 (32 / 64 / 128) → la Gran Final SIEMPRE contiene las 2 últimas
   *     rondas (semifinales + final). Por lo tanto los grupos siempre producen
   *     exactamente 4 ganadores (4 semifinalistas).
   *       groupsCount      = 4
   *       groupRoundsCount = totalRounds - 2
   *       groupSize        = size / 4   (8, 16 ó 32 jugadores por grupo)
   *
   * Asignación de matches a grupo según posición:
   *   en la ronda r, hay (size / 2^r) matches en total; cada grupo contiene
   *   (groupSize / 2^r) matches consecutivos (positions ordenadas por la query).
   */
  const size = Number(config.size);
  const hasGrandFinal = size > 16;
  const groupsCount = hasGrandFinal ? 4 : 1;
  const groupRoundsCount = hasGrandFinal ? totalRounds - 2 : totalRounds;
  const groupSize = Math.max(1, Math.floor(size / groupsCount));

  /** Devuelve los matches de un grupo+ronda usando rebanado por posición. */
  const matchesForGroupRound = (group: number, round: number): BracketMatch[] => {
    const perGroup = Math.max(1, Math.floor(groupSize / Math.pow(2, round)));
    const ofRound = matches
      .filter((m) => Number(m.round) === round)
      .sort((a, b) => Number(a.position) - Number(b.position));
    return ofRound.slice(group * perGroup, (group + 1) * perGroup);
  };

  /** Rondas posteriores a las de grupo → Gran Final (siempre semis + final). */
  const grandFinalRounds: number[] = [];
  for (let r = groupRoundsCount + 1; r <= totalRounds; r++) grandFinalRounds.push(r);

  return (
    <div className="space-y-6">
      <PlayerSearchInput
        value={search}
        onChange={setSearch}
        onSubmit={handleSearchSubmit}
        suggestions={nameSuggestions}
        placeholder="Buscar jugador en el bracket..."
        className="max-w-md"
      />

      {/* ============ GRUPOS DE 16 ============ */}
      <div className="space-y-8">
        {Array.from({ length: groupsCount }, (_, g) => (
          <section key={g} className="space-y-3">
            <h3 className="text-base font-bold text-primary">
              {groupsCount === 1 ? 'Bracket' : `Grupo ${g + 1}`}
            </h3>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 min-w-max px-2">
                {Array.from({ length: groupRoundsCount }, (_, i) => i + 1).map((round) => (
                  <div key={round} className="flex flex-col gap-3 min-w-[220px]">
                    <h4 className="text-xs font-bold uppercase text-center text-muted-foreground tracking-wide">
                      {groupRoundLabel(round, groupRoundsCount)}
                    </h4>
                    <div className="flex flex-col gap-3 justify-around flex-1">
                      {matchesForGroupRound(g, round).map((m) => (
                        <MatchCard
                          key={m.id}
                          match={m}
                          highlight={search}
                          championId={championId}
                          dimChampion={searching}
                          registerRef={(el) => matchRefs.current.set(m.id, el)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ============ GRAN FINAL (solo si hay rondas > 4) ============ */}
      {grandFinalRounds.length > 0 && (
        <GrandFinalView
          rounds={grandFinalRounds}
          allMatches={matches}
          totalRounds={totalRounds}
          championId={championId}
          championName={championName}
          highlight={search}
          dimChampion={searching}
          registerRef={(id, el) => matchRefs.current.set(id, el)}
        />
      )}

      {/* ============ CLASIFICADOS (ranking acumulado) ============ */}
      <QualifiersTable
        qualifiers={side.qualifiers ?? []}
        totalSlots={side.bracket_size ?? Number(config.size)}
        sexo={sexo}
      />
    </div>
  );
};

/** Tarjeta de un match — dos filas (player1 / player2) con ganador resaltado. */
const MatchCard = ({
  match,
  highlight,
  championId,
  dimChampion,
  registerRef,
}: {
  match: BracketMatch;
  highlight?: string;
  /** Player id del campeón del bracket (final ya resuelta). */
  championId?: number | null;
  /** Cuando el usuario está buscando, atenuar el resaltado dorado del campeón. */
  dimChampion?: boolean;
  /** Callback para registrar el nodo DOM y permitir scroll automático. */
  registerRef?: (el: HTMLDivElement | null) => void;
}) => {
  const w1 = match.winner_id != null && match.winner_id === match.player1_id;
  const w2 = match.winner_id != null && match.winner_id === match.player2_id;
  /** Marca si la fila coincide con el término de búsqueda activo (resaltado amarillo). */
  const h1 = !!highlight && matchesPlayerName(match.player1_name, highlight);
  const h2 = !!highlight && matchesPlayerName(match.player2_name, highlight);
  /** Resalta TODAS las apariciones del campeón con el mismo dorado del search. */
  const c1 = championId != null && match.player1_id === championId;
  const c2 = championId != null && match.player2_id === championId;

  /**
   * Render del valor del lado derecho: "G" (ganador), "-" (perdedor) o
   * vacío cuando el match aún no está resuelto. No mostramos distancias.
   */
  const resultLabel = (isWinner: boolean): string => {
    if (match.winner_id == null) return '';
    return isWinner ? 'G' : '-';
  };

  const renderRow = (
    name: string | null,
    seed: number | null,
    _score: number | null,
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
        className={`text-sm font-bold tabular-nums w-6 text-center ${
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
        {resultLabel(isWinner) || '–'}
      </span>
    </div>
  );

  return (
    <Card
      ref={registerRef}
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

// ============================================================================
// GrandFinalView — bilateral layout para rondas posteriores a los grupos
// ============================================================================

/**
 * Dibuja la Gran Final con layout simétrico:
 *   - Cada ronda divide sus matches en mitad izquierda y mitad derecha.
 *   - La ronda más avanzada (final) queda en el centro.
 *   - El campeón se muestra arriba con corona dorada.
 */
const GrandFinalView = ({
  rounds,
  allMatches,
  totalRounds,
  championId,
  championName,
  highlight,
  dimChampion,
  registerRef,
}: {
  rounds: number[];
  allMatches: BracketMatch[];
  totalRounds: number;
  championId: number | null;
  championName: string | null;
  highlight?: string;
  dimChampion?: boolean;
  registerRef: (id: number, el: HTMLDivElement | null) => void;
}) => {
  /** matches de cada ronda en orden de posición. */
  const byRound: Record<number, BracketMatch[]> = {};
  for (const r of rounds) {
    byRound[r] = allMatches
      .filter((m) => Number(m.round) === r)
      .sort((a, b) => Number(a.position) - Number(b.position));
  }

  // Excluimos la final del armado izq/der (va en el centro).
  const finalRound = totalRounds;
  const sideRounds = rounds.filter((r) => r !== finalRound);
  const finalMatch = byRound[finalRound]?.[0] ?? null;

  return (
    <section className="space-y-4 border-t-2 border-accent/50 pt-6">
      <div className="text-center grid grid-cols-1 justify-items-center gap-4">
        {/* Título en su propia fila: evita que la tarjeta de campeón lo tape. */}
        <h3 className="w-full text-2xl font-bold text-accent flex items-center justify-center gap-2 leading-none">
          <Crown className="h-6 w-6" /> Gran Final
        </h3>
        {championName && (
          <div className="w-full flex justify-center">
            {/* Badge de campeón en segunda fila con ancho controlado para nombres largos. */}
            <div className="inline-flex max-w-full items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-bold text-lg shadow-md ring-2 ring-accent">
            <Trophy className="h-5 w-5" />
              <span className="min-w-0 truncate">Campeón: {championName}</span>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex items-stretch justify-center gap-4 min-w-max px-2">
          {/* Lado izquierdo: rondas en orden ascendente (R5 → semi izq) */}
          {sideRounds.map((round) => {
            const half = Math.ceil(byRound[round].length / 2);
            const left = byRound[round].slice(0, half);
            return (
              <div key={`L-${round}`} className="flex flex-col gap-3 min-w-[200px]">
                <h4 className="text-xs font-bold uppercase text-center text-muted-foreground tracking-wide">
                  {round === totalRounds - 1 ? 'Semifinal 1' : `Ronda ${round}`}
                </h4>
                <div className="flex flex-col gap-3 justify-around flex-1">
                  {left.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      highlight={highlight}
                      championId={championId}
                      dimChampion={dimChampion}
                      registerRef={(el) => registerRef(m.id, el)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Final central */}
          {finalMatch && (
            <div className="flex flex-col gap-3 min-w-[220px]">
              <h4 className="text-xs font-bold uppercase text-center text-accent tracking-wide">
                Gran Final
              </h4>
              <div className="flex flex-col gap-3 justify-center flex-1">
                <MatchCard
                  match={finalMatch}
                  highlight={highlight}
                  championId={championId}
                  dimChampion={dimChampion}
                  registerRef={(el) => registerRef(finalMatch.id, el)}
                />
              </div>
            </div>
          )}

          {/* Lado derecho: mismas rondas en orden inverso (semi der → R5) */}
          {[...sideRounds].reverse().map((round) => {
            const half = Math.ceil(byRound[round].length / 2);
            const right = byRound[round].slice(half);
            return (
              <div key={`R-${round}`} className="flex flex-col gap-3 min-w-[200px]">
                <h4 className="text-xs font-bold uppercase text-center text-muted-foreground tracking-wide">
                  {round === totalRounds - 1 ? 'Semifinal 2' : `Ronda ${round}`}
                </h4>
                <div className="flex flex-col gap-3 justify-around flex-1">
                  {right.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      highlight={highlight}
                      championId={championId}
                      dimChampion={dimChampion}
                      registerRef={(el) => registerRef(m.id, el)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BracketView;