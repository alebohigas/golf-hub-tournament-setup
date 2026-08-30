<?php
/**
 * Tarjetas — Impresión de tarjetas de juego (Stroke Play / Stableford)
 * -----------------------------------------------------------------------------
 * Réplica del reporte legacy `tarjetas/tar_gross1.php`, expuesta como JSON para
 * que el frontend la renderice con el diseño del sitio del torneo.
 *
 * MODOS
 *   1) Catálogo (formulario de Admin):
 *      GET /api/tarjetas_impresion.php?torneoid=346&modo=catalogo
 *      → { days: [ { fecha, fechaFormato, campoid, campo,
 *                    categories: [ { id, name, shortName, system } ] } ] }
 *
 *   2) Reporte de tarjetas:
 *      GET /api/tarjetas_impresion.php?torneoid=346&fecha=2026-04-30&catid=6337
 *          [&campoid=27]
 *      → { tournament, club, course, logoHeader, fecha, fechaFormato,
 *          cards: [ { ...datos completos de la tarjeta } ] }
 *
 * `catid` acepta varias categorías separadas por coma (6337,6338).
 *
 * CONTENIDO DE CADA TARJETA (idéntico al legacy)
 *   - Encabezado: hoyo+hora de salida (H01 11:10), tee (color), número de
 *     jugador, nombre, ventaja total, abreviatura de categoría y club.
 *   - Renglones por hoyo 1..18 con V1 / V2 / TOTAL: PAR, YARDAS, PAR TIME
 *     (hora estimada de juego) y VENTAJA (ranking del hoyo).
 *   - Renglón HANDICAP con los golpes de ventaja del jugador por hoyo.
 *   - Pie: club del campo, folio (tarjetaid), firma del anotador y nombre.
 *
 * NOTA: la fecha "universal" del legacy NO se incluye por tarjeta; el frontend
 * la imprime una sola vez en el encabezado de 3 cm de cada tarjeta.
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
if (!preg_match('/^\d+$/', trim((string)$torneoid))) {
    json_error('Parámetro inválido: torneoid debe ser numérico.', 400);
}
$tid = esc($conn, $torneoid);

// Fechas/meses en español para los encabezados del reporte.
@$conn->query("SET lc_time_names = 'es_ES'");

/** Minutos estimados por par cuando el campo no guarda el tiempo por hoyo. */
$TJ_PAR_MINUTES = [3 => 15, 4 => 14, 5 => 19];

// ============= Helpers de consulta (tolerantes a fallos) =============

/** query_all tolerante: registra el error y devuelve [] en lugar de fallar. */
function tj_all($conn, $sql) {
    $r = @$conn->query($sql);
    if (!$r) { error_log('tarjetas_impresion: ' . $conn->error . ' | ' . $sql); return []; }
    $rows = [];
    while ($row = $r->fetch_assoc()) { $rows[] = $row; }
    $r->free();
    return $rows;
}

/** query_one tolerante. */
function tj_one($conn, $sql) {
    $rows = tj_all($conn, $sql);
    return $rows[0] ?? null;
}

/** Lista de columnas de una tabla (vacío si la tabla no existe). */
function tj_columns($conn, $table) {
    $cols = [];
    foreach (tj_all($conn, "SHOW COLUMNS FROM `$table`") as $c) $cols[] = $c['Field'];
    return $cols;
}

/** Primera columna de $table que coincida (case-insensitive) con $candidates. */
function tj_pick_column($conn, $table, $candidates) {
    $cols = tj_columns($conn, $table);
    foreach ($candidates as $cand) {
        foreach ($cols as $col) if (strcasecmp($col, $cand) === 0) return $col;
    }
    return null;
}

/** Columna del hoyo de salida en `salidagrupo` (varía entre instalaciones). */
function tj_hole_column($conn) {
    return tj_pick_column($conn, 'salidagrupo', [
        'hoyo1a', 'hoyoinicio1a', 'hoyoini1a', 'hoyoinicio', 'hoyoini', 'hoyoi', 'hoyo',
    ]);
}

