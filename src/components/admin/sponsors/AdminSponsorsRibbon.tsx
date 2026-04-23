/**
 * AdminSponsorsRibbon Component
 * Sub-tab inside Admin → Patrocinadores.
 *
 * Controls per-route visibility of the scrolling sponsor ribbon shown
 * in the public site layout. Each app route has a Switch that toggles
 * whether the ribbon appears on that page.
 *
 * Persisted server-side via `sponsors_config.ribbonVisiblePages`.
 *
 * The eye icon next to each route mirrors the global page visibility
 * configured under Admin → Página → Visibilidad, so admins can see at
 * a glance whether the underlying page is exposed to end users.
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteConfig, useSaveSiteConfig } from '@/hooks/useSiteConfig';
import { useToast } from '@/hooks/use-toast';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';

// ============= Constants =============

/**
 * Pages where the sponsor ribbon can appear.
 * `path` matches the React Router route exactly (consumed by useLocation in SponsorRibbon).
 */
/**
 * Each page entry maps a route path → display label and the corresponding
 * `pageId` used by `PageVisibilityContext` to look up whether the page is
 * currently visible to end users. `pageId: null` means the page is not
 * managed by visibility (e.g. /live-scoring) and is always treated as visible.
 */
const RIBBON_PAGES: { path: string; label: string; pageId: string | null }[] = [
  { path: '/', label: 'Inicio', pageId: 'home' },
  { path: '/convocatoria', label: 'Convocatoria', pageId: 'convocatoria' },
  { path: '/eventos', label: 'Eventos', pageId: 'eventos' },
  { path: '/jugadores', label: 'Jugadores', pageId: 'jugadores' },
  { path: '/salidas', label: 'Salidas', pageId: 'salidas' },
  { path: '/live', label: 'LIVE', pageId: 'live' },
  { path: '/live-scoring', label: 'Live Scoring', pageId: null },
  { path: '/resultados', label: 'Resultados', pageId: 'resultados' },
  { path: '/competicion', label: 'Competición', pageId: 'competicion' },
  { path: '/calendario', label: 'Calendario', pageId: 'calendario' },
  { path: '/horarios', label: 'Horarios de Salidas', pageId: 'horarios' },
  { path: '/avisos', label: 'Avisos', pageId: 'avisos' },
  { path: '/premios', label: 'Premios', pageId: 'premios' },
  { path: '/patrocinadores', label: 'Patrocinadores', pageId: 'patrocinadores' },
  { path: '/reglas', label: 'Reglas', pageId: 'reglas' },
];

/** Build a default visibility map (every page visible) */
const buildDefaultRibbonVisibility = (): Record<string, boolean> =>
  RIBBON_PAGES.reduce<Record<string, boolean>>((acc, p) => {
    acc[p.path] = true;
    return acc;
  }, {});

// ============= Component =============

/**
 * AdminSponsorsRibbon
 * Per-page toggles + Save button for ribbon visibility.
 */
const AdminSponsorsRibbon = () => {
  const { data: siteConfig, isLoading } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();
  // Read raw visibility settings (not isPageVisible, which always returns true for admins)
  // so the eye indicator reflects what end users actually see.
  const { visibilitySettings } = usePageVisibility();

  /** Local draft state — per-route ribbon visibility */
  const [ribbonVisiblePages, setRibbonVisiblePages] = useState<Record<string, boolean>>(
    buildDefaultRibbonVisibility()
  );

  // Sync local draft with server config on load. Newly added pages default to visible.
  useEffect(() => {
    const stored = siteConfig?.sponsors_config?.ribbonVisiblePages;
    if (stored) {
      setRibbonVisiblePages({ ...buildDefaultRibbonVisibility(), ...stored });
    }
  }, [siteConfig?.sponsors_config?.ribbonVisiblePages]);

  /** Toggle ribbon visibility for a given route path */
  const toggleRibbonForPath = (path: string, value: boolean) => {
    setRibbonVisiblePages((prev) => ({ ...prev, [path]: value }));
  };

  /** Bulk action: enable/disable ribbon on all pages */
  const setAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    RIBBON_PAGES.forEach((p) => {
      next[p.path] = value;
    });
    setRibbonVisiblePages(next);
  };

  /**
   * Persist ribbon visibility to the server, preserving any other existing
   * sponsors_config fields (e.g. columns).
   */
  const handleSave = () => {
    saveSiteConfig.mutate(
      {
        password: 'admin2025',
        sponsors_config: {
          ...(siteConfig?.sponsors_config ?? { columns: 4 }),
          ribbonVisiblePages,
        },
      },
      {
        onSuccess: () => {
          const visibleCount = Object.values(ribbonVisiblePages).filter(Boolean).length;
          toast({
            title: 'Visibilidad del ribbon guardada',
            description: `Ribbon visible en ${visibleCount} de ${RIBBON_PAGES.length} páginas.`,
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

  // Detect changes vs server-saved state
  const savedRibbonVisible =
    siteConfig?.sponsors_config?.ribbonVisiblePages ?? buildDefaultRibbonVisibility();
  const hasChanges = RIBBON_PAGES.some(
    (p) => (ribbonVisiblePages[p.path] ?? true) !== (savedRibbonVisible[p.path] ?? true)
  );
  const visibleCount = Object.values(ribbonVisiblePages).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Visibilidad del Ribbon de Patrocinadores
        </CardTitle>
        <CardDescription>
          Selecciona en qué páginas aparecerá el ribbon animado de logos de patrocinadores.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando configuración...
          </div>
        ) : (
          <>
            {/* Header row: counter + bulk actions + Save button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Visible en{' '}
                <span className="font-mono font-bold">{visibleCount}</span> de{' '}
                <span className="font-mono font-bold">{RIBBON_PAGES.length}</span> páginas
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setAll(true)}>
                  Activar todas
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAll(false)}>
                  Desactivar todas
                </Button>
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
            </div>

            {/* Per-page switches grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {RIBBON_PAGES.map((page) => {
                const checked = ribbonVisiblePages[page.path] ?? true;
                // A page with no managed pageId is always considered visible.
                // Default to visible (true) when the visibility setting is undefined,
                // matching the behavior of AdminPageCard / PageVisibilityContext.
                const pageVisibleForUsers = page.pageId
                  ? visibilitySettings[page.pageId] ?? true
                  : true;
                return (
                  <label
                    key={page.path}
                    htmlFor={`ribbon-${page.path}`}
                    className={cn(
                      'flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-muted/50 cursor-pointer transition-colors',
                      checked && 'border-primary/40 bg-primary/5'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Visibility indicator: open eye when the page is visible to users,
                          struck-through eye when the page is hidden via Admin → Página → Visibilidad. */}
                      {pageVisibleForUsers ? (
                        <Eye
                          className="h-4 w-4 shrink-0 text-primary"
                          aria-label="Página visible para usuarios"
                        />
                      ) : (
                        <EyeOff
                          className="h-4 w-4 shrink-0 text-muted-foreground/60"
                          aria-label="Página oculta para usuarios"
                        />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span
                          className={cn(
                            'text-sm font-medium truncate',
                            !pageVisibleForUsers && 'text-muted-foreground line-through'
                          )}
                        >
                          {page.label}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground truncate">
                          {page.path}
                        </span>
                      </div>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSponsorsRibbon;