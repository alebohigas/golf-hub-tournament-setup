/**
 * MejorScoreSlide
 * ----------------------------------------------------------------------------
 * Renderiza un día específico del reporte "Mejor Score Diario" para usarse
 * como slide en el rotador `/showcase/rotacion`. Reusa el shape de
 * MejorScoreDiarioReport pero sin la UI de drill-down.
 */

import { useQuery } from '@tanstack/react-query';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_BASE_URL, LOGOS_BASE_URL, POLL_SHOWCASE } from '@/config/api';
import { getTorneoId } from '@/hooks/useTorneoId';

interface MejorScorePlayer {
  jugador: string;
  cat: string;
  score: number;
  clubLogo: string;
}

interface MejorScoreSection {
  premio: number;
  fecha: string;
  fechaLabel: string;
  stableford: MejorScorePlayer[];
  strokePlay: MejorScorePlayer[];
}

/** Pequeña tabla reusada para Stableford y Stroke Play. */
const PlayersTable = ({ title, players }: { title: string; players: MejorScorePlayer[] }) => {
  if (!players.length) return null;
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">{title}</div>
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
                  {p.clubLogo && (
                    <img
                      src={`${LOGOS_BASE_URL}${p.clubLogo}`}
                      alt="Club"
                      className="w-auto object-contain rounded inline-block"
                      style={{ height: '2.1375rem' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
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

interface Props { fecha: string }

/**
 * Renderiza todas las secciones (premios) de una fecha. Si el backend
 * devuelve varias entradas (premio 1, premio 2) las apila bajo el mismo
 * label de fecha.
 */
const MejorScoreSlide = ({ fecha }: Props) => {
  const torneoid = getTorneoId() || '';
  const { data, isLoading } = useQuery<MejorScoreSection[]>({
    queryKey: ['mejor-score-diario', torneoid, 'slide'],
    queryFn: () =>
      apiFetch<MejorScoreSection[]>(
        `${API_BASE_URL}/mejor_score_diario.php?torneoid=${torneoid}`,
      ),
    enabled: !!torneoid,
    refetchInterval: POLL_SHOWCASE,
    staleTime: POLL_SHOWCASE,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const secs = (data ?? []).filter((s) => s.fecha === fecha);
  if (secs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 rounded bg-card text-muted-foreground text-center">
        Sin datos para esta fecha.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold border-b-2 border-primary pb-2 mb-4">
        SCORE DEL DÍA
      </h1>
      {secs.map((sec, idx) => (
        <div key={`${sec.premio}-${idx}`} className="mb-8">
          <h4 className="text-base font-bold text-primary mb-4 capitalize">{sec.fechaLabel}</h4>
          <PlayersTable title="Stableford" players={sec.stableford} />
          <PlayersTable title="Stroke Play" players={sec.strokePlay} />
        </div>
      ))}
    </div>
  );
};

export default MejorScoreSlide;