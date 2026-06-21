## Objetivo
Hacer que `/resultados` + clic en `r{n}` repliquen 1:1 el flujo legacy para parejas:
1. `resultados_jug_parejas.php` → ya portado en `server/api/resultados_parejas.php`. Validar ORDER BY.
2. `tarjeta_gogo_handicap.php` y `bola_baja_suma_scores.php` → un solo endpoint JSON `tarjeta_parejas.php` que devuelve los **mismos datos crudos** que usa el legacy (sin recomputar nada — la BD ya trae el Neto correcto en `tarjetas.h{n}_a`).
3. El frontend debe consultar el `estilojuego` **del día específico** antes de pedir la tarjeta y renderizar la variante visual correcta.

## Hallazgos clave del legacy
- `bola_baja_suma_scores.php` y `tarjeta_gogo_handicap.php` son **casi idénticos**. Única diferencia visual:
  - **Go Go** → muestra UNA fila de Gross + UNA de hcp (sólo jugador1) + fila Neto.
  - **Bola Baja / Suma Scores** → muestra DOS filas Gross + DOS hcp (jugador1 y jugador2 con `arsopar`/`arvtjpar`) + fila Neto.
- En ambos, la fila Neto sale de `h1_a..h18_a` de `tarjetas`. Esa view ya tiene aplicada la lógica de cada estilo. No se debe inventar "bola baja = min(j1,j2)" ni "suma = j1+j2" en el frontend.
- `estilojuego` se lee de `caljuego` por **fecha+categoría** (no por toda la categoría). Por eso al hacer clic en R1 puede ser Go Go y en R2 Bola Baja.

## Cambios

### Backend
1. **`server/api/resultados_parejas.php`** — verificar contra legacy:
   - Quitar prefijos `u.` espurios de `c1..c5` en ORDER BY (legacy usa bare). 
   - GROSS countback: `(j.cd1+j.cd2+cd3+cd4+cd5)` (mezcla prefijos como en legacy).
   - Confirmar que `f_torneoso(...) > 0` (no `f_torneosa`).
   - Confirmar que sólo-Neto excluye `j.campgross=0`.
2. **`server/api/tarjeta_parejas.php`** — simplificar payload:
   - **Quitar** `bolaBaja[]` y `suma[]` (legacy no los calcula).
   - Mantener: `estilojuego`, `player1` (arso/arvtj/arsa), `player2` (arsopar/arvtjpar/arsapar), `holes` (par/ventaja), `neto[]` (h{n}_a), totals.
   - Asegurar SQL idéntico al legacy: mismo join `v_sal_jug + campos + tarjetas`, mismo select de `h{n}_a`, `arso`, `arsa`, `arvtj` (= `ventajasjug`), `arsopar`, `arvtjpar`, `arsapar`.

### Frontend
3. **`src/hooks/useResultadosData.ts`** — exponer helper `fetchEstiloDelDia(catid, fecha)` que llame `caljuego_estilo.php` antes de cargar tarjeta.
4. **`src/pages/Resultados.tsx`** (handler de clic en `r{n}` para categoría de parejas):
   - Mapear `r{n}` → `days[n-1]` (fecha).
   - Llamar `caljuego_estilo.php` para esa fecha → recibir `estilojuego`.
   - Llamar `tarjeta_parejas.php` con esa fecha.
   - Pasar `estilojuego` al `ScorecardParejas`.
5. **`src/components/resultados/ScorecardParejas.tsx`** — rehacer fiel al legacy:
   - Quitar filas computadas "Bola Baja" / "Suma" — el valor ya está en la fila Neto.
   - **Go Go**: filas → Par · Vtja · Gross(j1) · hcp(j1) · Neto.
   - **Bola Baja / Suma Scores**: filas → Par · Vtja · j1 Gross · j1 hcp · j2 Gross · j2 hcp · Neto.
   - Header conserva chip de `estilojuego` para que el usuario distinga.
6. **`src/config/api.ts`** — sin cambios (URLs ya existen).
7. **`src/hooks/useResultadosData.ts`** types: quitar `bolaBaja` y `suma` de `ParejaHoleScore` / `ParejaScorecard`.

## Detalles técnicos
- Endpoint `caljuego_estilo.php` ya existe y devuelve `{estilojuego, formato, campo, isParejas}`. Lo reutilizamos.
- Los días vienen ordenados (`days[]`) desde `resultados_parejas.php`; el índice 1-based corresponde a `r1..rN`.
- No se modifica nada del flujo individual — sólo la rama parejas (`isParejas=true`).

## Archivos a editar
- `server/api/resultados_parejas.php` (verificación ORDER BY)
- `server/api/tarjeta_parejas.php` (simplificar — quitar bolaBaja/suma)
- `src/components/resultados/ScorecardParejas.tsx` (rehacer fiel)
- `src/hooks/useResultadosData.ts` (helper estilo del día + tipos)
- `src/pages/Resultados.tsx` (handler clic r{n} → consultar estilo)

## Validación
- Probar `/resultados` con torneo 323, cat 6316.
- Clic en R1 → debe pedir `caljuego_estilo` (fecha 2026-03-13) → recibir "Go Go" → mostrar variante 1-jugador.
- Clic en R2 → "Bola Baja" → 2 jugadores + Neto.
- Clic en R3 → "Suma Scores" → 2 jugadores + Neto.
