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

/**
 * Respuesta del GET de banderas.
 * - `today`           : fecha de hoy según el servidor (YYYY-MM-DD).
 * - `activeDate`      : fecha cuyos `holes` se están devolviendo (null si no hay).
 * - `availableDates`  : todas las fechas con datos (sólo <= hoy para público).
 */
export interface BanderasResponse {
  holes: PinSheetHole[];
  today: string;
  activeDate: string | null;
  availableDates: string[];
  /** True si hay tarjetas con fecha_juego = hoy y statlsc != 1 (bloquea
   *  publicar el pin sheet de mañana). */
  playersStillPlayingToday?: boolean;
  error?: string;
}

/**
 * Lectura pública del pin sheet del torneo activo.
 *
 * @param opts.fecha  Fecha específica (YYYY-MM-DD). Si se omite, el backend
 *                    devuelve la fecha más reciente <= hoy con datos.
 * @param opts.admin  Modo admin (incluye fechas futuras en `availableDates`).
 */
export const useBanderas = (opts: {
  fecha?: string;
  admin?: boolean;
} = {}) => {
  const { torneoId } = useTorneoId();
  const { fecha, admin } = opts;
  return useQuery({
    queryKey: ['banderas', torneoId, fecha ?? null, admin ?? false],
    queryFn: async (): Promise<BanderasResponse> => {
      const res = await fetch(getBanderasUrl({
        fecha,
        admin,
        password: admin ? 'admin2025' : undefined,
      }));
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
      fecha: string;          // YYYY-MM-DD — la fecha que se está reemplazando
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
