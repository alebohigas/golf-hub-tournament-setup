/**
 * ScorecardRow Component
 * Renders an expandable scorecard (hole-by-hole) below a player row
 * Adapts layout based on scorecardType: 'hcp', 'stableford', or 'scratch'
 * 
 * Stableford: Hoyo, Par, Gross, Vtja, Hcp., Neto, Ptos
 * HCP (Stroke Neto): Hoyo, Par, Gross, Vtja, Hcp., Neto
 * Scratch (Gross): Hoyo, Par, Golpes, +/-
 */

import { TableRow, TableCell } from '@/components/ui/table';
import { RoundScorecard, HoleScore, ScorecardType } from '@/data/resultadosData';
import { X } from 'lucide-react';

interface ScorecardRowProps {
  /** The scorecard data to display */
  scorecard: RoundScorecard;
  /** Player name for the header */
  playerName: string;
  /** Round number label */
  roundLabel: string;
  /** Close handler */
  onClose: () => void;
  /** Number of columns to span in the parent table */
  colSpan: number;
}

/** Color coding for score relative to par */
const getScoreColor = (golpes: number, par: number): string => {
  const diff = golpes - par;
  if (diff <= -2) return 'bg-primary text-primary-foreground';      // Eagle or better
  if (diff === -1) return 'bg-red-500/20 text-red-700';             // Birdie
  if (diff === 0) return '';                                          // Par
  if (diff === 1) return 'bg-blue-500/20 text-blue-700';            // Bogey
  return 'bg-blue-700/20 text-blue-900';                             // Double+
};

/** Label mapping for scorecard types */
const scorecardTypeLabels: Record<ScorecardType, string> = {
  hcp: 'Stroke Play (Neto)',
  stableford: 'Stableford',
  scratch: 'Scratch (Gross)',
};

