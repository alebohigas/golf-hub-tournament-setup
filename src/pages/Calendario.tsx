/**
 * Calendario Page
 * Displays tournament calendar from caljuego table
 * Shows category, date, start time, and course
 * Also shows convocatoria schedule/horario data when available
 */

import { useRef, useCallback, useEffect, useState } from 'react';
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
import { compareCategories } from '@/lib/categorySort';

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
  /** Ref to the horizontal table scroller (X axis only). */
  const scrollRef = useRef<HTMLDivElement>(null);
  /** Ref to the sticky header bar that mirrors the table columns. */
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  /** Ref to the inner track of the sticky header (the div we translate). */
  const stickyHeaderTrackRef = useRef<HTMLDivElement>(null);
  /** Ref to the sticky AM/PM legend above the table. */
  const legendRef = useRef<HTMLDivElement>(null);
  /** Live header offsets and column geometry needed to render the floating
   *  sticky header that mirrors the actual table columns. */
  const [stickyTopPx, setStickyTopPx] = useState<number>(104);
  const [columnWidths, setColumnWidths] = useState<{ category: number; days: number[] }>({
    category: 128,
    days: [],
  });
  /** Total header bar height (months row + days row) for vertical snapping. */
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState<number>(80);

  /**
   * Sync the sticky header's vertical position so it sits immediately under
   * the page header + legend, regardless of responsive size changes.
   */
  useEffect(() => {
    const measure = () => {
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      const headerHeight = isDesktop ? 80 : 64;
      const legendHeight = legendRef.current?.getBoundingClientRect().height ?? 40;
      setStickyTopPx(headerHeight + legendHeight);
    };
    measure();
    const obs = new ResizeObserver(measure);
    if (legendRef.current) obs.observe(legendRef.current);
    window.addEventListener('resize', measure);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  /**
   * Measure each visible table column so the floating sticky header can
   * render with identical widths and stay aligned during horizontal scroll.
   */
  useEffect(() => {
    const measureColumns = () => {
      const wrapper = scrollRef.current;
      if (!wrapper) return;
      const headerCells = wrapper.querySelectorAll<HTMLElement>(
        'tbody tr[data-snap-row="true"]:first-of-type > td',
      );
      if (headerCells.length === 0) return;
      const widths = Array.from(headerCells).map((c) => c.getBoundingClientRect().width);
      setColumnWidths({ category: widths[0] ?? 128, days: widths.slice(1) });
      const headerEl = stickyHeaderRef.current;
      if (headerEl) setStickyHeaderHeight(headerEl.getBoundingClientRect().height);
    };
    measureColumns();
    const obs = new ResizeObserver(measureColumns);
    if (scrollRef.current) obs.observe(scrollRef.current);
    window.addEventListener('resize', measureColumns);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', measureColumns);
    };
  }, [dates.length, entries.length]);

  /**
   * Mirror the inner horizontal scroll into the floating sticky header
   * via translateX(), so the header always shows the same date columns.
   */
  useEffect(() => {
    const wrapper = scrollRef.current;
    const track = stickyHeaderTrackRef.current;
    if (!wrapper || !track) return;
    const sync = () => {
      track.style.transform = `translateX(${-wrapper.scrollLeft}px)`;
    };
    sync();
    wrapper.addEventListener('scroll', sync, { passive: true });
    return () => wrapper.removeEventListener('scroll', sync);
  }, [columnWidths.days.length]);

  /**
   * Anchor line for vertical row snapping = bottom edge of the floating
   * sticky header (page header + legend + header bar height).
   */
  const getStickyOffset = useCallback(() => {
    return stickyTopPx + stickyHeaderHeight + 1;
  }, [stickyTopPx, stickyHeaderHeight]);

  /** Width of the pinned left category column used by horizontal snap. */
  const getPinnedColumnOffset = useCallback(() => {
    return columnWidths.category;
  }, [columnWidths.category]);

  // Enable snap only when the table actually has rows.
  useRowSnap(tbodyRef, getStickyOffset, !isLoading && entries.length > 0, 140, {
    scrollRef,
    selector: '[data-snap-column="true"]',
    offset: getPinnedColumnOffset,
  });

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

  /**
   * Categories ordered with the canonical tournament sequence:
   * Primera → Letras (AA,A,B,...) → Damas → Senior → Novatos → Otros.
   * `compareCategories` works on { name, shortName } so we adapt the
   * Map values into that shape before sorting.
   */
  const categories = Array.from(categoryMap.entries()).sort(
    ([, a], [, b]) =>
      compareCategories(
        { name: a.name, shortName: a.shortName },
        { name: b.name, shortName: b.shortName },
      ),
  );

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
               <div ref={legendRef} className="sticky top-16 md:top-20 z-30 flex flex-wrap items-center justify-center gap-4 mb-4 py-2 px-3 text-sm rounded-md border border-border/40 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-sm">
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

              {/* Card wrapper. NO `overflow-hidden` so the page-level
                  legend above remains sticky relative to the viewport. */}
              <Card className="border-border/50 max-w-6xl mx-auto">
                {/*
                  Scroll container strategy
                  -----------------------------------------------------
                  Tournaments can have many categories (tall) AND many
                  days (wide). To make sticky headers work with the
                  PAGE scroll (not a separate inner scroll that creates
                  two scrollbars), we only allow HORIZONTAL scroll
                  inside this wrapper (`overflow-x: auto`, `overflow-y:
                  visible`). Vertical sticky positioning is then
                  computed relative to the viewport, so the month/day
                  header rows stay pinned just under the page header
                  while the user scrolls down the page. Horizontal
                  sticky (`left-0`) for the Categoría column still
                  works because the only scroll axis inside the
                  wrapper is horizontal.
                */}
                <CardContent
                  className="p-0"
                >
                  {/*
                    Floating sticky header bar.
                    -------------------------------------------------
                    The actual table is wrapped in a horizontal-scroll
                    container (`overflow-x: auto`) which by CSS spec
                    becomes a y-scroll context as well — that breaks
                    `position: sticky` on the inner <thead>. To avoid
                    that, the <thead> is replaced by this DIV which
                    lives OUTSIDE the scroll container. It is sticky
                    relative to the viewport (its parent has no
                    overflow), and its inner track is translated by
                    `-scrollLeft` to mirror the table's horizontal
                    pan, while the leftmost "Categoría" column stays
                    pinned and overlays the track.
                  */}
                  <div
                    ref={stickyHeaderRef}
                    className="sticky z-40 bg-background border-b border-border/40 overflow-hidden"
                    style={{ top: `${stickyTopPx}px` }}
                  >
                    <div className="relative" style={{ height: '5rem' }}>
                      {/* Pinned Categoría column overlay (covers the moving
                          track for the leftmost slot). */}
                      <div
                        className="absolute top-0 left-0 z-10 h-full flex flex-col bg-muted"
                        style={{ width: `${columnWidths.category}px` }}
                      >
                        <div className="h-1/2 border-b border-border/40" />
                        <div
                          className="h-1/2 px-2 flex items-center text-foreground font-bold"
                          style={{
                            backgroundImage:
                              'linear-gradient(hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.1))',
                          }}
                        >
                          Categoría
                        </div>
                      </div>
                      {/* Scrollable track mirroring the table's date columns. */}
                      <div
                        ref={stickyHeaderTrackRef}
                        className="absolute top-0 left-0 h-full flex"
                        style={{ paddingLeft: `${columnWidths.category}px`, willChange: 'transform' }}
                      >
                        {dates.map((d, i) => (
                          <div
                            key={`mh-${d.date}`}
                            data-snap-column="true"
                            className="flex flex-col flex-shrink-0 border-l border-border/40 first:border-l-0"
                            style={{ width: `${columnWidths.days[i] ?? 64}px` }}
                          >
                            <div className="h-1/2 flex items-center justify-center text-muted-foreground font-medium bg-muted text-xs">
                              {formatMonthHeader(d)}
                            </div>
                            <div
                              className="h-1/2 flex items-center justify-center text-foreground font-bold text-xs"
                              style={{
                                backgroundImage:
                                  'linear-gradient(hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.1))',
                              }}
                            >
                              {formatDayHeader(d)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/*
                    Horizontal-scroll wrapper for the table body.
                    The original <thead> is removed because the floating
                    sticky header above replaces it visually.
                  */}
                  <div
                    ref={scrollRef}
                    className="overflow-x-auto overscroll-x-contain"
                  >
                    <table className="w-full border-separate border-spacing-0 text-sm">
                    <tbody ref={tbodyRef}>
                      {categories.map(([catKey, catData], idx) => (
                        <tr key={catKey} data-snap-row="true" className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                          {/* Sticky-left Categoría cell. The <tr> background
                              is transparent for sticky cells (they "see
                              through" to whatever scrolls under), so we must
                              re-apply the same row tint here as a solid layer
                              over the page background. z-10 keeps it above
                              normal body cells but below the sticky headers
                              (z-20/z-30). */}
                          <td
                            data-sticky-category="true"
                            className="sticky left-0 z-10 border border-border/40 p-2 font-medium text-foreground whitespace-nowrap w-32 min-w-32"
                            style={{
                              backgroundColor: 'hsl(var(--background))',
                              backgroundImage:
                                idx % 2 === 0
                                  ? 'linear-gradient(hsl(var(--card)), hsl(var(--card)))'
                                  : 'linear-gradient(hsl(var(--muted) / 0.2), hsl(var(--muted) / 0.2))',
                            }}
                          >
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

                      {/* Spacer row that visually separates per-category rows
                          from the AM/PM group totals below. A neutral
                          background-colored band (no colored border) reads as
                          a clean gap without introducing the previous gold
                          divider line. */}
                      <tr aria-hidden="true">
                        <td colSpan={dates.length + 1} className="h-2 p-0 bg-background border-0" />
                      </tr>
                      {/* Bottom totals: groups starting AM and PM aggregated across categories. */}
                      <tr className="bg-accent/10">
                        {/* Sticky-left totals label (AM). Inline solid
                            background recreates the `bg-accent/10` tint
                            since the <tr>'s own background is invisible
                            behind sticky cells during horizontal scroll. */}
                        <td
                          data-sticky-category="true"
                          className="sticky left-0 z-10 border border-border/40 p-2 font-bold text-foreground w-32 min-w-32"
                          style={{
                            backgroundColor: 'hsl(var(--background))',
                            backgroundImage:
                              'linear-gradient(hsl(var(--accent) / 0.1), hsl(var(--accent) / 0.1))',
                          }}
                        >
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
                        {/* Sticky-left totals label (PM). Same solid-tint
                            trick as the AM row above. */}
                        <td
                          data-sticky-category="true"
                          className="sticky left-0 z-10 border border-border/40 p-2 font-bold text-foreground w-32 min-w-32"
                          style={{
                            backgroundColor: 'hsl(var(--background))',
                            backgroundImage:
                              'linear-gradient(hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.1))',
                          }}
                        >
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
                  </div>
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
