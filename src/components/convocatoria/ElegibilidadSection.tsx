/**
 * ElegibilidadSection
 * Displays eligibility requirements, important notes, and registration info
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface ElegibilidadSectionProps {
  eligibilityText: string;
  notesText: string[];
  inscripcionesText: string;
}

const ElegibilidadSection = ({ eligibilityText, notesText, inscripcionesText }: ElegibilidadSectionProps) => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center">
        Elegibilidad
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Requisitos */}
        <Card className="lg:col-span-1 shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <CheckCircle className="h-5 w-5 text-primary" />
              Requisitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{eligibilityText}</p>
          </CardContent>
        </Card>

        {/* Notas importantes */}
        <Card className="lg:col-span-2 shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <AlertCircle className="h-5 w-5 text-accent" />
              Notas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {notesText.map((note, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Inscripciones */}
      <Card className="shadow-card border-border/50 bg-primary/5 border-primary/20">
        <CardContent className="py-5 flex items-start gap-4">
          <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">Inscripciones: </span>
            <span className="text-muted-foreground">{inscripcionesText}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElegibilidadSection;
