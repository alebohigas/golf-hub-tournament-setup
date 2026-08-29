<?php
/**
 * Salidas — Impresión por Día
 * -----------------------------------------------------------------------------
 * Réplica del reporte legacy `salidas/impresion_salidas.php`, expuesto como
 * JSON para que el frontend lo renderice con el diseño del sitio del torneo.
 *
 * MODOS
 *   1) Catálogo de días/campos (para el formulario de Admin):
 *      GET /api/salidas_impresion.php?torneoid=346&modo=dias
 *      → { days: [ { fecha, fechaFormato, campoid, campo } ] }
 *
 *   2) Reporte de salidas:
 *      GET /api/salidas_impresion.php?torneoid=346&fecha=2026-04-30&campoid=27
 *          &hi=1&hf=1&hri=6:00&hrf=11:00
 *      → { tournament, club, course, fecha, fechaFormato, groups: [...] }
 *
 * FILTROS
 *   hi/hf   → rango de hoyo de salida (inclusive)
 *   hri/hrf → rango de hora de salida (HH:MM, inclusive)
 *
 * NOTA DE ESQUEMA (legacy): el nombre de la columna del hoyo de salida en
 * `salidagrupo` varía entre instalaciones, por eso se detecta en runtime con
 * `SHOW COLUMNS` (ver sgi_hole_column). Si no existe ninguna candidata el
 * filtro de hoyos simplemente se ignora y el hoyo se muestra vacío.
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

// Fechas/meses en español para los encabezados del reporte.
@$conn->query("SET lc_time_names = 'es_ES'");

/** query_all tolerante: registra el error y devuelve [] en lugar de fallar. */
function sgi_all($conn, $sql) {
    $r = @$conn->query($sql);
    if (!$r) { error_log('salidas_impresion: ' . $conn->error . ' | ' . $sql); return []; }
    $rows = [];
    while ($row = $r->fetch_assoc()) { $rows[] = $row; }
    $r->free();
    return $rows;
}

/** query_one tolerante. */
function sgi_one($conn, $sql) {
    $rows = sgi_all($conn, $sql);
    return $rows[0] ?? null;
}

/** Lista de columnas de una tabla (vacío si la tabla no existe). */
function sgi_columns($conn, $table) {
    $cols = [];
    foreach (sgi_all($conn, "SHOW COLUMNS FROM `$table`") as $c) {
        $cols[] = $c['Field'];
    }
    return $cols;
}

/**
 * Detecta la columna del hoyo de salida en `salidagrupo`.
 * @return string|null Nombre de columna o null si no hay candidata.
 */
function sgi_hole_column($conn) {
    $cols = sgi_columns($conn, 'salidagrupo');
    $candidates = ['hoyo1a', 'hoyoinicio1a', 'hoyoini1a', 'hoyoinicio', 'hoyoini', 'hoyoi', 'hoyo'];
    foreach ($candidates as $cand) {
        foreach ($cols as $col) {
            if (strcasecmp($col, $cand) === 0) return $col;
        }
    }
    return null;
}

// ============= Modo 1: catálogo de días + campos =============
if (optional_param('modo') === 'dias') {
    $rows = sgi_all($conn, "SELECT DISTINCT c.fecha, c.campo AS campoid,
                                   DATE_FORMAT(c.fecha, '%W, %e de %M %Y') AS fecha_formato,
                                   ca.campo AS campo_nombre
                              FROM caljuego c
                              LEFT JOIN campos ca ON (c.campo = ca.id)
                             WHERE c.torneoid = $tid AND c.campo > 0
                             ORDER BY c.fecha ASC, c.campo ASC");
    $days = [];
    foreach ($rows as $r) {
        $days[] = [
            'fecha'        => $r['fecha'],
            'fechaFormato' => $r['fecha_formato'],
            'campoid'      => (string)$r['campoid'],
            'campo'        => $r['campo_nombre'] ?? '',
        ];
    }
    json_response(['days' => $days]);
}

// ============= Modo 2: reporte de salidas =============
$fecha   = require_param('fecha');
$campoid = optional_param('campoid', '');
$hi      = (int)optional_param('hi', 1);
$hf      = (int)optional_param('hf', 18);
$hri     = optional_param('hri', '00:00');
$hrf     = optional_param('hrf', '23:59');

$fEsc = esc($conn, $fecha);
$cEsc = $campoid !== '' ? (int)$campoid : 0;
// Normaliza HH:MM → HH:MM:SS para comparar contra TIME/DATETIME.
$hriEsc = esc($conn, substr(trim($hri), 0, 5) . ':00');
$hrfEsc = esc($conn, substr(trim($hrf), 0, 5) . ':59');

// Encabezado: torneo + club + campo
$head = sgi_one($conn, "SELECT a.nombre, b.nombre AS club
                          FROM torneo a JOIN clubs b ON (a.club_id = b.id)
                         WHERE a.torneo_id = $tid");
$courseRow = $cEsc ? sgi_one($conn, "SELECT campo FROM campos WHERE id = $cEsc LIMIT 1") : null;
$fechaFmt = sgi_one($conn, "SELECT DATE_FORMAT('$fEsc', '%W, %e de %M %Y') AS f");

$holeCol = sgi_hole_column($conn);
$holeExpr = $holeCol ? "sg.`$holeCol`" : 'NULL';

$where = ["cj.torneoid = $tid", "cj.fecha = '$fEsc'"];
if ($cEsc) $where[] = "cj.campo = $cEsc";
$where[] = "TIME(sg.horainicio1a) BETWEEN '$hriEsc' AND '$hrfEsc'";
$where[] = "TIME(sg.horainicio1a) <> '00:00:00'";
$whereSql = implode(' AND ', $where);

$groups = sgi_all($conn, "SELECT sg.id,
                                 LEFT(RIGHT(sg.horainicio1a, 8), 5) AS hora,
                                 $holeExpr AS hoyo,
                                 sg.teesal,
                                 cat.categoria, cat.abreviatura
                            FROM salidagrupo sg
                            JOIN caljuego cj  ON (sg.caljuegoid = cj.id)
                            JOIN categorias cat ON (sg.categoriaid = cat.categoria_id)
                           WHERE $whereSql
                           ORDER BY sg.horainicio1a ASC, sg.id ASC");

/**
 * Resuelve el hoyo de salida de un grupo.
 * Usa la columna detectada en `salidagrupo` y, si no existe o viene vacía,
 * extrae el número del texto del tee (p. ej. "H10" → 10, "1" → 1).
 * @return int|null
 */
function sgi_group_hole($g) {
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
    // Filtro de hoyos aplicado en PHP: el hoyo puede venir de la columna o del tee.
    $hole = sgi_group_hole($g);
    if ($hole === null || $hole < $hi || $hole > $hf) continue;

    $gid = (int)$g['id'];
    // Jugadores del grupo, en el orden de salida (columna `orden` del view).
    $players = sgi_all($conn, "SELECT CONCAT(nombre, ' ', apellido) AS jugador, logo
                                 FROM v_sal_jug
                                WHERE salidagrupoid = $gid
                                ORDER BY orden ASC, tarjetaid ASC");
    $list = [];
    foreach ($players as $p) {
        $list[] = [
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
        'players'      => $list,
    ];
}


json_response([
    'tournament'   => $head['nombre'] ?? '',
    'club'         => $head['club'] ?? '',
    'course'       => $courseRow['campo'] ?? '',
    'fecha'        => $fecha,
    'fechaFormato' => $fechaFmt['f'] ?? $fecha,
    'groups'       => $out,
]);
