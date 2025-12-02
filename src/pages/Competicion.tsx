import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Trophy, Users, Flag } from 'lucide-react';

const Competicion = () => {
  return (
    <Layout>
      <PageHero 
        title="Competición"
        subtitle="Formato y modalidades de competencia del torneo"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Target className="h-5 w-5 text-primary" />
                  Formato de Juego
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>El torneo se juega en formato individual con dos modalidades:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span><strong className="text-foreground">Stroke Play:</strong> Categorías Campeonato y AA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span><strong className="text-foreground">Stableford:</strong> Demás categorías</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Flag className="h-5 w-5 text-primary" />
                  Rondas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>Se jugarán 3 rondas de 18 hoyos cada una:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <span>Ronda 1: Miércoles 1 de octubre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <span>Ronda 2: Jueves 2 de octubre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <span>Ronda 3: Viernes 3 de octubre</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Trophy className="h-5 w-5 text-accent" />
                  Premios Especiales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <span>Hoyo en Uno en hoyos designados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <span>Tiro más cercano al hoyo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <span>Drive más largo</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Users className="h-5 w-5 text-primary" />
                  Desempates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>En caso de empate se aplicará:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span><strong className="text-foreground">Stroke Play:</strong> Desempate hoyo por hoyo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span><strong className="text-foreground">Stableford:</strong> Conteo regresivo de los últimos 9, 6, 3, 1 hoyos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Competicion;
