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
import { Crown, Medal, RotateCcw, Trophy, User2 } from 'lucide-react';
import { type BracketMatch } from '@/hooks/useMatchPlay';

interface BracketViewProps {
  matches: BracketMatch[];
  admin?: boolean;
  /** En admin pasamos el sideIndex (1 o 2). El padre construye el body. */
  onSetWinner?: (match: BracketMatch, side: 1 | 2) => void;
  onReset?: (match: BracketMatch) => void;
  busyMatchId?: number | null;
}

// Ancho mínimo de cada columna del bracket en pantallas chicas.
// La vista móvil debe comportarse como escritorio con scroll horizontal,
// no comprimir tarjetas ni cortar nombres de jugadores/equipos.
const BRACKET_COLUMN_MIN_WIDTH = 320;

/**
 * Un match cuyo `matchId % 100 === 99` es un match POR 3ER LUGAR
 * (matchx=199 en D1, matchx=299 en D2 si se llegara a usar). Se aparta
 * ANTES de construir las rondas porque rompería la detección del tamaño
 * del bracket (que espera offsets contiguos 1..N-1).
 */
const isThirdPlaceMatch = (m: BracketMatch): boolean => (m.matchId % 100) === 99;

// ============= helpers de tamaño / rondas =================================

/** Devuelve el offset interno del match (1..N-1) sin el centenar D1/D2. */
const offset = (mid: number) => mid % 100;

/**
 * Siguiente potencia de 2 ≥ n.
 * BUG previo: usaba `s - 1 < n`, lo que para n ya potencia de 2 (ej. 16)
 * devolvía el doble (32). Eso hacía que con un bracket completo de 16 jug
 * (matchx 101..115 → maxOff=15, n=16) el tamaño se detectara como 32 y
 * todos los matches cayeran en la primera columna, dejando octavos/cuartos
 * vacíos. La forma correcta es `s < n`.
 */
