/**
 * useApproachClasificados
 * Hook de datos del reporte "Clasificados de Approach".
 * Lee /api/approach_clasificados.php, que junta a TODOS los jugadores de
 * `torneos.approachjug` que caen dentro de los parámetros de la competencia y
 * los ordena por distancia (asc/desc) y, en empate, por fecha/hora de registro.
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getApproachClasificadosUrl, POLL_ACTIVE } from '@/config/api';
import { getTorneoId } from '@/hooks/useTorneoId';

/** Dirección de ordenamiento por distancia. */
export type ApproachOrden = 'asc' | 'desc';

/** Un jugador clasificado de approach. */
export interface ApproachClasificado {
  position: number;
  id: string;
  name: string;
  club: string;
  clubLogo: string;
  category: string;
  /** Descripción del premio/grupo de la competencia. */
  group: string;
  distance: number;
  /** Fecha y hora de registro (YYYY-MM-DD HH:MM) usada como desempate. */
  fecha: string | null;
}

/** Resumen de un grupo/premio de la competencia. */
export interface ApproachGrupo {
  descripcion: string;
  lugares: number;
  playerCount: number;
}

/** Respuesta completa del endpoint. */
export interface ApproachClasificadosResponse {
  orden: ApproachOrden;
  total: number;
  lastUpdated: string | null;
  groups: ApproachGrupo[];
  players: ApproachClasificado[];
}

/**
 * @param orden Dirección de ordenamiento por distancia.
 * @param enabled Permite diferir la consulta hasta que el reporte se muestre.
 */
export const useApproachClasificados = (orden: ApproachOrden = 'asc', enabled = true) => {
  const tid = getTorneoId();

  return useQuery<ApproachClasificadosResponse>({
    queryKey: ['approach-clasificados', tid, orden],
    queryFn: () => apiFetch<ApproachClasificadosResponse>(getApproachClasificadosUrl(orden)),
    enabled,
    staleTime: POLL_ACTIVE,
    refetchInterval: POLL_ACTIVE,
  });
};
