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

// Section components
import DescripcionSection from '@/components/convocatoria/DescripcionSection';
import ElegibilidadSection from '@/components/convocatoria/ElegibilidadSection';
import CostosSection from '@/components/convocatoria/CostosSection';
import CategoriasSection from '@/components/convocatoria/CategoriasSection';
import PremiacionSection from '@/components/convocatoria/PremiacionSection';
import CalendarioSection from '@/components/convocatoria/CalendarioSection';
import ReglasSection from '@/components/convocatoria/ReglasSection';
import CompetenciasEspecialesSection from '@/components/convocatoria/CompetenciasEspecialesSection';

// Data
import {
  eligibilityText,
  notesText,
  scheduleData,
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
} from '@/data/mockData';

// ============= Helpers =============

/** Regex to match leading Roman numerals */
const ROMAN_NUMERAL_REGEX = /^([IVXLCDM]+)\s+(.+)$/;

/** Split tournament name into Roman numeral prefix and rest */
const parseTournamentName = (name: string) => {
  const match = name.trim().match(ROMAN_NUMERAL_REGEX);
  return match ? { roman: match[1], rest: match[2] } : { roman: '', rest: name };
};

/** Format date range in Spanish */
const formatDate = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
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
        />
      );
    case 'categorias':
      return <CategoriasSection />;
    case 'premiacion':
      return <PremiacionSection data={premiacionData} />;
    case 'calendario':
      return <CalendarioSection scheduleData={scheduleData} />;
    case 'reglas':
      return <ReglasSection data={reglasData} />;
    case 'competencias':
      return <CompetenciasEspecialesSection data={competenciasEspecialesData} />;
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

  /** Enabled sections for rendering and submenu */
  const enabledSections = sections.filter((s) => s.enabled);

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
      />

      {/* Sticky submenu */}
      <PageSubmenu
        sections={enabledSections.map((s) => ({ id: s.id, label: s.label }))}
        activeSection={activeSection}
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
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
