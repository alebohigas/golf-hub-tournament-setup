# Plan de cambios

## 1. Slogan editable desde /admin → Estadísticas
Actualmente el tagline del footer está hardcoded en `Footer.tsx` (con un override para torneo 354). Mover a configuración por torneo.

- **`site_config`**: reusar el JSON ya existente (`stats_page_config` o crear campo simple `footer_tagline`). Voy a añadirlo dentro de `stats_page_config` como `footerTagline` para no crear otra columna.
- **`AdminStatsPage.tsx`**: nuevo `<Textarea>` "Slogan del footer" con guardado.
- **`Footer.tsx`**: leer `stats_page_config.footerTagline` vía `useSiteConfig`; si vacío, usar el default actual (con el fallback 354).

## 2. Botones del Hero configurables en /admin → Páginas
Actualmente el Hero muestra dos botones fijos con fallback a `/jugadores` y `/convocatoria`.

- Añadir en `PageVisibilityContext` (persistido en `site_config`) un nuevo objeto:
  ```
  homeButtons: { button1: pageId, button2: pageId }
  ```
- **`AdminPagina.tsx` (subtab visibilidad o nuevo subtab pequeño "Botones Home")**: dos selects mostrando todas las páginas; validar máximo 2 seleccionadas.
- **`Hero.tsx`**: leer `homeButtons`; si la página seleccionada está oculta o no existe, caer al fallback (`/jugadores` para botón 1, `/convocatoria` para botón 2).

## 3. Estandarizar "Cat" y "Dist" en /competicion
Buscar en `src/components/competencias/CompetenciasTable.tsx` y `src/data/competencias/columns.ts` los headers de columna:
- Reemplazar `"Categoría"` / `"Categoria"` → `"Cat"`
- Reemplazar `"Distancia"` → `"Dist"`

Cambio puramente de labels (frontend), sin tocar keys ni backend.

## 4. Colores grises para no-show/DQ en /stats
En `ClubesAsistentesSection.tsx` (NoShowCard) reemplazar clases de rojo/destructive por grises neutros (`text-muted-foreground`, `bg-muted`, `border-border`).

## 5. Relación de tipos de socio (nuevo subtab en /admin/pre-registro)

### Backend
- **Migración** `2026_07_21_socio_tipos.sql`:
  ```sql
  CREATE TABLE public.socio_tipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    torneoid INT NOT NULL,
    nombre_club VARCHAR(120) NOT NULL,    -- lo que ve el usuario
    tipo_sistema ENUM('titular','emerito','dependiente') NOT NULL,
    orden INT DEFAULT 0,
    activo TINYINT(1) DEFAULT 1
  );
  ```
- **Nuevo endpoint** `server/api/socio_tipos.php`: GET público (para el formulario), POST autenticado (superadmin/staff).

### Frontend
- **`AdminSocioTipos.tsx`**: tabla editable (nombre club + dropdown tipo sistema), agregar/eliminar filas, guardar. Se monta como nuevo subtab dentro de `AdminRegistro` (o al nivel del contenedor Pre-Registro).
- **`Registro.tsx`**: el dropdown de "Tipo de socio" ahora consume `/api/socio_tipos.php?torneoid=X`. Guarda `nombre_club` para display y **el valor que se envía al proceso existente sigue siendo `tipo_sistema`** (titular/emerito/dependiente) para no romper precios ni categorías.
- Si no hay filas configuradas para el torneo → fallback al comportamiento actual (opciones hardcoded).

## Notas técnicas
- Todos los cambios de backend pasan por los endpoints con auth dual superadmin/staff que ya arreglamos.
- Nada rompe la funcionalidad de precios ni validación de socio existente (la clave sigue siendo `titular|emerito|dependiente`).
- Los cambios son independientes; se pueden desplegar en cualquier orden.

## Orden de implementación sugerido
1, 3, 4 (cambios pequeños/frontend) → 2 (context + hero) → 5 (migración + endpoint + UI + integración en Registro).

¿Procedo con los 5 en una sola tanda, o prefieres que los divida en dos entregas (1-4 primero, luego 5)?
