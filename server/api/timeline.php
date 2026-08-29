<?php
/**
 * Time Line — Horarios estimados por hoyo
 * -----------------------------------------------------------------------------
 * Réplica del reporte legacy `reportes/Print_time_line_horario.php`, expuesta
 * como JSON para que el frontend la renderice con el diseño del sitio.
 *
 * USO
 *   GET /api/timeline.php?torneoid=346&fecha=2026-04-24&campoid=27
 *       &hi=1&hf=1&hri=6:00&hrf=11:00
 *   → {
 *       tournament, club, course, fecha, fechaFormato,
 *       holes:  [ { numero, par, minutes } ],           // 18 hoyos del campo
 *       groups: [ { id, time, tee, hole, categoryName, shortName,
 *                   times: ["06:45", ...],              // hora estimada x hoyo
 *                   players: [ { id, name, clubLogo } ] } ]
 *     }
 *
 * FILTROS  (idénticos a salidas_impresion.php)
 *   hi/hf   → rango de hoyo de salida (inclusive, estricto)
 *   hri/hrf → rango de hora de salida (HH:MM, inclusive)
 *
 * CÁLCULO DE LA LÍNEA DE TIEMPO
 *   Cada hoyo tiene un tiempo de juego en minutos. Se toma de la columna de
 *   minutos de `hoyosxsalida` cuando existe (el nombre varía entre
 *   instalaciones: ver tl_minutes_column) y, si no existe, se estima por par
 *   con la tabla TL_PAR_MINUTES (derivada del reporte legacy).
 *   La hora de cada hoyo es: hora de salida + minutos acumulados en el ORDEN
 *   DE JUEGO, que arranca en el hoyo de salida del grupo y da la vuelta
 *   (p. ej. salida en 10 → 10,11,…,18,1,…,9).
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

// Fechas/meses en español para los encabezados del reporte.
@$conn->query("SET lc_time_names = 'es_ES'");

/** Minutos estimados por par cuando el campo no guarda el tiempo por hoyo. */
$TL_PAR_MINUTES = [3 => 15, 4 => 14, 5 => 19];

/** query_all tolerante: registra el error y devuelve [] en lugar de fallar. */
function tl_all($conn, $sql) {
    $r = @$conn->query($sql);
    if (!$r) { error_log('timeline: ' . $conn->error . ' | ' . $sql); return []; }
    $rows = [];
    while ($row = $r->fetch_assoc()) { $rows[] = $row; }
    $r->free();
    return $rows;
}

/** query_one tolerante. */
function tl_one($conn, $sql) {
    $rows = tl_all($conn, $sql);
    return $rows[0] ?? null;
}

/** Lista de columnas de una tabla (vacío si la tabla no existe). */
function tl_columns($conn, $table) {
    $cols = [];
    foreach (tl_all($conn, "SHOW COLUMNS FROM `$table`") as $c) $cols[] = $c['Field'];
    return $cols;
}

/** Devuelve la primera columna de $table que coincida con $candidates. */
function tl_pick_column($conn, $table, $candidates) {
    $cols = tl_columns($conn, $table);
    foreach ($candidates as $cand) {
        foreach ($cols as $col) if (strcasecmp($col, $cand) === 0) return $col;
    }
    return null;
}

/** Columna del hoyo de salida en `salidagrupo` (varía entre instalaciones). */
function tl_hole_column($conn) {
    return tl_pick_column($conn, 'salidagrupo', [
        'hoyo1a', 'hoyoinicio1a', 'hoyoini1a', 'hoyoinicio', 'hoyoini', 'hoyoi', 'hoyo',
    ]);
}

/** Columna de minutos de juego por hoyo en `hoyosxsalida` (si existe). */
function tl_minutes_column($conn) {
    return tl_pick_column($conn, 'hoyosxsalida', [
        'tiempo', 'minutos', 'tiempojuego', 'tiempo_juego', 'partime', 'par_time',
        'timepar', 'tpo', 'mins', 'minutosjuego',
    ]);
}

