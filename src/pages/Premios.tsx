import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Award, Medal, Star } from 'lucide-react';

const Premios = () => {
  return (
    <Layout>
      <PageHero 
        title="Premios"
        subtitle="Reconocimientos y premiación del torneo"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="font-display">Campeón General</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>Trofeo conmemorativo y reconocimiento especial para el campeón absoluto del torneo.</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Medal className="h-8 w-8 text-gray-600" />
                </div>
                <CardTitle className="font-display">Por Categoría</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>Premios para los tres primeros lugares de cada categoría del torneo.</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-display">Premios Especiales</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>Hoyo en uno, drive más largo y tiro más cercano al hoyo.</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Award className="h-5 w-5 text-accent" />
                  Premiación por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['1er Lugar', '2do Lugar', '3er Lugar', 'Mejor Neto'].map((premio, idx) => (
                    <div key={idx} className="text-center p-4 bg-muted rounded-lg">
                      <span className="text-2xl font-display font-bold text-accent block mb-1">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐'}
                      </span>
                      <span className="text-sm text-foreground font-medium">{premio}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Premios;
