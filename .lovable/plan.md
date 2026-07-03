# Match por 3er lugar — Análisis y plan

## 1. Cómo se numeran los matches hoy (tabla `elimin_salidas_cat`)

Es la ÚNICA tabla que rige los brackets de /matchplay (no se usa `bracket_matches` — esa es sólo para Putt Finales).

Columnas relevantes:

| columna | uso |
|---|---|
| `catid` | id de la categoría (D1 o D2 — cada cuadro es su propia categoría) |
| `matchx` | número del match dentro del cuadro. Convención: **1xx** = D1, **2xx** = D2 |
| `jugida`, `jugidb` | los dos jugadores del match (slot "a" / "b") |
| `gano` | 1 = ganó jugida, 2 = ganó jugidb, 0/NULL = sin jugar |
| `hoyo`, `fecha` | resultado (ej. "3&2") + fecha |
| `pl_grupo` | matchx destino del **ganador** → entra al slot `jugida` de ese match |
| `sl_grupo` | matchx destino del **ganador** → entra al slot `jugidb` de ese match |

El offset (`matchx % 100`) va contiguo 1..N-1 para un bracket de N jugadores:

```text
Bracket 16 (D1: matchx 101..115)
  R1 (Octavos)   101..108   (8 matches)
  R2 (Cuartos)   109..112   (4)
  R3 (Semis)     113..114   (2)
  R4 (Final)     115        (1)
```

El frontend detecta el tamaño con `size = next_pow2(maxOffset + 1)`. **Cualquier matchx fuera del rango contiguo rompe la detección** — por eso el 3er lugar tiene que ir en un offset "apartado".

Los matches se **crean una sola vez** al armar el bracket (no por usuario). Actualmente en Speitour eso lo hace un script legacy que llena `elimin_salidas_cat` desde el seeding. Nuestra app sólo captura resultados y propaga con `set_winner` — nunca crea filas nuevas.

## 2. Qué falta para el 3er lugar

No existe hoy. Se necesita:

1. **Una fila más en `elimin_salidas_cat`** por bracket (D1 y opcionalmente D2), con `matchx` fuera del rango contiguo, ambos slots vacíos hasta que caigan los perdedores de semis.
2. **Propagación del PERDEDOR** de las dos semifinales hacia esa fila. Hoy sólo propagamos ganador (`pl_grupo`/`sl_grupo` + `IF(gano=1, jugida, jugidb)`), no perdedor.

## 3. Convención de `matchx` propuesta (sin romper detección)

Usar offset **`99`**: `matchx = 199` para D1 3er lugar, `matchx = 299` para D2 3er lugar.

- Fuera del rango contiguo 1..N-1, no altera `size = next_pow2(maxOffset+1)` porque lo filtramos antes.
- Fácil de reconocer con `matchx % 100 === 99`.
- El frontend ya tiene el hook para apartarlo (comentario en `BracketView.tsx:242`).

## 4. Cambio mínimo en la BD

Una sola columna nueva en `elimin_salidas_cat` (nullable, no rompe nada existente):

```sql
ALTER TABLE elimin_salidas_cat
  ADD COLUMN tl_grupo INT NULL COMMENT '3er lugar: matchx destino del PERDEDOR de este match';
```

Sólo las dos filas de semifinal (`113` y `114` en bracket 16) llevan `tl_grupo = 199`. Todas las demás filas la dejan NULL.

**Convención de slot en el match de 3er lugar:** la semi con `matchx` menor deposita a su perdedor en `jugida`; la semi con `matchx` mayor lo deposita en `jugidb`. Así no hace falta otra columna tipo `tl_slot`.

Alternativa considerada y descartada: añadir `pl_lose`/`sl_lose` (duplicar todo el par). Se descarta porque el orden del slot es determinista por `matchx`, con una sola columna basta.

## 5. Cambios en el backend (`server/api/matchplay_admin.php`)

Agregar una función `propagate_loser_third_place($conn, $catid)` que corra junto con `propagate_winner_d1` cada vez que se marca `gano` en un match. En una sola query:

```sql
UPDATE elimin_salidas_cat AS a
  JOIN elimin_salidas_cat AS b
    ON (b.matchx  = a.tl_grupo
        AND b.catid = a.catid
        AND a.tl_grupo IS NOT NULL
        AND a.gano > 0)
   SET
     b.jugida = CASE WHEN a.matchx < (a.tl_grupo - 1)
                     THEN IF(a.gano = 1, a.jugidb, a.jugida)  -- perdedor
                     ELSE b.jugida END,
     b.jugidb = CASE WHEN a.matchx > (a.tl_grupo - 1)
                     THEN IF(a.gano = 1, a.jugidb, a.jugida)
                     ELSE b.jugidb END
 WHERE a.catid = $cid;
```

`reset_match` en la semifinal también limpia el slot correspondiente del 199/299 si aún tiene al perdedor (mismo patrón que ya se hace con el ganador).

## 6. Cómo se crea la fila 199/299 al momento

Dos opciones (elige tú):

- **A)** Botón en admin "Habilitar 3er lugar" que hace un `INSERT` de la fila (matchx=199, jugida/jugidb NULL, tl_grupo NULL) + `UPDATE` de las dos semis fijando `tl_grupo = 199`. Sin re-generar bracket.
- **B)** Auto-crear las filas 199/299 y setear `tl_grupo` en semis apenas se abra la categoría en el panel de /matchplay admin (idempotente: `INSERT IGNORE` + `UPDATE ... WHERE tl_grupo IS NULL`).

Recomiendo **B** por default y **A** como override si alguna categoría no lo quiere.

## 7. Frontend (`BracketView.tsx` + `useMatchPlay.ts`)

- Filtrar `matches.filter(m => m.matchId % 100 !== 99)` antes de `buildFullRounds`.
- Extraer `thirdPlaceMatch = matches.find(m => m.matchId % 100 === 99)`.
- Renderizar el **podio** debajo (o al lado) de la Gran Final con 3 slots:
  - 🥇 Campeón: ganador del match final (ya lo calculamos como `championName`).
  - 🥈 Subcampeón: perdedor del match final.
  - 🥉 3er lugar: ganador del match `199`.
- El match 3er lugar se muestra como una `MatchCard` normal (misma UI de captura) dentro de una sección "Match por 3er lugar", separada de la Gran Final.

## 8. Resumen de deltas

**BD (una migración):**
- `ALTER TABLE elimin_salidas_cat ADD COLUMN tl_grupo INT NULL`

**Backend (`matchplay_admin.php`):**
- Nueva función `propagate_loser_third_place($conn, $catid)`, llamada al final de `set_winner`.
- `reset_match`: limpiar slot en `matchx=199/299` si contiene al perdedor recién reseteado.
- Nueva action `enable_third_place` (o auto-init) que inserta la fila y setea `tl_grupo` en semis.

**Frontend:**
- Filtrar matches `%100===99` en el grouper.
- Componente `<PodiumSection>` con 1º/2º/3º + `<MatchCard>` para capturar el 3er lugar.

## 9. Confirmación antes de codear

1. ¿Vamos con **offset 99** (matchx 199/299) o prefieres otra convención?
2. ¿Auto-init de la fila del 3er lugar (opción B) o botón manual (opción A)?
3. ¿El 3er lugar aplica **sólo a D1** o también a D2 (consolación)?
