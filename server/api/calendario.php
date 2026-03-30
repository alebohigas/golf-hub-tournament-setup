<?php
/**
 * Calendario (Calendar) Endpoint
 * GET /api/calendario.php?torneoid=XXX
 * Returns tournament calendar dates from caljuego table
 * Uses fecha, horainicio_1, and categoria fields
 * Skips rows where categoria is blank
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

// Get calendar entries with non-blank categoria, joined with categorias for full name
$sql = "SELECT c.id, c.fecha, c.horainicio_1, c.categoria, c.campo,
               ca.campo as campo_nombre,
               cat.categoria as categoria_nombre, cat.abreviatura,
               DATE_FORMAT(c.fecha, '%W') as dia_semana,
               DATE_FORMAT(c.fecha, '%e') as dia_num,
               DATE_FORMAT(c.fecha, '%M') as mes_nombre
        FROM caljuego c
        LEFT JOIN campos ca ON (c.campo = ca.id)
        LEFT JOIN categorias cat ON (c.categoriaid = cat.categoria_id)
        WHERE c.torneoid = $tid 
          AND c.categoria IS NOT NULL 
          AND c.categoria != ''
          AND c.campo > 0
        ORDER BY c.fecha ASC, c.horainicio_1 ASC, c.categoria ASC";

$rows = query_all($conn, $sql);

// Build unique dates list
$datesMap = [];
$entries = [];

foreach ($rows as $row) {
    $fecha = $row['fecha'];
    
    // Track unique dates for column headers
    if (!isset($datesMap[$fecha])) {
        $datesMap[$fecha] = [
            'date'      => $fecha,
            'dayOfWeek' => $row['dia_semana'],
            'dayNum'    => $row['dia_num'],
            'month'     => $row['mes_nombre'],
            'course'    => $row['campo_nombre']
        ];
    }

    $entries[] = [
        'id'           => (int)$row['id'],
        'date'         => $fecha,
        'category'     => $row['categoria'],
        'categoryName' => $row['categoria_nombre'] ?: $row['categoria'],
        'shortName'    => $row['abreviatura'] ?: $row['categoria'],
        'startTime'    => $row['horainicio_1'],
        'course'       => $row['campo_nombre']
    ];
}

json_response([
    'dates'   => array_values($datesMap),
    'entries' => $entries
]);
