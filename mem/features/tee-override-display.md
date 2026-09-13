---
name: tee-override-display
description: Si jugadores.teesalidaid difiere de categorias.salida, se muestra el nombre de la mesa (salidas.tee) en texto pequeño debajo del nombre del jugador en JUGADORES, SALIDAS y RESULTADOS.
type: feature
---
# Mesa de salida distinta a la de la categoría (teeOverride)

- Comparación: `jugadores.teesalidaid <> categorias.salida` (y > 0). Nombre vía `salidas.tee`.
- Endpoints: `players.php` (campo `teeOverride`), `resultados_jug.php` (`tee_override` en loops normal/matchplay/corte), `salidas_det.php` (`teeOverride` y `teeOverride2` para parejas, mapa `$teeOverrideByPlayer`).
- Frontend: `Player.teeOverride`, `PlayerResult.teeOverride`, `CutPlayer.teeOverride`, `SalidasPlayer.teeOverride/teeOverride2`; render condicional `block text-[0.65rem] leading-tight text-muted-foreground` bajo el nombre en Jugadores.tsx, Salidas.tsx (jugador y partner) y Resultados.tsx (búsqueda, tabla principal, cortados).
- Cadena vacía/ausente = no se muestra nada.
