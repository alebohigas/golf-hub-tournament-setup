/**
 * Competencias Page
 * Dynamic page for all competition types (approach, driver, putt, skin)
 * Fetches real data from PHP API endpoints
 * Navigation pattern: Types → Groups → Results → Back
 */

import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import PlayerSearchInput from '@/components/shared/PlayerSearchInput';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Target, Ruler, Crosshair, Flag, Zap, Star, Award, Medal, Loader2 } from 'lucide-react';
import competenciasHero from '@/assets/competencias-hero.jpg';
import CompetenciasSubmenu from '@/components/competencias/CompetenciasSubmenu';
import CompetenciasGroupCard from '@/components/competencias/CompetenciasGroupCard';
import CompetenciasTable from '@/components/competencias/CompetenciasTable';
import BracketView from '@/components/competencias/BracketView';
import { BracketQualifiersSection } from '@/components/competencias/BracketView';
import MejorScoreDiarioReport from '@/components/competencias/MejorScoreDiarioReport';
import { useCompetencias, useCompetenciaDetail } from '@/hooks/useCompetenciasData';
import { useAllCompetenciasWithPlayers, collectUniquePlayerNames, searchPlayerAcrossCompetencias, type PlayerCompetitionResult } from '@/hooks/useAllCompetenciasData';
import type { CompetenciaTipo, CompetenciaGroup } from '@/data/competencias/types';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';

// ============= Icon Mapping =============

/** Map icon string names to Lucide icon components */
const iconMap = {
  target: Target,
  trophy: Trophy,
  flag: Flag,
  zap: Zap,
  star: Star,
  award: Award,
  medal: Medal,
  crosshair: Crosshair,
  ruler: Ruler,
};

// ============= Component =============

