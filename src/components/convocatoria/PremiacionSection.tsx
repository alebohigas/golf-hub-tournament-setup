/**
 * PremiacionSection
 * Displays structured prize/trophy information per category
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import type { PremioCategoria } from '@/data/mockData';

interface PremiacionSectionProps {
  data: PremioCategoria[];
}

const PremiacionSection = ({ data }: PremiacionSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="inline-block px-6 py-2 bg-accent text-accent-foreground rounded-full font-display font-bold text-xl">
          Premiación
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((item, idx) => (
          <Card key={idx} className="shadow-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <Trophy className="h-5 w-5 text-accent" />
                {item.categoria}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {item.premios.map((premio, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-3 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{premio}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PremiacionSection;
