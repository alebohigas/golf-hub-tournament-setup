/**
 * Jugadores Page
 * Shows tournament categories as cards, then players table on category click
 * Data fetched from categories.php and players.php via React Query hooks
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import jugadoresHero from '@/assets/jugadores-hero.jpg';
import { useState } from 'react';
import { useCategories, usePlayers } from '@/hooks/usePlayersData';
import type { CategoryDetail } from '@/data/playersData';

const Jugadores = () => {
  /** Currently selected category (null = show grid) */
  const [selectedCategory, setSelectedCategory] = useState<CategoryDetail | null>(null);

  // Fetch categories from API
  const { data: categories = [], isLoading: loadingCats } = useCategories();

  // Fetch players only when a category is selected
  const { data: players = [], isLoading: loadingPlayers } = usePlayers(
    selectedCategory?.id ?? null,
    !!selectedCategory
  );

  /** Total players across all categories */
  const totalPlayers = categories.reduce((sum, cat) => sum + cat.playerCount, 0);

  /** Navigate back to category grid */
  const handleBack = () => setSelectedCategory(null);

  return (
    <Layout>
      <PageHero
        title="Jugadores"
        subtitle="Lista completa de participantes inscritos en el torneo"
        backgroundImage={jugadoresHero}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {!selectedCategory ? (
            <>
              {/* Total Players Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  JUGADORES: <span className="text-primary">{loadingCats ? '…' : totalPlayers}</span>
                </h2>
              </div>

              {/* Loading State */}
              {loadingCats ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                /* Categories Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="border-border/50 hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 text-center">
                        <h3 className="font-bold text-foreground">{category.shortName}</h3>
                        <p className="text-2xl font-bold text-primary my-2">{category.playerCount}</p>
                        <Button
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="w-full"
                        >
                          Ver
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Category Detail View */}
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a categorías
              </Button>

              {/* Category Info Header */}
              {/* Category Info Header with tee, rating, slope, par details */}
              {/* Category Info Header - centered */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-light text-foreground mb-2">
                  Categoría: <span className="font-bold">{selectedCategory.name}</span>
                </h2>
                <div className="text-muted-foreground space-y-1">
                  <p>
                    Tee Salida {selectedCategory.teeName || selectedCategory.teeColor}
                    {selectedCategory.rating != null && ` / Rating ${selectedCategory.rating}`}
                    {selectedCategory.slope != null && ` Slope ${selectedCategory.slope}`}
                    {selectedCategory.par != null && ` par ${selectedCategory.par}`}
                  </p>
                  <p>Sistema {selectedCategory.system} / Rango Handicaps {selectedCategory.hcpMin} - {selectedCategory.hcpMax}</p>
                  <p>
                    Porcentaje Handicap {selectedCategory.percentage}% / Total jugadores{' '}
                    <span className="text-primary font-bold">{selectedCategory.playerCount}</span>
                  </p>
                </div>
              </div>

              {/* Players Table - full width, centered */}
              <Card className="border-border/50 w-full max-w-4xl mx-auto">
                <div className="overflow-x-auto">
                  {loadingPlayers ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary hover:bg-primary">
                          <TableHead className="text-primary-foreground font-bold">Club</TableHead>
                          <TableHead className="text-primary-foreground font-bold">Jugador</TableHead>
                          <TableHead className="text-primary-foreground font-bold text-right">HI</TableHead>
                          <TableHead className="text-primary-foreground font-bold text-right">HJ</TableHead>
                          <TableHead className="text-primary-foreground font-bold text-right">HN</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {players.length > 0 ? (
                          players.map((player) => (
                            <TableRow key={player.id}>
                              {/* Club Logo - fills row height, no artificial limits */}
                              <TableCell className="p-1 text-center align-middle">
                                <img
                                  src={player.clubLogo}
                                  alt="Club logo"
                                  className="w-auto object-contain rounded inline-block"
                                  style={{ height: '3.5rem' }}
                                  onError={(e) => {
                                    /* Fallback SVG if logo fails to load */
                                    (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23166534" rx="4"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="9" font-family="sans-serif">Club</text></svg>')}`;
                                  }}
                                />
                              </TableCell>
                              <TableCell>{player.name}</TableCell>
                              <TableCell className="text-right">{player.handicapIndex.toFixed(1)}</TableCell>
                              <TableCell className="text-right">{player.handicapJuego}</TableCell>
                              <TableCell className="text-right">{player.handicapNeto}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              No hay jugadores registrados en esta categoría
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Jugadores;
