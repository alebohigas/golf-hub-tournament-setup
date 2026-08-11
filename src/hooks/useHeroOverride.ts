/**
 * useHeroOverride
 * -----------------------------------------------------------------------
 * Resolves the HERO background image for the current route using the
 * per-tournament overrides saved in `site_config.hero_config`
 * (Admin > Heros).
 *
 * Resolution order:
 *   1. hero_config.byTorneo[<torneo activo>][pathname]  (if active)
 *   2. hero_config.default[pathname]                    (if active)
 *   3. undefined → the page keeps its bundled default image
 *
 * Also exposes `useGenerateHeroAI`, the mutation that asks the server to
 * generate a hero with AI (`/api/hero_ai.php`) and store it under the
 * `heros` uploads section.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSiteConfig, type HeroConfig, type HeroOverride } from '@/hooks/useSiteConfig';
import { useTorneoId } from '@/hooks/useTorneoId';
import { uploadsQueryKey } from '@/hooks/useUploads';
import { ApiError } from '@/lib/apiClient';

/**
 * Pick the override for a pathname out of a hero_config, honoring the
 * per-tournament map first and the shared default second. Only entries with
 * `active !== false` and a non-empty url win.
 */
export const resolveHeroOverride = (
  config: HeroConfig | null | undefined,
  torneoId: string | number | null | undefined,
  pathname: string,
): HeroOverride | undefined => {
  if (!config) return undefined;
  const key = String(torneoId ?? '');
  const candidates = [config.byTorneo?.[key]?.[pathname], config.default?.[pathname]];
  return candidates.find((entry) => !!entry && entry.active !== false && !!entry.url);
};

/**
 * Hook form of `resolveHeroOverride` for the given route pathname.
 * Returns the image URL to use, or undefined when there is no active
 * override (caller keeps its bundled default).
 */
export const useHeroOverride = (pathname: string): string | undefined => {
  const { data: siteConfig } = useSiteConfig();
  const { torneoId } = useTorneoId();
  return resolveHeroOverride(siteConfig?.hero_config, torneoId, pathname)?.url;
};

/** Request body of the AI hero generator. */
interface GenerateHeroInput {
  /** Free-text description of the desired hero. */
  prompt: string;
  /** Superadmin password (or staff session password) for authorization. */
  password: string;
  /** Optional page slug, only used to name the generated file. */
  page?: string;
  /** Optional staff session token forwarded for staff authorization. */
  staffToken?: string;
}

/** Response of `/api/hero_ai.php`. */
export interface GenerateHeroResponse {
  saved: true;
  name: string;
  url: string;
  prompt: string;
}

/**
 * useGenerateHeroAI
 * Mutation that generates a hero image with AI on the server and stores it
 * in the `heros` uploads folder. No client-side timeout is applied: image
 * models legitimately take a long time to render.
 */
export const useGenerateHeroAI = () => {
  const queryClient = useQueryClient();

  return useMutation<GenerateHeroResponse, Error, GenerateHeroInput>({
    mutationFn: async (input) => {
      const response = await fetch('/api/hero_ai.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const text = await response.text();
      let parsed: any = null;
      try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }
      if (!response.ok) {
        throw new ApiError(
          parsed?.error || `Error generando la imagen (HTTP ${response.status})`,
          response.status,
          '/api/hero_ai.php',
          text,
          parsed,
        );
      }
      if (!parsed?.url) {
        throw new ApiError('Respuesta inválida del generador de IA', response.status, '/api/hero_ai.php', text);
      }
      return parsed as GenerateHeroResponse;
    },
    onSuccess: () => {
      // The generated file lands in the `heros` section listing.
      queryClient.invalidateQueries({ queryKey: uploadsQueryKey('heros') });
    },
  });
};
