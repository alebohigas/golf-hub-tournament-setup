/**
 * PuttCalificados Page
 * Standalone full-screen showcase de la lista de CLASIFICADOS al bracket
 * de Putt Finales por sexo. Pensada para pantallas del club (TV).
 *
 * Route: /showcase/calificados/:sexo  donde sexo ∈ m|f
 *
 * Comportamiento:
 *  - Sin Layout/Header (similar a /showcase/:tipo).
 *  - Auto-refresca la página completa cada 5 minutos.
 *  - Reusa PuttCalificadosSlide para el contenido principal.
 *  - Aplica la clase `.showcase-tv` para tipografía grande y zebra
 *    striping en la tabla.
 */

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getTournamentUrl, POLL_SLOW } from '@/config/api';
import PuttCalificadosSlide from '@/components/showcase/slides/PuttCalificadosSlide';
import { useAutoScrollLoop } from '@/hooks/useAutoScrollLoop';

/** Subset usado para el header del torneo. */
interface TournamentInfo {
  tournament?: { name?: string; club?: string; logo?: string };
}

/** Recarga completa cada 5 min para mirror del comportamiento *300. */
const RELOAD_INTERVAL_MS = 300_000;

const PuttCalificados = () => {
  const { sexo } = useParams<{ sexo: string }>();
  const sx = (sexo ?? '').toUpperCase() === 'F' ? 'F' : 'M';

  // ----- Auto-reload cada 5 min -----
  useEffect(() => {
    const t = window.setTimeout(() => window.location.reload(), RELOAD_INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Autoscroll en loop infinito (single-report mode).
  useAutoScrollLoop({ speedPxPerSec: 30, holdTopMs: 2500, holdBottomMs: 3000 });

  // ----- Header (nombre/club/logo del torneo) -----
  const { data: tInfo } = useQuery<TournamentInfo>({
    queryKey: ['calificados-tournament'],
    queryFn: () => apiFetch<TournamentInfo>(getTournamentUrl()),
    staleTime: POLL_SLOW,
  });
  const tournament = tInfo?.tournament;

  return (
    <div className="showcase-tv min-h-screen bg-background text-foreground py-6 px-4 md:px-8">
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

      <PuttCalificadosSlide sexo={sx as 'M' | 'F'} />

      <footer className="max-w-6xl mx-auto mt-8 text-center text-xs text-muted-foreground">
        Actualización automática cada 5 minutos.
      </footer>
    </div>
  );
};

export default PuttCalificados;
