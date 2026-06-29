/**
 * Tournament ID Hook
 * Manages the active tournament ID stored in localStorage
 * Used by all API calls to identify which tournament data to fetch
 */

import { useState, useCallback, useEffect } from 'react';

// ============= Constants =============

/** localStorage key for storing the active tournament ID */
const TORNEO_ID_KEY = 'golf-app-torneo-id';

/** Browser event fired when the active tournament ID is replaced from server config */
const TORNEO_ID_EVENT = 'golf-app-torneo-id-change';

/** Default tournament ID (empty means not configured) */
const DEFAULT_TORNEO_ID = '';

/** Normalize any tournament ID input before storing or reading it */
const normalizeTorneoId = (id: string | number | null | undefined): string => {
  return String(id ?? '').trim();
};

/** Persist the domain-scoped tournament ID and notify open React hooks */
export const persistTorneoId = (id: string | number | null | undefined) => {
  const normalized = normalizeTorneoId(id);

  if (normalized) {
    localStorage.setItem(TORNEO_ID_KEY, normalized);
  } else {
    localStorage.removeItem(TORNEO_ID_KEY);
  }

  window.dispatchEvent(new CustomEvent(TORNEO_ID_EVENT, { detail: normalized }));
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

  /** Keep hook state aligned when site_config updates localStorage globally */
  useEffect(() => {
    const handleTorneoChange = (event: Event) => {
      const next = event instanceof CustomEvent
        ? normalizeTorneoId(event.detail)
        : localStorage.getItem(TORNEO_ID_KEY) || DEFAULT_TORNEO_ID;
      setTorneoIdState(next);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === TORNEO_ID_KEY) {
        setTorneoIdState(event.newValue || DEFAULT_TORNEO_ID);
      }
    };

    window.addEventListener(TORNEO_ID_EVENT, handleTorneoChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(TORNEO_ID_EVENT, handleTorneoChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /** Update tournament ID and persist to localStorage */
  const setTorneoId = useCallback((id: string) => {
    const trimmed = normalizeTorneoId(id);
    persistTorneoId(trimmed);
    setTorneoIdState(trimmed);
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
