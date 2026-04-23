/**
 * AdminEventos Component
 * -------------------------------------------------------------
 * Admin tab for configuring the Eventos page poster grid.
 *
 * Features:
 *  - Independent column count (1–4) for desktop and mobile.
 *  - Independent gap preset (sm/md/lg/xl) for desktop and mobile.
 *  - Live preview frames simulating both desktop (~1280px) and mobile
 *    (~390px) widths, mirroring the AdminSponsorsPreview pattern.
 *  - Persists settings server-side via `site_config.eventos_config`.
 *
 * The public Eventos page (`AtraccionesSection`) reads this config from
 * `useSiteConfig` and applies the appropriate columns/gap per breakpoint.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  CalendarDays,
  Save,
  CheckCircle2,
  Monitor,
  Smartphone,
  GripVertical,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSiteConfig,
  useSaveSiteConfig,
  type EventosConfig,
  type EventosGap,
} from '@/hooks/useSiteConfig';
import { useToast } from '@/hooks/use-toast';
import { resolveOrder, identityOrder } from '@/lib/posterOrder';

// ---------- Asset imports (same posters used on the public page) ----------
import dia24 from '@/assets/eventos/dia-24-viernes.webp';
import dia25 from '@/assets/eventos/dia-25-sabado.webp';
import dia26 from '@/assets/eventos/dia-26-domingo.webp';
import dia27 from '@/assets/eventos/dia-27-lunes.webp';
import dia28 from '@/assets/eventos/dia-28-martes.webp';
import dia29 from '@/assets/eventos/dia-29-miercoles.webp';
import dia30 from '@/assets/eventos/dia-30-jueves.webp';
import dia01 from '@/assets/eventos/dia-01-viernes.webp';
import dia02 from '@/assets/eventos/dia-02-sabado.webp';

// ============= Constants =============

/** Allowed column counts (per the user-confirmed range 1–4) */
const COLUMN_OPTIONS = [1, 2, 3, 4] as const;

/** Gap preset options: label + Tailwind-equivalent pixel value used in preview */
const GAP_OPTIONS: { value: EventosGap; label: string; px: number }[] = [
  { value: 'sm', label: 'SM', px: 8 },
  { value: 'md', label: 'MD', px: 16 },
  { value: 'lg', label: 'LG', px: 24 },
  { value: 'xl', label: 'XL', px: 32 },
];

/** Default config when nothing is stored on the server yet */
export const DEFAULT_EVENTOS_CONFIG: EventosConfig = {
  desktopColumns: 4,
  mobileColumns: 2,
  desktopGap: 'md',
  mobileGap: 'sm',
};

/** Posters used in the live preview (mirrors AtraccionesSection) */
const PREVIEW_POSTERS = [
  dia24, dia25, dia26, dia27, dia28, dia29, dia30, dia01, dia02,
];

// ============= Helpers =============

/** Get the px value of a gap preset (used inline for accurate preview spacing) */
const gapToPx = (g: EventosGap) =>
  GAP_OPTIONS.find((opt) => opt.value === g)?.px ?? 16;

// ============= Sub-component: Column / Gap selector =============

interface SelectorRowProps {
  label: string;
  columns: number;
  gap: EventosGap;
  onColumnsChange: (n: number) => void;
  onGapChange: (g: EventosGap) => void;
}

/**
 * SelectorRow
 * Renders the column-count and gap pickers for one breakpoint (desktop or mobile).
 */
