/**
 * ClubesAsistentesSection
 * ---------------------------------------------------------------
 * First section of /stats. Renders a "Clubes Asistentes" table with
 * one row per club broken into Caballeros / Seniors / Super Senior /
 * Damas + total + percentage of tournament.
 *
 * Features
 *  - Dynamic per-tee (salida color) multi-select filter. When any
 *    subset is selected only those tees contribute to the shown totals.
 *  - Club identifier is either full name or abbreviation depending on
 *    the admin toggle (site_config.stats_page_config.overrides.clubNameField).
 *  - Sticky column header row + sticky "Club" column for long lists.
 *  - Total-de-clubes and Total-de-jugadores summary chips in the header.
 *  - Companion "NO SHOW" summary card rendered below the table with
 *    Retiro / No Show / Descalificado counts.
 *
 * The heavy lifting (per-tee breakdown + no-show counts) is done in
 * server/api/stats_clubes.php; this component only aggregates
 * client-side according to the current tee filter selection.
 * ---------------------------------------------------------------
 */

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Filter, UserX } from 'lucide-react';
import { useStatsClubes, type StatsTee } from '@/hooks/useStatsData';
import { useSiteConfig } from '@/hooks/useSiteConfig';

interface Props {
  /** Manual override for the big "Total de Jugadores" number (null = auto). */
  overrideTotal?: number | null;
}

/** Empty branch counts template — reused for aggregation zero state. */
const EMPTY_BRANCH = { caballeros: 0, seniors: 0, supersenior: 0, damas: 0, total: 0 };

/**
 * Normalize a raw color from the `salidas` table into a valid CSS color.
 * DB stores real hex values (e.g. "FFD600" or "#FFD600"). We only add the
 * leading `#` if missing. Unknown/empty values fall back to neutral grey.
 */
