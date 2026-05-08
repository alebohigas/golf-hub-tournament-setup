<?php
/**
 * Mejor Score Diario Endpoint
 * GET /api/mejor_score_diario.php?torneoid=XXX
 *
 * Replicates legacy report `mejor-score-diario.php`. For each (premio, fecha)
 * returned by `mejorscorep`, fetches winners from the legacy view
 * `v_mejorscorejugp`, joins to `categorias` to determine the scoring
 * formato so the frontend can split players into Stableford vs Stroke Play
 * within the same day section.
 *
 * Returns:
 *   [
 *     {
 *       premio: int,
 *       fecha: "YYYY-MM-DD",
 *       fechaLabel: "viernes, 24 de abril de 2026",
 *       stableford: [ { jugador, cat, score, clubLogo } ],
 *       strokePlay: [ { jugador, cat, score, clubLogo } ]
 *     }, ...
 *   ]
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

/** Spanish day/month labels (server-locale-independent) */
$DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
$MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

/**
 * Format a YYYY-MM-DD date as "viernes, 24 de abril de 2026"
 * Avoids reliance on setlocale / IntlDateFormatter which may not be
 * configured on shared hosting.
 */
function format_dia_es($iso) {
    global $DIAS, $MESES;
    $parts = explode('-', $iso);
    if (count($parts) !== 3) return $iso;
    [$y, $m, $d] = $parts;
    $ts = mktime(12, 0, 0, (int)$m, (int)$d, (int)$y);
    if ($ts === false) return $iso;
    $diaIdx = (int)date('w', $ts);
    $mesIdx = (int)$m - 1;
    return sprintf('%s, %d de %s de %d',
        $DIAS[$diaIdx] ?? '',
        (int)$d,
        $MESES[$mesIdx] ?? '',
        (int)$y
    );
}

// 1) Distinct premio+fecha combinations from mejorscorep
$sql = "SELECT DISTINCT premio, fecha
        FROM mejorscorep
        WHERE torneoid = $tid
        ORDER BY fecha ASC, premio ASC";
$sections = query_all($conn, $sql);

$out = [];
foreach ($sections as $sec) {
    $premio = (int)$sec['premio'];
    $fecha = $sec['fecha'];
    $fechaEsc = esc($conn, $fecha);

    // 2) Per-section players, joined to categorias to detect Stableford vs Stroke Play.
    //    `formato` typically contains 'STABLEFORD' or 'STROKE PLAY'.
    $sql = "SELECT v.id,
                   v.jugador,
                   v.abreviatura       AS cat,
                   ROUND(v.distancia,0) AS score,
                   v.logojug           AS clubLogo,
                   v.categoriaid,
                   COALESCE(c.formato, c.sistema, '') AS formato
            FROM v_mejorscorejugp v
            LEFT JOIN categorias c ON (c.categoria_id = v.categoriaid)
            WHERE v.premio = $premio
              AND v.torneoid = $tid
              AND v.fecha = '$fechaEsc'
            ORDER BY v.categoriaid DESC";
    $rows = query_all($conn, $sql);

    $stableford = [];
    $strokePlay = [];
    foreach ($rows as $r) {
        $isStableford = stripos($r['formato'] ?? '', 'STABLEFORD') !== false;
        $player = [
            'jugador'  => $r['jugador'],
            'cat'      => $r['cat'],
            'score'    => (int)$r['score'],
            'clubLogo' => $r['clubLogo'],
        ];
        if ($isStableford) {
            $stableford[] = $player;
        } else {
            $strokePlay[] = $player;
        }
    }

    $out[] = [
        'premio'     => $premio,
        'fecha'      => $fecha,
        'fechaLabel' => format_dia_es($fecha),
        'stableford' => $stableford,
        'strokePlay' => $strokePlay,
    ];
}

json_response($out);