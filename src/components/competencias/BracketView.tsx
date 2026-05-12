/**
 * BracketView
 * ----------------------------------------------------------------------------
 * Public read-only bracket display for a prize flagged with is_bracket=1.
 * Renders rounds left-to-right (R1 → Final) with each match as a card
 * showing both seeded players, their scores and the winner highlighted.
 *
 * Polls bracket_matches via useBracketConfig() so live results update.
 *
 * Used inside /competencias when the selected group corresponds to a prize
 * row with is_bracket = 1.
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy } from 'lucide-react';
import { useBracketConfig, type BracketMatch } from '@/hooks/useBrackets';

interface BracketViewProps {
  prizeTable: string;
  prizeId: number;
}

/** Human round labels by total round count */
const roundLabel = (round: number, totalRounds: number): string => {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinal';
  if (fromEnd === 2) return 'Cuartos';
  if (fromEnd === 3) return 'Octavos';
  return `R${round}`;
};

const BracketView = ({ prizeTable, prizeId }: BracketViewProps) => {
  const { data, isLoading, error } = useBracketConfig(prizeTable, prizeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Cargando bracket...</span>
      </div>
    );
  }

  if (error || !data?.config) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">El bracket aún no se ha configurado.</p>
      </div>
    );
  }

  const { config, matches } = data;
  const totalRounds = Math.log2(config.size);

  // Group matches by round
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

/** Single match card — two stacked rows for player1 and player2 */
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