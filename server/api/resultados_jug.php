<?php
/**
 * Resultados Jugadores (Detail) Endpoint
 * GET /api/resultados_jug.php?catid=XXX&torneoid=XXX&gross=0|1
 * Returns tournament results for a category
 * Supports: Stroke Play (Neto/Gross), Stableford (Neto/Gross)
 *
 * IMPORTANT: Totals only include CLOSED scorecards (statlsc = 1)
 * to avoid counting partial live scoring data.
 * Per-day functions (f_score_dia_sax/sox) already use v_resultar
 * which filters by statlsc = 1.
 *
 * Returns two arrays: 'players' (estatus=NORMAL) and 'cutPlayers'
 * (non-NORMAL: NO SHOW, RETIRO, DESCALIFICADO, etc.)
 * Also returns 'medalCountNeto' (categorias.numganadorneto, default 3) and
 * 'medalCountGross' (categorias.numganadorgross, default 1) for dynamic medal
 * assignment per scoring type. 'medalCount' is preserved for backward
 * compatibility and reflects the count for the requested scoring (?gross=0|1).
 */
require_once 'config.php';

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0'); 

$catid    = require_param('catid');
$torneoid = require_param('torneoid');
$gross    = optional_param('gross', '0');

$cid = esc($conn, $catid);
$tid = esc($conn, $torneoid);

// ============= Get category info (includes per-scoring medal counts) =============
// Medal counts (numganadorneto / numganadorgross) live in `categorias`.
// We probe INFORMATION_SCHEMA so missing columns on legacy databases fall
// back to defaults (3 neto, 1 gross) instead of causing a fatal SQL error.
// numjugprem is kept as legacy fallback for the net count.

/**
 * Checks whether a column exists in `categorias` for the active database.
 * Lets us gracefully degrade when legacy schemas miss optional columns.
 */
function categorias_has_column($conn, $col) {
    $colEsc = esc($conn, $col);
    $res = @$conn->query(
        "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'categorias'
           AND COLUMN_NAME = '$colEsc'
         LIMIT 1"
    );
    if (!$res) return false;
    $exists = $res->num_rows > 0;
    $res->free();
    return $exists;
}

$hasNeto   = categorias_has_column($conn, 'numganadorneto');
$hasGross  = categorias_has_column($conn, 'numganadorgross');
$hasLegacy = categorias_has_column($conn, 'numjugprem');

/** SELECT expression for net medal count, with safe fallbacks */
if ($hasNeto) {
    $netoExpr = $hasLegacy
        ? "IFNULL(a.numganadorneto, IFNULL(a.numjugprem, 3))"
        : "IFNULL(a.numganadorneto, 3)";
} else {
    $netoExpr = $hasLegacy ? "IFNULL(a.numjugprem, 3)" : "3";
}

/** SELECT expression for gross medal count, with safe fallback */
$grossExpr = $hasGross ? "IFNULL(a.numganadorgross, 1)" : "1";

/** GROUP BY additions only for columns that actually exist */
$groupExtras = '';
if ($hasNeto)   $groupExtras .= ', a.numganadorneto';
if ($hasGross)  $groupExtras .= ', a.numganadorgross';
if ($hasLegacy) $groupExtras .= ', a.numjugprem';

$sql = "SELECT a.categoria_id, a.categoria, a.abreviatura, a.sistema, a.formato,
               a.estilo, a.gross, a.porcentaje, a.salida, a.hoyosajugar,
               $netoExpr as numganadorneto,
               $grossExpr as numganadorgross,
               COUNT(b.id) as playerCount
        FROM categorias a
        JOIN jugadores b ON (a.categoria_id = b.categoriaid)
        WHERE a.categoria_id = $cid
        GROUP BY a.categoria_id, a.categoria, a.abreviatura, a.sistema, a.formato,
                 a.estilo, a.gross, a.porcentaje, a.salida, a.hoyosajugar"
        . $groupExtras;

$catInfo = query_one($conn, $sql);
debug_log_query('Category info', $sql);
if (!$catInfo) {
    json_error('Category not found', 404);
}

