<?php
/**
 * Resultados Tarjeta del Jugador (Player Scorecard) Endpoint
 * GET /api/resultados_tarjeta.php?jugadorid=XXX&categoriaid=XXX&fecha=YYYY-MM-DD&tipo=stroke|stableford
 * Returns hole-by-hole scorecard for a player
 * Supports: Stroke (with/without HCP), Stableford, Parejas
 */
require_once 'config.php';

$jugadorid   = require_param('jugadorid');
$categoriaid = require_param('categoriaid');
$fecha       = optional_param('fecha', '0');
$tipo        = optional_param('tipo', 'stroke'); // stroke, stableford, parejas

$jid = esc($conn, $jugadorid);
$cid = esc($conn, $categoriaid);
$fec = esc($conn, $fecha);

// ============= Category info =============
$sql = "SELECT categoria_id, categoria, sistema, formato, estilo, porcentaje, salida, torneo_id
        FROM categorias WHERE categoria_id = $cid";
$catInfo = query_one($conn, $sql);
if (!$catInfo) { json_error('Category not found', 404); }

$formato = strtoupper($catInfo['formato']);
$torneoid = $catInfo['torneo_id'];

// ============= Player + card data =============
if ($formato === 'PAREJAS') {
    $sql = "SELECT a.*, b.campo, c.*,
                   DATE_FORMAT(a.horainicio1a, '%w') as diajgo,
                   a.arso, a.arsa, a.arsap,
                   (c.so - c.sa) as handicapneto,
                   f_getventajajug((c.so - c.sa), a.campoid, teesalidaid) as arvtj
            FROM v_sal_jug_par a
            JOIN campos b ON (a.campoid = b.id)
            JOIN tarjetas c ON (a.tarjetaid = c.id)
            WHERE a.jugadorid = $jid AND a.categoriaid = $cid";
    if ($fecha !== '0') { $sql .= " AND a.fecha_juego = '$fec'"; }
} else {
    $sql = "SELECT a.*, b.campo, c.*,
                   DATE_FORMAT(a.horainicio1a, '%w') as diajgo,
                   a.arso, a.arsa, a.arsap,
                   ventajasjug as arvtj
            FROM v_sal_jug a
            JOIN campos b ON (a.campoid = b.id)
            JOIN tarjetas c ON (a.tarjetaid = c.id)
            WHERE a.jugadorid = $jid AND a.categoriaid = $cid";
    if ($fecha !== '0') { $sql .= " AND a.fecha_juego = '$fec'"; }
    $sql .= " ORDER BY a.fecha_juego, a.apellido, a.nombre";
}

debug_log_query('Player + card data (' . $formato . ')', $sql);
$playerData = query_one($conn, $sql);
if (!$playerData) { json_error('Player card not found', 404); }

// ============= Score adjusted (SA) per hole =============
if ($formato === 'PAREJAS') {
    $sql = "SELECT h1_a, h2_a, h3_a, h4_a, h5_a, h6_a, h7_a, h8_a, h9_a,
                   h10_a, h11_a, h12_a, h13_a, h14_a, h15_a, h16_a, h17_a, h18_a,
                   c.SO, c.SA, a.arso, a.arsa, a.arsap,
                   (c.so - c.sa) as handicapneto,
                   f_getventajajug((c.so - c.sa), a.campoid, teesalidaid) as arvtj
            FROM v_sal_jug_par a
            JOIN campos b ON (a.campoid = b.id)
            JOIN tarjetas c ON (a.tarjetaid = c.id)
            WHERE a.jugadorid = $jid AND a.categoriaid = $cid AND a.fecha_juego = '$fec'";
} else {
    $sql = "SELECT h1_a, h2_a, h3_a, h4_a, h5_a, h6_a, h7_a, h8_a, h9_a,
                   h10_a, h11_a, h12_a, h13_a, h14_a, h15_a, h16_a, h17_a, h18_a,
                   SO, SA, a.arso, a.arsa, a.arsap, ventajasjug as arvtj
            FROM v_sal_jug a
            JOIN campos b ON (a.campoid = b.id)
            JOIN tarjetas c ON (a.tarjetaid = c.id)
            WHERE a.jugadorid = $jid AND a.categoriaid = $cid AND a.fecha_juego = '$fec'";
}

