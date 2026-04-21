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
 * Order, randomization and the on-screen logo count are admin-controlled
 * via `sponsors_config.carousel` (Admin → Patrocinadores → Carrusel):
 *   - carousel.order:        custom display order (array of sponsor IDs)
 *   - carousel.randomize:    shuffle order on every render (overrides custom order)
 *   - carousel.visibleCount: how many logos are visible in the viewport at any
 *                            given time. Each slot is sized to `100% / visibleCount`
 *                            of the container width. The full sponsor set still
 *                            scrolls — this only controls visual density.
 *                            0 / undefined = legacy auto sizing.
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

    return list;
  }, [sponsors, brokenIds, carousel?.randomize, carousel?.order]);

  // Per-page visibility map from server config — undefined = legacy default (show everywhere)
  const ribbonVisiblePages = siteConfig?.sponsors_config?.ribbonVisiblePages;
  if (ribbonVisiblePages && ribbonVisiblePages[pathname] === false) {
    return null;
  }

  // No need for separate probes anymore: every sponsor with a URL is in
  // `orderedSponsors` (broken ones drop out once their <img> errors).
  const probeSponsors: typeof sponsors = [];

  /**
   * On-screen logo density.
   *  - >0: each slot is `100% / visibleCount` wide so exactly that many logo
   *        slots fit in the viewport at once.
   *  - 0/undefined: legacy auto sizing (logos use their natural width).
   *
   * To avoid huge empty space when only 1–3 sponsor slots are visible, the
   * same logo is repeated inside each slot (`logoRepeats`) so the ribbon
   * stays as visually dense as the legacy 4+ layout. Repeats roughly mirror
   * how many logos used to fit in that same width:
   *   1 visible slot → 4 repeats per slot
   *   2 visible slots → 2 repeats per slot
   *   3 visible slots → 1.x → use 2 to comfortably fill
   *   4+              → 1   (no internal repetition)
   */
  const visibleCount = carousel?.visibleCount ?? 0;
  const slotStyle: React.CSSProperties | undefined =
    visibleCount > 0
      ? { flex: `0 0 ${100 / visibleCount}%`, width: `${100 / visibleCount}%` }
      : undefined;
  const slotClass =
    visibleCount > 0
      ? 'flex items-center justify-center gap-8 px-4 opacity-60 hover:opacity-100 transition-opacity duration-300'
      : 'flex-shrink-0 mx-8 opacity-60 hover:opacity-100 transition-opacity duration-300';
  const logoRepeats =
    visibleCount === 1 ? 4 :
    visibleCount === 2 ? 2 :
    visibleCount === 3 ? 2 :
    1;

  /**
   * Animation speed.
   * Base = 30s for 4+ visible logos. With fewer visible logos the loop is
   * shorter (= faster) so the ribbon doesn't feel sluggish:
   *   1 visible → ~18s
   *   2 visible → ~22s
   *   3 visible → ~26s
   *   4+ visible → 30s (baseline)
   */
  const speedSeconds =
    visibleCount === 1 ? 18 :
    visibleCount === 2 ? 22 :
    visibleCount === 3 ? 26 :
    30;
  const animationStyle: React.CSSProperties = {
    animationDuration: `${speedSeconds}s`,
  };

  // Duplicate sponsors so the loop wraps seamlessly. If the number of visible
  // slots is greater than the unique sponsor set, repeat enough times to fill
  // the viewport AND keep the seamless loop (need ≥2x the visible count).
  const minRepeats =
    visibleCount > 0 && orderedSponsors.length > 0
      ? Math.max(2, Math.ceil((visibleCount * 2) / orderedSponsors.length))
      : 2;
  const duplicatedSponsors = Array.from({ length: minRepeats }).flatMap(() => orderedSponsors);

  if (orderedSponsors.length === 0 && probeSponsors.length === 0) return null;

  return (
    <div className="bg-muted/50 border-y border-border py-4 overflow-hidden">
      <div className="container mx-auto">
        <div className="fade-edge-left">
          <div className="flex items-center sponsor-scroll" style={animationStyle}>
            {duplicatedSponsors.map((sponsor, index) => (
              <div
                key={`${sponsor.id}-${index}`}
                className={slotClass}
                style={slotStyle}
              >
                {/* Repeat the same logo inside the slot so wide slots
                    (low visibleCount) don't show empty space. */}
                {Array.from({ length: logoRepeats }).map((_, repeatIdx) => {
                  const onStatus = (s: SponsorLogoStatus) => handleStatus(String(sponsor.id), s);
                  const logoEl = (
                    <SponsorLogoImage
                      url={sponsor.logoUrl}
                      alt={sponsor.name}
                      onStatusChange={onStatus}
                      className="h-20 md:h-24 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  );
                  return sponsor.websiteUrl ? (
                    <a
                      key={repeatIdx}
                      href={sponsor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {logoEl}
                    </a>
                  ) : (
                    <span key={repeatIdx} className="block">
                      {logoEl}
                    </span>
                  );
                })}
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
