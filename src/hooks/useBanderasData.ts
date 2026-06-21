/**
 * useBanderasData
 * ---------------------------------------------------------------
 * Hooks para leer / guardar el pin sheet (tabla `banderas`).
 *
 * Una fila = (torneo_id, hoyo, depth, frente, lateral, lateral_lado,
 *             desde_centro, titulo). Editable desde /admin → Banderas.
 *
 * Backend: server/api/banderas.php.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBanderasUrl } from '@/config/api';
import { useTorneoId } from '@/hooks/useTorneoId';
import type { PinSheetHole } from '@/data/banderasData';

/** Respuesta del GET. */
export interface BanderasResponse {
  holes: PinSheetHole[];
}

/** Lectura pública del pin sheet del torneo activo. */
export const useBanderas = () => {
  const { torneoId } = useTorneoId();
  return useQuery({
    queryKey: ['banderas', torneoId],
    queryFn: async (): Promise<BanderasResponse> => {
      const res = await fetch(getBanderasUrl());
      if (!res.ok) throw new Error('Error al cargar banderas');
      return res.json();
    },
    enabled: !!torneoId,
    staleTime: 30_000,
  });
};

/** Mutación admin — replace-all para el torneo activo. */
export const useSaveBanderas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      torneoid: number;
      holes: PinSheetHole[];
      password: string;
    }) => {
      const res = await fetch(getBanderasUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al guardar banderas');
      return json;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banderas'] }),
  });
};
