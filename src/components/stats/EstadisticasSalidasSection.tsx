/**
 * EstadisticasSalidasSection
 * ---------------------------------------------------------------
 * /stats section "Estadísticas por Tee de Salida": aggregates the
 * hole-by-hole stroke-play matrix by TEE (mesa de salida / color)
 * instead of by category. All categories that play from the selected
 * tee(s) contribute their scorecards to the aggregation.
 *
 * Filter UX (mirrors the tee chips in ClubesAsistentesSection):
 *  - No selection  → "Todas" (every tee of the tournament).
 *  - One chip      → that tee only.
 *  - Several chips → combined aggregation of the selected tees.
 *
 * Data source: /api/stats_tee.php (list + detail modes).
 * ---------------------------------------------------------------
 */

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Filter, Flag, Loader2 } from 'lucide-react';
import { useStatsTee, useStatsTeesList } from '@/hooks/useStatsData';
import { StatsHolesTable } from '@/components/stats/EstadisticasCategoriaSection';
import { normalizeHex } from '@/components/stats/ClubesAsistentesSection';

const EstadisticasSalidasSection = () => {
  const { data: teesData, isLoading: teesLoading } = useStatsTeesList();
  const tees = useMemo(() => teesData?.tees ?? [], [teesData]);

  /** Selected tee ids — empty Set means "Todas" (all tees). */
  const [selectedTees, setSelectedTees] = useState<Set<number>>(new Set());

  /** Toggle one tee id in/out of the selection set. */
  const toggleTee = (id: number) => {
    setSelectedTees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /**
   * Effective id list sent to the API: the explicit selection, or every
   * available tee when nothing is selected ("Todas"). Empty while the
   * tee list is still loading → detail query stays disabled.
   */
  const activeIds = useMemo(() => {
    if (selectedTees.size > 0) {
      // Keep tournament tee order for stable query keys/labels.
      return tees.filter((t) => selectedTees.has(t.id)).map((t) => t.id);
    }
    return tees.map((t) => t.id);
  }, [tees, selectedTees]);

  const { data, isLoading } = useStatsTee(activeIds);

  /** Header label for the current aggregation. */
  const selectionLabel =
    selectedTees.size === 0
      ? 'Todas las salidas'
      : data?.teeName || '—';

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardContent className="p-0">
        {/* Section header */}
        <div className="bg-primary text-primary-foreground px-6 py-5 flex items-center gap-3">
          <BarChart3 className="h-6 w-6" />
          <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide">
            Estadísticas por Tee de Salida
          </h2>
        </div>

        {/* Tee multi-select filter — chips colored with the tee fill */}
        <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">
            Filtrar por salida:
          </span>
          {teesLoading ? (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Cargando salidas...
            </span>
          ) : (
            <>
              {tees.map((t) => {
                const on = selectedTees.has(t.id);
                // `salidas.bgcolor` is the fill (chip dot), `salidas.color`
                // is the fallback. Same resolution as ClubesAsistentes.
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
                  Todas
                </Button>
              )}
            </>
          )}
        </div>

        <div className="p-4 md:p-6 space-y-4">
          {/* Big repeat of the current selection so it stays visible
              while the user scrolls the wide holes matrix. */}
          <h3 className="text-xl md:text-2xl font-display font-black uppercase tracking-wide text-primary flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Tee de salida: {selectionLabel}
          </h3>
          {data && (
            <div className="text-xs md:text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
              {data.course && (
                <span>
                  Campo:{' '}
                  <span className="font-semibold text-foreground">{data.course}</span>
                </span>
              )}
              <span>
                Rondas:{' '}
                <span className="font-semibold text-foreground">{data.rounds}</span>
              </span>
              {data.updatedAt && (
                <span>
                  Actualizado:{' '}
                  <span className="font-mono text-foreground">{data.updatedAt}</span>
                </span>
              )}
            </div>
          )}

          {isLoading || !data || activeIds.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Cargando estadísticas...
            </div>
          ) : (
            <StatsHolesTable holes={data.holes} subtotals={data.subtotals} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EstadisticasSalidasSection;
