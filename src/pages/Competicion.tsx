/**
 * Competición Page
 * Displays competition winners (closest pin, longest drive, etc.)
 * Data fetched from competicion.php via React Query hooks
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState, useEffect, useMemo } from 'react';
import { useCompetitions } from '@/hooks/useCompeticionData';
import type { Competition, CategoryGroup } from '@/data/competicionData';
import CompetitionSubmenu from '@/components/competicion/CompetitionSubmenu';
import CategoryGroupCard from '@/components/competicion/CompetitionCard';
import CategoryDetailModal from '@/components/competicion/CategoryDetailModal';
import { Target, Trophy, Flag, Zap, Star, Award, Medal, Ruler, Crosshair, ChevronDown, Search, X, Loader2 } from 'lucide-react';
import competicionHero from '@/assets/competicion-hero.jpg';

/** Icon map for competition type icons */
const iconMap = {
  target: Target,
  trophy: Trophy,
  flag: Flag,
  zap: Zap,
  star: Star,
  award: Award,
  medal: Medal,
  ruler: Ruler,
  crosshair: Crosshair,
};

const Competicion = () => {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup | null>(null);
  const [selectedCompetitionName, setSelectedCompetitionName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch competitions from API
  const { data: competitions = [], isLoading } = useCompetitions();

  // Expand all sections when data loads
  useEffect(() => {
    if (competitions.length > 0) {
      setExpandedSections(new Set(competitions.map(c => c.id)));
    }
  }, [competitions]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleCardClick = (group: CategoryGroup, competitionName: string) => {
    setSelectedGroup(group);
    setSelectedCompetitionName(competitionName);
    setIsModalOpen(true);
  };

  // Filter competitions based on search and selection
  const filteredCompetitions = useMemo(() => {
    let filtered = selectedCompetitionId 
      ? competitions.filter(c => c.id === selectedCompetitionId)
      : competitions;

    if (!searchQuery.trim()) return filtered;

    const searchTerm = searchQuery.trim().toLowerCase();
    return filtered.map(comp => ({
      ...comp,
      categoryGroups: comp.categoryGroups.filter(group =>
        group.winners.some(w => w.playerName.toLowerCase().includes(searchTerm))
      )
    })).filter(comp => comp.categoryGroups.length > 0);
  }, [competitions, selectedCompetitionId, searchQuery]);

  // Auto-expand sections with search matches
  useEffect(() => {
    if (searchQuery.trim()) {
      setExpandedSections(new Set(filteredCompetitions.map(c => c.id)));
    }
  }, [searchQuery, filteredCompetitions]);

  return (
    <Layout>
      <PageHero 
        title="Competición"
        subtitle="Ganadores de las competencias especiales del torneo"
        backgroundImage={competicionHero}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-foreground">COMPETENCIAS ESPECIALES</h2>
            <p className="text-muted-foreground mt-2">
              {competitions.length} tipos de competencia disponibles
            </p>
          </div>

          {/* Submenu */}
          {!isLoading && (
            <CompetitionSubmenu 
              competitions={competitions}
              selectedId={selectedCompetitionId}
              onSelect={setSelectedCompetitionId}
            />
          )}

          {/* Search */}
          <div className="max-w-md mx-auto mb-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar ganador por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCompetitions.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground text-lg">
                {searchQuery ? 'No se encontraron ganadores con ese nombre' : 'No hay competencias disponibles'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-6xl mx-auto">
              {filteredCompetitions.map((competition) => {
                const IconComponent = iconMap[competition.icon] || Trophy;
                const isExpanded = expandedSections.has(competition.id);
                
                return (
                  <Collapsible key={competition.id} open={isExpanded} onOpenChange={() => toggleSection(competition.id)}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-lg hover:border-primary/50 transition-all cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="text-xl font-bold text-foreground">{competition.name}</h3>
                          <p className="text-sm text-muted-foreground">{competition.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {competition.categoryGroups.length} categoría{competition.categoryGroups.length !== 1 ? 's' : ''}
                          </span>
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="animate-accordion-down">
                      <div className="pt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {competition.categoryGroups.map((group) => (
                          <CategoryGroupCard 
                            key={group.id} 
                            group={group} 
                            maxWinners={competition.maxWinnersPerGroup}
                            searchQuery={searchQuery}
                            onClick={() => handleCardClick(group, competition.name)}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CategoryDetailModal
        group={selectedGroup}
        competitionName={selectedCompetitionName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Layout>
  );
};

export default Competicion;
