/**
 * PatrocinadoresOficialesSection
 * --------------------------------------------------------------
 * Showcases the official sponsors of marquee prizes such as
 * "Hole in One" and "Mejor O'Yes del Torneo".
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Trophy } from 'lucide-react';
import type { PatrocinadorOficial } from '@/data/mockData';

interface PatrocinadoresOficialesSectionProps {
  /** List of sponsor entries (one per premio). */
  data: PatrocinadorOficial[];
}

/**
 * Section: "Patrocinadores Oficiales" — premium cards for each
 * sponsored prize, shown inside Convocatoria.
 */
const PatrocinadoresOficialesSection = ({ data }: PatrocinadoresOficialesSectionProps) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-8">
      {/* Section heading */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-accent mb-2">
          <Trophy className="h-6 w-6" />
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          Patrocinadores Oficiales
        </h2>
        <p className="text-muted-foreground">
          Empresas que hacen posibles los grandes premios del torneo
        </p>
      </div>

      {/* Sponsor cards grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {data.map((sponsor) => (
          <Card
            key={sponsor.premio}
            className="border-2 border-accent/30 shadow-elegant overflow-hidden bg-gradient-to-br from-card to-accent/5"
          >
            <CardHeader className="bg-accent/10 border-b border-accent/20">
              <CardTitle className="flex items-center gap-2 text-lg font-display text-foreground">
                <Award className="h-5 w-5 text-accent" />
                {sponsor.premio}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                Patrocinado por
              </p>
              <p className="text-base font-display font-bold text-foreground">
                {sponsor.patrocinador}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {sponsor.descripcion}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatrocinadoresOficialesSection;
