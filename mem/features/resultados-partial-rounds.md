---
name: Resultados closed-cards-only rule
description: /resultados only shows rounds with at least one closed card (statlsc=1); never shows partial/in-progress data; reads tarjetas directly bypassing legacy f_score_dia_sax/sox
type: feature
---

# Resultados — solo tarjetas cerradas (statlsc=1)

**REGLA INVIOLABLE:** En `/resultados` jamás se muestra información parcial. Una tarjeta solo cuenta y se muestra cuando `statlsc = 1`. Si un jugador no ha terminado su ronda (o ni siquiera ha empezado R2), su celda de esa ronda es `NULL` → "—" en el frontend.

## Backend — `server/api/resultados_jug.php`

### 1. Selección de rondas visibles (`$dias`)
- Itera `caljuego` para la categoría.
- Cuenta tarjetas CERRADAS por fecha:
  ```
  COUNT(DISTINCT t.jugadorid) WHERE t.statlsc = 1 AND DATE(fecha_juego)=fecha
  ```
- **Si `closedCount === 0` → `continue` (la columna NO se publica).**
- Rondas vacías o solo en juego quedan ocultas.
- `$diasPartial[$idx] = false` siempre (legacy field, ya no se usa para placeholders).

### 2. Score por ronda — `day_score_expr()`
**NO usar `f_score_dia_sax/sox`** (devolvían valores parciales para tarjetas abiertas). Se consulta `tarjetas` directamente:

```sql
(SELECT CASE WHEN COUNT(*) = 0 THEN NULL ELSE (<col><diff>) END
   FROM tarjetas t
   WHERE t.jugadorid = j.id
     AND t.torneoid  = j.torneoid
     AND DATE(t.fecha_juego) = '$fecEsc'
     AND t.statlsc = 1)
```

Columnas por sistema:
| Sistema             | col                  | diff                       |
|---------------------|----------------------|----------------------------|
| STABLEFORD GROSS    | `SUM(t.totstbgross)` | —                          |
| STABLEFORD NETO     | `SUM(t.SA)`          | —                          |
| STROKE GROSS        | `SUM(t.SO)`          | `- $parcampo * COUNT(*)`   |
| STROKE NETO         | `SUM(t.SA)`          | `- $parcampo * COUNT(*)`   |

Si el jugador no tiene tarjeta cerrada para esa fecha → `NULL` → "—".

### 3. Total acumulado
`$closedSA / $closedSO / $closedSTBGross` ya filtran `t.statlsc = 1` con `$closedDateFilter` (set de `$dias`). El Total nunca incluye datos parciales.

### 4. Cut players
Mismo patrón: subquery directo a `tarjetas` con `t.statlsc = 1`. (Cuando `$diasPartial[$i]` es true se forzaba `1=0`, pero ahora ese caso ya no existe porque rondas sin cerradas se omiten.)

### 5. Frontend `Resultados.tsx`
- NO existe disclaimer "En vivo" ni badge pulsante (eliminados).
- `null` en `r{i}` se renderiza como "—".
- Lee `r{n}` dinámicamente (ver core rule "Round scores").

## Live page (`src/pages/Live.tsx` + `server/api/live_scoring.php`)

### Orden del leaderboard en Live (dos grupos)
Implementado en `live_scoring.php`:
- **Grupo 0 (arriba):** jugadores que NO han empezado hoy (`thru == 0`).
  - Se ordenan por score acumulado de rondas previas cerradas.
- **Grupo 1 (abajo):** jugadores jugando o ya terminaron hoy (`thru > 0`).
  - Se ordenan por `score + todayScore` (Dif Par / Total).
- Dentro de cada grupo: ASC para stroke play, DESC para stableford.

```php
$hasStartedToday = ((int)($player['thru'] ?? 0)) > 0;
$player['_sortGroup'] = $hasStartedToday ? 1 : 0;
$player['_sortScore'] = $hasStartedToday
    ? ((int)($player['score'] ?? 0) + (int)($player['todayScore'] ?? 0))
    : (int)($player['score'] ?? 0);
```

### Live R1 mirror
Cuando `player.prevRoundDates.length === 0` (R1 en progreso, sin cerradas), la celda Total/Dif Par muestra `player.todayScore` en lugar de "E"/0. La celda no es clickable (no hay tarjeta cerrada para expandir).

## NO HACER
- ❌ No volver a usar `f_score_dia_sax/sox` para `day_score_expr`.
- ❌ No mostrar columnas de ronda sin tarjetas cerradas.
- ❌ No agregar badges "En vivo" ni disclaimers en `/resultados`.
- ❌ No sumar tarjetas con `statlsc != 1` al Total ni a las celdas por ronda.
- ❌ No hardcodear r1/r2/r3 — siempre iterar `days.length`.
