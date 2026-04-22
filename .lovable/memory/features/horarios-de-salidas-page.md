---
name: horarios-de-salidas-page
description: Horarios de Salidas page shows earliest valid kickoff time per category × day, sourced from salidagrupo.horainicio1a aggregated by caljuegoid (caljuego.fecha + categoriaid), ignoring '00:00:00'. Endpoint /api/horarios.php.
type: feature
---
**Page**: `/horarios` (id `horarios`, label "HORARIOS DE SALIDAS").
**Layout**: matrix table — rows = categories, columns = tournament days. Cells display the earliest valid `salidagrupo.horainicio1a` in `HH:MM` (24h). Empty cells render an em-dash.
**Data flow**: `caljuego.torneoid` → `caljuego.id` → `salidagrupo.caljuegoid` → `salidagrupo.categoriaid` → `categorias`. Aggregation = `MIN(horainicio1a)` per `(fecha, categoriaid)`.
**Validity**: `00:00:00` is filtered both in SQL (`WHERE`) and post-processing as a defensive second check.
**Admin**: managed via standard PageVisibility flow (visibility, menu order, group assignment). Intended grouping: "Horarios" together with "Calendario de Juego".
**Files**: `server/api/horarios.php`, `src/hooks/useHorariosData.ts`, `src/pages/Horarios.tsx`, hero `src/assets/horarios-hero.jpg`.
