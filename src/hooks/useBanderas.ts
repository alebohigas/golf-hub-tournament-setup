/**
 * useBanderas
 * ---------------------------------------------------------------
 * Hooks para leer y guardar el pin sheet (posición de banderas) del
 * torneo activo. Backend: server/api/banderas.php (tablas
 * `banderas_pin_sheet` + `banderas_round`).
 *
 * Una pin-sheet entry = (hole_number, depth, pin_from_front,
 * pin_from_side, pin_side, center_offset). El `round` opcional añade
 * etiqueta y fecha visibles encima de la grid pública.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBanderasUrl } from '@/config/api';
import { useTorneoId } from '@/hooks/useTorneoId';

/** Una fila tal como vive en la BD. */
export interface BanderaHole {
  hole_number: number;
  depth: number;
  pin_from_front: number;
  pin_from_side: number;
  pin_side: 'L' | 'R';
  center_offset: number;
}

/** Metadata opcional del round publicado. */
export interface BanderaRoundMeta {
  round_label: string | null;
  round_date: string | null;
}

/** Shape devuelto por GET /api/banderas.php. */
export interface BanderasResponse {
  round: BanderaRoundMeta | null;
  holes: BanderaHole[];
}

/** Lectura — usada por la página pública y por el admin. */
export const useBanderas = () => {
  const { torneoId } = useTorneoId();
  return useQuery({
    queryKey: ['banderas', torneoId],
    queryFn: async (): Promise<BanderasResponse> => {
      const res = await fetch(getBanderasUrl());
      if (!res.ok) throw new Error('Error al cargar pin sheet');
      return res.json();
    },
    enabled: !!torneoId,
    staleTime: 30_000,
  });
};

/** Mutación admin — replace-all del pin sheet del torneo activo. */
export const useSaveBanderas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      torneoid: number;
      round?: Partial<BanderaRoundMeta>;
      holes: BanderaHole[];
      password: string;
    }) => {
      const res = await fetch(getBanderasUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al guardar pin sheet');
      return json;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banderas'] }),
  });
};