import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy } from 'lucide-react';

const mockResults = [
  { pos: 1, name: 'Juan García López', r1: 72, r2: 70, r3: 71, total: 213, par: -3 },
  { pos: 2, name: 'Pedro Martínez', r1: 73, r2: 71, r3: 70, total: 214, par: -2 },
  { pos: 3, name: 'Carlos Rodríguez', r1: 71, r2: 73, r3: 72, total: 216, par: 0 },
  { pos: 4, name: 'Miguel Hernández', r1: 74, r2: 72, r3: 71, total: 217, par: 1 },
  { pos: 5, name: 'Roberto Sánchez', r1: 73, r2: 74, r3: 72, total: 219, par: 3 },
];

const Resultados = () => {
  return (
    <Layout>
      <PageHero 
        title="Resultados"
        subtitle="Consulta los resultados de cada ronda y clasificación general"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="categorias">Por Categoría</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Trophy className="h-5 w-5 text-accent" />
                    Clasificación General - Campeonato
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Pos</TableHead>
                          <TableHead>Jugador</TableHead>
                          <TableHead className="text-center">R1</TableHead>
                          <TableHead className="text-center">R2</TableHead>
                          <TableHead className="text-center">R3</TableHead>
                          <TableHead className="text-center">Total</TableHead>
                          <TableHead className="text-center">Par</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockResults.map((result) => (
                          <TableRow key={result.pos}>
                            <TableCell className="font-semibold">{result.pos}</TableCell>
                            <TableCell>{result.name}</TableCell>
                            <TableCell className="text-center">{result.r1}</TableCell>
                            <TableCell className="text-center">{result.r2}</TableCell>
                            <TableCell className="text-center">{result.r3}</TableCell>
                            <TableCell className="text-center font-semibold">{result.total}</TableCell>
                            <TableCell className="text-center">
                              <span className={result.par < 0 ? 'text-green-600' : result.par > 0 ? 'text-red-500' : ''}>
                                {result.par > 0 ? `+${result.par}` : result.par === 0 ? 'E' : result.par}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="categorias">
              <p className="text-center text-muted-foreground py-8">
                Seleccione una categoría para ver los resultados específicos.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Resultados;