/** Hoyo de salida de un grupo: columna detectada o número extraído del tee. */
function tj_group_hole($g) {
    if (isset($g['hoyo']) && $g['hoyo'] !== null && $g['hoyo'] !== '' && (int)$g['hoyo'] > 0) {
        return (int)$g['hoyo'];
    }
    if (!empty($g['teesal']) && preg_match('/(\d{1,2})/', (string)$g['teesal'], $m)) {
        $n = (int)$m[1];
        if ($n >= 1 && $n <= 18) return $n;
    }
    return null;
}

// ============= Modo 1: catálogo de días + campos + categorías =============
if (optional_param('modo') === 'catalogo') {
    $rows = tj_all($conn, "SELECT DISTINCT cj.fecha,
                                  cj.campo AS campoid,
                                  DATE_FORMAT(cj.fecha, '%W, %e de %M %Y') AS fecha_formato,
                                  ca.campo AS campo_nombre,
                                  cat.categoria_id, cat.categoria, cat.abreviatura, cat.sistema
                             FROM salidagrupo sg
                             JOIN caljuego cj    ON (sg.caljuegoid = cj.id)
                             JOIN categorias cat ON (sg.categoriaid = cat.categoria_id)
                        LEFT JOIN campos ca      ON (cj.campo = ca.id)
                            WHERE cj.torneoid = $tid AND cj.campo > 0
                            ORDER BY cj.fecha ASC, cj.campo ASC, cat.categoria ASC");

    /** Agrupa por (fecha, campo) acumulando sus categorías. */
    $days = [];
    foreach ($rows as $r) {
        $key = $r['fecha'] . '|' . $r['campoid'];
        if (!isset($days[$key])) {
            $days[$key] = [
                'fecha'        => $r['fecha'],
                'fechaFormato' => $r['fecha_formato'],
                'campoid'      => (string)$r['campoid'],
                'campo'        => $r['campo_nombre'] ?? '',
                'categories'   => [],
            ];
        }
        $days[$key]['categories'][] = [
            'id'        => (string)$r['categoria_id'],
            'name'      => $r['categoria'] ?? '',
            'shortName' => $r['abreviatura'] ?? '',
            'system'    => strtoupper($r['sistema'] ?? ''),
        ];
    }
    json_response(['days' => array_values($days)]);
}

// ============= Parámetros del reporte =============
$fecha   = trim((string)require_param('fecha'));
$catidRaw = trim((string)require_param('catid'));
$campoid = trim((string)optional_param('campoid', ''));

if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $fecha, $fm) ||
    !checkdate((int)$fm[2], (int)$fm[3], (int)$fm[1])) {
    json_error('Parámetro inválido: fecha debe tener formato YYYY-MM-DD.', 400);
}

/** Lista de categorías solicitadas (enteros positivos, sin duplicados). */
$catIds = [];
foreach (explode(',', $catidRaw) as $piece) {
    $piece = trim($piece);
    if ($piece === '') continue;
    if (!preg_match('/^\d+$/', $piece)) {
        json_error('Parámetro inválido: catid debe ser numérico (o lista separada por comas).', 400);
    }
    $catIds[(int)$piece] = (int)$piece;
}
if (!$catIds) json_error('Parámetro inválido: catid es obligatorio.', 400);
$catIds = array_values($catIds);
$catList = implode(',', $catIds);

$fEsc = esc($conn, $fecha);
$cEsc = ($campoid !== '' && preg_match('/^\d+$/', $campoid)) ? (int)$campoid : 0;

