/**
 * Calendario Page
 * Displays tournament calendar from caljuego table
 * Shows category, date, start time, and course
 * Also shows convocatoria schedule/horario data when available
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CalendarDays, Clock } from 'lucide-react';
import { useCalendarioData } from '@/hooks/useCalendarioData';
import type { CalendarDate, CalendarEntry } from '@/data/calendarioData';
import calendarioHero from '@/assets/calendario-hero.jpg';
import { scheduleData, salidasText } from '@/data/mockData';
import ScheduleTable from '@/components/convocatoria/ScheduleTable';

/** Format time string from HH:MM:SS to h:mm a */
const formatTime = (timeStr: string): string => {
  if (!timeStr) return '-';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
};

/** Format date for column headers */
const formatDateHeader = (d: CalendarDate): string => {
  return `${d.dayOfWeek} ${d.dayNum}`;
};

const Calendario = () => {
  const { data, isLoading } = useCalendarioData();

  const dates = data?.dates ?? [];
  const entries = data?.entries ?? [];

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
            <Card className="border-border/50 overflow-hidden max-w-5xl mx-auto">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full border-collapse">
                  {/* Column headers: Category + each date */}
                  <thead>
                    <tr className="bg-primary">
                      <th className="border border-border/30 p-3 text-left text-primary-foreground font-bold">
                        Categoría
                      </th>
                      {dates.map(d => (
                        <th key={d.date} className="border border-border/30 p-3 text-center text-primary-foreground font-bold min-w-[100px]">
                          <div>{formatDateHeader(d)}</div>
                          {d.course && (
                            <div className="text-xs font-normal opacity-80">{d.course}</div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(([catKey, catData], idx) => (
                      <tr key={catKey} className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                        {/* Category name */}
                        <td className="border border-border/30 p-3 font-medium text-foreground">
                          {catData.name}
                        </td>
                        {/* Time slot per date */}
                        {dates.map(d => {
                          const dayEntries = catData.byDate.get(d.date);
                          if (!dayEntries || dayEntries.length === 0) {
                            return (
                              <td key={d.date} className="border border-border/30 p-2 text-center text-muted-foreground/30">
                                -
                              </td>
                            );
                          }
                          return (
                            <td key={d.date} className="border border-border/30 p-2 text-center">
                              {dayEntries.map((entry, i) => (
                                <div key={entry.id} className={`flex items-center justify-center gap-1 font-medium ${
                                  i > 0 ? 'mt-1' : ''
                                }`}>
                                  <Clock className="h-3 w-3 text-primary" />
                                  <span className="text-sm text-foreground">{formatTime(entry.startTime)}</span>
                                </div>
                              ))}
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
