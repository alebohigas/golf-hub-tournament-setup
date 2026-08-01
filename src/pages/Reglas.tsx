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
import reglasHero from '@/assets/reglas-hero.jpg';
import { useUploadsList } from '@/hooks/useUploads';
import { useConvocatoriaContent } from '@/hooks/useConvocatoriaContent';
import { useValorStable } from '@/hooks/useValorStable';

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

/**
 * STRICT DB-ONLY: return the DB value when usable, otherwise the provided
 * empty value. We no longer fall back to hardcoded mock content because it
 * leaked across tournaments. If the DB has nothing for a section, the page
 * simply hides that block — content must be added via /admin.
 */
const pick = <T,>(value: T | null | undefined, empty: T): T => {
  if (value === null || value === undefined) return empty;
  if (Array.isArray(value) && value.length === 0) return empty;
  if (typeof value === 'string' && value.trim() === '') return empty;
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

  // Stableford points table (torneos.valorstable) — rendered inside
  // "Reglas Locales del Torneo". Hidden when the DB has no row.
  const { rows: stablefordRows } = useValorStable();

  // Intro cards (top of the page) — strictly DB-backed.
  const introCardsRow = bySectionId.get('reglas_intro_cards');
  const introCards: IntroCard[] = introCardsRow?.enabled === false
    ? []
    : pick(introCardsRow?.content as IntroCard[] | undefined, [] as IntroCard[]);

  // Reglas locales (accordion) — strictly DB-backed.
  const reglasLocalesRow = bySectionId.get('reglas_locales');
  const reglasLocales: AccordionItemData[] = reglasLocalesRow?.enabled === false
    ? []
    : pick(reglasLocalesRow?.content as AccordionItemData[] | undefined, [] as AccordionItemData[]);

  // Reglamento / Términos de la competencia (accordion) — strictly DB-backed.
  const reglamentoRow = bySectionId.get('reglamento_local');
  const reglamentoLocal: AccordionItemData[] = reglamentoRow?.enabled === false
    ? []
    : pick(reglamentoRow?.content as AccordionItemData[] | undefined, [] as AccordionItemData[]);

  // Código de Conducta (accordion) — strictly DB-backed.
  const codigoRow = bySectionId.get('codigo_conducta');
  const codigoConducta: AccordionItemData[] = codigoRow?.enabled === false
    ? []
    : pick(codigoRow?.content as AccordionItemData[] | undefined, [] as AccordionItemData[]);

  // Desempates (accordion) — strictly DB-backed. CRITICAL section per club rules.
  const desempatesRow = bySectionId.get('desempates');
  const desempates: AccordionItemData[] = desempatesRow?.enabled === false
    ? []
    : pick(desempatesRow?.content as AccordionItemData[] | undefined, [] as AccordionItemData[]);

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
                {/* Stableford points table — only shown when DB has data. */}
                {stablefordRows.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-display font-semibold text-base mb-2 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-primary" />
                      Puntaje Stableford
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Valor de los puntos en Stableford:
                    </p>
                    <div className="overflow-hidden rounded-lg border border-border/60">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="text-left px-4 py-2 font-semibold">Dif Par</th>
                            <th className="text-right px-4 py-2 font-semibold">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stablefordRows.map((r) => (
                            <tr key={r.label} className="border-t border-border/50">
                              <td className="px-4 py-2">{r.label}</td>
                              <td className="px-4 py-2 text-right font-semibold text-primary">
                                {r.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

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

          {/* Desempates (DB-backed `desempates`) — tie-breaking rules */}
          {desempates.length > 0 && (
            <Card className="border-border/50 mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Scale className="h-5 w-5 text-primary" />
                  Desempates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {desempates.map((item, idx) => (
                    <AccordionItem key={idx} value={`desempate-${idx}`}>
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