const nextPow2 = (n: number) => {
  let s = 1;
  while (s < n) s *= 2;
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
  // Normalizamos por el offset mínimo: las categorías de repechaje (-B/-C)
  // arrancan típicamente en match 109 (sin octavos), por lo que con el
  // offset crudo aparecerían rondas vacías al inicio ("Octavos por definir").
  // Al restar (minOff - 1) hacemos que el primer match real caiga en el
  // slot 1, y el tamaño del bracket se calcula sobre los matches existentes.
  const offs = matches.map(m => offset(m.matchId));
  const minOff = Math.min(...offs);
  const norm = (o: number) => o - minOff + 1;
  const maxN = Math.max(...offs.map(norm));
  const size = nextPow2(maxN + 1); // 8/16/32/...
  const totalRounds = Math.log2(size);
  const base = matches[0].matchId >= 200 ? 200 : 100; // D1=100, D2=200
  const byOff = new Map(matches.map(m => [norm(offset(m.matchId)), m]));
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
      <div className="flex items-start gap-2 min-w-0 flex-1">
        {player.clubLogo ? (
          <img src={player.clubLogo} alt={player.club || ''} className="h-5 w-5 object-contain shrink-0 mt-0.5" loading="lazy" />
        ) : (
          <User2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        )}
        <span
          className={`min-w-0 flex-1 text-sm leading-snug whitespace-normal break-words ${
            winner ? 'font-bold text-primary' : ''
          }`}
        >
          {player.name || <span className="italic text-muted-foreground">— por definir —</span>}
        </span>
      </div>
      {/* Badge G/- a la derecha (como /competicion). */}
      <span
        className={`text-sm font-bold tabular-nums w-6 text-center shrink-0 ${
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
        <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-0.5">
          <span className="min-w-0 flex-1 font-semibold leading-snug whitespace-normal break-words">
            Match {match.matchId}
            {match.hole ? ` · Hoyo ${match.hole}` : ''}
          </span>
          {match.result && <span className="font-medium shrink-0">{match.result}</span>}
        </div>
        {match.fecha && (
          <div className="text-[10px] text-muted-foreground/80 leading-snug whitespace-normal break-words">{match.fecha}</div>
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

  // Aparta el match por 3er lugar (matchx=199) antes de calcular rondas.
  // Si no se filtrara, su offset (99) haría que `nextPow2(maxOff+1)`
  // sobredimensione el bracket y todas las columnas queden vacías.
  const thirdPlaceMatch = matches.find(isThirdPlaceMatch) ?? null;
  const mainMatches = matches.filter((m) => !isThirdPlaceMatch(m));
  const rounds = buildFullRounds(mainMatches);
  const totalRounds = rounds.length;
  // Si ≥3 rondas, las últimas 2 (semis + final) van a Gran Final bilateral.
  // Brackets cortos (≤3 rondas, típicos de categorías -B / -C / Scramble que
  // no tienen octavos) se renderizan COMPLETAMENTE bilaterales: las rondas
  // previas se reparten mitad/mitad en columnas a izquierda y derecha que
  // convergen hacia el centro (Final). Brackets largos mantienen el layout
  // tradicional de columnas + Gran Final.
  // Sólo brackets LARGOS (≥4 rondas, ej. 16+ jug) usan la Gran Final
  // bilateral. Brackets cortos (cuartos→semis→final, típicos de -B/-C/Scramble)
  // se renderizan en columnas izquierda→derecha como cualquier ronda regular
  // porque el layout convergente se ve muy apretado en pantallas chicas.
  const hasGrandFinal = totalRounds >= 4;
  const fullyBilateral = false;
  const groupRoundsCount = hasGrandFinal ? totalRounds - 2 : totalRounds;
  const groupRounds = rounds.slice(0, groupRoundsCount);
  const bilateralExtraRounds: (BracketMatch | null)[][] = [];
  const semisRound = hasGrandFinal ? rounds[totalRounds - 2] : null;
  const finalRound = hasGrandFinal ? rounds[totalRounds - 1] : null;
  const finalMatch = finalRound?.[0] ?? null;
  // Match final del bracket (incluso brackets cortos que no dibujan la
  // sección "Gran Final"): siempre es el último match de la última ronda.
  // Se usa para calcular el campeón/subcampeón y mostrar el badge de
  // "Campeón" en brackets chicos (cuartos→semis→final).
  const overallFinalMatch =
    finalMatch ?? (rounds.length > 0 ? rounds[rounds.length - 1]?.[0] ?? null : null);
  const championName = championOfMatch(overallFinalMatch ?? null);

  /**
   * Nombre del subcampeón: el lado del match final que NO ganó. Sólo se
   * calcula cuando ya hay campeón (el otro lado tenía necesariamente
   * jugador asignado para que el match se hubiese jugado).
   */
  const runnerUpName: string | null = (() => {
    const fm = overallFinalMatch;
    if (!fm || fm.winner == null) return null;
    return String(fm.winner) === '1' ? fm.player2.name : fm.player1.name;
  })();

  /** Nombre del 3er lugar: ganador del match por 3er lugar. */
  const thirdPlaceName = championOfMatch(thirdPlaceMatch);

  return (
    <div className="space-y-8">
      {/* ============ Rondas previas (columnas) ============
          Sin overflow-x ni min-w-max: las columnas se reparten ancho con
          flex-1, así al hacer zoom-out el bracket cabe en pantalla sin
          scrollbar horizontal. */}
      {groupRounds.length > 0 && (
        // Wrapper con scroll horizontal: en móvil se respeta un min-width
        // por columna (≈180px) para que cada match card sea legible y el
        // usuario hace scroll lateral. En md+ se desactiva el min-width y
        // las columnas vuelven a repartirse con flex-1.
        <div className="pb-4 overflow-x-auto -mx-2 md:mx-0">
          <div
            className="flex gap-3 md:gap-4 px-2 items-stretch w-full md:min-w-0"
            style={{ minWidth: `${groupRounds.length * BRACKET_COLUMN_MIN_WIDTH}px` }}
          >
            {groupRounds.map((roundMatches, rIdx) => {
              const fromEnd = totalRounds - rIdx;
              return (
                <div key={rIdx} className="flex-1 min-w-0 flex flex-col gap-3">
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
                  <span className="min-w-0 whitespace-normal break-words">Campeón: {championName}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pb-4 overflow-x-auto -mx-2 md:mx-0">
            <div
              className="flex items-stretch justify-center gap-3 md:gap-4 px-2 w-full md:min-w-0"
              style={{ minWidth: `${(bilateralExtraRounds.length * 2 + 3) * BRACKET_COLUMN_MIN_WIDTH}px` }}
            >
              {/* Columnas extra izquierda (cuartos, etc.) — primera mitad */}
              {bilateralExtraRounds.map((rndMatches, idx) => {
                const fromEnd = totalRounds - idx; // 3 → Cuartos, etc.
                const half = Math.ceil(rndMatches.length / 2);
                const leftHalf = rndMatches.slice(0, half);
                return (
                  <div key={`bl-${idx}`} className="flex flex-col gap-3 flex-1 min-w-0">
                    <h4 className="text-xs font-bold uppercase text-center text-muted-foreground tracking-wide">
                      {roundLabel(fromEnd)}
                    </h4>
                    <div className="flex flex-col gap-3 justify-around flex-1">
                      {leftHalf.map((m, i) => (
                        <MatchCard
                          key={m?.matchId ?? `blh-${idx}-${i}`}
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

              {/* Semifinal izquierda */}
              <div className="flex flex-col gap-3 flex-1 min-w-0">
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
              <div className="flex flex-col gap-3 flex-1 min-w-0">
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
              <div className="flex flex-col gap-3 flex-1 min-w-0">
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

              {/* Columnas extra derecha (cuartos, etc.) — segunda mitad */}
              {bilateralExtraRounds.map((rndMatches, idx) => {
                const fromEnd = totalRounds - idx;
                const half = Math.ceil(rndMatches.length / 2);
                const rightHalf = rndMatches.slice(half);
                // Para que cuartos quede "afuera" de semis, invertimos el
                // orden visual: la ronda más temprana queda más a la derecha.
                return (
                  <div key={`br-${idx}`} className="flex flex-col gap-3 flex-1 min-w-0">
                    <h4 className="text-xs font-bold uppercase text-center text-muted-foreground tracking-wide">
                      {roundLabel(fromEnd)}
                    </h4>
                    <div className="flex flex-col gap-3 justify-around flex-1">
                      {rightHalf.map((m, i) => (
                        <MatchCard
                          key={m?.matchId ?? `brh-${idx}-${i}`}
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
        </section>
      )}

      {/* ============ Match por 3er lugar (sólo si existe la fila 199/299) ============ */}
      {/* ============ Campeón (brackets cortos sin Gran Final) ============
          En brackets de ≤3 rondas no se renderiza la sección Gran Final,
          así que aquí replicamos el badge "Campeón: <Nombre>" en grande y
          centrado — mismo estilo que en Gran Final — para que el ganador
          quede destacado igual que en brackets grandes. */}
      {!hasGrandFinal && championName && (
        <section className="space-y-3 border-t-2 border-accent/50 pt-6">
          <div className="text-center grid grid-cols-1 justify-items-center gap-4">
            <h3 className="w-full text-2xl font-bold text-accent flex items-center justify-center gap-2 leading-none">
              <Crown className="h-6 w-6" /> Campeón
            </h3>
            <div className="w-full flex justify-center">
              <div className="inline-flex max-w-full items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-bold text-lg shadow-md ring-2 ring-accent">
                <Trophy className="h-5 w-5" />
                <span className="min-w-0 whitespace-normal break-words">Campeón: {championName}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {thirdPlaceMatch && (
        <section className="space-y-3 border-t-2 border-amber-500/40 pt-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-amber-600 dark:text-amber-500 flex items-center justify-center gap-2">
              <Medal className="h-5 w-5" /> Match por 3er lugar
            </h3>
          </div>
          <div className="max-w-md mx-auto">
            <MatchCard
              match={thirdPlaceMatch}
              admin={admin}
              onSetWinner={onSetWinner}
              onReset={onReset}
              busy={busyMatchId === thirdPlaceMatch.matchId}
            />
          </div>
        </section>
      )}

      {/* ============ Podio (Campeón / Subcampeón / 3er lugar) ============
          Se muestra sólo cuando hay campeón definido (final jugada). Si aún
          no hay 3er lugar decidido, ese slot queda "— por definir —". */}
      {championName && (
        <section className="border-t-2 border-accent/50 pt-6">
          <h3 className="text-center text-lg font-bold text-accent flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-5 w-5" /> Podio
          </h3>
          <div className="flex items-end justify-center gap-3 max-w-2xl mx-auto">
            {/* 2do lugar (izquierda, block más bajo) */}
            <PodiumSlot
              place={2}
              icon="silver"
              name={runnerUpName}
              heightClass="h-20"
            />
            {/* 1er lugar (centro, más alto) */}
            <PodiumSlot
              place={1}
              icon="gold"
              name={championName}
              heightClass="h-28"
            />
            {/* 3er lugar (derecha, block más bajo aún) */}
            <PodiumSlot
              place={3}
              icon="bronze"
              name={thirdPlaceName}
              heightClass="h-16"
            />
          </div>
        </section>
      )}

    </div>
  );
};

// ============= Podio ======================================================

/**
 * Slot individual del podio. `place` sólo define el label; el diseño (color,
 * altura, icono) se pasa explícito para poder ordenar visualmente 2-1-3.
 */
const PodiumSlot = ({
  place,
  icon,
  name,
  heightClass,
}: {
  place: 1 | 2 | 3;
  icon: 'gold' | 'silver' | 'bronze';
  name: string | null;
  heightClass: string;
}) => {
  const colorMap = {
    gold:   { badge: 'bg-yellow-500 text-white', block: 'bg-yellow-500/20 border-yellow-500' },
    silver: { badge: 'bg-slate-400 text-white',  block: 'bg-slate-400/20 border-slate-400' },
    bronze: { badge: 'bg-amber-700 text-white',  block: 'bg-amber-700/20 border-amber-700' },
  }[icon];
  return (
    <div className="flex-1 min-w-0 flex flex-col items-center gap-2 max-w-[180px]">
      <div className="text-center min-h-[3rem] flex items-center justify-center px-1">
        <span className="text-sm font-semibold whitespace-normal break-words leading-tight">
          {name || <span className="italic text-muted-foreground">— por definir —</span>}
        </span>
      </div>
      <div className={`w-full ${heightClass} ${colorMap.block} border-2 rounded-t-md flex items-start justify-center pt-2`}>
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${colorMap.badge} font-bold text-lg shadow`}>
          {place}
        </span>
      </div>
    </div>
  );
};

export default BracketView;