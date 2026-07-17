/**
 * AnnouncementRibbon
 * -----------------------------------------------------------------------
 * Site-wide scrolling text ribbon rendered between the top header and the
 * sponsor ribbon. Configuration lives in `site_config.anuncio_config`
 * (managed from Admin > Anuncio) and applies to every page of the site.
 *
 * Reuses the existing `scroll-sponsors` keyframes (translateX 0 → -50%)
 * with a duplicated content string, so the loop is seamless.
 */
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteConfig } from '@/hooks/useSiteConfig';

/**
 * Maps the admin-selected font family preset to a CSS font-family stack.
 * Kept in sync with the AdminAnuncio font picker.
 */
const FONT_FAMILY_MAP: Record<string, string> = {
  sans: 'ui-sans-serif, system-ui, sans-serif',
  serif: 'ui-serif, Georgia, serif',
  mono: 'ui-monospace, SFMono-Regular, monospace',
  display: '"Playfair Display", Georgia, serif',
};

/**
 * AnnouncementRibbon
 * Reads global config and renders a horizontally scrolling message when
 * enabled. Returns null when disabled or when the text is empty.
 */
const AnnouncementRibbon = () => {
  const { data: siteConfig } = useSiteConfig();
  const location = useLocation();
  const cfg = siteConfig?.anuncio_config;

  /** Repeat the text enough times to guarantee a full viewport width even for short messages. */
  const repeatedText = useMemo(() => {
    const raw = (cfg?.text ?? '').trim();
    if (!raw) return '';
    // Separator between repetitions so the text reads clearly as it loops.
    const unit = `${raw}\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0`;
    return unit.repeat(8);
  }, [cfg?.text]);

  if (!cfg?.enabled || !repeatedText) return null;

  // Route filtering: when `paths` is missing/empty or contains '*', show on
  // every page (legacy behavior). Otherwise only show on the listed paths.
  const paths = cfg.paths;
  const routeAllowed =
    !paths || paths.length === 0 || paths.includes('*') || paths.includes(location.pathname);
  if (!routeAllowed) return null;

  const speed = Math.max(5, Number(cfg.speedSeconds) || 30);

  return (
    <div
      className="w-full overflow-hidden border-y border-border"
      style={{ backgroundColor: cfg.bgColor || '#111827' }}
      role="marquee"
      aria-label="Anuncio del torneo"
    >
      <div
        className="sponsor-scroll flex whitespace-nowrap py-2"
        style={{ animationDuration: `${speed}s` }}
      >
        {/* Duplicated content for a seamless -50% translate loop. */}
        <span
          className="px-4"
          style={{
            color: cfg.textColor || '#ffffff',
            fontFamily: FONT_FAMILY_MAP[cfg.fontFamily] || FONT_FAMILY_MAP.sans,
            fontSize: `${cfg.fontSize || 16}px`,
            fontWeight: cfg.bold ? 700 : 500,
            fontStyle: cfg.italic ? 'italic' : 'normal',
            letterSpacing: '0.02em',
          }}
        >
          {repeatedText}
        </span>
        <span
          className="px-4"
          aria-hidden="true"
          style={{
            color: cfg.textColor || '#ffffff',
            fontFamily: FONT_FAMILY_MAP[cfg.fontFamily] || FONT_FAMILY_MAP.sans,
            fontSize: `${cfg.fontSize || 16}px`,
            fontWeight: cfg.bold ? 700 : 500,
            fontStyle: cfg.italic ? 'italic' : 'normal',
            letterSpacing: '0.02em',
          }}
        >
          {repeatedText}
        </span>
      </div>
    </div>
  );
};

export default AnnouncementRibbon;
