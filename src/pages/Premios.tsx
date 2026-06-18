/**
 * Premios Page
 * -------------------------------------------------------------
 * Displays the tournament prize gallery using the same poster-grid +
 * lightbox pattern as /eventos and /avisos. Editors manage images and
 * layout from Admin > Premios; the page falls back to a "Próximamente"
 * placeholder when no posters exist.
 *
 * The grid layout (columns + gap per breakpoint) is admin-configurable
 * via `site_config.premios_config`.
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import PremiosPostersSection, { PREMIOS_POSTERS } from '@/components/premios/PremiosPostersSection';
import { useUploadsList } from '@/hooks/useUploads';

const Premios = () => {
  // Show the posters section as long as either build-time fallback assets
  // OR server-uploaded files exist. Keeps the page resilient when admins
  // manage everything through /admin without touching the codebase.
  const { data: uploadsData } = useUploadsList('premios');
  const serverCount = uploadsData?.files?.length ?? 0;
  const hasPosters = serverCount > 0 || PREMIOS_POSTERS.length > 0;

  return (
    <Layout>
      <PageHero
        title="Premios"
        subtitle="Reconocimientos y premiación del torneo"
      />

      {/* Poster grid + lightbox (mirrors Eventos / Avisos visual style). */}
      {hasPosters && <PremiosPostersSection />}

      {/* Fallback when no posters are configured. */}
      {!hasPosters && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
              Próximamente
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Aún no hay premios publicados para este torneo. Vuelve pronto
              para consultar trofeos, reconocimientos y premios especiales.
            </p>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Premios;