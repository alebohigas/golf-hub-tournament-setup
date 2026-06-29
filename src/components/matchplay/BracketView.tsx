/**
 * BracketView
 * ---------------------------------------------------------------------------
 * Render genérico de un bracket de eliminación directa por columnas
 * (una columna por ronda). Lo usan la página pública /matchplay y el
 * panel /admin → tab Match Play.
 *
 * Props:
 *   matches  → arreglo plano de matches (D1 o D2)
 *   admin    → si true, expone callbacks para set winner / reset
 *   onSetWinner / onReset → callbacks admin
 */
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, RotateCcw, User2 } from 'lucide-react';
import {
  type BracketMatch,
  groupMatchesByRound,
  roundLabel,
} from '@/hooks/useMatchPlay';

interface BracketViewProps {
  matches: BracketMatch[];
  admin?: boolean;
  onSetWinner?: (match: BracketMatch, winnerId: number) => void;
  onReset?: (match: BracketMatch) => void;
  busyMatchId?: number | null;
}

/** True si el jugador es el ganador del match. */
const isWinner = (m: BracketMatch, playerId: string | number | null) => {
  if (!m.winner || !playerId) return false;
  return String(m.winner) === String(playerId);
};

/** Card individual de un competidor dentro del match. */
const PlayerRow = ({
  match,
  player,
  admin,
  onSetWinner,
  busy,
}: {
  match: BracketMatch;
  player: BracketMatch['player1'];
  admin?: boolean;
  onSetWinner?: (winnerId: number) => void;
  busy?: boolean;
}) => {
  const winner = isWinner(match, player.id);
  const empty = !player.id;
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 border-b last:border-b-0 ${
        winner ? 'bg-primary/10 font-semibold text-primary' : ''
      }`}
    >
      {player.clubLogo ? (
        <img
          src={player.clubLogo}
          alt={player.club || ''}
          className="h-6 w-6 object-contain"
          loading="lazy"
        />
      ) : (
        <User2 className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="flex-1 truncate text-sm">
        {player.name || <span className="italic text-muted-foreground">— por definir —</span>}
      </span>
      {winner && <Crown className="h-4 w-4 text-amber-500" />}
      {admin && !empty && !winner && onSetWinner && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          disabled={busy}
          onClick={() => onSetWinner(Number(player.id))}
        >
          Ganó
        </Button>
      )}
    </div>
  );
};

const BracketView = ({
  matches,
  admin,
  onSetWinner,
  onReset,
  busyMatchId,
}: BracketViewProps) => {
  if (!matches || !matches.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No hay matches registrados para este bracket.
      </p>
    );
  }
  const rounds = groupMatchesByRound(matches);
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-fit">
        {rounds.map((roundMatches, rIdx) => (
          <div key={rIdx} className="flex flex-col gap-4 min-w-[240px]">
            <h3 className="text-sm font-semibold text-center text-muted-foreground uppercase tracking-wide">
              {roundLabel(rIdx, rounds.length)}
            </h3>
            <div
              className="flex flex-col justify-around flex-1 gap-4"
              style={{ minHeight: `${rounds[0].length * 90}px` }}
            >
              {roundMatches.map(m => {
                const busy = busyMatchId === m.matchId;
                return (
                  <Card key={m.matchId} className="overflow-hidden">
                    <div className="px-2 py-1 text-[10px] text-muted-foreground bg-muted/40 flex justify-between">
                      <span>Match {m.matchId}</span>
                      {m.result && <span className="font-medium">{m.result}{m.hole ? ` (h${m.hole})` : ''}</span>}
                    </div>
                    <PlayerRow
                      match={m}
                      player={m.player1}
                      admin={admin}
                      busy={busy}
                      onSetWinner={admin && onSetWinner ? id => onSetWinner(m, id) : undefined}
                    />
                    <PlayerRow
                      match={m}
                      player={m.player2}
                      admin={admin}
                      busy={busy}
                      onSetWinner={admin && onSetWinner ? id => onSetWinner(m, id) : undefined}
                    />
                    {admin && m.winner && onReset && (
                      <div className="px-2 py-1 border-t bg-muted/20 flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs gap-1"
                          disabled={busy}
                          onClick={() => onReset(m)}
                        >
                          <RotateCcw className="h-3 w-3" />
                          Resetear
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BracketView;