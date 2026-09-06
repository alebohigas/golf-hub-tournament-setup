/**
 * HotelesPostersSection
 * -------------------------------------------------------------
 * Responsive poster grid + lightbox for the Hoteles page. Mirrors
 * PremiosPostersSection / AvisosPostersSection / AtraccionesSection /
 * MenusPostersSection so admins get a consistent editorial workflow: drop
 * images into `src/assets/hoteles/` (build-time fallback) or upload them
 * through Admin > Hoteles (server-side, takes precedence), then tune column
 * count / gap / order from the same admin tab.
 *
 * Layout (cols + gap per breakpoint) is stored in
 * `site_config.hoteles_config` and exposed via `useSiteConfig`.
 */

import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteConfig, type HotelesConfig, type EventosGap } from '@/hooks/useSiteConfig';
import { applyOrder } from '@/lib/posterOrder';
import { useUploadsList } from '@/hooks/useUploads';
// Auto-discovered build-time hoteles posters (anything dropped into
// `src/assets/hoteles/`). Server-uploaded images take precedence at runtime.
import { HOTELES_POSTERS as DISCOVERED_HOTELES_POSTERS } from '@/lib/posterAssets';

/** Single poster card descriptor. */
interface HotelCard {
  /** Full-resolution image URL (used by the lightbox). */
  src: string;
  /** Accessibility label. */
  alt: string;
  /** ~480px WebP thumbnail for the grid card (optional). */
  thumbSmall?: string;
  /** ~1000px WebP thumbnail — lightbox placeholder while `src` loads. */
  thumbMedium?: string;
}

/** Build-time fallback list (always present, even when no images uploaded). */
const BUILT_IN_HOTELES_POSTERS: HotelCard[] = DISCOVERED_HOTELES_POSTERS.map((p) => ({
  src: p.src,
  alt: p.alt,
}));

/** Exported for admin preview parity. */
export const HOTELES_POSTERS: HotelCard[] = BUILT_IN_HOTELES_POSTERS;

// ============= Layout helpers =============

/** Default layout used when no admin config has been saved yet. */
const DEFAULT_CONFIG: HotelesConfig = {
  desktopColumns: 3,
  mobileColumns: 1,
  desktopGap: 'md',
  mobileGap: 'sm',
};

/** Static Tailwind class maps — full strings so JIT can detect them. */
const MOBILE_COL_CLASS: Record<number, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4',
};
const DESKTOP_COL_CLASS: Record<number, string> = {
  1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4',
};
const MOBILE_GAP_CLASS: Record<EventosGap, string> = {
  sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-8',
};
const DESKTOP_GAP_CLASS: Record<EventosGap, string> = {
  sm: 'md:gap-2', md: 'md:gap-4', lg: 'md:gap-6', xl: 'md:gap-8',
};

/**
 * HotelesPostersSection
 * Public Hoteles page section: poster grid with lightbox + keyboard nav.
 */
