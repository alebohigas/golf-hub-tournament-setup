import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useState, useEffect } from 'react';
import { DaySalidas, fetchAllSalidas, PlayerInFoursome } from '@/data/salidasData';

const PlayerName = ({ player }: { player: PlayerInFoursome }) => {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer hover:text-primary transition-colors">
          {player.name}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-64" side="top">
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">{player.name}</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><span className="font-medium">Club:</span> {player.club}</p>
            <p><span className="font-medium">Handicap Index:</span> {player.handicapIndex.toFixed(1)}</p>
            {player.score !== undefined && (
              <p><span className="font-medium">Score:</span> <span className="text-primary font-bold">{player.score}</span></p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const Salidas = () => {
  const [salidasData, setSalidasData] = useState<DaySalidas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchAllSalidas();
      setSalidasData(data);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Layout>
      <PageHero 
        title="Salidas"
        subtitle="Horarios de salida y grupos de juego"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="1" className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
              {salidasData.map((day) => (
                <TabsTrigger key={day.dayId} value={day.dayId}>
                  {day.dayName}
                </TabsTrigger>
              ))}
            </TabsList>

            {salidasData.map((day) => (
              <TabsContent key={day.dayId} value={day.dayId}>
                <div className="text-center mb-6">
                  <p className="text-muted-foreground">{day.date}</p>
                </div>

                {day.categories.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay salidas programadas para este día
                  </p>
                ) : (
                  <div className="space-y-10">
                    {day.categories.map((category) => (
                      <div key={category.categoryId}>
                        <h3 className="text-xl font-bold text-foreground mb-4">
                          {category.categoryName}
                        </h3>
                        
                        <div className="space-y-1">
                          {category.foursomes.map((foursome) => (
                            <div key={foursome.id} className="border border-border/50 rounded-sm overflow-hidden">
                              {/* Header row */}
                              <div className="grid grid-cols-12 bg-[hsl(var(--golf-gold))] text-golf-dark font-bold text-sm">
                                <div className="col-span-1 px-3 py-2">H{String(foursome.hole).padStart(2, '0')}</div>
                                <div className="col-span-9 px-3 py-2">{foursome.time}</div>
                                <div className="col-span-2 px-3 py-2 text-right">Score</div>
                              </div>
                              
                              {/* Player rows */}
                              {foursome.players.map((player, idx) => (
                                <div 
                                  key={player.id} 
                                  className={`grid grid-cols-12 text-sm ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
                                >
                                  <div className="col-span-1 px-3 py-2 text-xs text-muted-foreground flex items-center">
                                    {player.club}
                                  </div>
                                  <div className="col-span-9 px-3 py-2">
                                    <PlayerName player={player} />
                                  </div>
                                  <div className="col-span-2 px-3 py-2 text-right font-medium">
                                    {player.score ?? '-'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Salidas;
