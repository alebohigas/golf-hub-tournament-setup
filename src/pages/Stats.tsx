/**
 * Stats Page (/stats)
 * ---------------------------------------------------------------
 * Public tournament statistics page. Renders three sections in the
 * order configured from Admin > Estadísticas Página (default order:
 * clubes → categoria → jugador). Sections can be individually hidden
 * and admins can pin manual overrides (see StatsPageConfig).
 * ---------------------------------------------------------------
 */

import { useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
// Hero HD propio de la página de Estadísticas
import statsHero from '@/assets/stats-hero.jpg';
import ClubesAsistentesSection from '@/components/stats/ClubesAsistentesSection';
import EstadisticasCategoriaSection from '@/components/stats/EstadisticasCategoriaSection';
import EstadisticasSalidasSection from '@/components/stats/EstadisticasSalidasSection';
import EstadisticasJugadorSection from '@/components/stats/EstadisticasJugadorSection';
import NoShowSection from '@/components/stats/NoShowSection';
import { useSiteConfig, type StatsPageSection } from '@/hooks/useSiteConfig';

/** Default section order used when no admin config is present yet. */
const DEFAULT_SECTIONS: StatsPageSection[] = [
  { id: 'clubes',    enabled: true },
  { id: 'categoria', enabled: true },
  { id: 'tees',      enabled: true },
  { id: 'jugador',   enabled: true },
  { id: 'noshow',    enabled: true },
];

const Stats = () => {
  const { data: siteConfig } = useSiteConfig();
  const cfg = siteConfig?.stats_page_config;

  /** Effective ordered section list (config wins, else defaults). */
  const sections: StatsPageSection[] = useMemo(() => {
    if (!cfg?.sections?.length) return DEFAULT_SECTIONS;
    // Ensure every id is present exactly once even if a saved config
    // is missing one of the three sections (backfill from defaults).
    const known = new Set(cfg.sections.map((s) => s.id));
    return [
      ...cfg.sections,
      ...DEFAULT_SECTIONS.filter((s) => !known.has(s.id)),
    ];
  }, [cfg]);

  const overrides = cfg?.overrides ?? {};

  /** Renders one of the three sections by id. */
  const renderSection = (s: StatsPageSection) => {
    if (!s.enabled) return null;
    switch (s.id) {
      case 'clubes':
        return (
          <ClubesAsistentesSection
            key="clubes"
            overrideTotal={overrides.clubesTotal ?? null}
          />
        );
      case 'categoria':
        return (
          <EstadisticasCategoriaSection
            key="categoria"
            overrideUpdatedAt={overrides.categoriaUpdatedAt ?? null}
            overrideRounds={overrides.categoriaRounds ?? null}
          />
        );
      case 'noshow':
        return <NoShowSection key="noshow" />;
      case 'tees':
        return <EstadisticasSalidasSection key="tees" />;
      case 'jugador':
        return (
          <EstadisticasJugadorSection key="jugador" note={overrides.jugadorNote ?? null} />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <PageHero
        title="ESTADÍSTICAS"
        subtitle="Datos y desempeño del torneo"
        backgroundImage={statsHero}
      />
      <div className="container mx-auto px-4 py-10 space-y-8">
        {sections.map(renderSection)}
      </div>
    </Layout>
  );
};

export default Stats;