# Página /stats — Estadísticas del Torneo

Nueva página pública con 3 secciones de estadísticas, todas administrables desde `/admin` (nuevo subtab **Estadísticas**), incluyendo orden y overrides manuales.

## Secciones (en orden)

1. **Clubes Asistentes** — total de jugadores + tabla por club (logo, Caballeros / Seniors / Damas / Total) con fila TOTALES.
2. **Estadísticas por Categoría** — selector de categoría; tabla hoyo-por-hoyo con Par, Promedio, Rank de dificultad, conteos Águilas / Birdies / Pares / Bogeys / Doble / Triple+, con subtotales V1, V2 y TOTAL. Header: tee, campo, número de rondas, última actualización.
3. **Estadísticas por Jugador** — usa el mismo `PlayerSearchInput` de `/competicion`; muestra tarjeta hoyo-por-hoyo con Par, R1/R2/R3 (dinámico según rondas), Promedio por hoyo y Rango de dificultad.

## Backend (PHP)

Nuevos endpoints en `server/api/` que consultan las tablas legacy existentes (mismas que ya alimentan resultados/competencias):

- `stats_clubes.php?torneoid=` — agrega jugadores por club y por rama (Caballeros/Seniors/Damas basado en `sexo`/categoría). Devuelve `{ total, clubs: [{ logo, name, caballeros, seniors, damas, total }] }`.
- `stats_categoria.php?torneoid=&categoriaId=` — por hoyo cuenta scores vs par desde `resultados`/`tarjetas`. Devuelve `{ categoryName, tee, course, rounds, updatedAt, holes:[{ hole, par, promedio, rank, aguilas, birdies, pares, bogeys, dobles, triples }] }` con subtotales.
- `stats_jugador.php?torneoid=&jugadorId=` — devuelve pares oficiales, scores R1..Rn, promedios y rango por hoyo.

Los tres endpoints siguen el patrón `config.php` + `safe_exec` + `staff_token`/superadmin auth, y devuelven JSON vacío si faltan tablas (patrón de resiliencia existente).

## Admin (nuevo subtab Estadísticas)

Nuevo componente `src/components/admin/AdminStatsPage.tsx` con:

- **Toggle general** para mostrar/ocultar `/stats` en el menú (sincroniza con visibilidad + menú).
- **Reordenamiento** drag-and-drop de las 3 secciones (usa `@hello-pangea/dnd` que ya está instalado).
- **Toggle por sección** (visible/oculta).
- **Overrides manuales por sección** almacenados en `site_config.stats_page_config` (nuevo campo JSON):
  - Clubes: override de total de jugadores + posibilidad de editar/agregar filas de club manualmente.
  - Por categoría: override de "última actualización", "rondas", o de cualquier celda de la matriz.
  - Por jugador: nota/leyenda manual opcional.
- Migración: `server/migrations/2026_07_21_add_stats_page_config_to_site_config.sql` agregando columna TEXT `stats_page_config`.
- Endpoint `site_config.php` ya soporta pasar campos JSON adicionales; se extiende para persistir el nuevo campo.

## Frontend público

- `src/pages/Stats.tsx` — página con `PageHero` ("ESTADÍSTICAS"), renderiza las 3 secciones en el orden configurado.
- `src/components/stats/ClubesAsistentesSection.tsx` — tabla con logos vía `/api/logo.php` (patrón existente).
- `src/components/stats/EstadisticasCategoriaSection.tsx` — selector de categoría (cards, patrón existente) + tabla estilizada con colores condicionales (águilas rojo, birdies verde, bogeys naranja) usando tokens semánticos del tema activo.
- `src/components/stats/EstadisticasJugadorSection.tsx` — reutiliza `PlayerSearchInput` y renderiza tarjeta al seleccionar.
- Hook `src/hooks/useStatsData.ts` con `useStatsClubes`, `useStatsCategoria`, `useStatsJugador` (React Query, respeta `torneoid`).

## Ruteo y navegación

- Nueva ruta `/stats` en `src/App.tsx`.
- Registrar página en `PageVisibilityContext` + `menu.php` seed para que aparezca en el menú (respetando visibilidad admin).
- Agregar tarjeta opcional en `NavigationCards` respetando patrón existente.

## Estilo

- Fondo `bg-card`, headers de tabla con `bg-primary text-primary-foreground`, filas alternas `bg-muted/30`.
- Códigos de color por tipo de score usando tokens semánticos ya definidos (verdes/rojos/ámbar del tema).
- Números tabulares (`tabular-nums`) y logos según [Table club logo styling](mem://ui-patterns/table-club-logo-styling).
- Mismo patrón de tarjetas de selección de categoría que ya usa Resultados/Competencias.

## Detalles técnicos

- Reordenamiento persistido como `sections: ["clubes","categoria","jugador"]` dentro de `stats_page_config`.
- Overrides manuales: cuando hay valor no-null, se usa; si es null → cálculo automático del endpoint.
- Cache-invalidation en admin tras guardar (patrón `useSaveSiteConfig` existente).
- Sin cambios a lógica de negocio existente; solo lectura de tablas legacy.
