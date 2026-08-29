---
name: Reporte TIME LINE (Admin)
description: Horarios estimados por hoyo por grupo; validaciones cliente+servidor, encabezado de 4 renglones y ancho fijo por papel
type: feature
---
Admin → pestaña **Time Line** (`AdminTimeLinePrint.tsx`) → `/admin/time-line` (`AdminTimeLine.tsx`), datos en `server/api/timeline.php`.

- Réplica del legacy `reportes/Print_time_line_horario.php` SIN la primera columna; la **categoría va al lado de la HORA** de salida.
- Minutos por hoyo: columna de `hoyosxsalida` si existe; si no, por par (3→15, 4→14, 5→19). El orden de juego arranca en el hoyo de salida y da la vuelta (10…18,1…9).
- Orden de jugadores: idéntico al grid de Salidas (mismo ORDER BY legacy por sistema de la categoría).
- **Validaciones obligatorias en cliente Y servidor**: API URL, torneoid, fecha (YYYY-MM-DD real), campoid numérico, hoyos 1–18 con `hf >= hi`, horas HH:MM con `hrf >= hri`. El backend responde 400 con mensaje claro.
- **Encabezado fijo de 4 renglones**: 1) torneo, 2) sede / fecha, 3) `Hoyos a–b · Horario x–y · Grupos: N / Jugadores: M`, 4) `Generado: …`. Si falta un dato se muestra "—" para no cambiar la altura. Un efecto mide cada renglón (`data-header-line`) y avisa en pantalla si alguno se parte.
- El reporte se renderiza con **ancho fijo = ancho útil del papel** (Carta 980 px / A4 1047 px, horizontal, márgenes 10 mm) para que los saltos de línea sean idénticos en pantalla, impresión y PDF.
- Impresión y PDF horizontales, sin partir bloques (`break-inside: avoid` + corte al inicio del bloque en el PDF) y con paginación "Página X de Y".
- El botón GENERA abre primero una **vista previa** con el encabezado real y las páginas estimadas.
- La vista previa incluye botones de **Descargar PDF** e **Imprimir** que abren el reporte con `?paper=letter|a4&auto=pdf|print`; el reporte detecta `auto` y dispara la exportación/impresión una sola vez al terminar de cargar.
- Validación de horas en el backend: acepta `H:MM`, `HH:MM` y `HH:MM:SS`; rechaza vacío, 24:00, minutos/segundos > 59, signos, decimales y `hrf < hri` (no cruza medianoche). Hoyos: sólo 1–2 dígitos sin signo, 1–18, con `hf >= hi`.