$sistema = strtoupper($catInfo['sistema']);
$formato = strtoupper($catInfo['formato']);
$medalCountNeto  = (int)$catInfo['numganadorneto'];
$medalCountGross = (int)$catInfo['numganadorgross'];

/** Active medal count for the requested scoring type (back-compat field) */
$medalCount = ($gross == '1') ? $medalCountGross : $medalCountNeto;

// ============= Get fully closed play dates =============
// A round is published in Resultados as soon as AT LEAST ONE eligible NORMAL
// player in the category has ANY scorecard (open or closed) for that
// scheduled date. Rounds with zero cards entirely (future rounds) stay
// hidden so we never render an empty column.
//
// `$diasPartial[$i]` flags rounds that exist but have NOT been fully closed
// by every eligible player yet — these are rendered with an "En vivo"
// indicator on the frontend. Only fully-closed rounds count toward the
// accumulated `total` (see `$closedDates` below), so partial in-progress
// rounds appear in their column but do NOT inflate standings.
$sql = "SELECT fecha FROM caljuego
        WHERE categoriaid = $cid AND campo > 0
        ORDER BY fecha";
$dateRows = query_all($conn, $sql);

$dias = [];
$diasPartial = []; // 1-indexed map: round# => bool (true = partial/in-progress)
$eligibleWhere = "j.categoriaid = $cid AND j.torneoid = $tid AND j.estatus = 'NORMAL'";
if ($gross != '1') { $eligibleWhere .= " AND j.campgross = 0"; }
$expectedRow = query_one($conn, "SELECT COUNT(*) AS total FROM jugadores j WHERE $eligibleWhere");
$expectedPlayers = (int)($expectedRow['total'] ?? 0);

