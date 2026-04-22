---
name: admin-avisos-layout
description: Admin tab to configure Avisos page poster grid (cols 1-4 + gap sm/md/lg/xl) per breakpoint with dual desktop/mobile preview, mirrors admin-eventos-layout
type: feature
---
El admin (`/admin` → tab "Avisos") permite configurar de forma INDEPENDIENTE el grid de posters de la página Avisos para Desktop y Mobile: columnas 1-4 y gap (sm=8px, md=16px, lg=24px, xl=32px). Muestra live preview dual (~1100px desktop, 390px mobile). Persistido server-side en `site_config.avisos_config` (JSON: `{desktopColumns, mobileColumns, desktopGap, mobileGap}`). El componente público `src/components/avisos/AvisosPostersSection.tsx` lee la config con `useSiteConfig` y compone clases Tailwind estáticas. Posters bundleados en `src/assets/avisos/` (aviso-climatologico + tabla1..tabla5). Defaults: 3 cols desktop / 1 col mobile. Requiere migración SQL manual en IONOS: `ALTER TABLE site_config ADD COLUMN avisos_config TEXT DEFAULT NULL COMMENT 'JSON object with avisos page display settings';`
