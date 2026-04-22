/**
 * ServiciosSection
 * --------------------------------------------------------------
 * Renders meal/service schedules for each tournament day in a
 * card grid layout. Driven by `serviciosHorariosData` from
 * mockData.ts (editable per torneo).
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Coffee } from 'lucide-react';
import type { ServicioDia } from '@/data/mockData';

interface ServiciosSectionProps {
  /** List of per-day services */
  data: ServicioDia[];
}

/**
 * Section: "Servicios y Horarios del Club" — grid of daily cards
 * listing food/beverage and service slots provided by the club.
 */
const ServiciosSection = ({ data }: ServiciosSectionProps) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-8">
      {/* Section heading */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-2">
          <UtensilsCrossed className="h-6 w-6" />
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          Servicios y Horarios del Club
        </h2>
        <p className="text-muted-foreground">
          Alimentos, bebidas y servicios disponibles cada día del torneo
        </p>
      </div>

      {/* Daily service cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((day) => (
          <Card
            key={day.dia}
            className="border-border/50 shadow-card hover:shadow-elegant transition-shadow"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-display text-primary">
                <Coffee className="h-4 w-4" />
                {day.dia}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-foreground">
                {day.servicios.map((s, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">{s}</span>
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

export default ServiciosSection;
