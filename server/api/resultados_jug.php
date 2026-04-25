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
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1'); 

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

// ============= Get play dates =============
// Include ALL scheduled rounds with a course assigned (campo > 0), regardless
// of caljuego.estatus. Per-round score functions (f_score_dia_sax/sox) already
// filter by closed scorecards (statlsc = 1) via v_resultar, so unplayed rounds
// return 0 and are hidden client-side by the `$val != 0` check below.
// Previously this required estatus > 1, which dropped a round (e.g. R3) when
// the caljuego row hadn't been advanced past "in progress" — even though
// scorecards for that day were already closed (bug seen in category Primera).
$sql = "SELECT fecha FROM caljuego
        WHERE categoriaid = $cid AND campo > 0
        ORDER BY fecha";
$dateRows = query_all($conn, $sql);

$dias = [];
foreach ($dateRows as $i => $dr) {
    $dias[$i + 1] = $dr['fecha'];
}

// ============= Get course info =============
$sql = "SELECT b.campoid, b.salidaid, rating, slope, tee, parcampo
        FROM caljuego a
        JOIN campo_tee b ON (a.campo = b.campoid AND categoriaid = $cid AND salidaid = " . esc($conn, $catInfo['salida']) . ")
        JOIN salidas s ON (b.salidaid = s.id)
        LIMIT 1";
$courseInfo = query_one($conn, $sql);

// ============= Inline subquery helpers for closed-card totals =============

/** Sum SA (neto/stableford points) from CLOSED cards only */
$closedSA  = "(SELECT IFNULL(SUM(t.SA), 0) FROM tarjetas t WHERE t.jugadorid = j.id AND t.torneoid = j.torneoid AND t.statlsc = 1)";

/** Sum SO (gross strokes) from CLOSED cards only */
$closedSO  = "(SELECT IFNULL(SUM(t.SO), 0) FROM tarjetas t WHERE t.jugadorid = j.id AND t.torneoid = j.torneoid AND t.statlsc = 1)";

/** Sum totstbgross (stableford gross points) from CLOSED cards only */
$closedSTBGross = "(SELECT IFNULL(SUM(t.totstbgross), 0) FROM tarjetas t WHERE t.jugadorid = j.id AND t.torneoid = j.torneoid AND t.statlsc = 1)";

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
    if (!$r1) return '0';
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

// ============= Legacy "diax" (penultimate round date) =============
/**
 * In the legacy ORDER BY, the very last tiebreaker is `f_score_dia_sa{x|o}(id, '$diax')`
 * where `$diax` is the penultimate scheduled round (R2 if R3 exists, otherwise R1
 * if R2 exists). When only one round exists, this tiebreaker is omitted.
 */
$diaxDate = '';
if (isset($dias[3])) {
    $diaxDate = esc($conn, $dias[2]);
} elseif (isset($dias[2])) {
    $diaxDate = esc($conn, $dias[1]);
}

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
 * @param array  $dias       1-indexed map of round number → date.
 * @param string $direction  'ASC' or 'DESC'.
 * @return string SQL fragment to append to ORDER BY (starts with ", ").
 */
function prev_rounds_tiebreaker(array $dias, $direction) {
    if (count($dias) < 2) return '';
    // Iterate from the most recent round down to round 1.
    $rounds = array_keys($dias);
    rsort($rounds);
    $parts = [];
    foreach ($rounds as $i) {
        // d{i} is the per-round score alias from the main SELECT.
        // Wrap with IFNULL so unplayed rounds (NULL/0) don't poison ordering.
        $parts[] = "IFNULL(d{$i}, 0) {$direction}";
    }
    return ', ' . implode(', ', $parts);
}

// ============= Legacy R1 chunk tiebreaker (c1..c6) =============
/**
 * Build the legacy R1 hole-chunk tiebreaker using the per-hole points stored
 * in `jugadores` columns `c1..c6` (each holds the points for the back-nine
 * chunks of Round 1 — these are computed/maintained by the legacy system).
 *
 * Progression (matches legacy order_by exactly):
 *   (c1+c2+c3+c4+c5) → (c1+c2+c3+c4) → (c1+c2+c3) → c1
 *
 * Direction:
 *   - Stroke Play  → ASC  (fewer strokes wins)
 *   - Stableford   → DESC (more points wins, per legacy SQL)
 *
 * Returns a SQL fragment to append to ORDER BY (starts with ", ").
 */
