# Plan: /matchplay (Brackets Match Play por categoría)

## Alcance
Página pública nueva `/matchplay` + sección en `/admin` para capturar ganadores y resetear matches de las categorías con `sistema = 'MATCH PLAY'`. **No** toca `/resultados` ni `/competicion`.

## Backend (PHP)

### 1. `server/api/matchplay_categories.php` (nuevo, GET)
Devuelve las categorías del torneo que cumplen:
- `categorias.sistema = 'MATCH PLAY'` y `estatus = 1`
- Tienen ≥1 jugador en `jugadores` (no BAJA) **o** ≥1 fila en `eliminacion_directa`

Por categoría: `categoria_id`, `categoria`, `abreviatura`, `tipoed`, `formato` (para detectar parejas), `playerCount`, `matchCount`.

### 2. `server/api/resultados_ed.php` (extender)
Hoy es read-only y devuelve matches D1 (1xx). Cambios:
- Detectar parejas (`formato = 'PAREJAS'`) y leer de `v_equipo_ed_par` cuando aplique.
- Devolver TODOS los matches (D1 = 1xx winners y D2 = 2xx losers/consolación) en una sola respuesta agrupada `{ d1: [...], d2: [...] }`.
- Incluir `tipoed` y `sistema` en la metadata.

### 3. `server/api/matchplay_admin.php` (nuevo, POST)
Acciones (auth: superadmin password vía interceptor + `_staff_auth.php` área `brackets`):
- `set_winner`: body `{ matchid, ganador, hoyo?, resultado? }` → `UPDATE eliminacion_directa SET gano=?, hoyo=?, resultado=? WHERE id=?` filtrado por `torneoid + categoriaid`.
- `reset_match`: `{ matchid }` → setea `gano=NULL, hoyo=NULL, resultado=NULL`.
- **Nota**: la propagación a la siguiente ronda y el envío del perdedor a D2 ya la maneja la lógica legacy externa que el usuario mencionó; este endpoint solo escribe `gano` del match. (Si después se necesita propagación interna, se agrega como fase 2.)

## Frontend

### 4. `src/hooks/useMatchPlay.ts` (nuevo)
- `useMatchPlayCategories()` → GET `matchplay_categories.php`
- `useMatchPlayBracket(catid)` → GET `resultados_ed.php?catid=...` con polling 30s
- `useSetMatchWinner()` / `useResetMatch()` → POST `matchplay_admin.php` con superadmin password

### 5. `src/pages/MatchPlay.tsx` (nuevo, ruta `/matchplay`)
- `PageHero` con título "Match Play" + subtítulo + imagen hero generada (`src/assets/matchplay-hero.jpg`).
- Si no hay categorías MATCH PLAY → mensaje "Esta vista no está disponible para este torneo".
- Vista 1 (sin selección): grid de cards de categorías (mismo estilo que `/resultados`), muestra solo categorías con jugadores.
- Vista 2 (categoría seleccionada): bracket completo con botón **"Volver a categorías"** estilo `bg-primary/10`.
  - Layout reutilizable: render simple en columnas por ronda (cuartos / semis / final) basado en `matchid` (1xx).
  - Si la categoría tiene matches 2xx → tabs **Ganadores (D1) / Consolación (D2)**.
  - Cards de match: muestran nombre, club logo, seed; resalta ganador (verde) y muestra `hoyo`/`resultado` (ej. "3&2").

### 6. `src/components/admin/AdminMatchPlay.tsx` (nuevo)
- Mismo flujo categoría → bracket que la pública.
- En cada match con ambos jugadores presentes:
  - Botones "Ganó J1" / "Ganó J2" (dropdown opcional para `hoyo` y `resultado`).
  - Botón "Resetear" si ya hay ganador.
- Confirmación toast por acción; refetch automático.

### 7. Wiring
- `src/App.tsx`: agregar ruta `<Route path="/matchplay" element={<ProtectedRoute pageId="matchplay"><MatchPlay /></ProtectedRoute>} />`.
- `src/pages/Admin.tsx`: nueva tab `matchplay` (icono `Swords`), área staff `brackets` (reusa permiso), render `<AdminMatchPlay />`.
- Registrar `matchplay` en `PageVisibilityContext` / menú (visible por default si torneo tiene MP).
- Hero image: generar `src/assets/matchplay-hero.jpg` (golf + bracket / cara a cara).

## Tablas / Columnas usadas (sin migrations)
- `categorias` (`sistema`, `tipoed`, `formato`)
- `jugadores`
- `eliminacion_directa` (`id`, `jugadorid1/2`, `gano`, `hoyo`, `resultado`, `categoriaid`, `torneoid`)
- Vistas `v_equipo_ed` / `v_equipo_ed_par`

## Out of scope (no se toca)
- Generación inicial del bracket / siembra (lo hace la herramienta legacy).
- Propagación automática D1→D2 desde este endpoint.
- `/resultados`, `/competicion`, brackets de Putt Finales.

¿Confirmas y procedo? Si quieres que también incluya propagación automática (set_winner mueve al ganador a su next match en `elimin_salidas_cat` y al perdedor al D2), lo agrego como fase 2 en este mismo plan.
