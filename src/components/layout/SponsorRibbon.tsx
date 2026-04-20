/**
 * SponsorRibbon Component
 * Infinite scrolling ribbon of sponsor logos
 * Data fetched from sponsors.php via useSponsors hook
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSponsors } from '@/hooks/useTournamentData';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import SponsorLogoImage, { type SponsorLogoStatus } from '@/components/sponsors/SponsorLogoImage';

/**
 * SponsorRibbon
 * Infinite scrolling ribbon of sponsor logos.
 *
 * Visibility per route is admin-controlled via `sponsors_config.ribbonVisiblePages`
 * (managed in /admin → tab Patrocinadores). If no per-page config exists,
 * the ribbon defaults to visible everywhere.
 *
 * Order, randomization and the maximum number of visible logos are admin-controlled
 * via `sponsors_config.carousel` (Admin → Patrocinadores → Carrusel):
 *   - carousel.order:        custom display order (array of sponsor IDs)
 *   - carousel.randomize:    shuffle order on every render (overrides custom order)
 *   - carousel.visibleCount: max number of distinct sponsors included in the ribbon
 */
const SponsorRibbon = () => {
  const { data: sponsors = [] } = useSponsors();
  const { data: siteConfig } = useSiteConfig();
  const { pathname } = useLocation();

  /**
   * Apply admin carousel config (order / randomize / visibleCount) to the
   * raw sponsor list before duplicating it for the infinite-scroll loop.
   * Memoized so randomization happens once per mount/data change instead of
   * on every re-render.
   */
  const carousel = siteConfig?.sponsors_config?.carousel;
  /**
   * Track sponsor IDs whose logo image failed to load. Mirrors the behavior
   * of the public Patrocinadores page: broken logos are hidden entirely
   * (no name, no placeholder) so the ribbon never advertises a sponsor we
   * cannot actually display.
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

  const orderedSponsors = useMemo(() => {
    if (!sponsors.length) return [];
    // Drop sponsors with no logo URL up-front; broken-on-load ones are
    // additionally filtered via `brokenIds` after render.
    let list = sponsors.filter((s) => Boolean(s.logoUrl) && !brokenIds.has(String(s.id)));

    if (carousel?.randomize) {
      // Fisher–Yates shuffle for an unbiased random order
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    } else if (carousel?.order && carousel.order.length > 0) {
      // Apply custom order: configured IDs first (in admin order), then any
      // sponsors not present in the order array (preserves server alphabetical order).
      const indexById = new Map<number, number>();
      carousel.order.forEach((id, idx) => indexById.set(id, idx));
      list.sort((a, b) => {
        const ai = indexById.has(Number(a.id)) ? (indexById.get(Number(a.id)) as number) : Number.POSITIVE_INFINITY;
        const bi = indexById.has(Number(b.id)) ? (indexById.get(Number(b.id)) as number) : Number.POSITIVE_INFINITY;
        return ai - bi;
      });
    }

    // Cap the number of distinct logos shown if visibleCount is set (>0)
    const cap = carousel?.visibleCount ?? 0;
    if (cap > 0 && list.length > cap) {
      list = list.slice(0, cap);
    }
    return list;
  }, [sponsors, brokenIds, carousel?.randomize, carousel?.order, carousel?.visibleCount]);

  // Per-page visibility map from server config — undefined = legacy default (show everywhere)
  const ribbonVisiblePages = siteConfig?.sponsors_config?.ribbonVisiblePages;
  if (ribbonVisiblePages && ribbonVisiblePages[pathname] === false) {
    return null;
  }

  // We still need to mount probes for sponsors not yet evaluated so their
  // onError callbacks can fire and update `brokenIds`. Build a hidden probe
  // list of any sponsor that has a URL but isn't in `orderedSponsors` yet.
  const evaluatedIds = new Set(orderedSponsors.map((s) => String(s.id)));
  const probeSponsors = sponsors.filter(
    (s) => Boolean(s.logoUrl) && !evaluatedIds.has(String(s.id)) && !brokenIds.has(String(s.id))
  );

  // Duplicate sponsors for infinite scroll effect
  const duplicatedSponsors = [...orderedSponsors, ...orderedSponsors];

  if (orderedSponsors.length === 0 && probeSponsors.length === 0) return null;

  return (
    <div className="bg-muted/50 border-y border-border py-4 overflow-hidden">
      <div className="container mx-auto">
        <div className="fade-edge-left">
          <div className="flex items-center sponsor-scroll">
            {duplicatedSponsors.map((sponsor, index) => (
              <div
                key={`${sponsor.id}-${index}`}
                className="flex-shrink-0 mx-8 opacity-60 hover:opacity-100 transition-opacity duration-300"
              >
                {sponsor.websiteUrl ? (
                  <a
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <SponsorLogoImage
                      url={sponsor.logoUrl}
                      alt={sponsor.name}
                      onStatusChange={(s) => handleStatus(String(sponsor.id), s)}
                      className="h-20 md:h-24 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </a>
                ) : (
                  <SponsorLogoImage
                    url={sponsor.logoUrl}
                    alt={sponsor.name}
                    onStatusChange={(s) => handleStatus(String(sponsor.id), s)}
                    className="h-20 md:h-24 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                )}
              </div>
            ))}
            {/* Hidden probes: detect broken logos for sponsors not yet rendered
                so they can be filtered out before showing in the visible slice. */}
            {probeSponsors.map((sponsor) => (
              <div key={`probe-${sponsor.id}`} aria-hidden="true" className="hidden">
                <SponsorLogoImage
                  url={sponsor.logoUrl}
                  alt={sponsor.name}
                  onStatusChange={(s) => handleStatus(String(sponsor.id), s)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorRibbon;
