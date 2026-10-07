---
name: Calendario — mañana y tarde
description: Rangos oficiales AM/PM y categorías con horarios mixtos
type: feature
---
- Mañana (AM): desde 04:50 hasta 10:59, inclusive.
- Tarde (PM): desde 11:00 hasta 16:00, inclusive.
- Pintar cada fecha según sus horarios de inicio programados aunque aún no existan grupos generados o el total de foursomes sea cero.
- Reservar el bicolor a las categorías que tengan subgrupos A y B con jugadores (por ejemplo [{"grupo":"A","jug":38},{"grupo":"B","jug":10}]); las categorías sin ambos subgrupos usan un solo color según su horario de inicio.
- El color se determina por categoría y fecha, nunca combinando horarios de días diferentes.
- En el ejemplo del 9–10 de octubre de 2026, Campeonato y AA son AM el viernes y PM el sábado; sólo B tiene ambos turnos cada día (06:30 y 12:30).
- Este pedido autoriza modificar el calendario; el bloqueo previo de otras áreas no impide este ajuste solicitado explícitamente.