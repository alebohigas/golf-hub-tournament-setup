/**
 * MenusPostersSection
 * -------------------------------------------------------------
 * Renders a responsive grid of menu poster cards (comida, bebidas,
 * pricing tables, etc.). Mirrors `AtraccionesSection` (Eventos page) in
 * structure and behavior so the Menus page shares the same visual
 * language and lightbox UX.
 *
 * Each card displays a vertical poster (.webp) imported from
 * `src/assets/menus`. Clicking a card opens a lightbox dialog showing
 * the full image, with keyboard (← →) and on-screen navigation between
 * images.
 *
 * Design notes:
 *  - Uses semantic tokens only (bg-card, border-border, text-foreground...).
 *  - Aspect ratio is locked to 9/16 to match the source posters.
 *  - Lazy-loaded images for performance.
 *  - Layout (columns + gap per breakpoint) is controlled by the admin via
 *    `site_config.menus_config` and read through `useSiteConfig`.
 */

import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteConfig, type MenusConfig, type EventosGap } from '@/hooks/useSiteConfig';
import { applyOrder } from '@/lib/posterOrder';
import { useUploadsList } from '@/hooks/useUploads';
// Auto-discovered poster list — anything dropped into `src/assets/menus/`
// is picked up automatically (sorted alphabetically by file name). See
// `src/lib/posterAssets.ts` for the discovery rules.
import { MENUS_POSTERS as DISCOVERED_MENUS_POSTERS } from '@/lib/posterAssets';

/**
 * MenuCard - shape describing one poster card.
 * `src` : imported image module (string URL after Vite processing).
 * `alt` : accessibility label.
 */
interface MenuCard {
  src: string;
  alt: string;
}

/**
 * Ordered list of menu posters.
 *
 * The list is **auto-discovered** from `src/assets/menus/` via
 * `posterAssets.ts`, then mapped to the local `MenuCard` shape. To add
 * or remove a poster, simply drop / delete a `.webp` (or `.jpg`/`.png`)
 * file in that folder — no code edit required. Files are sorted in
 * case-insensitive natural order, so prefix names with numeric tokens
 * (e.g. `01-clima.webp`, `02-tabla.webp`) to control the default order.
 * The admin panel can still override the order at runtime.
 */
/**
 * Build-time fallback list. Used when no images have been uploaded to the
 * server yet — keeps the page functional out of the box.
 */
const BUILT_IN_MENUS_POSTERS: MenuCard[] = DISCOVERED_MENUS_POSTERS.map((p) => ({
  src: p.src,
  alt: p.alt,
}));

/** @deprecated Kept for backward-compat with any external imports. */
export const MENUS_POSTERS: MenuCard[] = BUILT_IN_MENUS_POSTERS;

// ============= Layout helpers =============

/** Default layout when no admin config is set */
const DEFAULT_CONFIG: MenusConfig = {
  desktopColumns: 3,
  mobileColumns: 1,
  desktopGap: 'md',
  mobileGap: 'sm',
};

/**
 * Static Tailwind class maps. Defined as full class strings so Tailwind's
 * JIT compiler can detect and include them in the build.
 */
const MOBILE_COL_CLASS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

const DESKTOP_COL_CLASS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

const MOBILE_GAP_CLASS: Record<EventosGap, string> = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const DESKTOP_GAP_CLASS: Record<EventosGap, string> = {
  sm: 'md:gap-2',
  md: 'md:gap-4',
  lg: 'md:gap-6',
  xl: 'md:gap-8',
};

/**
 * MenusPostersSection
 * Displays the poster grid + lightbox modal with keyboard navigation.
 */
