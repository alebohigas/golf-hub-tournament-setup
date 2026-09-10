/**
 * AdminApproach Component
 * ---------------------------------------------------------------
 * Pestaña Admin > Approach. Administra el reporte
 * "Clasificados de Approach" (resumen de `torneos.approachjug`).
 *
 * Permite:
 *  - Publicar / ocultar el reporte en la página de Competiciones.
 *  - Elegir el título mostrado.
 *  - Elegir el orden por distancia: ascendente o descendente
 *    (el desempate siempre es por fecha y hora de registro).
 *  - Ver la vista previa exacta del reporte con el orden elegido.
 *
 * Persistencia: `site_config.approach_config` vía useSaveSiteConfig.
 * ---------------------------------------------------------------
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Crosshair, Loader2, Printer, Save } from 'lucide-react';
import ApproachClasificadosReport from '@/components/competencias/ApproachClasificadosReport';
import { useSiteConfig, useSaveSiteConfig } from '@/hooks/useSiteConfig';
import { useApproachClasificados, type ApproachOrden } from '@/hooks/useApproachClasificados';
import { useToast } from '@/hooks/use-toast';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';

// ============= Constants =============

/** Título por defecto del reporte público. */
const DEFAULT_TITLE = 'Clasificados de Approach';

// ============= Component =============

const AdminApproach = () => {
  const { data: siteConfig, isLoading } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();

  /** Estado local del editor (se hidrata desde el servidor). */
  const [enabled, setEnabled] = useState(false);
  const [orden, setOrden] = useState<ApproachOrden>('asc');
  const [title, setTitle] = useState(DEFAULT_TITLE);

  /** Hidrata el editor cuando llega la configuración del servidor. */
  useEffect(() => {
    const cfg = siteConfig?.approach_config;
    if (!cfg) return;
    setEnabled(cfg.enabled === true);
    setOrden(cfg.orden === 'desc' ? 'desc' : 'asc');
    setTitle(cfg.title || DEFAULT_TITLE);
  }, [siteConfig?.approach_config]);

  /** Datos actuales (para el resumen de grupos/lugares del torneo). */
  const { data } = useApproachClasificados(orden);

  /** Guarda la configuración en site_config.approach_config. */
  const handleSave = () => {
    saveSiteConfig.mutate(
      {
        password: getSuperAdminPassword(),
        approach_config: { enabled, orden, title: title.trim() || DEFAULT_TITLE },
      },
      {
        onSuccess: () =>
          toast({ title: 'Guardado', description: 'Configuración de Approach actualizada.' }),
        onError: (err: unknown) =>
          toast({
            title: 'Error al guardar',
            description: err instanceof Error ? err.message : 'Intenta de nuevo.',
            variant: 'destructive',
          }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== Configuración ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-primary" />
            Clasificados de Approach
          </CardTitle>
          <CardDescription>
            Reúne a todos los jugadores registrados en approach que están dentro
            de los parámetros de la competencia. Se ordenan por distancia y, en
            caso de empate, por fecha y hora de registro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Publicar en Competiciones */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-semibold">Presentar en Competiciones</Label>
              <p className="text-sm text-muted-foreground">
                Agrega la tarjeta y el botón del reporte en la página pública.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Título público */}
          <div className="space-y-2">
            <Label htmlFor="approach-title">Título del reporte</Label>
            <Input
              id="approach-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={DEFAULT_TITLE}
              className="max-w-md"
            />
          </div>

          {/* Orden por distancia */}
          <div className="space-y-2">
            <Label>Orden por distancia</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={orden === 'asc' ? 'default' : 'outline'}
                onClick={() => setOrden('asc')}
                className="gap-2"
              >
                <ArrowUpNarrowWide className="h-4 w-4" />
                Ascendente
              </Button>
              <Button
                variant={orden === 'desc' ? 'default' : 'outline'}
                onClick={() => setOrden('desc')}
                className="gap-2"
              >
                <ArrowDownWideNarrow className="h-4 w-4" />
                Descendente
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Desempate fijo: fecha y hora de registro (igual que Putt Finales).
            </p>
          </div>

          {/* Resumen de premios/lugares del torneo */}
          {(data?.groups?.length ?? 0) > 0 && (
            <div className="rounded-md border border-border/50 divide-y divide-border/50 text-sm">
              {data!.groups.map((g) => (
                <div key={g.descripcion} className="flex items-center justify-between px-3 py-2">
                  <span className="font-medium">{g.descripcion}</span>
                  <span className="text-muted-foreground">
                    Lugares: {g.lugares} · Jugadores: {g.playerCount}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={saveSiteConfig.isPending} className="gap-2">
              {saveSiteConfig.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar
            </Button>

            {/* Impresión en hoja carta con el orden seleccionado */}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.open(`/admin/approach-impresion?orden=${orden}`, '_blank')}
            >
              <Printer className="h-4 w-4" />
              Imprimir lista
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ===== Vista previa ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Vista previa</CardTitle>
          <CardDescription>
            Así se verá el reporte en Competiciones con el orden seleccionado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Vista previa fiel al reporte público, incluido su título configurable. */}
          <ApproachClasificadosReport orden={orden} title={title.trim() || DEFAULT_TITLE} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminApproach;
