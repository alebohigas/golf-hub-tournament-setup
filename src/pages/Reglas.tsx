/**
 * Reglas Page
 * Displays tournament rules, code of conduct, and local rules from convocatoria
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { BookOpen, Scale, Clock, AlertTriangle, Gavel, ScrollText, FileText } from 'lucide-react';
import { reglasData, reglamentoLocalData } from '@/data/mockData';
import reglasHero from '@/assets/reglas-hero.jpg';
import { useUploadsList } from '@/hooks/useUploads';
import { useConvocatoriaContent } from '@/hooks/useConvocatoriaContent';

// ============= Helpers =============

/**
 * Map a string icon key (stored in DB) to a Lucide icon component.
 * Falls back to `BookOpen` so unknown values still render something.
 */
const ICONS: Record<string, typeof BookOpen> = {
  BookOpen,
  Scale,
  Clock,
  AlertTriangle,
  Gavel,
  ScrollText,
};
const getIcon = (key?: string | null) => (key && ICONS[key]) || BookOpen;

/** Return `value` when it looks usable; otherwise the fallback. */
const pick = <T,>(value: T | null | undefined, fallback: T): T => {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value) && value.length === 0) return fallback;
  if (typeof value === 'string' && value.trim() === '') return fallback;
  return value;
};

// ============= DB content shapes =============

interface IntroCard { icon?: string; title: string; body: string }
interface AccordionItemData { titulo: string; contenido: string; icon?: string | null }
interface PdfLabel { label?: string }