foreach ($dateRows as $dr) {
    $fecha = $dr['fecha'];
    $fecEsc = esc($conn, $fecha);
    // Count any scorecards (open or closed) for that date
    $anyRow = query_one($conn, "SELECT COUNT(DISTINCT t.jugadorid) AS total
                                 FROM tarjetas t
                                 JOIN jugadores j ON (j.id = t.jugadorid)
                                 WHERE $eligibleWhere
                                   AND t.torneoid = $tid
                                   AND DATE(t.fecha_juego) = '$fecEsc'");
    $anyCount = (int)($anyRow['total'] ?? 0);
    if ($anyCount === 0) { continue; } // future round, skip
    // Count CLOSED scorecards (statlsc=1) for that date
    $closedRow = query_one($conn, "SELECT COUNT(DISTINCT t.jugadorid) AS total
                                   FROM tarjetas t
                                   JOIN jugadores j ON (j.id = t.jugadorid)
                                   WHERE $eligibleWhere
                                     AND t.torneoid = $tid
                                     AND DATE(t.fecha_juego) = '$fecEsc'
                                     AND t.statlsc = 1");
    $closedCount = (int)($closedRow['total'] ?? 0);
    $idx = count($dias) + 1;
    $dias[$idx] = $fecha;
    // Round is "partial" if not every eligible player has a closed card yet.
    // This means the round column will appear but its scores won't roll into Total.
    $diasPartial[$idx] = ($expectedPlayers === 0 || $closedCount < $expectedPlayers);
}

// ============= Get course info =============
$sql = "SELECT b.campoid, b.salidaid, rating, slope, tee, parcampo
        FROM caljuego a
        JOIN campo_tee b ON (a.campo = b.campoid AND categoriaid = $cid AND salidaid = " . esc($conn, $catInfo['salida']) . ")
        JOIN salidas s ON (b.salidaid = s.id)
        LIMIT 1";
$courseInfo = query_one($conn, $sql);

// ============= Inline subquery helpers for closed-card totals =============

/** SQL date guard: totals only include category-wide fully closed rounds. */
$closedOnlyDias = [];
foreach ($dias as $i => $f) { if (empty($diasPartial[$i])) { $closedOnlyDias[] = $f; } }
$closedDates = array_map(function($fecha) use ($conn) { return "'" . esc($conn, $fecha) . "'"; }, $closedOnlyDias);
$closedDateFilter = count($closedDates) > 0
    ? " AND DATE(t.fecha_juego) IN (" . implode(',', $closedDates) . ")"
    : " AND 1 = 0";

/** Sum SA (neto/stableford points) from CLOSED cards only on fully published rounds */
$closedSA  = "(SELECT IFNULL(SUM(t.SA), 0) FROM tarjetas t WHERE t.jugadorid = j.id AND t.torneoid = j.torneoid AND t.statlsc = 1 $closedDateFilter)";

/** Sum SO (gross strokes) from CLOSED cards only on fully published rounds */
$closedSO  = "(SELECT IFNULL(SUM(t.SO), 0) FROM tarjetas t WHERE t.jugadorid = j.id AND t.torneoid = j.torneoid AND t.statlsc = 1 $closedDateFilter)";

/** Sum totstbgross (stableford gross points) from CLOSED cards only on fully published rounds */
$closedSTBGross = "(SELECT IFNULL(SUM(t.totstbgross), 0) FROM tarjetas t WHERE t.jugadorid = j.id AND t.torneoid = j.torneoid AND t.statlsc = 1 $closedDateFilter)";

// ============= Round 1 tiebreaker chunk builders =============
/**
 * Build a subquery that returns the sum of a hole-range from the player's
 * ROUND 1 closed scorecard. Used for tie-breaking the position order with
 * the official progression: H10-18 → H13-18 → H16-18 → H18.
 *
 * @param string $col   Per-hole column to sum:
 *                        - 'h{n}'         → gross strokes (Stroke Play GROSS)
 *                        - 'h{n}_a'       → net strokes  (Stroke Play NETO)
 *                        - 'arsa[n]'      → stableford NETO  points (parsed from CSV)
 *                        - 'arstbgross[n]'→ stableford GROSS points (parsed from CSV)
 * @param array  $holes Holes (1..18) included in the range.
 * @param string $r1    Quoted/escaped round-1 date (YYYY-MM-DD).
 * @return string SQL scalar subquery.
 */
function r1_chunk($col, $holes, $r1) {
    if (!$r1) return '(0)';
    $parts = [];
    foreach ($holes as $h) {
        if ($col === 'h') {
            // Gross stroke columns per hole: h1..h18
            $parts[] = "IFNULL(t.h{$h}, 0)";
        } elseif ($col === 'h_a') {
            // Net stroke columns per hole: h1_a..h18_a
            $parts[] = "IFNULL(t.h{$h}_a, 0)";
        } elseif ($col === 'arsa' || $col === 'arstbgross') {
            // CSV columns: 18 comma-separated points; index $h is 1-based.
            // SUBSTRING_INDEX trick to extract the n-th element.
            $parts[] = "CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(t.{$col}, ',', {$h}), ',', -1) AS SIGNED)";
        } else {
            $parts[] = '0';
        }
    }
    $sum = implode(' + ', $parts);
    // statlsc=1 ensures the round was closed; otherwise tiebreaker contributes 0.
    return "(SELECT IFNULL($sum, 0) FROM tarjetas t
             WHERE t.jugadorid = j.id
               AND t.torneoid = j.torneoid
               AND t.fecha_juego = '$r1'
               AND t.statlsc = 1
             LIMIT 1)";
}

/** Round 1 date (first scheduled round). Empty string disables R1 tiebreakers. */
$r1Date = isset($dias[1]) ? esc($conn, $dias[1]) : '';

// ============= Previous-rounds tiebreaker builder =============
/**
 * Build the per-round tiebreaker ORDER BY fragment.
 *
 * Rule extension (rounds 2+): when two players are tied on the cumulative
 * total, look at the score of the most recent completed round first, then
 * the previous one, and so on back to round 1. The player who scored
 * better in the latest round wins the tie; if still tied, compare the
 * round before, etc. This is applied BEFORE the R1 hole-chunk progression
 * (H10-18 → H13-18 → H16-18 → H18) which remains the final fallback.
 *
 * Direction:
 *   - Stroke Play  → ASC  (fewer strokes wins)
 *   - Stableford   → DESC (more points wins, standard golf rule for prior
 *                    rounds; the special "fewer points wins" rule applies
 *                    only to the R1 hole-chunk progression as defined by
 *                    the tournament's printed terms).
 *
 * Each per-round score uses the same f_score_dia_sax/sox alias (d{i})
 * already SELECTed in the main query, so no extra subquery is needed.
 *
 * @param array  $dias          1-indexed map of round number → date.
 * @param string $direction     'ASC' or 'DESC'.
 * @param array  $diasPartial   1-indexed map of round# => bool. Partial
 *                              (in-progress) rounds are EXCLUDED from the
 *                              tiebreaker so live data does not move
 *                              players around as cards close.
 * @return string SQL fragment to append to ORDER BY (starts with ", ").
 */
function prev_rounds_tiebreaker(array $dias, $direction, array $diasPartial = []) {
    if (count($dias) < 2) return '';
    // Iterate from the most recent round down to round 1.
    $rounds = array_keys($dias);
    rsort($rounds);
    $parts = [];
    foreach ($rounds as $i) {
        // Skip partial (in-progress) rounds so they don't sway ordering.
        if (!empty($diasPartial[$i])) continue;
        // d{i} is the per-round score alias from the main SELECT.
        // Wrap with IFNULL so unplayed rounds (NULL/0) don't poison ordering.
        $parts[] = "IFNULL(d{$i}, 0) {$direction}";
    }
    if (empty($parts)) return '';
    return ', ' . implode(', ', $parts);
}

// ============= Helper: map estatus to short code =============
/**
 * Maps player estatus to a display code:
 * NORMAL → null (active player), NO SHOW/SHOW-NO → S, 
 * RETIRO/ABANDONO → R, DESCALIFICADO/DQ → D, CORTE/CUT → C, other → D
 */
function mapEstatus($estatus) {
    $e = strtoupper(trim($estatus));
    if ($e === 'NORMAL') return null;
    if ($e === 'NO SHOW' || $e === 'SHOW-NO' || $e === 'NO-SHOW') return 'S';
    if ($e === 'RETIRO' || $e === 'ABANDONO') return 'R';
    if ($e === 'DESCALIFICADO' || $e === 'DQ') return 'D';
    if ($e === 'CORTE' || $e === 'CUT') return 'C';
    return 'D'; // default for unknown non-NORMAL statuses
}

/** Map status code to descriptive (capitalized) label */
function statusLabel($code) {
    if ($code === 'S') return 'No Show';
    if ($code === 'R') return 'Retiro';
    if ($code === 'D') return 'Descalificado';
    if ($code === 'C') return 'Corte';
    return '';
}

// ============= Per-round score expression builder =============
/**
 * Build the SQL expression that returns a player's per-round score for
 * the requested round.
 *
 * - For CLOSED rounds (every eligible player has statlsc=1): we keep using
 *   the legacy `f_score_dia_sax/sox` functions which read from `v_resultar`
 *   (statlsc=1 only). This preserves identical numbers for finished rounds.
 *
 * - For PARTIAL rounds (at least one eligible player has an open card): we
 *   read from `tarjetas` directly with NO `statlsc` filter so in-progress
 *   scores show up. The score column matches what each scoring system shows
 *   in the round column:
 *     STROKE  GROSS → SO - parcampo (diff to par)
 *     STROKE  NETO  → SA - parcampo (net diff to par)
 *     STBLF   GROSS → totstbgross
 *     STBLF   NETO  → SA
 *
 *   `parcampo` for a single round comes from the categoria's course par
 *   (`caljuego JOIN campo_tee.parcampo`). Each scorecard row represents one
 *   played round so the diff is `SUM(score) - parcampo * cards_played`.
 *
 * @param string $sistema  STROKE PLAY | STABLEFORD
 * @param string $gross    '0' | '1'
 * @param string $fecEsc   Escaped YYYY-MM-DD round date
 * @param bool   $partial   Whether the round is in-progress
 * @param int    $parcampo  Course par for this category (default 72)
 * @return string SQL scalar expression that evaluates to the player's score
 *                for that round (or 0 if no card).
 */
function day_score_expr($sistema, $gross, $fecEsc, $partial, $parcampo = 72) {
    $isStableford = (strtoupper($sistema) === 'STABLEFORD');
    if (!$partial) {
        // Closed round → legacy function (statlsc=1 only). Identical to before.
        $fn = ($gross == '1') ? 'f_score_dia_sox' : 'f_score_dia_sax';
        return "$fn(j.id, '$fecEsc')";
    }
    // Partial round → direct tarjetas read (open + closed cards count).
    if ($isStableford) {
        $col = ($gross == '1') ? 't.totstbgross' : 't.SA';
        return "(SELECT IFNULL(SUM($col), 0)
                 FROM tarjetas t
                 WHERE t.jugadorid = j.id
                   AND t.torneoid  = j.torneoid
                   AND DATE(t.fecha_juego) = '$fecEsc'
                 LIMIT 1)";
    }
    // Stroke Play → diff to par. Subtract category course par × cards played
    // so a player with no card returns 0 (not -par).
    $scoreCol = ($gross == '1') ? 't.SO' : 't.SA';
    return "(SELECT IFNULL(SUM($scoreCol) - ($parcampo * COUNT(*)), 0)
             FROM tarjetas t
             WHERE t.jugadorid = j.id
               AND t.torneoid  = j.torneoid
               AND DATE(t.fecha_juego) = '$fecEsc'
             LIMIT 1)";
}

