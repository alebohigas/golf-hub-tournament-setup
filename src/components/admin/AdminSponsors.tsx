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
import { Switch } from '@/components/ui/switch';
import { Loader2, Image as ImageIcon, Save, CheckCircle2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteConfig, useSaveSiteConfig, SponsorsConfig } from '@/hooks/useSiteConfig';
import { useToast } from '@/hooks/use-toast';
import { useSponsors } from '@/hooks/useTournamentData';
import SponsorLogoImage from '@/components/sponsors/SponsorLogoImage';

// ============= Constants =============

/** Allowed column counts for the sponsor grid */
const COLUMN_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

/**
 * Pages where the sponsor ribbon can be displayed.
 * `path` matches the React Router route exactly (used by useLocation in SponsorRibbon).
 */
const RIBBON_PAGES: { path: string; label: string }[] = [
  { path: '/', label: 'Inicio' },
  { path: '/convocatoria', label: 'Convocatoria' },
  { path: '/eventos', label: 'Eventos' },
  { path: '/jugadores', label: 'Jugadores' },
  { path: '/salidas', label: 'Salidas' },
  { path: '/live', label: 'LIVE' },
  { path: '/live-scoring', label: 'Live Scoring' },
  { path: '/resultados', label: 'Resultados' },
  { path: '/competicion', label: 'Competición' },
  { path: '/calendario', label: 'Calendario' },
  { path: '/avisos', label: 'Avisos' },
  { path: '/premios', label: 'Premios' },
  { path: '/patrocinadores', label: 'Patrocinadores' },
  { path: '/reglas', label: 'Reglas' },
];

/** Build a default visibility map (all pages visible by default) */
const buildDefaultRibbonVisibility = (): Record<string, boolean> =>
  RIBBON_PAGES.reduce<Record<string, boolean>>((acc, p) => {
    acc[p.path] = true;
    return acc;
  }, {});

/** Default config used when nothing is stored on the server yet */
const DEFAULT_SPONSORS_CONFIG: SponsorsConfig = {
  columns: 4,
  ribbonVisiblePages: buildDefaultRibbonVisibility(),
};

// ============= Component =============

/**
 * AdminSponsors
 * Lets the admin pick the number of columns used to display sponsor logos.
 */
