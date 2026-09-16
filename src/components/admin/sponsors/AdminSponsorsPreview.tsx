/**
 * AdminSponsorsPreview Component
 * Sub-tab inside Admin → Patrocinadores.
 *
 * Lets the admin pick the number of columns used by the public Patrocinadores
 * grid and renders a live preview of the active tournament's sponsor logos.
 * Broken/missing logos display a warning placeholder so the admin can spot
 * configuration issues at a glance.
 *
 * Persisted server-side via `sponsors_config.columns` in the site_config row.
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Image as ImageIcon, Save, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteConfig, useSaveSiteConfig } from '@/hooks/useSiteConfig';
import { useToast } from '@/hooks/use-toast';
import { useSponsors } from '@/hooks/useTournamentData';
import SponsorLogoImage from '@/components/sponsors/SponsorLogoImage';

// ============= Constants =============

/** Allowed column counts for the sponsor grid */
const COLUMN_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

/** Default column count when nothing is stored on the server yet */
const DEFAULT_COLUMNS = 4;

/**
 * normalizeWebsite
 * Trims the admin input and prefixes `https://` when the user typed a bare
 * domain (e.g. "acme.com"). Empty input means "no link" and is stored as ''.
 */
const normalizeWebsite = (raw: string): string => {
  const value = raw.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
};


// ============= Component =============

/**
 * AdminSponsorsPreview
 * Column-count selector + live preview of real sponsor logos.
 */
const AdminSponsorsPreview = () => {
  const { data: siteConfig, isLoading } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();

  /** Live sponsor list — used to render an actual preview with broken-logo warnings */
  const { data: sponsors = [], isLoading: isLoadingSponsors } = useSponsors();

  /** Local draft state — reflects the column count being edited */
  const [columns, setColumns] = useState<number>(DEFAULT_COLUMNS);

  /** Local draft map of sponsor ID → website URL being edited */
  const [websites, setWebsites] = useState<Record<string, string>>({});

  // Sync local state whenever the server config (re)loads
  useEffect(() => {
    if (siteConfig?.sponsors_config?.columns) {
      setColumns(siteConfig.sponsors_config.columns);
    }
  }, [siteConfig?.sponsors_config?.columns]);

  // Sync the website drafts whenever the stored map (re)loads
  useEffect(() => {
    setWebsites(siteConfig?.sponsors_config?.websites ?? {});
  }, [siteConfig?.sponsors_config?.websites]);

  /**
   * Save the column count and the sponsor website links to the server while
   * preserving any other existing sponsors_config fields (e.g. ribbon config).
   */
  const handleSave = () => {
    /** Normalise + drop empty entries so only real links are persisted */
    const cleanWebsites: Record<string, string> = {};
    Object.entries(websites).forEach(([id, url]) => {
      const normalized = normalizeWebsite(url);
      if (normalized) cleanWebsites[id] = normalized;
    });

    saveSiteConfig.mutate(
      {
        password: 'admin2025',
        sponsors_config: {
          ...(siteConfig?.sponsors_config ?? {}),
          columns,
          websites: cleanWebsites,
        },
      },
      {
        onSuccess: () => {
          setWebsites(cleanWebsites);
          toast({
            title: 'Configuración guardada',
            description: `Patrocinadores en ${columns} columna${columns > 1 ? 's' : ''} · ${Object.keys(cleanWebsites).length} con página web.`,
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

  const currentSavedColumns = siteConfig?.sponsors_config?.columns ?? DEFAULT_COLUMNS;

  /** Saved website map used to detect unsaved link edits */
  const savedWebsites = siteConfig?.sponsors_config?.websites ?? {};

  /** True when either the column count or any sponsor link differs from the server */
  const hasChanges =
    columns !== currentSavedColumns ||
    sponsors.some(
      (s) => normalizeWebsite(websites[s.id] ?? '') !== (savedWebsites[s.id] ?? '')
    );


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Preview de Patrocinadores
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
            {/* Current saved value indicator */}
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

            {/* Live preview grid using real tournament sponsors */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Vista previa de patrocinadores reales del torneo activo
              </Label>
              <div
                className="grid gap-3 p-4 rounded-lg border border-border bg-muted/30"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {isLoadingSponsors ? (
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
                      className="aspect-square rounded-md bg-background border border-border/60 flex flex-col items-center justify-center gap-1 p-3 overflow-hidden"
                    >
                      <div className="flex-1 w-full flex items-center justify-center min-h-0">
                        <SponsorLogoImage
                          url={sponsor.logoUrl}
                          alt={sponsor.name}
                          showErrorPlaceholder
                          className="max-h-full max-w-full w-auto h-auto object-contain"
                        />
                      </div>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSponsorsPreview;