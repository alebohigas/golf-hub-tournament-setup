# Rework: Brackets Putt (Finales Caballero / Dama)

## Resumen
Quitar todo el sistema viejo de brackets genéricos (flag `is_bracket` por premio, AdminBrackets, BracketView por premio) y reemplazarlo por **dos brackets fijos por torneo**: uno masculino y uno femenino, sembrados automáticamente a partir del **ranking acumulado de putt** de todas las competiciones del torneo (misma lógica que `listado_ganadores_put-2.php` pero bien separada por sexo).

---

## Cambios funcionales (lo que verá el usuario)

### En `/competicion`
- Se elimina la lógica actual de "Putt Finales Caballeros / Damas" (vienen del flag `is_bracket` en filas de `putt`).
- Aparecerán como dos competiciones nuevas, **solo si el admin las habilita**:
  - **Putt Finales Caballero**
  - **Putt Finales Dama**
- Al entrar, se muestra el bracket renderizado (estructura visual igual a la actual `BracketView`).

### En `/admin`
- Se elimina la pestaña actual "Brackets" (lista de premios con checkboxes + configurador).
- Se agrega **"Brackets Putt"** con:
  1. Selector de **tamaño** (8 / 16 / 32 / 64 / 128) por bracket.
  2. Toggle **visible público** por bracket (M y F independientes).
  3. Botón **"Generar / Regenerar bracket"** que recalcula sembrado desde el ranking acumulado.
  4. Lista visual del bracket con cada match editable: capturar `score1`, `score2` → al guardar, el sistema marca winner y avanza automáticamente al siguiente match.
  5. Botón **"Mover manualmente"** por match (override del ganador sin scores).

---

## Estructura de datos (DB)

### Reutilizamos tablas existentes con cambios mínimos
- `bracket_config` y `bracket_matches` ya existen. Las reutilizamos.
- Para distinguir los dos brackets fijos por torneo, usamos convención en `prize_table` + `prize_id`:
  - `prize_table = 'putt_finales'` (nuevo valor permitido)
  - `prize_id = 1` para Caballero (M), `prize_id = 2` para Dama (F)
- Esto deja todas las filas viejas de `bracket_config` (con `prize_table` en `oyes/approach/...`) intactas pero ya no las usaremos; se pueden limpiar manualmente después.

### Migración nueva
```sql
-- Nuevas columnas en bracket_config para los brackets putt
ALTER TABLE bracket_config
  ADD COLUMN sexo CHAR(1) NULL,           -- 'M' | 'F' (solo para prize_table='putt_finales')
  ADD COLUMN visible TINYINT(1) NOT NULL DEFAULT 0;  -- visibilidad pública

-- Limpiar flags is_bracket viejos (opcional, no destructivo)
-- UPDATE oyes/oyesx/approach/putt/driver/driverp SET is_bracket = 0;
```

No tocamos `bracket_matches` (su esquema actual ya soporta lo que necesitamos: player1/2_id, scores, winner_id, next_match_id, next_slot).

---

## Lógica de sembrado (PHP nuevo en `brackets.php`)

Replicar exactamente la consulta de `listado_ganadores_put-2.php` pero **filtrando por `SEXO`**:

```sql
-- Para cada premio del torneo con HOYO N, tomar las N mejores distancias
-- (mismo subquery UNION del archivo legacy)
-- AÑADIR filtro: JOIN jugadores j WHERE j.sexo = 'M'  (o 'F')
-- Orden final: distancia ASC, ultact ASC, LIMIT = size del bracket
```

El bug del archivo original (no separa por sexo en el subquery interno) se corrige aplicando el filtro de `sexo` **dentro de cada subquery del UNION**, no solo en el outer.

Los `jugadorid` resultantes (1..size) se asignan a los slots del bracket usando la función ya existente `build_seed_pairs($size)` (1 vs N, 8 vs 9, etc.).

---

## Captura de resultados / avance automático

El usuario indicó que los resultados se capturan "en el mismo lugar de donde se extrae la info de los brackets". El sistema viejo (que estamos quitando) los capturaba en `bracket_matches.player1_score/player2_score` desde AdminBrackets. **Mantenemos ese mecanismo** dentro del nuevo "Brackets Putt" admin: capturar scores ahí mismo dispara `record_score` que ya auto-avanza al ganador.

**Pregunta pendiente para el usuario** (no bloqueante — la dejo anotada en el código): si existe otra tabla legacy donde se registran los puntos de los match-play de la final (p. ej. una vista o tabla aparte de `puttjug`), me la pasas y conectamos el avance auto contra esa fuente. Por defecto, el admin captura los scores en la nueva pantalla.

