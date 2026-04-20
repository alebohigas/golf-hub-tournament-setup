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
     * Detect which optional columns exist on the patrocinadores table.
     *
     * Schema is being migrated:
     *  - NEW: 'logo'        => holds the relative file path (e.g. "logos_patrocinadores/foo.png")
     *  - OLD: 'logo_nombre' => previously held the path; now becoming a human-readable label
     *  - 'contacto'         => optional, may not exist on every deployment
     *
     * We probe each column with SHOW COLUMNS so the endpoint stays resilient
     * regardless of which migration step a given environment is on.
     */
    $hasLogo       = $conn->query("SHOW COLUMNS FROM patrocinadores LIKE 'logo'");
    $hasLogoNombre = $conn->query("SHOW COLUMNS FROM patrocinadores LIKE 'logo_nombre'");
    $hasContacto   = $conn->query("SHOW COLUMNS FROM patrocinadores LIKE 'contacto'");

    $hasLogo       = $hasLogo && $hasLogo->num_rows > 0;
    $hasLogoNombre = $hasLogoNombre && $hasLogoNombre->num_rows > 0;
    $hasContacto   = $hasContacto && $hasContacto->num_rows > 0;

    // Build SELECT list dynamically based on existing columns
    $selectCols = ['id', 'nombre'];
    if ($hasContacto)   { $selectCols[] = 'contacto'; }
    if ($hasLogo)       { $selectCols[] = 'logo'; }
    if ($hasLogoNombre) { $selectCols[] = 'logo_nombre'; }

    $selectStr = implode(', ', $selectCols);
    $sql = "SELECT $selectStr
            FROM patrocinadores
            WHERE torneoid = $tid
            ORDER BY nombre ASC";

    $rows = query_all($conn, $sql);

    /**
     * Map DB rows to frontend-friendly shape.
     * Path resolution priority: 'logo' (new) → 'logo_nombre' (legacy fallback).
     */
    $sponsors = array_map(function($row) use ($SPONSOR_LOGO_URL, $hasLogo, $hasLogoNombre, $hasContacto) {
        $logoPath = null;
        if ($hasLogo && !empty($row['logo'])) {
            $logoPath = $row['logo'];
        } elseif ($hasLogoNombre && !empty($row['logo_nombre'])) {
            $logoPath = $row['logo_nombre'];
        }

        return [
            'id'         => (int)$row['id'],
            'name'       => $row['nombre'],
            'logoUrl'    => $logoPath ? $SPONSOR_LOGO_URL . $logoPath : null,
            'websiteUrl' => null,
            'contact'    => $hasContacto ? ($row['contacto'] ?? null) : null,
            /** Human-readable identifier shown under each logo on the public page */
            'logoName'   => $hasLogoNombre ? ($row['logo_nombre'] ?? null) : null,
        ];
    }, $rows);

    json_response($sponsors);
} else {
    /** Table doesn't exist - return empty array */
    json_response([]);
}