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
// Base category info comes from `categorias`. Medal counts (numganadorneto /
// numganadorgross) are stored in `caljuego` per torneo+categoría and are
// fetched separately. We probe INFORMATION_SCHEMA so missing columns on
// legacy databases fall back to defaults (3 neto, 1 gross) instead of
// causing a fatal SQL error.
$sql = "SELECT a.categoria_id, a.categoria, a.abreviatura, a.sistema, a.formato,
               a.estilo, a.gross, a.porcentaje, a.salida, a.hoyosajugar,
               COUNT(b.id) as playerCount
        FROM categorias a
        JOIN jugadores b ON (a.categoria_id = b.categoriaid)
        WHERE a.categoria_id = $cid
        GROUP BY a.categoria_id, a.categoria, a.abreviatura, a.sistema, a.formato,
                 a.estilo, a.gross, a.porcentaje, a.salida, a.hoyosajugar";

$catInfo = query_one($conn, $sql);
debug_log_query('Category info', $sql);
if (!$catInfo) {
    json_error('Category not found', 404);
}

$sistema = strtoupper($catInfo['sistema']);
$formato = strtoupper($catInfo['formato']);

/**
 * Checks whether a column exists in a given table for the active database.
 * Used to gracefully degrade when legacy schemas are missing optional columns.
 */
function caljuego_has_column($conn, $col) {
    $colEsc = esc($conn, $col);
    $res = @$conn->query(
        "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'caljuego'
           AND COLUMN_NAME = '$colEsc'
         LIMIT 1"
    );
    if (!$res) return false;
    $exists = $res->num_rows > 0;
    $res->free();
    return $exists;
}

/**
 * Medal counts live in caljuego per (torneoid, categoriaid). A category may
 * have multiple caljuego rows (one per round), so we take MAX to get a
 * single representative value. If the columns are missing, defaults apply.
 */
$hasCalNeto  = caljuego_has_column($conn, 'numganadorneto');
$hasCalGross = caljuego_has_column($conn, 'numganadorgross');

$medalCountNeto  = 3;
$medalCountGross = 1;

if ($hasCalNeto || $hasCalGross) {
    $netoSel  = $hasCalNeto  ? "MAX(numganadorneto)"  : "NULL";
    $grossSel = $hasCalGross ? "MAX(numganadorgross)" : "NULL";
    $medalSql = "SELECT $netoSel as nneto, $grossSel as ngross
                 FROM caljuego
                 WHERE categoriaid = $cid AND torneoid = $tid";
    debug_log_query('Medal counts (caljuego)', $medalSql);
    $medalRow = query_one($conn, $medalSql);
    if ($medalRow) {
        if ($hasCalNeto  && $medalRow['nneto']  !== null) $medalCountNeto  = (int)$medalRow['nneto'];
        if ($hasCalGross && $medalRow['ngross'] !== null) $medalCountGross = (int)$medalRow['ngross'];
    }
}

/** Active medal count for the requested scoring type (back-compat field) */
$medalCount = ($gross == '1') ? $medalCountGross : $medalCountNeto;

// ============= Get play dates =============
$sql = "SELECT fecha FROM caljuego
        WHERE categoriaid = $cid AND campo > 0 AND estatus > 1
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
 * RETIRO/ABANDONO → R, DESCALIFICADO/DQ → D, other → D
 */
function mapEstatus($estatus) {
    $e = strtoupper(trim($estatus));
    if ($e === 'NORMAL') return null;
    if ($e === 'NO SHOW' || $e === 'SHOW-NO' || $e === 'NO-SHOW') return 'S';
    if ($e === 'RETIRO' || $e === 'ABANDONO') return 'R';
    if ($e === 'DESCALIFICADO' || $e === 'DQ') return 'D';
    return 'D'; // default for unknown non-NORMAL statuses
}

/** Map status code to descriptive label */
function statusLabel($code) {
    if ($code === 'S') return 'No Show';
    if ($code === 'R') return 'Retiro';
    if ($code === 'D') return 'Descalificado';
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
$cutSql = "SELECT j.id AS jugadorid, j.numjugador,
                  CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
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
    $cutPlayers[] = [
        'playerId'    => $row['jugadorid'],
        'number'      => $row['numjugador'],
        'name'        => $row['jugador'],
        'club'        => $row['abr'],
        'clubLogo'    => $row['logo'] ? $LOGOS_BASE_URL . $row['logo'] : '',
        'statusCode'  => $statusCode ?? 'D',
        'statusLabel' => statusLabel($statusCode ?? 'D'),
    ];
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
