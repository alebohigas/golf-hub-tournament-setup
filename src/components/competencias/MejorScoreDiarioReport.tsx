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
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Trophy } from 'lucide-react';
import { useState } from 'react';
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

  /**
   * Drill-down state for the date selection UX:
   *   null      → show date selection grid (cards, one per fecha)
   *   'all'     → "Ver todos los resultados" stacked view
   *   '<fecha>' → show only the selected date's tables
   */
  const [selected, setSelected] = useState<string | null>(null);

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

  /** Unique fechas in server order (oldest → newest as returned). */
  const fechas: { fecha: string; fechaLabel: string }[] = [];
  const seen = new Set<string>();
  for (const sec of data) {
    if (!seen.has(sec.fecha)) {
      seen.add(sec.fecha);
      fechas.push({ fecha: sec.fecha, fechaLabel: sec.fechaLabel });
    }
  }

  /**
   * Render one date section (Stableford + Stroke Play tables) without
   * any per-day Card wrapper — matches the pattern used by other
   * Competición reports where only the parent context provides framing.
   */
  const renderSection = (sec: MejorScoreSection, idx: number) => (
    <div key={`${sec.premio}-${sec.fecha}-${idx}`} className="mb-8">
      <h4 className="text-base font-bold text-[#900000] mb-4 capitalize">
        {sec.fechaLabel}
      </h4>
      <PlayersTable title="Stableford" players={sec.stableford} />
      <PlayersTable title="Stroke Play" players={sec.strokePlay} />
    </div>
  );

  // Drill-down: all dates stacked ("Ver todos los resultados")
  if (selected === 'all') {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setSelected(null)}
          className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a fechas
        </Button>
        {data.map(renderSection)}
      </div>
    );
  }

  // Drill-down: a single selected date
  if (selected) {
    const filtered = data.filter((s) => s.fecha === selected);
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setSelected(null)}
          className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a fechas
        </Button>
        {filtered.map(renderSection)}
      </div>
    );
  }

  // Default view: date selection grid (one card per fecha + "Ver todos")
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* "Ver todos los resultados" — full-width bar above the date grid,
            matching the style used in the groups view of other competiciones */}
        {fechas.length > 1 && (
          <Card
            className="border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all hover:shadow-lg cursor-pointer group sm:col-span-2 md:col-span-3"
            onClick={() => setSelected('all')}
          >
            <CardContent className="p-5 flex items-center justify-center gap-3">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-primary text-lg">
                Ver todos los resultados
              </h3>
            </CardContent>
          </Card>
        )}
        {fechas.map((f) => (
          <Card
            key={f.fecha}
            className="border-border/50 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
            onClick={() => setSelected(f.fecha)}
          >
            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2 min-h-[110px]">
              <span className="font-semibold text-foreground capitalize">
                {f.fechaLabel}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MejorScoreDiarioReport;