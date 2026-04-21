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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Users, Loader2, HelpCircle } from 'lucide-react';
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
  const { data: playersData, isLoading: loadingPlayers } = usePlayers(
    selectedCategory?.id ?? null,
    !!selectedCategory
  );
  const players = playersData?.players ?? [];
  const fechaHandicap = playersData?.fechaHandicap ?? '';

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
      <section className="py-16 bg-white">
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
              <div className="mb-8 text-left md:text-center">
                <h2 className="text-2xl font-light text-foreground mb-2">
                  Categoría: <span className="font-bold">{selectedCategory.name}</span>
                </h2>
                <div className="text-muted-foreground space-y-1">
                  <p><span className="font-bold text-foreground">Tee Salida:</span> {selectedCategory.teeName || selectedCategory.teeColor}</p>
                  <p>
                    {selectedCategory.rating != null && <><span className="font-bold text-foreground">Rating:</span> {selectedCategory.rating} </>}
                    {selectedCategory.slope != null && <><span className="font-bold text-foreground">Slope:</span> {selectedCategory.slope} </>}
                    {selectedCategory.par != null && <><span className="font-bold text-foreground">Par:</span> {selectedCategory.par}</>}
                  </p>
                  <p><span className="font-bold text-foreground">Sistema:</span> {selectedCategory.system}</p>
                  <p><span className="font-bold text-foreground">Rango Handicaps:</span> {selectedCategory.hcpMin} - {selectedCategory.hcpMax}</p>
                  {/* Día Handicap: shown between Rango and Porcentaje. Displays formatted date or em-dash when no fechahandicap is set */}
                  <p>
                    <span className="font-bold text-foreground">Día Handicap:</span>{' '}
                    {fechaHandicap
                      ? (() => {
                          const [y, m, d] = fechaHandicap.split('-').map(Number);
                          const date = new Date(y, m - 1, d);
                          return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
                        })()
                      : '—'}
                  </p>
                  <p><span className="font-bold text-foreground">Porcentaje Handicap:</span> {selectedCategory.percentage}%</p>
                  <p><span className="font-bold text-foreground">Total jugadores:</span>{' '}
                    <span className="text-primary font-bold">{selectedCategory.playerCount}</span>
                  </p>
                </div>
              </div>

              {/* Players Table - full width, centered */}
              <Card className="border-border/50 bg-white w-full max-w-4xl mx-auto">
                <div className="overflow-x-auto bg-white">
                  {loadingPlayers ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table className="bg-white tournament-table">
                      <TableHeader>
                        <TableRow className="bg-primary hover:bg-primary">
                          <TableHead className="text-primary-foreground font-bold text-center">Club</TableHead>
                          <TableHead className="text-primary-foreground font-bold">Jugador</TableHead>
                          {/* HI, HJ, HN headers with help tooltips */}
                          <TableHead className="text-primary-foreground font-bold text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center gap-1 cursor-help">
                                    HI <HelpCircle className="h-3.5 w-3.5 opacity-70" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-[220px] text-xs">
                                  <p className="font-bold">Handicap Índice</p>
                                  <p>Medida portátil de la habilidad del jugador, calculada a partir de sus mejores 8 de las últimas 20 rondas.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableHead>
                          <TableHead className="text-primary-foreground font-bold text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center gap-1 cursor-help">
                                    HJ <HelpCircle className="h-3.5 w-3.5 opacity-70" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-[220px] text-xs">
                                  <p className="font-bold">Handicap de Juego</p>
                                  <p>Golpes que el jugador recibe en un campo específico, ajustado por el rating y slope del tee de salida.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableHead>
                          <TableHead className="text-primary-foreground font-bold text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center gap-1 cursor-help">
                                    HN <HelpCircle className="h-3.5 w-3.5 opacity-70" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-[220px] text-xs">
                                  <p className="font-bold">Handicap Neto</p>
                                  <p>Handicap de juego ajustado por el porcentaje de la categoría, usado para calcular el score neto del torneo.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                       <TableBody>
                         {players.length > 0 ? (
                           players.map((player) => (
                             <TableRow key={player.id} className="bg-white hover:bg-white">
                               {/* Club Logo column */}
                               <TableCell className="p-1 text-center align-middle">
                                 <img
                                   src={player.clubLogo}
                                   alt="Club logo"
                                   className="w-auto object-contain rounded inline-block"
                                   style={{ height: '2.25rem' }}
                                   onError={(e) => {
                                     (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23166534" rx="4"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="9" font-family="sans-serif">Club</text></svg>')}`;
                                   }}
                                 />
                               </TableCell>
                               <TableCell className="player-name-cell">{player.name}</TableCell>
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
