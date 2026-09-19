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

/**
 * PageHero — section header with a background image.
 * Keeps the original fixed responsive spacing on every viewport; poster
 * sizing rules belong only to the Avisos, Menús, Eventos and Premios grids.
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

  return (
    <section className="relative overflow-hidden flex items-center justify-center py-28 md:py-36 lg:py-40">
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
