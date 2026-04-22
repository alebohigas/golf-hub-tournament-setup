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
import { useIsMobile } from '@/hooks/use-mobile';

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
   * Mobile override:
   * En vista mobile el `visibleCount` configurado por el admin (pensado para
   * desktop) provoca logos diminutos. Forzamos un slot ancho (1 logo "page"
   * por viewport) para que el patrocinador llene el alto disponible (h-20)
   * sin escalarse hacia abajo, y aceleramos el desplazamiento del ribbon.
   */
  const isMobile = useIsMobile();

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

    // Admin whitelist: when `enabledIds` is defined, only render those sponsors.
    // When undefined (legacy / never configured), show every sponsor with a logo.
    if (carousel?.enabledIds) {
      const allow = new Set(carousel.enabledIds.map((n) => Number(n)));
      list = list.filter((s) => allow.has(Number(s.id)));
    }

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
  }, [sponsors, brokenIds, carousel?.randomize, carousel?.order, carousel?.enabledIds]);

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
   *  - Desktop: respects the admin-configured `visibleCount`.
   *  - Mobile: ignores `visibleCount` entirely so the ribbon can pack as many
   *    logos as possible using each image's natural width.
   */
  const configuredVisibleCount = carousel?.visibleCount ?? 0;
  const visibleCount = isMobile ? 0 : configuredVisibleCount;
  /**
   * Slot sizing:
   *  - Desktop with visibleCount > 0: fixed fractional width per logo.
   *  - Mobile / auto mode: natural width with minimal horizontal spacing so
   *    logos fill the ribbon without large empty gaps.
   *
   * IMPORTANT: The flex track (`.sponsor-scroll`) is sized with
   * `width: max-content` so the CSS keyframe `translateX(-50%)` animates the
   * full sequence smoothly. Because of that, percentage widths on the slots
   * would create a circular sizing reference (`%` of `max-content` collapses
   * to 0). We therefore size each slot in viewport units (`vw`) instead of
   * percent — the ribbon spans the full viewport width, so `100vw / N` is
   * exactly the desired "N logos fully visible at once".
   */
  const slotClass =
    visibleCount > 0
      ? 'flex-shrink-0 px-4 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300'
      : isMobile
        ? 'flex-shrink-0 px-2 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300'
        : 'flex-shrink-0 mx-8 opacity-60 hover:opacity-100 transition-opacity duration-300';
  const slotStyle: React.CSSProperties =
    visibleCount > 0 ? { width: `${100 / visibleCount}vw` } : {};

  /**
   * Animation speed.
   * Baseline = 30s when 6+ logos are visible at once. With fewer visible
   * logos the loop is progressively shorter (= faster) so the ribbon never
   * feels sluggish when there is little content on screen:
   *   1 visible → 12s   (fastest)
   *   2 visible → 15s
   *   3 visible → 18s
   *   4 visible → 22s
   *   5 visible → 26s
   *   6+ visible → 30s  (baseline)
   */
  // Velocidad del ribbon. En mobile siempre usamos la velocidad "rápida"
  // descrita en el panel admin, ignorando la densidad configurada.
  const speedSeconds = isMobile
    ? 18
    : visibleCount === 1 ? 18 :
      visibleCount === 2 ? 22 :
      visibleCount === 3 ? 26 :
      30;
  const animationStyle: React.CSSProperties = {
    animationDuration: `${speedSeconds}s`,
  };

  /**
   * Build the visible sequence by repeating the sponsor list enough times
   * so the ribbon always shows ≥`visibleCount` logos on screen at once,
   * with the same logo never appearing back-to-back.
   *
   * The legacy ribbon comfortably fits ≈4 logos in the viewport. So when
   * the admin asks for `visibleCount = N`, we need each base "page" of
   * sponsors repeated enough times to fill ≥N logos per viewport width.
   * Concretely: `sponsorRepeats = ceil(N / sponsors.length) * baseFactor`
   * where `baseFactor` lifts low values so 1 sponsor with N=2 → 4 copies
   * per loop (interleaved becomes A A A A — but with multiple sponsors it
   * round-robins, e.g. [A,B] × 4 → A,B,A,B,A,B,A,B).
   */
  // Repeat the sponsor list enough times so a SINGLE pass (`interleaved`) is
  // already wider than the viewport. The CSS animation translates the strip
  // by -50% (one full pass), so if a single pass is narrower than the screen
  // the ribbon visibly "jumps back" when the loop wraps. Targeting at least
  // 2× visibleCount logos per pass — and never fewer than 12 — keeps the
  // scroll continuous even when the admin selected only 1–3 sponsors and
  // the viewport is wide enough to show 6+ slots simultaneously.
  const targetPerPass = Math.max(visibleCount > 0 ? visibleCount * 3 : 12, 12);
  const copiesPerSponsor =
    orderedSponsors.length === 0
      ? 1
      : Math.max(1, Math.ceil(targetPerPass / orderedSponsors.length));
  const interleaved = orderedSponsors.length === 0
    ? []
    : Array.from({ length: copiesPerSponsor }).flatMap(() => orderedSponsors);
  // Duplicate once more for the seamless CSS infinite-scroll loop.
  const duplicatedSponsors = [...interleaved, ...interleaved];

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
                      className="h-20 md:h-24 w-auto max-w-none object-contain transition-all duration-300"
                    />
                  </a>
                ) : (
                  <SponsorLogoImage
                    url={sponsor.logoUrl}
                    alt={sponsor.name}
                    onStatusChange={(s) => handleStatus(String(sponsor.id), s)}
                    className="h-20 md:h-24 w-auto max-w-none object-contain transition-all duration-300"
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
