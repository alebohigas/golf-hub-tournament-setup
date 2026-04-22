/**
 * AdminSponsorsCarousel Component
 * Sub-tab inside Admin → Patrocinadores.
 *
 * Lets the admin configure how the public sponsor ribbon/carousel is displayed:
 *  - Drag-and-drop ordering of sponsor logos (uses @hello-pangea/dnd).
 *  - Randomize toggle: when on, the ribbon is shuffled on every page load
 *    and the manual order is ignored on the public site (kept here as a fallback).
 *  - Visible count: how many sponsor logos fit on screen in the ribbon at any
 *    given moment. Each slot gets `100% / visibleCount` of the container
 *    width on the public site. Lower values also speed up the scrolling
 *    animation slightly so the ribbon doesn't feel sluggish. 0 = auto sizing.
 *
 * Persisted server-side via `sponsors_config.carousel` in the site_config row.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  GalleryHorizontal,
  GripVertical,
  Loader2,
  Save,
  Shuffle,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteConfig, useSaveSiteConfig } from '@/hooks/useSiteConfig';
import { useToast } from '@/hooks/use-toast';
import { useSponsors } from '@/hooks/useTournamentData';
import SponsorLogoImage, { type SponsorLogoStatus } from '@/components/sponsors/SponsorLogoImage';

// ============= Constants =============

/** Default visibleCount used when nothing is stored yet (0 = "all") */
const DEFAULT_VISIBLE_COUNT = 0;

// ============= Helpers =============

/**
 * Reorder helper used by the drag-and-drop callback to move an item from one
 * index to another while preserving the rest of the list.
 */
const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// ============= Component =============

/**
 * AdminSponsorsCarousel
 * Drag-and-drop ordering + randomize toggle + visible-count selector for the
 * public sponsor ribbon. Saves to `site_config.sponsors_config.carousel`.
 */
const AdminSponsorsCarousel = () => {
  const { data: siteConfig, isLoading: isLoadingConfig } = useSiteConfig();
  const { data: sponsors = [], isLoading: isLoadingSponsors } = useSponsors();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();

  /** Saved carousel config (or sane defaults) */
  const savedCarousel = siteConfig?.sponsors_config?.carousel ?? {};

  /** Local draft state — order of sponsor IDs */
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  /** Local draft state — randomize on each page load */
  const [randomize, setRandomize] = useState<boolean>(false);
  /** Local draft state — number of logos FULLY visible in the viewport (0 = auto) */
  const [visibleCount, setVisibleCount] = useState<number>(DEFAULT_VISIBLE_COUNT);
  /**
   * Local draft state — set of sponsor IDs the admin has enabled for the ribbon.
   * The ribbon will only display sponsors whose ID is in this set. Null/undefined
   * server value is treated as "all enabled" on first load.
   */
  const [enabledIds, setEnabledIds] = useState<Set<number>>(new Set());

  /**
   * Sponsor IDs whose logo image failed to load. These are hidden from the
   * drag-and-drop list to mirror the public Patrocinadores page / ribbon
   * (sponsors without a working logo are not advertised anywhere).
   */
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());
  const handleStatus = useCallback((id: string, status: SponsorLogoStatus) => {
    setBrokenIds((prev) => {
      const isBroken = status === 'error';
      if (isBroken && prev.has(id)) return prev;
      if (!isBroken && !prev.has(id)) return prev;
      const next = new Set(prev);
      if (isBroken) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  /**
   * Sponsors with at least a `logoUrl` declared. We INCLUDE sponsors whose
   * image fails to load so the admin can still see and reorder them in the
   * list; their toggle is force-disabled and they are auto-excluded from the
   * `enabledIds` whitelist that the ribbon consumes.
   * Sponsors with no `logoUrl` at all are excluded from the editor entirely.
   */
  const renderableSponsors = useMemo(
    () => sponsors.filter((s) => Boolean(s.logoUrl)),
    [sponsors]
  );

  /** Subset that has a working logo (not in `brokenIds`). Used for whitelist enforcement. */
  const workingSponsors = useMemo(
    () => renderableSponsors.filter((s) => !brokenIds.has(String(s.id))),
    [renderableSponsors, brokenIds]
  );

  /**
   * Build the editor's working list by merging:
   *   - the saved order (filtered to existing sponsors),
   *   - any new sponsors not yet present in the order (appended at the end).
   * This keeps newly added sponsors visible without losing the admin's order.
   */
  useEffect(() => {
    if (renderableSponsors.length === 0) return;
    const sponsorIds = renderableSponsors.map((s) => Number(s.id));
    const workingIds = new Set(workingSponsors.map((s) => Number(s.id)));
    const savedOrder = (savedCarousel.order ?? []).filter((id) => sponsorIds.includes(id));
    const missing = sponsorIds.filter((id) => !savedOrder.includes(id));
    setOrderedIds([...savedOrder, ...missing]);
    setRandomize(Boolean(savedCarousel.randomize));
    setVisibleCount(savedCarousel.visibleCount ?? DEFAULT_VISIBLE_COUNT);
    // Enabled list: if the server has no whitelist yet, default to ALL WORKING sponsors enabled.
    // Broken-logo sponsors are always force-excluded from the whitelist.
    const savedEnabled = savedCarousel.enabledIds;
    if (savedEnabled && Array.isArray(savedEnabled)) {
      // Keep only IDs that still correspond to a WORKING sponsor.
      setEnabledIds(new Set(savedEnabled.filter((id) => workingIds.has(Number(id))).map(Number)));
    } else {
      setEnabledIds(new Set(workingIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderableSponsors, workingSponsors, siteConfig?.sponsors_config?.carousel]);

  /** Quick lookup: sponsor by ID (includes broken-logo sponsors) */
  const sponsorById = useMemo(() => {
    const map = new Map<number, (typeof sponsors)[number]>();
    renderableSponsors.forEach((s) => map.set(Number(s.id), s));
    return map;
  }, [renderableSponsors]);

  /** Total sponsors with a working logo (the only ones we show anywhere) */
  const totalSponsors = renderableSponsors.length;

  /** Sponsors with no logo at all — surfaced as a hint at the bottom */
  const missingLogoSponsors = useMemo(
    () => sponsors.filter((s) => !s.logoUrl || brokenIds.has(String(s.id))),
    [sponsors, brokenIds]
  );

  /** How many logos the admin has actually enabled (= rotate in the ribbon). */
  const enabledCount = enabledIds.size;

  /** How many logos will be FULLY visible on screen in the ribbon at any moment. */
  const onScreenLogos =
    visibleCount > 0 ? Math.min(visibleCount, Math.max(enabledCount, 1)) : Math.max(enabledCount, 1);

  /**
   * Human-readable label for the resulting scroll speed (mirrors the logic
   * applied in `SponsorRibbon`). Keeps admins informed without exposing
   * raw seconds.
   */
  const speedLabel =
    visibleCount === 1 ? 'rápida' :
    visibleCount === 2 ? 'rápida' :
    visibleCount === 3 ? 'moderada' :
    'estándar';

  /** Detect unsaved changes vs. server-stored config */
  const savedEnabledArray = Array.isArray(savedCarousel.enabledIds)
    ? [...savedCarousel.enabledIds].map(Number).sort((a, b) => a - b)
    : null;
  const draftEnabledArray = [...enabledIds].sort((a, b) => a - b);
  const hasChanges =
    JSON.stringify(orderedIds) !== JSON.stringify(savedCarousel.order ?? []) ||
    Boolean(savedCarousel.randomize) !== randomize ||
    (savedCarousel.visibleCount ?? DEFAULT_VISIBLE_COUNT) !== visibleCount ||
    JSON.stringify(savedEnabledArray) !== JSON.stringify(draftEnabledArray);

  /** DnD callback — applies the new order returned by react-beautiful-dnd */
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    setOrderedIds((prev) => reorder(prev, result.source.index, result.destination!.index));
  };

  /**
   * Persist the carousel config to the server, preserving any other sponsors_config
   * fields (columns, ribbonVisiblePages).
   */
  const handleSave = () => {
    saveSiteConfig.mutate(
      {
        password: 'admin2025',
        sponsors_config: {
          ...(siteConfig?.sponsors_config ?? { columns: 4 }),
          carousel: {
            order: orderedIds,
            randomize,
            visibleCount,
            enabledIds: [...enabledIds],
          },
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Carrusel guardado',
            description: randomize
              ? `Aleatorio activo. ${onScreenLogos} logo${onScreenLogos === 1 ? '' : 's'} en pantalla a la vez.`
              : `Orden personalizado guardado. ${onScreenLogos} logo${onScreenLogos === 1 ? '' : 's'} en pantalla a la vez.`,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GalleryHorizontal className="h-5 w-5 text-primary" />
          Carrusel de Patrocinadores
        </CardTitle>
        <CardDescription>
          Define el orden de los patrocinadores, activa la rotación aleatoria
          y elige cuántos logos caben en pantalla a la vez en el ribbon.
          Con menos logos visibles, el ribbon se mueve un poco más rápido.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoadingConfig || isLoadingSponsors ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando configuración...
          </div>
        ) : sponsors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No hay patrocinadores registrados para este torneo.
          </p>
        ) : (
          <>
            {/* Hidden probes: trigger image loads for ALL sponsors with a URL
                so we can detect broken logos and exclude them from the editor. */}
            <div className="hidden" aria-hidden="true">
              {sponsors
                .filter((s) => Boolean(s.logoUrl))
                .map((s) => (
                  <SponsorLogoImage
                    key={`probe-${s.id}`}
                    url={s.logoUrl}
                    alt={s.name}
                    onStatusChange={(status) => handleStatus(String(s.id), status)}
                  />
                ))}
            </div>

            {/* Header: status + Save button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-mono font-bold">{onScreenLogos}</span> logo
                {onScreenLogos === 1 ? '' : 's'} en pantalla a la vez · velocidad{' '}
                <span className="font-bold">{speedLabel}</span>
                {' · '}
                {randomize ? 'orden aleatorio' : 'orden personalizado'}
              </p>
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

            {/* Hint: sponsors excluded because they have no usable logo */}
            {missingLogoSponsors.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {missingLogoSponsors.length} patrocinador
                {missingLogoSponsors.length === 1 ? '' : 'es'} sin logo válido
                {missingLogoSponsors.length === 1 ? ' fue ocultado' : ' fueron ocultados'} del
                carrusel y de la página pública de Patrocinadores.
              </p>
            )}

            {/* Settings: randomize + visible count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Randomize toggle */}
              <label
                htmlFor="carousel-randomize"
                className={cn(
                  'flex items-center justify-between gap-3 px-4 py-3 rounded-md border border-border bg-background hover:bg-muted/50 cursor-pointer transition-colors',
                  randomize && 'border-primary/40 bg-primary/5'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Shuffle className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium">Orden aleatorio</span>
                    <span className="text-xs text-muted-foreground">
                      Cada visita muestra los logos en orden distinto.
                    </span>
                  </div>
                </div>
                <Switch
                  id="carousel-randomize"
                  checked={randomize}
                  onCheckedChange={setRandomize}
                />
              </label>

              {/* Visible count input */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-md border border-border bg-background">
                <div className="flex flex-col min-w-0">
                  <Label htmlFor="carousel-visible-count" className="text-sm font-medium">
                    Cantidad de logos visibles
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Logos completamente visibles en el ribbon a la vez. Logos
                    entrando/saliendo cuentan como parciales (ej. 0.5 + 2 + 0.5
                    = 3 visibles). 0 = tamaño automático.
                  </span>
                </div>
                <Input
                  id="carousel-visible-count"
                  type="number"
                  min={0}
                  max={Math.max(enabledCount, 1)}
                  value={visibleCount}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isNaN(v)) return;
                    setVisibleCount(Math.max(0, Math.min(v, Math.max(enabledCount, 1))));
                  }}
                  className="w-24 text-right font-mono"
                />
              </div>
            </div>

            {/* Drag-and-drop sponsor list */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Label className="text-sm">Orden y selección de logos</Label>
                  <p className="text-xs text-muted-foreground">
                    Arrastra para reordenar. Activa/desactiva el switch para
                    incluir o excluir cada logo del ribbon. Los logos
                    desactivados aparecen en gris y no rotan en el ribbon.
                  </p>
                </div>
                {/* Select all / none toggle */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const allIds = renderableSponsors.map((s) => Number(s.id));
                    if (enabledIds.size === allIds.length) {
                      setEnabledIds(new Set());
                    } else {
                      setEnabledIds(new Set(allIds));
                    }
                  }}
                >
                  {enabledIds.size === renderableSponsors.length ? (
                    <>
                      <ToggleRight className="h-4 w-4" />
                      Deseleccionar todos
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4" />
                      Seleccionar todos
                    </>
                  )}
                </Button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="carousel-list">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-1.5"
                    >
                      {orderedIds.map((id, index) => {
                        const sponsor = sponsorById.get(id);
                        if (!sponsor) return null;
                        const isEnabled = enabledIds.has(id);
                        return (
                          <Draggable
                            key={id}
                            draggableId={String(id)}
                            index={index}
                            isDragDisabled={randomize}
                          >
                            {(prov, snapshot) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                className={cn(
                                  'flex items-center gap-3 px-3 py-2 rounded-md border border-border bg-background',
                                  snapshot.isDragging && 'shadow-lg border-primary/40 bg-primary/5',
                                  randomize && 'opacity-60',
                                  !isEnabled && 'opacity-40 grayscale'
                                )}
                              >
                                {/* Drag handle */}
                                <button
                                  type="button"
                                  {...prov.dragHandleProps}
                                  className={cn(
                                    'shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
                                    randomize && 'cursor-not-allowed opacity-40'
                                  )}
                                  aria-label="Arrastrar para reordenar"
                                  disabled={randomize}
                                >
                                  <GripVertical className="h-4 w-4" />
                                </button>

                                {/* Position number */}
                                <span className="font-mono text-xs text-muted-foreground w-6 text-right shrink-0">
                                  {index + 1}
                                </span>

                                {/* Logo thumbnail */}
                                <div className="h-10 w-16 shrink-0 flex items-center justify-center bg-muted/30 border border-border/50 rounded">
                                  <SponsorLogoImage
                                    url={sponsor.logoUrl}
                                    alt={sponsor.name}
                                    showErrorPlaceholder
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>

                                {/* Sponsor name */}
                                <span
                                  className="text-sm font-medium truncate flex-1"
                                  title={sponsor.name}
                                >
                                  {sponsor.name}
                                </span>

                                {/* Per-sponsor enable toggle */}
                                <Switch
                                  checked={isEnabled}
                                  onCheckedChange={(checked) => {
                                    setEnabledIds((prev) => {
                                      const next = new Set(prev);
                                      if (checked) next.add(id);
                                      else next.delete(id);
                                      return next;
                                    });
                                  }}
                                  aria-label={`Mostrar ${sponsor.name} en el ribbon`}
                                />
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSponsorsCarousel;