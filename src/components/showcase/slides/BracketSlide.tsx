/**
 * BracketSlide
 * ----------------------------------------------------------------------------
 * Renderiza una parte del bracket Putt-Finales para usarse como slide en
 * el rotador `/showcase/rotacion`. Soporta cuatro variantes:
 *
 *   - 'full'   → bracket completo (sólo cuando size = 16)
 *   - 'groupN' → un grupo (0..3) cuando size > 16
 *   - 'semis'  → semifinales (rondas previas a la final, sólo size > 16)
 *   - 'final'  → final + campeón
 *
 * Render mínimo: tarjeta por match con dos filas (player1/player2),
 * ganador en negritas, campeón con dorado. NO se muestran distancias —
 * sólo "G"/"-" como en el BracketView público.
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy } from 'lucide-react';
import { usePuttFinales, type BracketMatch } from '@/hooks/useBrackets';
import { POLL_SHOWCASE } from '@/config/api';
import BracketPairs from '@/components/brackets/BracketPairs';

/** Props del slide de bracket. */
interface Props {
  /** Caballeros (M), Damas (F) o bracket ÚNICO (A = "Un solo bracket"). */
  sexo: 'M' | 'F' | 'A';
  /** 'full' | 'group0..3' | 'semis' | 'final' */
  kind: string;
}

/**
 * Sufijo de título según el bracket. En modo "Un solo bracket" (A) no hay
 * división por sexo, así que se omite el sufijo y se muestra sólo el nombre
 * de la competición.
 */
const sideLabel = (sexo: 'M' | 'F' | 'A'): string =>
  sexo === 'M' ? 'Caballeros' : sexo === 'F' ? 'Damas' : 'Putt Finales';

/**
 * Nombre de la competición tal como se publica: en modo "Un solo bracket"
 * es "Putt Finales"; en modo dual, "Putt Finales Caballeros" / "Damas".
 */
const compName = (sexo: 'M' | 'F' | 'A'): string =>
  sexo === 'A' ? 'Putt Finales' : `Putt Finales ${sideLabel(sexo)}`;

/**
 * Encabezado estándar del slide: título grande + pill verde con el nombre
 * de la competición (mismo look que la vista pública del bracket).
 */
const SlideHeader = ({ sexo, subtitle }: { sexo: 'M' | 'F' | 'A'; subtitle?: string }) => (
  <div className="text-center mb-6">
    <h1 className="text-4xl md:text-5xl font-bold">{compName(sexo)}</h1>
    <div className="mt-3 inline-flex items-center rounded-full bg-primary px-5 py-2 text-primary-foreground font-semibold">
      {compName(sexo)}
    </div>
    {subtitle && (
      <h2 className="mt-4 text-2xl font-bold text-left">{subtitle}</h2>
    )}
  </div>
);

/** Tarjeta de un match — 2 filas con resultado G/–. */
const MatchCard = ({ match, championId }: { match: BracketMatch; championId: number | null }) => {
  const w1 = match.winner_id != null && match.winner_id === match.player1_id;
  const w2 = match.winner_id != null && match.winner_id === match.player2_id;
  const c1 = championId != null && match.player1_id === championId;
  const c2 = championId != null && match.player2_id === championId;

  const label = (isWinner: boolean): string =>
    match.winner_id == null ? '–' : isWinner ? 'G' : '-';

  const row = (name: string | null, seed: number | null, isWinner: boolean, isChampion: boolean) => (
    <div className={`flex items-center justify-between px-3 py-2 ${
      isChampion ? 'bg-accent ring-2 ring-accent' : isWinner ? 'bg-primary/10' : ''
    }`}>
      <div className="flex items-center gap-2 min-w-0">
        {seed != null && (
          <Badge variant="outline" className="h-5 px-1.5 text-[10px] shrink-0">{seed}</Badge>
        )}
        <span className={`truncate text-sm ${
          isChampion ? 'font-bold text-accent-foreground' :
          isWinner ? 'font-bold text-primary' : ''
        }`}>
          {name ?? <span className="text-muted-foreground italic">— por definir —</span>}
        </span>
      </div>
      <span className={`text-sm font-bold tabular-nums w-6 text-center ${
        isChampion ? 'text-accent-foreground' :
        isWinner ? 'text-primary' : 'text-muted-foreground'
      }`}>{label(isWinner)}</span>
    </div>
  );

  return (
    <Card className={`border-border overflow-hidden divide-y divide-border ${
      c1 || c2 ? 'ring-2 ring-accent shadow-md' : ''
    }`}>
      {row(match.player1_name, match.player1_seed, w1, c1)}
      {row(match.player2_name, match.player2_seed, w2, c2)}
    </Card>
  );
};