const AdminSponsors = () => {
  const { data: siteConfig, isLoading } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();

  /** Live sponsor list — used to render an actual preview with broken-logo warnings */
  const { data: sponsors = [], isLoading: isLoadingSponsors } = useSponsors();

  /** Local draft state — reflects the column count being edited */
  const [columns, setColumns] = useState<number>(DEFAULT_SPONSORS_CONFIG.columns);

  /** Local draft state — per-route visibility of the sponsor ribbon */
  const [ribbonVisiblePages, setRibbonVisiblePages] = useState<Record<string, boolean>>(
    buildDefaultRibbonVisibility()
  );

  // Sync local state whenever the server config (re)loads
  useEffect(() => {
    if (siteConfig?.sponsors_config?.columns) {
      setColumns(siteConfig.sponsors_config.columns);
    }
    // Merge stored map with defaults so newly added pages start visible
    const stored = siteConfig?.sponsors_config?.ribbonVisiblePages;
    if (stored) {
      setRibbonVisiblePages({ ...buildDefaultRibbonVisibility(), ...stored });
    }
  }, [siteConfig?.sponsors_config?.columns, siteConfig?.sponsors_config?.ribbonVisiblePages]);

  /** Save the current column count to the server */
  const handleSave = () => {
    saveSiteConfig.mutate(
      {
        password: 'admin2025',
        sponsors_config: { columns, ribbonVisiblePages },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Configuración guardada',
            description: `Patrocinadores: ${columns} columna${columns > 1 ? 's' : ''}. Ribbon visible en ${Object.values(ribbonVisiblePages).filter(Boolean).length} página(s).`,
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
  const savedRibbonVisible =
    siteConfig?.sponsors_config?.ribbonVisiblePages ?? buildDefaultRibbonVisibility();
  // Detect any change to columns or any per-page toggle
  const hasRibbonChanges = RIBBON_PAGES.some(
    (p) => (ribbonVisiblePages[p.path] ?? true) !== (savedRibbonVisible[p.path] ?? true)
  );
  const hasChanges = columns !== currentSavedColumns || hasRibbonChanges;

  /** Toggle ribbon visibility for a given route path */
  const toggleRibbonForPath = (path: string, value: boolean) => {
    setRibbonVisiblePages((prev) => ({ ...prev, [path]: value }));
  };

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

            {/* Column selector + inline Save button (right side) */}
            <div className="space-y-2">
              <Label className="text-sm">Columnas en la cuadrícula</Label>
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Column option buttons */}
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
                {/* Inline Save button — relocated from the bottom of the card */}
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || saveSiteConfig.isPending}
                  size="sm"
                  className="gap-2"
                >
                  {saveSiteConfig.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Guardar cambios
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                En pantallas pequeñas el grid se reduce automáticamente para mantener legibilidad.
              </p>
            </div>

            {/* Live preview placeholder grid */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Vista previa de patrocinadores reales del torneo activo
              </Label>
              <div
                className="grid gap-3 p-4 rounded-lg border border-border bg-muted/30"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {isLoadingSponsors ? (
                  // Skeleton placeholders while sponsors are loading
                  Array.from({ length: columns * 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/2] rounded-md bg-background border border-border/60 flex items-center justify-center text-muted-foreground text-xs"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ))
                ) : sponsors.length === 0 ? (
                  <p className="text-xs text-muted-foreground col-span-full text-center py-4">
                    No hay patrocinadores registrados para este torneo.
                  </p>
                ) : (
                  sponsors.map((sponsor) => (
                    <div
                      key={sponsor.id}
                      // aspect-square keeps the card proportional to column width,
                      // so as columns increase, each card shrinks naturally.
                      className="aspect-square rounded-md bg-background border border-border/60 flex flex-col items-center justify-center gap-1 p-3 overflow-hidden"
                    >
                      {/* Logo fills the available area. `h-full w-full` on the
                          wrapper + `max-h-full max-w-full` on the image lets the
                          logo scale up to the card size while preserving aspect. */}
                      <div className="flex-1 w-full flex items-center justify-center min-h-0">
                        <SponsorLogoImage
                          url={sponsor.logoUrl}
                          alt={sponsor.name}
                          showErrorPlaceholder
                          className="max-h-full max-w-full w-auto h-auto object-contain"
                        />
                      </div>
                      {/* Sponsor name (from `nombre` column) — always shown for identification */}
                      <p
                        className="text-[10px] leading-tight text-muted-foreground text-center break-words line-clamp-2 w-full shrink-0"
                        title={sponsor.name}
                      >
                        {sponsor.name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ---------------- Ribbon visibility per page ---------------- */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">
                  Mostrar carrusel de patrocinadores en páginas
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Selecciona en qué páginas aparecerá el ribbon animado de logos. Los cambios se aplican
                al guardar.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {RIBBON_PAGES.map((page) => {
                  const checked = ribbonVisiblePages[page.path] ?? true;
                  return (
                    <label
                      key={page.path}
                      htmlFor={`ribbon-${page.path}`}
                      className={cn(
                        'flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-muted/50 cursor-pointer transition-colors',
                        checked && 'border-primary/40 bg-primary/5'
                      )}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{page.label}</span>
                        <span className="text-[10px] font-mono text-muted-foreground truncate">
                          {page.path}
                        </span>
                      </div>
                      <Switch
                        id={`ribbon-${page.path}`}
                        checked={checked}
                        onCheckedChange={(v) => toggleRibbonForPath(page.path, v)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSponsors;
