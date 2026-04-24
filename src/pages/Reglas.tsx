/**
 * Reglas Page
 * Displays tournament rules, code of conduct, and local rules from convocatoria
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Scale, Clock, AlertTriangle, Gavel, ScrollText } from 'lucide-react';
import { reglasData, reglamentoLocalData } from '@/data/mockData';
import reglasHero from '@/assets/reglas-hero.jpg';

const Reglas = () => {
  return (
    <Layout>
      <PageHero 
        title="Reglas y Código de Conducta"
        subtitle="Reglamento oficial del torneo"
        backgroundImage={reglasHero}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* General rules cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Reglas de Golf
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                El torneo se rige por las Reglas de Golf vigentes de la R&A y la USGA, así como por las reglas locales establecidas por el Club.
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Scale className="h-5 w-5 text-primary" />
                  Sistema de Handicap
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Se utilizará el Sistema Universal de Handicap (WHS) para el cálculo del handicap de juego.
              </CardContent>
            </Card>
          </div>

          {/* Local rules from convocatoria */}
          {reglasData.length > 0 && (
            <Card className="border-border/50 mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Gavel className="h-5 w-5 text-primary" />
                  Reglas Locales del Torneo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {reglasData.map((regla, idx) => (
                    <AccordionItem key={idx} value={`regla-${idx}`}>
                      <AccordionTrigger className="hover:no-underline font-medium">
                        {regla.titulo}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {regla.contenido}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Reglamento Local - collapsible sections from convocatoria */}
          {reglamentoLocalData.length > 0 && (
            <Card className="border-border/50 mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <ScrollText className="h-5 w-5 text-primary" />
                  Reglamento Local
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {reglamentoLocalData.map((item, idx) => (
                    <AccordionItem key={idx} value={`reglamento-${idx}`}>
                      <AccordionTrigger className="hover:no-underline font-medium">
                        {item.titulo}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {item.contenido}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Code of conduct accordion */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display">Código de Conducta</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      Puntualidad
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Los jugadores deberán presentarse en su hoyo de salida 5 minutos antes de la hora programada y estar listos para jugar a la hora estipulada. Si el jugador se presenta hasta con cinco minutos de retraso a su mesa de salida, tendrá 2 golpes de penalidad en el primer hoyo. Después de estos 5 minutos será descalificado.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-accent" />
                      Ritmo de Juego
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    El tiempo máximo para completar 18 hoyos será de 4 horas y 40 minutos. Los grupos fuera de posición serán cronometrados con un máximo de 40 segundos por golpe. Penalidad: 1er mal tiempo, un golpe de castigo; 2do mal tiempo, penalidad general; 3er mal tiempo, descalificación.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="hover:no-underline">
                    Código de Vestimenta
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Vestimenta según el código interno del Reglamento de Golf del club: playera con cuello, pantalón o bermuda de vestir, y zapatos de golf. No se permiten jeans, playeras sin cuello o sandalias.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="hover:no-underline">
                    Dispositivos Electrónicos
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Se permite el uso de dispositivos de medición de distancia. Queda prohibido utilizar funciones que midan velocidad del viento, slope u otros parámetros (Regla 4.3a). El uso de teléfonos celulares está permitido siempre que sea con discreción, sin retrasar el juego ni distraer a los demás jugadores. Durante la ronda está prohibido escuchar música (1ª infracción: amonestación; 2ª: penalidad general; 3ª: descalificación).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="hover:no-underline">
                    Transportación y Caddie
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Los jugadores podrán utilizar transportación automotriz para ellos mismos, su equipo y su caddie. Es obligatorio contratar los servicios de un caddie (siempre y cuando el club pueda proporcionarlo), el cual puede ser compartido con otro jugador.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="hover:no-underline">
                    Conducta Deportiva
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Se espera que todos los participantes mantengan una conducta deportiva ejemplar. Cualquier comportamiento antideportivo será sancionado y puede resultar en descalificación.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Reglas;
