/**
 * EstadisticasJugadorSection
 * ---------------------------------------------------------------
 * Third section of /stats. Uses the same PlayerSearchInput as the
 * /competicion page to look up a player, then renders their hole-by-
 * hole scorecard across every round played, plus per-hole averages
 * and the course's rango (handicap difficulty) row.
 * ---------------------------------------------------------------
 */

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PlayerSearchInput from '@/components/shared/PlayerSearchInput';
import { Loader2, User } from 'lucide-react';
import { useStatsJugadoresList, useStatsJugador } from '@/hooks/useStatsData';

interface Props {
  /** Optional admin-provided note rendered above the search input. */
  note?: string | null;
}

const EstadisticasJugadorSection = ({ note }: Props) => {
  const { data: listData } = useStatsJugadoresList();
  const players = listData?.players ?? [];

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  /** Unique player names for the autocomplete dropdown. */
  const suggestions = useMemo(
    () => Array.from(new Set(players.map((p) => p.name))).sort((a, b) => a.localeCompare(b, 'es')),
    [players],
  );

  /** Resolve a name to a jugadorid — picks the first exact-name match. */
  const handleSubmit = (name: string) => {
    const clean = name.trim().toLowerCase();
    if (!clean) { setSelectedId(null); return; }
    const match = players.find((p) => p.name.trim().toLowerCase() === clean);
    if (match) { setError(false); setSelectedId(match.id); }
    else { setError(true); setSelectedId(null); }
  };

  const { data: playerStats, isLoading } = useStatsJugador(selectedId);

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-0">
        {/* Section header — rounded top corners since Card no longer clips */}
        <div className="bg-primary text-primary-foreground px-6 py-5 flex items-center gap-3 rounded-t-lg">
          <User className="h-6 w-6" />
          <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide">
            Estadísticas por Jugador
          </h2>
        </div>

        <div className="p-4 md:p-6 space-y-4 overflow-visible">
          {note && (
            <div className="text-sm bg-accent/10 border border-accent/30 rounded-md px-4 py-2 text-foreground">
              {note}
            </div>
          )}

          <PlayerSearchInput
            value={query}
            onChange={(v) => { setQuery(v); if (error) setError(false); if (!v) setSelectedId(null); }}
            onSubmit={handleSubmit}
            suggestions={suggestions}
            error={error}
            errorMessage="No se encontró ese jugador"
            placeholder="Buscar jugador por nombre..."
            className="max-w-md"
          />

          {selectedId && (
            isLoading || !playerStats?.player ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Cargando estadísticas...
              </div>
            ) : (
              <PlayerStatsTable data={playerStats} />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============= Inner table =============

/**
 * Renders the hole-by-hole scorecard for the selected player:
 *   - Par row
 *   - One row per round (R1, R2, ...)
 *   - Promedio row (per-hole average across all rounds)
 *   - Rango row (course difficulty from hoyosxsalida.ventaja)
 */
const PlayerStatsTable = ({ data }: { data: NonNullable<ReturnType<typeof useStatsJugador>['data']> }) => {
  const { player, holes, rounds, averages } = data;

  /** Sums for header row (par OUT/IN/TOTAL). */
  const parOut = holes.slice(0, 9).reduce((s, h) => s + (h.par ?? 0), 0);
  const parIn = holes.slice(9).reduce((s, h) => s + (h.par ?? 0), 0);

  const renderCell = (v: number | null, cls = '') => (
    <td className={`px-2 py-1.5 text-center tabular-nums text-sm ${cls}`}>{v ?? '—'}</td>
  );

  return (
    <div className="space-y-3">
      {/* Player identity */}
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-foreground">{player!.name}</h3>
        <p className="text-sm text-muted-foreground">
          {[player!.club, player!.categoria].filter(Boolean).join(' · ')}
          {player!.course && (
            <>
              {' · '}
              <span className="text-foreground font-semibold">{player!.course}</span>
            </>
          )}
          {player!.tee && (
            <>
              {' · Tee '}
              <span className="text-foreground font-semibold">{player!.tee}</span>
            </>
          )}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm border border-border rounded overflow-hidden">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="px-2 py-2 text-left font-semibold w-20 sticky left-0 bg-primary z-20">Hoyo</th>
              {holes.slice(0, 9).map((h) => (
                <th key={h.hole} className="px-2 py-2 text-center font-semibold">
                  H{String(h.hole).padStart(2, '0')}
                </th>
              ))}
              <th className="px-2 py-2 text-center font-semibold bg-primary/80">OUT</th>
              {holes.slice(9).map((h) => (
                <th key={h.hole} className="px-2 py-2 text-center font-semibold">
                  H{String(h.hole).padStart(2, '0')}
                </th>
              ))}
              <th className="px-2 py-2 text-center font-semibold bg-primary/80">IN</th>
              <th className="px-2 py-2 text-center font-semibold bg-accent text-accent-foreground">
                TOT
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Par row — solid bg so sticky first column hides scrolled content */}
            <tr className="font-semibold" style={{ background: '#eeeae0' }}>
              <td className="px-2 py-1.5 uppercase text-xs sticky left-0 z-10" style={{ background: '#eeeae0' }}>Par</td>
              {holes.slice(0, 9).map((h) => renderCell(h.par))}
              <td className="px-2 py-1.5 text-center tabular-nums font-bold">{parOut}</td>
              {holes.slice(9).map((h) => renderCell(h.par))}
              <td className="px-2 py-1.5 text-center tabular-nums font-bold">{parIn}</td>
              <td className="px-2 py-1.5 text-center tabular-nums font-bold">
                {parOut + parIn}
              </td>
            </tr>

            {/* One row per round */}
            {rounds.map((r) => (
              <tr key={r.label} className="border-t border-border/60 hover:bg-muted/30" style={{ background: '#ffffff' }}>
                <td className="px-2 py-1.5 font-semibold uppercase text-xs sticky left-0 z-10" style={{ background: '#ffffff' }}>{r.label}</td>
                {r.scores.slice(0, 9).map((s, i) => renderCell(s, scoreClass(s, holes[i]?.par)))}
                <td className="px-2 py-1.5 text-center tabular-nums font-bold text-primary">
                  {r.out || '—'}
                </td>
                {r.scores.slice(9).map((s, i) =>
                  renderCell(s, scoreClass(s, holes[i + 9]?.par)),
                )}
                <td className="px-2 py-1.5 text-center tabular-nums font-bold text-primary">
                  {r.in || '—'}
                </td>
                <td className="px-2 py-1.5 text-center tabular-nums font-bold text-accent-foreground bg-accent/20">
                  {r.total || '—'}
                </td>
              </tr>
            ))}

            {/* Promedio row — solid green tint (no alpha) so sticky cell is opaque */}
            <tr className="font-semibold border-t-2 border-primary/40" style={{ background: '#e6efe6' }}>
              <td className="px-2 py-1.5 uppercase text-xs sticky left-0 z-10" style={{ background: '#e6efe6' }}>Prom.</td>
              {averages.slice(0, 9).map((v, i) => renderCell(v))}
              <td className="px-2 py-1.5" />
              {averages.slice(9).map((v, i) => renderCell(v))}
              <td className="px-2 py-1.5" />
              <td className="px-2 py-1.5" />
            </tr>

            {/* Rango row — solid cream for sticky cell opacity */}
            <tr className="text-xs italic" style={{ background: '#f2eee4' }}>
              <td className="px-2 py-1.5 uppercase sticky left-0 z-10" style={{ background: '#f2eee4' }}>Rango</td>
              {holes.slice(0, 9).map((h) => renderCell(h.rango))}
              <td className="px-2 py-1.5" />
              {holes.slice(9).map((h) => renderCell(h.rango))}
              <td className="px-2 py-1.5" />
              <td className="px-2 py-1.5" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** Semantic color for a single score cell based on the diff to par. */
function scoreClass(score: number | null, par: number | null | undefined): string {
  if (score === null || par === null || par === undefined) return '';
  const diff = score - par;
  if (diff <= -2) return 'text-amber-600 dark:text-amber-400 font-bold';
  if (diff === -1) return 'text-green-600 dark:text-green-400 font-semibold';
  if (diff === 0) return 'text-foreground';
  if (diff === 1) return 'text-orange-600 dark:text-orange-400';
  if (diff >= 2) return 'text-destructive font-semibold';
  return '';
}

export default EstadisticasJugadorSection;