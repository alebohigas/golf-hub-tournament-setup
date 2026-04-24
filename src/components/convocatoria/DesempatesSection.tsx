/**
 * DesempatesSection
 * Displays the official tie-breaking criteria ("Cómo decidir empates")
 * for the tournament — both for the cut ("Para el Corte") and for trophies
 * ("Para Trofeos"). Content is sourced from `desempatesData` in mockData
 * and mirrors the printed Términos de la Competencia.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Trophy, Scissors } from 'lucide-react';
import type { DesempatesData } from '@/data/mockData';

/** Props for DesempatesSection */
interface DesempatesSectionProps {
  data: DesempatesData;
}

/**
 * Renders the tie-breaking rules in two cards (Corte + Trofeos),
 * preceded by an intro paragraph and followed by an optional note.
 */
const DesempatesSection = ({ data }: DesempatesSectionProps) => {
  // Hide entire section when there is no data to display.
  if (!data || (!data.paraCorte?.length && !data.paraTrofeos?.length)) return null;

  return (
    <div className="space-y-6">
      {/* Section heading pill (matches PremiacionSection styling) */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground rounded-full font-display font-bold text-xl">
          <Scale className="h-5 w-5" />
          Desempates para Corte
        </span>
      </div>

      {/* Intro */}
      {data.intro && (
        <p className="text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {data.intro}
        </p>
      )}

      {/* Two-column layout for the two criteria sets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Para el Corte */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Scissors className="h-5 w-5 text-accent" />
              Para el Corte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside marker:text-accent marker:font-semibold">
              {data.paraCorte.map((item, idx) => (
                <li key={idx} className="text-muted-foreground leading-relaxed">
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Para Trofeos */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Trophy className="h-5 w-5 text-accent" />
              Para Trofeos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.paraTrofeos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Optional closing note */}
      {data.nota && (
        <p className="text-center text-sm italic text-muted-foreground max-w-3xl mx-auto">
          {data.nota}
        </p>
      )}
    </div>
  );
};

export default DesempatesSection;