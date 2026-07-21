/**
 * ClubesAsistentesSection
 * ---------------------------------------------------------------
 * First section of /stats. Renders a "Clubes Asistentes" table:
 * one row per club with counts split into Caballeros / Seniors /
 * Damas, plus per-club total, and a big header with the tournament-
 * wide total number of players. Admin may pin a manual total via
 * `overrideTotal` — when set (>0) it replaces the API-computed sum.
 * ---------------------------------------------------------------
 */

import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';
import { useStatsClubes } from '@/hooks/useStatsData';

interface Props {
  /** Manual override for the big "Total de Jugadores" number (null = auto). */
  overrideTotal?: number | null;
}

const ClubesAsistentesSection = ({ overrideTotal }: Props) => {
  const { data, isLoading } = useStatsClubes();

  const total =
    overrideTotal !== null && overrideTotal !== undefined && overrideTotal > 0
      ? overrideTotal
      : data?.total ?? 0;

  const clubs = data?.clubs ?? [];

  /** Column totals for the footer row */
  const sums = clubs.reduce(
    (acc, c) => ({
      caballeros: acc.caballeros + c.caballeros,
      seniors: acc.seniors + c.seniors,
      damas: acc.damas + c.damas,
      total: acc.total + c.total,
    }),
    { caballeros: 0, seniors: 0, damas: 0, total: 0 },
  );

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardContent className="p-0">
        {/* Section header */}
        <div className="bg-primary text-primary-foreground px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6" />
            <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide">
              Clubes Asistentes
            </h2>
          </div>
          <div className="text-primary-foreground/90 text-sm md:text-base">
            Total de Jugadores:{' '}
            <span className="font-mono font-bold text-lg md:text-xl text-accent">
              {total.toLocaleString('es-MX')}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Cargando clubes...
          </div>
        ) : clubs.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No hay jugadores registrados aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold w-16">Logo</th>
                  <th className="text-left px-4 py-3 font-semibold">Club</th>
                  <th className="text-center px-4 py-3 font-semibold">Caballeros</th>
                  <th className="text-center px-4 py-3 font-semibold">Seniors</th>
                  <th className="text-center px-4 py-3 font-semibold">Damas</th>
                  <th className="text-center px-4 py-3 font-semibold text-primary">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((club, idx) => (
                  <tr
                    key={`${club.id ?? 'null'}-${idx}`}
                    className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-2">
                      {club.logo ? (
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="h-6 w-auto max-w-[48px] object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-6 w-8 bg-muted rounded" />
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium">{club.name}</td>
                    <td className="px-4 py-2 text-center tabular-nums">
                      {club.caballeros || '—'}
                    </td>
                    <td className="px-4 py-2 text-center tabular-nums">
                      {club.seniors || '—'}
                    </td>
                    <td className="px-4 py-2 text-center tabular-nums">
                      {club.damas || '—'}
                    </td>
                    <td className="px-4 py-2 text-center font-bold tabular-nums text-primary">
                      {club.total}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-primary/10 border-t-2 border-primary font-bold">
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 uppercase tracking-wide">Totales</td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    {sums.caballeros}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">{sums.seniors}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{sums.damas}</td>
                  <td className="px-4 py-3 text-center tabular-nums text-primary text-base">
                    {sums.total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubesAsistentesSection;