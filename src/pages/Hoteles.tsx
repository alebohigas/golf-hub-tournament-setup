/**
 * Hoteles Page
 * -------------------------------------------------------------
 * Displays hotel partner posters using the same poster-grid +
 * lightbox pattern as /eventos, /avisos and /premios. Editors
 * manage images and layout from Admin > Hoteles; the page falls
 * back to a "Próximamente" placeholder when no posters exist.
 *
 * The grid layout (columns + gap per breakpoint) is admin-configurable
 * via `site_config.hoteles_config`.
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import HotelesPostersSection, { HOTELES_POSTERS } from '@/components/hoteles/HotelesPostersSection';
import { useUploadsList } from '@/hooks/useUploads';
import hotelesHero from '@/assets/hoteles-hero.jpg';

const Hoteles = () => {
  // Show the posters section as long as either build-time fallback assets
  // OR server-uploaded files exist. Keeps the page resilient when admins
  // manage everything through /admin without touching the codebase.
  const { data: uploadsData } = useUploadsList('hoteles');
  const serverCount = uploadsData?.files?.length ?? 0;
  const hasPosters = serverCount > 0 || HOTELES_POSTERS.length > 0;

  return (
    <Layout>
      <PageHero
        title="Hoteles"
        subtitle="Hoteles recomendados y promociones especiales para los participantes del torneo."
        backgroundImage={hotelesHero}
        backgroundPosition="center 55%"
      />

      {/* Poster grid + lightbox (mirrors Eventos / Avisos / Premios). */}
      {hasPosters && <HotelesPostersSection />}

      {/* Fallback when no posters are configured. */}
      {!hasPosters && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
              Próximamente
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Aún no hay hoteles publicados para este torneo. Aquí verás los
              hoteles recomendados, promociones y descuentos especiales para
              los participantes y sus acompañantes.
            </p>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Hoteles;