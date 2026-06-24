/**
 * useUploads
 * -----------------------------------------------------------------------
 * React Query hooks for the `/api/uploads.php` endpoint that manages
 * admin-uploaded media (images per page section + PDFs).
 *
 * Sections supported by the backend:
 *   - 'eventos'      → poster grid for the Eventos page
 *   - 'avisos'       → poster grid for the Avisos page
 *   - 'premios'      → poster grid for the Premios page
 *   - 'convocatoria' → reserved poster grid for the Convocatoria page
 *   - 'reglas'       → reserved poster grid for the Reglas page
 *   - 'pdfs'         → PDFs referenced by Convocatoria/Reglas pages
 *   - 'popup'        → images used by the site-wide POP UP overlay
 *
 * The list endpoint is public (read-only). Upload + delete require the
 * shared admin password (`admin2025`) sent in the multipart/JSON body.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/apiClient';

/** Section identifiers accepted by the uploads endpoint. */
export type UploadSection = 'eventos' | 'avisos' | 'premios' | 'hoteles' | 'convocatoria' | 'reglas' | 'banderas' | 'pdfs' | 'popup';

/** Single uploaded file as returned by the listing endpoint. */
export interface UploadedFile {
  /** Sanitized server-side filename (e.g. `01-clima.webp`). */
  name: string;
  /** Public URL relative to the current origin (e.g. `/api/uploads/{domain}/eventos/01-clima.webp`). */
  url: string;
  /** Auto-generated alt label derived from the filename. */
  alt: string;
  /** File size in bytes. */
  size: number;
  /** Last-modified Unix timestamp (seconds). */
  modified: number;
}

/** Response shape of `GET /api/uploads.php?section=...`. */
interface UploadsListResponse {
  section: UploadSection;
  /** Human-readable label: 'imagen' | 'PDF'. */
  kind: string;
  files: UploadedFile[];
}

/** Response shape of `POST /api/uploads.php?action=upload`. */
interface UploadResponse {
  section: UploadSection;
  saved: Array<{ name: string; original: string; url: string; size: number }>;
  errors: Array<{ name: string; error: string }>;
}

/** Build the listing endpoint URL for a section. */
const listUrl = (section: UploadSection) => `/api/uploads.php?section=${encodeURIComponent(section)}`;

/** Build the upload endpoint URL for a section. */
const uploadUrl = (section: UploadSection) =>
  `/api/uploads.php?section=${encodeURIComponent(section)}&action=upload`;

/** Build the delete endpoint URL for a section. */
const deleteUrl = (section: UploadSection) =>
  `/api/uploads.php?section=${encodeURIComponent(section)}&action=delete`;

/** React Query key factory. */
export const uploadsQueryKey = (section: UploadSection) => ['uploads', section] as const;

/**
 * Maximum per-file size enforced on the client BEFORE the upload starts.
 * Kept slightly below the backend cap (15 MB) so we catch problems early
 * with a friendly message instead of relying on PHP's `upload_max_filesize`
 * / `post_max_size`, which on some shared hosts (IONOS default ~2 MB)
 * silently truncates the POST body and produces an opaque 500/HTML error.
 */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

/** Human readable cap used in UI strings/toasts. */
export const MAX_UPLOAD_LABEL = '15 MB';

/** Format bytes as MB with one decimal — used in oversized-file messages. */
const formatMB = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/**
 * Validate a list of selected files against the client-side size cap.
 * Returns `{ ok, oversized }` so callers can decide whether to proceed
 * with the remaining files or abort outright.
 */
export const validateUploadFiles = (files: File[]) => {
  const ok: File[] = [];
  const oversized: Array<{ name: string; size: number }> = [];
  for (const f of files) {
    if (f.size > MAX_UPLOAD_BYTES) {
      oversized.push({ name: f.name, size: f.size });
    } else {
      ok.push(f);
    }
  }
  return { ok, oversized, formatMB };
};

/**
 * useUploadsList
 * Lists files currently present in the given section folder on the server.
 * Cached for 30 s; invalidated automatically after upload/delete mutations.
 */
export const useUploadsList = (section: UploadSection) => {
  return useQuery<UploadsListResponse>({
    queryKey: uploadsQueryKey(section),
    queryFn: () => apiFetch<UploadsListResponse>(listUrl(section)),
    staleTime: 30_000,
  });
};

/**
 * useUploadFiles
 * Mutation: upload one or more files (multipart/form-data) to the section.
 * Uses raw `fetch` because the shared `apiFetch` only handles GET/JSON.
 */
export const useUploadFiles = (section: UploadSection) => {
  const queryClient = useQueryClient();

  return useMutation<UploadResponse, Error, { files: File[]; password: string }>({
    mutationFn: async ({ files, password }) => {
      if (files.length === 0) {
        throw new Error('Selecciona al menos un archivo.');
      }
      // Defensive client-side cap. The Admin UI already filters oversized
      // files before calling the mutation, but this guard ensures any other
      // caller still gets a clear error instead of an opaque server 500.
      const tooBig = files.find((f) => f.size > MAX_UPLOAD_BYTES);
      if (tooBig) {
        throw new Error(
          `El archivo "${tooBig.name}" pesa ${formatMB(tooBig.size)} y supera el máximo permitido de ${MAX_UPLOAD_LABEL}. Reduce su tamaño (por ejemplo exportándolo como JPG/WebP comprimido) antes de subirlo.`
        );
      }
      const formData = new FormData();
      formData.append('password', password);
      // Backend accepts repeated `files[]` field for multi-file uploads.
      files.forEach((file) => formData.append('files[]', file, file.name));

      let response: Response;
      try {
        response = await fetch(uploadUrl(section), { method: 'POST', body: formData });
      } catch (networkErr) {
        // Network errors here on large uploads usually mean the host
        // (e.g. IONOS) rejected the POST size before PHP could respond.
        throw new Error(
          `No se pudo contactar al servidor. Si subiste un archivo grande, puede que supere el límite del hosting (intenta uno por uno o reduce el tamaño).`
        );
      }
      const text = await response.text();
      let parsed: any = null;
      try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }

      // 413 / 500 with HTML body → almost always an oversized POST that
      // tripped the web server's body limit. Surface a friendly hint.
      if (response.status === 413 || (!response.ok && !parsed)) {
        const totalMB = formatMB(files.reduce((s, f) => s + f.size, 0));
        throw new ApiError(
          `El servidor rechazó la subida (HTTP ${response.status}). El total enviado fue ${totalMB}; probablemente excede el límite del hosting. Intenta subir un archivo a la vez o reducir el tamaño/peso de la imagen.`,
          response.status,
          uploadUrl(section),
          text,
          parsed
        );
      }

      if (!response.ok) {
        const message = parsed?.error || `Error subiendo archivos (HTTP ${response.status})`;
        throw new ApiError(message, response.status, uploadUrl(section), text, parsed);
      }
      if (!parsed) {
        throw new ApiError('Respuesta inválida del servidor', response.status, uploadUrl(section), text);
      }
      return parsed as UploadResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadsQueryKey(section) });
    },
  });
};

/**
 * useDeleteFile
 * Mutation: delete a single file from the section folder by sanitized name.
 */
export const useDeleteFile = (section: UploadSection) => {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: true; name: string }, Error, { name: string; password: string }>({
    mutationFn: async ({ name, password }) => {
      const response = await fetch(deleteUrl(section), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });
      const text = await response.text();
      let parsed: any = null;
      try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }

      if (!response.ok) {
        const message = parsed?.error || `Error eliminando archivo (HTTP ${response.status})`;
        throw new ApiError(message, response.status, deleteUrl(section), text, parsed);
      }
      return parsed as { deleted: true; name: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadsQueryKey(section) });
    },
  });
};
