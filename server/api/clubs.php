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

/**
 * Normalize a SQL text expression for player-name comparisons.
 * Purpose: make the lookup tolerant to case, accents, NBSP, and repeated spaces
 * without changing the stored `jugadores` data.
 */
function lookup_norm_expr($expr) {
    $x = "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($expr, CHAR(160), ' '), CHAR(9), ' '), '-', ' '), '+', ' '), '.', ' '), ',', ' '), '/', ' ')";
    $x = "UPPER(TRIM($x))";
    foreach ([
        'Á' => 'A', 'À' => 'A', 'Â' => 'A', 'Ä' => 'A', 'Ã' => 'A',
        'É' => 'E', 'È' => 'E', 'Ê' => 'E', 'Ë' => 'E',
        'Í' => 'I', 'Ì' => 'I', 'Î' => 'I', 'Ï' => 'I',
        'Ó' => 'O', 'Ò' => 'O', 'Ô' => 'O', 'Ö' => 'O', 'Õ' => 'O',
        'Ú' => 'U', 'Ù' => 'U', 'Û' => 'U', 'Ü' => 'U',
        'Ñ' => 'N',
    ] as $from => $to) {
        $x = "REPLACE($x, '$from', '$to')";
    }
    // Collapse the most common double-space cases caused by copied names.
    $x = "REPLACE(REPLACE(REPLACE($x, '  ', ' '), '  ', ' '), '  ', ' ')";
    return $x;
}

/** Build a normalized SQL literal from user input for safe LIKE comparisons. */
function lookup_norm_literal($conn, $value) {
    return lookup_norm_expr("'" . esc($conn, $value) . "'");
}

/**
 * Normalize an email for strict comparison: lowercase + trim only.
 * (Emails are ASCII and case-insensitive on the local + domain in practice.)
 */
