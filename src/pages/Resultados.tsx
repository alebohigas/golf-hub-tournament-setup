import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, ArrowLeft, Medal } from 'lucide-react';
import resultadosHero from '@/assets/resultados-hero.jpg';
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

  const handleCategoryClick = async (category: ResultCategory) => {
    setSelectedCategory(category);
    
    // If only one scoring type, skip selection and load results directly
    if (category.scoringTypes.length === 1) {
      setLoading(true);
      const scoringType = category.scoringTypes[0].scoringType;
      const results = await fetchCategoryResults(category.categoryId, scoringType);
      if (results) {
        setPlayers(results);
        setSelectedScoringType(scoringType);
      }
      setLoading(false);
    } else {
      setSelectedScoringType(null);
      setPlayers([]);
    }
  };

  const handleScoringClick = async (scoringType: ScoringType) => {
    if (!selectedCategory) return;
    setLoading(true);
    const results = await fetchCategoryResults(selectedCategory.categoryId, scoringType);
    if (results) {
      setPlayers(results);
      setSelectedScoringType(scoringType);
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (selectedScoringType) {
      // If category has only one scoring type, go back to all categories
      if (selectedCategory && selectedCategory.scoringTypes.length === 1) {
        setSelectedCategory(null);
        setSelectedScoringType(null);
        setPlayers([]);
      } else {
        setSelectedScoringType(null);
        setPlayers([]);
      }
    } else {
      setSelectedCategory(null);
    }
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

  const totalCategories = categories.length;

  return (
    <Layout>
      <PageHero 
        title="Resultados"
        subtitle="Consulta los resultados de cada ronda y clasificación general"
        backgroundImage={resultadosHero}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {!selectedCategory ? (
            <>
              {/* Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  CATEGORÍAS: <span className="text-primary">{totalCategories}</span>
                </h2>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                {categories.map((category) => (
                  <Card 
                    key={category.categoryId} 
                    className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <CardContent className="p-5 text-center">
                      <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <h3 className="font-bold text-foreground text-lg mb-2">{category.shortName}</h3>
                      <div className="flex justify-center gap-1 flex-wrap">
                        {category.scoringTypes.map((scoring) => (
                          <span
                            key={scoring.scoringType}
                            className={`text-xs px-2 py-0.5 rounded text-white ${
                              scoring.scoringType === 'NETO' 
                                ? 'bg-sky-500' 
                                : 'bg-green-600'
                            }`}
                          >
                            {scoring.scoringType}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : !selectedScoringType ? (
            <>
              {/* Category Selected - Choose Scoring Type */}
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a categorías
              </Button>

              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {selectedCategory.categoryName}
                </h2>
                <p className="text-muted-foreground">Selecciona el tipo de puntuación</p>
              </div>

              <div className="flex justify-center gap-4 flex-wrap max-w-md mx-auto">
                {selectedCategory.scoringTypes.map((scoring) => (
                  <Card 
                    key={scoring.scoringType}
                    className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer flex-1 min-w-[140px]"
                    onClick={() => handleScoringClick(scoring.scoringType)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        scoring.scoringType === 'NETO' 
                          ? 'bg-sky-500' 
                          : 'bg-green-600'
                      }`}>
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-foreground text-xl mb-1">{scoring.scoringType}</h3>
                      <p className="text-sm text-muted-foreground">
                        {scoring.players.length} jugadores
                      </p>
                    </CardContent>
                  </Card>
                ))}
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
                {selectedCategory.scoringTypes.length === 1 
                  ? 'Volver a categorías' 
                  : `Volver a ${selectedCategory.shortName}`}
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