// ============= Player eligibility helper =============
/**
 * "Has any tarjeta in this tournament" — used to keep a player visible in
 * Resultados as soon as their first card is opened, even before any round
 * is fully closed. Without this, the leaderboard would be empty during the
 * very first in-progress round.
 */
$hasAnyCard = "EXISTS (SELECT 1 FROM tarjetas t
                       WHERE t.jugadorid = j.id
                         AND t.torneoid  = j.torneoid)";

// ============= Build main results query (NORMAL players) =============
$players = [];

if ($sistema === 'STROKE PLAY' || $sistema === 'STROKE') {

    if ($gross == '1') {
        $sql = "SELECT j.id AS jugadorid, j.numjugador,
                       CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
                       $closedSO as so,
                       $closedSA as sa,
                       IFNULL(j.muertesubita, 0) as muertesubita";

        foreach ($dias as $i => $fecha) {
            $expr = day_score_expr($sistema, '1', esc($conn, $fecha), !empty($diasPartial[$i]));
            $sql .= ", $expr as d{$i}";
        }

        $sql .= ", c.abr, c.logo
                 FROM jugadores j
                 LEFT JOIN v_cd_ulttar_sa u ON (j.id = u.jugadorid)
                 JOIN clubs c ON (j.clubid = c.id)
                 WHERE j.categoriaid = $cid
                   AND j.torneoid = $tid
                   AND ($closedSO > 0 OR $hasAnyCard)
                   AND j.estatus = 'NORMAL'
                 ORDER BY $closedSO ASC";

        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        // Rounds 2+ tiebreaker: compare prior rounds (latest first).
        // Stroke Play GROSS → fewer strokes wins, so ASC.
        $sql .= prev_rounds_tiebreaker($dias, 'ASC', $diasPartial);
        // R1 tiebreaker (Stroke Play GROSS): lower strokes wins each chunk.
        // Progression: H10-18 → H13-18 → H16-18 → H18 from Round 1.
        $sql .= ", " . r1_chunk('h', range(10, 18), $r1Date) . " ASC";
        $sql .= ", " . r1_chunk('h', range(13, 18), $r1Date) . " ASC";
        $sql .= ", " . r1_chunk('h', range(16, 18), $r1Date) . " ASC";
        $sql .= ", " . r1_chunk('h', [18],          $r1Date) . " ASC";

    } else {
        $sql = "SELECT j.id AS jugadorid, j.numjugador,
                       CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
                       $closedSA as sa,
                       $closedSO as so,
                       IFNULL(j.muertesubita, 0) as muertesubita";

        foreach ($dias as $i => $fecha) {
            $expr = day_score_expr($sistema, '0', esc($conn, $fecha), !empty($diasPartial[$i]));
            $sql .= ", $expr as d{$i}";
        }

        $sql .= ", c.abr, c.logo
                 FROM jugadores j
                 LEFT JOIN v_cd_ulttar_sa u ON (j.id = u.jugadorid)
                 JOIN clubs c ON (j.clubid = c.id)
                 WHERE j.categoriaid = $cid
                   AND j.torneoid = $tid
                   AND ($closedSA > 0 OR $hasAnyCard)
                   AND j.estatus = 'NORMAL'
                   AND j.campgross = 0
                 ORDER BY $closedSA ASC";

        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        // Rounds 2+ tiebreaker: compare prior rounds (latest first).
        // Stroke Play NETO → fewer net strokes wins, so ASC.
        $sql .= prev_rounds_tiebreaker($dias, 'ASC', $diasPartial);
        // R1 tiebreaker (Stroke Play NETO): lower net strokes wins each chunk.
        $sql .= ", " . r1_chunk('h_a', range(10, 18), $r1Date) . " ASC";
        $sql .= ", " . r1_chunk('h_a', range(13, 18), $r1Date) . " ASC";
        $sql .= ", " . r1_chunk('h_a', range(16, 18), $r1Date) . " ASC";
        $sql .= ", " . r1_chunk('h_a', [18],          $r1Date) . " ASC";
    }

} elseif ($sistema === 'STABLEFORD') {

    if ($gross == '1') {
        $sql = "SELECT j.id AS jugadorid, j.numjugador,
                       CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
                       $closedSTBGross as sa,
                       $closedSO as so,
                       IFNULL(j.muertesubita, 0) as muertesubita";

        foreach ($dias as $i => $fecha) {
            $expr = day_score_expr($sistema, '1', esc($conn, $fecha), !empty($diasPartial[$i]));
            $sql .= ", $expr as d{$i}";
        }

        $sql .= ", c.abr, c.logo
                 FROM jugadores j
                 LEFT JOIN v_cd_ulttar_sa u ON (j.id = u.jugadorid)
                 JOIN clubs c ON (j.clubid = c.id)
                 WHERE j.categoriaid = $cid
                   AND j.torneoid = $tid
                   AND ($closedSTBGross > 0 OR $hasAnyCard)
                   AND j.estatus = 'NORMAL'
                 ORDER BY $closedSTBGross DESC";

        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        // Rounds 2+ tiebreaker: compare prior rounds (latest first).
        // Stableford GROSS → more points wins, so DESC.
        $sql .= prev_rounds_tiebreaker($dias, 'DESC', $diasPartial);
        // R1 tiebreaker (Stableford GROSS): FEWER points wins each chunk
        // (special tournament rule: lower stableford total in the back nine
        // breaks the tie in favor of the lower-scoring player).
        // Per-hole stableford gross points come from CSV column arstbgross.
        $sql .= ", " . r1_chunk('arstbgross', range(10, 18), $r1Date) . " ASC";
        $sql .= ", " . r1_chunk('arstbgross', range(13, 18), $r1Date) . " ASC";
        $sql .= ", " . r1_chunk('arstbgross', range(16, 18), $r1Date) . " ASC";
        $sql .= ", " . r1_chunk('arstbgross', [18],          $r1Date) . " ASC";
    } else {
        $sql = "SELECT j.id AS jugadorid, j.numjugador,
                       CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
                       $closedSA as sa,
                       $closedSO as so,
                       IFNULL(j.muertesubita, 0) as muertesubita";

        foreach ($dias as $i => $fecha) {
            $expr = day_score_expr($sistema, '0', esc($conn, $fecha), !empty($diasPartial[$i]));
            $sql .= ", $expr as d{$i}";
        }

        $sql .= ", c.abr, c.logo
                 FROM jugadores j
                 LEFT JOIN v_cd_ulttar_sa u ON (j.id = u.jugadorid)
                 JOIN clubs c ON (j.clubid = c.id)
                 WHERE j.categoriaid = $cid
                   AND j.torneoid = $tid
                   AND ($closedSA > 0 OR $hasAnyCard)
                   AND j.estatus = 'NORMAL'
                   AND j.campgross = 0
                 ORDER BY $closedSA DESC";

        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        // Rounds 2+ tiebreaker: compare prior rounds (latest first).
        // Stableford NETO → more points wins, so DESC.
        $sql .= prev_rounds_tiebreaker($dias, 'DESC', $diasPartial);
        // R1 tiebreaker (Stableford NETO): FEWER points wins each chunk
        // (special tournament rule). Per-hole stableford neto points come
        // from CSV column arsa.
        $sql .= ", " . r1_chunk('arsa', range(10, 18), $r1Date) . " ASC";
        $sql .= ", " . r1_chunk('arsa', range(13, 18), $r1Date) . " ASC";
        $sql .= ", " . r1_chunk('arsa', range(16, 18), $r1Date) . " ASC";
        $sql .= ", " . r1_chunk('arsa', [18],          $r1Date) . " ASC";
    }
}

