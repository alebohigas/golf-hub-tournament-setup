/**
 * useDistanciasData
 * Lee campos, mesas activas, categorías, yardas, par y ventajas de DISTANCIAS.
 */
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { getDistanciasUrl, POLL_SLOW } from '@/config/api';

/** Categoría asignada a una mesa de salida. */
export interface DistanciasCategory {
  id: number;
  name: string;
}

/** Medidas y ventajas comparadas de un hoyo. */
export interface DistanciasHole {
  numero: number;
  yardas: number;
  par: number;
  ventaja: number;
  ventajaCampo: number | null;
  ventajaDiferente: boolean;
}

/** Mesa de salida activa con colores y medidas. */
export interface DistanciasTee {
  id: number;
  tee: string;
  bgcolor: string;
  color: string;
  categories: DistanciasCategory[];
  holes: DistanciasHole[];
  totalYardas: number;
  totalPar: number;
}

/** Campo activo del torneo. */
export interface DistanciasCampo {
  id: number;
  campo: string;
  tees: DistanciasTee[];
}

/** Respuesta completa del endpoint de distancias. */
interface DistanciasResponse {
  campos: DistanciasCampo[];
}

/** Consulta las distancias del torneo activo. */
export const useDistanciasData = () =>
  useQuery<DistanciasResponse>({
    queryKey: ['distancias'],
    queryFn: async () => {
      const data = await apiFetch<Partial<DistanciasResponse>>(getDistanciasUrl());
      return { campos: Array.isArray(data?.campos) ? data.campos : [] };
    },
    staleTime: POLL_SLOW,
  });
