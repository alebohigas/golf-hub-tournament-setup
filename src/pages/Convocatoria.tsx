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
import { useConvocatoriaContent, type ConvocatoriaContentRow } from '@/hooks/useConvocatoriaContent';
import { useUploadsList } from '@/hooks/useUploads';
import { Calendar } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Section components
import DescripcionSection from '@/components/convocatoria/DescripcionSection';
import ElegibilidadSection from '@/components/convocatoria/ElegibilidadSection';
import CostosSection from '@/components/convocatoria/CostosSection';
import CategoriasSection from '@/components/convocatoria/CategoriasSection';
import PremiacionSection from '@/components/convocatoria/PremiacionSection';
import DesempatesSection from '@/components/convocatoria/DesempatesSection';
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
  desempatesData,
  reglasData,
  competenciasEspecialesData,
  serviciosHorariosData,
  patrocinadoresOficialesData,
} from '@/data/mockData';
import type {
  PremioCategoria,
  ReglaItem,
  CompetenciaEspecial,
  ServicioDia,
  PatrocinadorOficial,
  DesempatesData,
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

/**
 * Map section ID to its component.
 * `dbRow` (optional) overrides mockData when a DB-backed row exists
 * for the active tournament in `convocatoria_content`.
 */
const renderSection = (sectionId: string, dbRow?: ConvocatoriaContentRow) => {
  /** Pick DB content when present, fall back to provided mock value. */
  const pick = <T,>(dbValue: unknown, fallback: T): T =>
    dbValue !== undefined && dbValue !== null ? (dbValue as T) : fallback;
  /** Shorthand: DB content payload (already parsed JSON). */
  const c = dbRow?.content as any;

  switch (sectionId) {
    case 'descripcion':
      return (
        <DescripcionSection
          descripcion={pick<string>(c?.text, convocatoriaDescripcion)}
        />
      );
    case 'elegibilidad':
      return (
        <ElegibilidadSection
          eligibilityText={pick<string>(c?.eligibilityText, eligibilityText)}
          notesText={pick<string[]>(c?.notesText, notesText)}
          inscripcionesText={pick<string>(c?.inscripcionesText, inscripcionesText)}
        />
      );
    case 'costos':
      return (
        <CostosSection
          sociosPricing={pick(c?.sociosPricing, sociosPricing)}
          foraneosPricing={pick(c?.foraneosPricing, foraneosPricing)}
          pricingNote={pick<string>(c?.pricingNote, pricingNote)}
          contactInfo={pick(c?.contactInfo, contactInfo)}
          contactWarning={pick<string>(c?.contactWarning, contactWarning)}
          inscripcionesText={pick<string>(c?.inscripcionesText, inscripcionesText)}
        />
      );
    case 'categorias':
      return <CategoriasSection />;
    case 'premiacion':
      return (
        <PremiacionSection
          data={pick<PremioCategoria[]>(c?.items, premiacionData)}
        />
      );
    case 'desempates':
      return (
        <DesempatesSection
          data={pick<DesempatesData>(c, desempatesData)}
        />
      );
    case 'reglas':
      return (
        <ReglasSection data={pick<ReglaItem[]>(c?.items, reglasData)} />
      );
    case 'competencias':
      return (
        <CompetenciasEspecialesSection
          data={pick<CompetenciaEspecial[]>(c?.items, competenciasEspecialesData)}
        />
      );
    case 'servicios':
      return (
        <ServiciosSection
          data={pick<ServicioDia[]>(c?.items, serviciosHorariosData)}
        />
      );
    case 'calendarioJuego':
      return <CalendarioJuegoSection />;
    case 'patrocinadoresOficiales':
      return (
        <PatrocinadoresOficialesSection
          /**
           * Patrocinadores Oficiales is strictly DB-backed per tournament.
           * We intentionally do NOT fall back to mock data, because the mock
           * belongs to a specific tournament (354) and would leak into other
           * torneos (e.g. 346) that simply have no sponsors configured.
           * If there are no DB items, render nothing (component returns null).
           */
          data={(c?.items as PatrocinadorOficial[] | undefined) ?? []}
        />
      );
    default:
      return null;
  }
};

// ============= Main Component =============

const Convocatoria = () => {
  const [activeSection, setActiveSection] = useState('descripcion');
  const { data: tournamentData } = useTournamentInfo();
  const { sections } = useConvocatoriaSections();
  // DB-backed convocatoria content for the active tournament.
  // When a row exists for a given section_id we use it; otherwise the
  // page falls back to the static mockData values below.
  const { bySectionId: dbContent } = useConvocatoriaContent();
  // Resolve the convocatoria PDF URL.
  // ONLY the admin-uploaded PDF (via /admin → "convocatoria" section) is used.
  // The legacy `pdfs` bucket fallback and the build-time `/convocatoria-torneo.pdf`
  // shipped under `public/` were removed because Firefox/browser refresh on the
  // Convocatoria route was occasionally re-opening the stale public PDF.
  // If no admin upload exists, the "Ver en PDF" button is hidden entirely.
  const { data: convocatoriaUploads } = useUploadsList('convocatoria');
  const firstSectionPdf = convocatoriaUploads?.files.find((f) => /\.pdf$/i.test(f.name));
  const convocatoriaPdfUrl = firstSectionPdf?.url ?? null;
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

  /**
   * Returns true when the section has data worth rendering.
   * Prefers a DB row when present (and respects its `enabled` flag);
   * otherwise falls back to the legacy mockData presence check.
   */
  const sectionHasContent = (id: string): boolean => {
    const dbRow = dbContent.get(id);
    if (dbRow) {
      // DB row explicitly disabled -> hide.
      if (!dbRow.enabled) return false;
      // DB row present + enabled -> render (let component decide on empty content).
      // Calendario still depends on derived data, fall through.
      if (id !== 'calendarioJuego') return true;
    }
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
      case 'desempates':
        return !!desempatesData && (
          (desempatesData.paraCorte?.length ?? 0) > 0 ||
          (desempatesData.paraTrofeos?.length ?? 0) > 0
        );
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
          {/* PDF download button — opens the admin-uploaded convocatoria PDF in
              a new tab. Hidden when no PDF has been uploaded via /admin. */}
          {convocatoriaPdfUrl && (
            <div className="flex justify-center mb-8">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <a
                  href={convocatoriaPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ver convocatoria en PDF"
                >
                  <FileText className="h-5 w-5" />
                  Ver en PDF
                </a>
              </Button>
            </div>
          )}

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
              {renderSection(section.id, dbContent.get(section.id))}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Convocatoria;
