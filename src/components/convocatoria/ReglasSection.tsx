/**
 * ReglasSection
 * Displays local rules, tiebreakers, and important notes
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';
import type { ReglaItem } from '@/data/mockData';

interface ReglasSectionProps {
  data: ReglaItem[];
}

const ReglasSection = ({ data }: ReglasSectionProps) => {
  // Hide entire section when there are no rules to display.
  if (!data || data.length === 0) return null;
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="inline-block px-6 py-2 bg-accent text-accent-foreground rounded-full font-display font-bold text-xl">
          Reglas Locales
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((regla, idx) => (
          <Card key={idx} className="shadow-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <Scale className="h-5 w-5 text-primary" />
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-muted text-foreground">
                  {regla.titulo}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{regla.contenido}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReglasSection;