---

## Archivos a tocar

### Backend (PHP)
- **Nueva migración** `server/migrations/XXXX_putt_finales_bracket.sql` (manual; documentamos en README).
- **`server/api/brackets.php`**: reemplazar acciones. Nuevas acciones:
  - `get_putt_finales` (público): devuelve `{ M: {config, matches, visible}, F: {...} }`
  - `save_putt_config` (admin): guarda `size` y `visible` por sexo
  - `generate_putt` (admin): regenera matches de un bracket (M o F) desde ranking acumulado
  - `record_score` (admin): se conserva tal cual está (ya funciona)
  - `set_winner` (admin, nuevo): override manual del ganador
  - Se eliminan: `list_prizes`, `set_flag`, `save_config`, `generate` (legacy)
- **`server/api/competencias.php`**: quitar la inyección de filas `Putt Finales` (las que veníamos agregando vía `is_bracket=1`).
- **`server/api/competicion.php`**: en su lugar, **si** existe `bracket_config` con `prize_table='putt_finales'` y `visible=1`, inyectar dos pseudo-competiciones ("Putt Finales Caballero", "Putt Finales Dama") en la respuesta, marcadas con un `type: 'putt_finales_bracket'` para que el front sepa renderizar `BracketView`.

### Frontend (TS/React)
- **`src/hooks/useBrackets.ts`**: reemplazar hooks. Nuevos:
  - `usePuttFinales()` (público)
  - `usePuttFinalesAdmin()` (admin)
  - `useSavePuttConfig()`, `useGeneratePuttBracket()`, `useRecordBracketScore()` (conservada), `useSetBracketWinner()` (nueva)
  - Eliminar: `useBracketPrizes`, `useSetBracketFlag`, `useSaveBracketConfig`, `useGenerateBracket`
- **`src/components/admin/AdminBrackets.tsx`**: reescribir completamente como "Brackets Putt" con dos secciones (M / F): selector de tamaño, toggle visible, botón generar, lista de matches con captura de scores y override manual.
- **`src/components/competencias/BracketView.tsx`**: ajustar firma — ahora recibe `sexo: 'M'|'F'` en lugar de `prizeTable/prizeId`. Misma render lógica.
- **`src/pages/Competencias.tsx`**: detectar competiciones con `type === 'putt_finales_bracket'` y renderizar `BracketView` con el sexo correspondiente.
- **`src/data/competencias/types.ts`** y `columns.ts`: agregar el tipo `putt_finales_bracket`.
- **`src/pages/Admin.tsx`**: renombrar la pestaña "Brackets" → "Brackets Putt" (mismo componente).
- **`src/config/api.ts`**: nuevas URLs (`getPuttFinalesUrl`, `getPuttFinalesAdminUrl`, etc.), eliminar las legacy de brackets.

### Memoria
- Actualizar `mem://features/brackets-data-structure` para reflejar la nueva arquitectura (dos brackets por torneo, sembrados desde ranking acumulado, visibilidad toggleable).

---

## Orden de implementación

1. Migración SQL (documentada en `server/api/README.md` — el usuario la corre en su MySQL).
2. Backend: nuevo `brackets.php` + ajustes en `competicion.php` / `competencias.php`.
3. Frontend hooks + tipos + URLs.
4. Reescribir `AdminBrackets.tsx`.
5. Ajustar `BracketView.tsx` + `Competencias.tsx`.
6. Renombrar tab en `Admin.tsx`.
7. QA: generar bracket de prueba, capturar 1-2 scores, verificar avance y visibilidad.

---

## Detalle técnico — separación por sexo (bugfix del PHP legacy)

El archivo `listado_ganadores_put-2.php` filtra por `SEXO` solo en el `DISTINCT PREMIO`, pero el subquery por premio (`SELECT ... FROM v_puttjug WHERE torneoid=X AND premio=Y`) **no filtra por sexo**, así que jugadores del otro sexo se cuelan si comparten premio. Fix: agregar `AND EXISTS (SELECT 1 FROM jugadores j WHERE j.id = v_puttjug.jugadorid AND j.sexo = '$sexo')` (o JOIN equivalente) dentro de cada subquery del UNION.

---

## Preguntas / dependencias del usuario

1. **Captura de scores de match-play**: ¿se quedan en `bracket_matches` (capturadas en el nuevo admin) o existe una tabla legacy específica que ya recibe esos scores y debemos leer de ahí? Si es lo segundo, pasame el nombre de la tabla y el avance se hará 100% automático sin captura manual.
2. **Confirmar correr la migración SQL** en producción cuando esté lista.
