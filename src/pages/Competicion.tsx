import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { useState, useEffect } from 'react';
import { Competition, fetchAllCompetitions } from '@/data/competicionData';
import CompetitionSubmenu from '@/components/competicion/CompetitionSubmenu';
import CompetitionCard from '@/components/competicion/CompetitionCard';

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
            <div className="space-y-6 max-w-6xl mx-auto">
              {filteredCompetitions.map((competition) => (
                <CompetitionCard key={competition.id} competition={competition} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Competicion;
