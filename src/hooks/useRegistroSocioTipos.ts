/**
 * useRegistroSocioTipos
 * ---------------------------------------------------------------
 * Read/write hook for the per-tournament mapping between the
 * dropdown label shown on the public /registro form ("Tipo de
 * socio") and the underlying system socio type used by the pricing
 * engine ('TITULAR' | 'EMERITO' | 'DEPENDIENTE').
 *
 * Backed by /api/registro_socio_tipos.php. The API returns a
 * default 3-row set (Titular / Emérito / Dependiente) when the DB
 * table is empty, so consumers can always render something.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRegistroSocioTiposUrl } from '@/config/api';

/** Valid system socio types accepted by the backend. */
export type SocioSystemType = 'TITULAR' | 'EMERITO' | 'DEPENDIENTE';

/** One mapping row. */
export interface SocioTipoItem {
  club_label: string;
  system_type: SocioSystemType;
  display_order: number;
  is_enabled: 0 | 1;
}

interface SocioTiposResponse {
  items: SocioTipoItem[];
  source: 'db' | 'defaults';
}

/** Fetch the mapping for the active tournament. */
export const useRegistroSocioTipos = () =>
  useQuery<SocioTiposResponse>({
    queryKey: ['registro-socio-tipos'],
    queryFn: async () => {
      const res = await fetch(getRegistroSocioTiposUrl());
      if (!res.ok) throw new Error('Failed to fetch socio tipos');
      return res.json();
    },
    staleTime: 30_000,
  });

/** Replace the mapping for the tournament (admin). */
export const useSaveRegistroSocioTipos = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { torneoid: number; items: SocioTipoItem[]; password: string }) => {
      const res = await fetch(getRegistroSocioTiposUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to save socio tipos');
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['registro-socio-tipos'] }),
  });
};