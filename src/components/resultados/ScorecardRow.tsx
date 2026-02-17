/**
 * ScorecardRow Component
 * Renders an expandable scorecard (hole-by-hole) below a player row
 * when a round score (R1, R2, R3) is clicked in the Resultados table
 */

import { TableRow, TableCell } from '@/components/ui/table';
import { RoundScorecard, HoleScore } from '@/data/resultadosData';
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

const ScorecardRow = ({ scorecard, playerName, roundLabel, onClose, colSpan }: ScorecardRowProps) => {
  const front9 = scorecard.holes.slice(0, 9);
  const back9 = scorecard.holes.slice(9, 18);

  /** Render a 9-hole section */
  const renderSection = (holes: HoleScore[], label: string) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          {/* Hole numbers */}
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
          {/* Par row */}
          <tr className="bg-muted/50">
            <td className="px-2 py-1 font-semibold text-center text-muted-foreground">Par</td>
            {holes.map(h => (
              <td key={h.hoyo} className="px-2 py-1 text-center text-muted-foreground">{h.par}</td>
            ))}
            <td className="px-2 py-1 text-center font-semibold text-muted-foreground">
              {holes.reduce((s, h) => s + h.par, 0)}
            </td>
          </tr>
          {/* HCP row */}
          <tr className="bg-muted/30">
            <td className="px-2 py-1 font-semibold text-center text-muted-foreground">HCP</td>
            {holes.map(h => (
              <td key={h.hoyo} className="px-2 py-1 text-center text-muted-foreground text-[11px]">{h.hcp}</td>
            ))}
            <td className="px-2 py-1 text-center"></td>
          </tr>
          {/* Golpes row */}
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
          {/* Neto row */}
          <tr className="bg-muted/20">
            <td className="px-2 py-1 font-semibold text-center text-muted-foreground">Neto</td>
            {holes.map(h => (
              <td key={h.hoyo} className="px-2 py-1 text-center text-muted-foreground">{h.neto}</td>
            ))}
            <td className="px-2 py-1 text-center font-semibold text-muted-foreground">
              {holes.reduce((s, h) => s + h.neto, 0)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <TableRow className="bg-muted/10 hover:bg-muted/10">
      <TableCell colSpan={colSpan} className="p-0">
        <div className="p-4 border-t border-b border-primary/20">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">{playerName}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {roundLabel}
              </span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scorecard grid */}
          <div className="space-y-2">
            {renderSection(front9, 'OUT')}
            {renderSection(back9, 'IN')}
          </div>

          {/* Totals */}
          <div className="flex justify-end gap-6 mt-3 text-sm">
            <span className="text-muted-foreground">
              OUT: <strong className="text-foreground">{scorecard.out}</strong>
            </span>
            <span className="text-muted-foreground">
              IN: <strong className="text-foreground">{scorecard.in}</strong>
            </span>
            <span className="text-muted-foreground">
              Total: <strong className="text-primary text-base">{scorecard.totalGolpes}</strong>
            </span>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ScorecardRow;
