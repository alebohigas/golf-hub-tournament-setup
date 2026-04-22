/**
 * CalendarioJuegoSection
 * --------------------------------------------------------------
 * Embeds a compact preview of /calendario and /horarios inside
 * the Convocatoria page.
 *
 * Visibility rule (per user requirement):
 *   - The Calendario block is shown ONLY if the /calendario page
 *     is visible (not hidden in admin) AND has data.
 *   - The Horarios block is shown ONLY if the /horarios page is
 *     visible AND has data.
 *   - The whole section returns `null` when neither block applies.
 *
 * Data source: useCalendarioData() + useHorariosData() hooks.
 * Visibility source: usePageVisibility() context.
 */

import { Link } from 'react-router-dom';
import { CalendarDays, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCalendarioData } from '@/hooks/useCalendarioData';
import { useHorariosData } from '@/hooks/useHorariosData';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';

// ============= Helpers =============

/** Spanish abbreviation maps reused for the embedded calendar preview. */
const monthShortEs: Record<string, string> = {
  January: 'Ene', February: 'Feb', March: 'Mar', April: 'Abr',
  May: 'May', June: 'Jun', July: 'Jul', August: 'Ago',
  September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dic',
};
const dayShortEs: Record<string, string> = {
  Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mie',
  Thursday: 'Jue', Friday: 'Vie', Saturday: 'Sab', Sunday: 'Dom',
};

/** Build short label "Vie 26 Jun" for a column header. */
const shortDateLabel = (d: { date: string; dayOfWeek: string; dayNum: string; month: string }): string => {
  const day = dayShortEs[d.dayOfWeek] || d.dayOfWeek?.slice(0, 3) || '';
  const month = monthShortEs[d.month] || d.month?.slice(0, 3) || '';
  return `${day} ${d.dayNum} ${month}`;
};

// ============= Component =============

/**
 * Conditional Calendario+Horarios block for the Convocatoria page.
 * Shown only when the corresponding pages are visible AND contain data.
 */
const CalendarioJuegoSection = () => {
  const { isPageVisible } = usePageVisibility();
  const calendarioVisible = isPageVisible('calendario');
  const horariosVisible = isPageVisible('horarios');

  /** React Query hooks — only call when the page is visible. */
  const { data: calData } = useCalendarioData();
  const { data: horData } = useHorariosData();

  /** Has-data checks. */
  const hasCalendario =
    calendarioVisible && (calData?.entries?.length ?? 0) > 0 && (calData?.dates?.length ?? 0) > 0;
  const hasHorarios =
    horariosVisible && (horData?.entries?.length ?? 0) > 0 && (horData?.dates?.length ?? 0) > 0;

  // Hide entire section when neither block is available.
  if (!hasCalendario && !hasHorarios) return null;

  return (
    <div className="space-y-8">
      {/* Section heading */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          Calendario y Horarios de Juego
        </h2>
        <p className="text-muted-foreground">
          Resumen rápido de días y horarios. Consulta el detalle completo en sus páginas dedicadas.
        </p>
      </div>

      {/* Calendario preview */}
      {hasCalendario && calData && (
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-primary/5 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 font-display text-foreground">
              <CalendarDays className="h-5 w-5 text-primary" />
              Calendario de Juego
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              <Link to="/calendario" className="inline-flex items-center gap-1">
                Ver detalle <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-3 text-left font-bold w-40">Categoría</th>
                  {calData.dates.map((d) => (
                    <th
                      key={`cal-h-${d.date}`}
                      className="p-2 text-center font-semibold border-l border-primary-foreground/20 min-w-[80px]"
                    >
                      {shortDateLabel(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calData.entries
                  .reduce<Array<{ key: string; name: string; byDate: Map<string, true> }>>((acc, e) => {
                    let row = acc.find((r) => r.key === e.category);
                    if (!row) {
                      row = { key: e.category, name: e.categoryName, byDate: new Map() };
                      acc.push(row);
                    }
                    row.byDate.set(e.date, true);
                    return acc;
                  }, [])
                  .map((row, idx) => (
                    <tr key={row.key} className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                      <td className="border-b border-border/40 p-3 font-medium text-foreground whitespace-nowrap">
                        {row.name}
                      </td>
                      {calData.dates.map((d) => (
                        <td
                          key={`cal-c-${row.key}-${d.date}`}
                          className="border-b border-l border-border/40 p-2 text-center"
                        >
                          {row.byDate.has(d.date) ? (
                            <span className="inline-block w-3 h-3 rounded-full bg-primary" aria-label="Juega" />
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Horarios preview */}
      {hasHorarios && horData && (
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-primary/5 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 font-display text-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Horarios de Salida
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              <Link to="/horarios" className="inline-flex items-center gap-1">
                Ver detalle <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-3 text-left font-bold w-40">Categoría</th>
                  {horData.dates.map((d) => (
                    <th
                      key={`hor-h-${d.date}`}
                      className="p-2 text-center font-semibold border-l border-primary-foreground/20 min-w-[90px]"
                    >
                      {shortDateLabel(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horData.entries.map((entry, idx) => (
                  <tr
                    key={entry.categoryId}
                    className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/30'}
                  >
                    <td className="border-b border-border/40 p-3 font-medium text-foreground whitespace-nowrap">
                      {entry.categoryName}
                    </td>
                    {horData.dates.map((d) => {
                      const time = entry.times?.[d.date];
                      return (
                        <td
                          key={`hor-c-${entry.categoryId}-${d.date}`}
                          className="border-b border-l border-border/40 p-2 text-center"
                        >
                          {time ? (
                            <span className="inline-flex items-center gap-1 font-mono font-semibold text-foreground">
                              <Clock className="h-3 w-3 text-primary" />
                              {time}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarioJuegoSection;