// ============= Parámetros =============
$fecha   = require_param('fecha');
$campoid = optional_param('campoid', '');
$hi      = (int)optional_param('hi', 1);
$hf      = (int)optional_param('hf', 18);
$hri     = optional_param('hri', '00:00');
$hrf     = optional_param('hrf', '23:59');

$fEsc   = esc($conn, $fecha);
$cEsc   = $campoid !== '' ? (int)$campoid : 0;
$hriEsc = esc($conn, substr(trim($hri), 0, 5) . ':00');
$hrfEsc = esc($conn, substr(trim($hrf), 0, 5) . ':59');

// ============= Encabezado =============
$head = tl_one($conn, "SELECT a.nombre, b.nombre AS club
                         FROM torneo a JOIN clubs b ON (a.club_id = b.id)
                        WHERE a.torneo_id = $tid");
$courseRow = $cEsc ? tl_one($conn, "SELECT campo FROM campos WHERE id = $cEsc LIMIT 1") : null;
$fechaFmt  = tl_one($conn, "SELECT DATE_FORMAT('$fEsc', '%W, %e de %M %Y') AS f");

// ============= Hoyos del campo (par + minutos) =============
$minCol  = tl_minutes_column($conn);
$minExpr = $minCol ? "hx.`$minCol`" : 'NULL';
$holeRows = $cEsc
    ? tl_all($conn, "SELECT hx.numero, hx.par, $minExpr AS minutos
                       FROM hoyosxsalida hx
                      WHERE hx.campoid = $cEsc AND hx.salidaid = 2
                      ORDER BY hx.numero ASC")
    : [];

/** Hoyos normalizados: numero, par y minutos de juego resueltos. */
$holes = [];
foreach ($holeRows as $h) {
    $num = (int)$h['numero'];
    if ($num < 1 || $num > 18) continue;
    $par = (int)$h['par'];
    $min = isset($h['minutos']) ? (int)$h['minutos'] : 0;
    if ($min <= 0) $min = $TL_PAR_MINUTES[$par] ?? 15;
    $holes[$num] = ['numero' => $num, 'par' => $par, 'minutes' => $min];
}
ksort($holes);

/**
 * Construye la línea de tiempo de un grupo.
 * @param string   $start Hora de salida "HH:MM"
 * @param int|null $hole  Hoyo de salida (1–18)
 * @param array    $holes Hoyos del campo indexados por número
 * @return array Mapa hoyo → "HH:MM" con la hora estimada de cada hoyo
 */
function tl_times($start, $hole, $holes) {
    if (!$holes || !preg_match('/^(\d{1,2}):(\d{2})/', (string)$start, $m)) return [];
    $mins = (int)$m[1] * 60 + (int)$m[2];
    $order = [];
    $first = ($hole >= 1 && $hole <= 18) ? $hole : 1;
    for ($i = 0; $i < 18; $i++) $order[] = (($first - 1 + $i) % 18) + 1;

    $out = [];
    foreach ($order as $n) {
        if (!isset($holes[$n])) continue;
        $mins += (int)$holes[$n]['minutes'];
        $out[(string)$n] = sprintf('%02d:%02d', intdiv($mins, 60) % 24, $mins % 60);
    }
    return $out;
}

// ============= Grupos de salida =============
$holeCol  = tl_hole_column($conn);
$holeExpr = $holeCol ? "sg.`$holeCol`" : 'NULL';

$where = ["cj.torneoid = $tid", "cj.fecha = '$fEsc'"];
if ($cEsc) $where[] = "cj.campo = $cEsc";
$where[] = "TIME(sg.horainicio1a) BETWEEN '$hriEsc' AND '$hrfEsc'";
$where[] = "TIME(sg.horainicio1a) <> '00:00:00'";
$whereSql = implode(' AND ', $where);

$groups = tl_all($conn, "SELECT sg.id,
                                LEFT(RIGHT(sg.horainicio1a, 8), 5) AS hora,
                                $holeExpr AS hoyo,
                                sg.teesal,
                                cat.categoria, cat.abreviatura,
                                cat.sistema, cat.gross, cat.grossstb
                           FROM salidagrupo sg
                           JOIN caljuego cj    ON (sg.caljuegoid = cj.id)
                           JOIN categorias cat ON (sg.categoriaid = cat.categoria_id)
                          WHERE $whereSql
                          ORDER BY sg.horainicio1a ASC, sg.id ASC");

/** Hoyo de salida del grupo: columna detectada o número extraído del tee. */
function tl_group_hole($g) {
    if (isset($g['hoyo']) && $g['hoyo'] !== null && $g['hoyo'] !== '' && (int)$g['hoyo'] > 0) {
        return (int)$g['hoyo'];
    }
    if (!empty($g['teesal']) && preg_match('/(\d{1,2})/', (string)$g['teesal'], $m)) {
        $n = (int)$m[1];
        if ($n >= 1 && $n <= 18) return $n;
    }
    return null;
}

$out = [];
foreach ($groups as $g) {
    // Filtro de hoyos aplicado en PHP (inclusive y estricto).
    $hole = tl_group_hole($g);
    if ($hole === null || $hole < $hi || $hole > $hf) continue;

    $gid = (int)$g['id'];

    /*
     * ORDEN DE JUGADORES — idéntico al grid de Salidas (salidas_det.php)
     * y al reporte de impresión de salidas: réplica del ORDER BY legacy
     * según el sistema de juego de la categoría.
     */
    $sistema  = strtoupper($g['sistema'] ?? '');
    $gross    = (int)($g['gross'] ?? 0);
    $grossstb = (int)($g['grossstb'] ?? 0);

    if ($sistema === 'STABLEFORD') {
        if ($gross == 1 || $grossstb == 1) {
            $orderSql = "ORDER BY salidagrupoid, acumstbgross DESC, orden ASC,
                          f_score_dia_satblU(jugadorid) DESC, tarjetaid DESC";
        } else {
            $orderSql = "ORDER BY salidagrupoid, acumsa DESC, orden ASC,
                          f_score_dia_saxU(jugadorid) DESC, tarjetaid DESC";
        }
        if ($grossstb == 1) {
            $orderSql = "ORDER BY salidagrupoid, acumso, orden DESC,
                          f_score_dia_soxU(jugadorid), tarjetaid DESC";
        }
    } else {
        $orderSql = "ORDER BY salidagrupoid, acumsa, orden DESC,
                      f_score_dia_saxU(jugadorid), tarjetaid DESC";
        if ($gross == 1 || $grossstb == 1) {
            $orderSql = "ORDER BY salidagrupoid, acumso, orden DESC,
                          f_score_dia_soxU(jugadorid), tarjetaid DESC";
        }
    }

    $players = tl_all($conn, "SELECT jugadorid, CONCAT(nombre, ' ', apellido) AS jugador, logo
                                FROM v_sal_jug
                               WHERE salidagrupoid = $gid
                               $orderSql");
    $list = [];
    foreach ($players as $p) {
        $list[] = [
            'id'       => (string)($p['jugadorid'] ?? ''),
            'name'     => trim($p['jugador']),
            'clubLogo' => !empty($p['logo']) ? $LOGOS_BASE_URL . $p['logo'] : '',
        ];
    }

    $out[] = [
        'id'           => (string)$gid,
        'hole'         => $hole,
        'time'         => $g['hora'] ?? '',
        'tee'          => $g['teesal'] ?? '',
        'categoryName' => $g['categoria'] ?? '',
        'shortName'    => $g['abreviatura'] ?? '',
        'times'        => tl_times($g['hora'] ?? '', $hole, $holes),
        'players'      => $list,
    ];
}

$payload = [
    'tournament'   => $head['nombre'] ?? '',
    'club'         => $head['club'] ?? '',
    'course'       => $courseRow['campo'] ?? '',
    'fecha'        => $fecha,
    'fechaFormato' => $fechaFmt['f'] ?? $fecha,
    'holes'        => array_values($holes),
    'groups'       => $out,
];

// Modo diagnóstico (?debug=1): no altera la forma del JSON de producción.
if (optional_param('debug') === '1') {
    $payload['_debug'] = [
        'minutesColumn' => $minCol,
        'holeColumn'    => $holeCol,
        'holesFound'    => count($holes),
        'groupsFound'   => count($groups),
    ];
}

json_response($payload);
