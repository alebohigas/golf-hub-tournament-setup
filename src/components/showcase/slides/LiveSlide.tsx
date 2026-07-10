/**
 * LiveSlide
 * ----------------------------------------------------------------------------
 * Slide del rotador `/showcase/rotacion` que renderiza el leaderboard EN VIVO
 * de una categoría configurada desde /admin (site_config → live_scoring_config).
 *
 * - Fetch: /api/live_scoring.php?catid=&tipo=&gross= — mismo endpoint que /live.
 * - Poll: POLL_LIVE (100 s) para mantener datos frescos en la pantalla del club.
 * - Render: tabla simplificada (Pos · Club · Jugador · Total · Thru · Hoy) sin
 *   scorecards expandibles ni interacción — pensado para TV/rotación.
 * - Soporta categorías PAREJAS mostrando ambos integrantes apilados.
 */
import { Loader2, Radio } from 'lucide-react';
import { Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getLiveScoringUrl, POLL_LIVE } from '@/config/api';

// ============= Tipos (subset de /api/live_scoring.php) =============

/** Jugador de la respuesta live_scoring.php (union de stroke + stableford). */
interface LivePlayer {
  position: number;
  playerId: string;
  name: string;
  club: string;
  clubLogo: string;
  clubLogo2?: string;
  partner?: string;
  score: number;
  todayScore: number;
  thru: number;
  finished?: number;
  prevRoundDates?: string[];
}

/** Respuesta del endpoint. */
interface LiveScoringResponse {
  categoryId: string;
  categoryName: string;
  shortName: string;
  type: 'stroke' | 'stableford';
  gross: number;
  par: number;
  currentRoundDate?: string | null;
  players: LivePlayer[];
}

// ============= Props =============

interface Props {
  /** Category id (puede contener ':' internos). */
  catid: string;
  /** Modo de puntuación de la categoría. */
  tipo: 'stroke' | 'stableford';
  /** 0 = NETO, 1 = GROSS. */
  gross: 0 | 1;
}

// ============= Helpers =============

/** Muestra "+N", "-N" o "E" para stroke. */
const formatDifPar = (v: number): string => {
  if (v === 0) return 'E';
  return v > 0 ? `+${v}` : String(v);
};

/** Color rojo para under-par, negro para el resto. */
const strokeClass = (v: number): string =>
  v < 0 ? 'text-red-600 font-bold' : 'text-foreground font-bold';

/**
 * Un jugador se considera terminado (F) para el thru cuando su fecha de la
 * ronda actual ya aparece en `prevRoundDates`, o cuando el backend puso
 * `finished=1`, o (fallback) cuando thru >= 18.
 */
const isFinished = (p: LivePlayer, currentRoundDate?: string | null): boolean => {
  if (currentRoundDate && p.prevRoundDates?.includes(currentRoundDate)) return true;
  if (typeof p.finished === 'number') return p.finished === 1;
  return p.thru >= 18;
};

// ============= Component =============

const LiveSlide = ({ catid, tipo, gross }: Props) => {
  const { data, isLoading } = useQuery<LiveScoringResponse>({
    queryKey: ['live-slide', catid, tipo, gross],
    queryFn: () => apiFetch<LiveScoringResponse>(
      getLiveScoringUrl(catid, tipo, String(gross)),
    ),
    refetchInterval: POLL_LIVE,
    staleTime: POLL_LIVE,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isStroke = data.type === 'stroke' || tipo === 'stroke';
  const currentRoundDate = data.currentRoundDate ?? null;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold border-b-2 border-primary pb-2 flex items-center justify-center gap-2">
          <Radio className="h-6 w-6 text-primary animate-pulse" />
          {data.categoryName}
        </h1>
        <div className="flex justify-center gap-2 mt-3">
          <span className={`inline-block px-4 py-1 rounded-full text-white font-semibold ${
            isStroke ? 'bg-blue-600' : 'bg-primary'
          }`}>
            {isStroke ? 'Stroke Play' : 'Stableford'}
          </span>
          {gross === 1 && (
            <span className="inline-block px-4 py-1 rounded-full border border-border text-foreground font-semibold">
              GROSS
            </span>
          )}
          {typeof data.par === 'number' && (
            <span className="inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground font-semibold">
              Par {data.par}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-md border border-border overflow-x-auto">
        <table className="w-full text-sm tournament-table">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="p-2 text-center w-16">Pos</th>
              <th className="p-2 text-center w-20">Club</th>
              <th className="p-2 text-left">Jugador</th>
              <th className="p-2 text-center w-24">
                {isStroke ? 'Dif Par' : 'Total'}
              </th>
              <th className="p-2 text-center w-20">Thru</th>
              <th className="p-2 text-center w-24">Hoy</th>
            </tr>
          </thead>
          <tbody>
            {data.players.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Sin jugadores en vivo.
                </td>
              </tr>
            ) : data.players.map((p) => {
              const isPair = !!p.partner;
              const rs = isPair ? 2 : 1;
              const finished = isFinished(p, currentRoundDate);
              // Total mostrado replica la lógica de /live: si hay rondas
              // previas cerradas, suma la ronda en curso solo mientras la
              // fecha de la ronda actual NO esté en prevRoundDates (para no
              // duplicar cuando la tarjeta del día ya se cerró).
              const hasPrev = (p.prevRoundDates?.length ?? 0) > 0;
              const todayClosed = !!(currentRoundDate && p.prevRoundDates?.includes(currentRoundDate));
              const todayVal = Number.isFinite(p.todayScore) ? p.todayScore : 0;
              const displayTotal = hasPrev
                ? ((p.score ?? 0) + (todayClosed ? 0 : todayVal))
                : todayVal;
              const thruText = finished ? 'F' : (p.thru === 0 ? '-' : String(p.thru));
              return (
                <Fragment key={p.playerId}>
                  <tr className="border-t border-border">
                    <td rowSpan={rs} className="p-2 text-center font-bold align-middle">
                      {p.position}
                    </td>
                    <td className="p-1 text-center align-middle">
                      {p.clubLogo ? (
                        <img src={p.clubLogo} alt={p.club || ''}
                             className="h-8 inline-block object-contain" />
                      ) : <span className="text-xs">{p.club}</span>}
                    </td>
                    <td className="p-2 align-middle font-medium">{p.name}</td>
                    <td rowSpan={rs}
                        className={`p-2 text-center align-middle ${
                          isStroke ? strokeClass(displayTotal) : 'font-bold'
                        }`}>
                      {isStroke ? formatDifPar(displayTotal) : displayTotal}
                    </td>
                    <td rowSpan={rs}
                        className={`p-2 text-center align-middle ${finished ? 'font-bold text-green-700' : ''}`}>
                      {thruText}
                    </td>
                    <td rowSpan={rs}
                        className={`p-2 text-center align-middle ${
                          isStroke ? strokeClass(todayVal) : 'font-semibold'
                        }`}>
                      {isStroke ? formatDifPar(todayVal) : (p.todayScore ?? '-')}
                    </td>
                  </tr>
                  {isPair && (
                    <tr className="border-b border-border">
                      <td className="p-1 text-center align-middle">
                        {p.clubLogo2 ? (
                          <img src={p.clubLogo2} alt=""
                               className="h-8 inline-block object-contain" />
                        ) : <span className="text-xs">—</span>}
                      </td>
                      <td className="p-2 align-middle font-medium">{p.partner}</td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveSlide;