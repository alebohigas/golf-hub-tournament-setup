---
name: admin-eventos-layout
description: Admin tab to configure Eventos page poster grid (cols 1-4 + gap sm/md/lg/xl) per breakpoint with dual desktop/mobile preview
type: feature
---
El admin (`/admin` → tab "Eventos") permite configurar de forma INDEPENDIENTE el grid de posters de la página Eventos para Desktop y Mobile: columnas 1-4 y gap (sm=8px, md=16px, lg=24px, xl=32px) en cada uno. Muestra un live preview dual con marcos fijos (~1100px desktop, 390px mobile). Persistido server-side en `site_config.eventos_config` (JSON: `{desktopColumns, mobileColumns, desktopGap, mobileGap}`). El componente público `src/components/eventos/AtraccionesSection.tsx` lee la config con `useSiteConfig` y compone clases Tailwind estáticas (no dinámicas) para que JIT las incluya. Requiere migración SQL manual en IONOS: `ALTER TABLE site_config ADD COLUMN eventos_config TEXT DEFAULT NULL COMMENT 'JSON object with eventos page display settings';`
