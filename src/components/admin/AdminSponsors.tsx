/**
 * AdminSponsors Component
 * Admin tab to configure how sponsor logos are displayed on the public Patrocinadores page.
 *
 * Currently exposes:
 *  - `columns`: number of columns in the sponsor grid (1–6).
 *    Fewer columns ⇒ logos render larger; more columns ⇒ logos render smaller.
 *
 * Persisted server-side via the `sponsors_config` field of the site_config row,
 * so all visitors of the current domain share the same setting.
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Image as ImageIcon, Save, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteConfig, useSaveSiteConfig, SponsorsConfig } from '@/hooks/useSiteConfig';
import { useToast } from '@/hooks/use-toast';

// ============= Constants =============

/** Allowed column counts for the sponsor grid */
const COLUMN_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

/** Default config used when nothing is stored on the server yet */
const DEFAULT_SPONSORS_CONFIG: SponsorsConfig = { columns: 4 };

// ============= Component =============

/**
 * AdminSponsors
 * Lets the admin pick the number of columns used to display sponsor logos.
 */
const AdminSponsors = () => {
  const { data: siteConfig, isLoading } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();

  /** Local draft state — reflects the column count being edited */
  const [columns, setColumns] = useState<number>(DEFAULT_SPONSORS_CONFIG.columns);

  // Sync local state whenever the server config (re)loads
  useEffect(() => {
    if (siteConfig?.sponsors_config?.columns) {
      setColumns(siteConfig.sponsors_config.columns);
    }
  }, [siteConfig?.sponsors_config?.columns]);

  /** Save the current column count to the server */
  const handleSave = () => {
    saveSiteConfig.mutate(
      {
        password: 'admin2025',
        sponsors_config: { columns },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Configuración guardada',
            description: `Patrocinadores se mostrarán en ${columns} columna${columns > 1 ? 's' : ''}.`,
          });
        },
        onError: (err) => {
          toast({
            title: 'Error al guardar',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const currentSavedColumns = siteConfig?.sponsors_config?.columns ?? DEFAULT_SPONSORS_CONFIG.columns;
  const hasChanges = columns !== currentSavedColumns;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Configuración de Patrocinadores
        </CardTitle>
        <CardDescription>
          Define cuántas columnas se usan para mostrar los logos en la página de Patrocinadores.
          Menos columnas = logos más grandes. Más columnas = logos más pequeños.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando configuración...
          </div>
        ) : (
          <>
            {/* Current saved value */}
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Valor actual guardado:&nbsp;
              <span className="font-mono font-bold">{currentSavedColumns}</span>
              &nbsp;columna{currentSavedColumns > 1 ? 's' : ''}
            </p>

            {/* Column selector */}
            <div className="space-y-2">
              <Label className="text-sm">Columnas en la cuadrícula</Label>
              <div className="flex flex-wrap gap-2">
                {COLUMN_OPTIONS.map((opt) => (
                  <Button
                    key={opt}
                    variant={columns === opt ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setColumns(opt)}
                    className={cn('min-w-[3rem]', columns === opt && 'pointer-events-none')}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                En pantallas pequeñas el grid se reduce automáticamente para mantener legibilidad.
              </p>
            </div>

            {/* Live preview placeholder grid */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Vista previa</Label>
              <div
                className="grid gap-3 p-4 rounded-lg border border-border bg-muted/30"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: columns * 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/2] rounded-md bg-background border border-border/60 flex items-center justify-center text-muted-foreground text-xs"
                  >
                    Logo
                  </div>
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={!hasChanges || saveSiteConfig.isPending} className="gap-2">
                {saveSiteConfig.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar cambios
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSponsors;
