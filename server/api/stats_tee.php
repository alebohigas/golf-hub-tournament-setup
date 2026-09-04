<?php
/**
 * Stats — Estadísticas Stroke Play por Tee de Salida (hoyo por hoyo)
 * ------------------------------------------------------------------
 * GET /api/stats_tee.php?torneoid=XXX
 *     → List mode: distinct tees (mesas de salida) used by the
 *       tournament's categories. Response: { tees: [{id, tee, color, bgcolor}] }
 *
 * GET /api/stats_tee.php?torneoid=XXX&salidaids=1,2,3
 *     → Detail mode: aggregates ALL captured scorecards of every category
 *       that plays from ANY of the selected tees (salidas.id). One tee,
 *       several, or all — the frontend always sends the explicit id list.
 *
 * Detail response mirrors stats_categoria.php so the frontend can reuse
 * the same holes matrix component:
 *   {
 *     teeName, teeColor, teeCount, course, rounds, updatedAt,
 *     holes:     [{ hole, par, promedio, rank, aguilas, birdies, pares, bogeys, dobles, triples }],
 *     subtotals: { out: {...}, in: {...}, total: {...} }
 *   }
 *
 * Par note: when several tees are selected the par per hole is taken from
 * the first selected tee (lowest id) that has rows in hoyosxsalida —
 * most tees on the same course share identical pars.
 *
 * Resilient: returns null-heavy structures on missing tables (same
 * pattern as stats_categoria.php) instead of failing with 500.
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

/** Safe query_one — returns null on failure. */
function safe_one($conn, $sql) {
    $r = @$conn->query($sql);
    if (!$r) { error_log('stats_tee safe_one: ' . $conn->error); return null; }
    $row = $r->fetch_assoc();
    $r->free();
    return $row;
}
/** Safe query_all — returns [] on failure. */
function safe_all($conn, $sql) {
    $r = @$conn->query($sql);
    if (!$r) { error_log('stats_tee safe_all: ' . $conn->error); return []; }
    $rows = [];
    while ($row = $r->fetch_assoc()) { $rows[] = $row; }
    $r->free();
    return $rows;
}