function legacy_r1_chunks($direction) {
    // Columns c1..c6 come from views v_cd_ulttar_sa (NETO) / v_cd_ulttar_so (GROSS),
    // joined as alias `u`. They represent Round-1 hole groupings:
    //   c1=h18, c2=h17, c3=h16, c4=h15+h14+h13, c5=h12+h11+h10, c6=front nine.
    return ", (u.c1+u.c2+u.c3+u.c4+u.c5) {$direction}"
         . ", (u.c1+u.c2+u.c3+u.c4) {$direction}"
         . ", (u.c1+u.c2+u.c3) {$direction}"
         . ", u.c1 {$direction}";
}

// ============= Legacy "ultima tarjeta" (latest closed round) tiebreaker =============
/**
 * Mirrors the legacy `f_score_dia_saxU(id)` / `f_score_dia_satblU(id)` /
 * `f_score_dia_soxU(id)` functions: the score of the player's MOST RECENT
 * closed scorecard (statlsc = 1). We re-implement it inline as a scalar
 * subquery to avoid depending on those functions being installed in every
 * MySQL instance.
 *
 * @param string $col Column to read from the latest closed tarjeta:
 *                    - 'SA'         → stableford net points / stroke net total
 *                    - 'SO'         → gross strokes
 *                    - 'totstbgross'→ stableford gross points
 */
function latest_card_score($col) {
    return "(SELECT t.{$col}
             FROM tarjetas t
             WHERE t.jugadorid = j.id
               AND t.torneoid  = j.torneoid
               AND t.statlsc   = 1
             ORDER BY t.fecha_juego DESC
             LIMIT 1)";
}

// ============= Legacy "diax" per-round score expression =============
/**
 * Last legacy tiebreaker: per-round score on the penultimate scheduled day.
 * Returns empty string when there's only one round (no diax).
 *
 * @param string $func Legacy function name:
 *                     - 'sax' → stableford net / stroke net per-day
 *                     - 'sox' → stroke gross per-day (also used for stableford gross legacy)
 * @param string $diax Escaped penultimate round date (YYYY-MM-DD) or '' to skip.
 * @param string $direction 'ASC' or 'DESC' (legacy uses no explicit dir → defaults to ASC).
 */
