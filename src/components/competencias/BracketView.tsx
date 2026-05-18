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

  // Agrupar matches por ronda
  const byRound: Record<number, BracketMatch[]> = {};
  for (const m of matches) {
    if (!byRound[m.round]) byRound[m.round] = [];
    byRound[m.round].push(m);
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max px-2">
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => (
          <div key={round} className="flex flex-col gap-3 min-w-[220px]">
            <h4 className="text-xs font-bold uppercase text-center text-muted-foreground tracking-wide">
              {roundLabel(round, totalRounds)}
            </h4>
            <div className="flex flex-col gap-3 justify-around flex-1">
              {(byRound[round] ?? []).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Tarjeta de un match — dos filas (player1 / player2) con ganador resaltado. */
const MatchCard = ({ match }: { match: BracketMatch }) => {
  const w1 = match.winner_id != null && match.winner_id === match.player1_id;
  const w2 = match.winner_id != null && match.winner_id === match.player2_id;

  const renderRow = (
    name: string | null,
    seed: number | null,
    score: number | null,
    isWinner: boolean,
  ) => (
    <div className={`flex items-center justify-between px-3 py-2 ${isWinner ? 'bg-primary/10' : ''}`}>
      <div className="flex items-center gap-2 min-w-0">
        {seed != null && (
          <Badge variant="outline" className="h-5 px-1.5 text-[10px] shrink-0">{seed}</Badge>
        )}
        <span className={`truncate text-sm ${isWinner ? 'font-bold text-primary' : ''}`}>
          {name ?? <span className="text-muted-foreground italic">— por definir —</span>}
        </span>
      </div>
      <span className={`text-sm tabular-nums ${isWinner ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
        {score ?? '–'}
      </span>
    </div>
  );

  return (
    <Card className="border-border overflow-hidden divide-y divide-border">
      {renderRow(match.player1_name, match.player1_seed, match.player1_score, w1)}
      {renderRow(match.player2_name, match.player2_seed, match.player2_score, w2)}
    </Card>
  );
};

export default BracketView;