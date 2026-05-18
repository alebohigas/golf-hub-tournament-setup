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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

/**
 * PlayersTable
 * Renders a single players table styled to match the rest of the site's
 * tournament tables (primary header, white body rows, standard club logo
 * sizing). Used twice per day-section: once for Stableford and once for
 * Stroke Play, with an optional sub-title above each.
 */
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
      <div className="overflow-x-auto bg-white rounded-lg">
        <Table className="tournament-table">
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="text-primary-foreground font-bold text-center" style={{ width: '80px' }}>Club</TableHead>
              <TableHead className="text-primary-foreground font-bold text-left">Jugador</TableHead>
              <TableHead className="text-primary-foreground font-bold text-left" style={{ width: '90px' }}>Cat.</TableHead>
              <TableHead className="text-primary-foreground font-bold text-center" style={{ width: '90px' }}>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((p, i) => (
              <TableRow key={i} className="bg-white">
                <TableCell className="p-1 text-center align-middle">
                  {p.clubLogo ? (
                    <img
                      src={`${LOGOS_BASE_URL}${p.clubLogo}`}
                      alt="Club logo"
                      className="w-auto object-contain rounded inline-block"
                      style={{ height: '2.1375rem' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                </TableCell>
                <TableCell className="player-name-cell">{p.jugador}</TableCell>
                <TableCell className="text-left">{p.cat}</TableCell>
                <TableCell className="text-center font-bold text-primary">{p.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
      {data.map((sec, idx) => (
        <Card
          key={`${sec.premio}-${sec.fecha}-${idx}`}
          className="border-border/50"
        >
          <CardContent className="p-5">
            <h3 className="text-xl font-bold text-foreground">SCORE DEL DIA</h3>
            <h4 className="text-base font-bold text-[#900000] mb-4 capitalize">
              {sec.fechaLabel}
            </h4>
            <PlayersTable title="Stableford" players={sec.stableford} />
            <PlayersTable title="Stroke Play" players={sec.strokePlay} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MejorScoreDiarioReport;