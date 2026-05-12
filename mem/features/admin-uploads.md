---
name: Admin uploads feature
description: Critical Archivos tab in /admin for uploading images/PDFs displayed in Eventos, Avisos, Convocatoria, Reglas y CC
type: feature
---
The /admin dashboard has an **Archivos** tab (8th tab) that uploads images and PDFs to the IONOS server, scoped per-domain via Host header.

## Files involved (do not delete or revert)
- `src/components/admin/AdminUploads.tsx` — UI with sub-tabs: Eventos, Avisos, Convocatoria, Reglas
- `src/hooks/useUploads.ts` — list/upload/delete via /api/uploads.php
- `server/api/uploads.php` — REST endpoint, Host-scoped storage in api/uploads/{host}/{section}/
- `src/lib/posterAssets.ts` — resolves local + remote uploaded posters

## Public pages consuming uploads
- `src/pages/Convocatoria.tsx` — gallery + downloadable PDF (first PDF in convocatoria section)
- `src/pages/Reglas.tsx` — downloadable Reglas y CC PDF (first PDF in reglas section)
- `src/components/eventos/AtraccionesSection.tsx` — uses uploaded posters
- `src/components/avisos/AvisosPostersSection.tsx` — uses uploaded posters

## Admin previews
- `src/components/admin/AdminEventos.tsx` and `AdminAvisos.tsx` pass `posters={previewPosters}` (resolved from posterAssets) to the layout grids.

## Deployment
Requires `api/uploads.php` on IONOS + writable `api/uploads/` directory (chmod 755+).
