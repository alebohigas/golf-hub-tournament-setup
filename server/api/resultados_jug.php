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

// ============= Get category info =============
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
// These replace the DB functions (f_torneosa, f_torneoso, etc.) which do NOT
// filter by statlsc, causing partial live scoring data to inflate totals.

/** Sum SA (neto/stableford points) from CLOSED cards only */
$closedSA  = "(SELECT IFNULL(SUM(t.SA), 0) FROM tarjetas t WHERE t.jugadorid = j.id AND t.torneoid = j.torneoid AND t.statlsc = 1)";

/** Sum SO (gross strokes) from CLOSED cards only */
$closedSO  = "(SELECT IFNULL(SUM(t.SO), 0) FROM tarjetas t WHERE t.jugadorid = j.id AND t.torneoid = j.torneoid AND t.statlsc = 1)";

/** Sum totstbgross (stableford gross points) from CLOSED cards only */
$closedSTBGross = "(SELECT IFNULL(SUM(t.totstbgross), 0) FROM tarjetas t WHERE t.jugadorid = j.id AND t.torneoid = j.torneoid AND t.statlsc = 1)";

// ============= Build main results query =============
$players = [];

if ($sistema === 'STROKE PLAY' || $sistema === 'STROKE') {

    if ($gross == '1') {
        // GROSS results — only closed scorecards in totals
        $sql = "SELECT j.id AS jugadorid, j.numjugador,
                       CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
                       $closedSO as so,
                       $closedSA as sa,
                       IFNULL(j.muertesubita, 0) as muertesubita";

        // Per-day scores (already filtered via v_resultar → statlsc = 1)
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

        // Priority tiebreaker: muerte subita (highest wins, 0/NULL = no value)
        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        // Tiebreaker: best last round score ASC (lowest wins in Stroke Play)
        $lastDayGross = end($dias);
        if ($lastDayGross) {
            $sql .= ", f_score_dia_sox(j.id, '$lastDayGross') ASC";
        }
        // Secondary tiebreakers (9-6-3-1 system)
        $sql .= ", u.c1 ASC, u.c2 ASC, u.c3 ASC";

    } else {
        // NETO results — only closed scorecards in totals
        $sql = "SELECT j.id AS jugadorid, j.numjugador,
                       CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
                       $closedSA as sa,
                       $closedSO as so,
                       IFNULL(j.muertesubita, 0) as muertesubita";

        // Per-day scores (already filtered via v_resultar → statlsc = 1)
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

        // Priority tiebreaker: muerte subita (highest wins, 0/NULL = no value)
        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        // Tiebreaker: best last round score ASC (lowest wins in Stroke Play)
        $lastDayNeto = end($dias);
        if ($lastDayNeto) {
            $sql .= ", f_score_dia_sax(j.id, '$lastDayNeto') ASC";
        }
        // Secondary tiebreakers (9-6-3-1 system)
        $sql .= ", u.c1 ASC, u.c2 ASC, u.c3 ASC";
    }

} elseif ($sistema === 'STABLEFORD') {

    if ($gross == '1') {
        // Stableford GROSS — only closed scorecards in totals
        $sql = "SELECT j.id AS jugadorid, j.numjugador,
                       CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
                       $closedSTBGross as sa,
                       $closedSO as so,
                       IFNULL(j.muertesubita, 0) as muertesubita";

        // Per-day scores (already filtered via v_resultar → statlsc = 1)
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

        // Priority tiebreaker: muerte subita (highest wins, 0/NULL = no value)
        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        // Tiebreaker: last round score DESC (highest last round wins)
        $lastDayGross = end($dias);
        if ($lastDayGross) {
            $sql .= ", f_score_dia_sox(j.id, '$lastDayGross') DESC";
        }
        // Secondary tiebreakers
        $sql .= ", u.c1 DESC, u.c2 DESC, u.c3 DESC";
    } else {
        // Stableford NETO — only closed scorecards in totals
        $sql = "SELECT j.id AS jugadorid, j.numjugador,
                       CONCAT(j.nombre, ' ', j.apellido) as jugador, j.estatus,
                       $closedSA as sa,
                       $closedSO as so,
                       IFNULL(j.muertesubita, 0) as muertesubita";

        // Per-day scores (already filtered via v_resultar → statlsc = 1)
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

        // Priority tiebreaker: muerte subita (highest wins, 0/NULL = no value)
        $sql .= ", IFNULL(j.muertesubita, 0) DESC";
        // Tiebreaker: last round score DESC (highest last round wins)
        $lastDay = end($dias);
        if ($lastDay) {
            $sql .= ", f_score_dia_sax(j.id, '$lastDay') DESC";
        }
        // Secondary tiebreakers
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

    // Add per-day scores
    foreach ($dias as $i => $fecha) {
        $val = $row["d{$i}"] ?? null;
        $player["r{$i}"] = $val !== null && $val != 0 ? (int)$val : null;
    }

    $players[] = $player;
}

json_response([
    'categoryId'   => $catInfo['categoria_id'],
    'categoryName' => $catInfo['categoria'],
    'shortName'    => $catInfo['abreviatura'],
    'system'       => $catInfo['sistema'],
    'format'       => $catInfo['formato'],
    'gross'        => (int)$gross,
    'course'       => $courseInfo ? [
        'rating'   => (float)($courseInfo['rating'] ?? 0),
        'slope'    => (int)($courseInfo['slope'] ?? 0),
        'tee'      => $courseInfo['tee'] ?? '',
        'par'      => (int)($courseInfo['parcampo'] ?? 72)
    ] : null,
    'days'         => array_values($dias),
    'players'      => $players
]);