function lookup_norm_email_expr($expr) {
    return "LOWER(TRIM($expr))";
}
function lookup_norm_email_literal($conn, $value) {
    return lookup_norm_email_expr("'" . esc($conn, $value) . "'");
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

    /**
     * Modo diagnóstico:
     * GET /api/clubs.php?action=lookup&debug=1&nombre=X&apellido=Y
     * Devuelve TODOS los candidatos que hagan match parcial por
     * nombre O apellido (usando LIKE con comodines) para poder ver
     * las diferencias reales de acentos, espacios extra, apellidos
     * compuestos vs sólo paterno, casing, etc. También devuelve
     * HEX() y LENGTH() para detectar caracteres invisibles.
     */
    if ((int) optional_param('debug', 0) === 1) {
        $nombreNormExpr = lookup_norm_expr('j.nombre');
        $apellidoNormExpr = lookup_norm_expr('j.apellido');
        $nombreInputExpr = lookup_norm_literal($conn, $nombre);
        $apellidoInputExpr = lookup_norm_literal($conn, $apellido);
        $apellidoTokens = lookup_tokens($apellido);
        $requiredApellido = $apellidoTokens[0] ?? $apellido;
        $apellidoTokenSql = [];
        foreach ($apellidoTokens as $t) {
            $apellidoTokenSql[] = lookup_contains_token($conn, $apellidoNormExpr, $t);
        }
        $apellidoTokenOrder = $apellidoTokenSql ? '(' . implode(' + ', $apellidoTokenSql) . ')' : '0';
        $candidateWhere = "(($nombreNormExpr LIKE CONCAT('%', $nombreInputExpr, '%') OR $nombreInputExpr LIKE CONCAT('%', $nombreNormExpr, '%')) "
                        . "AND " . lookup_contains_token($conn, $apellidoNormExpr, $requiredApellido) . ")";
        $sql = "SELECT j.id, "
             . (jug_has($conn,'torneoid') ? "j.torneoid, " : "")
             . "j.nombre, j.apellido, j.club, "
             . "HEX(j.nombre) AS nombre_hex, HEX(j.apellido) AS apellido_hex, "
             . "CHAR_LENGTH(j.nombre) AS nombre_len, CHAR_LENGTH(j.apellido) AS apellido_len, "
             . "$nombreNormExpr = $nombreInputExpr AS match_nombre_exact, "
             . "$apellidoNormExpr = $apellidoInputExpr AS match_apellido_exact, "
             . "$apellidoTokenOrder AS apellido_token_score "
             . "FROM jugadores j "
             . "WHERE " . $candidateWhere . " "
             . "ORDER BY match_nombre_exact DESC, match_apellido_exact DESC, apellido_token_score DESC, "
             . (jug_has($conn,'torneoid') ? "j.torneoid DESC, j.id DESC " : "j.id DESC ")
             . "LIMIT 50";
        $rows = [];
        $res = $conn->query($sql);
        if ($res) { while ($r = $res->fetch_assoc()) $rows[] = $r; $res->free(); }
        // Info de la conexión y de las columnas relevantes
        $collationInfo = [];
        $c = $conn->query("SHOW FULL COLUMNS FROM jugadores WHERE Field IN ('nombre','apellido','club')");
        if ($c) { while ($r = $c->fetch_assoc()) $collationInfo[] = $r; $c->free(); }
        json_response([
            'debug'       => true,
            'input'       => ['nombre' => $nombre, 'apellido' => $apellido, 'fechanac' => $fechanac],
            'sql'         => $sql,
            'candidates'  => $rows,
            'columns'     => $collationInfo,
            'connection_collation' => $conn->character_set_name(),
        ]);
    }

    $nombreNormExpr = lookup_norm_expr('j.nombre');
    $apellidoNormExpr = lookup_norm_expr('j.apellido');
    $nombreInputExpr = lookup_norm_literal($conn, $nombre);
    $apellidoInputExpr = lookup_norm_literal($conn, $apellido);
    $apellidoTokens = lookup_tokens($apellido);
    $requiredApellido = $apellidoTokens[0] ?? $apellido;
    $apellidoTokenSql = [];
    foreach ($apellidoTokens as $t) {
        $apellidoTokenSql[] = lookup_contains_token($conn, $apellidoNormExpr, $t);
    }
    $apellidoTokenScore = $apellidoTokenSql ? '(' . implode(' + ', $apellidoTokenSql) . ')' : '0';
    $where = [
        "($nombreNormExpr = $nombreInputExpr OR $nombreNormExpr LIKE CONCAT($nombreInputExpr, '%') OR $nombreInputExpr LIKE CONCAT($nombreNormExpr, '%'))",
        lookup_contains_token($conn, $apellidoNormExpr, $requiredApellido),
    ];
    /**
     * IMPORTANTE: NO filtramos por `fechanac` aunque el formulario la
     * mande. Muchos registros históricos en `jugadores` tienen
     * `fechanac` vacía / NULL / '0000-00-00', y un filtro estricto
     * hacía que el lookup devolviera "no encontrado" y el flujo de
     * pre-registro forzara reg_es_socio = "NO" incorrectamente. En su
     * lugar, usamos `fechanac` sólo como PREFERENCIA de orden: si hay
     * un registro cuyo `fechanac` coincide, ese gana; si no, cae al
     * más reciente por torneo/id.
     */

    /**
     * Un mismo jugador puede tener varios registros en `jugadores`
     * (uno por torneo en el que ha participado). Queremos el más
     * reciente para reflejar su club actual, así que ordenamos primero
     * por `torneoid` descendente (torneo más nuevo) y después por `id`
     * descendente (última inserción dentro de ese torneo). Ambas
     * columnas se agregan sólo si existen en el esquema.
     */
    $orderParts = [];
    if ($fechanac !== '' && jug_has($conn, 'fechanac')) {
        // Los que coinciden por fecha primero (1), los demás después (0)
        $orderParts[] = "(DATE(fechanac) = '" . esc($conn, $fechanac) . "') DESC";
    }
    if (jug_has($conn, 'torneoid')) $orderParts[] = 'j.torneoid DESC';
    $orderParts[] = 'j.id DESC';
    $sql = "SELECT j.club, j.sexo, j.fechanac,
                   ($nombreNormExpr = $nombreInputExpr) AS match_nombre_exact,
                   ($apellidoNormExpr = $apellidoInputExpr) AS match_apellido_exact,
                   $apellidoTokenScore AS apellido_token_score
            FROM jugadores j
            WHERE " . implode(' AND ', $where) . "
            ORDER BY match_nombre_exact DESC, match_apellido_exact DESC, apellido_token_score DESC, " . implode(', ', $orderParts) . "
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