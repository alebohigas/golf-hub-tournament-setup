/**
 * BracketView (Match Play)
 * ---------------------------------------------------------------------------
 * Render del bracket de una categoría Match Play. Replica el estilo y la
 * lógica de /competicion → BracketView:
 *
 *   - Tamaño del bracket inferido de `matchId % 100` (mayor offset → size).
 *     16 jugadores → matchIds 1..15 (1..8 octavos, 9..12 cuartos, 13..14
 *     semis, 15 final). Las rondas vacías SE MUESTRAN igual (placeholders).
 *   - Etiquetas Octavos / Cuartos / Semifinales / Final / 16avos / 32avos
 *     se asignan según `fromEnd = totalRounds - roundIndex`.
 *   - Si hay ≥ 3 rondas, las últimas DOS (semis + final) se sacan a una
 *     sección "Gran Final" con layout bilateral que converge al centro.
 *   - Ganador: la API devuelve `winner = 1 | 2` (lado). Se resalta la fila
 *     con dorado/primary, label "G" / "-", y el nombre del campeón en grande
 *     arriba de la Gran Final.
 *   - El modo admin agrega botones "Ganó" y "Resetear".
 */
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, RotateCcw, Trophy, User2 } from 'lucide-react';
import { type BracketMatch } from '@/hooks/useMatchPlay';

interface BracketViewProps {
  matches: BracketMatch[];
  admin?: boolean;
  /** En admin pasamos el sideIndex (1 o 2). El padre construye el body. */
  onSetWinner?: (match: BracketMatch, side: 1 | 2) => void;
  onReset?: (match: BracketMatch) => void;
  busyMatchId?: number | null;
}

// ============= helpers de tamaño / rondas =================================

/** Devuelve el offset interno del match (1..N-1) sin el centenar D1/D2. */
const offset = (mid: number) => mid % 100;

/** Siguiente potencia de 2 ≥ n. */
const nextPow2 = (n: number) => {
  let s = 2;
  while (s - 1 < n) s *= 2;
  return s;
};

/** Etiqueta de ronda según cuántas rondas restan (fromEnd 1 = Final). */
const roundLabel = (fromEnd: number) => {
  if (fromEnd === 1) return 'Final';
  if (fromEnd === 2) return 'Semifinales';
  if (fromEnd === 3) return 'Cuartos';
  if (fromEnd === 4) return 'Octavos';
  if (fromEnd === 5) return '16avos';
  if (fromEnd === 6) return '32avos';
  return `Ronda ${fromEnd}`;
};

/**
 * Calcula rondas de tamaño completo (incluye placeholders cuando no hay
 * match registrado). Devuelve un array donde cada entrada es la lista de
 * matches en orden, rellenando con `null` cuando aún no se generó.
 */
const buildFullRounds = (matches: BracketMatch[]): (BracketMatch | null)[][] => {
  if (!matches.length) return [];
  const maxOff = Math.max(...matches.map(m => offset(m.matchId)));
  const size = nextPow2(maxOff + 1); // 8/16/32/...
  const totalRounds = Math.log2(size);
  const base = matches[0].matchId >= 200 ? 200 : 100; // D1=100, D2=200
  const byOff = new Map(matches.map(m => [offset(m.matchId), m]));
  const rounds: (BracketMatch | null)[][] = [];
  let start = 1;
  let perRound = size / 2;
  for (let r = 0; r < totalRounds; r++) {
    const slice: (BracketMatch | null)[] = [];
    for (let i = 0; i < perRound; i++) {
      const off = start + i;
      slice.push(byOff.get(off) ?? null);
      // Nota: el matchId real sería base + off — se usa solo si hay match.
      void base;
    }
    rounds.push(slice);
    start += perRound;
    perRound = Math.floor(perRound / 2);
  }
  return rounds;
};

// ============= MatchCard ==================================================

