/**
 * AdminSponsorsCarousel Component
 * Sub-tab inside Admin → Patrocinadores.
 *
 * Placeholder for the upcoming "Carrusel" feature (large rotating sponsor
 * showcase). The configuration UI for this feature will be added in the
 * next iteration.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GalleryHorizontal, Wrench } from 'lucide-react';

/**
 * AdminSponsorsCarousel
 * Currently displays an "in progress" placeholder so the tab structure
 * is in place ahead of the carousel feature implementation.
 */
const AdminSponsorsCarousel = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GalleryHorizontal className="h-5 w-5 text-primary" />
          Carrusel de Patrocinadores
        </CardTitle>
        <CardDescription>
          Próximamente: configura el carrusel destacado de patrocinadores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center gap-3 py-10 px-4 rounded-lg border border-dashed border-border bg-muted/30">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium">Sección en construcción</p>
          <p className="text-xs text-muted-foreground max-w-md">
            Aquí podrás configurar el carrusel de patrocinadores: orden, duración por slide,
            páginas donde se muestra y más. Lo definimos en el siguiente branch.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSponsorsCarousel;