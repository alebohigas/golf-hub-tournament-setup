/**
 * Salidas Page
 * Displays tee times organized by day → category → groups
 * Uses table format consistent with other pages (Resultados, etc.)
 * Data fetched from salidas.php and salidas_det.php via React Query hooks
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Calendar, Loader2, Users } from 'lucide-react';
import { useState } from 'react';
import { useSalidasMaster, useSalidasDetail } from '@/hooks/useSalidasData';
import type { SalidasDay, SalidasCategory } from '@/hooks/useSalidasData';
import { LOGOS_BASE_URL } from '@/config/api';
import { ApiError } from '@/lib/apiClient';
import salidasHero from '@/assets/salidas-hero.jpg';

// ============= Component =============

const Salidas = () => {
  /** Currently selected day index */
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  /** Currently selected caljgoid for detail view */
  const [selectedCaljgoid, setSelectedCaljgoid] = useState<string | null>(null);
  /** Selected category metadata for header display */
  const [selectedCatMeta, setSelectedCatMeta] = useState<SalidasCategory | null>(null);

  // Fetch master data: days + categories
  const { data: master, isLoading: loadingMaster } = useSalidasMaster();
  const days = master?.days ?? [];

  /** Normalize selected format to endpoint-compatible values */
  const selectedFormato = selectedCatMeta?.format?.toLowerCase().includes('pareja') ? 'parejas' : 'individual';

  // Fetch detail for selected category
  const {
    data: detail,
    isLoading: loadingDetail,
    isError: detailIsError,
    error: detailError,
  } = useSalidasDetail(selectedCaljgoid, selectedFormato);

  /** Handle day card click - if only one category, go directly to detail */
  const handleDayClick = (dayIdx: number) => {
    const day = days[dayIdx];
    if (day.categories.length === 1) {
      // Skip category selection, go directly to groups
      setSelectedDayIdx(dayIdx);
      setSelectedCaljgoid(String(day.categories[0].caljgoid));
      setSelectedCatMeta(day.categories[0]);
    } else {
      setSelectedDayIdx(dayIdx);
      setSelectedCaljgoid(null);
      setSelectedCatMeta(null);
    }
  };

  /** Handle category click */
  const handleCategoryClick = (cat: SalidasCategory) => {
    setSelectedCaljgoid(String(cat.caljgoid));
    setSelectedCatMeta(cat);
  };

  /** Handle back navigation */
  const handleBack = () => {
    if (selectedCaljgoid) {
      // If day has multiple categories, go back to category selection
      const day = selectedDayIdx !== null ? days[selectedDayIdx] : null;
      if (day && day.categories.length > 1) {
        setSelectedCaljgoid(null);
        setSelectedCatMeta(null);
      } else {
        // Single category day - go back to days
        setSelectedDayIdx(null);
        setSelectedCaljgoid(null);
        setSelectedCatMeta(null);
      }
    } else {
      // Back to days
      setSelectedDayIdx(null);
    }
  };

  /** Currently selected day object */
  const selectedDay: SalidasDay | null = selectedDayIdx !== null ? days[selectedDayIdx] : null;

  /** Total groups across all days for header */
  const totalCategories = days.reduce((sum, d) => sum + d.categories.length, 0);

  return (
    <Layout>
      <PageHero
        title="Salidas"
        subtitle="Horarios de salida y grupos de juego"
        backgroundImage={salidasHero}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">

          {/* ============= Level 1: Day Selection ============= */}
          {selectedDayIdx === null ? (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  DÍAS DE JUEGO: <span className="text-primary">{loadingMaster ? '…' : days.length}</span>
                </h2>
              </div>

              {loadingMaster ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : days.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-lg">No hay salidas disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {days.map((day, idx) => (
                    <Card
                      key={idx}
                      className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
                      onClick={() => handleDayClick(idx)}
                    >
                      <CardContent className="p-6 text-center">
                        <Calendar className="h-8 w-8 mx-auto mb-3 text-primary" />
                        <h3 className="font-bold text-foreground text-lg mb-1 capitalize">{day.dateFormatted}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{day.course}</p>
                        <div className="flex justify-center gap-4 text-sm">
                          <div>
                            <span className="text-2xl font-bold text-primary">{day.categories.length}</span>
                            <p className="text-muted-foreground">Categorías</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>

          /* ============= Level 2: Category Selection (multi-category days) ============= */
          ) : !selectedCaljgoid && selectedDay ? (
            <>
              <Button variant="ghost" onClick={handleBack} className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20">
                <ArrowLeft className="h-4 w-4" />
                Volver a días
              </Button>

              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground mb-2 capitalize">{selectedDay.dateFormatted}</h2>
                <p className="text-muted-foreground">{selectedDay.course}</p>
                <p className="text-muted-foreground mt-1">Selecciona una categoría</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                {selectedDay.categories.map((cat) => (
                  <Card
                    key={cat.caljgoid}
                    className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <CardContent className="p-5 text-center">
                      <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <h3 className="font-bold text-foreground text-lg mb-1">{cat.shortName || cat.categoryName}</h3>
                      <p className="text-xs text-muted-foreground">{cat.tee}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>

          /* ============= Level 3: Groups Table ============= */
          ) : (
            <>
              <Button variant="ghost" onClick={handleBack} className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20">
                <ArrowLeft className="h-4 w-4" />
                {selectedDay && selectedDay.categories.length > 1 ? 'Volver a categorías' : 'Volver a días'}
              </Button>

              {loadingDetail ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : detail ? (
                <>
                  {/* Header: left-aligned on mobile, centered on desktop */}
                  <div className="mb-8 text-left md:text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-1">
                      {detail.categoryName}
                    </h2>
                    <p className="text-muted-foreground text-lg">{detail.course}</p>
                    <p className="text-muted-foreground text-lg">{selectedDay?.dateFormatted}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {detail.system} · Tee: {detail.tee} · {detail.groups.length} grupos
                    </p>
                  </div>

                  {detail.groups.length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground text-lg">No hay grupos de salida para esta categoría</p>
                    </div>
                  ) : (
                    <Card className="border-border/50 bg-white max-w-5xl mx-auto">
                      <CardContent className="p-0 bg-white">
                        <div className="overflow-x-auto bg-white">
                          <Table className="bg-white">
                            <TableHeader>
                              <TableRow className="bg-primary hover:bg-primary">
                                <TableHead className="text-primary-foreground font-bold text-center w-20">Hoyo</TableHead>
                                <TableHead className="text-primary-foreground font-bold text-center w-20">Hora</TableHead>
                                <TableHead className="text-primary-foreground font-bold text-center w-16">Club</TableHead>
                                <TableHead className="text-primary-foreground font-bold">Jugador</TableHead>
                                <TableHead className="text-primary-foreground font-bold text-center w-20">Score</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {detail.groups.map((group, gIdx) => (
                                group.players.map((player, pIdx) => (
                                  <TableRow
                                    key={`${group.id}-${pIdx}`}
                                    className={`bg-white hover:bg-white ${
                                      pIdx === group.players.length - 1 && gIdx < detail.groups.length - 1
                                        ? 'border-b-2 border-primary/20'
                                        : ''
                                    }`}
                                  >
                                    {/* Show hole and time only on first player of each group */}
                                    {pIdx === 0 ? (
                                      <>
                                        <TableCell
                                          className="text-center font-bold text-foreground"
                                          rowSpan={group.players.length}
                                        >
                                          {group.tee}
                                        </TableCell>
                                        <TableCell
                                          className="text-center font-medium text-foreground"
                                          rowSpan={group.players.length}
                                        >
                                          {group.time}
                                        </TableCell>
                                      </>
                                    ) : null}
                                    {/* Club logo */}
                                    <TableCell className="p-1 text-center align-middle">
                                      {player.clubLogo ? (
                                        <img
                                          src={player.clubLogo}
                                          alt="Club"
                                          className="w-auto object-contain rounded inline-block"
                                          style={{ height: '2.25rem' }}
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <span className="text-xs text-muted-foreground">—</span>
                                      )}
                                    </TableCell>
                                    {/* Player name */}
                                    <TableCell className="font-medium text-foreground">
                                      {player.name}
                                    </TableCell>
                                    {/* Score */}
                                    <TableCell className="text-center font-bold text-primary">
                                      {player.score || '—'}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : detailIsError ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-2">Error al cargar los datos</p>
                  <p className="text-xs text-muted-foreground break-all">
                    {detailError instanceof ApiError
                      ? `${detailError.status} · ${detailError.message}`
                      : 'Error desconocido'}
                  </p>
                  {detailError instanceof ApiError && detailError.endpoint.includes('debug=1') ? (
                    <pre className="mt-4 text-left text-[11px] leading-5 text-muted-foreground bg-muted p-3 rounded-md overflow-auto max-w-4xl mx-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(
                        (detailError.responseData as { _debug?: unknown; _debug_queries?: unknown })?._debug ??
                          (detailError.responseData as { _debug_queries?: unknown })?._debug_queries ??
                          detailError.responseData ??
                          detailError.responseBody ??
                          null,
                        null,
                        2
                      )}
                    </pre>
                  ) : null}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Sin datos para la categoría seleccionada</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Salidas;
