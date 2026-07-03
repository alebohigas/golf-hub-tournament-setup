<?php
/**
 * Tarjeta Parejas Endpoint
 * GET /api/tarjeta_parejas.php?jugadorid=X&categoriaid=Y&fecha=YYYY-MM-DD
 *
 * Port a JSON de los PHP legacy `tarjeta_gogo_handicap.php` y
 * `bola_baja_suma_scores.php`. Mantiene las queries exactas (v_sal_jug_par,
 * tarjetas, hoyosxsalida, valorstable) pero entrega un único shape JSON.
 *
 * El campo `estilojuego` (Go Go | Bola Baja | Suma Scores | Personal) viene
 * de `caljuego` filtrado por categoria+fecha y le dice al frontend qué
 * variante de tarjeta renderizar.
 */
require_once 'config.php';

$jugadorid   = require_param('jugadorid');
$categoriaid = require_param('categoriaid');
$fecha       = require_param('fecha');

$jid = esc($conn, $jugadorid);
$cid = esc($conn, $categoriaid);
$fec = esc($conn, $fecha);

// ============= Categoría =============
$catInfo = query_one($conn,
    "SELECT categoria_id, categoria, sistema, formato, estilo, porcentaje, salida, torneo_id
     FROM categorias WHERE categoria_id = $cid LIMIT 1");
if (!$catInfo) { json_error('Category not found', 404); }

$torneoid = $catInfo['torneo_id'];
$salidaid = $catInfo['salida'];

// ============= Estilo de juego del día =============
$cj = query_one($conn,
    "SELECT estilojuego, campo FROM caljuego
     WHERE categoriaid = $cid AND fecha = '$fec' LIMIT 1");
$estilojuego = $cj['estilojuego'] ?? 'Personal';

// ============= Datos del jugador + pareja =============
$jugRow = query_one($conn,
    "SELECT a.jugadorid, j.numjugador,
            CONCAT(j.nombre, ' ', j.apellido) as jugador,
            CONCAT(j2.nombre, ' ', j2.apellido) as jugador2,
            j.estatus, j.clubid as clubid1, j2.clubid as clubid2,
            j.id as jid1, j2.id as jid2
     FROM v_jugadores_parejas a
     JOIN jugadores j  ON (a.jugadorid  = j.id)
     JOIN jugadores j2 ON (a.jugadorid2 = j2.id)
     WHERE a.jugadorid = $jid LIMIT 1");
if (!$jugRow) { json_error('Pair not found', 404); }

/** Logos */
$logo1Row = query_one($conn, "SELECT logo, abr FROM clubs WHERE id = " . esc($conn, $jugRow['clubid1']));
$logo2Row = query_one($conn, "SELECT logo, abr FROM clubs WHERE id = " . esc($conn, $jugRow['clubid2']));
$LOGOS_BASE_URL_LOCAL = $LOGOS_BASE_URL;

// ============= Salida + tarjeta del día =============
$salRow = query_one($conn,
    "SELECT a.*, b.campo, c.*, DATE_FORMAT(a.horainicio1a,'%w') as diajgo,
            a.arso, a.arsa, a.arsap, ventajasjug as arvtj
     FROM v_sal_jug a
     JOIN campos b   ON (a.campoid   = b.id)
     JOIN tarjetas c ON (a.tarjetaid = c.id)
     WHERE a.jugadorid = $jid AND a.categoriaid = $cid AND a.fecha_juego = '$fec'
     LIMIT 1");

// ============= Tarjeta detallada (h1_a..h18_a + arsopar/arvtjpar) =============
$tarjRow = query_one($conn,
    "SELECT h1_a,h2_a,h3_a,h4_a,h5_a,h6_a,h7_a,h8_a,h9_a,
            h10_a,h11_a,h12_a,h13_a,h14_a,h15_a,h16_a,h17_a,h18_a,
            SO, SA, a.arso, a.arsa, a.arsap, ventajasjug as arvtj,
            arsopar, arsapar, arvtjpar, c.ventajas as arvtj_team, c.id as tarjeta_id
     FROM v_sal_jug a
     JOIN campos b   ON (a.campoid   = b.id)
     JOIN tarjetas c ON (a.tarjetaid = c.id)
     WHERE a.jugadorid = $jid AND a.categoriaid = $cid AND a.fecha_juego = '$fec'
     LIMIT 1");

// ============= Hoyos del campo =============
$campoid = $salRow['campoid'] ?? 0;
$holesRows = query_all($conn,
    "SELECT ID, numero, par, ventaja, yardaje
     FROM hoyosxsalida
     WHERE campoid = " . esc($conn, $campoid) . "
       AND salidaid = " . esc($conn, $salidaid) . "
     ORDER BY numero ASC");

// ============= Helpers =============
/** Convierte un CSV "v1,v2,..." en arreglo de enteros (al menos 18 elementos) */
function csv_to_int_array($csv) {
    if (!$csv) return array_fill(0, 18, 0);
    $arr = array_map('intval', explode(',', $csv));
    while (count($arr) < 18) $arr[] = 0;
    return $arr;
}

$arso1   = csv_to_int_array($tarjRow['arso']   ?? '');
$arsa1   = csv_to_int_array($tarjRow['arsa']   ?? '');
$arvtj1  = csv_to_int_array($tarjRow['arvtj']  ?? '');
$arso2   = csv_to_int_array($tarjRow['arsopar'] ?? '');
$arsa2   = csv_to_int_array($tarjRow['arsapar'] ?? '');
$arvtj2  = csv_to_int_array($tarjRow['arvtjpar'] ?? '');

/**
 * ============= HCP del equipo (fila única "hcp" del legacy) =============
 * El legacy `tarjeta_gogo_handicap.php` muestra UNA sola fila de hcp usando
 * `tarjetas.ventajas` — este campo YA contiene las ventajas combinadas del
 * equipo (calculadas por la BD según el estilojuego: Go Go, Bola Baja, etc).
 * NO se recalcula con f_getventajajug ni se usa ventajasjug/arvtjpar del
 * clone. Exponemos ese CSV tal cual como `hcpTeam`.
 */
$hcpTeam = csv_to_int_array($tarjRow['arvtj_team'] ?? '');

/** Neto por hoyo (h1_a..h18_a) — score del equipo ya ajustado */
$neto = [];
for ($h = 1; $h <= 18; $h++) {
    $val = $tarjRow["h{$h}_a"] ?? null;
    $neto[] = $val !== null ? (int)$val : 0;
}

/** Hoyos formateados */
$holes = [];
foreach ($holesRows as $hr) {
    $holes[] = [
        'hole'    => (int)$hr['numero'],
        'par'     => (int)$hr['par'],
        'ventaja' => (int)$hr['ventaja'],
        'yardaje' => (int)$hr['yardaje'],
    ];
}

/**
 * NOTA: el legacy (`tarjeta_gogo_handicap.php` y `bola_baja_suma_scores.php`)
 * NO calcula "bola baja" ni "suma" en el render. Sólo muestra ambos jugadores
 * y la fila Neto (h{n}_a). La BD ya aplica la lógica del estilojuego al
 * generar h{n}_a en `tarjetas`, así que el frontend tampoco recalcula nada.
 */

// ============= Respuesta =============
json_response([
    'estilojuego' => $estilojuego,
    'formato'     => $catInfo['formato'],
    'sistema'     => $catInfo['sistema'],
    'categoria'   => $catInfo['categoria'],
    'fecha'       => $fecha,
    'campo'       => $salRow['campo'] ?? '',
    'player1' => [
        'id'      => $jugRow['jid1'],
        'name'    => $jugRow['jugador'],
        'number'  => $jugRow['numjugador'],
        'club'    => $logo1Row['abr'] ?? '',
        'logo'    => !empty($logo1Row['logo']) ? $LOGOS_BASE_URL_LOCAL . $logo1Row['logo'] : '',
        'scoreSO' => $arso1,
        'scoreSA' => $arsa1,
        'hcpStrokes' => $arvtj1,
    ],
    'player2' => [
        'id'      => $jugRow['jid2'],
        'name'    => $jugRow['jugador2'],
        'club'    => $logo2Row['abr'] ?? '',
        'logo'    => !empty($logo2Row['logo']) ? $LOGOS_BASE_URL_LOCAL . $logo2Row['logo'] : '',
        'scoreSO' => $arso2,
        'scoreSA' => $arsa2,
        'hcpStrokes' => $arvtj2,
    ],
    'holes'    => $holes,
    /** HCP combinado del equipo por hoyo (tarjetas.ventajas del legacy) */
    'hcpTeam'  => $hcpTeam,
    /** Neto del equipo por hoyo (h{n}_a en tarjetas) */
    'neto'     => $neto,
    'totals' => [
        'pair' => [
            'SO' => (int)($tarjRow['SO'] ?? 0),
            'SA' => (int)($tarjRow['SA'] ?? 0),
        ],
        'player1' => ['SO' => array_sum($arso1), 'SA' => array_sum($arsa1)],
        'player2' => ['SO' => array_sum($arso2), 'SA' => array_sum($arsa2)],
    ],
]);