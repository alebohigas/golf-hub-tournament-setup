/**
 * SponsorLogoImage
 * Renders a sponsor logo with built-in error handling. The image performs
 * an async fetch when mounted; if it fails (404, CORS, missing path, etc.)
 * the consumer is notified via `onStatusChange` so the parent can decide
 * whether to render a fallback (admin) or hide the sponsor entirely (public).
 *
 * Status values:
 *  - 'loading'  → still resolving
 *  - 'ok'       → image loaded successfully
 *  - 'error'    → no URL provided OR <img> emitted an error event
 */

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export type SponsorLogoStatus = 'loading' | 'ok' | 'error';

interface SponsorLogoImageProps {
  /** Absolute or proxy URL to the sponsor logo. May be null/empty. */
  url: string | null | undefined;
  /** Alt text for the image (typically the sponsor name). */
  alt: string;
  /** Tailwind classes for the rendered <img>. */
  className?: string;
  /** Called whenever the load status changes. Useful for parent filtering. */
  onStatusChange?: (status: SponsorLogoStatus) => void;
  /**
   * When true, renders a visible "logo no encontrado" warning placeholder
   * on error. When false, returns null on error (parent should hide entirely).
   */
  showErrorPlaceholder?: boolean;
}

/** Renders a sponsor logo and tracks its load status. */
const SponsorLogoImage = ({
  url,
  alt,
  className,
  onStatusChange,
  showErrorPlaceholder = false,
}: SponsorLogoImageProps) => {
  const [status, setStatus] = useState<SponsorLogoStatus>(url ? 'loading' : 'error');

  // Reset status whenever the URL changes
  useEffect(() => {
    const next: SponsorLogoStatus = url ? 'loading' : 'error';
    setStatus(next);
    onStatusChange?.(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  /** Mark as loaded and notify parent */
  const handleLoad = () => {
    setStatus('ok');
    onStatusChange?.('ok');
  };

  /** Mark as error and notify parent */
  const handleError = () => {
    setStatus('error');
    onStatusChange?.('error');
  };

  if (status === 'error') {
    if (!showErrorPlaceholder) return null;
    return (
      <div className="flex flex-col items-center justify-center gap-1 text-destructive">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        <span className="text-xs font-medium">Logo no encontrado</span>
      </div>
    );
  }

  return (
    <img
      src={url ?? undefined}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default SponsorLogoImage;