const MenusPostersSection = () => {
  // Pull admin-configurable layout from site_config (with safe defaults).
  const { data: siteConfig } = useSiteConfig();
  const cfg: MenusConfig = {
    ...DEFAULT_CONFIG,
    ...(siteConfig?.menus_config ?? {}),
  };

  // Server-side uploaded posters. Take precedence over build-time assets so
  // editors can replace/extend the grid via /admin without a re-deploy.
  const { data: uploadsData } = useUploadsList('menus');
  const serverPosters: MenuCard[] = (uploadsData?.files ?? []).map((f) => ({
    src: f.url,
    alt: f.alt,
  }));
  const sourcePosters: MenuCard[] = serverPosters.length > 0
    ? serverPosters
    : BUILT_IN_MENUS_POSTERS;

  // Single shared poster order for desktop AND mobile. Falls back to the
  // legacy per-breakpoint fields (preferring desktopOrder) so previously
  // saved configs keep working without a migration.
  const activeOrder = cfg.posterOrder ?? cfg.desktopOrder ?? cfg.mobileOrder;
  const orderedPosters = applyOrder(sourcePosters, activeOrder);

  /**
   * Compose the responsive grid class string from the admin-selected
   * column counts and gap presets. Mobile = base, desktop = md: prefix.
   */
  const gridClass = cn(
    'grid',
    MOBILE_COL_CLASS[cfg.mobileColumns] ?? 'grid-cols-1',
    DESKTOP_COL_CLASS[cfg.desktopColumns] ?? 'md:grid-cols-3',
    MOBILE_GAP_CLASS[cfg.mobileGap] ?? 'gap-4',
    DESKTOP_GAP_CLASS[cfg.desktopGap] ?? 'md:gap-6'
  );

  // Index of the currently open image in the lightbox; null = closed.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Navigation helpers (memoized so they're stable for the keydown handler).
  const goPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + orderedPosters.length) % orderedPosters.length));
  }, [orderedPosters.length]);

  const goNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % orderedPosters.length));
  }, [orderedPosters.length]);

  // Keyboard navigation while the lightbox is open.
  useEffect(() => {
    if (openIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openIndex, goPrev, goNext]);

  const current = openIndex !== null ? orderedPosters[openIndex] : null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* ---------- Section header ---------- */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Menús
          </h2>
          <p className="text-muted-foreground">
            Consulta los menús disponibles durante el torneo
          </p>
        </div>

        {/* ---------- Responsive poster grid ---------- */}
        <div className={gridClass}>
          {orderedPosters.map((card, idx) => (
            <button
              key={card.src}
              type="button"
              onClick={() => setOpenIndex(idx)}
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border/50 bg-card',
                'shadow-card transition-all duration-300',
                'hover:shadow-elegant hover:-translate-y-1 hover:border-primary/40',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'
              )}
              aria-label={`Ver ${card.alt} en grande`}
            >
              {/*
                Use `object-contain` (not cover) so posters with slightly
                different aspect ratios than 9/16 — e.g. the climatological
                notice at 683x1024 vs the 576x1024 pricing tables — render
                completely without cropping or zoom-in artifacts. The card
                background fills any letterbox gap.
              */}
              <div className="aspect-[9/16] w-full overflow-hidden bg-card flex items-center justify-center">
                <img
                  src={card.src}
                  alt={card.alt}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Lightbox dialog ---------- */}
      <Dialog open={openIndex !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
        <DialogContent
          className={cn(
            'max-w-3xl w-[95vw] p-0 bg-transparent border-0 shadow-none',
            '[&>button]:hidden' // Hide the default Dialog close button; we render a custom one.
          )}
        >
          {/* Accessible label for screen readers */}
          <DialogTitle className="sr-only">
            {current ? current.alt : 'Menú'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Vista ampliada del menú. Use las flechas para navegar.
          </DialogDescription>
          {current && (
            <div className="relative">
              {/* Custom close button */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 z-10 rounded-full bg-background/80 backdrop-blur hover:bg-background"
                onClick={() => setOpenIndex(null)}
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Previous navigation button */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur hover:bg-background"
                onClick={goPrev}
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              {/* Next navigation button */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur hover:bg-background"
                onClick={goNext}
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Full-size image */}
              <img
                src={current.src}
                alt={current.alt}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />

              {/* Counter label */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-background/80 backdrop-blur text-xs text-foreground font-medium">
                {(openIndex ?? 0) + 1} / {orderedPosters.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MenusPostersSection;