debug_log_query('Main results query (' . $sistema . ', gross=' . $gross . ')', $sql);
$rows = query_all($conn, $sql);

$position = 0;
foreach ($rows as $row) {
    $position++;
    $player = [
        'position'  => $position,
        'playerId'  => $row['jugadorid'],
        'number'    => $row['numjugador'],
        'name'      => $row['jugador'],
        'club'      => $row['abr'],
        'clubLogo'  => $row['logo'] ? $LOGOS_BASE_URL . $row['logo'] : '',
        'total'     => $gross == '1' ? (int)$row['so'] : (int)$row['sa'],
        'totalSO'   => (int)($row['so'] ?? 0),
        'totalSA'   => (int)($row['sa'] ?? 0)
    ];

    foreach ($dias as $i => $fecha) {
        $val = $row["d{$i}"] ?? null;
        $player["r{$i}"] = $val !== null && $val != 0 ? (int)$val : null;
    }

    $players[] = $player;
}

// ============= Fetch non-NORMAL players (cut players: NO SHOW, RETIRO, DQ, etc.) =============
$cutPlayers = [];

/**
 * Build per-day score expressions for cut players using the same scoring
 * functions as the active leaderboard so that any closed scorecards
 * (statlsc = 1) for these players still show up below the cut line.
 *
 * IMPORTANT: We query the `tarjetas` table directly instead of using the
 * legacy f_score_dia_sax/sox functions. Those functions rely on internal
 * views (v_resultar) that filter by player.estatus and only include
 * NORMAL or CORTE players, which is why DQ / RETIRO / NO SHOW players
 * never showed per-round scores even when their scorecards were closed
 * (statlsc = 1). Reading from `tarjetas` directly bypasses that filter
 * and exposes any closed scorecard for non-NORMAL players.
 *
 * Column choice per scoring system:
 * - STABLEFORD + GROSS → totstbgross (stableford gross points)
 * - STABLEFORD + NETO  → SA          (stableford net points)
 * - STROKE     + GROSS → SO          (gross strokes)
 * - STROKE     + NETO  → SA          (net strokes)
 */
