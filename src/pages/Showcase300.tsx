/**
 * Showcase300 Page
 * Standalone full-screen page that mirrors the legacy *300.php reports
 * (driver300 / approach300 / putt300 / oyes300 / oyesx300) using the
 * project's modern table styling.
 *
 * Route: /showcase/:tipo  where tipo ∈ driver|approach|putt|oyes|oyesx
 *
 * Behavior:
 *  - No Header/Layout chrome — designed to be opened in a new window
 *    (e.g. on a lobby TV).
 *  - Auto-refreshes every 300 seconds to match the original PHP pages
 *    (`<meta http-equiv="refresh" content="300">`).
 *  - Renders the tournament header (name + club + logo) followed by one
 *    table per prize group returned by the corresponding JSON endpoint.
 */

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { API_BASE_URL, POLL_ACTIVE } from '@/config/api';
import { getTorneoId } from '@/hooks/useTorneoId';
import { useTournamentInfo } from '@/hooks/useTournamentData';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

// ============= Types =============

/** Single player row inside a prize group returned by the JSON API */
interface ShowcasePlayer {
  position: number;
  playerId: string | number;
  name: string;
  distance: number;
  hole: number;
  club: string;
  clubLogo: string;
}

/** Prize group returned by oyes.php / oyesx.php / putt.php */
interface ShowcasePrize {
  prizeId: string | number;
  description: string;
  hole: number;
  lastUpdated: string | null;
  players: ShowcasePlayer[];
}

/** JSON payload shape returned by all three endpoints */
interface ShowcaseResponse {
  prizes: ShowcasePrize[];
}

// ============= Config =============

/**
 * Map of supported showcase types → endpoint URL builder + display title.
 * Driver and Approach reuse oyesx.php with the `tipo` filter that exists
 * in the backend (see server/api/oyesx.php).
 */
const SHOWCASE_CONFIG: Record<
  string,
  { title: string; buildUrl: (torneoid: string) => string }
> = {
  driver: {
    title: 'DRIVER',
    buildUrl: (tid) => `${API_BASE_URL}/oyesx.php?torneoid=${tid}&tipo=driver`,
  },
  approach: {
    title: 'APPROACH',
    buildUrl: (tid) => `${API_BASE_URL}/oyesx.php?torneoid=${tid}&tipo=approach`,
  },
  putt: {
    title: 'PUTT',
    buildUrl: (tid) => `${API_BASE_URL}/putt.php?torneoid=${tid}`,
  },
  oyes: {
    title: "O'YES",
    buildUrl: (tid) => `${API_BASE_URL}/oyes.php?torneoid=${tid}`,
  },
  oyesx: {
    title: 'OYES-X',
    buildUrl: (tid) => `${API_BASE_URL}/oyesx.php?torneoid=${tid}`,
  },
};

/** Reload the entire page every 300 seconds (matches PHP meta refresh) */
const RELOAD_INTERVAL_MS = 300_000;

// ============= Component =============

/**
 * Showcase300
 * Reads the :tipo path param, fetches the matching prizes feed, and
 * renders it. Schedules a full-page reload every 5 minutes.
 */
const Showcase300 = () => {
  const { tipo } = useParams<{ tipo: string }>();
  const config = tipo ? SHOWCASE_CONFIG[tipo] : undefined;
  const torneoid = getTorneoId() || '';
  const { data: tournament } = useTournamentInfo();

  // ----- Auto-reload every 300s to mirror legacy <meta refresh="300"> -----
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.reload();
    }, RELOAD_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // ----- Fetch the matching prize feed -----
  const { data, isLoading, error } = useQuery<ShowcaseResponse>({
    queryKey: ['showcase300', tipo, torneoid],
    queryFn: () => apiFetch<ShowcaseResponse>(config!.buildUrl(torneoid)),
    enabled: !!config && !!torneoid,
    refetchInterval: POLL_ACTIVE,
    staleTime: POLL_ACTIVE,
  });

  // ----- Invalid tipo guard -----
  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-lg">
          Reporte desconocido: <code className="font-mono">{tipo}</code>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-6 px-4 md:px-8">
      {/* Tournament header — name + club + logo */}
      <header className="max-w-6xl mx-auto mb-6 text-center">
        {tournament?.name && (
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide bg-primary text-primary-foreground py-2 rounded">
            {tournament.name}
          </h2>
        )}
        {tournament?.logoUrl && (
          <img
            src={tournament.logoUrl}
            alt={tournament?.name || 'Club logo'}
            className="mx-auto my-3 h-16 object-contain"
          />
        )}
        {tournament?.club && (
          <h3 className="text-base md:text-lg font-semibold bg-primary text-primary-foreground py-1 rounded">
            {tournament.club}
          </h3>
        )}
      </header>

      {/* Section title */}
      <div className="max-w-6xl mx-auto mb-4">
        <h1 className="text-3xl md:text-4xl font-bold border-b-2 border-primary pb-2">
          {config.title}
        </h1>
      </div>

      {/* Loading / error / empty states */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {error && (
        <div className="max-w-6xl mx-auto p-4 rounded bg-destructive/10 text-destructive">
          Error al cargar datos: {(error as Error).message}
        </div>
      )}
      {data && data.prizes.length === 0 && (
        <div className="max-w-6xl mx-auto p-6 rounded bg-card text-muted-foreground text-center">
          No hay premios registrados para este torneo.
        </div>
      )}

      {/* Prize sections */}
      <div className="max-w-6xl mx-auto space-y-6">
        {data?.prizes.map((prize) => (
          <PrizeSection key={String(prize.prizeId)} prize={prize} />
        ))}
      </div>

      {/* Footer — refresh hint */}
      <footer className="max-w-6xl mx-auto mt-8 text-center text-xs text-muted-foreground">
        Actualización automática cada 5 minutos.
      </footer>
    </div>
  );
};

// ============= Sub-component: PrizeSection =============

/**
 * PrizeSection
 * Renders a single prize group (description + hole + winners table).
 */
const PrizeSection = ({ prize }: { prize: ShowcasePrize }) => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-primary/10 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-primary/20">
        <div>
          <h4 className="text-lg font-bold text-foreground">
            {prize.description}
          </h4>
          {prize.hole > 0 && (
            <p className="text-sm text-muted-foreground">Hoyo {prize.hole}</p>
          )}
        </div>
        {prize.lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Última actualización: {prize.lastUpdated}
          </span>
        )}
      </div>

      <div className="overflow-x-auto bg-white">
        <Table className="tournament-table">
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="text-primary-foreground font-bold w-16 text-center">
                #
              </TableHead>
              <TableHead className="text-primary-foreground font-bold">
                Jugador
              </TableHead>
              <TableHead className="text-primary-foreground font-bold">
                Club
              </TableHead>
              <TableHead className="text-primary-foreground font-bold text-center w-20">
                Hoyo
              </TableHead>
              <TableHead className="text-primary-foreground font-bold text-right w-32">
                Distancia
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prize.players.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-6"
                >
                  Sin ganadores registrados.
                </TableCell>
              </TableRow>
            ) : (
              prize.players.map((p) => (
                <TableRow key={`${prize.prizeId}-${p.playerId}`}>
                  <TableCell className="text-center font-bold">
                    {p.position}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {p.clubLogo && (
                        <img
                          src={p.clubLogo}
                          alt={p.club}
                          className="h-6 object-contain"
                        />
                      )}
                      <span>{p.club}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{p.hole || '-'}</TableCell>
                  <TableCell className="text-right font-mono">
                    {p.distance} mts
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default Showcase300;