
## Objetivo

Hacer que el sitio detecte automáticamente cuándo una categoría/día es de **parejas** y ajuste 3 vistas:

- **/jugadores**: agrupa parejas por `jugadores.grupoid` (ej. "Grupo C24") ordenadas por HCP asc.
- **/resultados**: tabla por **grupo** (pareja), no por jugador individual.
- **Tarjeta detallada**: cambia layout según `caljuego.estilojuego` del día seleccionado:
  - `Personal` → flujo individual actual (sin cambios).
  - `Go Go` → 1 sola tarjeta compartida con HCP.
  - `Bola Baja` → 2 tarjetas; resalta el hoyo con la bola más baja.
  - `Suma Scores` → 2 tarjetas; total = suma de ambas.

Torneos individuales puros (todas las categorías con `formato='INDIVIDUAL'`) **no cambian**.

## Reglas de detección

| Caso | Comportamiento |
| --- | --- |
| `categorias.formato='INDIVIDUAL'` o `caljuego.campo=0` para todos los días | Categoría individual — flujo actual |
| `categorias.formato='PAREJAS'` y al menos un día con `caljuego.campo>0` | Categoría de parejas — flujo nuevo |
| Mezcla de categorías INDIVIDUAL + PAREJAS en un mismo torneo | Cada categoría se trata independientemente |

`estilojuego` se lee **por día** desde `caljuego.estilojuego`. Una misma categoría puede tener `Go Go` el día 1 y `Bola Baja` el día 2.

## Cambios backend (PHP / `server/api/`)

### 1. `categories.php` (modificado)
Agregar campo `formato` (ya está) + `isParejas: bool` al payload. Sin cambios SQL mayores.

### 2. `players.php` (modificado)
Si la categoría es PAREJAS, hace JOIN con `v_jugadores_parejas` y devuelve:
```json
{
  "isParejas": true,
  "groups": [
    {
      "grupoid": "C24",
      "handicapTotal": 18,
      "players": [ {jugador1...}, {jugador2...} ]
    }
  ]
}
```
Si es INDIVIDUAL devuelve el formato actual sin cambios.

### 3. `resultados_jug.php` (modificado)
- Detecta si la categoría es PAREJAS.
- Si es PAREJAS:
  - Usa `v_jugadores_parejas` para listar grupos.
  - Reutiliza las queries legacy de `resultados_parejas.php` (ya existe) usando `f_torneosox/sax` y `f_score_dia_sox/sax`.
  - Devuelve filas con `grupoid`, `name`, `partner`, `r1..rN`, `total`.
- Si es INDIVIDUAL: sin cambios.

### 4. `caljuego_estilo.php` (NUEVO)
Pequeño endpoint:
```
GET /api/caljuego_estilo.php?catid=X&fecha=YYYY-MM-DD
→ { estilojuego: "Go Go" | "Bola Baja" | "Suma Scores" | "Personal", formato: "PAREJAS" | "INDIVIDUAL", campo: 1 }
```
Usado por el frontend antes de cargar la tarjeta para saber qué layout renderizar.

### 5. `tarjeta_parejas.php` (NUEVO — port a JSON de los 2 PHP)
Endpoint unificado que reemplaza ambos PHP adjuntos manteniendo las SQL **exactamente** como vienen:

```
GET /api/tarjeta_parejas.php?jugadorid=X&categoriaid=Y&fecha=Z
```

Devuelve un único JSON con:
```json
{
  "estilojuego": "Go Go",            // viene de caljuego del día
  "player1": { "id":..., "name":..., "club":..., "logo":..., "scoreSO":[...], "scoreSA":[...], "ventajas":[...] },
  "player2": { ... },                // mismo shape (null en Go Go puro si comparten tarjeta)
  "holes": [ {hole, par, ventaja, yardaje}, ... ],
  "totals": { p1: {so, sa}, p2: {so, sa}, pair: {so, sa} },
  "neto": [9 nums para bola baja/go go], // viene de tarjetas.h{n}_a
  "fecha": "2026-...",
  "campo": "Nombre Campo",
  "categoria": "..."
}
```

Internamente arma las queries de los 2 PHP (que son casi idénticas — usan `v_sal_jug_par`, `tarjetas`, `hoyosxsalida`, `valorstable`). El frontend decide layout por `estilojuego`.

## Cambios frontend

### 1. `src/data/playersData.ts`
Tipos nuevos:
```ts
export interface PareaGroup { grupoid: string; players: Player[]; handicapTotal: number }
export interface PlayersResponse {
  isParejas: boolean;
  players?: Player[];     // individual
  groups?: PareaGroup[];  // parejas
  fechaHandicap: string;
}
```

