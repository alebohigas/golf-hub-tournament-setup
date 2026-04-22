/**
 * AtraccionesSection
 * -------------------------------------------------------------
 * Renders a responsive grid of attraction cards (one per tournament day).
 * Each card displays a vertical poster (.webp) imported from src/assets/eventos.
 * Clicking a card opens a lightbox dialog showing the full image, with
 * keyboard (← →) and on-screen navigation between images.
 *
 * Design notes:
 *  - Uses semantic tokens only (bg-card, border-border, text-foreground...).
 *  - Aspect ratio is locked to 9/16 to match the source posters.
 *  - Lazy-loaded images for performance.
 */

import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteConfig, type EventosConfig, type EventosGap } from '@/hooks/useSiteConfig';

// ---------- Asset imports (ES6 modules, optimized by Vite) ----------
import dia24 from '@/assets/eventos/dia-24-viernes.webp';
import dia25 from '@/assets/eventos/dia-25-sabado.webp';
import dia26 from '@/assets/eventos/dia-26-domingo.webp';
import dia27 from '@/assets/eventos/dia-27-lunes.webp';
import dia28 from '@/assets/eventos/dia-28-martes.webp';
import dia29 from '@/assets/eventos/dia-29-miercoles.webp';
import dia30 from '@/assets/eventos/dia-30-jueves.webp';
import dia01 from '@/assets/eventos/dia-01-viernes.webp';
import dia02 from '@/assets/eventos/dia-02-sabado.webp';

/**
 * AtraccionCard - shape describing one poster card.
 * `src`   : imported image module (string URL after Vite processing).
 * `alt`   : accessibility label.
 */
interface AtraccionCard {
  src: string;
  alt: string;
}

// Ordered list of posters (chronological day order).
const ATRACCIONES: AtraccionCard[] = [
  { src: dia24, alt: 'Atracciones del viernes 24 de abril' },
  { src: dia25, alt: 'Atracciones del sábado 25 de abril' },
  { src: dia26, alt: 'Atracciones del domingo 26 de abril' },
  { src: dia27, alt: 'Atracciones del lunes 27 de abril' },
  { src: dia28, alt: 'Atracciones del martes 28 de abril' },
  { src: dia29, alt: 'Atracciones del miércoles 29 de abril' },
  { src: dia30, alt: 'Atracciones del jueves 30 de abril' },
  { src: dia01, alt: 'Atracciones del viernes 1 de mayo' },
  { src: dia02, alt: 'Atracciones del sábado 2 de mayo' },
];

// ============= Layout helpers =============

/** Default layout when no admin config is set */
const DEFAULT_CONFIG: EventosConfig = {
  desktopColumns: 4,
  mobileColumns: 2,
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
 * AtraccionesSection
 * Displays the poster grid + lightbox modal with keyboard navigation.
 */
const AtraccionesSection = () => {
  // Pull admin-configurable layout from site_config (with safe defaults).
  const { data: siteConfig } = useSiteConfig();
  const cfg: EventosConfig = {
    ...DEFAULT_CONFIG,
    ...(siteConfig?.eventos_config ?? {}),
  };

  /**
   * Compose the responsive grid class string from the admin-selected
   * column counts and gap presets. Mobile = base, desktop = md: prefix.
   */
  const gridClass = cn(
    'grid',
    MOBILE_COL_CLASS[cfg.mobileColumns] ?? 'grid-cols-2',
    DESKTOP_COL_CLASS[cfg.desktopColumns] ?? 'md:grid-cols-4',
    MOBILE_GAP_CLASS[cfg.mobileGap] ?? 'gap-4',
    DESKTOP_GAP_CLASS[cfg.desktopGap] ?? 'md:gap-6'
  );

  // Index of the currently open image in the lightbox; null = closed.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Navigation helpers (memoized so they're stable for the keydown handler).
  const goPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + ATRACCIONES.length) % ATRACCIONES.length));
  }, []);

  const goNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % ATRACCIONES.length));
  }, []);

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

  const current = openIndex !== null ? ATRACCIONES[openIndex] : null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* ---------- Section header ---------- */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Atracciones del Torneo
          </h2>
          <p className="text-muted-foreground">
            Conciertos, rifas, comida y experiencias especiales día a día
          </p>
        </div>

        {/* ---------- Responsive poster grid ---------- */}
        <div className={gridClass}>
          {ATRACCIONES.map((card, idx) => (
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
              <div className="aspect-[9/16] w-full overflow-hidden bg-background">
                <img
                  src={card.src}
                  alt={card.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                {(openIndex ?? 0) + 1} / {ATRACCIONES.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AtraccionesSection;