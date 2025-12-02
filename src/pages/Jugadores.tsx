import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User } from 'lucide-react';
import { useState } from 'react';

const mockPlayers = [
  { id: 1, name: 'Juan García López', category: 'CAMPEONATO', handicap: 1.2 },
  { id: 2, name: 'Pedro Martínez', category: 'AA', handicap: 3.5 },
  { id: 3, name: 'Carlos Rodríguez', category: 'A', handicap: 7.2 },
  { id: 4, name: 'Miguel Hernández', category: 'B', handicap: 11.5 },
  { id: 5, name: 'Roberto Sánchez', category: 'C', handicap: 16.0 },
  { id: 6, name: 'Luis González', category: 'SENIORS A', handicap: 12.3 },
];

const Jugadores = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredPlayers = mockPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || player.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <PageHero 
        title="Jugadores"
        subtitle="Lista completa de participantes inscritos en el torneo"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar jugador..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="CAMPEONATO">Campeonato</SelectItem>
                <SelectItem value="AA">AA</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="SENIORS A">Seniors A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) => (
              <Card key={player.id} className="card-hover border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{player.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {player.category} • HI: {player.handicap}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Jugadores;
