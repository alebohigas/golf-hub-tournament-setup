import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { useState, useEffect } from 'react';
import { Competition, fetchAllCompetitions } from '@/data/competicionData';
import CompetitionSubmenu from '@/components/competicion/CompetitionSubmenu';
import CategoryGroupCard from '@/components/competicion/CompetitionCard';
import { Target, Trophy, Flag, Zap, Star, Award, Medal } from 'lucide-react';

const iconMap = {
  target: Target,
  trophy: Trophy,
  flag: Flag,
  zap: Zap,
  star: Star,
  award: Award,
  medal: Medal,
};

const Competicion = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompetitions = async () => {
      const data = await fetchAllCompetitions();
      setCompetitions(data);
      setLoading(false);
    };
    loadCompetitions();
  }, []);

  const filteredCompetitions = selectedCompetitionId 
    ? competitions.filter(c => c.id === selectedCompetitionId)
    : competitions;

  return (
    <Layout>
      <PageHero 
        title="Competición"
        subtitle="Ganadores de las competencias especiales del torneo"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-foreground">
              COMPETENCIAS ESPECIALES
            </h2>
            <p className="text-muted-foreground mt-2">
              {competitions.length} tipos de competencia disponibles
            </p>
          </div>

          {/* Submenu */}
          {!loading && (
            <CompetitionSubmenu 
              competitions={competitions}
              selectedId={selectedCompetitionId}
              onSelect={setSelectedCompetitionId}
            />
          )}

          {loading ? (
            <div className="text-center text-muted-foreground">Cargando competencias...</div>
          ) : (
            <div className="space-y-12">
              {filteredCompetitions.map((competition) => {
                const IconComponent = iconMap[competition.icon];
                return (
                  <div key={competition.id}>
                    {/* Competition Section Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 flex-1 bg-gradient-to-r from-primary/50 to-transparent rounded" />
                      <div className="flex items-center gap-2 px-4">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-bold text-foreground">
                          {competition.name}
                        </h3>
                      </div>
                      <div className="h-1 flex-1 bg-gradient-to-l from-primary/50 to-transparent rounded" />
                    </div>
                    <p className="text-center text-muted-foreground mb-6">{competition.description}</p>
                    
                    {/* Category Group Cards Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                      {competition.categoryGroups.map((group) => (
                        <CategoryGroupCard 
                          key={group.id} 
                          group={group} 
                          maxWinners={competition.maxWinnersPerGroup} 
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Competicion;
