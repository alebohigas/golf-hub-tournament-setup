import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Trophy, Flag, Zap, Star, Award, Medal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Competition, fetchAllCompetitions } from '@/data/competicionData';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompetitions = async () => {
      const data = await fetchAllCompetitions();
      setCompetitions(data);
      setLoading(false);
    };
    loadCompetitions();
  }, []);

  return (
    <Layout>
      <PageHero 
        title="Competición"
        subtitle="Ganadores de las competencias especiales del torneo"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">
              COMPETENCIAS: <span className="text-primary">{competitions.length}</span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground">Cargando competencias...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {competitions.map((competition) => {
                const IconComponent = iconMap[competition.icon];
                return (
                  <Card 
                    key={competition.id} 
                    className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg"
                  >
                    <CardContent className="p-6">
                      {/* Competition Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{competition.name}</h3>
                          <p className="text-sm text-muted-foreground">{competition.description}</p>
                        </div>
                      </div>

                      {/* Winners List */}
                      <div className="space-y-3">
                        {competition.winners.slice(0, competition.maxWinners).map((winner, idx) => (
                          <div 
                            key={winner.id}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              idx === 0 
                                ? 'bg-yellow-500/10 border border-yellow-500/20' 
                                : 'bg-muted/30'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              idx === 0 
                                ? 'bg-yellow-500 text-yellow-950' 
                                : idx === 1 
                                  ? 'bg-gray-400 text-gray-900' 
                                  : idx === 2 
                                    ? 'bg-amber-600 text-amber-950' 
                                    : 'bg-muted text-muted-foreground'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{winner.playerName}</p>
                              <p className="text-xs text-muted-foreground truncate">{winner.club}</p>
                            </div>
                            {winner.result && (
                              <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                                {winner.result}
                              </span>
                            )}
                          </div>
                        ))}

                        {competition.winners.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            Sin ganadores registrados
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