const SelectorRow = ({
  label,
  columns,
  gap,
  onColumnsChange,
  onGapChange,
}: SelectorRowProps) => (
  <div className="space-y-3">
    <Label className="text-sm font-semibold">{label}</Label>

    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Columnas</Label>
      <div className="flex flex-wrap gap-2">
        {COLUMN_OPTIONS.map((opt) => (
          <Button
            key={opt}
            variant={columns === opt ? 'default' : 'outline'}
            size="sm"
            onClick={() => onColumnsChange(opt)}
            className={cn('min-w-[2.75rem]', columns === opt && 'pointer-events-none')}
          >
            {opt}
          </Button>
        ))}
      </div>
    </div>

    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Espaciado</Label>
      <div className="flex flex-wrap gap-2">
        {GAP_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={gap === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onGapChange(opt.value)}
            className={cn('min-w-[2.75rem]', gap === opt.value && 'pointer-events-none')}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  </div>
);

// ============= Sub-component: Preview Frame =============

interface PreviewFrameProps {
  /** Frame width in pixels — simulates the device viewport */
  frameWidth: number;
  /** Number of grid columns to render */
  columns: number;
  /** Spacing preset between cards */
  gap: EventosGap;
  /** Header label rendered above the frame */
  title: string;
  /** Icon component shown next to the title */
  icon: React.ReactNode;
  /**
   * Resolved poster order (full list of indices into PREVIEW_POSTERS).
   * The component renders posters strictly in this order. Drag-and-drop
   * mutates this list via `onOrderChange`.
   */
  order: number[];
  /** Called with a NEW order array whenever the admin drags a poster. */
  onOrderChange: (next: number[]) => void;
  /**
   * Stable id used to scope this frame's Droppable. Must be unique within
   * the page so drops aren't accepted across breakpoints (we want desktop
   * and mobile orderings to stay independent).
   */
  droppableId: string;
  /** Optional handler to restore the default static order. */
  onReset?: () => void;
}

/**
 * PreviewFrame
 * Fixed-width container that renders the poster grid exactly as it will
 * appear on the public page for the corresponding breakpoint.
 *
 * Drag-and-drop: each poster has a small grip handle in the top-left.
 * Reordering only updates the local draft state — the admin must press
 * "Guardar cambios" to persist it to `site_config.eventos_config`.
 */
const PreviewFrame = ({
  frameWidth,
  columns,
  gap,
  title,
  icon,
  order,
  onOrderChange,
  droppableId,
  onReset,
}: PreviewFrameProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{title}</span>
        <span className="text-xs">({frameWidth}px)</span>
      </div>
      {onReset && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="gap-1 h-7 text-xs"
          title="Restaurar orden original"
        >
          <RotateCcw className="h-3 w-3" />
          Restablecer
        </Button>
      )}
    </div>

    {/* Outer scroll container so the desktop frame stays visible on small admin screens */}
    <div className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-3">
      <div
        className="mx-auto bg-background rounded-md p-3 shadow-inner"
        style={{ width: frameWidth, maxWidth: '100%' }}
      >
        <DragDropContext
          onDragEnd={(result: DropResult) => {
            // No drop target or unchanged position → no-op.
            if (!result.destination) return;
            if (result.destination.index === result.source.index) return;
            const next = order.slice();
            const [moved] = next.splice(result.source.index, 1);
            next.splice(result.destination.index, 0, moved);
            onOrderChange(next);
          }}
        >
          {/*
            NOTE: We intentionally omit `direction` here. @hello-pangea/dnd
            does not have a true "grid" mode, but the default (vertical)
            mode computes drop targets by distance to each draggable's
            center — which works correctly for multi-row grids. Setting
            `direction="horizontal"` collapses everything onto a single
            row, which breaks reordering across rows (drops to row 2 get
            interpreted as positions inside row 1).
          */}
          <Droppable droppableId={droppableId}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: `${gapToPx(gap)}px`,
                }}
              >
                {order.map((posterIdx, position) => {
                  const src = PREVIEW_POSTERS[posterIdx];
                  if (!src) return null;
                  return (
                    <Draggable
                      key={posterIdx}
                      draggableId={`${droppableId}-${posterIdx}`}
                      index={position}
                    >
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={cn(
                            'relative aspect-[9/16] overflow-hidden rounded-md border bg-card',
                            snapshot.isDragging
                              ? 'border-primary ring-2 ring-primary shadow-lg'
                              : 'border-border/50'
                          )}
                        >
                          {/* Drag handle: small grip overlay in the top-left */}
                          <div
                            {...dragProvided.dragHandleProps}
                            className="absolute top-1 left-1 z-10 p-1 rounded bg-background/80 backdrop-blur-sm text-foreground/80 hover:text-foreground hover:bg-background cursor-grab active:cursor-grabbing"
                            title="Arrastra para reordenar"
                            aria-label="Arrastra para reordenar este póster"
                          >
                            <GripVertical className="h-3 w-3" />
                          </div>
                          {/* Position badge bottom-right for quick visual reference */}
                          <div className="absolute bottom-1 right-1 z-10 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm text-[10px] font-mono font-bold text-foreground">
                            {position + 1}
                          </div>
                          <img
                            src={src}
                            alt={`Poster ${posterIdx + 1}`}
                            loading="lazy"
                            className="h-full w-full object-cover pointer-events-none"
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
    </div>
  </div>
);

// ============= Main Component =============

/**
 * AdminEventos
 * Top-level admin section: selectors + dual preview + save action.
 */
const AdminEventos = () => {
  const { data: siteConfig, isLoading } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();

  /** Local draft state — starts from server value or defaults */
  const [draft, setDraft] = useState<EventosConfig>(DEFAULT_EVENTOS_CONFIG);

  // Sync local draft whenever the server config (re)loads
  useEffect(() => {
    if (siteConfig?.eventos_config) {
      setDraft({ ...DEFAULT_EVENTOS_CONFIG, ...siteConfig.eventos_config });
    }
  }, [siteConfig?.eventos_config]);

  /** Detect unsaved changes vs. server state */
  const savedConfig = siteConfig?.eventos_config ?? DEFAULT_EVENTOS_CONFIG;

  /**
   * Single, shared poster order used by BOTH desktop and mobile previews
   * (and by the public site at every breakpoint). Falls back to the legacy
   * per-breakpoint fields when reading a config saved before unification.
   */
  const posterOrder = useMemo(
    () =>
      resolveOrder(
        PREVIEW_POSTERS.length,
        draft.posterOrder ?? draft.desktopOrder ?? draft.mobileOrder
      ),
    [draft.posterOrder, draft.desktopOrder, draft.mobileOrder]
  );
  const savedPosterOrder = useMemo(
    () =>
      resolveOrder(
        PREVIEW_POSTERS.length,
        savedConfig.posterOrder ?? savedConfig.desktopOrder ?? savedConfig.mobileOrder
      ),
    [savedConfig.posterOrder, savedConfig.desktopOrder, savedConfig.mobileOrder]
  );

  /** Compare two number arrays for equality (used to detect order changes) */
  const arraysEqual = (a: number[], b: number[]) =>
    a.length === b.length && a.every((v, i) => v === b[i]);

  const hasChanges = useMemo(
    () =>
      draft.desktopColumns !== savedConfig.desktopColumns ||
      draft.mobileColumns !== savedConfig.mobileColumns ||
      draft.desktopGap !== savedConfig.desktopGap ||
      draft.mobileGap !== savedConfig.mobileGap ||
      !arraysEqual(posterOrder, savedPosterOrder),
    [draft, savedConfig, posterOrder, savedPosterOrder]
  );

  /** Persist current draft to the server */
  const handleSave = () => {
    saveSiteConfig.mutate(
      {
        password: 'admin2025',
        // Always send a fully-resolved shared order so partial drafts
        // don't drift. Legacy per-breakpoint fields are dropped on save.
        eventos_config: {
          desktopColumns: draft.desktopColumns,
          mobileColumns: draft.mobileColumns,
          desktopGap: draft.desktopGap,
          mobileGap: draft.mobileGap,
          posterOrder,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Configuración guardada',
            description: `Eventos: Desktop ${draft.desktopColumns} col / Mobile ${draft.mobileColumns} col.`,
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
          <CalendarDays className="h-5 w-5 text-primary" />
          Configuración de Eventos
        </CardTitle>
        <CardDescription>
          Define la cantidad de columnas y el espaciado del grid de atracciones.
          Desktop y móvil se configuran por separado. Menos columnas = imágenes más grandes.
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
            {/* Saved value indicator */}
            <p className="text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Guardado:&nbsp;
              <span className="font-mono font-bold">
                Desktop {savedConfig.desktopColumns}c/{savedConfig.desktopGap}
              </span>
              &nbsp;·&nbsp;
              <span className="font-mono font-bold">
                Mobile {savedConfig.mobileColumns}c/{savedConfig.mobileGap}
              </span>
            </p>

            {/* Selectors: side-by-side on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg border border-border bg-muted/20">
              <SelectorRow
                label="🖥️ Desktop"
                columns={draft.desktopColumns}
                gap={draft.desktopGap}
                onColumnsChange={(n) => setDraft((d) => ({ ...d, desktopColumns: n }))}
                onGapChange={(g) => setDraft((d) => ({ ...d, desktopGap: g }))}
              />
              <SelectorRow
                label="📱 Mobile"
                columns={draft.mobileColumns}
                gap={draft.mobileGap}
                onColumnsChange={(n) => setDraft((d) => ({ ...d, mobileColumns: n }))}
                onGapChange={(g) => setDraft((d) => ({ ...d, mobileGap: g }))}
              />
            </div>

            {/* Save button */}
            <div className="flex justify-end">
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

            {/* Dual preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="text-sm text-muted-foreground">
                  Vista previa en vivo · arrastra los pósters para reordenarlos
                </Label>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <PreviewFrame
                  frameWidth={1100}
                  columns={draft.desktopColumns}
                  gap={draft.desktopGap}
                  title="Desktop"
                  icon={<Monitor className="h-4 w-4" />}
                  droppableId="eventos-desktop-preview"
                  order={desktopOrder}
                  onOrderChange={(next) =>
                    setDraft((d) => ({ ...d, desktopOrder: next }))
                  }
                  onReset={() =>
                    setDraft((d) => ({
                      ...d,
                      desktopOrder: identityOrder(PREVIEW_POSTERS.length),
                    }))
                  }
                />
                <PreviewFrame
                  frameWidth={390}
                  columns={draft.mobileColumns}
                  gap={draft.mobileGap}
                  title="Mobile"
                  icon={<Smartphone className="h-4 w-4" />}
                  droppableId="eventos-mobile-preview"
                  order={mobileOrder}
                  onOrderChange={(next) =>
                    setDraft((d) => ({ ...d, mobileOrder: next }))
                  }
                  onReset={() =>
                    setDraft((d) => ({
                      ...d,
                      mobileOrder: identityOrder(PREVIEW_POSTERS.length),
                    }))
                  }
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminEventos;