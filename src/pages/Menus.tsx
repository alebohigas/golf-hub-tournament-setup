/**
 * Menus Page
 * -------------------------------------------------------------
 * Displays tournament-wide notices (climatological warnings, pricing
 * tables, access info, etc.) using the same poster-grid + lightbox
 * pattern as the Eventos page.
 *
 * The grid layout (columns + gap per breakpoint) is admin-configurable
 * via the "Avisos" tab in /admin, persisted in `site_config.menus_config`.
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import MenusPostersSection, { MENUS_POSTERS } from '@/components/menus/MenusPostersSection';
import { useUploadsList } from '@/hooks/useUploads';
// Hero banner image for the Avisos page (golf course at golden hour with a
// notice board) — mirrors the per-section hero pattern used across the app.
import menusHero from '@/assets/menus-hero.jpg';

const Menus = () => {
  // Section visibility: render when either server-uploaded files OR bundled
  // fallback assets exist. This keeps Avisos working after removing default
  // assets and managing everything through /admin → Archivos.
  const { data: uploadsData } = useUploadsList('menus');
  const serverCount = uploadsData?.files?.length ?? 0;
  const hasPosters = serverCount > 0 || MENUS_POSTERS.length > 0;

  return (
    <Layout>
      <PageHero
        title="Menús"
        subtitle="Comunicados y noticias importantes del torneo"
        backgroundImage={menusHero}
      />

      {/* Poster grid + lightbox (mirrors Eventos visual style). */}
      {hasPosters && <MenusPostersSection />}

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

export default Menus;
