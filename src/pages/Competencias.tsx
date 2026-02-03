/**
 * Competencias Page
 * Dynamic page for all competition types (approach, driver, etc.)
 * Follows card-based navigation pattern: Types → Groups → Results → Back
 * 
 * Admin can control visibility of individual competition types
 */

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Target, Ruler, Crosshair, Flag, Zap, Star, Award, Medal } from 'lucide-react';
import competicionHero from '@/assets/competicion-hero.jpg';
import CompetenciasSubmenu from '@/components/competencias/CompetenciasSubmenu';
import CompetenciasGroupCard from '@/components/competencias/CompetenciasGroupCard';
import CompetenciasTable from '@/components/competencias/CompetenciasTable';
import { 
  CompetenciaTipo, 
  CompetenciaGroup,
  fetchCompetencias,
  fetchCompetenciaGroups,
  fetchGroupPlayers,
} from '@/data/competenciasConfig';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';

// ============= Icon Mapping =============

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
  // State
  const [competencias, setCompetencias] = useState<CompetenciaTipo[]>([]);
  const [selectedCompetencia, setSelectedCompetencia] = useState<CompetenciaTipo | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<CompetenciaGroup | null>(null);
  const [groups, setGroups] = useState<CompetenciaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Context for admin visibility control
  const { isPageVisible } = usePageVisibility();

  // Load competition types on mount
  useEffect(() => {
    const loadCompetencias = async () => {
      const data = await fetchCompetencias();
      // Filter by visibility settings
      const visibleCompetencias = data.filter(c => isPageVisible(`competencias-${c.id}`));
      setCompetencias(visibleCompetencias);
      setLoading(false);
    };
    loadCompetencias();
  }, [isPageVisible]);

  // Handle competition type selection
  const handleCompetenciaSelect = async (id: string | null) => {
    if (id === null) {
      setSelectedCompetencia(null);
      setSelectedGroup(null);
      setGroups([]);
      return;
    }
    
    const comp = competencias.find(c => c.id === id);
    if (comp) {
      setSelectedCompetencia(comp);
      setLoading(true);
      const groupData = await fetchCompetenciaGroups(id);
      setGroups(groupData);
      setLoading(false);
    }
  };

  // Handle group selection
  const handleGroupSelect = async (group: CompetenciaGroup) => {
    if (!selectedCompetencia) return;
    
    setLoading(true);
    const players = await fetchGroupPlayers(selectedCompetencia.id, group.id);
    setSelectedGroup({ ...group, players });
    setLoading(false);
  };

  // Handle back navigation
  const handleBack = () => {
    if (selectedGroup) {
      setSelectedGroup(null);
    } else if (selectedCompetencia) {
      setSelectedCompetencia(null);
      setGroups([]);
    }
  };

  // Get icon component for a competition
  const getIcon = (iconName: keyof typeof iconMap) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-6 w-6" /> : <Trophy className="h-6 w-6" />;
  };

  return (
    <Layout>
      <PageHero 
        title="Competencias"
        subtitle="Resultados de approach, drive y competencias especiales"
        backgroundImage={competicionHero}
      />
      
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          
          {/* View: Competition Types (no selection) */}
          {!selectedCompetencia ? (
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
                        {comp.groups.length} grupos
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : !selectedGroup ? (
            /* View: Groups within a competition */
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
          ) : (
            /* View: Results detail */
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
              <Card className="border-border/50 max-w-4xl mx-auto">
                <CardContent className="p-0">
                  <CompetenciasTable 
                    players={selectedGroup.players}
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
