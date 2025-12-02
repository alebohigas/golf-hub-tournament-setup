import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ArrowLeft, Calendar, Users, Search, X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { DaySalidas, PlayerInFoursome, fetchAllDays, fetchSalidasByDay } from '@/data/salidasData';

const PlayerName = ({ player, highlight }: { player: PlayerInFoursome; highlight?: string }) => {
  const renderName = () => {
    if (!highlight) return player.name;
    
    const index = player.name.toLowerCase().indexOf(highlight.toLowerCase());
    if (index === -1) return player.name;
    
    return (
      <>
        {player.name.slice(0, index)}
        <span className="bg-primary/30 text-primary font-bold">
          {player.name.slice(index, index + highlight.length)}
        </span>
        {player.name.slice(index + highlight.length)}
      </>
    );
  };

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer hover:text-primary transition-colors font-medium">
          {renderName()}
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
      setSelectedCategories([]); // Default: show all (empty = all)
    }
    setSearchQuery('');
    setLoading(false);
  };

  const handleBack = () => {
    setSelectedDay(null);
    setSelectedCategories([]);
    setSearchQuery('');
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = useMemo(() => {
    if (!selectedDay) return [];
    
    const searchTerm = searchQuery.trim().toLowerCase();
    const allCategoryIds = selectedDay.categories.map(c => c.categoryId);
    const showAllCategories = selectedCategories.length === 0 || 
      selectedCategories.length === allCategoryIds.length;
    
    return selectedDay.categories
      .map(category => {
        // If searching, always search ALL categories
        if (searchTerm) {
          const filteredFoursomes = category.foursomes.filter(foursome =>
            foursome.players.some(player =>
              player.name.toLowerCase().includes(searchTerm)
            )
          );
          return { ...category, foursomes: filteredFoursomes };
        }
        
        // If not searching, apply category filter
        if (!showAllCategories && !selectedCategories.includes(category.categoryId)) {
          return { ...category, foursomes: [] };
        }
        
        return category;
      })
      .filter(cat => cat.foursomes.length > 0);
  }, [selectedDay, selectedCategories, searchQuery]);

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
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {selectedDay.dayName}
                </h2>
                <p className="text-muted-foreground text-lg">{selectedDay.date}</p>
              </div>

              {/* Filters Section */}
              <div className="mb-8 space-y-4">
              {/* Category Filters */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground mr-2">Filtrar:</span>
                  {selectedDay.categories.map((category) => {
                    const allCategoryIds = selectedDay.categories.map(c => c.categoryId);
                    const showingAll = selectedCategories.length === 0 || 
                      selectedCategories.length === allCategoryIds.length;
                    const isSelected = selectedCategories.includes(category.categoryId);
                    const isHighlighted = showingAll || isSelected;
                    
                    return (
                      <Button
                        key={category.categoryId}
                        variant={isHighlighted ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCategory(category.categoryId)}
                        className={`transition-all ${
                          isHighlighted 
                            ? '' 
                            : 'bg-background hover:bg-primary/10'
                        }`}
                      >
                        {category.categoryName}
                      </Button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="max-w-md mx-auto relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar jugador por nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {filteredCategories.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-lg">
                    {searchQuery 
                      ? 'No se encontraron jugadores con ese nombre' 
                      : 'No hay salidas para las categorías seleccionadas'}
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  {filteredCategories.map((category) => (
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
                                    <PlayerName player={player} highlight={searchQuery} />
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
