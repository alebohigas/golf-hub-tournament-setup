/**
 * Horarios de Salidas Page
 * Displays the official kickoff time per category per tournament day.
 *
 * Source: /api/horarios.php (computes MIN(salidagrupo.horainicio1a) by
 * caljuegoid → caljuego.fecha + categoriaid, ignoring '00:00:00').
 *
 * Layout: matrix table with category rows × date columns. Cells show the
 * earliest tee time in 24h "HH:MM" format. Empty cells indicate no valid
 * kickoff time was recorded for that combination.
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useHorariosData, type HorarioDate } from '@/hooks/useHorariosData';
import horariosHero from '@/assets/horarios-hero.jpg';

// ============= Date label helpers (ES) =============

/** Spanish 3-letter month abbreviation, e.g. "Abr". */
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

/** Top header line: month abbreviation. */
const formatMonthHeader = (d: HorarioDate): string =>
  monthShortEs[d.month] || (d.month ? d.month.slice(0, 3) : '');

/** Bottom header line: "Vie.24" style. */
const formatDayHeader = (d: HorarioDate): string => {
  const day = dayShortEs[d.dayOfWeek] || d.dayOfWeek?.slice(0, 3) || '';
  return `${day}.${d.dayNum}`;
};

// ============= Component =============

const Horarios = () => {
  const { data, isLoading } = useHorariosData();

  const dates   = data?.dates   ?? [];
  const entries = data?.entries ?? [];

  return (
    <Layout>
      <PageHero
        title="Horarios de Salidas"
        subtitle="Hora oficial de salida por categoría y día"
        backgroundImage={horariosHero}
        backgroundPosition="center 60%"
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Horarios por Categoría
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Hora más temprana válida registrada en el sistema de salidas.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : entries.length === 0 || dates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay horarios de salida registrados para este torneo.
            </div>
          ) : (
            <Card className="border-border/50 max-w-6xl mx-auto">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      {/* Month abbreviation row */}
                      <tr>
                        <th className="border border-border/40 p-2 text-left text-foreground font-semibold w-40 bg-muted" />
                        {dates.map((d) => (
                          <th
                            key={`m-${d.date}`}
                            className="border border-border/40 p-2 text-center text-muted-foreground font-medium min-w-[80px] bg-muted"
                          >
                            {formatMonthHeader(d)}
                          </th>
                        ))}
                      </tr>
                      {/* Day-of-week + day number row */}
                      <tr>
                        <th
                          className="border border-border/40 p-2 text-left text-foreground font-bold"
                          style={{
                            backgroundColor: 'hsl(var(--background))',
                            backgroundImage:
                              'linear-gradient(hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.1))',
                          }}
                        >
                          Categoría
                        </th>
                        {dates.map((d) => (
                          <th
                            key={`d-${d.date}`}
                            className="border border-border/40 p-2 text-center text-foreground font-bold"
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
                    <tbody>
                      {entries.map((entry, idx) => (
                        <tr
                          key={entry.categoryId}
                          className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'}
                        >
                          <td className="border border-border/40 p-2 font-medium text-foreground whitespace-nowrap">
                            {entry.categoryName}
                          </td>
                          {dates.map((d) => {
                            const time = entry.times?.[d.date];
                            return (
                              <td
                                key={d.date}
                                className="border border-border/40 p-2 text-center align-middle h-9"
                              >
                                {time ? (
                                  <span className="font-mono text-foreground font-semibold">
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Horarios;