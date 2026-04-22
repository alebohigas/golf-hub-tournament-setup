/**
 * Convocatoria Page
 * Displays tournament convocatoria with 8 dynamic, reorderable sections
 * Sections: Descripción, Elegibilidad, Costos, Categorías, Premiación,
 *           Calendario, Reglas Locales, Competencias Especiales
 */

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import convocatoriaHero from '@/assets/convocatoria-hero.jpg';
import PageSubmenu from '@/components/convocatoria/PageSubmenu';
import { useTournamentInfo } from '@/hooks/useTournamentData';
import { useConvocatoriaSections } from '@/hooks/useConvocatoriaSections';
import { Calendar } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Section components
import DescripcionSection from '@/components/convocatoria/DescripcionSection';
import ElegibilidadSection from '@/components/convocatoria/ElegibilidadSection';
import CostosSection from '@/components/convocatoria/CostosSection';
import CategoriasSection from '@/components/convocatoria/CategoriasSection';
import PremiacionSection from '@/components/convocatoria/PremiacionSection';
import ReglasSection from '@/components/convocatoria/ReglasSection';
import CompetenciasEspecialesSection from '@/components/convocatoria/CompetenciasEspecialesSection';
import ServiciosSection from '@/components/convocatoria/ServiciosSection';
import PatrocinadoresOficialesSection from '@/components/convocatoria/PatrocinadoresOficialesSection';
import CalendarioJuegoSection from '@/components/convocatoria/CalendarioJuegoSection';

// Data
import {
  eligibilityText,
  notesText,
  inscripcionesText,
  sociosPricing,
  foraneosPricing,
  pricingNote,
  contactInfo,
  contactWarning,
  convocatoriaDescripcion,
  premiacionData,
  reglasData,
  competenciasEspecialesData,
  serviciosHorariosData,
  patrocinadoresOficialesData,
} from '@/data/mockData';
import { useCalendarioData } from '@/hooks/useCalendarioData';
import { useHorariosData } from '@/hooks/useHorariosData';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';

// ============= Helpers =============

/** Regex to match leading Roman numerals */
const ROMAN_NUMERAL_REGEX = /^([IVXLCDM]+)\s+(.+)$/;

/** Split tournament name into Roman numeral prefix and rest */
const parseTournamentName = (name: string) => {
  const match = name.trim().match(ROMAN_NUMERAL_REGEX);
  return match ? { roman: match[1], rest: match[2] } : { roman: '', rest: name };
};

/**
 * Format date range in Spanish using timezone-safe parsing.
 * Decomposes 'YYYY-MM-DD' into local Date components to avoid the UTC offset
 * shift that previously caused dates to render one day earlier than the
 * Hero on the home page. This mirrors Hero.tsx so both views share the same
 * source of truth for tournament dates.
 */
const formatDate = (start: string, end: string) => {
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const startDate = new Date(sy, sm - 1, sd);
  const endDate = new Date(ey, em - 1, ed);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  return `Del ${startDate.toLocaleDateString('es-MX', options)} al ${endDate.toLocaleDateString('es-MX', { ...options, year: 'numeric' })}`;
};

// ============= Section Renderer =============

/** Map section ID to its component */
const renderSection = (sectionId: string) => {
  switch (sectionId) {
    case 'descripcion':
      return <DescripcionSection descripcion={convocatoriaDescripcion} />;
    case 'elegibilidad':
      return (
        <ElegibilidadSection
          eligibilityText={eligibilityText}
          notesText={notesText}
          inscripcionesText={inscripcionesText}
        />
      );
    case 'costos':
      return (
        <CostosSection
          sociosPricing={sociosPricing}
          foraneosPricing={foraneosPricing}
          pricingNote={pricingNote}
          contactInfo={contactInfo}
          contactWarning={contactWarning}
          inscripcionesText={inscripcionesText}
        />
      );
    case 'categorias':
      return <CategoriasSection />;
    case 'premiacion':
      return <PremiacionSection data={premiacionData} />;
    case 'reglas':
      return <ReglasSection data={reglasData} />;
    case 'competencias':
      return <CompetenciasEspecialesSection data={competenciasEspecialesData} />;
    case 'servicios':
      return <ServiciosSection data={serviciosHorariosData} />;
    case 'calendarioJuego':
      return <CalendarioJuegoSection />;
    case 'patrocinadoresOficiales':
      return <PatrocinadoresOficialesSection data={patrocinadoresOficialesData} />;
    default:
      return null;
  }
};

