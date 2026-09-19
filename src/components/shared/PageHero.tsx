import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useHeroOverride } from '@/hooks/useHeroOverride';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  /**
   * CSS background-position for the hero image. Defaults to 'center 40%'
   * (slightly above center). Pass any valid CSS position string, e.g.
   * 'center 60%' to favor the lower part of the image.
   */
  backgroundPosition?: string;
}

/** Desktop breakpoint where the hero adapts to the image real height. */
const DESKTOP_MIN_WIDTH = 1024;
/** Maximum desktop hero height in pixels. Taller images are clamped here. */
const MAX_HERO_HEIGHT = 2100;
/** Minimum height for a hero that has an image, so very short images still
 *  leave room for the title and subtitle. */
const MIN_HERO_HEIGHT_WITH_IMAGE = 300;

/**
 * PageHero — section header with a background image.
 *
 * Desktop behavior (>=1024px):
 *   - The section height follows the natural proportions of the background
 *     image when it is stretched to the full container width.
 *   - The height is capped at MAX_HERO_HEIGHT (2100px). If the scaled image
 *     would be taller, the container is clamped to that maximum.
 *   - Shorter images keep their calculated height, so the picture fits
 *     perfectly without unnecessary vertical cropping.
 *   - If no image is configured, the legacy gradient + padding fallback is
 *     used.
 *
 * Mobile / tablet behavior:
 *   - Keeps the original responsive padding (py-28 md:py-36 lg:py-40) so
 *     text remains readable and the background continues to use bg-cover.
 */
const PageHero = ({ title, subtitle, backgroundImage, backgroundPosition }: PageHeroProps) => {
  /**
   * Per-tournament hero override (Admin > Heros). Keyed by the current route
   * pathname, so any page using PageHero picks it up without extra props.
   * Falls back to the bundled `backgroundImage` when there is no active
   * override for this tournament.
   */
  const { pathname } = useLocation();
  const override = useHeroOverride(pathname);
  const effectiveImage = override || backgroundImage;

  /** Ref to the section so we can read its rendered width. */
  const sectionRef = useRef<HTMLElement>(null);
  /**
   * Dynamic desktop height, in pixels. `null` means:
   *   - the viewport is not desktop, or
   *   - no image is configured, or
   *   - the image has not been measured yet / failed to load.
   */
  const [desktopHeight, setDesktopHeight] = useState<number | null>(null);

  /**
   * Measures the background image natural size and recomputes the section
   * height for desktop viewports. Runs on mount, image change, route change
   * and window resize.
   */
  useEffect(() => {
    if (!effectiveImage) {
      setDesktopHeight(null);
      return;
    }

    let cancelled = false;

    const computeHeight = () => {
      const section = sectionRef.current;
      if (!section) return;

      const isDesktop = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches;
      if (!isDesktop) {
        setDesktopHeight(null);
        return;
      }

      const containerWidth = section.clientWidth;
      if (!containerWidth) return;

      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        if (!img.naturalWidth || !img.naturalHeight) {
          setDesktopHeight(null);
          return;
        }
        const ratio = img.naturalHeight / img.naturalWidth;
        const scaledHeight = Math.round(containerWidth * ratio);
        setDesktopHeight(Math.max(Math.min(scaledHeight, MAX_HERO_HEIGHT), MIN_HERO_HEIGHT_WITH_IMAGE));
      };
      img.onerror = () => {
        if (!cancelled) setDesktopHeight(null);
      };
      img.src = effectiveImage;
    };

    computeHeight();
    const handleResize = () => computeHeight();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
    };
  }, [effectiveImage, pathname]);

  /** `true` only when we are on desktop and already know the image height. */
  const hasDynamicHeight = desktopHeight !== null && desktopHeight > 0;

  return (
    <section
      ref={sectionRef}
      className={
        `relative overflow-hidden flex items-center justify-center ` +
        (hasDynamicHeight
          ? `py-0`
          : `py-28 md:py-36 lg:py-40`)
      }
      style={hasDynamicHeight ? { minHeight: desktopHeight } : undefined}
    >
      {/* Background */}
      {effectiveImage ? (
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: `url('${effectiveImage}')`,
            // Apply explicit position override when provided; otherwise
            // keep the legacy default of slightly-above-center (40%).
            backgroundPosition: backgroundPosition ?? 'center 40%',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-golf-dark/70 via-golf-dark/60 to-golf-dark/90" />
        </div>
      ) : (
        <div className="absolute inset-0 gradient-hero" />
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-4 animate-fade-in-up">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};

export default PageHero;
