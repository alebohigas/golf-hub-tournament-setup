## Objetivo

Que las páginas **Salidas**, **Resultados** y **Live** muestren las parejas con la misma estructura que ya tiene **Jugadores** (imagen 1): un renglón por jugador dentro del bloque del grupo/pareja, y los datos compartidos (Hoyo/Hora en Salidas, R1/R2/Total en Resultados/Live) centrados verticalmente al medio de los dos renglones usando `rowSpan`.

---

## Cambios por página

### 1) Salidas (`src/pages/Salidas.tsx` + `server/api/salidas_det.php`)

**Problema:** en categorías de parejas el endpoint devuelve sólo 1 fila por pareja (el primer jugador), por eso "salen 2" cuando realmente son 4.

- En `salidas_det.php`:
  - Quitar el hard-code `$formato='individual';` (línea 11).
  - Cuando `formato=parejas`, en lugar de usar `v_sal_jug_par` con un sólo nombre, hacer la misma query que ya hace `resultados_parejas.php` (vía `v_jugadores_parejas` + doble JOIN a `jugadores`/`clubs`) para devolver por pareja: `name`, `partner`, `clubLogo`, `clubLogo2`, `score`, `grupoid`. Mantener orden y filtrado por `salidagrupoid` para no romper el resto.
  - Mantener el shape actual de `groups[].players`, agregando `partner` y `clubLogo2` cuando aplique (campos opcionales, no rompen individual).

- En `Salidas.tsx`:
  - Si `player.partner` existe, renderizar **dos `<TableRow>`** dentro del mismo grupo de salida (uno por jugador), con la columna **Hoyo** y **Hora** usando `rowSpan = 2 × nº de parejas del grupo` (igual que ya se hace pero contando jugadores reales).
  - Cada jugador con su propio logo (`clubLogo` / `clubLogo2`) y nombre en su renglón.
  - La columna **Score** se centra verticalmente con `rowSpan={2}` por pareja porque es score compartido.
  - Aplicar el mismo patrón en el bloque de búsqueda (`searchResults`).

### 2) Resultados (`src/pages/Resultados.tsx`)

Hoy en parejas se muestra una sola fila con `"Nombre1 / Nombre2"` y un par de logos pequeños lado a lado.

- Cuando `categoryDetail?.isParejas`:
  - Renderizar **dos `<TableRow>`** consecutivas por pareja.
  - Renglón 1: club logo 1, nombre 1.
  - Renglón 2: club logo 2, nombre 2 (`player.partner`).
  - Columnas compartidas (Pos, R1, R2, …, Total) con `rowSpan={2}` y `align-middle` para que queden centradas verticalmente entre los dos renglones (como en la imagen 3 deseada por el usuario).
  - Mantener el sticky-left para Pos/Club/Jugador con `rowSpan={2}` en la primera fila.
  - El click para expandir scorecard sigue actuando sobre la pareja (no se duplica).
- Mismo tratamiento en la tabla de `cutPlayers`.

### 3) Live (`src/pages/Live.tsx`)

Aplicar el mismo patrón "dos renglones por pareja + rowSpan en columnas compartidas" que en Resultados, respetando los colores de score diff vs par que ya existen en Live.

---

## Detalles técnicos

- No se toca el modelo de datos del frontend: `Player` ya tiene `partner`, `clubLogo2` y `pairName` (ver `useResultadosData.ts` líneas 138-143).
- En Salidas hay que extender `SalidasPlayer` para incluir `partner?: string` y `clubLogo2?: string`.
- `rowSpan` en parejas = 2 (un jugador + su compañero). En grupos multi-pareja en Salidas, las columnas `Hoyo`/`Hora` siguen abarcando todos los renglones del grupo (`2 × nº parejas`), y `Score` abarca 2 (por pareja).
- No se altera ningún cálculo de scoring, ordenamiento, ni keys dinámicas `r{n}` (respeta la regla de memoria).
- Cambios localizados; no toca competencias, brackets ni pre-registros.

---

## Archivos a modificar

```text
server/api/salidas_det.php          (parejas: doble JOIN y devolver partner+clubLogo2)
src/hooks/useSalidasData.ts         (tipo SalidasPlayer: +partner, +clubLogo2)
src/pages/Salidas.tsx               (render dos renglones por pareja + rowSpan)
src/pages/Resultados.tsx            (parejas: dos renglones + rowSpan centrado)
src/pages/Live.tsx                  (parejas: dos renglones + rowSpan centrado)
```

¿Procedo así?