const Competencias = () => {
  // Navigation state
  const [selectedCompetenciaId, setSelectedCompetenciaId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<CompetenciaGroup | null>(null);
  /** When true, the "Mejor Score del Día" report view is rendered instead of the
   *  standard competencias drill-down. Independent from competencia selection. */
  const [showMejorScore, setShowMejorScore] = useState(false);
  /** When true within a selected competencia, render ALL groups' tables
   *  stacked instead of the group selection grid. */
  const [showAllGroups, setShowAllGroups] = useState(false);
  /** Player search query (autocomplete) */
  const [searchQuery, setSearchQuery] = useState('');
  /** Error state for the search input (player not found) */
  const [searchError, setSearchError] = useState(false);
  /**
   * Active multi-match search results. When set, the page renders the
   * "search results" view: a list of unique player names found, each
   * clickable to drill down into that player's individual results.
   * `searchTerm` is the literal query that produced these results
   * (used in the header text and to derive a stable suggestion list).
   */
  const [searchResults, setSearchResults] = useState<PlayerCompetitionResult[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  /**
   * Currently inspected player from within the search-results view.
   * When non-null the UI shows that player's results across every
   * competition/group where they appear, with a "back to search"
   * button at the top.
   */
  const [focusedPlayerName, setFocusedPlayerName] = useState<string | null>(null);

  // Context for admin visibility control
  const { isPageVisible } = usePageVisibility();

  // Fetch all competition types (master list)
  const { data: allCompetencias = [], isLoading: loadingList } = useCompetencias();

  /** All competencias with player data — used for autocomplete suggestions */
  const { competencias: allWithPlayers } = useAllCompetenciasWithPlayers();
  const playerSuggestions = useMemo(
    () => collectUniquePlayerNames(allWithPlayers),
    [allWithPlayers]
  );

  /**
   * Detecta si el grupo seleccionado es uno de los brackets Putt Finales
   * (inyectados por competencias.php como pseudo-competencias). En ese caso
   * el front renderiza <BracketView sexo /> en lugar de la tabla.
   */
  const bracketSexo: 'M' | 'F' | 'A' | null = selectedGroup?.bracketSexo ?? null;

  /**
   * Handle local typing in the search input.
   * Only updates local query; clears any previous error so the user
   * can try again without a stale red state. Never navigates.
   */
  const handlePlayerSearch = (name: string) => {
    setSearchQuery(name);
    if (searchError) setSearchError(false);
    /**
     * If the user clears the input entirely, also dismiss any active
     * search-results view so they return to the default landing.
     */
    if (name.trim() === '') {
      setSearchResults(null);
      setFocusedPlayerName(null);
      setSearchTerm('');
    }
  };

  /**
   * Handle explicit submission (Enter key or suggestion click).
   * Searches for the player within the already-loaded competencias data
   * and drills down to the first matching group. If no match is found,
   * flags the input with an error state (red + shake) and stays on page.
   * Never navigates away from /competencias.
   */
  const handlePlayerSubmit = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setSearchError(false);
      setSearchResults(null);
      setFocusedPlayerName(null);
      setSearchTerm('');
      return;
    }
    // Search across all loaded competencias for this player name
    const matches = searchPlayerAcrossCompetencias(allWithPlayers, trimmed);
    if (matches.length === 0) {
      setSearchError(true);
      setSearchResults(null);
      setFocusedPlayerName(null);
      return;
    }
    /**
     * Group matches by unique player name to detect whether the query
     * resolves to a single person or multiple. We always show the
     * search-results view (titled list of players found, each with
     * their results below) so the user can pick which player to
     * inspect — even if only one matches.
     */
    setSearchError(false);
    setSearchResults(matches);
    setSearchTerm(trimmed);
    setFocusedPlayerName(null);
    // Exit any drill-down so the search view takes over the page
    setSelectedCompetenciaId(null);
    setSelectedGroup(null);
  };

  // Fetch detail data when a competition is selected (includes players)
  const { data: detailData, isLoading: loadingDetail } = useCompetenciaDetail(
    selectedCompetenciaId ? selectedCompetenciaId.split('-')[0] : null, // Extract base type (oyes, oyesx, putt, skin)
    !!selectedCompetenciaId
  );

  // Filter by visibility settings
  const competencias = useMemo(() => {
    return allCompetencias.filter(c => isPageVisible(`competencias-${c.id}`));
  }, [allCompetencias, isPageVisible]);

  /**
   * mejorScoreEnabled
   * "Mejor Score del Día" está OCULTO POR DEFECTO en /competicion.
   * Solo se muestra si su visibilidad fue activada explícitamente
   * (clave `competencias-mejor-score` en la configuración de /admin).
   * Las demás competencias (p. ej. OYES X) siguen visibles por defecto.
   */
  const mejorScoreEnabled = visibilitySettings['competencias-mejor-score'] === true;

  // Get the selected competition object (from detail or list)
  const selectedCompetencia = useMemo(() => {
    if (!selectedCompetenciaId) return null;
    // Try detail data first (has player data)
    const fromDetail = detailData?.find(c => c.id === selectedCompetenciaId);
    if (fromDetail) return fromDetail;
    // Fallback to list data
    return competencias.find(c => c.id === selectedCompetenciaId) || null;
  }, [selectedCompetenciaId, detailData, competencias]);

  // Get groups for the selected competition
  const groups = useMemo(() => {
    return selectedCompetencia?.groups || [];
  }, [selectedCompetencia]);

  /**
   * Keep `selectedGroup` in sync with the latest fetched data.
   * Without this, when the polling refetch updates player positions
   * (e.g., a player drops from 1st to 4th place in putt while still
   * leading approach), the local `selectedGroup` reference holds stale
   * data and can cause render errors or show outdated standings.
   * Re-resolve by group id from the fresh `groups` array on each update.
   */
  useEffect(() => {
    if (!selectedGroup) return;
    const fresh = groups.find(g => g.id === selectedGroup.id);
    if (fresh && fresh !== selectedGroup) {
      setSelectedGroup(fresh);
    } else if (!fresh && groups.length > 0) {
      // Group no longer exists in the new data — drop back to group list
      setSelectedGroup(null);
    }
  }, [groups, selectedGroup]);

  // Handle competition type selection
  const handleCompetenciaSelect = (id: string | null) => {
    setSelectedCompetenciaId(id);
    setSelectedGroup(null);
    setShowAllGroups(false);
    setShowMejorScore(false);
  };

  // Handle group selection
  const handleGroupSelect = (group: CompetenciaGroup) => {
    setSelectedGroup(group);
  };

  // Handle back navigation
  const handleBack = () => {
    if (showMejorScore) {
      setShowMejorScore(false);
    } else if (showAllGroups) {
      setShowAllGroups(false);
    } else if (selectedGroup) {
      setSelectedGroup(null);
    } else if (selectedCompetenciaId) {
      setSelectedCompetenciaId(null);
    }
  };

  /**
   * Live-recompute search results from the latest `allWithPlayers` data
   * whenever polling refreshes. Keeps the search-results view and the
   * focused-player view in sync with the backend (e.g., a player's
   * position in putt changing from 1st to 4th).
   */
  const liveSearchResults = useMemo(() => {
    if (!searchTerm) return null;
    return searchPlayerAcrossCompetencias(allWithPlayers, searchTerm);
  }, [allWithPlayers, searchTerm]);

  /** Active results to render — prefer live-recomputed list if available. */
  const activeResults = liveSearchResults ?? searchResults;

  /**
   * Unique player names found by the current search, sorted
   * alphabetically (Spanish locale-aware via localeCompare).
   */
  const uniqueFoundPlayers = useMemo(() => {
    if (!activeResults) return [];
    const seen = new Set<string>();
    const names: string[] = [];
    for (const r of activeResults) {
      const cleaned = r.playerName;
      if (!seen.has(cleaned)) {
        seen.add(cleaned);
        names.push(cleaned);
      }
    }
    return names.sort((a, b) => a.localeCompare(b, 'es'));
  }, [activeResults]);

  /** Results limited to the focused player (one row per competition/group). */
  const focusedPlayerResults = useMemo(() => {
    if (!focusedPlayerName || !activeResults) return [];
    return activeResults.filter(r => r.playerName === focusedPlayerName);
  }, [activeResults, focusedPlayerName]);

  /**
   * If the user lands directly on a single matching player, auto-focus
   * them so they don't have to click the only available name in the list.
   * Triggered only on first render of the search-results view.
   */
  useEffect(() => {
    if (
      activeResults &&
      focusedPlayerName === null &&
      uniqueFoundPlayers.length === 1
    ) {
      setFocusedPlayerName(uniqueFoundPlayers[0]);
    }
  }, [activeResults, focusedPlayerName, uniqueFoundPlayers]);

  /** Clear search entirely and return to the default landing view. */
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSearchTerm('');
    setFocusedPlayerName(null);
    setSearchError(false);
  };

  /** Return from focused-player detail back to the search-results list. */
  const handleBackToSearchResults = () => {
    setFocusedPlayerName(null);
  };

  // Get icon component for a competition
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-6 w-6" /> : <Trophy className="h-6 w-6" />;
  };

  // Loading state
  const isLoading = loadingList || (selectedCompetenciaId && loadingDetail);

  /** Display columns for selected competition; Driver Distancia uses yards. */
  const selectedCompetenciaColumns = useMemo(() => {
    if (!selectedCompetencia) return [];
    const isDriverDistancia =
      selectedCompetencia.id === 'driverd' ||
      selectedCompetencia.name.toLowerCase().includes('driver distancia');

    if (!isDriverDistancia) return selectedCompetencia.columns;

    return selectedCompetencia.columns.map((col) =>
      col.key === 'distance' ? { ...col, format: 'yards' as const } : col
    );
  }, [selectedCompetencia]);

  return (
    <Layout>
      <PageHero 
        title="Competición"
        subtitle="Resultados de approach, drive y competencias especiales"
        backgroundImage={competenciasHero}
      />
      
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Cargando...</span>
            </div>
          )}

          {/*
            View: Search results (multi-match list)
            Triggered when the user presses Enter without picking an
            autocomplete suggestion and the query matches one or more
            players. Lists unique player names; clicking a name focuses
            on that player and shows all their competition results.
          */}
          {!isLoading && activeResults && !focusedPlayerName && (
            <>
              {/* Search input remains available for refinement */}
              {playerSuggestions.length > 0 && (
                <PlayerSearchInput
                  className="max-w-md mx-auto mb-6"
                  value={searchQuery}
                  onChange={handlePlayerSearch}
                  onSubmit={handlePlayerSubmit}
                  suggestions={playerSuggestions}
                  placeholder="Buscar jugador en competencias..."
                  error={searchError}
                  errorMessage="Jugador no encontrado"
                />
              )}

              {/* Action bar: clear search */}
              <div className="flex justify-center mb-6">
                <Button
                  variant="ghost"
                  onClick={handleClearSearch}
                  className="gap-2 bg-primary/10 hover:bg-primary/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Limpiar búsqueda
                </Button>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  <span className="text-primary">{uniqueFoundPlayers.length}</span>{' '}
                  {uniqueFoundPlayers.length === 1 ? 'jugador encontrado' : 'jugadores encontrados'}
                </h2>
                <p className="text-muted-foreground mt-1">
                  Búsqueda: "{searchTerm}"
                </p>
              </div>

              {/* Player list — clickable cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {uniqueFoundPlayers.map((name) => {
                  /** Count of competition entries for this player */
                  const count = (activeResults || []).filter(r => r.playerName === name).length;
                  return (
                    <Card
                      key={name}
                      className="border-border/50 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
                      onClick={() => setFocusedPlayerName(name)}
                    >
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <span className="font-semibold text-foreground">{name}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap">
                          {count} {count === 1 ? 'resultado' : 'resultados'}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {/*
            View: Focused player results
            Shows every competition/group where the focused player ranks,
            grouped by competition title with their position(s) below.
          */}
          {!isLoading && activeResults && focusedPlayerName && (
            <>
              {/* Action bar: back to search results + clear search */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <Button
                  variant="ghost"
                  onClick={handleBackToSearchResults}
                  className="gap-2 bg-primary/10 hover:bg-primary/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Regresar a resultados de búsqueda
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClearSearch}
                  className="gap-2 bg-primary/10 hover:bg-primary/20"
                >
                  Limpiar búsqueda
                </Button>
              </div>

              {/* Header — focused player name */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground">
                  {focusedPlayerName}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {focusedPlayerResults.length}{' '}
                  {focusedPlayerResults.length === 1
                    ? 'resultado encontrado'
                    : 'resultados encontrados'}
                </p>
              </div>

              {/* Per-competition results */}
              <div className="max-w-3xl mx-auto space-y-6">
                {focusedPlayerResults.map((result, idx) => {
                  /** Look up the live competition object so we can use its config (icon, etc.) */
                  const comp = allWithPlayers.find(c => c.id === result.competenciaId);
                  return (
                    <Card
                      key={`${result.competenciaId}-${result.groupId}-${idx}`}
                      className="border-border/50 cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => {
                        /** Drill down into the full group standings for context. */
                        const targetGroup = comp?.groups?.find(g => g.id === result.groupId);
                        if (comp && targetGroup) {
                          setSelectedCompetenciaId(comp.id);
                          setSelectedGroup(targetGroup);
                          // Keep search state intact so user can return via header back-buttons
                        }
                      }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            {getIcon(result.competenciaIcon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground">
                              {result.competenciaName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {result.groupName}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary leading-none">
                              {result.position}°
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              lugar
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {focusedPlayerResults.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Este jugador ya no aparece en los resultados.
                  </p>
                )}
              </div>
            </>
          )}

          {/* View: Competition Types (no selection, no active search) */}
          {!isLoading && !selectedCompetenciaId && !activeResults && !showMejorScore && (
            <>
              {/* Player search bar with autocomplete — jumps to /premios on pick */}
              {playerSuggestions.length > 0 && (
                <PlayerSearchInput
                  className="max-w-md mx-auto mb-8"
                  value={searchQuery}
                  onChange={handlePlayerSearch}
                  onSubmit={handlePlayerSubmit}
                  suggestions={playerSuggestions}
                  placeholder="Buscar jugador en competencias..."
                  error={searchError}
                  errorMessage="Jugador no encontrado"
                />
              )}

              {/* Submenu for filtering */}
              <CompetenciasSubmenu 
                competencias={competencias}
                selectedId={null}
                onSelect={handleCompetenciaSelect}
                mejorScoreActive={false}
                onMejorScoreClick={() => {
                  setSelectedCompetenciaId(null);
                  setSelectedGroup(null);
                  setShowAllGroups(false);
                  setShowMejorScore(true);
                }}
              />
              
              {/* Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  COMPETENCIAS: <span className="text-primary">{competencias.length}</span>
                </h2>
              </div>

              {/* Competition Types Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {competencias.map((comp) => (
                  <Card 
                    key={comp.id}
                    className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group"
                    onClick={() => handleCompetenciaSelect(comp.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {getIcon(comp.icon)}
                      </div>
                      <h3 className="font-bold text-foreground text-lg mb-2">
                        {comp.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {comp.groups?.length || 0} grupos
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {/* Special card: Mejor Score del Día report */}
                <Card
                  className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group"
                  onClick={() => setShowMejorScore(true)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Medal className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-foreground text-lg mb-2">
                      Mejor Score del Día
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Reporte por día
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Empty state */}
              {competencias.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay competencias disponibles en este momento
                  </p>
                </div>
              )}

              {/* External link: Putt Finales Caballeros (Match Play) */}
              {/* Putt Finales (Caballero / Dama) ahora se inyectan como
                  competencias normales por competencias.php cuando el admin
                  las marca como visibles. Ver AdminBrackets + BracketView. */}
            </>
          )}

          {/* View: Mejor Score del Día report */}
          {!isLoading && showMejorScore && (
            <>
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a competencias
              </Button>
              <CompetenciasSubmenu
                competencias={competencias}
                selectedId={null}
                onSelect={handleCompetenciaSelect}
                mejorScoreActive={true}
                onMejorScoreClick={() => { /* already active */ }}
              />
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground">
                  Mejor Score del Día
                </h2>
              </div>
              <MejorScoreDiarioReport />
            </>
          )}

          {/* View: Groups within a competition */}
          {!isLoading && selectedCompetenciaId && !selectedGroup && !showAllGroups && selectedCompetencia && (
            <>
              {/* Back button */}
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a competencias
              </Button>

              {/* Submenu for quick switch */}
              <CompetenciasSubmenu 
                competencias={competencias}
                selectedId={selectedCompetencia.id}
                onSelect={handleCompetenciaSelect}
                mejorScoreActive={false}
                onMejorScoreClick={() => {
                  setSelectedCompetenciaId(null);
                  setSelectedGroup(null);
                  setShowAllGroups(false);
                  setShowMejorScore(true);
                }}
              />

              {/* Header */}
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-primary">
                  {getIcon(selectedCompetencia.icon)}
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {selectedCompetencia.name}
                </h2>
                {selectedCompetencia.description && (
                  <p className="text-muted-foreground">
                    {selectedCompetencia.description}
                  </p>
                )}
              </div>

              {/* Groups Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {/* Special card: render all groups stacked */}
                {groups.length > 1 && (
                  <Card
                    className="border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all hover:shadow-lg cursor-pointer group sm:col-span-2 md:col-span-3"
                    onClick={() => setShowAllGroups(true)}
                  >
                    <CardContent className="p-5 flex items-center justify-center gap-3">
                      <Trophy className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-primary text-lg">
                        Ver todos los resultados
                      </h3>
                    </CardContent>
                  </Card>
                )}
                {groups.map((group) => (
                  <CompetenciasGroupCard
                    key={group.id}
                    group={group}
                    onClick={() => handleGroupSelect(group)}
                  />
                ))}
              </div>

              {/*
                Vista previa de clasificados para brackets Putt Finales:
                aparece DEBAJO de la grilla de grupos, antes de entrar a la
                tarjeta del bracket. El usuario ve quién está clasificado
                sin tener que abrir el detalle.
              */}
              {(() => {
                const bracketGroup = groups.find(
                  (g) => g.bracketSexo === 'M' || g.bracketSexo === 'F' || g.bracketSexo === 'A',
                );
                if (!bracketGroup?.bracketSexo) return null;
                return (
                  <div className="max-w-4xl mx-auto mt-8">
                    <Card className="border-border/50 bg-white">
                      <CardContent className="p-4">
                        <BracketQualifiersSection sexo={bracketGroup.bracketSexo} />
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </>
          )}

          {/* View: All groups within a competition (stacked tables) */}
          {!isLoading && selectedCompetenciaId && showAllGroups && selectedCompetencia && (
            <>
              {/* Back button */}
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a {selectedCompetencia.shortName}
              </Button>

              {/* Header */}
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-primary">
                  {getIcon(selectedCompetencia.icon)}
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {selectedCompetencia.name}
                </h2>
                <p className="text-muted-foreground">Todos los resultados</p>
              </div>

              {/* Stacked group tables — each in its own card with the prize title */}
              <div className="max-w-4xl mx-auto space-y-8">
                {groups.map((group) => (
                  <Card key={group.id} className="border-border/50 bg-white">
                    <CardContent className="p-4">
                      <div className="mb-3 text-center">
                        <span className="inline-block px-4 py-1 rounded-full bg-primary text-primary-foreground font-semibold">
                          {group.description || group.name}
                        </span>
                        {group.hoyo && (
                          <p className="mt-2 mb-1 text-foreground font-bold text-base">
                            Hoyo {group.hoyo}
                          </p>
                        )}
                      </div>
                      <CompetenciasTable
                        players={group.players || []}
                        columns={selectedCompetenciaColumns}
                      />
                      {group.lastUpdated && (
                        <p className="text-center text-xs text-muted-foreground mt-3">
                          Última actualización: {group.lastUpdated}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {groups.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No hay grupos disponibles.
                  </p>
                )}
              </div>
            </>
          )}

          {/* View: Results detail */}
          {!isLoading && selectedGroup && selectedCompetencia && (
            <>
              {/* Back button */}
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a {selectedCompetencia.shortName}
              </Button>

              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {selectedCompetencia.name}
                </h2>
                <span className="inline-block px-4 py-1 rounded-full bg-primary text-primary-foreground font-semibold">
                  {selectedGroup.name}
                </span>
                {/* Hole label, bold and tight to the table below */}
                {selectedGroup.hoyo && (
                  <p className="mt-3 mb-1 text-foreground font-bold text-base">
                    Hoyo {selectedGroup.hoyo}
                  </p>
                )}
              </div>

              {/* Results Table */}
              {bracketSexo ? (
                /* Bracket-flagged prize → render knockout bracket instead of standings table */
                <Card className="border-border/50 max-w-6xl mx-auto bg-white">
                  <CardContent className="p-4">
                    <BracketView sexo={bracketSexo} />
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/50 max-w-4xl mx-auto bg-white">
                  <CardContent className="p-0">
                    <CompetenciasTable 
                      players={selectedGroup.players || []}
                      columns={selectedCompetencia.columns}
                    />
                  </CardContent>
                </Card>
              )}
              
              {/* Last updated */}
              {selectedGroup.lastUpdated && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Última actualización: {selectedGroup.lastUpdated}
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Competencias;
