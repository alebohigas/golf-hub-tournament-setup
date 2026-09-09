<?php
/**
 * Resultados Finales — catálogo de categorías CONCLUIDAS
 * -----------------------------------------------------------------------------
 * Alimenta el reporte imprimible "RESULTADOS FINALES"
 * (Admin → ALIEN SYSTEM → Resultados Finales y /admin/resultados-finales).
 *
 * Una categoría se considera CONCLUIDA cuando todas sus rondas programadas en
 * `caljuego` (para el torneo activo) tienen `estatus = 3` (ronda terminada) y
 * existe al menos una ronda programada. Si la columna `estatus` no existe en la
 * instalación, se degrada mostrando todas las categorías (compatibilidad).
 *
 * USO
 *   GET /api/resultados_finales.php?torneoid=346
 *   → { tournament, club, logoHeader, categories: [ {
 *         categoryId, name, shortName, system, previousSystem, format,
 *         gross, rounds, roundsDone, concluded } ] }
 *
 * Los resultados de cada categoría NO se calculan aquí: el frontend los lee de
 * `resultados_jug.php` (fuente única del leaderboard, incluye parejas, gross y
 * la fase previa de categorías que pasaron a Match Play).
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

/** query_all tolerante: registra el error y devuelve [] en lugar de fallar. */
function rf_all($conn, $sql) {
    $r = @$conn->query($sql);
    if (!$r) { error_log('resultados_finales: ' . $conn->error . ' | ' . $sql); return []; }
    $rows = [];
    while ($row = $r->fetch_assoc()) { $rows[] = $row; }
    $r->free();
    return $rows;
}

/** query_one tolerante. */
function rf_one($conn, $sql) {
    $rows = rf_all($conn, $sql);
    return $rows[0] ?? null;
}

/** ¿Existe la columna en la tabla de la base activa? */
function rf_has_column($conn, $table, $col) {
    $t = esc($conn, $table);
    $c = esc($conn, $col);
    $row = rf_one($conn, "SELECT 1 AS ok FROM INFORMATION_SCHEMA.COLUMNS
                           WHERE TABLE_SCHEMA = DATABASE()
                             AND TABLE_NAME = '$t' AND COLUMN_NAME = '$c' LIMIT 1");
    return !empty($row['ok']);
}

// ============= Encabezado del reporte (torneo + club + logo) =============
$head = rf_one($conn, "SELECT a.nombre, a.logo_header, b.nombre AS club
                         FROM torneo a JOIN clubs b ON (a.club_id = b.id)
                        WHERE a.torneo_id = $tid");

// ============= Categorías con su avance de rondas =============
$hasEstatus = rf_has_column($conn, 'caljuego', 'estatus');
$hasPrev    = rf_has_column($conn, 'categorias', 'sistemaprev');

$doneExpr = $hasEstatus
    ? "SUM(CASE WHEN cj.estatus = 3 THEN 1 ELSE 0 END)"
    : "COUNT(cj.id)";
$prevSel = $hasPrev ? "a.sistemaprev" : "NULL AS sistemaprev";

$rows = rf_all($conn, "SELECT a.categoria_id, a.categoria, a.abreviatura,
                              a.sistema, a.formato, a.gross, $prevSel,
                              COUNT(cj.id) AS rondas,
                              $doneExpr AS rondas_ok
                         FROM categorias a
                         LEFT JOIN caljuego cj
                                ON (cj.categoriaid = a.categoria_id AND cj.torneoid = $tid)
                        WHERE a.estatus = 1 AND a.torneo_id = $tid
                        GROUP BY a.categoria_id, a.categoria, a.abreviatura,
                                 a.sistema, a.formato, a.gross"
                        . ($hasPrev ? ', a.sistemaprev' : '') . "
                        ORDER BY a.categoria_id ASC");

$cats = [];
foreach ($rows as $r) {
    $rondas = (int)$r['rondas'];
    $ok     = (int)$r['rondas_ok'];
    $cats[] = [
        'categoryId'     => (string)$r['categoria_id'],
        'name'           => $r['categoria'] ?? '',
        'shortName'      => $r['abreviatura'] ?? '',
        'system'         => $r['sistema'] ?? '',
        'previousSystem' => $r['sistemaprev'] ?? '',
        'format'         => $r['formato'] ?? '',
        'gross'          => (int)$r['gross'],
        'rounds'         => $rondas,
        'roundsDone'     => $ok,
        // Concluida = todas las rondas programadas terminadas.
        'concluded'      => $rondas > 0 && $ok >= $rondas,
    ];
}

json_response([
    'tournament' => $head['nombre'] ?? '',
    'club'       => $head['club'] ?? '',
    'logoHeader' => !empty($head['logo_header']) ? $LOGOS_BASE_URL . $head['logo_header'] : '',
    'categories' => $cats,
]);
