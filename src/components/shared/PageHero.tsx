interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

const PageHero = ({ title, subtitle, backgroundImage }: PageHeroProps) => {
  return (
    <section className="relative py-28 md:py-36 lg:py-40 overflow-hidden">
      {/* Background */}
      {backgroundImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-[center_40%]"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
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
