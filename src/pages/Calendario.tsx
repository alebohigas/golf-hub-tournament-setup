/**
 * Calendario Page
 * Displays tournament calendar from caljuego table
 * Shows category, date, start time, and course
 * Also shows convocatoria schedule/horario data when available
 */

import { useRef, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CalendarDays } from 'lucide-react';
import { useCalendarioData } from '@/hooks/useCalendarioData';
import type { CalendarDate, CalendarEntry } from '@/data/calendarioData';
import calendarioHero from '@/assets/calendario-hero.jpg';
import { scheduleData, salidasText } from '@/data/mockData';
import ScheduleTable from '@/components/convocatoria/ScheduleTable';
import { useRowSnap } from '@/hooks/useRowSnap';

/** Map English day/month names to Spanish */
const dayNameEs: Record<string, string> = {
  Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miércoles',
  Thursday: 'Jueves', Friday: 'Viernes', Saturday: 'Sábado', Sunday: 'Domingo',
};
const monthNameEs: Record<string, string> = {
  January: 'Enero', February: 'Febrero', March: 'Marzo', April: 'Abril',
  May: 'Mayo', June: 'Junio', July: 'Julio', August: 'Agosto',
  September: 'Septiembre', October: 'Octubre', November: 'Noviembre', December: 'Diciembre',
};

/** Spanish 3-letter month abbreviation for column header, e.g. "Abr". */
const monthShortEs: Record<string, string> = {
  January: 'Ene', February: 'Feb', March: 'Mar', April: 'Abr',
  May: 'May', June: 'Jun', July: 'Jul', August: 'Ago',
  September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dic',
};

/** Spanish 3-letter day-of-week abbreviation, e.g. "Vie". */
const dayShortEs: Record<string, string> = {
  Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mie',
  Thursday: 'Jue', Friday: 'Vie', Saturday: 'Sab', Sunday: 'Dom',
};

/** Format the upper line of a column header (the month abbreviation). */
const formatMonthHeader = (d: CalendarDate): string =>
  monthShortEs[d.month] || (d.month ? d.month.slice(0, 3) : '');

/** Format the lower line of a column header (e.g. "Vie.24"). */
const formatDayHeader = (d: CalendarDate): string => {
  const day = dayShortEs[d.dayOfWeek] || d.dayOfWeek?.slice(0, 3) || '';
  return `${day}.${d.dayNum}`;
};

/**
 * Render the AM/PM colored cell for a single category-date intersection.
 * Visual rules:
 *   - AM only -> solid `accent` (gold).
 *   - PM only -> solid `primary` (green).
 *   - Both    -> diagonal split (gold top-left / green bottom-right).
 * The category abbreviation is centered with high-contrast foreground.
 */
const AmPmCell = ({ entry }: { entry: CalendarEntry }) => {
  const label = entry.shortName || entry.category;
  const both = entry.hasAM && entry.hasPM;

  if (both) {
    // Diagonal gradient using semantic tokens (HSL via design system).
    return (
      <div
        className="flex items-center justify-center h-full w-full text-[11px] sm:text-xs font-semibold text-white"
        style={{
          background:
            'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--accent)) 50%, hsl(var(--primary)) 50%, hsl(var(--primary)) 100%)',
        }}
        title={`AM ${entry.amTime ?? ''} · PM ${entry.pmTime ?? ''}`.trim()}
      >
        {label}
      </div>
    );
  }

  if (entry.hasAM) {
    return (
      <div
        className="flex items-center justify-center h-full w-full text-[11px] sm:text-xs font-semibold bg-accent text-accent-foreground"
        title={entry.amTime ? `AM ${entry.amTime}` : 'AM'}
      >
        {label}
      </div>
    );
  }

  if (entry.hasPM) {
    return (
      <div
        className="flex items-center justify-center h-full w-full text-[11px] sm:text-xs font-semibold bg-primary text-primary-foreground"
        title={entry.pmTime ? `PM ${entry.pmTime}` : 'PM'}
      >
        {label}
      </div>
    );
  }

  return null;
};

