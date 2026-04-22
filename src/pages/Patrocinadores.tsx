/**
 * Patrocinadores Page
 * Displays sponsor grid fetched from the API (base64 logos from DB)
 * The number of grid columns (and therefore the rendered logo size) is
 * controlled via the admin "Patrocinadores" tab and persisted server-side
 * under `site_config.sponsors_config.columns`.
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { useSponsors } from '@/hooks/useTournamentData';
import { Skeleton } from '@/components/ui/skeleton';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useState, useCallback } from 'react';
import SponsorLogoImage, { SponsorLogoStatus } from '@/components/sponsors/SponsorLogoImage';
// Hero background image dedicated to the Patrocinadores section.
// Lives in src/assets and is imported as an ES6 module so Vite hashes it.
import patrocinadoresHero from '@/assets/patrocinadores-hero.jpg';

/** Default column count when no admin config is set */
const DEFAULT_COLUMNS = 4;

/**
 * Map an admin-configured column count to:
 *  - a responsive Tailwind grid class (small screens always start at 1–2 cols)
 *  - a card height (taller when fewer columns ⇒ larger logos)
 *  - a max logo height inside each card
 *
 * Returning fixed mappings keeps Tailwind's JIT happy (no dynamic class names
 * concatenated at runtime that could be purged).
 */
const getGridConfig = (columns: number) => {
  switch (columns) {
    case 1:
      return { gridClass: 'grid-cols-1', cardHeight: 'h-72', logoMax: 'max-h-56' };
    case 2:
      return { gridClass: 'grid-cols-1 sm:grid-cols-2', cardHeight: 'h-60', logoMax: 'max-h-44' };
    case 3:
      return { gridClass: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3', cardHeight: 'h-52', logoMax: 'max-h-36' };
    case 5:
      return { gridClass: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5', cardHeight: 'h-36', logoMax: 'max-h-20' };
    case 6:
      return { gridClass: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6', cardHeight: 'h-32', logoMax: 'max-h-16' };
    case 4:
    default:
      return { gridClass: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4', cardHeight: 'h-40', logoMax: 'max-h-24' };
  }
};

const Patrocinadores = () => {
  const { data: sponsors = [], isLoading } = useSponsors();
  const { data: siteConfig } = useSiteConfig();

  /** Resolved column count from server config, falling back to the default */
  const columns = siteConfig?.sponsors_config?.columns ?? DEFAULT_COLUMNS;
  const { gridClass, cardHeight, logoMax } = getGridConfig(columns);

  /**
   * Track which sponsor IDs have logos that failed to load.
   * On the public page these are hidden entirely (instead of showing a broken
   * image) — only the admin panel exposes the broken-logo warning.
   */
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());

  /** Mark/unmark a sponsor as broken based on the image load status. */
  const handleStatus = useCallback((id: string, status: SponsorLogoStatus) => {
    setBrokenIds((prev) => {
      const isBroken = status === 'error';
      if (isBroken && prev.has(id)) return prev;
      if (!isBroken && !prev.has(id)) return prev;
      const next = new Set(prev);
      if (isBroken) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  /** Sponsors visible to public users — broken logos are filtered out. */
  const visibleSponsors = sponsors.filter((s) => !brokenIds.has(s.id));

  return (
    <Layout>
      <PageHero 
        title="Patrocinadores"
        subtitle="Empresas que hacen posible este torneo"
        backgroundImage={patrocinadoresHero}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              Patrocinadores Oficiales
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Agradecemos a todas las empresas y marcas que apoyan este torneo.
            </p>
          </div>

          {/* Sponsor grid - loading skeleton or actual cards */}
          {isLoading ? (
            <div className={`grid ${gridClass} gap-6`}>
              {Array.from({ length: columns * 2 }).map((_, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className={`p-8 flex items-center justify-center ${cardHeight}`}>
                    <Skeleton className="h-16 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sponsors.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay patrocinadores registrados.</p>
          ) : (
            <div className={`grid ${gridClass} gap-6`}>
              {sponsors.map((sponsor) => {
                // Hidden visually if the logo failed, but we still need to mount
                // the <SponsorLogoImage> for sponsors not yet evaluated so the
                // onError callback can fire. We render a hidden probe instead.
                if (brokenIds.has(sponsor.id)) {
                  return null;
                }
                return (
                <Card key={sponsor.id} className="card-hover border-border/50">
                  <CardContent className={`p-6 flex flex-col items-center justify-between gap-3 ${cardHeight}`}>
                    {/* Logo preview */}
                    <div className="flex-1 w-full flex items-center justify-center min-h-0">
                      {sponsor.websiteUrl ? (
                        <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer">
                          <SponsorLogoImage
                            url={sponsor.logoUrl}
                            alt={sponsor.name}
                            onStatusChange={(s) => handleStatus(sponsor.id, s)}
                            className={`${logoMax} max-w-full object-contain transition-all duration-300`}
                          />
                        </a>
                      ) : (
                        <SponsorLogoImage
                          url={sponsor.logoUrl}
                          alt={sponsor.name}
                          onStatusChange={(s) => handleStatus(sponsor.id, s)}
                          className={`${logoMax} max-w-full object-contain transition-all duration-300`}
                        />
                      )}
                    </div>
                    {/* Public view: sponsor name intentionally hidden — it remains
                        available via the image alt text for accessibility. The
                        admin panel still surfaces logoName for identification. */}
                  </CardContent>
                </Card>
                );
              })}
              {/* Empty-state hint when ALL sponsors had broken logos */}
              {visibleSponsors.length === 0 && (
                <p className="text-center text-muted-foreground col-span-full">
                  No hay patrocinadores disponibles para mostrar.
                </p>
              )}
            </div>
          )}

          {/* CTA section */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-display font-semibold text-foreground mb-4">
              ¿Desea ser patrocinador?
            </h3>
            <p className="text-muted-foreground mb-6">
              Contáctenos para conocer los beneficios de patrocinar el torneo de golf más prestigioso de la región.
            </p>
            <a 
              href="mailto:patrocinios@torneoanual.com" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Contactar
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Patrocinadores;
