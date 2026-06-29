/**
 * MatchPlay Page
 * ---------------------------------------------------------------------------
 * Brackets de eliminación directa (Match Play) por categoría.
 * Sólo aparece para torneos que tengan al menos una categoría con
 * `sistema = 'MATCH PLAY'` y jugadores.
 *
 * Flujo:
 *   Vista 1 (sin selección) → grid de cards de categorías disponibles.
 *   Vista 2 (categoría)     → bracket completo. Tabs D1/D2 si hay losers.
 */
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Swords, ArrowLeft, Loader2, Trophy } from 'lucide-react';
import matchplayHero from '@/assets/matchplay-hero.jpg';
import { useMatchPlayCategories, useMatchPlayBracket } from '@/hooks/useMatchPlay';
import BracketView from '@/components/matchplay/BracketView';

const MatchPlay = () => {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  const { data: categories = [], isLoading: loadingCats } = useMatchPlayCategories();
  const { data: bracket, isLoading: loadingBracket } = useMatchPlayBracket(selectedCatId);

  const selectedCat = categories.find(c => c.categoryId === selectedCatId) || null;
  const hasD2 = !!bracket?.d2?.length;

  return (
    <Layout>
      <PageHero
        title="Match Play"
        subtitle="Brackets de eliminación directa por categoría"
        backgroundImage={matchplayHero}
      />
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {loadingCats ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            // Mensaje cuando el torneo no tiene categorías Match Play con datos.
            <div className="max-w-xl mx-auto text-center py-12">
              <Swords className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Esta vista no está disponible
              </h2>
              <p className="text-muted-foreground">
                Este torneo no tiene categorías configuradas con formato Match Play, o
                aún no hay jugadores asignados a sus brackets.
              </p>
            </div>
          ) : !selectedCatId ? (
            // Vista 1: grid de categorías.
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  CATEGORÍAS:{' '}
                  <span className="text-primary">{categories.length}</span>
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Selecciona una categoría para ver su bracket.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                {categories.map(cat => (
                  <Card
                    key={cat.categoryId}
                    className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => setSelectedCatId(cat.categoryId)}
                  >
                    <CardContent className="p-5 text-center">
                      <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <h3 className="font-bold text-foreground text-lg mb-2">
                        {cat.shortName || cat.categoryName}
                      </h3>
                      <div className="text-xs text-muted-foreground">
                        {cat.playerCount} {cat.isParejas ? 'parejas' : 'jugadores'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            // Vista 2: bracket de la categoría seleccionada.
            <>
              <Button
                variant="ghost"
                onClick={() => setSelectedCatId(null)}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a categorías
              </Button>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground">
                  {selectedCat?.categoryName}
                </h2>
                {selectedCat?.shortName && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {selectedCat.shortName}
                  </p>
                )}
              </div>
              {loadingBracket || !bracket ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : hasD2 ? (
                <Tabs defaultValue="d1">
                  <TabsList className="mx-auto">
                    <TabsTrigger value="d1">Cuadro Principal</TabsTrigger>
                    <TabsTrigger value="d2">Consolación</TabsTrigger>
                  </TabsList>
                  <TabsContent value="d1" className="mt-6">
                    <BracketView matches={bracket.d1} />
                  </TabsContent>
                  <TabsContent value="d2" className="mt-6">
                    <BracketView matches={bracket.d2} />
                  </TabsContent>
                </Tabs>
              ) : (
                <BracketView matches={bracket.d1} />
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default MatchPlay;