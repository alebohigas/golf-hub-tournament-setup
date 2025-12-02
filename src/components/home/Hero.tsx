import { tournamentInfo } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const formatDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    return `Del ${startDate.toLocaleDateString('es-MX', options)} al ${endDate.toLocaleDateString('es-MX', { ...options, year: 'numeric' })}`;
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-golf-dark/70 via-golf-dark/50 to-golf-dark/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Tournament Logo/Number */}
          <div className="mb-6 animate-fade-in-up">
            <span className="inline-block text-8xl md:text-9xl font-display font-bold text-secondary drop-shadow-lg">
              51°
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground mb-4 animate-fade-in-up animation-delay-100">
            Torneo Anual de Golf
          </h1>

          <p className="text-xl md:text-2xl font-display italic text-secondary mb-8 animate-fade-in-up animation-delay-200">
            Club Campestre Torreón
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-in-up animation-delay-300">
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <Calendar className="h-5 w-5 text-secondary" />
              <span className="text-lg">{formatDate(tournamentInfo.startDate, tournamentInfo.endDate)}</span>
            </div>
            <span className="hidden sm:block text-primary-foreground/50">|</span>
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <MapPin className="h-5 w-5 text-secondary" />
              <span className="text-lg">{tournamentInfo.venue}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
            <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold font-semibold px-8">
              <Link to="/convocatoria">Ver Convocatoria</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/jugadores">Ver Jugadores</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
