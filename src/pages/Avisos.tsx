/**
 * Avisos Page
 * -------------------------------------------------------------
 * Displays tournament-wide notices (climatological warnings, pricing
 * tables, access info, etc.) using the same poster-grid + lightbox
 * pattern as the Eventos page.
 *
 * The grid layout (columns + gap per breakpoint) is admin-configurable
 * via the "Avisos" tab in /admin, persisted in `site_config.avisos_config`.
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import AvisosPostersSection, { AVISOS_POSTERS } from '@/components/avisos/AvisosPostersSection';
import { useUploadsList } from '@/hooks/useUploads';
// Hero banner image for the Avisos page (golf course at golden hour with a
// notice board) — mirrors the per-section hero pattern used across the app.
import avisosHero from '@/assets/avisos-hero.jpg';

const Avisos = () => {
  // Section visibility: render the poster grid when EITHER build-time
  // fallback assets OR admin-uploaded server files exist. Previously this
  // only checked the bundled list, so once `src/assets/avisos/` was cleared
  // the page hid the section even though /admin uploads were present.
  // Mirrors the logic used in Premios.tsx.
  const { data: uploadsData } = useUploadsList('avisos');
  const serverCount = uploadsData?.files?.length ?? 0;
  const hasPosters = serverCount > 0 || AVISOS_POSTERS.length > 0;

  return (
    <Layout>
      <PageHero
        title="Avisos"
        subtitle="Comunicados y noticias importantes del torneo"
        backgroundImage={avisosHero}
      />

      {/* Poster grid + lightbox (mirrors Eventos visual style). */}
      {hasPosters && <AvisosPostersSection />}

      {/* Fallback when no posters are configured. */}
      {!hasPosters && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
              Próximamente
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Aún no hay avisos publicados para este torneo. Vuelve pronto para
              consultar comunicados, costos y novedades.
            </p>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Avisos;
