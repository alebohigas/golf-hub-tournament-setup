/**
 * AdminShowcase300 Component
 * Lives under Admin → Configuración, right below the theme palette.
 *
 * Renders one button per legacy "300" report (driver, approach, putt,
 * o'yes, oyes-x). Each button opens a new window pointing at
 * /showcase/:tipo, which is a standalone full-screen page that mirrors
 * the legacy *300.php reports with the project's modern styling and
 * a 5-minute auto-refresh.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Target, Flag, MousePointerClick, Crosshair, Layers, MonitorPlay } from 'lucide-react';

// ============= Showcase definitions =============

/** Single showcase entry → route path + label + icon */
interface ShowcaseEntry {
  /** Path segment used in /showcase/:tipo */
  tipo: string;
  /** Button label */
  label: string;
  /** Short description shown under the label */
  description: string;
  /** Icon component */
  Icon: typeof ExternalLink;
}

/** All available showcase reports, in display order */
const SHOWCASES: ShowcaseEntry[] = [
  { tipo: 'driver',   label: 'Driver',   description: 'Mayor distancia de driver',         Icon: Target },
  { tipo: 'approach', label: 'Approach', description: 'Mejor approach a bandera',         Icon: Crosshair },
  { tipo: 'putt',     label: 'Putt',     description: 'Putt más largo embocado',          Icon: MousePointerClick },
  { tipo: 'oyes',     label: "O'Yes",    description: 'Closest to pin (par 3)',           Icon: Flag },
  { tipo: 'oyesx',    label: 'Oyes-X',   description: 'Premios laterales adicionales',    Icon: Layers },
];

// ============= Component =============

/**
 * AdminShowcase300
 * Card with one button per showcase report. Buttons open a new browser
 * window/tab using window.open with a noopener feature string.
 */
const AdminShowcase300 = () => {
  /** Open the showcase page in a fresh window, ~16:9 lobby-friendly size */
  const openShowcase = (tipo: string) => {
    const features = 'noopener,noreferrer,width=1280,height=800';
    window.open(`/showcase/${tipo}`, `showcase_${tipo}`, features);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Showcase 300</CardTitle>
        <CardDescription>
          Reportes para mostrar en pantallas del club. Cada botón abre una
          ventana nueva con la tabla del reporte y se actualiza
          automáticamente cada 5 minutos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SHOWCASES.map(({ tipo, label, description, Icon }) => (
            <Button
              key={tipo}
              variant="outline"
              className="h-auto flex flex-col items-start gap-1 p-4 text-left hover:bg-primary/10"
              onClick={() => openShowcase(tipo)}
            >
              <div className="flex items-center gap-2 w-full">
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-semibold">{label}</span>
                <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground font-normal whitespace-normal">
                {description}
              </span>
            </Button>
          ))}
        </div>

        {/* Acceso al constructor de vistas rotativas (brackets, multi-300,
            customizado). Se abre en la misma pestaña porque es un panel
            de configuración, no una vista de TV. */}
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="default"
            className="gap-2"
            onClick={() => window.open('/admin/showcase-rotacion', '_blank')}
          >
            <MonitorPlay className="h-4 w-4" />
            Abrir constructor de rotación
            <ExternalLink className="h-3 w-3" />
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Permite rotar varios reportes en la misma pantalla, incluyendo
            brackets putt (grupos, semis, final) y selecciones customizadas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminShowcase300;