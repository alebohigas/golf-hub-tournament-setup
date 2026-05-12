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
 * Pull every club name from the `clubs` table. We intentionally include
 * id so the frontend can use it as a stable React key, but the value
 * stored in the form is the club name (matches `jugadores.club`).
 */
$rows = [];
$res = $conn->query("SELECT id, nombre FROM clubs ORDER BY nombre ASC");
if ($res) {
    while ($r = $res->fetch_assoc()) {
        $name = trim((string)($r['nombre'] ?? ''));
        if ($name === '') continue;
        $rows[] = ['id' => (int)$r['id'], 'nombre' => $name];
    }
    $res->free();
}

json_response(['clubs' => $rows]);