/** Columna por ronda con encabezado + matches. */
const RoundColumn = ({
  label,
  matches,
  championId,
  connect = true,
}: {
  label: string;
  matches: BracketMatch[];
  championId: number | null;
  /** false en la última columna (final) para no dibujar llaves al vacío. */
  connect?: boolean;
}) => (
  <div className="flex flex-col gap-3 min-w-[220px]">
    <h4 className="text-xs font-bold uppercase text-center text-muted-foreground tracking-wide">
      {label}
    </h4>
    <BracketPairs connect={connect}>
      {matches.map((m) => <MatchCard key={m.id} match={m} championId={championId} />)}
    </BracketPairs>
  </div>
);

const BracketSlide = ({ sexo, kind }: Props) => {
  /** Poll de respaldo (5 min) para TVs en otro dispositivo, además del push. */
  const { data, isLoading } = usePuttFinales(POLL_SHOWCASE);
  const side = data?.[sexo];
  /** Etiqueta corta del bracket (Caballeros/Damas/Putt Finales). */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!side?.config) {
    return (
      <div className="max-w-6xl mx-auto p-6 rounded bg-card text-muted-foreground text-center">
        El bracket aún no se ha generado.
      </div>
    );
  }

  const matches = side.matches;
  const size = Number(side.config.size);
  const totalRounds = Math.log2(size);

  /** Campeón final (si está resuelto). */
  const finalMatch = matches.find((m) => Number(m.round) === totalRounds);
  const championId: number | null = finalMatch?.winner_id ?? null;
  const championName: string | null =
    championId != null
      ? finalMatch?.player1_id === championId
        ? finalMatch?.player1_name ?? null
        : finalMatch?.player2_name ?? null
      : null;

  // ---------- Render según kind ----------

  // 'full' (size = 16): todas las rondas en orden
  if (kind === 'full') {
    const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);
    return (
      <div className="max-w-7xl mx-auto">
        <SlideHeader sexo={sexo} subtitle="Bracket completo" />
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max px-2">
            {rounds.map((r) => (
              <RoundColumn
                key={r}
                label={`Ronda ${r}`}
                connect={r < totalRounds}
                matches={matches
                  .filter((m) => Number(m.round) === r)
                  .sort((a, b) => Number(a.position) - Number(b.position))}
                championId={championId}
              />
            ))}
          </div>
        </div>
        {championName && (
          <ChampionBadge name={championName} />
        )}
      </div>
    );
  }

  // 'groupN' (size > 16): un grupo, rondas 1..(totalRounds-2)
  if (kind.startsWith('group')) {
    const g = parseInt(kind.slice(5), 10);
    if (!Number.isFinite(g)) return null;
    const groupRoundsCount = totalRounds - 2;
    const groupSize = Math.floor(size / 4);

    return (
      <div className="max-w-7xl mx-auto">
        <SlideHeader sexo={sexo} subtitle={`Grupo ${g + 1}`} />
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max px-2">
            {Array.from({ length: groupRoundsCount }, (_, i) => i + 1).map((r) => {
              const perGroup = Math.max(1, Math.floor(groupSize / Math.pow(2, r)));
              const ofRound = matches
                .filter((m) => Number(m.round) === r)
                .sort((a, b) => Number(a.position) - Number(b.position));
              const slice = ofRound.slice(g * perGroup, (g + 1) * perGroup);
              return (
                <RoundColumn key={r} label={`Ronda ${r}`} matches={slice} championId={championId} />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 'semis': matches de ronda totalRounds - 1
  if (kind === 'semis') {
    const semisRound = totalRounds - 1;
    const semis = matches
      .filter((m) => Number(m.round) === semisRound)
      .sort((a, b) => Number(a.position) - Number(b.position));
    return (
      <div className="max-w-5xl mx-auto">
        <SlideHeader sexo={sexo} subtitle="Semifinales" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {semis.map((m) => (
            <div key={m.id} className="space-y-2">
              <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-wide text-center">
                Semifinal {m.position + 1}
              </h4>
              <MatchCard match={m} championId={championId} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 'final': match de ronda totalRounds + campeón
  if (kind === 'final') {
    if (!finalMatch) {
      return (
        <div className="max-w-4xl mx-auto p-6 rounded bg-card text-muted-foreground text-center">
          Aún no hay match final.
        </div>
      );
    }
    return (
      <div className="max-w-3xl mx-auto text-center">
        <SlideHeader sexo={sexo} subtitle="Gran Final" />
        <div className="max-w-md mx-auto mb-6">
          <MatchCard match={finalMatch} championId={championId} />
        </div>
        {championName && <ChampionBadge name={championName} large />}
      </div>
    );
  }

  return null;
};

/** Badge dorado del campeón. */
const ChampionBadge = ({ name, large }: { name: string; large?: boolean }) => (
  <div className="w-full flex justify-center mt-6">
    <div className={`inline-flex max-w-full items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-bold shadow-md ring-2 ring-accent ${
      large ? 'text-2xl' : 'text-lg'
    }`}>
      <Trophy className={large ? 'h-7 w-7' : 'h-5 w-5'} />
      <span className="min-w-0 truncate">Campeón: {name}</span>
    </div>
  </div>
);

export default BracketSlide;