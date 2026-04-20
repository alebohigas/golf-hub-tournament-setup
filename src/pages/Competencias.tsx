/**
 * Competencias Page
 * Dynamic page for all competition types (approach, driver, putt, skin)
 * Fetches real data from PHP API endpoints
 * Navigation pattern: Types → Groups → Results → Back
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useCompetencias, useCompetenciaDetail } from '@/hooks/useCompetenciasData';
import { useAllCompetenciasWithPlayers, collectUniquePlayerNames } from '@/hooks/useAllCompetenciasData';
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
  /** Player search query (autocomplete) */
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
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
   * Handle player selection: navigate to /premios with the selected name as query
   * so the user sees all positions/medals across competitions.
   */
  const handlePlayerSearch = (name: string) => {
    setSearchQuery(name);
    if (name.trim().length > 0) {
      navigate(`/premios?q=${encodeURIComponent(name.trim())}`);
    }
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

  // Handle competition type selection
  const handleCompetenciaSelect = (id: string | null) => {
    setSelectedCompetenciaId(id);
    setSelectedGroup(null);
  };

  // Handle group selection
  const handleGroupSelect = (group: CompetenciaGroup) => {
    setSelectedGroup(group);
  };

  // Handle back navigation
  const handleBack = () => {
    if (selectedGroup) {
      setSelectedGroup(null);
    } else if (selectedCompetenciaId) {
      setSelectedCompetenciaId(null);
    }
  };

  // Get icon component for a competition
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-6 w-6" /> : <Trophy className="h-6 w-6" />;
  };

  // Loading state
  const isLoading = loadingList || (selectedCompetenciaId && loadingDetail);

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

          {/* View: Competition Types (no selection) */}
          {!isLoading && !selectedCompetenciaId && (
            <>
              {/* Submenu for filtering */}
              <CompetenciasSubmenu 
                competencias={competencias}
                selectedId={null}
                onSelect={handleCompetenciaSelect}
              />
              
              {/* Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  COMPETENCIAS: <span className="text-primary">{competencias.length}</span>
                </h2>
              </div>

              {/* Competition Types Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
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
            </>
          )}

          {/* View: Groups within a competition */}
          {!isLoading && selectedCompetenciaId && !selectedGroup && selectedCompetencia && (
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
                {groups.map((group) => (
                  <CompetenciasGroupCard
                    key={group.id}
                    group={group}
                    onClick={() => handleGroupSelect(group)}
                  />
                ))}
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
                {selectedGroup.hoyo && (
                  <p className="text-muted-foreground mt-2">
                    Hoyo {selectedGroup.hoyo}
                  </p>
                )}
              </div>

              {/* Results Table */}
              <Card className="border-border/50 max-w-4xl mx-auto bg-white">
                <CardContent className="p-0">
                  <CompetenciasTable 
                    players={selectedGroup.players || []}
                    columns={selectedCompetencia.columns}
                  />
                </CardContent>
              </Card>
              
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