/** True si la fila playerSide (1|2) es el ganador del match. */
const isWinnerSide = (m: BracketMatch | null, side: 1 | 2) =>
  !!m && m.winner != null && String(m.winner) === String(side);

/** Devuelve el nombre del lado ganador (o null si no hay ganador). */
const championOfMatch = (m: BracketMatch | null): string | null => {
  if (!m || m.winner == null) return null;
  return String(m.winner) === '1' ? m.player1.name : m.player2.name;
};

/** Fila individual con logo + nombre + badge G/-. */
const Row = ({
  match,
  side,
  admin,
  onSetWinner,
  busy,
}: {
  match: BracketMatch;
  side: 1 | 2;
  admin?: boolean;
  onSetWinner?: (side: 1 | 2) => void;
  busy?: boolean;
}) => {
  const player = side === 1 ? match.player1 : match.player2;
  const winner = isWinnerSide(match, side);
  const decided = match.winner != null;
  const empty = !player.id;

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 gap-2 ${
        winner ? 'bg-primary/10' : ''
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {player.clubLogo ? (
          <img src={player.clubLogo} alt={player.club || ''} className="h-5 w-5 object-contain shrink-0" loading="lazy" />
        ) : (
          <User2 className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span
          className={`truncate text-sm ${
            winner ? 'font-bold text-primary' : ''
          }`}
        >
          {player.name || <span className="italic text-muted-foreground">— por definir —</span>}
        </span>
      </div>
      {/* Badge G/- a la derecha (como /competicion). */}
      <span
        className={`text-sm font-bold tabular-nums w-6 text-center ${
          winner ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {decided ? (winner ? 'G' : '-') : '–'}
      </span>
      {admin && !empty && !winner && onSetWinner && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          disabled={busy}
          onClick={() => onSetWinner(side)}
        >
          Ganó
        </Button>
      )}
    </div>
  );
};

/** Card de un match (o placeholder cuando aún no se generó). */
const MatchCard = ({
  match,
  admin,
  onSetWinner,
  onReset,
  busy,
}: {
  match: BracketMatch | null;
  admin?: boolean;
  onSetWinner?: (m: BracketMatch, side: 1 | 2) => void;
  onReset?: (m: BracketMatch) => void;
  busy?: boolean;
}) => {
  if (!match) {
    return (
      <Card className="border-dashed border-border/50 bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground italic">
        — por definir —
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden divide-y divide-border">
      <div className="px-2 py-1 text-[10px] text-muted-foreground bg-muted/40 flex flex-col gap-0.5">
        <div className="flex justify-between items-center gap-2">
          <span className="font-semibold">
            Match {match.matchId}
            {match.hole ? ` · Hoyo ${match.hole}` : ''}
          </span>
          {match.result && <span className="font-medium">{match.result}</span>}
        </div>
        {match.fecha && (
          <div className="text-[10px] text-muted-foreground/80">{match.fecha}</div>
        )}
      </div>
      <Row match={match} side={1} admin={admin} busy={busy}
        onSetWinner={admin && onSetWinner ? (s) => onSetWinner(match, s) : undefined} />
      <Row match={match} side={2} admin={admin} busy={busy}
        onSetWinner={admin && onSetWinner ? (s) => onSetWinner(match, s) : undefined} />
      {admin && match.winner && onReset && (
        <div className="px-2 py-1 bg-muted/20 flex justify-end">
          <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" disabled={busy} onClick={() => onReset(match)}>
            <RotateCcw className="h-3 w-3" />
            Resetear
          </Button>
        </div>
      )}
    </Card>
  );
};

// ============= Vista principal ============================================

const BracketView = ({ matches, admin, onSetWinner, onReset, busyMatchId }: BracketViewProps) => {
  if (!matches || !matches.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No hay matches registrados para este bracket.
      </p>
    );
  }

  const rounds = buildFullRounds(matches);
  const totalRounds = rounds.length;
  // Si ≥3 rondas, las últimas 2 (semis + final) van a Gran Final bilateral.
  const hasGrandFinal = totalRounds >= 3;
  const groupRoundsCount = hasGrandFinal ? totalRounds - 2 : totalRounds;
  const groupRounds = rounds.slice(0, groupRoundsCount);
  const semisRound = hasGrandFinal ? rounds[totalRounds - 2] : null;
  const finalRound = hasGrandFinal ? rounds[totalRounds - 1] : null;
  const finalMatch = finalRound?.[0] ?? null;
  const championName = championOfMatch(finalMatch ?? null);

  return (
    <div className="space-y-8">
      {/* ============ Rondas previas (columnas) ============ */}
      {groupRounds.length > 0 && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max px-2">
            {groupRounds.map((roundMatches, rIdx) => {
              const fromEnd = totalRounds - rIdx;
              return (
                <div key={rIdx} className="flex flex-col gap-3 min-w-[240px]">
                  <h4 className="text-xs font-bold uppercase text-center text-muted-foreground tracking-wide">
                    {roundLabel(fromEnd)}
                  </h4>
                  <div className="flex flex-col gap-3 justify-around flex-1">
                    {roundMatches.map((m, i) => (
                      <MatchCard
                        key={m?.matchId ?? `ph-${rIdx}-${i}`}
                        match={m}
                        admin={admin}
                        onSetWinner={onSetWinner}
                        onReset={onReset}
                        busy={!!m && busyMatchId === m.matchId}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============ Gran Final (semifinales + final bilateral) ============ */}
      {hasGrandFinal && semisRound && finalRound && (
        <section className="space-y-4 border-t-2 border-accent/50 pt-6">
          <div className="text-center grid grid-cols-1 justify-items-center gap-4">
            <h3 className="w-full text-2xl font-bold text-accent flex items-center justify-center gap-2 leading-none">
              <Crown className="h-6 w-6" /> Gran Final
            </h3>
            {championName && (
              <div className="w-full flex justify-center">
                <div className="inline-flex max-w-full items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-bold text-lg shadow-md ring-2 ring-accent">
                  <Trophy className="h-5 w-5" />
                  <span className="min-w-0 truncate">Campeón: {championName}</span>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="flex items-stretch justify-center gap-4 min-w-max px-2">
              {/* Semifinal izquierda */}
              <div className="flex flex-col gap-3 min-w-[220px]">
                <h4 className="text-xs font-bold uppercase text-center text-muted-foreground tracking-wide">
                  Semifinal 1
                </h4>
                <div className="flex flex-col gap-3 justify-around flex-1">
                  <MatchCard
                    match={semisRound[0] ?? null}
                    admin={admin}
                    onSetWinner={onSetWinner}
                    onReset={onReset}
                    busy={!!semisRound[0] && busyMatchId === semisRound[0]!.matchId}
                  />
                </div>
              </div>

              {/* Final central */}
              <div className="flex flex-col gap-3 min-w-[240px]">
                <h4 className="text-xs font-bold uppercase text-center text-accent tracking-wide">
                  Final
                </h4>
                <div className="flex flex-col gap-3 justify-center flex-1">
                  <MatchCard
                    match={finalMatch}
                    admin={admin}
                    onSetWinner={onSetWinner}
                    onReset={onReset}
                    busy={!!finalMatch && busyMatchId === finalMatch.matchId}
                  />
                </div>
              </div>

              {/* Semifinal derecha */}
              <div className="flex flex-col gap-3 min-w-[220px]">
                <h4 className="text-xs font-bold uppercase text-center text-muted-foreground tracking-wide">
                  Semifinal 2
                </h4>
                <div className="flex flex-col gap-3 justify-around flex-1">
                  <MatchCard
                    match={semisRound[1] ?? null}
                    admin={admin}
                    onSetWinner={onSetWinner}
                    onReset={onReset}
                    busy={!!semisRound[1] && busyMatchId === semisRound[1]!.matchId}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BracketView;