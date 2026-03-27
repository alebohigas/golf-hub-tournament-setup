import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import CategoryTable from '@/components/convocatoria/CategoryTable';
import ScheduleTable from '@/components/convocatoria/ScheduleTable';
import convocatoriaHero from '@/assets/convocatoria-hero.jpg';
import InfoSection from '@/components/convocatoria/InfoSection';
import PricingSection from '@/components/convocatoria/PricingSection';
import ContactSection from '@/components/convocatoria/ContactSection';
import PageSubmenu from '@/components/convocatoria/PageSubmenu';
import { useTournamentInfo } from '@/hooks/useTournamentData';
import { 
  eligibilityText, 
  notesText, 
  tournamentInfo, 
  scheduleData,
  salidasText,
  handicapText,
  desempatesText,
  premiosText,
  eventosAdicionalesText,
  inscripcionesText,
  sociosPricing,
  foraneosPricing,
  pricingNote,
  contactInfo,
  contactWarning,
  diaDePracticaText,
  informacionGeneralText,
  convocatoriaSections
} from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Calendar, Clock, Trophy, Gift, CalendarPlus, FileEdit, Info, GraduationCap } from 'lucide-react';

/** Regex to match leading Roman numerals */
const ROMAN_NUMERAL_REGEX = /^([IVXLCDM]+)\s+(.+)$/;

/** Split tournament name into Roman numeral prefix and rest */
const parseTournamentName = (name: string) => {
  const match = name.trim().match(ROMAN_NUMERAL_REGEX);
  return match ? { roman: match[1], rest: match[2] } : { roman: '', rest: name };
};

const Convocatoria = () => {
  const [activeSection, setActiveSection] = useState('elegibilidad');
  const { data: tournamentData } = useTournamentInfo();
  const parsed = tournamentData?.name ? parseTournamentName(tournamentData.name) : null;

  const formatDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    return `Del ${startDate.toLocaleDateString('es-MX', options)} al ${endDate.toLocaleDateString('es-MX', { ...options, year: 'numeric' })}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = convocatoriaSections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id)
      }));
      
      const offset = 150;
      for (const section of sections.reverse()) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= offset) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout>
      <PageHero 
        title="Convocatoria"
        subtitle="Información completa sobre inscripciones, categorías y requisitos"
        backgroundImage={convocatoriaHero}
      />

      <PageSubmenu sections={convocatoriaSections} activeSection={activeSection} />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Tournament Logo/Info - dynamic from API */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-4 mb-6">
              {tournamentData?.logoUrl ? (
                <img src={tournamentData.logoUrl} alt={tournamentData.name} className="w-20 h-20 rounded-2xl object-contain shadow-elevated" />
              ) : (
                <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-3xl shadow-elevated">
                  {parsed?.roman || ''}
                </div>
              )}
              <div className="text-left">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  {parsed?.rest || tournamentData?.name || 'Torneo de Golf'}
                </h2>
                <p className="text-lg font-display italic text-muted-foreground">
                  {tournamentData?.club || ''}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-lg text-accent">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">
                {formatDate(tournamentInfo.startDate, tournamentInfo.endDate)}
              </span>
            </div>
          </div>

          {/* Elegibilidad Section (includes Elegibilidad + Notas) */}
          <div id="elegibilidad" className="mb-16 scroll-mt-32">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-center">
              Elegibilidad
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Requisitos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {eligibilityText}
                  </p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <AlertCircle className="h-5 w-5 text-accent" />
                    Notas Importantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {notesText.map((note, index) => (
                      <li key={index} className="flex items-start gap-3 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span className="leading-relaxed">{note}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Categories Section */}
          <div id="categorias" className="mb-16 scroll-mt-32">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                Categorías
              </h2>
              <p className="text-muted-foreground">
                Consulta los requisitos y formato de cada categoría
              </p>
            </div>
            <CategoryTable />
          </div>

          {/* Schedule Section */}
          <div id="horarios" className="mb-16 scroll-mt-32">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                Días y horarios de juego por categoría
              </h2>
              <p className="text-muted-foreground">
                Consulta los horarios de salida según tu categoría
              </p>
            </div>
            <Card className="shadow-card border-border/50 overflow-hidden">
              <CardContent className="p-0 md:p-6">
                <ScheduleTable scheduleData={scheduleData} />
              </CardContent>
            </Card>
          </div>

          {/* Información Importante Section */}
          <div id="info-importante" className="mb-16 scroll-mt-32">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-center">
              Información Importante
            </h2>
            
            {/* Salidas & Handicap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <InfoSection 
                title="Salidas" 
                content={salidasText}
                icon={Clock}
              />
              <InfoSection 
                title="Hándicap" 
                content={handicapText}
                icon={FileEdit}
                variant="highlight"
              />
            </div>

            {/* Desempates & Premios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <InfoSection 
                title="Desempates para ganador de trofeo" 
                content={desempatesText}
                icon={Trophy}
                variant="highlight"
              />
              <InfoSection 
                title="Premios" 
                content={premiosText}
                icon={Gift}
              />
            </div>

            {/* Eventos adicionales & Inscripciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <InfoSection 
                title="Eventos adicionales" 
                content={eventosAdicionalesText}
                icon={CalendarPlus}
              />
              <InfoSection 
                title="Inscripciones" 
                content={inscripcionesText}
                icon={Calendar}
                variant="highlight"
              />
            </div>

            {/* Día de Práctica & Información General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoSection 
                title="Día de práctica" 
                content={diaDePracticaText}
                icon={GraduationCap}
              />
              <InfoSection 
                title="Información general" 
                content={informacionGeneralText}
                icon={Info}
                variant="highlight"
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div id="costos" className="mb-16 scroll-mt-32">
            <PricingSection 
              sociosPricing={sociosPricing}
              foraneosPricing={foraneosPricing}
              pricingNote={pricingNote}
            />
          </div>

          {/* Contact Section */}
          <div id="contacto" className="scroll-mt-32">
            <ContactSection 
              contactInfo={contactInfo}
              contactWarning={contactWarning}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Convocatoria;