function diax_tiebreaker($func, $diax, $direction = 'ASC') {
    if ($diax === '') return '';
    return ", f_score_dia_{$func}(j.id, '{$diax}') {$direction}";
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
            $sql .= ", f_score_dia_sox(j.id, '$fecha') as d{$i}";
        }

        $sql .= ", c.abr, c.logo
                 FROM jugadores j
                 LEFT JOIN v_cd_ulttar_so u ON (j.id = u.jugadorid)
                 JOIN clubs c ON (j.clubid = c.id)
                 WHERE j.categoriaid = $cid
                   AND j.torneoid = $tid
                   AND f_torneoso(j.id, j.torneoid) > 0
                   AND j.estatus = 'NORMAL'
                 ORDER BY $closedSO ASC";

        // ===== Legacy ORDER BY (Stroke Play GROSS) =====
        // f_torneosox ASC, muertesubita DESC, latest-card SO ASC,
        // (c1+..+c5) ASC, (c1+..+c4) ASC, (c1+..+c3) ASC, c1 ASC,
        // f_score_dia_sox(diax) ASC
        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        $sql .= ", " . latest_card_score('SO') . " ASC";
        $sql .= legacy_r1_chunks('ASC');
        $sql .= diax_tiebreaker('sox', $diaxDate, 'ASC');

    } else {
        $sql = "SELECT j.id AS jugadorid, j.numjugador,
                       CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
                       $closedSA as sa,
                       $closedSO as so,
                       IFNULL(j.muertesubita, 0) as muertesubita";

        foreach ($dias as $i => $fecha) {
            $sql .= ", f_score_dia_sax(j.id, '$fecha') as d{$i}";
        }

        $sql .= ", c.abr, c.logo
                 FROM jugadores j
                 LEFT JOIN v_cd_ulttar_sa u ON (j.id = u.jugadorid)
                 JOIN clubs c ON (j.clubid = c.id)
                 WHERE j.categoriaid = $cid
                   AND j.torneoid = $tid
                   AND f_torneoso(j.id, j.torneoid) > 0
                   AND j.estatus = 'NORMAL'
                   AND j.campgross = 0
                 ORDER BY $closedSA ASC";

        // ===== Legacy ORDER BY (Stroke Play NETO) =====
        // f_torneosax ASC, muertesubita DESC, latest-card SA ASC,
        // (c1+..+c5) ASC, (c1+..+c4) ASC, (c1+..+c3) ASC, c1 ASC
        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        $sql .= ", " . latest_card_score('SA') . " ASC";
        $sql .= legacy_r1_chunks('ASC');
    }

} elseif ($sistema === 'STABLEFORD') {

    if ($gross == '1') {
        $sql = "SELECT j.id AS jugadorid, j.numjugador,
                       CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
                       $closedSTBGross as sa,
                       $closedSO as so,
                       IFNULL(j.muertesubita, 0) as muertesubita";

        foreach ($dias as $i => $fecha) {
            $sql .= ", f_score_dia_sox(j.id, '$fecha') as d{$i}";
        }

        $sql .= ", c.abr, c.logo
                 FROM jugadores j
                 LEFT JOIN v_cd_ulttar_so u ON (j.id = u.jugadorid)
                 JOIN clubs c ON (j.clubid = c.id)
                 WHERE j.categoriaid = $cid
                   AND j.torneoid = $tid
                   AND f_torneoso(j.id, j.torneoid) > 0
                   AND j.estatus = 'NORMAL'
                 ORDER BY $closedSTBGross DESC";

        // ===== Legacy ORDER BY (Stableford GROSS) =====
        // f_stl_gross DESC, muertesubita DESC, latest-card totstbgross DESC,
        // (c1+..+c5) DESC, (c1+..+c4) DESC, (c1+..+c3) DESC, c1 DESC,
        // f_score_dia_sox(diax) ASC
        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        $sql .= ", " . latest_card_score('totstbgross') . " DESC";
        $sql .= legacy_r1_chunks('DESC');
        $sql .= diax_tiebreaker('sox', $diaxDate, 'ASC');
    } else {
        $sql = "SELECT j.id AS jugadorid, j.numjugador,
                       CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
                       $closedSA as sa,
                       $closedSO as so,
                       IFNULL(j.muertesubita, 0) as muertesubita";

        foreach ($dias as $i => $fecha) {
            $sql .= ", f_score_dia_sax(j.id, '$fecha') as d{$i}";
        }

        $sql .= ", c.abr, c.logo
                 FROM jugadores j
                 LEFT JOIN v_cd_ulttar_sa u ON (j.id = u.jugadorid)
                 JOIN clubs c ON (j.clubid = c.id)
                 WHERE j.categoriaid = $cid
                   AND j.torneoid = $tid
                   AND f_torneoso(j.id, j.torneoid) > 0
                   AND j.estatus = 'NORMAL'
                   AND j.campgross = 0
                 ORDER BY $closedSA DESC";

        // ===== Legacy ORDER BY (Stableford NETO) =====
        // f_torneosa DESC, muertesubita DESC, latest-card SA DESC,
        // (c1+..+c5) DESC, (c1+..+c4) DESC, (c1+..+c3) DESC, c1 DESC,
        // f_score_dia_sax(diax) ASC
        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        $sql .= ", " . latest_card_score('SA') . " DESC";
        $sql .= legacy_r1_chunks('DESC');
        $sql .= diax_tiebreaker('sax', $diaxDate, 'ASC');
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
    if ($sistema === 'STABLEFORD' && $gross == '1') {
        $scoreCol = 't.totstbgross';
    } elseif ($gross == '1') {
        $scoreCol = 't.SO';
    } else {
        $scoreCol = 't.SA';
    }
    $fecEsc = esc($conn, $fecha);
    // Subquery: closed scorecard (statlsc = 1) for this player on this date
    $cutDayCols .= ", (SELECT IFNULL(SUM($scoreCol), 0)
                       FROM tarjetas t
                       WHERE t.jugadorid   = j.id
                         AND t.torneoid    = j.torneoid
                         AND t.fecha_juego = '$fecEsc'
                         AND t.statlsc     = 1) as d{$i}";
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
    'players'      => $players,
    'cutPlayers'   => $cutPlayers,
]);
