/**
 * Site Config Hook
 * Fetches the server-side torneoid for the current domain
 * Falls back to localStorage if the server has no config
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

// ============= Types =============

/** Server response for site config */
interface SiteConfig {
  domain: string;
  torneoid: number | null;
}

/** Response after saving config */
interface SaveConfigResponse extends SiteConfig {
  saved: boolean;
}

// ============= Constants =============

const TORNEO_ID_KEY = 'golf-app-torneo-id';

// ============= Fetch Functions =============

/**
 * Fetch site config from server
 * Returns the torneoid configured for this domain
 */
const fetchSiteConfig = async (): Promise<SiteConfig> => {
  const res = await fetch(`${API_BASE_URL}/site_config.php`);
  if (!res.ok) throw new Error('Failed to fetch site config');
  return res.json();
};

/**
 * Save torneoid to server for this domain
 */
const saveSiteConfig = async (torneoid: number, password: string): Promise<SaveConfigResponse> => {
  const res = await fetch(`${API_BASE_URL}/site_config.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ torneoid, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Failed to save config');
  }
  return res.json();
};

// ============= Hooks =============

/**
 * useSiteConfig
 * Fetches server-side torneoid, syncs to localStorage for use by API helpers
 */
export const useSiteConfig = () => {
  return useQuery<SiteConfig>({
    queryKey: ['site-config'],
    queryFn: async () => {
      const config = await fetchSiteConfig();
      // Sync server torneoid to localStorage so all API calls use it
      if (config.torneoid) {
        localStorage.setItem(TORNEO_ID_KEY, String(config.torneoid));
      }
      return config;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * useSaveSiteConfig
 * Mutation to save torneoid to server and update local state
 */
export const useSaveSiteConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ torneoid, password }: { torneoid: number; password: string }) =>
      saveSiteConfig(torneoid, password),
    onSuccess: (data) => {
      // Update localStorage
      if (data.torneoid) {
        localStorage.setItem(TORNEO_ID_KEY, String(data.torneoid));
      }
      // Invalidate site config and all tournament data
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
      queryClient.invalidateQueries({ queryKey: ['tournament'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-stats'] });
    },
  });
};
