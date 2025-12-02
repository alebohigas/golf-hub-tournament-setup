import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users } from 'lucide-react';
import jugadoresHero from '@/assets/jugadores-hero.jpg';
import { useState, useEffect } from 'react';
import { 
  CategoryDetail, 
  Player, 
  fetchCategories, 
  fetchPlayersByCategory, 
  fetchTotalPlayers 
} from '@/data/playersData';

const Jugadores = () => {
  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDetail | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [cats, total] = await Promise.all([
        fetchCategories(),
        fetchTotalPlayers()
      ]);
      setCategories(cats);
      setTotalPlayers(total);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCategoryClick = async (category: CategoryDetail) => {
    setLoading(true);
    const categoryPlayers = await fetchPlayersByCategory(category.id);
    setPlayers(categoryPlayers);
    setSelectedCategory(category);
    setLoading(false);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setPlayers([]);
  };

  return (
    <Layout>
      <PageHero 
        title="Jugadores"
        subtitle="Lista completa de participantes inscritos en el torneo"
        backgroundImage={jugadoresHero}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {!selectedCategory ? (
            <>
              {/* Total Players Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  JUGADORES: <span className="text-primary">{totalPlayers}</span>
                </h2>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="border-border/50 hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 text-center">
                      <h3 className="font-bold text-foreground">{category.shortName}</h3>
                      <p className="text-2xl font-bold text-primary my-2">{category.playerCount}</p>
                      <Button 
                        size="sm" 
                        onClick={() => handleCategoryClick(category)}
                        className="w-full"
                      >
                        Ver
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Category Detail View */}
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="mb-6 gap-2 bg-primary/10 hover:bg-primary/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a categorías
              </Button>

              {/* Category Info Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-light text-foreground mb-2">
                  Categoría: <span className="font-bold">{selectedCategory.name}</span>
                </h2>
                <div className="text-muted-foreground space-y-1">
                  <p>Tee Salida {selectedCategory.teeSalida} / Rating {selectedCategory.rating} Slope {selectedCategory.slope} par {selectedCategory.par}</p>
                  <p>Sistema {selectedCategory.format} / Rango Handicaps {selectedCategory.handicapMin} - {selectedCategory.handicapMax}</p>
                  <p>
                    Porcentaje Handicap {selectedCategory.handicapPercentage} / Total jugadores{' '}
                    <span className="text-primary font-bold">{selectedCategory.playerCount}</span>
                  </p>
                </div>
              </div>

              {/* Players Table */}
              <Card className="border-border/50">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary hover:bg-primary">
                        <TableHead className="text-primary-foreground font-bold">Club</TableHead>
                        <TableHead className="text-primary-foreground font-bold">Jugador</TableHead>
                        <TableHead className="text-primary-foreground font-bold text-right">HI</TableHead>
                        <TableHead className="text-primary-foreground font-bold text-right">HJ</TableHead>
                        <TableHead className="text-primary-foreground font-bold text-right">HN</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {players.length > 0 ? (
                        players.map((player) => (
                          <TableRow key={player.id}>
                            <TableCell className="font-medium">{player.club}</TableCell>
                            <TableCell>{player.name}</TableCell>
                            <TableCell className="text-right">{player.handicapIndex.toFixed(1)}</TableCell>
                            <TableCell className="text-right">{player.handicapJuego}</TableCell>
                            <TableCell className="text-right">{player.handicapNeto}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No hay jugadores registrados en esta categoría
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Jugadores;
