import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, ArrowLeft, Medal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  ResultCategory, 
  ScoringType, 
  PlayerResult, 
  fetchAllCategories, 
  fetchCategoryResults 
} from '@/data/resultadosData';

const Resultados = () => {
  const [categories, setCategories] = useState<ResultCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ResultCategory | null>(null);
  const [selectedScoringType, setSelectedScoringType] = useState<ScoringType | null>(null);
  const [players, setPlayers] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchAllCategories();
      setCategories(data);
      setLoading(false);
    };
    loadCategories();
  }, []);

  const handleScoringClick = async (category: ResultCategory, scoringType: ScoringType) => {
    setLoading(true);
    const results = await fetchCategoryResults(category.categoryId, scoringType);
    if (results) {
      setPlayers(results);
      setSelectedCategory(category);
      setSelectedScoringType(scoringType);
    }
    setLoading(false);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedScoringType(null);
    setPlayers([]);
  };

  const getPositionStyle = (position: number) => {
    if (position === 1) return 'text-yellow-500';
    if (position === 2) return 'text-gray-400';
    if (position === 3) return 'text-amber-600';
    return '';
  };

  const getPositionIcon = (position: number) => {
    if (position <= 3) {
      return <Medal className={`h-5 w-5 ${getPositionStyle(position)}`} />;
    }
    return null;
  };

  return (
    <Layout>
      <PageHero 
        title="Resultados"
        subtitle="Consulta los resultados de cada ronda y clasificación general"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {!selectedCategory ? (
            <>
              {/* Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
                  <Trophy className="h-8 w-8 text-primary" />
                  RESULTADOS
                </h2>
              </div>

              {/* Categories Grid */}
              <div className="overflow-x-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-w-fit">
                  {categories.map((category) => (
                    <div key={category.categoryId} className="text-center">
                      <h3 className="font-bold text-foreground mb-3 text-lg">
                        {category.shortName}
                      </h3>
                      <div className="flex flex-col gap-2">
                        {category.scoringTypes.map((scoring) => (
                          <Button
                            key={scoring.scoringType}
                            onClick={() => handleScoringClick(category, scoring.scoringType)}
                            className={`w-full ${
                              scoring.scoringType === 'NETO' 
                                ? 'bg-sky-500 hover:bg-sky-600' 
                                : 'bg-green-600 hover:bg-green-700'
                            } text-white font-semibold`}
                          >
                            {scoring.scoringType}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Results Detail View */}
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a categorías
              </Button>

              {/* Category Header */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {selectedCategory.categoryName}
                </h2>
                <span className={`inline-block px-4 py-1 rounded-full text-white font-semibold ${
                  selectedScoringType === 'NETO' 
                    ? 'bg-sky-500' 
                    : 'bg-green-600'
                }`}>
                  {selectedScoringType}
                </span>
              </div>

              {/* Results Table */}
              <Card className="border-border/50">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary hover:bg-primary">
                          <TableHead className="text-primary-foreground font-bold w-16">Pos</TableHead>
                          <TableHead className="text-primary-foreground font-bold">Jugador</TableHead>
                          <TableHead className="text-primary-foreground font-bold">Club</TableHead>
                          <TableHead className="text-primary-foreground font-bold text-center">R1</TableHead>
                          <TableHead className="text-primary-foreground font-bold text-center">R2</TableHead>
                          <TableHead className="text-primary-foreground font-bold text-center">R3</TableHead>
                          <TableHead className="text-primary-foreground font-bold text-center">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {players.length > 0 ? (
                          players.map((player, idx) => (
                            <TableRow 
                              key={player.id}
                              className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                            >
                              <TableCell className="font-semibold">
                                <div className="flex items-center gap-2">
                                  {getPositionIcon(player.position)}
                                  <span className={getPositionStyle(player.position)}>
                                    {player.position}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{player.name}</TableCell>
                              <TableCell className="text-muted-foreground">{player.club}</TableCell>
                              <TableCell className="text-center">{player.r1 ?? '-'}</TableCell>
                              <TableCell className="text-center">{player.r2 ?? '-'}</TableCell>
                              <TableCell className="text-center">{player.r3 ?? '-'}</TableCell>
                              <TableCell className="text-center font-bold text-primary text-lg">
                                {player.total}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              No hay resultados disponibles
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Resultados;
