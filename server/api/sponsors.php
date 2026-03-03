<?php
/**
 * Sponsors Endpoint
 * GET /api/sponsors.php?torneoid=XXX
 * Returns sponsor list for the tournament
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

$sql = "SELECT id, nombre, logo, url, tipo, orden
        FROM patrocinadores
        WHERE torneoid = $tid AND estatus = 1
        ORDER BY orden ASC";

$rows = query_all($conn, $sql);

$sponsors = array_map(function($row) {
    global $LOGOS_BASE_URL;
    return [
        'id'   => $row['id'],
        'name' => $row['nombre'],
        'logo' => $row['logo'] ? $LOGOS_BASE_URL . $row['logo'] : null,
        'url'  => $row['url'],
        'type' => $row['tipo'],
        'order'=> (int)$row['orden']
    ];
}, $rows);

json_response($sponsors);
