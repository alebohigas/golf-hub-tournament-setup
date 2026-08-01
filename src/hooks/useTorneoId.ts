/**
 * Tournament ID Hook
 * Manages the active tournament ID stored in localStorage
 * Used by all API calls to identify which tournament data to fetch
 */

import { useState, useCallback, useEffect } from 'react';

// ============= Constants =============

/** localStorage key for storing the active tournament ID */
const TORNEO_ID_KEY = 'golf-app-torneo-id';

/** Default tournament ID (empty means not configured) */
const DEFAULT_TORNEO_ID = '';

/**
 * Custom DOM event fired whenever the active tournament ID changes.
 * Needed because every `useTorneoId()` call has its own React state: without
 * a shared notification, a component mounted before `site_config.php`
 * resolved the torneoid (e.g. /convocatoria) would keep an empty ID forever
 * and render an empty page until a manual refresh.
 */
const TORNEO_ID_EVENT = 'golf-app-torneo-id-changed';

/**
 * Persist the tournament ID and notify every subscriber in this tab
 * (other tabs get it through the native `storage` event).
 */
export const setStoredTorneoId = (id: string) => {
  const trimmed = (id ?? '').trim();
  const current = localStorage.getItem(TORNEO_ID_KEY) || DEFAULT_TORNEO_ID;
  if (current === trimmed) return;
  localStorage.setItem(TORNEO_ID_KEY, trimmed);
  window.dispatchEvent(new Event(TORNEO_ID_EVENT));
};

// ============= Hook =============

/**
 * useTorneoId
 * Returns the current tournament ID and a setter function
 * Persists to localStorage for cross-session use
 */
export const useTorneoId = () => {
  const [torneoId, setTorneoIdState] = useState<string>(() => {
    return localStorage.getItem(TORNEO_ID_KEY) || DEFAULT_TORNEO_ID;
  });

  /** Update tournament ID, persist it and notify all other subscribers. */
  const setTorneoId = useCallback((id: string) => {
    setStoredTorneoId(id);
    setTorneoIdState((id ?? '').trim());
  }, []);

  /**
   * Stay in sync with the value written by `useSiteConfig` (same tab) and
   * with other tabs (`storage` event), so data hooks depending on
   * `torneoId` refetch as soon as the ID becomes known.
   */
  useEffect(() => {
    const sync = () => {
      const next = localStorage.getItem(TORNEO_ID_KEY) || DEFAULT_TORNEO_ID;
      setTorneoIdState((prev) => (prev === next ? prev : next));
    };
    sync();
    window.addEventListener(TORNEO_ID_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(TORNEO_ID_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return { torneoId, setTorneoId };
};

// ============= Static Getter =============

/**
 * getTorneoId
 * Static getter for use outside React components (e.g., API config)
 * Reads directly from localStorage
 */
export const getTorneoId = (): string => {
  return localStorage.getItem(TORNEO_ID_KEY) || DEFAULT_TORNEO_ID;
};
