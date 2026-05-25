/**
 * useRegistroFields
 * Fetches and mutates the registro form-field configuration for the
 * active tournament. Backed by /api/registro_fields.php.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRegistroFieldsUrl } from '@/config/api';

/** A single field configuration row. */
export interface RegistroField {
  field_name: string;
  field_label: string;
  is_enabled: 0 | 1;
  is_required: 0 | 1;
  display_order: number;
  /**
   * Logical section this field belongs to in the public Pre-Registro form.
   * Used to drive the progressive-reveal UI ("basica" → "socios" → "adicionales").
   * Optional for backwards-compat with rows saved before the column existed.
   */
  section?: 'basica' | 'socios' | 'adicionales' | string;
}

interface RegistroFieldsResponse {
  fields: RegistroField[];
  source: 'db' | 'defaults';
}

/** Read configured fields (falls back to defaults when DB is empty). */
export const useRegistroFields = () => {
  return useQuery<RegistroFieldsResponse>({
    queryKey: ['registro-fields'],
    queryFn: async () => {
      const res = await fetch(getRegistroFieldsUrl());
      if (!res.ok) throw new Error('Failed to fetch registro fields');
      return res.json();
    },
  });
};

/** Save a complete field set (admin). */
export const useSaveRegistroFields = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { torneoid: number; fields: RegistroField[]; password: string }) => {
      const res = await fetch(getRegistroFieldsUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to save fields');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registro-fields'] });
    },
  });
};