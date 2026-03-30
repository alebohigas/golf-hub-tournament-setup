/**
 * useAppIcon Hook
 * Dynamically sets the apple-touch-icon and favicon using the tournament's
 * header logo from the API. This allows the site to appear with the
 * tournament's branding when added to a phone's home screen.
 */

import { useEffect } from 'react';
import { useTournamentInfo } from '@/hooks/useTournamentData';
import { getLogoUrl } from '@/config/api';

/**
 * Sets <link rel="apple-touch-icon"> and <link rel="icon"> dynamically
 * based on the tournament's logoHeaderUrl field from the database.
 */
export const useAppIcon = () => {
  const { data: tournament } = useTournamentInfo();

  useEffect(() => {
    if (!tournament?.logoHeaderUrl) return;

    /** Full URL to the logo image via our proxy */
    const logoUrl = getLogoUrl(tournament.logoHeaderUrl);

    // ============= Apple Touch Icon (home screen shortcut) =============
    let appleTouchIcon = document.querySelector<HTMLLinkElement>(
      'link[rel="apple-touch-icon"]'
    );
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.href = logoUrl;

    // Note: Standard favicon is NOT changed here — it keeps the original
    // favicon.ico for browser tabs. Only apple-touch-icon is set dynamically.
  }, [tournament?.logoHeaderUrl]);
};
