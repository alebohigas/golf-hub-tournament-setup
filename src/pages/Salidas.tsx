import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DaySalidas, PlayerInFoursome, fetchAllDays, fetchSalidasByDay } from '@/data/salidasData';

const PlayerName = ({ player }: { player: PlayerInFoursome }) => {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer hover:text-primary transition-colors font-medium">
          {player.name}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 bg-card border-border" side="top">
        <div className="space-y-3">
          <h4 className="font-bold text-foreground text-lg">{player.name}</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Club:</span>
              <span className="font-semibold text-foreground">{player.club}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Handicap Index:</span>
              <span className="font-semibold text-foreground">{player.handicapIndex.toFixed(1)}</span>
            </div>
            {player.score !== undefined && (
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-muted-foreground">Score:</span>
                <span className="font-bold text-primary text-lg">{player.score}</span>
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

type DaySummary = Pick<DaySalidas, 'dayId' | 'dayName' | 'date' | 'foursomeCount' | 'playerCount'>;

const Salidas = () => {
  const [days, setDays] = useState<DaySummary[]>([]);
  const [selectedDay, setSelectedDay] = useState<DaySalidas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDays = async () => {
      const data = await fetchAllDays();
      setDays(data);
      setLoading(false);
    };
    loadDays();
  }, []);

  const handleDayClick = async (dayId: string) => {
    setLoading(true);
    const dayData = await fetchSalidasByDay(dayId);
    if (dayData) {
      setSelectedDay(dayData);
    }
    setLoading(false);
  };

  const handleBack = () => {
    setSelectedDay(null);
  };

  const totalFoursomes = days.reduce((sum, d) => sum + d.foursomeCount, 0);

  return (
    <Layout>
      <PageHero 
        title="Salidas"
        subtitle="Horarios de salida y grupos de juego"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {!selectedDay ? (
            <>
              {/* Total Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  GRUPOS DE SALIDA: <span className="text-primary">{totalFoursomes}</span>
                </h2>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {days.map((day) => (
                  <Card 
                    key={day.dayId} 
                    className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg"
                  >
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h3 className="font-bold text-foreground text-xl mb-1">{day.dayName}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{day.date}</p>
                      <div className="flex justify-center gap-6 mb-4 text-sm">
                        <div>
                          <span className="text-2xl font-bold text-primary">{day.foursomeCount}</span>
                          <p className="text-muted-foreground">Grupos</p>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-primary">{day.playerCount}</span>
                          <p className="text-muted-foreground">Jugadores</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleDayClick(day.dayId)}
                        className="w-full"
                        disabled={day.foursomeCount === 0}
                      >
                        {day.foursomeCount > 0 ? 'Ver Salidas' : 'Sin salidas'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Day Detail View */}
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a días
              </Button>

              {/* Day Info Header */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {selectedDay.dayName}
                </h2>
                <p className="text-muted-foreground text-lg">{selectedDay.date}</p>
              </div>

              {selectedDay.categories.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-lg">No hay salidas programadas para este día</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {selectedDay.categories.map((category) => (
                    <div key={category.categoryId}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-1 flex-1 bg-gradient-to-r from-primary/50 to-transparent rounded" />
                        <h3 className="text-2xl font-bold text-foreground px-4">
                          {category.categoryName}
                        </h3>
                        <div className="h-1 flex-1 bg-gradient-to-l from-primary/50 to-transparent rounded" />
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {category.foursomes.map((foursome) => (
                          <Card 
                            key={foursome.id} 
                            className="border-border/50 overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {/* Foursome Header */}
                            <div className="bg-primary px-4 py-3 flex justify-between items-center">
                              <span className="font-bold text-primary-foreground">
                                Hoyo {foursome.hole}
                              </span>
                              <span className="font-bold text-primary-foreground text-lg">
                                {foursome.time}
                              </span>
                            </div>
                            
                            {/* Players */}
                            <CardContent className="p-0">
                              {foursome.players.map((player, idx) => (
                                <div 
                                  key={player.id} 
                                  className={`px-4 py-3 flex items-center justify-between ${
                                    idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                                  } ${idx < foursome.players.length - 1 ? 'border-b border-border/30' : ''}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <PlayerName player={player} />
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                      {player.club}
                                    </p>
                                  </div>
                                  <div className="text-right ml-3">
                                    <span className="font-bold text-foreground">
                                      {player.score ?? '-'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
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
