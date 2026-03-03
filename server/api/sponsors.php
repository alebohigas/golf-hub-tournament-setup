<?php
/**
 * Sponsors Endpoint
 * GET /api/sponsors.php?torneoid=XXX
 * Returns sponsor list for the tournament
 * NOTE: Returns empty array if patrocinadores table doesn't exist
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

/** Check if patrocinadores table exists before querying */
$tableCheck = $conn->query("SHOW TABLES LIKE 'patrocinadores'");
if ($tableCheck && $tableCheck->num_rows > 0) {
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
} else {
    /** Table doesn't exist - return empty array */
    json_response([]);
}