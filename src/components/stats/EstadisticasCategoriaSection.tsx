/**
 * EstadisticasCategoriaSection
 * ---------------------------------------------------------------
 * Second section of /stats. Category selector (cards, matching the
 * pattern used elsewhere) + hole-by-hole aggregate table for the
 * selected category. Displays counts of Águilas / Birdies / Pares /
 * Bogeys / Dobles / Triples+ per hole with per-nine and total
 * subtotals. Uses semantic color classes (primary/accent + destructive
 * for hard holes) so the theme palette applies automatically.
 * ---------------------------------------------------------------
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Loader2, Trophy } from 'lucide-react';
import { useCategories } from '@/hooks/usePlayersData';
import {
  useStatsCategoria,
  type StatsCategoriaHole,
  type StatsCategoriaResponse,
} from '@/hooks/useStatsData';

interface Props {
  /** Manual overrides applied to the section header (null = auto). */
  overrideUpdatedAt?: string | null;
  overrideRounds?: number | null;
}

const EstadisticasCategoriaSection = ({
  overrideUpdatedAt,
  overrideRounds,
}: Props) => {
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useStatsCategoria(selectedId);

  const displayedRounds =
    overrideRounds && overrideRounds > 0 ? overrideRounds : data?.rounds ?? 0;
  const displayedUpdatedAt = overrideUpdatedAt || data?.updatedAt || null;

  return (
    // Dynamic height: no max-height or overflow-y so the report grows with
    // its table content and only the page scrolls vertically.
    <Card className="h-auto border-2 border-primary/20">
      <CardContent className="p-0">
        {/* Section header — rounded top corners now that Card no longer clips */}
        <div className="bg-primary text-primary-foreground px-6 py-5 flex items-center gap-3 rounded-t-lg">
          <BarChart3 className="h-6 w-6" />
          <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide">
            Estadísticas por Categoría
          </h2>
        </div>

        {!selectedId ? (
          // ============= Category picker =============
          <div className="p-6">
            {catsLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Cargando categorías...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedId(cat.id)}
                    className="group text-left p-4 rounded-lg border border-border bg-card hover:bg-primary/10 hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{cat.shortName || cat.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // ============= Selected category detail =============
          <div className="p-4 md:p-6 space-y-4">
            {/* Big repeat of the currently-selected category name so it stays
                visible while the user scrolls the wide holes matrix. */}
            <h3 className="text-xl md:text-2xl font-display font-black uppercase tracking-wide text-primary">
              Categoría: {data?.categoryName || '—'}
            </h3>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedId(null)}
                className="gap-1 self-start bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Cambiar categoría
              </Button>
              {data && (
                <div className="text-xs md:text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                  {data.tee && (
                    <span>
                      Tee:{' '}
                      <span className="font-semibold text-foreground">{data.tee}</span>
                    </span>
                  )}
                  {data.course && (
                    <span>
                      Campo:{' '}
                      <span className="font-semibold text-foreground">
                        {data.course}
                      </span>
                    </span>
                  )}
                  <span>
                    Rondas:{' '}
                    <span className="font-semibold text-foreground">
                      {displayedRounds}
                    </span>
                  </span>
                  {displayedUpdatedAt && (
                    <span>
                      Actualizado:{' '}
                      <span className="font-mono text-foreground">
                        {displayedUpdatedAt}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {isLoading || !data ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Cargando estadísticas...
              </div>
            ) : (
              <StatsHolesTable holes={data.holes} subtotals={data.subtotals} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============= Shared Holes Matrix =============

/** Props for the shared hole-by-hole stats matrix. */
export interface StatsHolesTableProps {
  holes: StatsCategoriaHole[];
  subtotals: StatsCategoriaResponse['subtotals'];
}

/**
 * Renders the aggregated hole-by-hole matrix, including OUT / IN / TOTAL
 * subtotal rows. Exported so other stats sections (e.g. per-tee stats)
 * can reuse the exact same layout.
 */
export const StatsHolesTable = ({ holes, subtotals }: StatsHolesTableProps) => {

  /**
   * Left offset (px) accumulator for the three sticky columns: Hoyo, Par, Prom.
   * Kept in one place so both header and body cells reference the same layout.
   */
  const STICKY = {
    hoyo: { left: 0,   width: 64 },
    par:  { left: 64,  width: 56 },
    prom: { left: 120, width: 72 },
  } as const;

  /**
   * Row background alternator — white / cream stripes for readability.
   * Sticky columns MUST use a fully-opaque background so the content
   * that scrolls underneath does not bleed through. We keep alternating
   * stripes visually (white vs. very-light-cream) using solid hex.
   */
  const STRIPE = '#f7f4ec'; // solid cream — mirrors muted without alpha

  const renderHoleRow = (h: typeof holes[number], i: number) => {
    const solidBg = i % 2 === 0 ? '#ffffff' : STRIPE;
    return (
    <tr key={`h-${h.hole}`} className="border-b border-border/60 hover:bg-primary/5" style={{ background: solidBg }}>
      <td className="px-3 py-2 font-mono font-bold sticky" style={{ left: STICKY.hoyo.left, width: STICKY.hoyo.width, minWidth: STICKY.hoyo.width, background: solidBg }}>
        H{String(h.hole).padStart(2, '0')}
      </td>
      <td className="px-3 py-2 text-center tabular-nums sticky" style={{ left: STICKY.par.left, width: STICKY.par.width, minWidth: STICKY.par.width, background: solidBg }}>
        {h.par ?? '—'}
      </td>
      <td className="px-3 py-2 text-center tabular-nums font-semibold sticky shadow-[2px_0_0_0_hsl(var(--border))]" style={{ left: STICKY.prom.left, width: STICKY.prom.width, minWidth: STICKY.prom.width, background: solidBg }}>
        {h.promedio ?? '—'}
      </td>
      <td className="px-3 py-2 text-center tabular-nums text-primary font-bold">
        {h.rank ?? '—'}
      </td>
      <td className="px-3 py-2 text-center tabular-nums text-amber-600 dark:text-amber-400 font-semibold">
        {h.aguilas || '—'}
      </td>
      <td className="px-3 py-2 text-center tabular-nums text-green-600 dark:text-green-400 font-semibold">
        {h.birdies || '—'}
      </td>
      <td className="px-3 py-2 text-center tabular-nums">{h.pares || '—'}</td>
      <td className="px-3 py-2 text-center tabular-nums text-orange-600 dark:text-orange-400">
        {h.bogeys || '—'}
      </td>
      <td className="px-3 py-2 text-center tabular-nums text-red-600 dark:text-red-400">
        {h.dobles || '—'}
      </td>
      <td className="px-3 py-2 text-center tabular-nums text-destructive font-semibold">
        {h.triples || '—'}
      </td>
    </tr>
  );};

  const renderSubtotal = (label: string, s: NonNullable<typeof subtotals.out>) => (
    // Solid subtotal band — sticky cells reuse the same solid color so
    // scrolled content underneath stays hidden.
    <tr className="font-bold" style={{ background: '#e6efe6' }}>
      <td className="px-3 py-2 uppercase tracking-wide sticky" style={{ left: STICKY.hoyo.left, width: STICKY.hoyo.width, minWidth: STICKY.hoyo.width, background: '#e6efe6' }}>{label}</td>
      <td className="px-3 py-2 text-center tabular-nums sticky" style={{ left: STICKY.par.left, width: STICKY.par.width, minWidth: STICKY.par.width, background: '#e6efe6' }}>{s.par}</td>
      <td className="px-3 py-2 text-center tabular-nums sticky shadow-[2px_0_0_0_hsl(var(--border))]" style={{ left: STICKY.prom.left, width: STICKY.prom.width, minWidth: STICKY.prom.width, background: '#e6efe6' }}>{s.promedio ?? '—'}</td>
      <td className="px-3 py-2" />
      <td className="px-3 py-2 text-center tabular-nums">{s.aguilas}</td>
      <td className="px-3 py-2 text-center tabular-nums">{s.birdies}</td>
      <td className="px-3 py-2 text-center tabular-nums">{s.pares}</td>
      <td className="px-3 py-2 text-center tabular-nums">{s.bogeys}</td>
      <td className="px-3 py-2 text-center tabular-nums">{s.dobles}</td>
      <td className="px-3 py-2 text-center tabular-nums">{s.triples}</td>
    </tr>
  );

  const first = holes.filter((h) => h.hole <= 9);
  const back = holes.filter((h) => h.hole > 9);

  // Solo scroll horizontal: el alto crece con el contenido (scroll de la página).
  // No max-height ni overflow-y para evitar que el frame recorte filas.
  return (
    // `overscroll-x-contain` + momentum scrolling = deslizamiento suave en celular.
    <div
      className="overflow-x-auto overflow-y-visible h-auto bg-white border border-border rounded overscroll-x-contain scroll-smooth"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <table className="w-full text-sm min-w-[720px] bg-white">
        <thead className="sticky top-0 z-30">
          <tr className="bg-white border-b border-border">
            <th className="text-left px-3 py-3 font-semibold sticky bg-white z-40" style={{ left: STICKY.hoyo.left, width: STICKY.hoyo.width, minWidth: STICKY.hoyo.width }}>Hoyo</th>
            <th className="text-center px-3 py-3 font-semibold sticky bg-white z-40" style={{ left: STICKY.par.left, width: STICKY.par.width, minWidth: STICKY.par.width }}>Par</th>
            <th className="text-center px-3 py-3 font-semibold sticky bg-white z-40 shadow-[2px_0_0_0_hsl(var(--border))]" style={{ left: STICKY.prom.left, width: STICKY.prom.width, minWidth: STICKY.prom.width }}>Prom.</th>
            <th className="text-center px-3 py-3 font-semibold whitespace-nowrap">Rank</th>
            <th className="text-center px-3 py-3 font-semibold whitespace-nowrap">Águilas</th>
            <th className="text-center px-3 py-3 font-semibold whitespace-nowrap">Birdies</th>
            <th className="text-center px-3 py-3 font-semibold whitespace-nowrap">Pares</th>
            <th className="text-center px-3 py-3 font-semibold whitespace-nowrap">Bogeys</th>
            <th className="text-center px-3 py-3 font-semibold whitespace-nowrap">Dobles</th>
            <th className="text-center px-3 py-3 font-semibold whitespace-nowrap">Triples+</th>
          </tr>
        </thead>
        <tbody>
          {first.map((h, i) => renderHoleRow(h, i))}
          {subtotals.out && renderSubtotal('V1', subtotals.out)}
          {back.map((h, i) => renderHoleRow(h, i + first.length + 1))}
          {subtotals.in && renderSubtotal('V2', subtotals.in)}
          {subtotals.total && (
            <tr className="bg-primary text-primary-foreground font-bold border-t-2 border-primary">
              {/* Celdas fijas de la fila TOTAL: fondo sólido = no se transparenta */}
              <td className="px-3 py-3 uppercase tracking-wide sticky whitespace-nowrap" style={{ left: STICKY.hoyo.left, width: STICKY.hoyo.width, minWidth: STICKY.hoyo.width, background: 'hsl(var(--primary))' }}>Total</td>
              <td className="px-3 py-3 text-center tabular-nums sticky" style={{ left: STICKY.par.left, width: STICKY.par.width, minWidth: STICKY.par.width, background: 'hsl(var(--primary))' }}>
                {subtotals.total.par}
              </td>
              <td className="px-3 py-3 text-center tabular-nums sticky" style={{ left: STICKY.prom.left, width: STICKY.prom.width, minWidth: STICKY.prom.width, background: 'hsl(var(--primary))' }}>
                {subtotals.total.promedio ?? '—'}
              </td>
              <td className="px-3 py-3" />
              <td className="px-3 py-3 text-center tabular-nums">
                {subtotals.total.aguilas}
              </td>
              <td className="px-3 py-3 text-center tabular-nums">
                {subtotals.total.birdies}
              </td>
              <td className="px-3 py-3 text-center tabular-nums">
                {subtotals.total.pares}
              </td>
              <td className="px-3 py-3 text-center tabular-nums">
                {subtotals.total.bogeys}
              </td>
              <td className="px-3 py-3 text-center tabular-nums">
                {subtotals.total.dobles}
              </td>
              <td className="px-3 py-3 text-center tabular-nums">
                {subtotals.total.triples}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EstadisticasCategoriaSection;