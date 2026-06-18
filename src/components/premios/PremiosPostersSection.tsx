/**
 * PremiosPostersSection
 * -------------------------------------------------------------
 * Responsive poster grid + lightbox for the Premios page. Mirrors
 * AvisosPostersSection / AtraccionesSection so admins get a consistent
 * editorial workflow: drop images into `src/assets/premios/` (build-time
 * fallback) or upload them through Admin > Premios (server-side, takes
 * precedence), then tune column count / gap / order from the same admin
 * tab.
 *
 * Layout (cols + gap per breakpoint) is stored in
 * `site_config.premios_config` and exposed via `useSiteConfig`.
 */

import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteConfig, type PremiosConfig, type EventosGap } from '@/hooks/useSiteConfig';
import { applyOrder } from '@/lib/posterOrder';
import { useUploadsList } from '@/hooks/useUploads';
// Auto-discovered build-time premios posters (anything dropped into
// `src/assets/premios/`). Server-uploaded images take precedence at runtime.
import { PREMIOS_POSTERS as DISCOVERED_PREMIOS_POSTERS } from '@/lib/posterAssets';

/** Single poster card descriptor. */
interface PremioCard {
  src: string;
  alt: string;
}

/** Build-time fallback list (always present, even when no images uploaded). */
const BUILT_IN_PREMIOS_POSTERS: PremioCard[] = DISCOVERED_PREMIOS_POSTERS.map((p) => ({
  src: p.src,
  alt: p.alt,
}));

/** Exported for admin preview parity. */
export const PREMIOS_POSTERS: PremioCard[] = BUILT_IN_PREMIOS_POSTERS;

// ============= Layout helpers =============

/** Default layout used when no admin config has been saved yet. */
const DEFAULT_CONFIG: PremiosConfig = {
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
 * PremiosPostersSection
 * Public Premios page section: poster grid with lightbox + keyboard nav.
 */
const PremiosPostersSection = () => {
  const { data: siteConfig } = useSiteConfig();
  const cfg: PremiosConfig = {
    ...DEFAULT_CONFIG,
    ...(siteConfig?.premios_config ?? {}),
  };

  // Server-uploaded posters take precedence (live edits via /admin).
  const { data: uploadsData } = useUploadsList('premios');
  const serverPosters: PremioCard[] = (uploadsData?.files ?? []).map((f) => ({
    src: f.url,
    alt: f.alt,
  }));
  const sourcePosters: PremioCard[] = serverPosters.length > 0
    ? serverPosters
    : BUILT_IN_PREMIOS_POSTERS;

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

  const current = openIndex !== null ? orderedPosters[openIndex] : null;

  // Fallback: render nothing when no posters exist so the page can show
  // a "Próximamente" placeholder above.
  if (orderedPosters.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Premiación del Torneo
          </h2>
          <p className="text-muted-foreground">
            Trofeos, reconocimientos y premios especiales del torneo
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

      {/* Lightbox dialog */}
      <Dialog open={openIndex !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
        <DialogContent
          className={cn(
            'max-w-3xl w-[95vw] p-0 bg-transparent border-0 shadow-none',
            '[&>button]:hidden'
          )}
        >
          <DialogTitle className="sr-only">
            {current ? current.alt : 'Premio'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Vista ampliada del premio. Use las flechas para navegar.
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
              <img
                src={current.src}
                alt={current.alt}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
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

export default PremiosPostersSection;