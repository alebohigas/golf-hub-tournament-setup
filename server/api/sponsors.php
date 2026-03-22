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

/** Sponsor logo proxy base URL */
$SPONSOR_LOGO_URL = '/api/sponsor_logo.php?file=';

/** Check if patrocinadores table exists before querying */
$tableCheck = $conn->query("SHOW TABLES LIKE 'patrocinadores'");
if ($tableCheck && $tableCheck->num_rows > 0) {
    /**
     * Query sponsors for this tournament
     * The 'imagen' column contains the relative path from the parent directory
     * e.g. "logos_patrocinadores/imagen.png"
     */
    $sql = "SELECT id, nombre, contacto, imagen
            FROM patrocinadores
            WHERE torneoid = $tid
            ORDER BY nombre ASC";

    $rows = query_all($conn, $sql);

    /** Map DB rows to frontend-friendly shape */
    $sponsors = array_map(function($row) use ($SPONSOR_LOGO_URL) {
        return [
            'id'         => (int)$row['id'],
            'name'       => $row['nombre'],
            'logoUrl'    => $row['imagen'] ? $SPONSOR_LOGO_URL . $row['imagen'] : null,
            'websiteUrl' => null,
            'contact'    => $row['contacto'],
        ];
    }, $rows);

    json_response($sponsors);
} else {
    /** Table doesn't exist - return empty array */
    json_response([]);
}