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

const PageHero = ({ title, subtitle, backgroundImage, backgroundPosition }: PageHeroProps) => {
  return (
    <section className="relative py-28 md:py-36 lg:py-40 overflow-hidden">
      {/* Background */}
      {backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
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
