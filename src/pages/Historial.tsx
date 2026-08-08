/**
 * Historial Page (/historial)
 * ------------------------------------------------------------------
 * Historical results browser. Works exactly like /resultados but for a PAST
 * tournament edition: the user first picks a year from a card grid (same
 * card-based navigation used in Competición), then the standard leaderboard
 * UI is rendered in embedded mode with the year's `torneo_id` override.
 *
 * Years come from Admin > Historial (`site_config.historial_config`),
 * limited to 5 previous editions.
 */

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarClock, History, Loader2 } from 'lucide-react';
import resultadosHero from '@/assets/resultados-hero.jpg';
import Resultados from '@/pages/Resultados';
import { useSiteConfig, type HistorialEdition } from '@/hooks/useSiteConfig';

const Historial = () => {
  const { data: siteConfig, isLoading } = useSiteConfig();

  /** Configured editions, most recent year first, capped at 5. */
  const editions: HistorialEdition[] = [...(siteConfig?.historial_config?.editions || [])]
    .filter(e => e && Number(e.year) > 0 && String(e.torneoId || '').trim() !== '')
    .sort((a, b) => Number(b.year) - Number(a.year))
    .slice(0, 5);

  /** Selected year (null = show the year selector grid). */
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const selected = editions.find(e => Number(e.year) === selectedYear) || null;

  return (
    <Layout>
      <PageHero
        title="Historial"
        subtitle="Consulta los resultados de ediciones anteriores"
        backgroundImage={resultadosHero}
      />

      {!selected ? (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground">
                SELECCIONA EL AÑO
              </h2>
              <p className="text-muted-foreground mt-2">
                Historial de resultados de hasta 5 años anteriores
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : editions.length === 0 ? (
              <div className="max-w-xl mx-auto text-center text-muted-foreground border border-dashed border-border rounded-lg p-10">
                <History className="h-8 w-8 mx-auto mb-3 text-primary" />
                Aún no hay ediciones anteriores configuradas.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                {editions.map((ed) => (
                  <Card
                    key={ed.year}
                    className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => setSelectedYear(Number(ed.year))}
                  >
                    <CardContent className="p-5 text-center">
                      <CalendarClock className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <h3 className="font-bold text-foreground text-2xl">{ed.year}</h3>
                      {ed.label ? (
                        <p className="text-xs text-muted-foreground mt-1">{ed.label}</p>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          <section className="pt-10 bg-white">
            <div className="container mx-auto px-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedYear(null)}
                className="gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a años
              </Button>
              <h2 className="text-2xl font-bold text-foreground mt-6 text-center">
                {selected.label || `Resultados ${selected.year}`}
              </h2>
            </div>
          </section>
          {/*
            Reuse the /resultados leaderboard verbatim, but pointed at the
            historical tournament id. `key` forces a clean remount (and fresh
            category selection) when the year changes.
          */}
          <Resultados key={selected.torneoId} embedded torneoIdOverride={String(selected.torneoId)} />
        </>
      )}
    </Layout>
  );
};

export default Historial;