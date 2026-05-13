<?php
/**
 * Clubs Endpoint
 * -----------------------------------------------------------------------
 * GET /api/clubs.php
 *      Returns the full list of clubs from the `clubs` table for use
 *      in the Pre-Registro club autocomplete.
 *
 * GET /api/clubs.php?action=lookup&nombre=X&apellido=Y&fechanac=YYYY-MM-DD
 *      Looks up an existing player in `jugadores` matching name (and
 *      optionally birthdate) and returns the club they had registered
 *      with last time. Used by Pre-Registro to pre-fill the club field
 *      when the same person re-registers.
 *
 * Always returns JSON. Resilient to missing optional columns.
 */
require_once 'config.php';

/** Cache: which columns exist in the `jugadores` table. */
function jugadores_columns($conn) {
    static $cols = null;
    if ($cols !== null) return $cols;
    $cols = [];
    $r = $conn->query("SHOW COLUMNS FROM jugadores");
    if ($r) {
        while ($row = $r->fetch_assoc()) $cols[$row['Field']] = true;
        $r->free();
    }
    return $cols;
}
function jug_has($conn, $col) {
    $cols = jugadores_columns($conn);
    return isset($cols[$col]);
}

$action = optional_param('action');

// ============= Action: lookup an existing player's club =============
if ($action === 'lookup') {
    $nombre   = trim((string) optional_param('nombre',   ''));
    $apellido = trim((string) optional_param('apellido', ''));
    $fechanac = trim((string) optional_param('fechanac', ''));

    if ($nombre === '' || $apellido === '') {
        json_response(['found' => false]);
    }

    $where = [
        "LOWER(nombre)   = LOWER('"   . esc($conn, $nombre)   . "')",
        "LOWER(apellido) = LOWER('" . esc($conn, $apellido) . "')",
    ];
    if ($fechanac !== '' && jug_has($conn, 'fechanac')) {
        $where[] = "DATE(fechanac) = '" . esc($conn, $fechanac) . "'";
    }

    $sql = "SELECT j.club, j.sexo, j.fechanac
            FROM jugadores j
            WHERE " . implode(' AND ', $where) . "
            ORDER BY j.id DESC
            LIMIT 1";
    $res = $conn->query($sql);
    if (!$res) json_response(['found' => false]);
    if ($row = $res->fetch_assoc()) {
        json_response([
            'found'    => true,
            'club'     => $row['club']     ?? '',
            'sexo'     => $row['sexo']     ?? '',
            'fechanac' => $row['fechanac'] ?? '',
        ]);
    }
    json_response(['found' => false]);
}

// ============= Default: list of clubs =============
/**
 * Pull every club name (and any available location columns) from the
 * `clubs` table. We include location fields so the Pre-Registro form
 * can auto-fill país/estado/ciudad when the user picks a known club.
 * Schema-tolerant: missing columns are silently omitted.
 */
function clubs_columns($conn) {
    static $cols = null;
    if ($cols !== null) return $cols;
    $cols = [];
    $r = $conn->query("SHOW COLUMNS FROM clubs");
    if ($r) {
        while ($row = $r->fetch_assoc()) $cols[$row['Field']] = true;
        $r->free();
    }
    return $cols;
}
function club_has($conn, $col) {
    $cols = clubs_columns($conn);
    return isset($cols[$col]);
}

$selectCols = ['id', 'nombre'];
foreach ([
    'ciudad', 'estado', 'pais',
    'country', 'state', 'city',
    'id_pais', 'id_estado', 'id_ciudad',
    'id_country', 'id_state', 'id_city',
    'pais_id', 'estado_id', 'ciudad_id',
    'country_id', 'state_id', 'city_id',
] as $optional) {
    if (club_has($conn, $optional)) $selectCols[] = $optional;
}

$rows = [];
$res = $conn->query("SELECT " . implode(',', $selectCols) . " FROM clubs ORDER BY nombre ASC");
if ($res) {
    while ($r = $res->fetch_assoc()) {
        $name = trim((string)($r['nombre'] ?? ''));
        if ($name === '') continue;
        $rows[] = [
            'id'     => (int)$r['id'],
            'nombre' => $name,
            'ciudad' => trim((string)($r['ciudad'] ?? $r['city']  ?? '')),
            'estado' => trim((string)($r['estado'] ?? $r['state'] ?? '')),
            'pais'   => trim((string)($r['pais']   ?? $r['country'] ?? '')),
            // Optional IDs (any naming variant). 0 means "not present".
            'id_pais'   => (int)($r['id_pais']   ?? $r['id_country'] ?? $r['pais_id']   ?? $r['country_id'] ?? 0),
            'id_estado' => (int)($r['id_estado'] ?? $r['id_state']   ?? $r['estado_id'] ?? $r['state_id']   ?? 0),
            'id_ciudad' => (int)($r['id_ciudad'] ?? $r['id_city']    ?? $r['ciudad_id'] ?? $r['city_id']    ?? 0),
        ];
    }
    $res->free();
}

json_response(['clubs' => $rows]);