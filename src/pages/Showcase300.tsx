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

/** Single player row inside a prize group returned by /api/showcase300.php */
interface ShowcasePlayer {
  position: number;
  name: string;
  club: string;
  clubLogo: string;
  hole: number | '';
  distance: number;
}

/** Prize group returned by /api/showcase300.php */
interface ShowcasePrize {
  description: string;
  lugares: number;
  lastUpdated: string | null;
  players: ShowcasePlayer[];
}

/** JSON payload returned by /api/showcase300.php */
interface ShowcaseResponse {
  tipo: string;
  tournament: { name: string; club: string; logo: string };
  prizes: ShowcasePrize[];
}

// ============= Config =============

/**
 * Map of supported showcase types → display title. The backend endpoint
 * is the same for all five (`/api/showcase300.php?tipo=...`) — it mirrors
 * the legacy *300.php reports query-for-query and is INTENTIONALLY
 * separate from /api/oyes.php, /api/oyesx.php and /api/putt.php
 * (different tables, different join logic).
 */
const SHOWCASE_TITLES: Record<string, string> = {
  driver: 'DRIVES',
  driverp: 'DRIVER PRECISIÓN',
  approach: 'APPROACH',
  putt: 'PUTT',
  oyes: "O'YES",
  oyesx: 'OYES-X',
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
  const title = tipo ? SHOWCASE_TITLES[tipo] : undefined;
  const torneoid = getTorneoId() || '';

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
    queryFn: () =>
      apiFetch<ShowcaseResponse>(
        `${API_BASE_URL}/showcase300.php?torneoid=${torneoid}&tipo=${tipo}`,
      ),
    enabled: !!title && !!torneoid,
    refetchInterval: POLL_ACTIVE,
    staleTime: POLL_ACTIVE,
  });

  // ----- Invalid tipo guard -----
  if (!title) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-lg">
          Reporte desconocido: <code className="font-mono">{tipo}</code>
        </p>
      </div>
    );
  }

  const tournament = data?.tournament;

  return (
    <div className="showcase-tv min-h-screen bg-background text-foreground py-6 px-4 md:px-8">
      {/* Tournament header — name + club + logo */}
      <header className="max-w-6xl mx-auto mb-6 text-center">
        {tournament?.name && (
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide bg-primary text-primary-foreground py-2 rounded">
            {tournament.name}
          </h2>
        )}
        {tournament?.logo && (
          <img
            src={tournament.logo}
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
          {title}
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
      {/* Filtra premios sin jugadores: en torneos multi-día el backend
          devuelve un grupo por día (ej. "Approach día 1/2/3"), pero los
          días futuros aún no tienen ganadores. Sólo mostramos los grupos
          con al menos un jugador registrado. */}
      {(() => null)()}
      {data && data.prizes.filter((p) => p.players.length > 0).length === 0 && (
        <div className="max-w-6xl mx-auto p-6 rounded bg-card text-muted-foreground text-center">
          Aún no hay resultados registrados para este reporte.
        </div>
      )}

      {/* Prize sections */}
      <div className="max-w-6xl mx-auto space-y-6">
        {data?.prizes
          .filter((prize) => prize.players.length > 0)
          .map((prize, idx) => (
            <PrizeSection
              key={`${prize.description}-${idx}`}
              prize={prize}
              showHole={tipo === 'oyes'}
            />
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
 * Renders a single prize group (description + lugares + winners table).
 * `showHole` is true only for `tipo=oyes`, matching the legacy oyes300
 * report (driver/approach/putt/oyesx hide the hole column).
 */
const PrizeSection = ({
  prize,
  showHole,
}: {
  prize: ShowcasePrize;
  showHole: boolean;
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-primary/10 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-primary/20">
        <div>
          <h4 className="text-lg font-bold text-foreground">
            GRUPO: {prize.description}
          </h4>
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

      <div className="overflow-x-auto bg-white">
        <Table className="tournament-table">
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="text-primary-foreground font-bold w-16 text-center">
                Po
              </TableHead>
              <TableHead className="text-primary-foreground font-bold w-20 text-center">
                Club
              </TableHead>
              <TableHead className="text-primary-foreground font-bold">
                Jugador
              </TableHead>
              {showHole && (
                <TableHead className="text-primary-foreground font-bold text-center w-20">
                  Ho
                </TableHead>
              )}
              <TableHead className="text-primary-foreground font-bold text-right w-32">
                Dist
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prize.players.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showHole ? 5 : 4}
                  className="text-center text-muted-foreground py-6"
                >
                  Sin ganadores registrados.
                </TableCell>
              </TableRow>
            ) : (
              prize.players.map((p, i) => (
                <TableRow key={`${prize.description}-${p.position}-${i}`}>
                  <TableCell className="text-center font-bold">
                    {p.position}
                  </TableCell>
                  <TableCell className="text-center">
                    {p.clubLogo && (
                      <img
                        src={p.clubLogo}
                        alt={p.club || 'Club'}
                        className="h-6 mx-auto object-contain"
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  {showHole && (
                    <TableCell className="text-center font-bold">
                      {p.hole || ''}
                    </TableCell>
                  )}
                  <TableCell className="text-right font-mono font-bold text-primary">
                    {p.distance}
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