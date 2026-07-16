/**
 * useRegistroPreferente
 * ---------------------------------------------------------------------
 * Hook para leer/guardar la configuración de "Registro Preferente"
 * (ventana previa donde solo socios de clubes autorizados pueden
 * pre-registrarse). Backed by /api/registro_preferente.php.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRegistroPreferenteUrl } from '@/config/api';

/** Un club autorizado dentro de la ventana preferente. */
export interface PreferenteClub {
  /** clubid de la tabla `clubs`. */
  id: number;
  /** Nombre visible del club. */
  nombre: string;
  /** Ventana individual (usada cuando same_range = 0). */
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
}

/** Payload devuelto por GET. */
export interface PreferenteConfig {
  fecha_inicio: string | null;
  fecha_fin:    string | null;
  /** 1 = todos usan el rango global; 0 = cada club tiene su ventana. */
  same_range: 0 | 1;
  clubs: PreferenteClub[];
  /** Precomputado por el servidor con la fecha del servidor. */
  active_now: boolean;
  /** ClubIds autorizados HOY (según ventana vigente). */
  allowed_club_ids: number[];
  server_today?: string;
}

/** Lee la configuración preferente para el torneo activo. */
export const useRegistroPreferente = () => {
  return useQuery<PreferenteConfig>({
    queryKey: ['registro-preferente'],
    queryFn: async () => {
      const res = await fetch(getRegistroPreferenteUrl());
      if (!res.ok) throw new Error('Failed to fetch registro preferente');
      return res.json();
    },
    staleTime: 30_000,
  });
};

/** Guarda config global + lista de clubes autorizados. */
export const useSaveRegistroPreferente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      torneoid: number;
      fecha_inicio: string | null;
      fecha_fin: string | null;
      same_range: 0 | 1;
      clubs: { clubid: number; fecha_inicio?: string | null; fecha_fin?: string | null }[];
      password: string;
    }) => {
      const res = await fetch(getRegistroPreferenteUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to save preferente');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registro-preferente'] });
    },
  });
};