debug_log_query('Score adjusted (SA) per hole', $sql);
$scoreData = query_one($conn, $sql);

// ============= Hole info (par + ventaja per hole) =============
$campoid  = $playerData['campoid'] ?? $playerData['id_campo'] ?? 0;
$salidaid = $catInfo['salida'];

$sql = "SELECT ID, numero, par, campoid, salidaid, ventaja, yardaje
        FROM hoyosxsalida
        WHERE campoid = " . esc($conn, $campoid) . "
          AND salidaid = " . esc($conn, $salidaid) . "
        ORDER BY numero ASC";

debug_log_query('Hole info (par + ventaja)', $sql);
$holeRows = query_all($conn, $sql);

// ============= Stableford values table =============
$stablefordValues = [];
if (strtoupper($catInfo['sistema']) === 'STABLEFORD') {
    $sql = "SELECT * FROM valorstable WHERE torneoid = " . esc($conn, $torneoid);
    $stablefordValues = query_all($conn, $sql);
}

// ============= Build response =============

// Parse ventajas (handicap strokes per hole) from CSV string
$ventajas = [];
if (isset($scoreData['arvtj']) && $scoreData['arvtj']) {
    $ventajas = array_map('intval', explode(',', $scoreData['arvtj']));
}

// Build holes array
$holes = [];
for ($h = 1; $h <= 18; $h++) {
    $holeInfo = null;
    foreach ($holeRows as $hr) {
        if ((int)$hr['numero'] === $h) { $holeInfo = $hr; break; }
    }

    $scoreSO = $playerData["h{$h}"] ?? null;   // Score Original
    $scoreSA = $scoreData["h{$h}_a"] ?? null;    // Score Adjusted

    $holes[] = [
        'hole'     => $h,
        'par'      => $holeInfo ? (int)$holeInfo['par'] : null,
        'ventaja'  => $holeInfo ? (int)$holeInfo['ventaja'] : null,
        'yardaje'  => $holeInfo ? (int)$holeInfo['yardaje'] : null,
        'scoreSO'  => $scoreSO !== null ? (int)$scoreSO : null,
        'scoreSA'  => $scoreSA !== null ? (int)$scoreSA : null,
        'hcpStrokes' => isset($ventajas[$h - 1]) ? $ventajas[$h - 1] : 0
    ];
}

// Front nine and back nine totals
$outSO = 0; $inSO = 0; $outSA = 0; $inSA = 0; $outPar = 0; $inPar = 0;
foreach ($holes as $h) {
    if ($h['hole'] <= 9) {
        $outSO += $h['scoreSO'] ?? 0;
        $outSA += $h['scoreSA'] ?? 0;
        $outPar += $h['par'] ?? 0;
    } else {
        $inSO += $h['scoreSO'] ?? 0;
        $inSA += $h['scoreSA'] ?? 0;
        $inPar += $h['par'] ?? 0;
    }
}

json_response([
    'player' => [
        'id'       => $playerData['jugadorid'],
        'number'   => $playerData['numjugador'] ?? '',
        'name'     => trim(($playerData['nombre'] ?? '') . ' ' . ($playerData['apellido'] ?? '')),
        'club'     => $playerData['club'] ?? '',
        'tee'      => $playerData['tee'] ?? '',
        'teeSal'   => $playerData['teesal'] ?? '',
        'time'     => $playerData['horainicio1a'] ?? '',
        'hcpIndex' => $playerData['indexjgo'] ?? '',
        'slope'    => $playerData['slope'] ?? '',
        'course'   => $playerData['campo'] ?? ''
    ],
    'category' => [
        'id'     => $catInfo['categoria_id'],
        'name'   => $catInfo['categoria'],
        'system' => $catInfo['sistema'],
        'format' => $catInfo['formato']
    ],
    'date'    => $fecha,
    'totals'  => [
        'SO'     => (int)($scoreData['SO'] ?? 0),
        'SA'     => (int)($scoreData['SA'] ?? 0),
        'outSO'  => $outSO,
        'inSO'   => $inSO,
        'outSA'  => $outSA,
        'inSA'   => $inSA,
        'outPar' => $outPar,
        'inPar'  => $inPar,
        'par'    => $outPar + $inPar
    ],
    'holes'           => $holes,
    'stablefordValues' => $stablefordValues
]);