const Reglas = () => {
  // Resolve the reglas PDF URL with a 3-tier fallback chain:
  //   1. First PDF uploaded to the `reglas` section via /admin (any filename).
  //   2. Legacy: a file literally named `reglas-y-cc.pdf` left in the old
  //      `pdfs` bucket from before sections were split.
  //   3. Build-time fallback shipped at /reglas-y-cc.pdf in public/.
  const { data: reglasUploads } = useUploadsList('reglas');
  const { data: legacyPdfs } = useUploadsList('pdfs');
  const firstSectionPdf = reglasUploads?.files.find((f) => /\.pdf$/i.test(f.name));
  const legacyReglasPdf = legacyPdfs?.files.find(
    (f) => f.name.toLowerCase() === 'reglas-y-cc.pdf'
  );
  const reglasPdfUrl = firstSectionPdf?.url ?? legacyReglasPdf?.url ?? '/reglas-y-cc.pdf';

  // DB-backed content (per active torneoid). Falls back to hardcoded defaults.
  const { bySectionId } = useConvocatoriaContent();

  // Intro cards (top of the page)
  const introCardsDefault: IntroCard[] = [
    {
      icon: 'BookOpen',
      title: 'Reglas de Golf',
      body: 'El torneo se rige por las Reglas de Golf vigentes de la R&A y la USGA, así como por las reglas locales establecidas por el Club.',
    },
    {
      icon: 'Scale',
      title: 'Sistema de Handicap',
      body: 'Se utilizará el Sistema Universal de Handicap (WHS) para el cálculo del handicap de juego.',
    },
  ];
  const introCardsRow = bySectionId.get('reglas_intro_cards');
  const introCards: IntroCard[] = introCardsRow?.enabled === false
    ? []
    : pick(introCardsRow?.content as IntroCard[] | undefined, introCardsDefault);

  // Reglas locales (accordion)
  const reglasLocalesRow = bySectionId.get('reglas_locales');
  const reglasLocales: AccordionItemData[] = reglasLocalesRow?.enabled === false
    ? []
    : pick(reglasLocalesRow?.content as AccordionItemData[] | undefined, reglasData);

  // Reglamento / Términos de la competencia (accordion)
  const reglamentoRow = bySectionId.get('reglamento_local');
  const reglamentoLocal: AccordionItemData[] = reglamentoRow?.enabled === false
    ? []
    : pick(reglamentoRow?.content as AccordionItemData[] | undefined, reglamentoLocalData);

  // Código de Conducta (accordion)
  const codigoConductaDefault: AccordionItemData[] = [
    { icon: 'Clock', titulo: 'Puntualidad', contenido: 'Los jugadores deberán presentarse en su hoyo de salida 5 minutos antes de la hora programada y estar listos para jugar a la hora estipulada. Si el jugador se presenta hasta con cinco minutos de retraso a su mesa de salida, tendrá 2 golpes de penalidad en el primer hoyo. Después de estos 5 minutos será descalificado.' },
    { icon: 'AlertTriangle', titulo: 'Ritmo de Juego', contenido: 'El tiempo máximo para completar 18 hoyos será de 4 horas y 40 minutos. Los grupos fuera de posición serán cronometrados con un máximo de 40 segundos por golpe. Penalidad: 1er mal tiempo, un golpe de castigo; 2do mal tiempo, penalidad general; 3er mal tiempo, descalificación.' },
    { titulo: 'Código de Vestimenta', contenido: 'Vestimenta según el código interno del Reglamento de Golf del club: playera con cuello, pantalón o bermuda de vestir, y zapatos de golf. No se permiten jeans, playeras sin cuello o sandalias.' },
    { titulo: 'Dispositivos Electrónicos', contenido: 'Se permite el uso de dispositivos de medición de distancia. Queda prohibido utilizar funciones que midan velocidad del viento, slope u otros parámetros (Regla 4.3a). El uso de teléfonos celulares está permitido siempre que sea con discreción, sin retrasar el juego ni distraer a los demás jugadores. Durante la ronda está prohibido escuchar música (1ª infracción: amonestación; 2ª: penalidad general; 3ª: descalificación).' },
    { titulo: 'Transportación y Caddie', contenido: 'Los jugadores podrán utilizar transportación automotriz para ellos mismos, su equipo y su caddie. Es obligatorio contratar los servicios de un caddie (siempre y cuando el club pueda proporcionarlo), el cual puede ser compartido con otro jugador.' },
    { titulo: 'Conducta Deportiva', contenido: 'Se espera que todos los participantes mantengan una conducta deportiva ejemplar. Cualquier comportamiento antideportivo será sancionado y puede resultar en descalificación.' },
  ];
  const codigoRow = bySectionId.get('codigo_conducta');
  const codigoConducta: AccordionItemData[] = codigoRow?.enabled === false
    ? []
    : pick(codigoRow?.content as AccordionItemData[] | undefined, codigoConductaDefault);

  // PDF button label (optional override)
  const pdfLabelRow = bySectionId.get('reglas_pdf_label');
  const pdfLabel = pick(
    (pdfLabelRow?.content as PdfLabel | undefined)?.label,
    'Ver Reglas y T. de Competencia (PDF)'
  );

  return (
    <Layout>
      <PageHero 
        title="Reglas y Términos de la Competencia"
        subtitle="Reglamento oficial del torneo"
        backgroundImage={reglasHero}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* CTA: Download/View full Reglas y CC PDF document */}
          <div className="mb-10 flex justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2"
            >
              <a
                href={reglasPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="h-5 w-5" />
                {pdfLabel}
              </a>
            </Button>
          </div>

          {/* General rules cards (DB-backed `reglas_intro_cards`) */}
          {introCards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {introCards.map((card, idx) => {
                const Icon = getIcon(card.icon);
                return (
                  <Card key={idx} className="border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-display">
                        <Icon className="h-5 w-5 text-primary" />
                        {card.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                      {card.body}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Local rules (DB-backed `reglas_locales`) */}
          {reglasLocales.length > 0 && (
            <Card className="border-border/50 mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Gavel className="h-5 w-5 text-primary" />
                  Reglas Locales del Torneo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {reglasLocales.map((regla, idx) => (
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

          {/* Reglamento Local (DB-backed `reglamento_local`) */}
          {reglamentoLocal.length > 0 && (
            <Card className="border-border/50 mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <ScrollText className="h-5 w-5 text-primary" />
                  Términos de la Competencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {reglamentoLocal.map((item, idx) => (
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

          {/* Code of conduct (DB-backed `codigo_conducta`) */}
          {codigoConducta.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="font-display">Código de Conducta</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {codigoConducta.map((item, idx) => {
                    const Icon = item.icon ? getIcon(item.icon) : null;
                    return (
                      <AccordionItem key={idx} value={`conducta-${idx}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <span className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4 text-accent" />}
                            {item.titulo}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground whitespace-pre-line">
                          {item.contenido}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Reglas;
