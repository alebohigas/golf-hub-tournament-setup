import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users } from 'lucide-react';

const mockSalidas = {
  ronda1: [
    { id: 1, time: '7:00 AM', hole: 1, players: ['Juan García', 'Pedro Martínez', 'Carlos Rodríguez', 'Miguel Hernández'] },
    { id: 2, time: '7:10 AM', hole: 1, players: ['Roberto Sánchez', 'Luis González', 'Fernando López', 'Antonio Ruiz'] },
    { id: 3, time: '7:20 AM', hole: 1, players: ['José Pérez', 'Manuel Torres', 'Ricardo Díaz', 'Alberto Moreno'] },
  ],
  ronda2: [
    { id: 1, time: '7:00 AM', hole: 10, players: ['Juan García', 'Pedro Martínez', 'Carlos Rodríguez', 'Miguel Hernández'] },
    { id: 2, time: '7:10 AM', hole: 10, players: ['Roberto Sánchez', 'Luis González', 'Fernando López', 'Antonio Ruiz'] },
  ],
  ronda3: [
    { id: 1, time: '7:00 AM', hole: 1, players: ['Juan García', 'Pedro Martínez', 'Carlos Rodríguez', 'Miguel Hernández'] },
  ],
};

const Salidas = () => {
  return (
    <Layout>
      <PageHero 
        title="Salidas"
        subtitle="Horarios de salida y grupos de juego"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="ronda1" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="ronda1">Ronda 1</TabsTrigger>
              <TabsTrigger value="ronda2">Ronda 2</TabsTrigger>
              <TabsTrigger value="ronda3">Ronda 3</TabsTrigger>
            </TabsList>
            {Object.entries(mockSalidas).map(([ronda, salidas]) => (
              <TabsContent key={ronda} value={ronda}>
                <div className="space-y-4">
                  {salidas.map((salida) => (
                    <Card key={salida.id} className="border-border/50">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-primary font-semibold">
                              <Clock className="h-4 w-4" />
                              {salida.time}
                            </div>
                            <span className="text-muted-foreground">Hoyo {salida.hole}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                              <Users className="h-4 w-4" />
                              <span className="text-sm">Jugadores:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {salida.players.map((player, idx) => (
                                <span key={idx} className="px-3 py-1 bg-muted rounded-full text-sm">
                                  {player}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Salidas;