### 2. `src/hooks/usePlayersData.ts`
`usePlayers` devuelve el shape unificado, pasa `isParejas` y `groups` cuando aplica.

### 3. `src/pages/Jugadores.tsx`
Si `isParejas`: renderiza una **lista de cards "Grupo C24"** cada una con tabla de 2 jugadores. Sin cambios para individual.

### 4. `src/data/resultadosData.ts`
Agregar `isParejas`, `pairName`, `partnerName`, `clubLogo2` al `PlayerResult`.

### 5. `src/hooks/useResultadosData.ts`
Detecta `isParejas` en la respuesta y mapea grupos. `fetchPlayerScorecardFromApi` toma una rama nueva: si parejas, golpea `/api/tarjeta_parejas.php` en vez de `/api/resultados_tarjeta.php`.

### 6. `src/pages/Resultados.tsx`
- Encabezado de tabla: "Pareja" (en vez de "Jugador") cuando es parejas; columna Club se vuelve dos mini-logos.
- Posición + medallas iguales.
- Click en R{n} abre la tarjeta nueva.

### 7. `src/components/resultados/ScorecardParejas.tsx` (NUEVO)
Componente nuevo que renderiza la tarjeta de parejas con 3 variantes según `estilojuego`:

- **Go Go**: tabla única — filas: Par, Vtja, Gross (compartido), hcp, Neto.
- **Bola Baja**: filas: Par, Vtja, J1 Gross, J1 hcp, J2 Gross, J2 hcp, **Bola Baja** (resaltada en verde) + Neto.
- **Suma Scores**: filas: Par, Vtja, J1, hcp1, J2, hcp2, **Suma** (resaltada) + Neto.

Diseño respeta tokens (`bg-primary`, `bg-muted`) — no hardcodear colores estilo bootstrap del PHP original.

El `ScorecardRow` actual se mantiene intacto para individuales. `Resultados.tsx` elige uno u otro según `categoryDetail.isParejas`.

## Detalles técnicos importantes

- **Multi-día con estilos diferentes**: la decisión de qué tarjeta mostrar viene del `estilojuego` del **día** clickeado (no de la categoría). Por eso `tarjeta_parejas.php` lee `caljuego` filtrando por `fecha`.
- **grupoid**: vive en `jugadores.grupoid` (string libre tipo "C24"). Se muestra literal: `Grupo {grupoid}`.
- **Cuando un día es `Personal` dentro de una categoría PAREJAS**: la tarjeta de ese día usa el flujo individual (raro pero soportado).
- **Sin cambios** a `resultados_parejas.php` existente — lo absorberemos como referencia y consolidaremos su lógica en `resultados_jug.php`.
- Las SQL de los dos PHP adjuntos se copian **textuales** dentro de `tarjeta_parejas.php` con escape via `esc($conn, …)` para evitar inyección.

## Archivos a tocar

**Backend (nuevos):**
- `server/api/tarjeta_parejas.php`
- `server/api/caljuego_estilo.php`

**Backend (modificados):**
- `server/api/categories.php` (agregar `isParejas`)
- `server/api/players.php` (agregar grupos para parejas)
- `server/api/resultados_jug.php` (rama parejas)

**Frontend (nuevos):**
- `src/components/resultados/ScorecardParejas.tsx`

**Frontend (modificados):**
- `src/config/api.ts` (2 nuevos endpoints)
- `src/data/playersData.ts` (tipos)
- `src/hooks/usePlayersData.ts` (parseo)
- `src/pages/Jugadores.tsx` (render grupos)
- `src/data/resultadosData.ts` (tipos)
- `src/hooks/useResultadosData.ts` (parseo + ruteo tarjeta)
- `src/pages/Resultados.tsx` (header columnas + render parejas + abre tarjeta correcta)

**Total estimado: ~12 archivos, ~1500 LoC nuevas/modificadas.**

## Lo que NO hago en esta pasada

- **`/live`** (live scoring): por ahora se queda como está; pedirías un seguimiento aparte para parejas en LIVE.
- **Match Play parejas** (`resultados_parejas.php` ya separado): se mantiene su flujo.
- Admin tooling para `grupoid` o `estilojuego`: ya se administran desde el sistema legacy.

¿Apruebas el plan o quieres ajustar algo (alcance, naming, manejo de día Personal mezclado con día Go Go, etc.) antes de implementar?
