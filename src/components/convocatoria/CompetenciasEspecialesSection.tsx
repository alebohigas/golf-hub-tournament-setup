/**
 * CompetenciasEspecialesSection
 * Displays special competitions (putt, approach, drive, shootout) with descriptions and prizes
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gift } from 'lucide-react';
import type { CompetenciaEspecial } from '@/data/mockData';

interface CompetenciasEspecialesSectionProps {
  data: CompetenciaEspecial[];
}

const CompetenciasEspecialesSection = ({ data }: CompetenciasEspecialesSectionProps) => {
  // Hide entire section when there are no special competitions to display.
  if (!data || data.length === 0) return null;
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="inline-block px-6 py-2 bg-accent text-accent-foreground rounded-full font-display font-bold text-xl">
          Competencias Especiales
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((comp, idx) => (
          <Card key={idx} className="shadow-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <Zap className="h-5 w-5 text-accent" />
                {comp.nombre}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">{comp.descripcion}</p>
              {comp.premios && (() => {
                /** Split prizes by ". " pattern (e.g. "1ero: $1,000 USD. 2do: $850 USD.") */
                const items = comp.premios.split(/\.\s+/).map(s => s.replace(/\.$/, '').trim()).filter(Boolean);
                return items.length > 1 ? (
                  <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Gift className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">Premios:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground ml-6">
                      {items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Gift className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{comp.premios}</span>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompetenciasEspecialesSection;
