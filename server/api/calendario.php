<?php
/**
 * Calendario (Calendar) Endpoint
 * GET /api/calendario.php?torneoid=XXX
 * Returns tournament days and category schedules
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

// Get tournament days
$sql = "SELECT DISTINCT c.fecha, c.campo, ca.campo as campo_nombre,
               DATE_FORMAT(c.fecha, '%W') as dia_semana
        FROM caljuego c
        LEFT JOIN campos ca ON (c.campo = ca.id)
        WHERE c.torneoid = $tid AND c.campo > 0
        ORDER BY c.fecha ASC";

$dayRows = query_all($conn, $sql);

// Get category schedules per day
$sql = "SELECT c.id, c.fecha, c.campo, c.categoriaid,
               cat.categoria, cat.abreviatura, cat.sistema,
               ca.campo as campo_nombre, s.tee,
               c.estatus, c.cierre
        FROM caljuego c
        JOIN categorias cat ON (c.categoriaid = cat.categoria_id)
        LEFT JOIN campos ca ON (c.campo = ca.id)
        LEFT JOIN salidas s ON (cat.salida = s.id)
        WHERE c.torneoid = $tid AND c.campo > 0
        ORDER BY c.fecha ASC, cat.categoria_id ASC";

$scheduleRows = query_all($conn, $sql);

// Group schedules by date
$schedules = [];
foreach ($scheduleRows as $row) {
    $fecha = $row['fecha'];
    if (!isset($schedules[$fecha])) {
        $schedules[$fecha] = [];
    }
    $schedules[$fecha][] = [
        'id'           => $row['id'],
        'categoryId'   => $row['categoriaid'],
        'categoryName' => $row['categoria'],
        'shortName'    => $row['abreviatura'],
        'system'       => $row['sistema'],
        'course'       => $row['campo_nombre'],
        'tee'          => $row['tee'],
        'status'       => (int)$row['estatus'],
        'closed'       => (int)$row['cierre']
    ];
}

// Build days array
$days = [];
foreach ($dayRows as $row) {
    $fecha = $row['fecha'];
    $days[] = [
        'date'      => $fecha,
        'dayOfWeek' => $row['dia_semana'],
        'course'    => $row['campo_nombre'],
        'schedules' => $schedules[$fecha] ?? []
    ];
}

json_response(['days' => $days]);
