/**
 * SocialesSection
 * --------------------------------------------------------------
 * Subsection inside the Eventos page that lists social/lifestyle
 * events occurring during the tournament (welcome cocktail, gala
 * dinner, themed nights, family Sunday, ceremony, etc).
 */

import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, MapPin, Clock } from 'lucide-react';
import type { EventoSocial } from '@/data/mockData';

interface SocialesSectionProps {
  /** Lifestyle/social events list. */
  data: EventoSocial[];
}

/**
 * Section: "Eventos Sociales" — cards laid out chronologically
 * with day, time, title, venue and short description.
 */
const SocialesSection = ({ data }: SocialesSectionProps) => {
  if (!data || data.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-accent mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Eventos Sociales
          </h2>
          <p className="text-muted-foreground">
            Vive la experiencia más allá del campo: cenas, ceremonias y noches temáticas
          </p>
        </div>

        {/* Event cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {data.map((event, idx) => (
            <Card
              key={`${event.dia}-${idx}`}
              className="border-border/50 shadow-card hover:shadow-elegant transition-all hover:-translate-y-0.5 overflow-hidden"
            >
              {/* Top accent strip */}
              <div className="h-1 bg-gradient-to-r from-accent to-primary" />
              <CardContent className="p-5 space-y-3">
                {/* Day + time */}
                <div className="flex items-center justify-between text-xs font-semibold text-primary uppercase tracking-wide">
                  <span>{event.dia}</span>
                  <span className="inline-flex items-center gap-1 text-accent">
                    <Clock className="h-3 w-3" />
                    {event.hora}
                  </span>
                </div>
                {/* Title */}
                <h3 className="text-lg font-display font-bold text-foreground">
                  {event.titulo}
                </h3>
                {/* Venue */}
                {event.lugar && (
                  <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.lugar}
                  </p>
                )}
                {/* Description */}
                {event.descripcion && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.descripcion}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialesSection;
