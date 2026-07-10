/**
 * SkinRules Page
 * ---------------------------------------------------------------
 * Renders the Skin Game rules for the active tournament, mirroring
 * the /reglas page structure but reading its own DB rows
 * (`skinrules_*` section_ids in convocatoria_content).
 *
 * STRICT DB-ONLY: no hardcoded fallback content. If a torneoid has
 * no `skinrules_*` rows, the accordion/cards simply don't render —
 * only the PDF button (if a PDF was uploaded) is shown.
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { BookOpen, Scale, Gavel, ShieldCheck, Trophy, FileText, Clock, AlertTriangle, ScrollText } from 'lucide-react';
import skinHero from '@/assets/skin-hero.jpg';
import { useUploadsList } from '@/hooks/useUploads';
import { useConvocatoriaContent } from '@/hooks/useConvocatoriaContent';

// ============= Helpers =============

/** Icon name (string in DB) → Lucide icon component. */
const ICONS: Record<string, typeof BookOpen> = {
  BookOpen, Scale, Gavel, ShieldCheck, Trophy, Clock, AlertTriangle, ScrollText,
};
const getIcon = (key?: string | null) => (key && ICONS[key]) || BookOpen;

/** Return the value when present/non-empty, otherwise the provided empty. */
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

const SkinRules = () => {
  // Resolve PDF: first PDF uploaded to the `skinrules` section (any filename).
  const { data: uploads } = useUploadsList('skinrules');
  const firstPdf = uploads?.files.find((f) => /\.pdf$/i.test(f.name));
  const pdfUrl = firstPdf?.url;

  // DB-backed content (per active torneoid).
  const { bySectionId } = useConvocatoriaContent();

  const introRow = bySectionId.get('skinrules_intro_cards');
  const introCards: IntroCard[] = introRow?.enabled === false
    ? []
    : pick(introRow?.content as IntroCard[] | undefined, [] as IntroCard[]);

  const reglasRow = bySectionId.get('skinrules_reglas');
  const reglas: AccordionItemData[] = reglasRow?.enabled === false
    ? []
    : pick(reglasRow?.content as AccordionItemData[] | undefined, [] as AccordionItemData[]);

  const pdfLabelRow = bySectionId.get('skinrules_pdf_label');
  const pdfLabel = pick(
    (pdfLabelRow?.content as PdfLabel | undefined)?.label,
    'Ver Reglas del Skin Game (PDF)'
  );

  return (
    <Layout>
      <PageHero
        title="Skin Rules"
        subtitle="Reglas oficiales del juego de Skins"
        backgroundImage={skinHero}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* CTA: only shown when a PDF has been uploaded */}
          {pdfUrl && (
            <div className="mb-10 flex justify-center">
              <Button asChild size="lg" className="gap-2">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-5 w-5" />
                  {pdfLabel}
                </a>
              </Button>
            </div>
          )}

          {/* Intro cards (DB-backed `skinrules_intro_cards`) */}
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

          {/* Reglas del Skin Game (DB-backed `skinrules_reglas`) */}
          {reglas.length > 0 && (
            <Card className="border-border/50 mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Gavel className="h-5 w-5 text-primary" />
                  Reglas del Skin Game
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {reglas.map((regla, idx) => (
                    <AccordionItem key={idx} value={`skin-regla-${idx}`}>
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

          {/* Empty state: nothing configured for this torneoid */}
          {!pdfUrl && introCards.length === 0 && reglas.length === 0 && (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center text-muted-foreground">
                Aún no hay reglas de Skin Game configuradas para este torneo.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default SkinRules;