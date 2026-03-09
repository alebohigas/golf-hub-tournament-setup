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
const DEFAULT_TORNEO_ID = '51';

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

  /** Update tournament ID and persist to localStorage */
  const setTorneoId = useCallback((id: string) => {
    const trimmed = id.trim();
    localStorage.setItem(TORNEO_ID_KEY, trimmed);
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
