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
                 LEFT JOIN v_cd_ulttar_sa u ON (j.id = u.jugadorid)
                 JOIN clubs c ON (j.clubid = c.id)
                 WHERE j.categoriaid = $cid
                   AND j.torneoid = $tid
                   AND f_torneoso(j.id, j.torneoid) > 0
                   AND j.estatus = 'NORMAL'
                 ORDER BY $closedSO ASC";

        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        $lastDayGross = end($dias);
        if ($lastDayGross) {
            $sql .= ", f_score_dia_sox(j.id, '$lastDayGross') ASC";
        }
        $sql .= ", u.c1 ASC, u.c2 ASC, u.c3 ASC";

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

        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        $lastDayNeto = end($dias);
        if ($lastDayNeto) {
            $sql .= ", f_score_dia_sax(j.id, '$lastDayNeto') ASC";
        }
        $sql .= ", u.c1 ASC, u.c2 ASC, u.c3 ASC";
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
                 LEFT JOIN v_cd_ulttar_sa u ON (j.id = u.jugadorid)
                 JOIN clubs c ON (j.clubid = c.id)
                 WHERE j.categoriaid = $cid
                   AND j.torneoid = $tid
                   AND f_torneoso(j.id, j.torneoid) > 0
                   AND j.estatus = 'NORMAL'
                 ORDER BY $closedSTBGross DESC";

        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        $lastDayGross = end($dias);
        if ($lastDayGross) {
            $sql .= ", f_score_dia_sox(j.id, '$lastDayGross') DESC";
        }
        $sql .= ", u.c1 DESC, u.c2 DESC, u.c3 DESC";
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

        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        $lastDay = end($dias);
        if ($lastDay) {
            $sql .= ", f_score_dia_sax(j.id, '$lastDay') DESC";
        }
        $sql .= ", u.c1 DESC, u.c2 DESC, u.c3 DESC";
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
 * - GROSS uses f_score_dia_sox (gross strokes / stableford gross points)
 * - NETO  uses f_score_dia_sax (neto strokes / stableford points)
 */
$cutDayCols = '';
foreach ($dias as $i => $fecha) {
    if ($gross == '1') {
        $cutDayCols .= ", f_score_dia_sox(j.id, '$fecha') as d{$i}";
    } else {
        $cutDayCols .= ", f_score_dia_sax(j.id, '$fecha') as d{$i}";
    }
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
