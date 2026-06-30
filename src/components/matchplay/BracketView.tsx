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
import { Crown, RotateCcw, Trophy, User2, Medal, Award } from 'lucide-react';
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

/**
 * Separa el "match por tercer lugar" del bracket principal.
 *
 * Los matches regulares de un bracket de tamaño N (potencia de 2) ocupan
 * exactamente N-1 offsets CONTIGUOS empezando en el menor offset (1 para
 * cuadros principales, o el offset inicial para repechajes -B / -C).
 *
 * El "3er lugar" se asigna manualmente con un matchx NO consecutivo (por
 * ejemplo 199, 150, 195, etc.), así que cualquier match cuyo offset caiga
 * fuera de la corrida contigua de tamaño 2^k - 1 se trata como 3er lugar.
 *
 * Devuelve `{ bracket, thirdPlace }`. Si no hay extras, `thirdPlace` es null.
 */
const splitThirdPlace = (
  matches: BracketMatch[]
): { bracket: BracketMatch[]; thirdPlace: BracketMatch | null } => {
  if (!matches.length) return { bracket: matches, thirdPlace: null };
  const sortedOffs = [...new Set(matches.map(m => offset(m.matchId)))].sort((a, b) => a - b);
  const minOff = sortedOffs[0];
  // Corrida contigua desde minOff.
  let runLen = 0;
  for (let i = 0; i < sortedOffs.length; i++) {
    if (sortedOffs[i] === minOff + i) runLen++;
    else break;
  }
  // Mayor N ≤ runLen tal que (N+1) es potencia de 2.
  let N = 1;
  while (N * 2 + 1 <= runLen) N = N * 2 + 1;
  const inBracket = new Set<number>();
  for (let i = 0; i < N; i++) inBracket.add(minOff + i);
  const bracket: BracketMatch[] = [];
  const extras: BracketMatch[] = [];
  for (const m of matches) {
    (inBracket.has(offset(m.matchId)) ? bracket : extras).push(m);
  }
  // El primer extra es el match por 3er lugar (en la práctica sólo hay uno).
  return { bracket, thirdPlace: extras[0] ?? null };
};

/** Devuelve el nombre del lado perdedor (o null si no hay ganador). */
const loserOfMatch = (m: BracketMatch | null): string | null => {
  if (!m || m.winner == null) return null;
  return String(m.winner) === '1' ? m.player2.name : m.player1.name;
};

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

  // Aparta el match por 3er lugar (matchx no contiguo) antes de calcular rondas.
  const { bracket: bracketMatches, thirdPlace } = splitThirdPlace(matches);
  const rounds = buildFullRounds(bracketMatches);
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
  // El match final SIEMPRE es el último de la última ronda (también en
  // brackets cortos sin Gran Final, ej. -B/-C). Así el banner de campeón
  // y el podio aparecen sin importar el tamaño del bracket.
  const finalMatch = (finalRound?.[0] ?? rounds[totalRounds - 1]?.[0]) ?? null;
  const championName = championOfMatch(finalMatch ?? null);
  const runnerUpName = loserOfMatch(finalMatch ?? null);
  const thirdPlaceName = championOfMatch(thirdPlace);
  // Para brackets cortos (sin Gran Final) mostramos un banner de campeón
  // arriba del podio para que se resalte igual que en la sección de Gran Final.
  const showShortChampionBanner = !hasGrandFinal && !!championName;

  // Podio: sólo se muestra si hay al menos un ganador definido.
  const podium: { place: 1 | 2 | 3; name: string | null; label: string; color: string; Icon: typeof Trophy }[] = [
    { place: 1, name: championName,   label: '1er Lugar',  color: 'bg-yellow-400 text-yellow-950 ring-yellow-500',  Icon: Trophy },
    { place: 2, name: runnerUpName,   label: '2do Lugar',  color: 'bg-slate-300 text-slate-900 ring-slate-400',     Icon: Medal },
    { place: 3, name: thirdPlaceName, label: '3er Lugar',  color: 'bg-amber-600 text-amber-50 ring-amber-700',      Icon: Award },
  ];
  const showPodium = podium.some(p => p.name);

  return (
    <div className="space-y-8">
      {/* ============ Rondas previas (columnas) ============
          Sin overflow-x ni min-w-max: las columnas se reparten ancho con
          flex-1, así al hacer zoom-out el bracket cabe en pantalla sin
          scrollbar horizontal. */}
      {groupRounds.length > 0 && (
        <div className="pb-4">
          <div className="flex gap-3 md:gap-4 px-2 items-stretch w-full">
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

      {/* ============ Banner de campeón para brackets cortos (sin Gran Final) ============ */}
      {showShortChampionBanner && (
        <div className="flex justify-center pt-2">
          <div className="inline-flex max-w-full items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-bold text-lg shadow-md ring-2 ring-accent">
            <Trophy className="h-5 w-5" />
            <span className="min-w-0 truncate">Campeón: {championName}</span>
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
              {/* Columnas extra izquierda (cuartos, etc.) — primera mitad */}
              {bilateralExtraRounds.map((rndMatches, idx) => {
                const fromEnd = totalRounds - idx; // 3 → Cuartos, etc.
                const half = Math.ceil(rndMatches.length / 2);
                const leftHalf = rndMatches.slice(0, half);
                return (
                  <div key={`bl-${idx}`} className="flex flex-col gap-3 min-w-[220px]">
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

              {/* Columnas extra derecha (cuartos, etc.) — segunda mitad */}
              {bilateralExtraRounds.map((rndMatches, idx) => {
                const fromEnd = totalRounds - idx;
                const half = Math.ceil(rndMatches.length / 2);
                const rightHalf = rndMatches.slice(half);
                // Para que cuartos quede "afuera" de semis, invertimos el
                // orden visual: la ronda más temprana queda más a la derecha.
                return (
                  <div key={`br-${idx}`} className="flex flex-col gap-3 min-w-[220px]">
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

      {/* ============ Match por 3er Lugar (matchx no consecutivo) ============ */}
      {thirdPlace && (
        <section className="space-y-3 border-t border-border/60 pt-6">
          <h3 className="text-center text-lg font-bold uppercase tracking-wide text-amber-700 flex items-center justify-center gap-2">
            <Award className="h-5 w-5" /> Match por 3er Lugar
          </h3>
          <div className="flex justify-center">
            <div className="min-w-[280px] max-w-sm w-full">
              <MatchCard
                match={thirdPlace}
                admin={admin}
                onSetWinner={onSetWinner}
                onReset={onReset}
                busy={busyMatchId === thirdPlace.matchId}
              />
            </div>
          </div>
        </section>
      )}

      {/* ============ Podio horizontal (oro/plata/bronce) ============ */}
      {showPodium && (
        <section className="pt-4">
          <div className="flex flex-wrap justify-center items-stretch gap-3">
            {podium.map(({ place, name, label, color, Icon }) => (
              <div
                key={place}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ring-2 shadow-sm min-w-[200px] ${color} ${
                  name ? '' : 'opacity-40'
                }`}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</div>
                  <div className="font-bold truncate">
                    {name || <span className="italic font-normal">por definir</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BracketView;