$cutDayCols = '';
foreach ($dias as $i => $fecha) {
    $fecEsc = esc($conn, $fecha);
    // For partial rounds, drop the statlsc=1 filter so cut players also
    // show their in-progress score in the live column. For closed rounds,
    // keep the statlsc=1 filter (matches the leaderboard semantics).
    $statFilter = empty($diasPartial[$i]) ? "AND t.statlsc = 1" : '';
    if ($sistema === 'STABLEFORD' && $gross == '1') {
        // Stableford GROSS: raw stableford gross points
        $expr = "(SELECT IFNULL(SUM(t.totstbgross), 0)
                  FROM tarjetas t
                  WHERE t.jugadorid   = j.id
                    AND t.torneoid    = j.torneoid
                    AND DATE(t.fecha_juego) = '$fecEsc'
                    $statFilter)";
    } elseif ($sistema === 'STABLEFORD') {
        // Stableford NETO: SA points
        $expr = "(SELECT IFNULL(SUM(t.SA), 0)
                  FROM tarjetas t
                  WHERE t.jugadorid   = j.id
                    AND t.torneoid    = j.torneoid
                    AND DATE(t.fecha_juego) = '$fecEsc'
                    $statFilter)";
    } else {
        // Stroke Play: raw strokes (preserves prior cut-player semantics).
        // The leaderboard column shows diff-to-par for Stroke; cut players
        // historically showed raw strokes here. We keep that to avoid a
        // silent semantic change for closed-round cut data.
        $scoreCol = ($gross == '1') ? 't.SO' : 't.SA';
        $expr = "(SELECT IFNULL(SUM($scoreCol), 0)
                  FROM tarjetas t
                  WHERE t.jugadorid   = j.id
                    AND t.torneoid    = j.torneoid
                    AND DATE(t.fecha_juego) = '$fecEsc'
                    $statFilter)";
    }
    $cutDayCols .= ", $expr as d{$i}";
}

