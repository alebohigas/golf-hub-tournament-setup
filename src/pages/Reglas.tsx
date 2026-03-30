/**
 * Reglas Page
 * Displays tournament rules, code of conduct, and local rules from convocatoria
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Scale, Clock, AlertTriangle, Gavel } from 'lucide-react';
import { reglasData, reglamentoLocalData } from '@/data/mockData';

const Reglas = () => {
  return (
    <Layout>
      <PageHero 
        title="Reglas y Código de Conducta"
        subtitle="Reglamento oficial del torneo"
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
                    Los jugadores deberán presentarse en el tee de salida 10 minutos antes de su hora programada. La penalización por llegar tarde será de 2 golpes en stroke play o pérdida del primer hoyo en match play.
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
                    El tiempo máximo para completar 18 hoyos será de 4 horas y 30 minutos. Los grupos que excedan este tiempo podrán ser penalizados conforme al reglamento de ritmo de juego.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="hover:no-underline">
                    Código de Vestimenta
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Se requiere vestimenta apropiada de golf: playera con cuello, pantalón o bermuda de vestir, y zapatos de golf. No se permiten jeans, playeras sin cuello o sandalias.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="hover:no-underline">
                    Dispositivos Electrónicos
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Se permite el uso de dispositivos de medición de distancia. Queda prohibido el uso de dispositivos que midan el viento, elevación o que den consejos de juego.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="hover:no-underline">
                    Carros de Golf
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    El uso de carros de golf está permitido. Se debe respetar la regla de 90 grados y las áreas marcadas como "solo carros".
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