// ============= Main Component =============

const Convocatoria = () => {
  const [activeSection, setActiveSection] = useState('descripcion');
  const { data: tournamentData } = useTournamentInfo();
  const { sections } = useConvocatoriaSections();
  const parsed = tournamentData?.name ? parseTournamentName(tournamentData.name) : null;

  // ----- Auto-hide sections that have no content -----
  // Each section maps to a data source; we drop the section (and its
  // submenu entry) when the corresponding source is empty so the page
  // never shows blank/placeholder blocks for the current torneo.
  const { data: calData } = useCalendarioData();
  const { data: horData } = useHorariosData();
  const { isPageVisible } = usePageVisibility();

  const hasCalendarioJuego =
    (isPageVisible('calendario') && (calData?.entries?.length ?? 0) > 0) ||
    (isPageVisible('horarios')   && (horData?.entries?.length ?? 0) > 0);

  /** Returns true when the section has data worth rendering. */
  const sectionHasContent = (id: string): boolean => {
    switch (id) {
      case 'descripcion':
        return !!convocatoriaDescripcion && convocatoriaDescripcion.trim() !== '';
      case 'elegibilidad':
        return (
          (!!eligibilityText && eligibilityText.trim() !== '') ||
          (notesText && notesText.length > 0) ||
          (!!inscripcionesText && inscripcionesText.trim() !== '')
        );
      case 'costos':
        return (
          (sociosPricing && sociosPricing.length > 0) ||
          (foraneosPricing && foraneosPricing.length > 0) ||
          !!(contactInfo && (contactInfo.clabe || contactInfo.cuenta))
        );
      case 'categorias':
        // Driven by API; assume present (CategoryTable shows its own empty state).
        return true;
      case 'premiacion':
        return premiacionData && premiacionData.length > 0;
      case 'reglas':
        return reglasData && reglasData.length > 0;
      case 'competencias':
        return competenciasEspecialesData && competenciasEspecialesData.length > 0;
      case 'servicios':
        return serviciosHorariosData && serviciosHorariosData.length > 0;
      case 'calendarioJuego':
        return hasCalendarioJuego;
      case 'patrocinadoresOficiales':
        return patrocinadoresOficialesData && patrocinadoresOficialesData.length > 0;
      default:
        return true;
    }
  };

  /** Enabled sections, additionally filtered by content presence. */
  const enabledSections = sections.filter((s) => s.enabled && sectionHasContent(s.id));

  /** Scroll-based active section tracking */
  useEffect(() => {
    const handleScroll = () => {
      const offset = 150;
      for (const section of [...enabledSections].reverse()) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= offset) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabledSections]);

  return (
    <Layout>
      <PageHero
        title="Convocatoria"
        subtitle="Información completa sobre inscripciones, categorías y requisitos"
        backgroundImage={convocatoriaHero}
        // Midpoint between the previous 65% framing and the lower 95%
        // framing — keeps the desk and bell visible without cropping them.
        backgroundPosition="center 80%"
      />

      {/* Sticky submenu */}
      <PageSubmenu
        sections={enabledSections.map((s) => ({ id: s.id, label: s.label }))}
        activeSection={activeSection}
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* PDF download button — opens the original convocatoria PDF in a new tab */}
          <div className="flex justify-center mb-8">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <a
                href="/convocatoria.pdf"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver convocatoria en PDF"
              >
                <FileText className="h-5 w-5" />
                Ver en PDF
              </a>
            </Button>
          </div>

          {/* Tournament header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-4 mb-6">
              {tournamentData?.logoUrl ? (
                <img
                  src={tournamentData.logoUrl}
                  alt={tournamentData.name}
                  className="w-20 h-20 rounded-2xl object-contain shadow-elevated"
                />
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
            {tournamentData?.startDate && tournamentData?.endDate && (
              <div className="flex items-center justify-center gap-2 text-lg text-accent">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">
                  {formatDate(tournamentData.startDate, tournamentData.endDate)}
                </span>
              </div>
            )}
          </div>

          {/* Dynamic sections rendered in order */}
          {enabledSections.map((section) => (
            <div key={section.id} id={section.id} className="mb-16 scroll-mt-32">
              {renderSection(section.id)}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Convocatoria;