/**
 * Total expression for cut players: pick the same closed-card aggregate
 * used for the active leaderboard so a partially-played cut player still
 * shows their accumulated total.
 */
if ($sistema === 'STABLEFORD' && $gross == '1') {
    $cutTotalExpr = "$closedSTBGross as total_score";
} elseif ($gross == '1') {
    $cutTotalExpr = "$closedSO as total_score";
} else {
    $cutTotalExpr = "$closedSA as total_score";
}

$cutSql = "SELECT j.id AS jugadorid, j.numjugador,
                  CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
                  $cutTotalExpr
                  $cutDayCols,
                  c.abr, c.logo
           FROM jugadores j
           JOIN clubs c ON (j.clubid = c.id)
           WHERE j.categoriaid = $cid
             AND j.torneoid = $tid
             AND j.estatus != 'NORMAL'
           ORDER BY j.estatus ASC, j.apellido ASC";

debug_log_query('Cut players query', $cutSql);
$cutRows = query_all($conn, $cutSql);

foreach ($cutRows as $row) {
    $statusCode = mapEstatus($row['estatus']);
    /** Extract per-round scores (null when round was not played) */
    $cutRounds = [];
    foreach ($dias as $i => $fecha) {
        $val = $row["d{$i}"] ?? null;
        $cutRounds["r{$i}"] = ($val !== null && $val != 0) ? (int)$val : null;
    }
    $cutTotal = isset($row['total_score']) ? (int)$row['total_score'] : 0;

    $cutPlayers[] = array_merge([
        'playerId'    => $row['jugadorid'],
        'number'      => $row['numjugador'],
        'name'        => $row['jugador'],
        'club'        => $row['abr'],
        'clubLogo'    => $row['logo'] ? $LOGOS_BASE_URL . $row['logo'] : '',
        'statusCode'  => $statusCode ?? 'D',
        'statusLabel' => statusLabel($statusCode ?? 'D'),
        'total'       => $cutTotal,
    ], $cutRounds);
}

json_response([
    'categoryId'   => $catInfo['categoria_id'],
    'categoryName' => $catInfo['categoria'],
    'shortName'    => $catInfo['abreviatura'],
    'system'       => $catInfo['sistema'],
    'format'       => $catInfo['formato'],
    'gross'        => (int)$gross,
    'medalCount'   => $medalCount,
    'medalCountNeto'  => $medalCountNeto,
    'medalCountGross' => $medalCountGross,
    'course'       => $courseInfo ? [
        'rating'   => (float)($courseInfo['rating'] ?? 0),
        'slope'    => (int)($courseInfo['slope'] ?? 0),
        'tee'      => $courseInfo['tee'] ?? '',
        'par'      => (int)($courseInfo['parcampo'] ?? 72)
    ] : null,
    'days'         => array_values($dias),
    'daysPartial'  => array_values($diasPartial),
    'players'      => $players,
    'cutPlayers'   => $cutPlayers,
]);
