/**
 * AdminCompeticiones Component
 * ---------------------------------------------------------------
 * Pestaña Admin > Competiciones.
 *
 * Permite decidir CUÁLES reportes de la página pública /competencias se
 * presentan, aun cuando estén activos en la base de datos. La lista se
 * construyó con los tipos que devuelve `competencias.php` (O'Yes, O'Yes X,
 * Driver, Driver Precisión, Approach, Putt, Putt Finales, Skin Game, etc.),
 * más los reportes especiales:
 *   - Mejor Score del Día  → visibilidad `competencias-mejor-score`
 *   - Clasificados de Approach → `site_config.approach_config.enabled`
 *
 * Persistencia:
 *   - Tipos y Mejor Score: `site_config.visibility` (claves
 *     `competencias-{id}`) vía PageVisibilityContext + useSaveSiteConfig.
 *   - Clasificados de Approach: `site_config.approach_config`.
 * ---------------------------------------------------------------
 */

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Crosshair, Loader2, Square, Trophy } from 'lucide-react';
import { useCompetencias } from '@/hooks/useCompetenciasData';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';
import { useSiteConfig, useSaveSiteConfig } from '@/hooks/useSiteConfig';
import { useMejorScoreAvailability } from '@/hooks/useMejorScoreAvailability';
import { useToast } from '@/hooks/use-toast';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';

// ============= Constants =============

/** Clave de visibilidad del reporte "Mejor Score del Día". */
const MEJOR_SCORE_ID = 'competencias-mejor-score';

// ============= Types =============

/** Fila del listado de reportes administrables. */
interface ReportRow {
  /** Clave de visibilidad (`competencias-{id}` o la del reporte especial). */
  pageId: string;
  /** Nombre mostrado al administrador. */
  label: string;
  /** Detalle secundario (grupos / lugares / origen). */
  detail?: string;
}

// ============= Component =============

const AdminCompeticiones = () => {
  const { visibilitySettings, setPageVisibility } = usePageVisibility();
  const { data: competencias = [], isLoading } = useCompetencias();
  const { data: siteConfig } = useSiteConfig();
  const { hasData: mejorScoreAvailable } = useMejorScoreAvailability();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();

  /** Configuración actual del reporte "Clasificados de Approach". */
  const approachEnabled = siteConfig?.approach_config?.enabled === true;

  /**
   * Reportes administrables: un renglón por tipo de competición devuelto por
   * la base de datos, más el reporte "Mejor Score del Día".
   */
  const rows = useMemo<ReportRow[]>(() => {
    const list: ReportRow[] = competencias.map((c) => ({
      pageId: `competencias-${c.id}`,
      label: c.name,
      detail:
        (c.groups?.length ?? 0) > 0
          ? `${c.groups!.length} grupo${c.groups!.length === 1 ? '' : 's'}`
          : undefined,
    }));
    list.push({
      pageId: MEJOR_SCORE_ID,
      label: 'Mejor Score del Día',
      detail: mejorScoreAvailable ? 'Con datos disponibles' : 'Sin datos por el momento',
    });
    return list;
  }, [competencias, mejorScoreAvailable]);

  /** true si el reporte está presentándose en la página pública. */
  const isOn = (pageId: string) =>
    pageId in visibilitySettings ? visibilitySettings[pageId] : true;

  /** Guarda el mapa completo de visibilidad en el servidor. */
  const syncVisibility = (updated: Record<string, boolean>) => {
    saveSiteConfig.mutate(
      { password: getSuperAdminPassword(), visibility: updated },
      {
        onError: (err: unknown) =>
          toast({
            title: 'Error al guardar',
            description: err instanceof Error ? err.message : 'Intenta de nuevo.',
            variant: 'destructive',
          }),
      },
    );
  };

  /** Enciende/apaga un reporte y sincroniza. */
  const handleToggle = (pageId: string, value: boolean) => {
    setPageVisibility(pageId, value);
    syncVisibility({ ...visibilitySettings, [pageId]: value });
  };

  /** Enciende o apaga todos los reportes de la lista de golpe. */
  const handleToggleAll = (value: boolean) => {
    const updated = { ...visibilitySettings };
    rows.forEach((r) => {
      updated[r.pageId] = value;
      setPageVisibility(r.pageId, value);
    });
    syncVisibility(updated);
  };

  /** Publica/oculta el reporte "Clasificados de Approach". */
  const handleApproachToggle = (value: boolean) => {
    const cfg = siteConfig?.approach_config;
    saveSiteConfig.mutate(
      {
        password: getSuperAdminPassword(),
        approach_config: {
          enabled: value,
          orden: cfg?.orden === 'desc' ? 'desc' : 'asc',
          title: cfg?.title,
          // Conserva la selección de reportes configurada en Admin > Approach.
          grupos: cfg?.grupos,
        },
      },
      {
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

  const activeCount = rows.filter((r) => isOn(r.pageId)).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Reportes de Competiciones
          </CardTitle>
          <CardDescription>
            Elige qué reportes se presentan en la página pública de Competiciones,
            aun cuando estén activos en la base de datos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Acciones masivas */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleToggleAll(true)}>
              <CheckSquare className="h-4 w-4" />
              Seleccionar todos
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleToggleAll(false)}>
              <Square className="h-4 w-4" />
              Deseleccionar todos
            </Button>
            <Badge variant="secondary" className="ml-auto">
              {activeCount} de {rows.length} presentándose
            </Badge>
          </div>

          {/* Listado de reportes */}
          <div className="rounded-md border border-border/50 divide-y divide-border/50">
            {rows.map((row) => (
              <div key={row.pageId} className="flex items-center justify-between gap-4 px-3 py-3">
                <div className="min-w-0">
                  <Label className="font-medium">{row.label}</Label>
                  {row.detail && (
                    <p className="text-xs text-muted-foreground">{row.detail}</p>
                  )}
                </div>
                <Switch
                  checked={isOn(row.pageId)}
                  onCheckedChange={(v) => handleToggle(row.pageId, v)}
                />
              </div>
            ))}
            {rows.length === 0 && (
              <p className="px-3 py-6 text-sm text-muted-foreground text-center">
                No hay competiciones registradas en la base de datos.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ===== Clasificados de Approach (reporte especial) ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-primary" />
            Clasificados de Approach
          </CardTitle>
          <CardDescription>
            Este reporte se administra en la pestaña Approach; aquí puedes
            publicarlo u ocultarlo rápidamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <Label className="font-medium">Presentar en Competiciones</Label>
          <Switch checked={approachEnabled} onCheckedChange={handleApproachToggle} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCompeticiones;
