/**
 * SitePopup
 * -----------------------------------------------------------------------
 * Global POP UP overlay rendered by <Layout />. Reads the site-wide
 * popup configuration from `useSiteConfig().popup_config` and shows a
 * centered image with a darkened backdrop on every route listed in
 * `paths`. The overlay opens once per page-load (re-opens on real
 * navigation thanks to useLocation), can be closed via the X button or
 * by clicking the backdrop, and auto-dismisses after `durationSeconds`
 * when > 0.
 *
 * The component is purely presentational — admins configure everything
 * from Admin > POP (AdminPopup.tsx).
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { cn } from '@/lib/utils';

const SitePopup = () => {
  const { data: siteConfig } = useSiteConfig();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const popup = siteConfig?.popup_config;

  // Decide whether this route should display the popup.
  const matchesRoute = (() => {
    if (!popup) return false;
    if (!popup.paths || popup.paths.length === 0) return false;
    if (popup.paths.includes('*')) return true;
    return popup.paths.includes(location.pathname);
  })();

  const isActive = Boolean(
    popup && popup.enabled && popup.imageUrl && matchesRoute
  );

  // Re-open on route change so visitors see it at the start of every
  // matching page. Reset open state whenever the active route changes.
  useEffect(() => {
    setOpen(isActive);
  }, [isActive, location.pathname]);

  // Auto-dismiss timer (skip when duration is 0 → manual close only).
  useEffect(() => {
    if (!open || !popup) return;
    if (!popup.durationSeconds || popup.durationSeconds <= 0) return;
    const t = window.setTimeout(() => setOpen(false), popup.durationSeconds * 1000);
    return () => window.clearTimeout(t);
  }, [open, popup?.durationSeconds, popup]);

  // Lock page scroll while the popup is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !popup) return null;

  const widthPx = Math.max(200, popup.widthPx || 480);

  // ---- Caption styling (kept inline so all popup styles travel with the
  // server-stored PopupConfig and there are no globals to keep in sync). ----
  const fontFamilyMap: Record<string, string> = {
    sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    serif: 'ui-serif, Georgia, "Times New Roman", serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    display: '"Playfair Display", Georgia, serif',
  };
  const hasText = Boolean(popup.text && popup.text.trim().length > 0);
  const textStyle: React.CSSProperties = {
    fontFamily: fontFamilyMap[popup.textFontFamily || 'sans'],
    fontSize: `${Math.max(10, popup.textFontSize || 16)}px`,
    fontWeight: popup.textBold ? 700 : 400,
    fontStyle: popup.textItalic ? 'italic' : 'normal',
    color: popup.textColor || '#0f172a',
    textAlign: (popup.textAlign || 'center') as React.CSSProperties['textAlign'],
    whiteSpace: 'pre-wrap',
    lineHeight: 1.4,
  };
  const textPosition = popup.textPosition || 'below';
  const hasImage = Boolean(popup.imageUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={popup.altText || 'Anuncio'}
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-4',
        'bg-black/70 backdrop-blur-sm',
        'animate-in fade-in duration-200'
      )}
      onClick={() => setOpen(false)}
    >
      <div
        className={cn(
          'relative rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden',
          'animate-in zoom-in-95 duration-200'
        )}
        style={{ width: '100%', maxWidth: `${widthPx}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => setOpen(false)}
          className={cn(
            'absolute -top-3 -right-3 z-10 inline-flex h-9 w-9 items-center justify-center',
            'rounded-full bg-white text-foreground shadow-lg ring-1 ring-black/10',
            'hover:bg-muted transition-colors'
          )}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Unified card: optional caption + image stacked together so the
            text reads as part of the same announcement, not a separate UI. */}
        {hasText && textPosition === 'above' && (
          <div className="px-5 pt-5 pb-3" style={textStyle}>
            {popup.text}
          </div>
        )}
        {hasImage && (
          <img
            src={popup.imageUrl}
            alt={popup.altText || 'Anuncio'}
            className="block w-full h-auto max-h-[70vh] object-contain bg-white"
          />
        )}
        {hasText && textPosition === 'below' && (
          <div className="px-5 pt-3 pb-5" style={textStyle}>
            {popup.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default SitePopup;