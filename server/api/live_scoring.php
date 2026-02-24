<?php
/**
 * Live Scoring Leaderboard Endpoint
 * GET /api/live_scoring.php?catid=XXX&torneoid=XXX&tipo=stroke|stableford&gross=0|1
 * Returns real-time leaderboard with per-hole detail
 * Replaces livescoring_strokego.php and similar
 */
require_once 'config.php';

$catid    = require_param('catid');
$torneoid = require_param('torneoid');
$tipo     = optional_param('tipo', 'stroke');
$gross    = optional_param('gross', '0');

$cid = esc($conn, $catid);
$tid = esc($conn, $torneoid);

// Category info
$sql = "SELECT categoria_id, categoria, abreviatura, sistema, formato, salida, porcentaje
        FROM categorias WHERE categoria_id = $cid";
$catInfo = query_one($conn, $sql);
if (!$catInfo) { json_error('Category not found', 404); }

// Course info
$salidaid = esc($conn, $catInfo['salida']);
$sql = "SELECT b.campoid, rating, slope, tee, parcampo
        FROM caljuego a
        JOIN campo_tee b ON (a.campo = b.campoid AND categoriaid = $cid AND salidaid = $salidaid)
        JOIN salidas s ON (b.salidaid = s.id)
        LIMIT 1";
$courseInfo = query_one($conn, $sql);
$parcampo = (int)($courseInfo['parcampo'] ?? 72);

// Get current day's date
$sql = "SELECT fecha FROM caljuego
        WHERE categoriaid = $cid AND campo > 0 AND estatus > 1
        ORDER BY fecha DESC LIMIT 1";
$dayInfo = query_one($conn, $sql);
$currentDate = $dayInfo['fecha'] ?? date('Y-m-d');

// Build leaderboard query
$sistema = strtoupper($catInfo['sistema']);

if ($sistema === 'STABLEFORD' || $tipo === 'stableford') {
    if ($gross == '1') {
        $scoreField = 'acumstbgross';
        $orderDir = 'DESC';
    } else {
        $scoreField = 'acumstb';
        $orderDir = 'DESC';
    }
} else {
    // Stroke Play
    $scoreField = 'acumso';
    $orderDir = 'ASC';
}

$sql = "SELECT jugadorid, numjugador,
               CONCAT(nombre, ' ', apellido) as jugador,
               logo, club, $scoreField as score,
               hoyojugando, thru, salidagrupoid,
               acumso, acumstb, acumstbgross,
               h1, h2, h3, h4, h5, h6, h7, h8, h9,
               h10, h11, h12, h13, h14, h15, h16, h17, h18,
               tarjetaid, categoriaid
        FROM v_sal_jug
        WHERE categoriaid = $cid
          AND $scoreField > 0
        ORDER BY $scoreField $orderDir";

$rows = query_all($conn, $sql);

$players = [];
$pos = 0;
foreach ($rows as $row) {
    $pos++;

    // Build 18-hole detail
    $holes = [];
    for ($h = 1; $h <= 18; $h++) {
        $score = $row["h$h"];
        $holes[] = $score !== null && $score != '' ? (int)$score : null;
    }

    // Calculate front/back nine
    $out = 0; $in = 0;
    for ($h = 0; $h < 9; $h++) { $out += $holes[$h] ?? 0; }
    for ($h = 9; $h < 18; $h++) { $in += $holes[$h] ?? 0; }

    $players[] = [
        'position'     => $pos,
        'playerId'     => $row['jugadorid'],
        'number'       => $row['numjugador'] ?? '',
        'name'         => $row['jugador'],
        'clubLogo'     => $row['logo'] ? $LOGOS_BASE_URL . '/' . $row['logo'] : '',
        'club'         => $row['club'] ?? '',
        'score'        => (int)$row['score'],
        'scoreSO'      => (int)($row['acumso'] ?? 0),
        'scoreSTB'     => (int)($row['acumstb'] ?? 0),
        'scoreSTBGross'=> (int)($row['acumstbgross'] ?? 0),
        'currentHole'  => $row['hoyojugando'] ?? null,
        'thru'         => $row['thru'] ?? null,
        'holes'        => $holes,
        'out'          => $out,
        'in'           => $in,
        'total'        => $out + $in,
        'toPar'        => ($out + $in) - $parcampo,
        'cardId'       => $row['tarjetaid'],
        'groupId'      => $row['salidagrupoid'] ?? null
    ];
}

json_response([
    'categoryId'   => $catInfo['categoria_id'],
    'categoryName' => $catInfo['categoria'],
    'shortName'    => $catInfo['abreviatura'],
    'system'       => $catInfo['sistema'],
    'type'         => $tipo,
    'gross'        => (int)$gross,
    'par'          => $parcampo,
    'course'       => $courseInfo ? [
        'rating' => (float)($courseInfo['rating'] ?? 0),
        'slope'  => (int)($courseInfo['slope'] ?? 0),
        'tee'    => $courseInfo['tee'] ?? ''
    ] : null,
    'players'      => $players
]);