// ============= List mode: tees used by this tournament =============
$salidaidsParam = isset($_GET['salidaids']) ? trim($_GET['salidaids']) : '';
if ($salidaidsParam === '') {
    $teeRows = safe_all($conn, "SELECT DISTINCT s.id, s.tee, s.color, s.bgcolor
                                  FROM categorias c
                                  JOIN salidas s ON (c.salida = s.id)
                                 WHERE c.torneo_id = $tid
                                 ORDER BY s.id ASC");
    $tees = [];
    foreach ($teeRows as $t) {
        $tees[] = [
            'id'      => (int)$t['id'],
            'tee'     => $t['tee'] ?? '',
            'color'   => $t['color'] ?? '',
            'bgcolor' => $t['bgcolor'] ?? '',
        ];
    }
    json_response(['tees' => $tees]);
}

// ============= Detail mode: aggregate across selected tees =============

/** Sanitize the comma-separated salida id list (positive ints only). */
$ids = [];
foreach (explode(',', $salidaidsParam) as $raw) {
    $n = (int)trim($raw);
    if ($n > 0 && !in_array($n, $ids, true)) { $ids[] = $n; }
}

/** Empty detail payload used when no valid tee id was provided. */
$emptyDetail = [
    'teeName'   => '',
    'teeColor'  => '',
    'teeCount'  => 0,
    'course'    => '',
    'rounds'    => 0,
    'updatedAt' => null,
    'holes'     => [],
    'subtotals' => ['out' => null, 'in' => null, 'total' => null],
];
if (!$ids) { json_response($emptyDetail); }

$idsSql = implode(',', $ids);

// Tee metadata for the header (name + color only meaningful for 1 tee)
$teeRows = safe_all($conn, "SELECT id, tee, color FROM salidas WHERE id IN ($idsSql) ORDER BY id ASC");
$teeNames = [];
foreach ($teeRows as $t) { $teeNames[] = $t['tee'] !== '' ? $t['tee'] : ('Tee ' . (int)$t['id']); }
$teeName  = implode(' + ', $teeNames);
$teeColor = (count($teeRows) === 1) ? ($teeRows[0]['color'] ?? '') : '';

// Campo id via caljuego of any category that plays from these tees
// (same resolution pattern as stats_categoria.php / players.php)
$camp = safe_one($conn, "SELECT cj.campo
                           FROM caljuego cj
                           JOIN categorias c ON (cj.categoriaid = c.categoria_id)
                          WHERE c.torneo_id = $tid
                            AND c.salida IN ($idsSql)
                            AND cj.campo > 0
                          LIMIT 1");
$campoid = $camp ? (int)$camp['campo'] : 0;
$courseRow = $campoid ? safe_one($conn, "SELECT campo FROM campos WHERE id = $campoid LIMIT 1") : null;

// Par per hole — first selected tee (by id order) that has par rows wins.
$parByHole = [];
if ($campoid) {
    foreach ($ids as $sid) {
        $parRows = safe_all($conn, "SELECT numero, par FROM hoyosxsalida
                                     WHERE campoid = $campoid AND salidaid = $sid
                                     ORDER BY numero ASC");
        if ($parRows) {
            foreach ($parRows as $pr) { $parByHole[(int)$pr['numero']] = (int)$pr['par']; }
            break;
        }
    }
}

// ============= Aggregated hole-by-hole scores =============
// Raw hole scores from tarjetas joined via v_sal_jug, restricted to
// categories of THIS tournament that play from the selected tees.
$scoreCols = [];
for ($h = 1; $h <= 18; $h++) { $scoreCols[] = "t.h{$h}"; }
$scoreColsSql = implode(', ', $scoreCols);

$rounds = 0;
$updatedAt = null;
$scoresByHole = []; // hole => array of raw scores
for ($h = 1; $h <= 18; $h++) { $scoresByHole[$h] = []; }

/**
 * has_column — true when `$table` exposes `$col`.
 * Permite degradar sin error si `caljuego.estatus` no existe.
 */
function has_column($conn, $table, $col) {
    $r = @$conn->query("SHOW COLUMNS FROM `$table` LIKE '" . esc($conn, $col) . "'");
    if (!$r) { return false; }
    $ok = $r->num_rows > 0;
    $r->free();
    return $ok;
}

/**
 * Sólo RONDAS TERMINADAS: cada tarjeta debe corresponder a un día del
 * calendario de juego (`caljuego`) de su categoría con estatus = 3.
 */
$finishedJoin = '';
if (has_column($conn, 'caljuego', 'estatus')) {
    $finishedJoin = "JOIN caljuego cj
                       ON (cj.categoriaid = v.categoriaid
                       AND cj.fecha = DATE(t.fecha_juego)
                       AND cj.estatus = 3)";
}

/**
 * `updatedAt` = última modificación real de las tarjetas contabilizadas
 * (`tarjetas.fec_ult_act`). Si la columna no existe en la BD se usa
 * `fecha_cap` como respaldo para no romper el endpoint.
 */
$hasUltAct = has_column($conn, 'tarjetas', 'fec_ult_act');
$updCol    = $hasUltAct ? 'fec_ult_act' : 'fecha_cap';

$sql = "SELECT $scoreColsSql, t.$updCol AS upd_at
          FROM v_sal_jug v
          JOIN tarjetas t   ON (v.tarjetaid = t.id)
          JOIN categorias c ON (v.categoriaid = c.categoria_id)
          $finishedJoin
         WHERE c.torneo_id = $tid
           AND c.salida IN ($idsSql)";
$rows = safe_all($conn, $sql);
foreach ($rows as $row) {
    $rounds++;
    $upd = $row['upd_at'] ?? null;
    if (!empty($upd) && substr($upd, 0, 4) !== '0000' && (!$updatedAt || $upd > $updatedAt)) {
        $updatedAt = $upd;
    }

    for ($h = 1; $h <= 18; $h++) {
        $v = $row["h{$h}"] ?? null;
        if ($v !== null && $v !== '' && (int)$v > 0) {
            $scoresByHole[$h][] = (int)$v;
        }
    }
}

// Build per-hole stats (águilas … triples+, average, difficulty rank)
$holes = [];
$rankData = []; // hole => avg-par diff (for ranking)
for ($h = 1; $h <= 18; $h++) {
    $par = $parByHole[$h] ?? null;
    $scores = $scoresByHole[$h];
    $n = count($scores);
    $sum = array_sum($scores);
    $prom = $n > 0 ? round($sum / $n, 2) : null;

    $aguilas = 0; $birdies = 0; $pares = 0; $bogeys = 0; $dobles = 0; $triples = 0;
    if ($par !== null) {
        foreach ($scores as $s) {
            $diff = $s - $par;
            if ($diff <= -2)       $aguilas++;
            else if ($diff === -1) $birdies++;
            else if ($diff === 0)  $pares++;
            else if ($diff === 1)  $bogeys++;
            else if ($diff === 2)  $dobles++;
            else if ($diff >= 3)   $triples++;
        }
    }

    $holes[] = [
        'hole'     => $h,
        'par'      => $par,
        'promedio' => $prom,
        'rank'     => null, // filled below
        'aguilas'  => $aguilas,
        'birdies'  => $birdies,
        'pares'    => $pares,
        'bogeys'   => $bogeys,
        'dobles'   => $dobles,
        'triples'  => $triples,
    ];
    if ($prom !== null && $par !== null) {
        $rankData[$h] = $prom - $par;
    }
}

// Rank holes by difficulty (higher avg-par diff = harder = rank 1)
arsort($rankData);
$rankPos = 1;
foreach ($rankData as $h => $diff) {
    foreach ($holes as &$row) {
        if ($row['hole'] === $h) { $row['rank'] = $rankPos; break; }
    }
    unset($row);
    $rankPos++;
}

/** Compute subtotal row for a range of holes (1..9 or 10..18). */
function subtotal_row($holes, $from, $to) {
    $par = 0; $prom = 0; $counted = 0;
    $a = $b = $p = $bo = $d = $t = 0;
    foreach ($holes as $h) {
        if ($h['hole'] < $from || $h['hole'] > $to) continue;
        if ($h['par'] !== null) $par += (int)$h['par'];
        if ($h['promedio'] !== null) { $prom += (float)$h['promedio']; $counted++; }
        $a  += (int)$h['aguilas'];
        $b  += (int)$h['birdies'];
        $p  += (int)$h['pares'];
        $bo += (int)$h['bogeys'];
        $d  += (int)$h['dobles'];
        $t  += (int)$h['triples'];
    }
    return [
        'par'      => $par,
        'promedio' => $counted > 0 ? round($prom, 2) : null,
        'aguilas'  => $a,
        'birdies'  => $b,
        'pares'    => $p,
        'bogeys'   => $bo,
        'dobles'   => $d,
        'triples'  => $t,
    ];
}

$out = subtotal_row($holes, 1, 9);
$in  = subtotal_row($holes, 10, 18);
$totalRow = [
    'par'      => $out['par'] + $in['par'],
    'promedio' => ($out['promedio'] !== null && $in['promedio'] !== null)
                    ? round($out['promedio'] + $in['promedio'], 2) : null,
    'aguilas'  => $out['aguilas'] + $in['aguilas'],
    'birdies'  => $out['birdies'] + $in['birdies'],
    'pares'    => $out['pares'] + $in['pares'],
    'bogeys'   => $out['bogeys'] + $in['bogeys'],
    'dobles'   => $out['dobles'] + $in['dobles'],
    'triples'  => $out['triples'] + $in['triples'],
];

json_response([
    'teeName'   => $teeName,
    'teeColor'  => $teeColor,
    'teeCount'  => count($teeRows),
    'course'    => $courseRow['campo'] ?? '',
    'rounds'    => $rounds,
    'updatedAt' => $updatedAt,
    'holes'     => $holes,
    'subtotals' => ['out' => $out, 'in' => $in, 'total' => $totalRow],
]);
