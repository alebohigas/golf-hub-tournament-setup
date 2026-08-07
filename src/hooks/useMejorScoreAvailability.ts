/**
 * useMejorScoreAvailability
 * Indica si el torneo activo TIENE datos del reporte "Mejor Score del Día"
 * (/api/mejor_score_diario.php). Se usa en /competicion para NO presentar el
 * reporte (ni en el submenú ni en la grilla) cuando el torneo no lo maneja
 * (p. ej. torneos 360 y 349), incluso si la visibilidad está activa en /admin.
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { API_BASE_URL, POLL_ACTIVE } from '@/config/api';
import { getTorneoId } from '@/hooks/useTorneoId';

/** Subset mínimo de la respuesta: solo interesa cuántas secciones hay. */
interface MejorScoreSectionMeta {
  fecha?: string;
  stableford?: unknown[];
  strokePlay?: unknown[];
}

/**
 * @param enabled Solo consulta si el reporte está activado en /admin.
 * @returns hasData=true cuando existe al menos una sección con jugadores.
 */
export const useMejorScoreAvailability = (enabled = true) => {
  const tid = getTorneoId();

  const { data, isLoading } = useQuery<MejorScoreSectionMeta[]>({
    queryKey: ['mejor-score-diario', tid, 'availability'],
    queryFn: () =>
      apiFetch<MejorScoreSectionMeta[]>(
        `${API_BASE_URL}/mejor_score_diario.php${tid ? `?torneoid=${tid}` : ''}`,
      ),
    enabled,
    staleTime: POLL_ACTIVE,
  });

  /** Hay datos solo si alguna sección trae jugadores en cualquiera de los formatos. */
  const hasData = Array.isArray(data)
    && data.some((s) => (s.stableford?.length ?? 0) > 0 || (s.strokePlay?.length ?? 0) > 0);

  return { hasData, isLoading };
};