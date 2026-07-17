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
    $correo   = trim((string) optional_param('correo',   ''));
    $spei     = trim((string) optional_param('spei',     ''));
    $ghin     = trim((string) optional_param('ghin',     ''));

    /**
     * SPEI / GHIN direct lookup (used por el formulario cuando el usuario
     * captura uno de esos identificadores). Devuelve la fila más reciente
     * con match EXACTO en `reg_spei` o `numghinspei` para prellenar todos
     * los campos. No aplica la validación estricta por correo porque el
     * SPEI/GHIN ya es un identificador único del jugador.
     */
    if ($spei !== '' || $ghin !== '') {
        $w = [];
        if ($spei !== '' && jug_has($conn, 'reg_spei'))    $w[] = "reg_spei = '"    . esc($conn, $spei) . "'";
        if ($ghin !== '' && jug_has($conn, 'numghinspei')) $w[] = "numghinspei = '" . esc($conn, $ghin) . "'";
        if ($w) {
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

    /**
     * Validación por nombre + apellido + correo (estricta).
     * REQUERIMOS los tres campos y hacemos un AND normalizado
     * (case/acentos/espacios múltiples se ignoran, pero los tres deben
     * coincidir). El correo es lo que evita que homónimos ("Juan Perez")
     * se validen entre sí — sin correo no hay match.
     */
    if ($nombre === '' || $apellido === '' || $correo === '') {
        json_response(['found' => false]);
    }

    $nombreNormExpr    = lookup_norm_expr('j.nombre');
    $apellidoNormExpr  = lookup_norm_expr('j.apellido');
    $nombreInputExpr   = lookup_norm_literal($conn, $nombre);
    $apellidoInputExpr = lookup_norm_literal($conn, $apellido);
    $hasCorreoCol      = jug_has($conn, 'correo');
    $correoNormExpr    = $hasCorreoCol ? lookup_norm_email_expr('j.correo') : "''";
    $correoInputExpr   = lookup_norm_email_literal($conn, $correo);

    /** Condiciones AND estrictas para el WHERE. */
    $whereAnd = [
        "$nombreNormExpr   = $nombreInputExpr",
        "$apellidoNormExpr = $apellidoInputExpr",
    ];
    if ($hasCorreoCol) {
        $whereAnd[] = "$correoNormExpr = $correoInputExpr";
    }

    /**
     * Modo diagnóstico:
     * GET /api/clubs.php?action=lookup&debug=1&nombre=X&apellido=Y&correo=Z
     * Devuelve dos sets: `candidates_strict` (match nombre+apellido+correo)
     * y `candidates_name_only` (sólo nombre+apellido) para poder ver si el
     * correo era lo que estaba impidiendo el match.
     */
    if ((int) optional_param('debug', 0) === 1) {
        $extra = $hasCorreoCol ? ", j.correo, HEX(j.correo) AS correo_hex" : "";
        $sqlStrict = "SELECT j.id, "
             . (jug_has($conn,'torneoid') ? "j.torneoid, " : "")
             . "j.nombre, j.apellido, j.club$extra, "
             . "HEX(j.nombre) AS nombre_hex, HEX(j.apellido) AS apellido_hex "
             . "FROM jugadores j "
             . "WHERE " . implode(' AND ', $whereAnd) . " "
             . "ORDER BY "
             . (jug_has($conn,'torneoid') ? "j.torneoid DESC, j.id DESC " : "j.id DESC ")
             . "LIMIT 50";
        $sqlNameOnly = "SELECT j.id, "
             . (jug_has($conn,'torneoid') ? "j.torneoid, " : "")
             . "j.nombre, j.apellido, j.club$extra "
             . "FROM jugadores j "
             . "WHERE $nombreNormExpr = $nombreInputExpr AND $apellidoNormExpr = $apellidoInputExpr "
             . "ORDER BY "
             . (jug_has($conn,'torneoid') ? "j.torneoid DESC, j.id DESC " : "j.id DESC ")
             . "LIMIT 50";
        $rowsStrict = [];
        if ($r = $conn->query($sqlStrict)) { while ($x = $r->fetch_assoc()) $rowsStrict[] = $x; $r->free(); }
        $rowsNameOnly = [];
        if ($r = $conn->query($sqlNameOnly)) { while ($x = $r->fetch_assoc()) $rowsNameOnly[] = $x; $r->free(); }
        $collationInfo = [];
        if ($c = $conn->query("SHOW FULL COLUMNS FROM jugadores WHERE Field IN ('nombre','apellido','club','correo')")) {
            while ($x = $c->fetch_assoc()) $collationInfo[] = $x; $c->free();
        }
        json_response([
            'debug'                 => true,
            'input'                 => ['nombre' => $nombre, 'apellido' => $apellido, 'correo' => $correo, 'fechanac' => $fechanac, 'spei' => $spei, 'ghin' => $ghin],
            'sql_strict'            => $sqlStrict,
            'sql_name_only'         => $sqlNameOnly,
            'candidates_strict'     => $rowsStrict,
            'candidates_name_only'  => $rowsNameOnly,
            'columns'               => $collationInfo,
            'connection_collation'  => $conn->character_set_name(),
        ]);
    }

    /**
     * Preferencias de orden (no filtros): si el formulario mandó SPEI,
     * GHIN o fechanac, subimos al top las filas que coincidan para
     * romper empates entre jugadores homónimos que compartan correo
     * (caso raro, típicamente cuentas familiares). Después, el registro
     * más reciente (torneoid, id desc) gana.
     */
    $orderParts = [];
    if ($spei !== '' && jug_has($conn, 'reg_spei')) {
        $orderParts[] = "(j.reg_spei = '" . esc($conn, $spei) . "') DESC";
    }
    if ($ghin !== '' && jug_has($conn, 'numghinspei')) {
        $orderParts[] = "(j.numghinspei = '" . esc($conn, $ghin) . "') DESC";
    }
    if ($fechanac !== '' && jug_has($conn, 'fechanac')) {
        $orderParts[] = "(DATE(fechanac) = '" . esc($conn, $fechanac) . "') DESC";
    }
    if (jug_has($conn, 'torneoid')) $orderParts[] = 'j.torneoid DESC';
    $orderParts[] = 'j.id DESC';

    $sql = "SELECT j.club, j.sexo, j.fechanac
            FROM jugadores j
            WHERE " . implode(' AND ', $whereAnd) . "
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