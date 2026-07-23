/**
 * Showcase300Slide
 * ----------------------------------------------------------------------------
 * Renderiza UN premio (un día/un grupo) de los reportes 300
 * (driver/approach/putt/oyes/oyesx) para usarse como slide dentro del
 * rotador `/showcase/rotacion`.
 *
 * Recibe `tipo` y `prizeIdx` (índice del premio dentro del array original
 * tal como llega del backend, ANTES de filtrar). Si el premio quedó sin
 * jugadores (datos cambiantes) renderiza un placeholder.
 */

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_BASE_URL, POLL_SHOWCASE } from '@/config/api';
import { getTorneoId } from '@/hooks/useTorneoId';
import { useShowcaseCategoryStickyHeight } from '@/hooks/useShowcaseCategoryStickyHeight';

/** Jugador dentro de un premio 300. */
interface ShowcasePlayer {
  position: number;
  name: string;
  club: string;
  clubLogo: string;
  hole: number | '';
  distance: number;
}

/** Premio dentro de la respuesta 300. */
interface ShowcasePrize {
  description: string;
  lugares: number;
  lastUpdated: string | null;
  players: ShowcasePlayer[];
}

/** Respuesta completa del endpoint. */
interface ShowcaseResponse {
  tipo: string;
  tournament: { name: string; club: string; logo: string };
  prizes: ShowcasePrize[];
}

/** Títulos por tipo, idéntico al usado en Showcase300.tsx. */
const TITLES: Record<string, string> = {
  driver: 'DRIVES',
  driverp: 'DRIVER PRECISIÓN',
  approach: 'APPROACH',
  putt: 'PUTT',
  oyes: "O'YES",
  oyesx: 'OYES-X',
};

interface Props {
  /** driver|approach|putt|oyes|oyesx */
  tipo: string;
  /** Índice del premio dentro del array `prizes` original. */
  prizeIdx: number;
}

/**
 * Showcase300Slide
 * Hace su propio fetch del endpoint para mantenerse desacoplado del
 * rotador (cada slide refresca su data en intervalos POLL_SHOWCASE).
 */
const Showcase300Slide = ({ tipo, prizeIdx }: Props) => {
  // Alto del bloque "GRUPO: ..." → CSS var para posicionar el thead sticky.
  const catStickyRef = useShowcaseCategoryStickyHeight<HTMLDivElement>();
  const torneoid = getTorneoId() || '';
  const { data, isLoading } = useQuery<ShowcaseResponse>({
    queryKey: ['showcase300', tipo, torneoid, 'slide'],
    queryFn: () =>
      apiFetch<ShowcaseResponse>(
        `${API_BASE_URL}/showcase300.php?torneoid=${torneoid}&tipo=${tipo}`,
      ),
    enabled: !!torneoid,
    refetchInterval: POLL_SHOWCASE,
    staleTime: POLL_SHOWCASE,
  });

  const title = TITLES[tipo] ?? tipo.toUpperCase();
  const prize = data?.prizes?.[prizeIdx];
  const showHole = tipo === 'oyes';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!prize) {
    return (
      <div className="max-w-6xl mx-auto p-6 rounded bg-card text-muted-foreground text-center">
        Sin datos para este premio.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold border-b-2 border-primary pb-2 mb-4">
        {title}
      </h1>
      {/* `overflow-visible` es crítico para que `position: sticky` de los hijos
          (título de grupo y <thead>) se ancle al viewport y no al Card. */}
      <Card className="overflow-visible">
        {/* Wrapper sticky opaco: mantiene visible "GRUPO: ..." durante el
            autoscroll del rotador. Ver .showcase-prize-sticky en index.css. */}
        <div ref={catStickyRef} className="showcase-prize-sticky bg-primary/10 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-primary/20">
          <div>
            <h4 className="text-lg font-bold text-foreground">GRUPO: {prize.description}</h4>
            <p className="text-sm">
              <span className="text-muted-foreground">Lugares: </span>
              <span className="font-bold text-primary">{prize.lugares}</span>
            </p>
          </div>
          {prize.lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Última actualización: {prize.lastUpdated}
            </span>
          )}
        </div>

        {/* Sin overflow-x-auto — rompe sticky del thead contra el viewport. */}
        <div className="bg-white">
          <Table className="tournament-table">
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary">
                <TableHead className="text-primary-foreground font-bold w-16 text-center">Po</TableHead>
                <TableHead className="text-primary-foreground font-bold w-20 text-center">Club</TableHead>
                <TableHead className="text-primary-foreground font-bold">Jugador</TableHead>
                {showHole && (
                  <TableHead className="text-primary-foreground font-bold text-center w-20">Ho</TableHead>
                )}
                <TableHead className="text-primary-foreground font-bold text-right w-32">Dist</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prize.players.map((p, i) => (
                <TableRow key={`${prize.description}-${p.position}-${i}`}>
                  <TableCell className="text-center font-bold">{p.position}</TableCell>
                  <TableCell className="text-center">
                    {p.clubLogo && (
                      <img src={p.clubLogo} alt={p.club || 'Club'}
                           className="h-6 mx-auto object-contain" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  {showHole && (
                    <TableCell className="text-center font-bold">{p.hole || ''}</TableCell>
                  )}
                  <TableCell className="text-right font-mono font-bold text-primary">
                    {p.distance}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Showcase300Slide;