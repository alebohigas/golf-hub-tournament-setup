/**
 * Eventos Page
 * Displays tournament event schedule by day
 * Data fetched from eventos.php via useEventos hook
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Gift, Loader2 } from 'lucide-react';
import { useEventos } from '@/hooks/useTournamentData';

const Eventos = () => {
  const { data: eventos = [], isLoading } = useEventos();

  return (
    <Layout>
      <PageHero 
        title="Calendario de Eventos"
        subtitle="Programa de actividades del torneo"
        backgroundImage="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1920&q=80"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              Programa de Actividades
            </h2>
            <p className="text-muted-foreground">
              Todos los eventos y sorteos del torneo
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {eventos.map((day, idx) => (
                <Card key={idx} className="shadow-card border-border/50 overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b border-border/50">
                    <CardTitle className="flex items-center gap-3 font-display">
                      <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center text-primary-foreground">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-primary text-xl">{day.dayName}</span>
                        <span className="text-muted-foreground text-base font-normal ml-2">
                          {day.date}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-4">
                      {/* Events Column */}
                      <div className="lg:col-span-3 p-6">
                        <div className="space-y-3">
                          {day.events.map((event, eventIdx) => (
                            <div 
                              key={eventIdx} 
                              className="flex items-start gap-4 py-2 border-b border-border/30 last:border-0"
                            >
                              <div className="w-32 flex-shrink-0">
                                {event.time && (
                                  <div className="flex items-center gap-2 text-sm text-accent font-medium">
                                    <Clock className="h-4 w-4" />
                                    <span>{event.time}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <span className="text-foreground font-medium">{event.event}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sorteos Column */}
                      {day.sorteos && day.sorteos.length > 0 && (
                        <div className="lg:col-span-1 bg-accent/10 p-6 border-t lg:border-t-0 lg:border-l border-border/50">
                          <div className="flex items-center gap-2 mb-4">
                            <Gift className="h-5 w-5 text-accent" />
                            <span className="font-display font-semibold text-foreground">Sorteos</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {day.sorteos.map((sorteo, sorteoIdx) => (
                              <Badge 
                                key={sorteoIdx} 
                                variant="secondary"
                                className="bg-accent/20 text-accent-foreground hover:bg-accent/30"
                              >
                                {sorteo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              * Los horarios están sujetos a cambios. Consulta con la coordinación deportiva para confirmaciones.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Eventos;
