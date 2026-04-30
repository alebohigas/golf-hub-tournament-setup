---
name: Resultados partial rounds
description: /resultados shows in-progress rounds with En vivo badge; Total stays closed-only; Live mirrors Hoy when no closed rounds yet
type: feature
---

# Partial round visibility (Resultados + Live)

## Backend — `server/api/resultados_jug.php`

- `$dias` now includes EVERY scheduled date that has at least one open
  scorecard (not just fully-closed rounds). Future rounds with zero cards
  are still skipped.
- `$diasPartial[$i]` (1-indexed bool) flags rounds where some eligible
  player still has an open card (`statlsc != 1`).
- `day_score_expr($sistema, $gross, $fecEsc, $partial, $parcampo)` builds
  the per-round score expression:
    - Closed rounds → legacy `f_score_dia_sax/sox` (statlsc=1 only).
    - Partial rounds → direct `tarjetas` SUM (no `statlsc` filter):
        - Stableford: `SUM(SA)` (NETO) or `SUM(totstbgross)` (GROSS).
        - Stroke: `SUM(SO|SA) - parcampo * COUNT(*)` (diff to par).
- `$closedDates` (used by `$closedSA`/`$closedSO`/`$closedSTBGross` for the
  Total column) only includes fully-closed dates, so partial rounds do
  NOT inflate Total.
- `prev_rounds_tiebreaker(..., $diasPartial)` skips partial rounds so live
  data does not move players around as cards close.
- Player WHERE clause: `AND ($closedXX > 0 OR EXISTS tarjetas)` so players
  with only open cards (e.g. R1 in progress) still appear.
- Cut-player per-day subqueries drop `AND t.statlsc = 1` for partial dates.
- Response includes `daysPartial: bool[]` aligned to `days`.

## Frontend

- `ResultCategory.daysPartial?: boolean[]` mirrors the backend flag.
- `Resultados.tsx` round headers render an amber "En vivo" badge with a
  pulsing dot for any `daysPartial[i] === true`. Tooltip explains scores
  may change and don't yet count in Total.

## Live page first-round fix — `src/pages/Live.tsx`

- When `player.prevRoundDates.length === 0` (no closed rounds yet — typical
  R1 in progress), the Total/Dif Par cell mirrors `player.todayScore`
  instead of always showing "E" (0). Cell becomes a non-clickable span in
  that case (no closed cards to expand).