const HotelesPostersSection = () => {
  const { data: siteConfig } = useSiteConfig();
  const cfg: HotelesConfig = {
    ...DEFAULT_CONFIG,
    ...(siteConfig?.hoteles_config ?? {}),
  };

  // Server-uploaded posters take precedence (live edits via /admin).
  const { data: uploadsData } = useUploadsList('hoteles');
  // Server-generated thumbnails (see server/api/_thumbs.php) keep the grid
  // light: cards load the ~480px variant instead of the multi-MB poster.
  const serverPosters: HotelCard[] = (uploadsData?.files ?? []).map((f) => ({
    src: f.url,
    alt: f.alt,
    thumbSmall: f.thumbs?.small ?? f.thumbUrl ?? undefined,
    thumbMedium: f.thumbs?.medium ?? undefined,
  }));
  const sourcePosters: HotelCard[] = serverPosters.length > 0
    ? serverPosters
    : BUILT_IN_HOTELES_POSTERS;

  const activeOrder = cfg.posterOrder ?? cfg.desktopOrder ?? cfg.mobileOrder;
  const orderedPosters = applyOrder(sourcePosters, activeOrder);

  const gridClass = cn(
    'grid',
    MOBILE_COL_CLASS[cfg.mobileColumns] ?? 'grid-cols-1',
    DESKTOP_COL_CLASS[cfg.desktopColumns] ?? 'md:grid-cols-3',
    MOBILE_GAP_CLASS[cfg.mobileGap] ?? 'gap-4',
    DESKTOP_GAP_CLASS[cfg.desktopGap] ?? 'md:gap-6'
  );

  // Lightbox state: index of currently open poster or null when closed.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const goPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + orderedPosters.length) % orderedPosters.length));
  }, [orderedPosters.length]);

  const goNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % orderedPosters.length));
  }, [orderedPosters.length]);

  useEffect(() => {
    if (openIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openIndex, goPrev, goNext]);

  /**
   * Set of poster URLs whose grid thumbnail has finished decoding. Used to
   * cross-fade each card in and hide its skeleton placeholder.
   */
  const [loadedCards, setLoadedCards] = useState<Set<string>>(() => new Set());

  /** Mark one card as loaded (idempotent — never re-renders twice per image). */
  const markLoaded = useCallback((src: string) => {
    setLoadedCards((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));
  }, []);

  const current = openIndex !== null ? orderedPosters[openIndex] : null;

  /**
   * True once the full-resolution image of the currently open poster has
   * finished downloading. Until then the lightbox shows the medium
   * thumbnail, so opening a poster feels instant.
   */
  const [fullLoaded, setFullLoaded] = useState(false);

  useEffect(() => {
    if (!current) return;
    setFullLoaded(false);
    const img = new Image();
    img.onload = () => setFullLoaded(true);
    img.src = current.src;
    // Already in the HTTP cache → resolve synchronously.
    if (img.complete) setFullLoaded(true);
    return () => {
      img.onload = null;
    };
  }, [current?.src]);

  /**
   * Prefetch the medium thumbnails of the previous/next posters while the
   * lightbox is open, so ← → navigation paints without a blank frame.
   */
  useEffect(() => {
    if (openIndex === null || orderedPosters.length < 2) return;
    const neighbours = [
      orderedPosters[(openIndex + 1) % orderedPosters.length],
      orderedPosters[(openIndex - 1 + orderedPosters.length) % orderedPosters.length],
    ];
    const imgs = neighbours.map((n) => {
      const img = new Image();
      img.src = n.thumbMedium ?? n.src;
      return img;
    });
    return () => {
      imgs.forEach((img) => { img.src = ''; });
    };
  }, [openIndex, orderedPosters]);

  // Fallback: render nothing when no posters exist so the page can show
  // a "Próximamente" placeholder above.
  if (orderedPosters.length === 0) return null;

  return (
    <section className="py-8 md:py-16 bg-muted/30">
      <div className="container mx-auto px-2 md:px-4">
        {/* Section header */}
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Hoteles Recomendados
          </h2>
          <p className="text-muted-foreground">
            Hospedaje con promociones especiales para participantes del torneo
          </p>
        </div>

        {/* Responsive poster grid */}
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
                Mobile: drop the fixed 9/16 box so the poster fills the full
                card width with its natural height — no letterbox padding
                above/below. Desktop keeps a 3/4 ratio so the multi-column
                grid stays uniform; `object-cover` trims edges but fills the
                frame.
              */}
              <div className="relative w-full min-h-[200px] overflow-hidden bg-card md:aspect-[3/4]">
                {/*
                  Skeleton placeholder: a shimmering muted block that occupies
                  the card box until the thumbnail decodes. On mobile it is
                  pinned while the natural-height image loads; on desktop it
                  fills the fixed 3/4 box.
                */}
                {!loadedCards.has(card.src) && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted/60 to-muted"
                  />
                )}
                {/*
                  Prefer the generated thumbnails. `srcSet` lets the browser
                  pick the 480px variant on phones/cards and the 1000px one on
                  wide, few-column layouts; `src` stays as a safe fallback for
                  build-time assets or servers without GD.
                */}
                <img
                  src={card.thumbSmall ?? card.src}
                  srcSet={
                    card.thumbSmall && card.thumbMedium
                      ? `${card.thumbSmall} 480w, ${card.thumbMedium} 1000w`
                      : undefined
                  }
                  sizes="(max-width: 768px) 100vw, 33vw"
                  alt={card.alt}
                  /* First two cards are above the fold on every layout →
                     load them eagerly with high priority; the rest wait for
                     the viewport (native lazy loading). */
                  loading={idx < 2 ? 'eager' : 'lazy'}
                  fetchPriority={idx < 2 ? 'high' : 'low'}
                  decoding="async"
                  onLoad={() => markLoaded(card.src)}
                  onError={() => markLoaded(card.src)}
                  className={cn(
                    'relative w-full h-auto object-contain',
                    'md:absolute md:inset-0 md:h-full md:w-full md:object-cover',
                    'transition-[opacity,transform] duration-500 group-hover:scale-105',
                    loadedCards.has(card.src) ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox dialog */}
      <Dialog open={openIndex !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
        <DialogContent
          className={cn(
            'max-w-3xl w-[95vw] p-0 bg-transparent border-0 shadow-none',
            '[&>button]:hidden'
          )}
        >
          <DialogTitle className="sr-only">
            {current ? current.alt : 'Hotel'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Vista ampliada del hotel. Use las flechas para navegar.
          </DialogDescription>
          {current && (
            <div className="relative">
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 z-10 rounded-full bg-background/80 backdrop-blur hover:bg-background"
                onClick={() => setOpenIndex(null)}
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur hover:bg-background"
                onClick={goPrev}
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur hover:bg-background"
                onClick={goNext}
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/*
                Progressive lightbox image: the already-cached medium
                thumbnail paints immediately, then the full-resolution file
                swaps in once decoded (see `fullLoaded`).
              */}
              {/* Placeholder behind the image: keeps the dialog from showing
                  a transparent hole before the first byte paints. */}
              {!fullLoaded && !current.thumbMedium && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 animate-pulse rounded-lg bg-muted/70"
                />
              )}
              <img
                src={fullLoaded || !current.thumbMedium ? current.src : current.thumbMedium}
                alt={current.alt}
                decoding="async"
                fetchPriority="high"
                className="relative w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
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

export default HotelesPostersSection;
