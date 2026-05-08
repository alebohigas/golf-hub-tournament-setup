/**
 * MejorScoreDiarioReport
 * Renders the "Score del Día" report: per-day sections of best daily scores
 * grouped by premio (mejorscorep). Within each day-section, players are split
 * into Stableford and Stroke Play subgroups when both formats coexist.
 *
 * Data source: /api/mejor_score_diario.php
 */

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_BASE_URL, LOGOS_BASE_URL, POLL_ACTIVE } from '@/config/api';
import { getTorneoId } from '@/hooks/useTorneoId';

/** Single player row inside a day-section */
interface MejorScorePlayer {
  jugador: string;
  cat: string;
  score: number;
  clubLogo: string;
}

/** One day+premio block */
interface MejorScoreSection {
  premio: number;
  fecha: string;
  fechaLabel: string;
  stableford: MejorScorePlayer[];
  strokePlay: MejorScorePlayer[];
}

/** Build the report endpoint URL with active torneoid */
const getMejorScoreUrl = (): string => {
  const tid = getTorneoId();
  return `${API_BASE_URL}/mejor_score_diario.php${tid ? `?torneoid=${tid}` : ''}`;
};

/** Renders a single players table (used twice per day: stableford / stroke play) */
const PlayersTable = ({
  title,
  players,
}: {
  title?: string;
  players: MejorScorePlayer[];
}) => {
  if (!players.length) return null;
  return (
    <div className="mb-4">
      {title && (
        <div className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
          {title}
        </div>
      )}
      <div className="overflow-x-auto rounded-md border border-border/50 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#424c59] text-white">
              <th className="px-3 py-2 text-left font-semibold w-20">Club</th>
              <th className="px-3 py-2 text-left font-semibold">Jugador</th>
              <th className="px-3 py-2 text-left font-semibold w-24">Cat.</th>
              <th className="px-3 py-2 text-center font-semibold w-24">Score</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={i} className="border-t border-border/40">
                <td className="px-3 py-2">
                  {p.clubLogo ? (
                    <img
                      src={`${LOGOS_BASE_URL}${p.clubLogo}`}
                      alt=""
                      className="h-6 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                </td>
                <td className="px-3 py-2 text-foreground">{p.jugador}</td>
                <td className="px-3 py-2 text-foreground">{p.cat}</td>
                <td className="px-3 py-2 text-center font-bold text-[#900000]">
                  {p.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MejorScoreDiarioReport = () => {
  const { data, isLoading, error } = useQuery<MejorScoreSection[]>({
    queryKey: ['mejor-score-diario'],
    queryFn: () => apiFetch<MejorScoreSection[]>(getMejorScoreUrl()),
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto border-border/50">
        <CardContent className="p-8 text-center text-muted-foreground">
          No hay datos de mejor score diario disponibles.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {data.map((sec, idx) => {
        const hasBoth = sec.stableford.length > 0 && sec.strokePlay.length > 0;
        return (
          <div key={`${sec.premio}-${sec.fecha}-${idx}`}>
            <h3 className="text-xl font-bold text-foreground">SCORE DEL DIA</h3>
            <h4 className="text-base font-bold text-[#900000] mb-3">
              {sec.fechaLabel}
            </h4>
            {hasBoth ? (
              <>
                <PlayersTable title="Stableford" players={sec.stableford} />
                <PlayersTable title="Stroke Play" players={sec.strokePlay} />
              </>
            ) : (
              <>
                <PlayersTable players={sec.stableford} />
                <PlayersTable players={sec.strokePlay} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MejorScoreDiarioReport;