const Calendario = () => {
  const { data, isLoading } = useCalendarioData();

  const dates = data?.dates ?? [];
  const entries = data?.entries ?? [];
  const amTotals = data?.amTotals ?? {};
  const pmTotals = data?.pmTotals ?? {};

  /** Ref to the <tbody> whose rows we want to snap to. */
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  /**
   * Live sticky-header offset (in px). Keep this in sync with the `top-*`
   * Tailwind classes used by the sticky day-of-week row in the table:
   *   mobile  : top-[8.75rem] -> 8.75 * 16 = 140px
   *   desktop : top-[9.75rem] -> 9.75 * 16 = 156px
   * We add a small +1px buffer so the snap aligns flush with the bottom
   * border of the sticky header.
   */
  const getStickyOffset = useCallback(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    return (isDesktop ? 9.75 : 8.75) * 16 + 1;
  }, []);

  // Enable snap only when the table actually has rows.
  useRowSnap(tbodyRef, getStickyOffset, !isLoading && entries.length > 0);

  /** Group entries by category for the matrix table */
  const categoryMap = new Map<string, { name: string; shortName: string; byDate: Map<string, CalendarEntry[]> }>();
  
  for (const entry of entries) {
    if (!categoryMap.has(entry.category)) {
      categoryMap.set(entry.category, {
        name: entry.categoryName,
        shortName: entry.shortName,
        byDate: new Map(),
      });
    }
    const cat = categoryMap.get(entry.category)!;
    if (!cat.byDate.has(entry.date)) {
      cat.byDate.set(entry.date, []);
    }
    cat.byDate.get(entry.date)!.push(entry);
  }

  const categories = Array.from(categoryMap.entries());

  /** Check if convocatoria schedule has any data */
  const hasScheduleData = scheduleData.length > 0 && scheduleData.some(
    (s) => s.martes.length > 0 || s.miercoles.length > 0 || s.jueves.length > 0 || s.viernes.length > 0 || s.sabado.length > 0
  );

  return (
    <Layout>
      <PageHero 
        title="Calendario de Juego"
        subtitle="Días de juego por categoría"
        backgroundImage={calendarioHero}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* DB-driven calendar table */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Calendario por Categoría</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay calendario disponible para este torneo.
            </div>
          ) : (
            <>
              {/* Legend explaining the AM/PM color encoding.
                  Sticky so it stays visible while the user scrolls the long
                  calendar matrix. Uses a blurred background so content
                  underneath remains slightly visible without losing contrast. */}
              {/* Sticky offset matches the Header height: h-16 (64px) on
                  mobile and h-20 (80px) on desktop. Without `md:top-20`
                  the legend would slide under the desktop header. */}
              <div className="sticky top-16 md:top-20 z-30 flex flex-wrap items-center justify-center gap-4 mb-4 py-2 px-3 text-sm rounded-md border border-border/40 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-sm bg-accent border border-border/30" />
                  <span className="text-muted-foreground">Salida AM</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-sm bg-primary border border-border/30" />
                  <span className="text-muted-foreground">Salida PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-4 h-4 rounded-sm border border-border/30"
                    style={{
                      background:
                        'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--accent)) 50%, hsl(var(--primary)) 50%, hsl(var(--primary)) 100%)',
                    }}
                  />
                  <span className="text-muted-foreground">AM y PM</span>
                </div>
              </div>

              {/* Card wrapper: NO `overflow-hidden` here — it would create a
                  new clipping context and break the sticky positioning of
                  both the legend (above) and the table headers (below). */}
              <Card className="border-border/50 max-w-6xl mx-auto">
                {/* CardContent: NO `overflow-x-auto` for the same reason.
                    Horizontal scroll is handled at the page level via the
                    container; the matrix is compact enough on desktop. */}
                <CardContent className="p-0">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      {/* Top header row: month abbreviation per date column.
                          Each <th> is sticky individually because sticky on
                          <thead>/<tr> is unreliable across browsers.
                          `top-[6.5rem]` clears the sticky legend (top-16 +
                          its height). Solid bg required so cells underneath
                          do not bleed through while scrolling. */}
                      {/* Sticky months row. Offset = header (h-16/h-20) +
                          legend height (~2.5rem) so it sits flush below the
                          legend on both mobile (~6.5rem) and desktop (~7.5rem). */}
                      <tr>
                        <th className="sticky top-[6.5rem] md:top-[7.5rem] z-20 border border-border/40 p-2 text-left text-foreground font-semibold w-32 bg-muted" />
                        {dates.map(d => (
                          <th
                            key={`m-${d.date}`}
                            className="sticky top-[6.5rem] md:top-[7.5rem] z-20 border border-border/40 p-2 text-center text-muted-foreground font-medium min-w-[64px] bg-muted"
                          >
                            {formatMonthHeader(d)}
                          </th>
                        ))}
                      </tr>
                      {/* Second sticky row (day-of-week + day number).
                          Pinned to `top-[8.75rem]` so it sits flush against
                          the months row above — no gap that would let body
                          rows peek through during scroll.
                          Background: opaque mix of primary (10%) layered over
                          background, preserving the original light-green tint
                          (`bg-primary/10` look) while remaining fully solid. */}
                      <tr>
                        <th
                          className="sticky top-[8.75rem] md:top-[9.75rem] z-20 border border-border/40 p-2 text-left text-foreground font-bold"
                          style={{
                            backgroundColor: 'hsl(var(--background))',
                            backgroundImage:
                              'linear-gradient(hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.1))',
                          }}
                        >
                          Categoría
                        </th>
                        {dates.map(d => (
                          <th
                            key={`d-${d.date}`}
                            className="sticky top-[8.75rem] md:top-[9.75rem] z-20 border border-border/40 p-2 text-center text-foreground font-bold"
                            style={{
                              backgroundColor: 'hsl(var(--background))',
                              backgroundImage:
                                'linear-gradient(hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.1))',
                            }}
                          >
                            {formatDayHeader(d)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody ref={tbodyRef}>
                      {categories.map(([catKey, catData], idx) => (
                        <tr key={catKey} className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                          <td className="border border-border/40 p-2 font-medium text-foreground whitespace-nowrap">
                            {catData.name}
                          </td>
                          {dates.map(d => {
                            const dayEntries = catData.byDate.get(d.date);
                            const entry = dayEntries && dayEntries[0];
                            return (
                              <td
                                key={d.date}
                                className="border border-border/40 p-0 text-center align-middle h-9"
                              >
                                {entry ? <AmPmCell entry={entry} /> : null}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* Bottom totals: groups starting AM and PM aggregated across categories. */}
                      <tr className="bg-accent/10 border-t-2 border-t-accent">
                        <td className="border border-border/40 p-2 font-bold text-foreground">
                          Grupos <span className="text-accent">AM</span>
                        </td>
                        {dates.map(d => (
                          <td
                            key={`am-${d.date}`}
                            className="border border-border/40 p-2 text-center font-bold text-foreground bg-accent/20"
                          >
                            {amTotals[d.date] || 0}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-primary/10">
                        <td className="border border-border/40 p-2 font-bold text-foreground">
                          Grupos <span className="text-primary">PM</span>
                        </td>
                        {dates.map(d => (
                          <td
                            key={`pm-${d.date}`}
                            className="border border-border/40 p-2 text-center font-bold text-foreground bg-primary/20"
                          >
                            {pmTotals[d.date] || 0}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          )}

          {/* Convocatoria schedule/horario section */}
          {hasScheduleData && (
            <div className="mt-16 max-w-5xl mx-auto">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Horario de Salidas por Turno
                  </CardTitle>
                  {salidasText && (
                    <p className="text-muted-foreground text-sm mt-1">{salidasText}</p>
                  )}
                </CardHeader>
                <CardContent className="p-0 md:p-6 pt-0">
                  <ScheduleTable scheduleData={scheduleData} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Calendario;
