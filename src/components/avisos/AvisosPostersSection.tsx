/**
 * AvisosPostersSection
 * -------------------------------------------------------------
 * Renders a responsive grid of aviso poster cards (climatological notice,
 * pricing tables, etc.). Mirrors `AtraccionesSection` (Eventos page) in
 * structure and behavior so the Avisos page shares the same visual
 * language and lightbox UX.
 *
 * Each card displays a vertical poster (.webp) imported from
 * `src/assets/avisos`. Clicking a card opens a lightbox dialog showing
 * the full image, with keyboard (← →) and on-screen navigation between
 * images.
 *
 * Design notes:
 *  - Uses semantic tokens only (bg-card, border-border, text-foreground...).
 *  - Aspect ratio is locked to 9/16 to match the source posters.
 *  - Lazy-loaded images for performance.
 *  - Layout (columns + gap per breakpoint) is controlled by the admin via
 *    `site_config.avisos_config` and read through `useSiteConfig`.
 */

import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteConfig, type AvisosConfig, type EventosGap } from '@/hooks/useSiteConfig';
import { applyOrder } from '@/lib/posterOrder';
import { useIsMobile } from '@/hooks/use-mobile';

// ---------- Asset imports (ES6 modules, optimized by Vite) ----------
import avisoClima from '@/assets/avisos/aviso-climatologico.webp';
import tabla1 from '@/assets/avisos/tabla1-torneo-anual.webp';
import tabla2 from '@/assets/avisos/tabla2-asociados.webp';
import tabla3 from '@/assets/avisos/tabla3-dependientes.webp';
import tabla4 from '@/assets/avisos/tabla4-invitados.webp';
import tabla5 from '@/assets/avisos/tabla5-info-adicional.webp';

/**
 * AvisoCard - shape describing one poster card.
 * `src` : imported image module (string URL after Vite processing).
 * `alt` : accessibility label.
 */
interface AvisoCard {
  src: string;
  alt: string;
}

/**
 * Ordered list of aviso posters. Order matters: the climatological notice
 * is shown first as it is the most time-sensitive communication.
 */
export const AVISOS_POSTERS: AvisoCard[] = [
  { src: avisoClima, alt: 'Aviso climatológico a jugadores' },
  { src: tabla1, alt: 'Torneo Anual (Obligatorio) - Costos' },
  { src: tabla2, alt: 'Inscripción Torneo de Golf Asociados (Opcional)' },
  { src: tabla3, alt: 'Acceso diario para dependientes registrados' },
  { src: tabla4, alt: 'Inscripción Torneo de Golf Invitados' },
  { src: tabla5, alt: 'Información adicional, Family Day y reglas de invitados' },
];

// ============= Layout helpers =============

/** Default layout when no admin config is set */
const DEFAULT_CONFIG: AvisosConfig = {
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
 * AvisosPostersSection
 * Displays the poster grid + lightbox modal with keyboard navigation.
 */
const AvisosPostersSection = () => {
  // Pull admin-configurable layout from site_config (with safe defaults).
  const { data: siteConfig } = useSiteConfig();
  const cfg: AvisosConfig = {
    ...DEFAULT_CONFIG,
    ...(siteConfig?.avisos_config ?? {}),
  };

  // Pick the active poster order based on the current breakpoint. Mobile
  // and desktop have independent orderings so the admin can tune each.
  const isMobile = useIsMobile();
  const activeOrder = isMobile ? cfg.mobileOrder : cfg.desktopOrder;
  const orderedPosters = applyOrder(AVISOS_POSTERS, activeOrder);

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
            Comunicados y Costos del Torneo
          </h2>
          <p className="text-muted-foreground">
            Avisos importantes, tablas de inscripción y accesos para participantes
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
            {current ? current.alt : 'Aviso'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Vista ampliada del aviso. Use las flechas para navegar.
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

export default AvisosPostersSection;