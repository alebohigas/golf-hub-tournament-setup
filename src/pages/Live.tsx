/**
 * Live Page
 * Real-time scoring and live results for the tournament
 * Reuses the Competencias drill-down pattern (Types → Groups → Results)
 * but filters only live/real-time competition types
 * 
 * Admin can control visibility via /admin
 */

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Target, Ruler, Crosshair, Flag, Zap, Star, Award, Medal, Radio } from 'lucide-react';
import liveHero from '@/assets/live-hero.jpg';
import CompetenciasSubmenu from '@/components/competencias/CompetenciasSubmenu';
import CompetenciasGroupCard from '@/components/competencias/CompetenciasGroupCard';
import CompetenciasTable from '@/components/competencias/CompetenciasTable';
import { 
  CompetenciaTipo, 
  CompetenciaGroup,
} from '@/data/competencias/types';
import { fetchCompetenciaGroups, fetchGroupPlayers } from '@/data/competencias/api';
import { liveConfig } from '@/data/liveData';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';

// ============= Icon Mapping =============

/** Maps icon names from DB to Lucide components */
const iconMap: Record<string, React.ElementType> = {
  target: Target,
  trophy: Trophy,
  flag: Flag,
  zap: Zap,
  star: Star,
  award: Award,
  medal: Medal,
  crosshair: Crosshair,
  ruler: Ruler,
  radio: Radio,
};

// ============= Component =============

const Live = () => {
  // State
  const [liveTypes, setLiveTypes] = useState<CompetenciaTipo[]>([]);
  const [selectedType, setSelectedType] = useState<CompetenciaTipo | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<CompetenciaGroup | null>(null);
  const [groups, setGroups] = useState<CompetenciaGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Context for admin visibility control
  const { isPageVisible } = usePageVisibility();

  // Load live competition types on mount
  useEffect(() => {
    const loadLiveTypes = () => {
      const filtered = liveConfig
        .filter(c => c.enabled)
        .filter(c => isPageVisible(`live-${c.id}`));
      setLiveTypes(filtered);
      setLoading(false);
    };
    loadLiveTypes();
  }, [isPageVisible]);

  // Handle type selection
  const handleTypeSelect = async (id: string | null) => {
    if (id === null) {
      setSelectedType(null);
      setSelectedGroup(null);
      setGroups([]);
      return;
    }
    const comp = liveTypes.find(c => c.id === id);
    if (comp) {
      setSelectedType(comp);
      setLoading(true);
      const groupData = await fetchCompetenciaGroups(id);
      setGroups(groupData);
      setLoading(false);
    }
  };

  // Handle group selection
  const handleGroupSelect = async (group: CompetenciaGroup) => {
    if (!selectedType) return;
    setLoading(true);
    const players = await fetchGroupPlayers(selectedType.id, group.id);
    setSelectedGroup({ ...group, players });
    setLoading(false);
  };

  // Handle back navigation
  const handleBack = () => {
    if (selectedGroup) {
      setSelectedGroup(null);
    } else if (selectedType) {
      setSelectedType(null);
      setGroups([]);
    }
  };

  // Get icon component
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Zap;
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <Layout>
      <PageHero 
        title="Live"
        subtitle="Resultados en tiempo real del torneo"
        backgroundImage={liveHero}
      />
      
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          
          {/* View: Live Types (no selection) */}
          {!selectedType ? (
            <>
              {/* Submenu for filtering */}
              <CompetenciasSubmenu 
                competencias={liveTypes}
                selectedId={null}
                onSelect={handleTypeSelect}
              />
              
              {/* Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  LIVE: <span className="text-primary">{liveTypes.length}</span>
                </h2>
              </div>

              {/* Live Types Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {liveTypes.map((comp) => (
                  <Card 
                    key={comp.id}
                    className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group"
                    onClick={() => handleTypeSelect(comp.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {getIcon(comp.icon)}
                      </div>
                      <h3 className="font-bold text-foreground text-lg mb-2">
                        {comp.shortName}
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
            /* View: Groups within a live type */
            <>
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Live
              </Button>

              <CompetenciasSubmenu 
                competencias={liveTypes}
                selectedId={selectedType.id}
                onSelect={handleTypeSelect}
              />

              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-primary">
                  {getIcon(selectedType.icon)}
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {selectedType.name}
                </h2>
                {selectedType.description && (
                  <p className="text-muted-foreground">
                    {selectedType.description}
                  </p>
                )}
              </div>

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
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a {selectedType.shortName}
              </Button>

              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {selectedType.name}
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

              <Card className="border-border/50 max-w-4xl mx-auto">
                <CardContent className="p-0">
                  <CompetenciasTable 
                    players={selectedGroup.players}
                    columns={selectedType.columns}
                  />
                </CardContent>
              </Card>
              
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

export default Live;
