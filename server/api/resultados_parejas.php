<?php
/**
 * Resultados Parejas (Pairs) Endpoint
 * GET /api/resultados_parejas.php?catid=XXX&torneoid=XXX&gross=0|1
 * Returns pairs tournament results
 */
require_once 'config.php';

$catid    = require_param('catid');
$torneoid = require_param('torneoid');
$gross    = optional_param('gross', '0');

$cid = esc($conn, $catid);
$tid = esc($conn, $torneoid);

// Category info
$sql = "SELECT categoria_id, categoria, abreviatura, sistema, formato, salida
        FROM categorias WHERE categoria_id = $cid";
$catInfo = query_one($conn, $sql);
if (!$catInfo) { json_error('Category not found', 404); }

// Play dates
$sql = "SELECT fecha FROM caljuego
        WHERE categoriaid = $cid AND campo > 0 AND estatus > 1
        ORDER BY fecha";
$dateRows = query_all($conn, $sql);
$dias = [];
foreach ($dateRows as $i => $dr) { $dias[$i + 1] = $dr['fecha']; }

// Main query - Pairs results
if ($gross == '1') {
    $sql = "SELECT a.jugadorid, j.numjugador,
                   CONCAT(j.nombre, ' ', j.apellido) as jugador,
                   CONCAT(j2.nombre, ' ', j2.apellido) as jugador2,
                   j.estatus,
                   f_torneosox(a.jugadorid, a.torneoid) as so,
                   f_torneosax(a.jugadorid, a.torneoid) as sa";
} else {
    $sql = "SELECT a.jugadorid, j.numjugador,
                   CONCAT(j.nombre, ' ', j.apellido) as jugador,
                   CONCAT(j2.nombre, ' ', j2.apellido) as jugador2,
                   j.estatus,
                   f_torneosax(a.jugadorid, a.torneoid) as sa,
                   f_torneosox(a.jugadorid, a.torneoid) as so";
}

foreach ($dias as $i => $fecha) {
    if ($gross == '1') {
        $sql .= ", f_score_dia_sox(a.jugadorid, '$fecha') as d{$i}";
    } else {
        $sql .= ", f_score_dia_sax(a.jugadorid, '$fecha') as d{$i}";
    }
}

$sql .= ", b.abr, b.logo, b2.logo as logo2,
           REPLACE(pareja, '|', ' / ') as pareja
     FROM v_jugadores_parejas a
     JOIN v_cd_ulttar_sa u ON (a.jugadorid = u.jugadorid)
     JOIN jugadores j ON (a.jugadorid = j.id)
     JOIN jugadores j2 ON (a.jugadorid2 = j2.id)
     JOIN clubs b ON (j.clubid = b.id)
     JOIN clubs b2 ON (j2.clubid = b2.id)
     WHERE j.categoriaid = $cid
       AND f_torneoso(a.jugadorid, a.torneoid) > 0
       AND j.estatus = 'NORMAL'";

if ($gross != '1') {
    $sql .= " AND j.campgross = 0";
}

if ($gross == '1') {
    $sql .= " ORDER BY f_torneosox(a.jugadorid, a.torneoid) ASC,
                       u.cd1 ASC, u.cd2 ASC, u.cd3 ASC";
} else {
    $sql .= " ORDER BY f_torneosax(a.jugadorid, a.torneoid) ASC,
                       u.cd1 ASC, u.cd2 ASC, u.cd3 ASC";
}

$rows = query_all($conn, $sql);

$players = [];
$position = 0;
foreach ($rows as $row) {
    $position++;
    $player = [
        'position'  => $position,
        'playerId'  => $row['jugadorid'],
        'name'      => $row['jugador'],
        'partner'   => $row['jugador2'],
        'pairName'  => $row['pareja'],
        'club'      => $row['abr'],
        'clubLogo'  => $row['logo'] ? $LOGOS_BASE_URL . $row['logo'] : '',
        'clubLogo2' => $row['logo2'] ? $LOGOS_BASE_URL . $row['logo2'] : '',
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

json_response([
    'categoryId'   => $catInfo['categoria_id'],
    'categoryName' => $catInfo['categoria'],
    'shortName'    => $catInfo['abreviatura'],
    'system'       => $catInfo['sistema'],
    'format'       => 'PAREJAS',
    /** Bandera consumida por el frontend para activar layout/render de parejas */
    'isParejas'    => true,
    'gross'        => (int)$gross,
    'days'         => array_values($dias),
    'daysPartial'  => array_fill(0, count($dias), false),
    'medalCount'      => 3,
    'medalCountNeto'  => 3,
    'medalCountGross' => 1,
    /** Cut players para parejas no soportado todavía — devolver array vacío para compatibilidad. */
    'cutPlayers'   => [],
    'players'      => $players
]);
