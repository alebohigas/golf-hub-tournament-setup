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

// ============= Action: clubs registered for a tournament =============
// GET /api/clubs.php?action=torneo&torneoid=NNN
// Returns ONLY the clubs listed in `clubs_registro` for the given
// tournament (joined with `clubs`). Used by Pre-Registro to restrict
// the "Club" autocomplete when the applicant marks reg_es_socio=SI:
// a socio can only belong to a club that the tournament has registered.
if ($action === 'torneo') {
    $torneoid = (int) optional_param('torneoid', 0);
    if ($torneoid <= 0) json_response(['clubs' => []]);
    $rows = [];
    // Include per-club preferente window dates (may be NULL if not set).
    // The columns fecha_inicio / fecha_fin were added by the
    // 2026_07_16_registro_preferente migration; select them defensively
    // so this endpoint still works if the columns don't exist yet.
    $hasDates = false;
    $chk = @$conn->query("SHOW COLUMNS FROM clubs_registro LIKE 'fecha_inicio'");
    if ($chk && $chk->num_rows > 0) $hasDates = true;
    if ($chk) $chk->free();
    $dateCols = $hasDates ? ", cr.fecha_inicio, cr.fecha_fin" : "";
    $sql = "SELECT DISTINCT c.id, c.nombre$dateCols
            FROM clubs_registro cr
            INNER JOIN clubs c ON c.id = cr.clubid
            WHERE cr.torneoid = " . $torneoid . "
            ORDER BY c.nombre ASC";
    $res = $conn->query($sql);
    if ($res) {
        while ($r = $res->fetch_assoc()) {
            $name = trim((string)($r['nombre'] ?? ''));
            if ($name === '') continue;
            $rows[] = [
                'id'           => (int)$r['id'],
                'nombre'       => $name,
                'fecha_inicio' => $r['fecha_inicio'] ?? null,
                'fecha_fin'    => $r['fecha_fin']    ?? null,
            ];
        }
        $res->free();
    }
    json_response(['clubs' => $rows]);
}

// ============= Action: lookup an existing player's club =============
if ($action === 'lookup') {
    $nombre   = trim((string) optional_param('nombre',   ''));
    $apellido = trim((string) optional_param('apellido', ''));
    $fechanac = trim((string) optional_param('fechanac', ''));
    $spei     = trim((string) optional_param('spei',     ''));
    $ghin     = trim((string) optional_param('ghin',     ''));

    /**
     * If a SPEI or GHIN is provided, prefer that exact match — it's more
     * authoritative than name+birthdate. Returns extended fields so the
     * Pre-Registro form can prefill nombre, apellido, correo, etc.
     */
    if ($spei !== '' || $ghin !== '') {
        $w = [];
        if ($spei !== '' && jug_has($conn, 'reg_spei'))    $w[] = "reg_spei = '"    . esc($conn, $spei) . "'";
        if ($ghin !== '' && jug_has($conn, 'numghinspei')) $w[] = "numghinspei = '" . esc($conn, $ghin) . "'";
        if ($w) {
            // Build a column list of only the ones present on this DB.
            $want = ['nombre','apellido','correo','telefono','celular','sexo','genero',
                     'club','fechanac','reg_spei','numghinspei','handicap'];
            $sel  = [];
            foreach ($want as $c) if (jug_has($conn, $c)) $sel[] = "j.$c";
            if (!$sel) json_response(['found' => false]);
            $sql = "SELECT " . implode(',', $sel) . " FROM jugadores j WHERE " .
                   implode(' OR ', $w) .
                   (jug_has($conn, 'torneoid')
                       ? " ORDER BY j.torneoid DESC, j.id DESC"
                       : " ORDER BY j.id DESC") .
                   " LIMIT 1";
            $res = $conn->query($sql);
            if ($res && $row = $res->fetch_assoc()) {
                $row['found'] = true;
                json_response($row);
            }
            json_response(['found' => false]);
        }
    }

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

    /**
     * Un mismo jugador puede tener varios registros en `jugadores`
     * (uno por torneo en el que ha participado). Queremos el más
     * reciente para reflejar su club actual, así que ordenamos primero
     * por `torneoid` descendente (torneo más nuevo) y después por `id`
     * descendente (última inserción dentro de ese torneo). Ambas
     * columnas se agregan sólo si existen en el esquema.
     */
    $orderParts = [];
    if (jug_has($conn, 'torneoid')) $orderParts[] = 'j.torneoid DESC';
    $orderParts[] = 'j.id DESC';
    $sql = "SELECT j.club, j.sexo, j.fechanac
            FROM jugadores j
            WHERE " . implode(' AND ', $where) . "
            ORDER BY " . implode(', ', $orderParts) . "
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