const ScorecardRow = ({ scorecard, playerName, roundLabel, onClose, colSpan }: ScorecardRowProps) => {
  const front9 = scorecard.holes.slice(0, 9);
  const back9 = scorecard.holes.slice(9, 18);
  const type = scorecard.scorecardType;

  /** Render a 9-hole section adapted to scorecard type */
  const renderSection = (holes: HoleScore[], label: string) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          {/* Hole numbers header */}
          <tr className="bg-primary">
            <th className="px-2 py-1 text-primary-foreground font-bold text-center w-14">{label}</th>
            {holes.map(h => (
              <th key={h.hoyo} className="px-2 py-1 text-primary-foreground font-bold text-center min-w-[36px]">
                {h.hoyo}
              </th>
            ))}
            <th className="px-2 py-1 text-primary-foreground font-bold text-center min-w-[44px]">Tot</th>
          </tr>
        </thead>
        <tbody>
          {/* Par row - always shown, darker background for emphasis */}
          <tr className="bg-muted">
            <td className="px-2 py-1 font-semibold text-center text-foreground">Par</td>
            {holes.map(h => (
              <td key={h.hoyo} className="px-2 py-1 text-center font-medium text-foreground">{h.par}</td>
            ))}
            <td className="px-2 py-1 text-center font-semibold text-foreground">
              {holes.reduce((s, h) => s + h.par, 0)}
            </td>
          </tr>

          {/* Vtja row - course hole handicap/difficulty ranking from campo_tee.ventajas. Sits between Par and Gross. */}
          {(type === 'hcp' || type === 'stableford') && (
            <tr className="bg-muted/20">
              <td className="px-2 py-1 font-semibold text-center text-muted-foreground">Vtja</td>
              {holes.map(h => (
                <td key={h.hoyo} className="px-2 py-1 text-center text-muted-foreground">{h.hcp ?? 0}</td>
              ))}
              <td className="px-2 py-1 text-center text-muted-foreground">-</td>
            </tr>
          )}

          {/* Gross row - shown for hcp and stableford (labeled "Gross") */}
          {(type === 'hcp' || type === 'stableford') && (
            <tr>
              <td className="px-2 py-1 font-semibold text-center">Gross</td>
              {holes.map(h => (
                <td key={h.hoyo} className={`px-2 py-1 text-center font-bold rounded ${getScoreColor(h.golpes, h.par)}`}>
                  {h.golpes}
                </td>
              ))}
              <td className="px-2 py-1 text-center font-bold">
                {holes.reduce((s, h) => s + h.golpes, 0)}
              </td>
            </tr>
          )}

          {/* Hcp. row - actual handicap strokes received by the player on each hole */}
          {(type === 'hcp' || type === 'stableford') && (
            <tr className="bg-muted/10">
              <td className="px-2 py-1 font-semibold text-center text-muted-foreground">Hcp.</td>
              {holes.map(h => (
                <td key={h.hoyo} className="px-2 py-1 text-center text-muted-foreground">{h.hcpStrokes ?? 0}</td>
              ))}
              <td className="px-2 py-1 text-center font-semibold text-muted-foreground">
                {holes.reduce((s, h) => s + (h.hcpStrokes ?? 0), 0)}
              </td>
            </tr>
          )}

          {/* Neto row - shown for hcp and stableford */}
          {(type === 'hcp' || type === 'stableford') && (
            <tr className="bg-muted/30">
              <td className="px-2 py-1 font-semibold text-center text-muted-foreground">Neto</td>
              {holes.map(h => (
                <td key={h.hoyo} className="px-2 py-1 text-center text-muted-foreground">{h.neto}</td>
              ))}
              <td className="px-2 py-1 text-center font-semibold text-muted-foreground">
                {holes.reduce((s, h) => s + h.neto, 0)}
              </td>
            </tr>
          )}

          {/* Puntos row - only for stableford */}
          {type === 'stableford' && (
            <tr className="bg-amber-500/10">
              <td className="px-2 py-1 font-semibold text-center text-amber-700">Ptos</td>
              {holes.map(h => (
                <td key={h.hoyo} className={`px-2 py-1 text-center font-bold ${
                  (h.puntos || 0) >= 3 ? 'text-primary' : 
                  (h.puntos || 0) === 0 ? 'text-muted-foreground' : 'text-foreground'
                }`}>
                  {h.puntos ?? 0}
                </td>
              ))}
              <td className="px-2 py-1 text-center font-bold text-amber-700">
                {holes.reduce((s, h) => s + (h.puntos || 0), 0)}
              </td>
            </tr>
          )}

          {/* Scratch type: Golpes row */}
          {type === 'scratch' && (
            <tr>
              <td className="px-2 py-1 font-semibold text-center">Golpes</td>
              {holes.map(h => (
                <td key={h.hoyo} className={`px-2 py-1 text-center font-bold rounded ${getScoreColor(h.golpes, h.par)}`}>
                  {h.golpes}
                </td>
              ))}
              <td className="px-2 py-1 text-center font-bold">
                {holes.reduce((s, h) => s + h.golpes, 0)}
              </td>
            </tr>
          )}

          {/* +/- row for Scratch type */}
          {type === 'scratch' && (
            <tr className="bg-muted/20">
              <td className="px-2 py-1 font-semibold text-center text-muted-foreground">+/-</td>
              {holes.map(h => {
                const diff = h.golpes - h.par;
                return (
                  <td key={h.hoyo} className={`px-2 py-1 text-center font-medium ${
                    diff < 0 ? 'text-red-600' : diff > 0 ? 'text-blue-600' : 'text-muted-foreground'
                  }`}>
                    {h.resultado}
                  </td>
                );
              })}
              <td className="px-2 py-1 text-center font-semibold">
                {(() => {
                  const total = holes.reduce((s, h) => s + h.golpes, 0) - holes.reduce((s, h) => s + h.par, 0);
                  return total === 0 ? 'E' : total > 0 ? `+${total}` : `${total}`;
                })()}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <TableRow className="bg-muted/10 hover:bg-muted/10">
      <TableCell colSpan={colSpan} className="p-0">
        <div className="p-4 border-t border-b border-primary/20">
          {/* Date header - prominent title on its own line */}
          {scorecard.date && scorecard.date !== '0' && (
            <div className="mb-3 pb-2 border-b border-border/50">
              <span className="text-muted-foreground text-sm font-medium uppercase tracking-wide">Fecha</span>
              <span className="ml-2 text-lg font-display font-bold text-primary">
                {scorecard.date}
              </span>
            </div>
          )}

          {/* Header row with player info and close button */}
          <div className="flex items-center justify-between mb-3">
            {/* Left section: player name, round, type */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground">{playerName}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {roundLabel}
              </span>
              {/* Scorecard type badge */}
              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                {scorecardTypeLabels[type]}
              </span>
            </div>

            {/* Right section: close button */}
            <div className="flex items-center">
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scorecard grid */}
          <div className="space-y-2">
            {renderSection(front9, 'OUT')}
            {renderSection(back9, 'IN')}
          </div>

          {/* Totals - aligned baseline, consistent sizing */}
          <div className="flex justify-end items-baseline gap-6 mt-3 text-sm flex-wrap">
            <span className="text-muted-foreground">
              OUT: <strong className="text-foreground">{scorecard.out}</strong>
            </span>
            <span className="text-muted-foreground">
              IN: <strong className="text-foreground">{scorecard.in}</strong>
            </span>
            <span className="text-muted-foreground">
              Total: <strong className="text-foreground font-bold">{scorecard.totalGolpes}</strong>
            </span>
            {(type === 'hcp' || type === 'stableford') && (
              <span className="text-muted-foreground">
                Neto: <strong className="text-foreground font-bold">{scorecard.totalNeto}</strong>
              </span>
            )}
            {type === 'stableford' && (
              <span className="text-muted-foreground">
                Puntos: <strong className="text-primary font-bold">{scorecard.totalPuntos}</strong>
              </span>
            )}
            {type === 'scratch' && (
              <span className="text-muted-foreground">
                +/-: <strong className={`font-bold ${
                  (scorecard.totalGolpes - 72) < 0 ? 'text-red-600' : 
                  (scorecard.totalGolpes - 72) > 0 ? 'text-blue-600' : ''
                }`}>
                  {(() => {
                    const d = scorecard.totalGolpes - 72;
                    return d === 0 ? 'E' : d > 0 ? `+${d}` : `${d}`;
                  })()}
                </strong>
              </span>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ScorecardRow;