// ============= Encabezado del reporte =============
$head = tj_one($conn, "SELECT a.nombre, a.logo_header, b.nombre AS club
                         FROM torneo a JOIN clubs b ON (a.club_id = b.id)
                        WHERE a.torneo_id = $tid");
$fechaFmt = tj_one($conn, "SELECT DATE_FORMAT('$fEsc', '%W, %e de %M %Y') AS f");

// ============= Categorías solicitadas =============
$cats = [];
foreach (tj_all($conn, "SELECT categoria_id, categoria, abreviatura, sistema, salida, campoid
                          FROM categorias
                         WHERE categoria_id IN ($catList) AND torneo_id = $tid") as $c) {
    $cats[(int)$c['categoria_id']] = $c;
}
if (!$cats) json_error('No se encontraron las categorías solicitadas.', 404);

// Campo del reporte: el recibido o el de la primera categoría.
if (!$cEsc) {
    foreach ($cats as $c) { if ((int)$c['campoid'] > 0) { $cEsc = (int)$c['campoid']; break; } }
}
$courseRow = $cEsc ? tj_one($conn, "SELECT campo FROM campos WHERE id = $cEsc LIMIT 1") : null;

// ============= Hoyos del campo por tee de salida =============

/**
 * Convierte un valor de tiempo por hoyo a minutos.
 * Acepta minutos numéricos ("14", "14.0") y relojes ("00:14", "00:14:00").
 */
function tj_to_minutes($v) {
    if ($v === null) return 0;
    $s = trim((string)$v);
    if ($s === '') return 0;
    if (preg_match('/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/', $s, $m)) {
        return (int)$m[1] * 60 + (int)$m[2] + ((int)($m[3] ?? 0) >= 30 ? 1 : 0);
    }
    if (preg_match('/^\d+(?:\.\d+)?$/', $s)) return (int)round((float)$s);
    return 0;
}

/**
 * Minutos (y par) por hoyo tomados de la tabla `hoyos` — fuente editable por
 * el staff y por eso de máxima prioridad para el PAR TIME de la tarjeta.
 * @return array numero => ['par' => int, 'minutes' => int]
 */
function tj_hoyos_table($conn, $campoid) {
    $numCol   = tj_pick_column($conn, 'hoyos', ['numero', 'hoyo', 'num', 'nohoyo']);
    $campoCol = tj_pick_column($conn, 'hoyos', ['campoid', 'campo_id', 'campo']);
    $parCol   = tj_pick_column($conn, 'hoyos', ['par']);
    $minCol   = tj_pick_column($conn, 'hoyos', [
        'tiempo', 'minutos', 'tiempojuego', 'tiempo_juego', 'hora', 'horas',
        'partime', 'par_time', 'timepar', 'tpo', 'mins', 'minutosjuego',
    ]);
    if (!$numCol || !$minCol) return [];
    $sel = "`$numCol` AS numero, `$minCol` AS minutos" . ($parCol ? ", `$parCol` AS par" : ', NULL AS par');
    $where = ($campoCol && $campoid) ? "WHERE `$campoCol` = " . (int)$campoid : '';
    $out = [];
    foreach (tj_all($conn, "SELECT $sel FROM `hoyos` $where ORDER BY `$numCol` ASC") as $r) {
        $n = (int)$r['numero'];
        if ($n < 1 || $n > 18) continue;
        $out[$n] = ['par' => (int)($r['par'] ?? 0), 'minutes' => tj_to_minutes($r['minutos'])];
    }
    return $out;
}

/** Tiempos editables por el staff, cacheados una sola vez por request. */
$hoyosTable = tj_hoyos_table($conn, $cEsc);

/**
 * Hoyos (par / yardaje / ventaja / minutos) de un tee de salida del campo.
 * @return array numero => ['par','yardas','ventaja','minutes']
 */
function tj_holes($conn, $campoid, $salidaid, $hoyosTable, $parMinutes) {
    $holes = [];
    if (!$campoid) return $holes;
    $rows = tj_all($conn, "SELECT numero, par, yardaje, ventaja
                             FROM hoyosxsalida
                            WHERE campoid = " . (int)$campoid . "
                              AND salidaid = " . (int)$salidaid . "
                            ORDER BY numero ASC");
    foreach ($rows as $h) {
        $n = (int)$h['numero'];
        if ($n < 1 || $n > 18) continue;
        $par = (int)$h['par'];
        if ($par <= 0 && !empty($hoyosTable[$n]['par'])) $par = (int)$hoyosTable[$n]['par'];
        // Prioridad de minutos: `hoyos` (staff) → estimación por par.
        $min = (int)($hoyosTable[$n]['minutes'] ?? 0);
        if ($min <= 0) $min = $parMinutes[$par] ?? 15;
        $holes[$n] = [
            'par'     => $par,
            'yardas'  => (int)$h['yardaje'],
            'ventaja' => (int)$h['ventaja'],
            'minutes' => $min,
        ];
    }
    ksort($holes);
    return $holes;
}

/**
 * Hora estimada de juego por hoyo para un grupo.
 * El orden arranca en el hoyo de salida y da la vuelta (10,11,…,18,1,…,9).
 * @return array numero => "HH:MM"
 */
function tj_times($start, $hole, $holes) {
    if (!$holes || !preg_match('/^(\d{1,2}):(\d{2})/', (string)$start, $m)) return [];
    $mins = (int)$m[1] * 60 + (int)$m[2];
    $first = ($hole >= 1 && $hole <= 18) ? $hole : 1;
    $out = [];
    for ($i = 0; $i < 18; $i++) {
        $n = (($first - 1 + $i) % 18) + 1;
        if (!isset($holes[$n])) continue;
        $mins += (int)$holes[$n]['minutes'];
        $out[(string)$n] = sprintf('%02d:%02d', intdiv($mins, 60) % 24, $mins % 60);
    }
    return $out;
}

// ============= Grupos de salida de las categorías del día =============
$holeCol  = tj_hole_column($conn);
$holeExpr = $holeCol ? "sg.`$holeCol`" : 'NULL';

$where = ["cj.torneoid = $tid", "cj.fecha = '$fEsc'", "sg.categoriaid IN ($catList)"];
if ($cEsc) $where[] = "cj.campo = $cEsc";
$where[] = "TIME(sg.horainicio1a) <> '00:00:00'";

$groups = tj_all($conn, "SELECT sg.id, sg.categoriaid,
                                LEFT(RIGHT(sg.horainicio1a, 8), 5) AS hora,
                                $holeExpr AS hoyo,
                                sg.teesal
                           FROM salidagrupo sg
                           JOIN caljuego cj ON (sg.caljuegoid = cj.id)
                          WHERE " . implode(' AND ', $where) . "
                          ORDER BY sg.horainicio1a ASC, sg.id ASC");

/** Cache de hoyos por tee de salida (una consulta por salidaid). */
$holesBySalida = [];

/**
 * Cache del NOMBRE (color) del tee de salida por salidaid — el "AZULES" que
 * aparece bajo la hora en la tarjeta. Se lee de `campo_tee` por (campo, tee).
 */
$teeBySalida = [];
/** Devuelve el color del tee de salida para el campo del reporte. */
$teeName = function ($salidaid) use ($conn, $cEsc, &$teeBySalida) {
    if (!isset($teeBySalida[$salidaid])) {
        $row = $cEsc ? tj_one($conn, "SELECT tee FROM campo_tee
                                       WHERE campoid = " . (int)$cEsc . "
                                         AND salidaid = " . (int)$salidaid . " LIMIT 1") : null;
        $teeBySalida[$salidaid] = $row['tee'] ?? '';
    }
    return $teeBySalida[$salidaid];
};



/** Columnas realmente disponibles en la vista de salidas por jugador. */
$vsjCols  = tj_columns($conn, 'v_sal_jug');
$hasCol   = function ($name) use ($vsjCols) {
    foreach ($vsjCols as $c) if (strcasecmp($c, $name) === 0) return true;
    return false;
};

$cards = [];
foreach ($groups as $g) {
    $catId = (int)$g['categoriaid'];
    if (!isset($cats[$catId])) continue;
    $cat = $cats[$catId];

    $salidaid = (int)$cat['salida'];
    if (!isset($holesBySalida[$salidaid])) {
        $holesBySalida[$salidaid] = tj_holes($conn, $cEsc, $salidaid, $hoyosTable, $TJ_PAR_MINUTES);
    }
    $holes = $holesBySalida[$salidaid];

    $hole  = tj_group_hole($g);
    $times = tj_times($g['hora'] ?? '', $hole, $holes);
    $gid   = (int)$g['id'];

    // Jugadores del grupo, en el orden de la salida.
    $sel = ["jugadorid", "nombre", "apellido"];
    foreach (['numjugador', 'club', 'tee', 'ventajasjug', 'tarjetaid', 'indexjgo', 'orden'] as $opt) {
        if ($hasCol($opt)) $sel[] = $opt;
    }
    $players = tj_all($conn, "SELECT " . implode(', ', $sel) . "
                                FROM v_sal_jug
                               WHERE salidagrupoid = $gid
                               ORDER BY " . ($hasCol('orden') ? 'orden ASC, ' : '') . "apellido ASC, nombre ASC");

    foreach ($players as $p) {
        /** Golpes de ventaja por hoyo (CSV en la vista) — 18 valores. */
        $ventajas = [];
        $csv = isset($p['ventajasjug']) ? (string)$p['ventajasjug'] : '';
        $parts = $csv !== '' ? array_map('intval', explode(',', $csv)) : [];
        for ($i = 0; $i < 18; $i++) $ventajas[] = $parts[$i] ?? 0;

        /** Renglones de hoyo 1..18 con par / yardas / ventaja / par time. */
        $holeRows = [];
        for ($n = 1; $n <= 18; $n++) {
            $h = $holes[$n] ?? null;
            $holeRows[] = [
                'numero'   => $n,
                'par'      => $h ? $h['par'] : null,
                'yardas'   => $h ? $h['yardas'] : null,
                'ventaja'  => $h ? $h['ventaja'] : null,
                'parTime'  => $times[(string)$n] ?? '',
                'handicap' => $ventajas[$n - 1],
            ];
        }

        /** Totales de ida (V1), vuelta (V2) y totales generales. */
        $sum = function ($from, $to, $key) use ($holeRows) {
            $t = 0;
            for ($i = $from; $i <= $to; $i++) $t += (int)($holeRows[$i - 1][$key] ?? 0);
            return $t;
        };

        $cards[] = [
            'groupId'      => (string)$gid,
            'hole'         => $hole,
            'time'         => $g['hora'] ?? '',
            'teeSal'       => $g['teesal'] ?? '',
            'tee'          => $p['tee'] ?? '',
            'playerId'     => (string)($p['jugadorid'] ?? ''),
            'playerNumber' => (string)($p['numjugador'] ?? ($p['jugadorid'] ?? '')),
            'name'         => trim(($p['nombre'] ?? '') . ' ' . ($p['apellido'] ?? '')),
            'club'         => $p['club'] ?? '',
            'folio'        => (string)($p['tarjetaid'] ?? ''),
            'categoryId'   => (string)$catId,
            'categoryName' => $cat['categoria'] ?? '',
            'shortName'    => $cat['abreviatura'] ?? '',
            'system'       => strtoupper($cat['sistema'] ?? ''),
            /** Ventaja total del jugador = suma de golpes por hoyo. */
            'hcp'          => array_sum($ventajas),
            'holes'        => $holeRows,
            'totals'       => [
                'parOut'      => $sum(1, 9, 'par'),
                'parIn'       => $sum(10, 18, 'par'),
                'par'         => $sum(1, 18, 'par'),
                'yardasOut'   => $sum(1, 9, 'yardas'),
                'yardasIn'    => $sum(10, 18, 'yardas'),
                'yardas'      => $sum(1, 18, 'yardas'),
                'handicapOut' => $sum(1, 9, 'handicap'),
                'handicapIn'  => $sum(10, 18, 'handicap'),
                'handicap'    => $sum(1, 18, 'handicap'),
            ],
        ];
    }
}

$payload = [
    'tournament'   => $head['nombre'] ?? '',
    'club'         => $head['club'] ?? '',
    'course'       => $courseRow['campo'] ?? '',
    /** Logo del encabezado del torneo (`torneo.logo_header`). */
    'logoHeader'   => !empty($head['logo_header']) ? $LOGOS_BASE_URL . $head['logo_header'] : '',
    'fecha'        => $fecha,
    'fechaFormato' => $fechaFmt['f'] ?? $fecha,
    'cards'        => $cards,
];

// Modo diagnóstico (?debug=1): no altera la forma del JSON de producción.
if (optional_param('debug') === '1') {
    $payload['_debug'] = [
        'holeColumn'  => $holeCol,
        'groupsFound' => count($groups),
        'cardsBuilt'  => count($cards),
        'campoid'     => $cEsc,
        'salidas'     => array_keys($holesBySalida),
        'holesPerSalida' => array_map('count', $holesBySalida),
    ];
}

json_response($payload);
