/**
 * Resultados Page
 * Displays tournament results by category and scoring type
 * Supports expandable scorecards when clicking on round scores
 * Data fetched from resultados.php via React Query hooks
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, ArrowLeft, Medal, Loader2 } from 'lucide-react';
import resultadosHero from '@/assets/resultados-hero.jpg';
import { useState, Fragment } from 'react';
import { useAllResults, useCategoryResults, fetchPlayerScorecardFromApi } from '@/hooks/useResultadosData';
import type { 
  ResultCategory, 
  ScoringType, 
  ScorecardType,
  PlayerResult,
  RoundScorecard,
} from '@/data/resultadosData';
import ScorecardRow from '@/components/resultados/ScorecardRow';

// ============= Helper Functions =============

/** Returns medal color class based on position */
const getPositionStyle = (position: number) => {
  if (position === 1) return 'text-yellow-500';
  if (position === 2) return 'text-gray-400';
  if (position === 3) return 'text-amber-600';
  return '';
};

/** Returns medal icon for top 3 positions */
const getPositionIcon = (position: number) => {
  if (position <= 3) {
    return <Medal className={`h-5 w-5 ${getPositionStyle(position)}`} />;
  }
  return null;
};

// ============= Component =============

const Resultados = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedScoringType, setSelectedScoringType] = useState<ScoringType | null>(null);

  /** Track which scorecard is expanded: "playerId-round" */
  const [expandedScorecard, setExpandedScorecard] = useState<string | null>(null);
  const [scorecardData, setScorecardData] = useState<RoundScorecard | null>(null);
  const [scorecardLoading, setScorecardLoading] = useState(false);

  // Fetch all categories from API
  const { data: categories = [], isLoading: loadingCats } = useAllResults();

  // Fetch selected category detail from API (passes gross param based on scoring type)
  const { data: categoryDetail, isLoading: loadingDetail } = useCategoryResults(
    selectedCategoryId,
    !!selectedCategoryId && !!selectedScoringType,
    selectedScoringType || 'NETO'
  );

  /** Find the selected category object from the list (metadata only) */
  const selectedCategory = categories.find(c => c.categoryId === selectedCategoryId) || null;

  /** Get players for the selected scoring type - MUST use categoryDetail for full data */
  const players: PlayerResult[] = (() => {
    // only use categoryDetail which is fetched from resultados_jug.php and has full data
    if (!categoryDetail || !selectedScoringType) return [];
    const scoring = categoryDetail.scoringTypes?.find(s => s.scoringType === selectedScoringType);
    return scoring?.players || [];
  })();

  /** Handle category card click - auto-select scoring if only one type */
  const handleCategoryClick = (category: ResultCategory) => {
    setSelectedCategoryId(category.categoryId);
    setExpandedScorecard(null);
    setScorecardData(null);
    // Auto-select if only one scoring type available
    if (category.scoringTypes.length === 1) {
      setSelectedScoringType(category.scoringTypes[0].scoringType as ScoringType);
    } else {
      setSelectedScoringType(null);
    }
  };

  /** Handle scoring type selection */
  const handleScoringClick = (scoringType: ScoringType) => {
    setExpandedScorecard(null);
    setScorecardData(null);
    setSelectedScoringType(scoringType);
  };

  /** Handle back navigation */
  const handleBack = () => {
    setExpandedScorecard(null);
    setScorecardData(null);
    if (selectedScoringType) {
      // if there's one scoring type, go back to category list; else just clear scoring type
      if (categoryDetail && categoryDetail.scoringTypes.length === 1) {
        setSelectedCategoryId(null);
        setSelectedScoringType(null);
      } else {
        setSelectedScoringType(null);
      }
    } else {
      // no scoring type selected, go back to category list
      setSelectedCategoryId(null);
    }
  };

  /** Determine which scorecard type to use */
  const getActiveScorecardType = (): ScorecardType => {
    if (!categoryDetail || !selectedScoringType) return 'hcp';
    const scoring = categoryDetail.scoringTypes.find(s => s.scoringType === selectedScoringType);
    if (scoring?.scorecardType) return scoring.scorecardType;
    if (categoryDetail.defaultScorecardType) return categoryDetail.defaultScorecardType;
    return selectedScoringType === 'GROS' ? 'scratch' : 'hcp';
  };

  /** Handle round score click - fetch scorecard from API and toggle expansion */
  const handleRoundClick = async (player: PlayerResult, round: number) => {
    const key = `${player.id}-${round}`;
    const roundScore = round === 1 ? player.r1 : round === 2 ? player.r2 : player.r3;
    
    if (roundScore === undefined || roundScore === null) return;

    // Toggle off if already expanded
    if (expandedScorecard === key) {
      setExpandedScorecard(null);
      setScorecardData(null);
      return;
    }

    // Get the date for this round from the category detail days array
    const days = categoryDetail?.days || [];
    const fecha = days[round - 1]; // R1 → days[0], R2 → days[1], etc.

    if (!fecha || !categoryDetail) {
      console.warn('No date found for round', round, 'days:', days);
      setExpandedScorecard(key);
      setScorecardData(null);
      return;
    }

    // Fetch scorecard from API
    setExpandedScorecard(key);
    setScorecardData(null);
    setScorecardLoading(true);

    try {
      const scorecard = await fetchPlayerScorecardFromApi(
        player.id,
        categoryDetail.categoryId,
        fecha,
        categoryDetail.system || '',
        selectedScoringType || 'NETO',
        round
      );
      setScorecardData(scorecard);
    } catch (err) {
      console.error('Failed to fetch scorecard:', err);
      setScorecardData(null);
    } finally {
      setScorecardLoading(false);
    }
  };

  const isLoading = loadingCats || loadingDetail;

  return (
    <Layout>
      <PageHero 
        title="Resultados"
        subtitle="Consulta los resultados de cada ronda y clasificación general"
        backgroundImage={resultadosHero}
      />
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {!selectedCategoryId ? (
            <>
              {/* Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  CATEGORÍAS: <span className="text-primary">{loadingCats ? '…' : categories.length}</span>
                </h2>
              </div>

              {loadingCats ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                /* Categories Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                  {categories.map((category) => (
                    <Card 
                      key={category.categoryId} 
                      className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <CardContent className="p-5 text-center">
                        <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <h3 className="font-bold text-foreground text-lg mb-2">{category.shortName}</h3>
                        <div className="flex justify-center gap-1 flex-wrap">
                          {category.scoringTypes.map((scoring) => (
                            <span
                              key={scoring.scoringType}
                              className={`text-xs px-2 py-0.5 rounded text-white ${
                                scoring.scoringType === 'NETO' ? 'bg-sky-500' : 'bg-green-600'
                              }`}
                            >
                              {scoring.scoringType}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : !selectedScoringType ? (
            <>
              {/* Category Selected - Choose Scoring Type */}
              <Button variant="ghost" onClick={handleBack} className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20">
                <ArrowLeft className="h-4 w-4" />
                Volver a categorías
              </Button>

              {loadingDetail ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {categoryDetail?.categoryName}
                    </h2>
                    <p className="text-muted-foreground">Selecciona el tipo de puntuación</p>
                  </div>

                  <div className="flex justify-center gap-4 flex-wrap max-w-md mx-auto">
                    {categoryDetail?.scoringTypes?.map((scoring) => (
                  <Card 
                    key={scoring.scoringType}
                    className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer flex-1 min-w-[140px]"
                    onClick={() => handleScoringClick(scoring.scoringType)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        scoring.scoringType === 'NETO' ? 'bg-sky-500' : 'bg-green-600'
                      }`}>
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-foreground text-xl mb-1">{scoring.scoringType}</h3>
                      <p className="text-sm text-muted-foreground">
                        {scoring.players.length} jugadores
                      </p>
                    </CardContent>
                  </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Results Detail View */}
              <Button variant="ghost" onClick={handleBack} className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20">
                <ArrowLeft className="h-4 w-4" />
                {selectedCategory?.scoringTypes.length === 1 
                  ? 'Volver a categorías' 
                  : `Volver a ${selectedCategory?.shortName}`}
              </Button>

              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {selectedCategory?.categoryName}
                </h2>
                <span className={`inline-block px-4 py-1 rounded-full text-white font-semibold ${
                  selectedScoringType === 'NETO' ? 'bg-sky-500' : 'bg-green-600'
                }`}>
                  {selectedScoringType}
                </span>
              </div>

              {loadingDetail ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Card className="border-border/50 bg-white max-w-5xl mx-auto">
                  <CardContent className="p-0 bg-white">
                    <div className="overflow-x-auto bg-white">
                      <Table className="bg-white">
                        <TableHeader>
                          <TableRow className="bg-primary hover:bg-primary">
                            <TableHead className="text-primary-foreground font-bold w-16">Pos</TableHead>
                            <TableHead className="text-primary-foreground font-bold text-center">Club</TableHead>
                            <TableHead className="text-primary-foreground font-bold">Jugador</TableHead>
                            {/* Dynamic round columns based on days array */}
                            {(categoryDetail?.days || []).map((_, i) => (
                              <TableHead key={`r${i+1}`} className="text-primary-foreground font-bold text-center">R{i + 1}</TableHead>
                            ))}
                            <TableHead className="text-primary-foreground font-bold text-center">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {players.length > 0 ? (
                            players.map((player, idx) => (
                              <Fragment key={player.id}>
                                <TableRow className="bg-white hover:bg-white">
                                  <TableCell className="font-semibold">
                                    <div className="flex items-center gap-2">
                                      {getPositionIcon(player.position)}
                                      <span className={getPositionStyle(player.position)}>
                                        {player.position}
                                      </span>
                                    </div>
                                  </TableCell>
                                  {/* Club Logo column - always left of name */}
                                  <TableCell className="p-1 text-center align-middle">
                                    {player.clubLogo ? (
                                      <img
                                        src={player.clubLogo}
                                        alt="Club"
                                        className="w-auto object-contain rounded inline-block"
                                        style={{ height: '2.25rem' }}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23166534" rx="4"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="9" font-family="sans-serif">Club</text></svg>')}`;
                                        }}
                                      />
                                    ) : (
                                      <span className="text-xs text-muted-foreground">{player.club}</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="font-medium">{player.name}</TableCell>
                                  {/* Dynamic round score cells */}
                                  {(categoryDetail?.days || []).map((_, i) => {
                                    const round = i + 1;
                                    const score = round === 1 ? player.r1 : round === 2 ? player.r2 : player.r3;
                                    const isExpanded = expandedScorecard === `${player.id}-${round}`;
                                    return (
                                      <TableCell key={round} className="text-center p-0">
                                        {score !== undefined && score !== null ? (
                                          <button
                                            onClick={() => handleRoundClick(player, round)}
                                            className={`w-full py-3 px-2 font-medium transition-colors cursor-pointer hover:bg-primary/10 hover:text-primary ${
                                              isExpanded ? 'bg-primary/15 text-primary font-bold underline underline-offset-2' : ''
                                            }`}
                                            title={`Ver tarjeta R${round}`}
                                          >
                                            {score}
                                          </button>
                                        ) : (
                                          <span className="py-3 px-2 inline-block">-</span>
                                        )}
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell className="text-center font-bold text-primary text-lg">
                                    {player.total}
                                  </TableCell>
                                </TableRow>

                                {/* Expanded scorecard row */}
                                {expandedScorecard?.startsWith(`${player.id}-`) && (
                                  scorecardLoading ? (
                                    <TableRow className="bg-white hover:bg-white">
                                      <TableCell colSpan={3 + (categoryDetail?.days?.length || 0) + 1} className="text-center py-6 text-muted-foreground">
                                        Cargando tarjeta...
                                      </TableCell>
                                    </TableRow>
                                  ) : scorecardData ? (
                                    <ScorecardRow
                                      scorecard={scorecardData}
                                      playerName={player.name}
                                      roundLabel={`Ronda ${expandedScorecard.split('-').pop()}`}
                                      onClose={() => { setExpandedScorecard(null); setScorecardData(null); }}
                                      colSpan={3 + (categoryDetail?.days?.length || 0) + 1}
                                    />
                                  ) : null
                                )}
                              </Fragment>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3 + (categoryDetail?.days?.length || 0) + 1} className="text-center text-muted-foreground py-8">
                                No hay resultados disponibles
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Resultados;