const normalizeHex = (raw?: string | null, fallback = '#999'): string => {
  if (!raw) return fallback;
  const v = raw.trim();
  if (!v) return fallback;
  if (/^#|^rgb|^hsl/i.test(v)) return v;
  if (/^[0-9a-fA-F]{3,8}$/.test(v)) return `#${v}`;
  return fallback;
};

const ClubesAsistentesSection = ({ overrideTotal }: Props) => {
  const { data, isLoading } = useStatsClubes();
  const { data: siteConfig } = useSiteConfig();

  const clubs = data?.clubs ?? [];
  const tees: StatsTee[] = data?.tees ?? [];

  /** Selected salida ids (empty set = show all — no filter). */
  const [selectedTees, setSelectedTees] = useState<Set<number>>(new Set());

  /** Whether to render club abbreviation instead of full name. */
  const useAbr =
    (siteConfig?.stats_page_config?.overrides?.clubNameField ?? 'name') === 'abr';

  /** Toggle a tee id in the filter set. */
  const toggleTee = (id: number) => {
    setSelectedTees((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /** Effective filter set — empty means "include all". */
  const activeTeeIds = useMemo(() => {
    if (selectedTees.size === 0) return null; // null sentinel = all
    return selectedTees;
  }, [selectedTees]);

  /**
   * Rows aggregated per club with the current tee filter applied.
   * Every row is a merged sum across the currently selected tees.
   * Clubs whose filtered total is 0 are hidden.
   */
  const rows = useMemo(() => {
    return clubs
      .map((c) => {
        const agg = { ...EMPTY_BRANCH };
        for (const [sidStr, counts] of Object.entries(c.byTee)) {
          const sid = Number(sidStr);
          if (activeTeeIds && !activeTeeIds.has(sid)) continue;
          agg.caballeros += counts.caballeros;
          agg.seniors += counts.seniors;
          agg.supersenior += counts.supersenior;
          agg.damas += counts.damas;
          agg.total += counts.total;
        }
        return { ...c, counts: agg };
      })
      .filter((r) => r.counts.total > 0)
      .sort((a, b) => b.counts.total - a.counts.total || a.name.localeCompare(b.name));
  }, [clubs, activeTeeIds]);

  /** Sums across visible rows (used for the totals footer + header chips). */
  const sums = rows.reduce(
    (acc, r) => ({
      caballeros: acc.caballeros + r.counts.caballeros,
      seniors: acc.seniors + r.counts.seniors,
      supersenior: acc.supersenior + r.counts.supersenior,
      damas: acc.damas + r.counts.damas,
      total: acc.total + r.counts.total,
    }),
    { ...EMPTY_BRANCH },
  );

  const autoTotal = sums.total;
  const total =
    overrideTotal !== null && overrideTotal !== undefined && overrideTotal > 0
      ? overrideTotal
      : autoTotal;

  const noShow = data?.noShow;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-2 border-primary/20">
        <CardContent className="p-0">
          {/* Section header — title + summary chips */}
          <div className="bg-primary text-primary-foreground px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6" />
              <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide">
                Clubes Asistentes
              </h2>
            </div>
            <div className="text-primary-foreground/90 text-sm md:text-base flex flex-wrap gap-x-6 gap-y-1">
              <span>
                Total de Clubes:{' '}
                <span className="font-mono font-bold text-lg md:text-xl text-accent">
                  {rows.length.toLocaleString('es-MX')}
                </span>
              </span>
              <span>
                Total de Jugadores:{' '}
                <span className="font-mono font-bold text-lg md:text-xl text-accent">
                  {total.toLocaleString('es-MX')}
                </span>
              </span>
            </div>
          </div>

          {/* Tee filter row — dynamic multi-select chips per salida color */}
          {tees.length > 0 && (
            <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">
                Filtrar por salida:
              </span>
              {tees.map((t) => {
                const on = selectedTees.has(t.id);
                // `salidas.bgcolor` is the fill (chip background), `salidas.color`
                // is the border/text color. Fall back gracefully if either missing.
                const fill = normalizeHex(t.bgcolor, normalizeHex(t.color, '#999'));
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTee(t.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      on
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card hover:bg-muted border-border text-foreground'
                    }`}
                    aria-pressed={on}
                    title={t.tee || t.color}
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ background: fill }}
                    />
                    {t.tee || t.color || `Tee ${t.id}`}
                  </button>
                );
              })}
              {selectedTees.size > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setSelectedTees(new Set())}
                >
                  Limpiar filtro
                </Button>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground bg-white">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Cargando clubes...
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground bg-white">
              No hay jugadores registrados aún.
            </div>
          ) : (
            <div className="overflow-x-auto bg-white max-h-[70vh] overflow-y-auto">
              <table className="w-full text-sm bg-white">
                <thead className="sticky top-0 z-30">
                  <tr className="bg-white border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold w-16 bg-white">
                      Logo
                    </th>
                    <th className="text-left px-4 py-3 font-semibold sticky left-0 bg-white z-20 shadow-[2px_0_0_0_hsl(var(--border))]">
                      Club
                    </th>
                    <th className="text-center px-4 py-3 font-semibold bg-white">
                      Caballeros
                    </th>
                    <th className="text-center px-4 py-3 font-semibold bg-white">
                      Seniors
                    </th>
                    <th className="text-center px-4 py-3 font-semibold bg-white">
                      Super Sr.
                    </th>
                    <th className="text-center px-4 py-3 font-semibold bg-white">
                      Damas
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-primary bg-white">
                      Total
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-primary bg-white">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((club, idx) => {
                    const displayName =
                      useAbr && club.abr ? club.abr : club.name;
                    const pct = autoTotal > 0 ? (club.counts.total / autoTotal) * 100 : 0;
                    return (
                      <tr
                        key={`${club.id ?? 'null'}-${idx}`}
                        className="border-b border-border/60 bg-white hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-2 bg-white">
                          {club.logo ? (
                            <img
                              src={club.logo}
                              alt={club.name}
                              className="w-auto object-contain inline-block"
                              // Match the height used in /jugadores + /resultados tables
                              style={{ height: '2.1375rem' }}
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23166534" rx="4"/></svg>')}`;
                              }}
                            />
                          ) : (
                            <div className="h-9 w-10 bg-muted rounded" />
                          )}
                        </td>
                        <td
                          className="px-4 py-2 font-medium sticky left-0 bg-white shadow-[2px_0_0_0_hsl(var(--border))]"
                          title={club.name}
                        >
                          {displayName}
                        </td>
                        <td className="px-4 py-2 text-center tabular-nums">
                          {club.counts.caballeros || '—'}
                        </td>
                        <td className="px-4 py-2 text-center tabular-nums">
                          {club.counts.seniors || '—'}
                        </td>
                        <td className="px-4 py-2 text-center tabular-nums">
                          {club.counts.supersenior || '—'}
                        </td>
                        <td className="px-4 py-2 text-center tabular-nums">
                          {club.counts.damas || '—'}
                        </td>
                        <td className="px-4 py-2 text-center font-bold tabular-nums text-primary">
                          {club.counts.total}
                        </td>
                        <td className="px-4 py-2 text-center tabular-nums text-muted-foreground">
                          {pct.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals row */}
                  <tr className="bg-primary/10 border-t-2 border-primary font-bold">
                    <td className="px-4 py-3 bg-primary/10" />
                    <td className="px-4 py-3 uppercase tracking-wide sticky left-0 bg-primary/10 shadow-[2px_0_0_0_hsl(var(--border))]">
                      Totales
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {sums.caballeros}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {sums.seniors}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {sums.supersenior}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {sums.damas}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-primary text-base">
                      {sums.total}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-primary">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Companion "NO SHOW" summary card — retiros / no-shows / descalificados */}
      {noShow && noShow.total > 0 && (
        <NoShowCard noShow={noShow} />
      )}
    </div>
  );
};

/**
 * NoShowCard
 * Compact companion card sitting under the clubs table. Shows a single
 * headline number ("NO SHOW") with three itemized rows below.
 */
const NoShowCard = ({
  noShow,
}: {
  noShow: NonNullable<ReturnType<typeof useStatsClubes>['data']>['noShow'];
}) => (
  <Card className="overflow-hidden border-2 border-muted-foreground/25 bg-white">
    <CardContent className="p-0">
      <div className="bg-muted border-b border-muted-foreground/25 px-6 py-4 flex items-center gap-3">
        <UserX className="h-6 w-6 text-muted-foreground" />
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wide text-muted-foreground">
            NO SHOW
          </h3>
          <span className="text-4xl md:text-5xl font-mono font-black text-muted-foreground leading-none">
            {noShow.total}
          </span>
          <span className="text-sm text-muted-foreground">
            jugadores no jugaron
          </span>
        </div>
      </div>
      <div className="divide-y divide-border">
        <NoShowRow label="Retiro"        value={noShow.retiro} />
        <NoShowRow label="No Show"       value={noShow.noShow} />
        <NoShowRow label="Descalificado" value={noShow.descalificado} />
        {/* Estatus "NO CONTIENDE" (N) */}
        <NoShowRow label="No contiende"  value={noShow.noContiende ?? 0} />
      </div>
    </CardContent>
  </Card>
);

/** Single labeled row inside the NO SHOW card. */
const NoShowRow = ({ label, value }: { label: string; value: number }) => (
  <div className="px-6 py-3 flex items-center justify-between bg-white">
    <span className="text-sm font-medium">{label}</span>
    <Badge variant="secondary" className="font-mono tabular-nums text-base px-3">
      {value}
    </Badge>
  </div>
);

export default ClubesAsistentesSection;
