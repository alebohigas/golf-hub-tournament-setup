<?php
/**
 * Competencias Master Endpoint
 * GET /api/competencias.php?torneoid=XXX
 * Returns available competition types based on existing data in DB tables
 *
 * Checks: premiosjug (O'Yes), approachjug (Approach), puttjug (Putt), Skeen_tarjetas (Skin Game)
 * Each type includes its groups (prizes) and player counts
 * 
 * Fixed: SQL join error on v_puttunico view - 2026-04-20
 * Note: separator change for cut applied previously - 2026-04-20
 *
 * Optional: ?tipo=oyes|approach|putt|skin - filter to a specific type
 * Optional: ?detalle=1 - include full player data for each group
 */
require_once 'config.php';

// Enable error reporting for debugging 500s
error_reporting(E_ALL);
ini_set('display_errors', '0'); // Don't display, capture instead
ini_set('log_errors', '1');

/**
 * Fatal error / exception safety net.
 * Guarantees the endpoint ALWAYS returns JSON, even on fatal errors
 * (parse errors, undefined functions, out of memory, uncaught exceptions).
 * In ?debug=1 mode, includes the error details in the `_debug` field.
 */
set_exception_handler(function ($e) {
    global $DEBUG_MODE;
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    $payload = ['error' => 'Unhandled exception in competencias.php'];
    if (!empty($DEBUG_MODE)) {
        $payload['_debug'] = [
            'type'    => get_class($e),
            'message' => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
            'trace'   => array_slice(explode("\n", $e->getTraceAsString()), 0, 15),
        ];
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
});

register_shutdown_function(function () {
    global $DEBUG_MODE;
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true)) {
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
        }
        $payload = ['error' => 'Fatal error in competencias.php'];
        if (!empty($DEBUG_MODE)) {
            $payload['_debug'] = [
                'type'    => $err['type'],
                'message' => $err['message'],
                'file'    => $err['file'],
                'line'    => $err['line'],
            ];
        }
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    }
});

/** Safe query execution - returns false on failure instead of crashing */
function safe_exec($conn, $sql, $label = '') {
    $result = $conn->query($sql);
    if (!$result) {
        // Log but don't crash - UPDATE failures shouldn't kill the response
        error_log("competencias.php - $label failed: " . $conn->error . " | SQL: $sql");
        return false;
    }
    return $result;
}

/** Safe query_one - returns null on failure instead of dying */
function safe_query_one($conn, $sql) {
  //  debug_log_query('safe_query_one', $sql);
    $result = $conn->query($sql);
    if (!$result) {
        error_log("competencias.php - query failed: " . $conn->error . " | SQL: $sql");
        return null;
    }
    $row = $result->fetch_assoc();
    $result->free();
    return $row;
}

/** Safe query_all - returns empty array on failure instead of dying */
function safe_query_all($conn, $sql) {
    // debug_log_query('safe_query_all', $sql);
    $result = $conn->query($sql);
    if (!$result) {
        error_log("competencias.php - query failed: " . $conn->error . " | SQL: $sql");
        return [];
    }
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    $result->free();
    return $rows;
}

$torneoid = require_param('torneoid');
$tipo     = optional_param('tipo', '');
$detalle  = optional_param('detalle', '0');

$tid = esc($conn, $torneoid);
// // echo "/* Debug: Received request for torneoid=$tid, tipo='$tipo', detalle='$detalle' */\n";
error_log("competencias.php - Request received: torneoid=$tid, tipo='$tipo', detalle='$detalle'");

// Wrap the entire main flow in try/catch so any thrown error becomes JSON
try {
// ============= Get tournament config =============
$sql = "SELECT oyesnumprem FROM torneo WHERE torneo_id = $tid";
// // echo $sql;
$torneoInfo = safe_query_one($conn, $sql);
if (!$torneoInfo) {
    json_error("Tournament $torneoid not found", 404);
}
$numPrem = (int)($torneoInfo['oyesnumprem'] ?? 3);

$competencias = [];

/**
 * Debug accumulator (only emitted when ?debug=1).
 * Tracks per-section: row counts, executed SQL snippets, and query errors.
 * Helps diagnose why a competition type may be missing from the response
 * (e.g. SQL error from a missing column/function, or empty result set).
 */
$DEBUG_SECTIONS = [
    'oyes'     => ['enabled' => false, 'reason' => '', 'queries' => [], 'errors' => [], 'group_count' => 0],
    'approach' => ['enabled' => false, 'reason' => '', 'queries' => [], 'errors' => [], 'group_count' => 0],
    'putt'     => ['enabled' => false, 'reason' => '', 'queries' => [], 'errors' => [], 'group_count' => 0],
    'driverp'  => ['enabled' => false, 'reason' => '', 'queries' => [], 'errors' => [], 'group_count' => 0],
    'driverd'  => ['enabled' => false, 'reason' => '', 'queries' => [], 'errors' => [], 'group_count' => 0],
];

/**
 * Run a query and record diagnostics into $DEBUG_SECTIONS for the given section.
 * Returns rows array (empty on failure). Behaves like safe_query_all but with tracing.
 */
function dbg_query_all($conn, $sql, $section, $label) {
    global $DEBUG_SECTIONS;
    $result = $conn->query($sql);
    if (!$result) {
        $err = $conn->error;
        error_log("competencias.php - $section.$label failed: $err | SQL: $sql");
        $DEBUG_SECTIONS[$section]['errors'][] = ['label' => $label, 'error' => $err, 'sql' => $sql];
        return [];
    }
    $rows = [];
    while ($row = $result->fetch_assoc()) { $rows[] = $row; }
    $result->free();
    $DEBUG_SECTIONS[$section]['queries'][] = ['label' => $label, 'rows' => count($rows), 'sql' => $sql];
    return $rows;
}

/**
 * Run a query expecting a single row, with diagnostics. Returns null on failure or empty.
 */
function dbg_query_one($conn, $sql, $section, $label) {
    global $DEBUG_SECTIONS;
    $result = $conn->query($sql);
    if (!$result) {
        $err = $conn->error;
        error_log("competencias.php - $section.$label failed: $err | SQL: $sql");
        $DEBUG_SECTIONS[$section]['errors'][] = ['label' => $label, 'error' => $err, 'sql' => $sql];
        return null;
    }
    $row = $result->fetch_assoc();
    $result->free();
    $DEBUG_SECTIONS[$section]['queries'][] = ['label' => $label, 'rows' => $row ? 1 : 0, 'sql' => $sql];
    return $row;
}

// ============= O'Yes (Approach / Closest to Pin in a course hole. Not to be confused with approach, which is a single set approach separate from the course par 3's) =============
if ($tipo === '' || $tipo === 'oyes') {
    $DEBUG_SECTIONS['oyes']['enabled'] = true;
    $sql = "SELECT COUNT(DISTINCT premio) as cnt FROM premiosjug WHERE torneoid = $tid";
    $row = dbg_query_one($conn, $sql, 'oyes', 'count_distinct_premio');
    $DEBUG_SECTIONS['oyes']['count'] = (int)($row['cnt'] ?? 0);

    if ($row && (int)$row['cnt'] > 0) {
        // Mirror the legacy report query EXACTLY (do not filter by premiosjug
        // intersection — legacy code lists every active premio and then
        // joins to premiosjug + jugadores when fetching winners):
        //   SELECT premio, descripcion
        //   FROM premios
        //   WHERE torneoid = $tid AND premio > 0
        //   GROUP BY premio, descripcion
        // Pull O'Yes prize descriptions from `premios`. In this legacy schema
        // O'Yes winner slots are global (`torneo.oyesnumprem`); per-prize slots
        // are stored as `hoyo` in side-game tables like `putt`/`approach`, not
        // as a `lugares` column on `premios`.
        $sql = "SELECT premio as id,
                       TRIM(descripcion) as name,
                       NULL as lugares
                FROM premios
                WHERE torneoid = $tid
                  AND premio > 0
                GROUP BY premio, descripcion
                ORDER BY premio ASC";
        $prizes = dbg_query_all($conn, $sql, 'oyes', 'list_prizes_legacy');

        // Fallback: if the `premios` table is empty for this torneo,
        // build prize list from premiosjug so O'Yes is never silently dropped.
        if (empty($prizes)) {
            $sql = "SELECT DISTINCT pj.premio as id,
                           TRIM(pj.descripcion) as name,
                           NULL as lugares
                    FROM premiosjug pj
                    WHERE pj.torneoid = $tid
                    ORDER BY pj.premio ASC";
            $prizes = dbg_query_all($conn, $sql, 'oyes', 'list_prizes_fallback_premiosjug');
        }
        // Final fallback in PHP for any null/empty descriptions
        foreach ($prizes as &$pr) {
            if (empty($pr['name'])) {
                $pr['name'] = 'Premio ' . $pr['id'];
            }
        }
        unset($pr);
        $groups = [];
    } else {
        $DEBUG_SECTIONS['oyes']['reason'] = 'no rows in premiosjug for this torneoid';
        $prizes = [];
        $groups = [];
    }

    if (!empty($prizes)) {

        foreach ($prizes as $p) {
            $premioId = esc($conn, $p['id']);

            // Per-prize cut: use `lugares` from the premios row.
            // Falls back to torneo.oyesnumprem when lugares is null/0
            // (e.g. when the prize came from the premiosjug fallback list).
            $lugares = (int)($p['lugares'] ?? 0);
            if ($lugares <= 0) { $lugares = $numPrem; }

            // Count players using the SAME join logic as get_oyes_players()
            // (premios joined on fecha/campo/hoyo/categoriaid). The previous
            // count relied on `orden = 1`, but the orden flag is only set
            // inside get_oyes_players() — when the card list is fetched
            // without ?detalle=1 those UPDATEs never run, so the count
            // would always return 0. Capped by this prize's `lugares`.
            $sql = "SELECT COUNT(*) as cnt
                    FROM premiosjug a
                    JOIN jugadores j ON (a.jugadorid = j.id)
                    JOIN premios c ON (a.fecha = c.fecha AND a.campo = c.campo
                                       AND a.hoyo = c.hoyo AND j.categoriaid = c.categoriaid)
                    WHERE a.torneoid = $tid AND c.premio = $premioId";
            $countRow = safe_query_one($conn, $sql);
            $playerCount = min((int)($countRow['cnt'] ?? 0), $lugares);

            $group = [
                'id'          => 'oyes-' . $p['id'],
                'name'        => $p['name'],
                'shortName'   => $p['name'],
               # 'hoyo'        => (int)$p['hoyo'],
                'maxPlayers'  => $lugares,
                'playerCount' => $playerCount,
            ];


            // Include full player data if requested
            if ($detalle === '1') {
                // Use the per-prize lugares so the player list matches the card.
                $group['players'] = get_oyes_players($conn, $tid, $premioId, $lugares);
                $group['lastUpdated'] = get_oyes_last_updated($conn, $tid, $premioId);
                
            }

            $groups[] = $group;
        }
        
        $competencias[] = [
            'id'          => 'oyes',
            'name'        => "O'Yes",
            'shortName'   => "O'Yes",
            'description' => 'Approach - Más cerca de la bandera',
            'icon'        => 'target',
            'endpoint'    => 'oyes',
            'order'       => 1,
            'enabled'     => true,
            'groupCount'  => count($groups),
            'groups'      => $groups,
            'columns'     => [
                ['key' => 'position', 'label' => 'Po', 'align' => 'center', 'width' => '50px', 'format' => 'medal'],
                ['key' => 'clubLogo', 'label' => 'Club', 'align' => 'center', 'width' => '50px'],
                ['key' => 'name', 'label' => 'Jugador', 'align' => 'left'],
                ['key' => 'hole', 'label' => 'Ho', 'align' => 'center', 'width' => '60px'],
                ['key' => 'distance', 'label' => 'Dist', 'align' => 'center', 'width' => '80px', 'format' => 'distance'],
            ],
        ];
    }
}


// ============= Approach, done in a single set approach separate from the course par 3's) =============
if ($tipo === '' || $tipo === 'approach') {
    $DEBUG_SECTIONS['approach']['enabled'] = true;
    $sql = "SELECT COUNT(DISTINCT premio) as cnt FROM approach WHERE torneoid = $tid AND premio > 0";
    $row = dbg_query_one($conn, $sql, 'approach', 'count_distinct_premio');
    $DEBUG_SECTIONS['approach']['count'] = (int)($row['cnt'] ?? 0);

    if ($row && (int)$row['cnt'] > 0) {
        // Get groups (premio, descripcion, hoyo). The f_ultfechaapproach() function
        // is OPTIONAL — if it doesn't exist on this DB the whole SELECT would fail,
        // so we fall back to a no-function variant on error.
        $sql = "SELECT premio as id, descripcion as name, hoyo,
                       LEFT(f_ultfechaapproach(descripcion, torneoid), 16) AS ultact
                FROM approach
                WHERE torneoid = $tid AND premio > 0
                GROUP BY premio, descripcion, hoyo
                ORDER BY premio ASC";
        $prizes = dbg_query_all($conn, $sql, 'approach', 'list_prizes_with_fn');
        if (empty($prizes) && !empty($DEBUG_SECTIONS['approach']['errors'])) {
            // Function may be missing — retry without it
            $sql = "SELECT premio as id, descripcion as name, hoyo, NULL AS ultact
                    FROM approach
                    WHERE torneoid = $tid AND premio > 0
                    GROUP BY premio, descripcion, hoyo
                    ORDER BY premio ASC";
            $prizes = dbg_query_all($conn, $sql, 'approach', 'list_prizes_no_fn');
        }

        $groups = [];
        foreach ($prizes as $p) {
            $premioId = esc($conn, $p['id']);
            $descripcion = esc($conn, $p['name']);
            $hoyo = (int)$p['hoyo'];

            $group = [
                'id'          => 'approach-' . $p['id'],
                'name'        => $p['name'],
                'shortName'   => $p['name'],
               # 'hoyo'        => $hoyo,
                'maxPlayers'  => $hoyo, // hoyo = number of slots
                'playerCount' => 0,
            ];

            if ($detalle === '1') {
                $group['players'] = get_approach_players($conn, $tid, $descripcion, $hoyo);
                $group['lastUpdated'] = $p['ultact'] ?? null;
            }

            // Count actual players returned
            if ($detalle === '1') {
                $group['playerCount'] = count($group['players']);
            } else {
                // Quick count without full data
                $sql2 = "SELECT COUNT(*) as cnt FROM approachjug WHERE torneoid = $tid AND premiosjugcol = '$descripcion'";
                $cntRow = safe_query_one($conn, $sql2);
                $group['playerCount'] = min((int)($cntRow['cnt'] ?? 0), $hoyo);
            }

            $groups[] = $group;
        }
        $DEBUG_SECTIONS['approach']['group_count'] = count($groups);

        if (count($groups) > 0) {
            $competencias[] = [
            'id'          => 'approach',
            'name'        => 'Approach',
            'shortName'   => 'Approach',
            'description' => 'Approach - Más cerca de la bandera',
            'icon'        => 'crosshair',
            'endpoint'    => 'approach',
            'order'       => 3,
            'enabled'     => true,
            'groupCount'  => count($groups),
            'groups'      => $groups,
            'columns'     => [
                ['key' => 'position', 'label' => 'Pos', 'align' => 'center', 'width' => '50px', 'format' => 'medal'],
                ['key' => 'clubLogo', 'label' => 'Club', 'align' => 'center', 'width' => '50px'],
                ['key' => 'name', 'label' => 'Jugador', 'align' => 'left'],
                ['key' => 'distance', 'label' => 'Dist', 'align' => 'center', 'width' => '80px', 'format' => 'distance'],
            ],
            ];
        } else {
            $DEBUG_SECTIONS['approach']['reason'] = 'no groups built (prizes query empty or all filtered)';
        }
    } else {
        $DEBUG_SECTIONS['approach']['reason'] = 'no rows in approach with premio > 0';
    }
}
error_log("competencias.php - Completed Approach section, competencias count: " . count($competencias));



// ============= Putt =============
if ($tipo === '' || $tipo === 'putt') {
    $DEBUG_SECTIONS['putt']['enabled'] = true;
    $sql = "SELECT COUNT(DISTINCT premio) as cnt FROM puttjug WHERE torneoid = $tid";
    $row = dbg_query_one($conn, $sql, 'putt', 'count_distinct_premio');
    $DEBUG_SECTIONS['putt']['count'] = (int)($row['cnt'] ?? 0);

    if ($row && (int)$row['cnt'] > 0) {
        // Pre-update marks (safe - won't crash on failure)
        safe_exec($conn, "UPDATE puttjug SET orden = 0 WHERE torneoid = $tid", 'putt reset orden');
        // Mark the best Putt per player WITHIN each configured prize group.
        // The legacy v_puttunico view groups only by tournament/player, which
        // can make Damas/Caballeros use the wrong best shot when the same
        // player has entries in multiple premio/descripcion groups.
        safe_exec($conn, "UPDATE puttjug a
                      JOIN (
                          SELECT torneoid, premio, premiosjugcol, jugadorid, MIN(distancia) as mindistancia
                          FROM puttjug
                          WHERE torneoid = $tid
                          GROUP BY torneoid, premio, premiosjugcol, jugadorid
                      ) b ON (a.torneoid = b.torneoid
                              AND a.premio = b.premio
                              AND a.premiosjugcol <=> b.premiosjugcol
                              AND a.jugadorid = b.jugadorid
                              AND a.distancia = b.mindistancia)
                      SET a.orden = 1
                      WHERE a.torneoid = $tid", 'putt set orden by prize group');

        // Pull each configured Putt prize from `putt`:
        //   - putt.descripcion -> displayed name and matching player group
        //   - putt.hoyo        -> per-prize winner slots ("lugares")
        // This keeps Damas/Caballeros and any other prize using its own cut.
        $sql = "SELECT p.premio as id,
                       TRIM(p.descripcion) as name,
                       MIN(NULLIF(p.hoyo, 0)) as lugares,
                       LEFT(f_ultfechaputt(p.descripcion, p.torneoid), 16) AS ultact
                FROM putt p
                WHERE p.torneoid = $tid AND p.premio > 0
                GROUP BY p.premio, p.descripcion
                ORDER BY p.premio ASC";
        $prizes = dbg_query_all($conn, $sql, 'putt', 'list_prizes_with_fn');
        if (empty($prizes) && !empty($DEBUG_SECTIONS['putt']['errors'])) {
            // Fallback if f_ultfechaputt() doesn't exist on this DB
            $sql = "SELECT p.premio as id,
                           TRIM(p.descripcion) as name,
                           MIN(NULLIF(p.hoyo, 0)) as lugares,
                           NULL AS ultact
                    FROM putt p
                    WHERE p.torneoid = $tid AND p.premio > 0
                    GROUP BY p.premio, p.descripcion
                    ORDER BY p.premio ASC";
            $prizes = dbg_query_all($conn, $sql, 'putt', 'list_prizes_no_fn');
        }
        if (empty($prizes)) {
            $sql = "SELECT DISTINCT pj.premio as id,
                           TRIM(pj.premiosjugcol) as name,
                           NULL as lugares,
                           NULL AS ultact
                    FROM puttjug pj
                    WHERE pj.torneoid = $tid
                    ORDER BY pj.premio ASC";
            $prizes = dbg_query_all($conn, $sql, 'putt', 'list_prizes_fallback_puttjug');
        }
        $groups = [];

        foreach ($prizes as $p) {
            $premioId = esc($conn, $p['id']);
            $descripcion = trim((string)($p['name'] ?? ''));
            $descripcionEsc = esc($conn, $descripcion);

            // Per-prize cut: use `lugares` from premios; fall back to oyesnumprem
            // when the prize is missing from the master table.
            $lugares = (int)($p['lugares'] ?? 0);
            if ($lugares <= 0) { $lugares = $numPrem; }

            $sql = "SELECT COUNT(*) as cnt FROM puttjug WHERE torneoid = $tid AND premio = $premioId AND premiosjugcol = '$descripcionEsc' AND orden = 1";
            $countRow = safe_query_one($conn, $sql);
            $playerCount = min((int)($countRow['cnt'] ?? 0), $lugares);

            $group = [
                'id'          => 'putt-' . $p['id'],
                'name'        => $p['name'],
                'shortName'   => $p['name'],
              #  'hoyo'        => (int)$p['hoyo'],
                'maxPlayers'  => $lugares,
                'playerCount' => $playerCount,
            ];

            if ($detalle === '1') {
                // Cap the player list by THIS prize's `lugares` so the
                // displayed list matches the number shown on the card
                // (different prizes — e.g. Damas vs Caballeros — can have
                // different cut sizes).
                $group['players'] = get_putt_players($conn, $tid, $premioId, $descripcion, $lugares);
                $group['lastUpdated'] = $p['ultact'] ?? null;
            }

            $groups[] = $group;
        }
        $DEBUG_SECTIONS['putt']['group_count'] = count($groups);

        if (count($groups) > 0) {
            $competencias[] = [
            'id'          => 'putt',
            'name'        => 'Putt',
            'shortName'   => 'Putt',
            'description' => 'Competencia de Putt',
            'icon'        => 'target',
            'endpoint'    => 'putt',
            'order'       => 2,
            'enabled'     => true,
            'groupCount'  => count($groups),
            'groups'      => $groups,
            'columns'     => [
                ['key' => 'position', 'label' => 'Pos', 'align' => 'center', 'width' => '50px', 'format' => 'medal'],
                ['key' => 'clubLogo', 'label' => 'Club', 'align' => 'center', 'width' => '50px'],
                ['key' => 'name', 'label' => 'Jugador', 'align' => 'left'],
                ['key' => 'distance', 'label' => 'Distancia', 'align' => 'center', 'width' => '80px', 'format' => 'distance'],
            ],
            ];
        } else {
            $DEBUG_SECTIONS['putt']['reason'] = 'no groups built';
        }
    } else {
        $DEBUG_SECTIONS['putt']['reason'] = 'no rows in puttjug for this torneoid';
    }
}


// ============================================================================
// Driver Precisión
// ----------------------------------------------------------------------------
// Source table: `driverp` (one row per configured prize hole/description).
// Detection: any row with premio > 0 for this torneoid enables the section.
// Mirrors legacy SQL:
//   SELECT premio, descripcion, hoyo,
//          LEFT(f_ultfechadriverp(descripcion, torneoid), 16) AS ultact
//   FROM driverp
//   WHERE torneoid = $tid AND premio > 0
//   GROUP BY premio, descripcion, hoyo
// Per-prize cut (winners shown): `driverp.hoyo` — in this legacy schema each
// side-game table (approach/putt/driverp) stores the number of winner slots
// in its own `hoyo` column. The `premios` master table has no `lugares`
// column. When `hoyo` is zero/null we fall back to torneo.oyesnumprem.
// ============================================================================
if ($tipo === '' || $tipo === 'driverp') {
    $DEBUG_SECTIONS['driverp']['enabled'] = true;
    $sql = "SELECT COUNT(DISTINCT premio) as cnt FROM driverp WHERE torneoid = $tid AND premio > 0";
    $row = dbg_query_one($conn, $sql, 'driverp', 'count_distinct_premio');
    $DEBUG_SECTIONS['driverp']['count'] = (int)($row['cnt'] ?? 0);

    if ($row && (int)$row['cnt'] > 0) {
        // Try with optional last-update function first; fall back if missing.
        // Cut comes from `driverp.hoyo` (per-prize slots) just like Approach/Putt.
        $sql = "SELECT premio as id,
                       descripcion as name,
                       hoyo,
                       LEFT(f_ultfechadriverp(descripcion, torneoid), 16) AS ultact
                FROM driverp
                WHERE torneoid = $tid AND premio > 0
                GROUP BY premio, descripcion, hoyo
                ORDER BY premio ASC";
        $prizes = dbg_query_all($conn, $sql, 'driverp', 'list_prizes_with_fn');
        if (empty($prizes) && !empty($DEBUG_SECTIONS['driverp']['errors'])) {
            // Function may be missing — retry without it
            $sql = "SELECT premio as id,
                           descripcion as name,
                           hoyo,
                           NULL AS ultact
                    FROM driverp
                    WHERE torneoid = $tid AND premio > 0
                    GROUP BY premio, descripcion, hoyo
                    ORDER BY premio ASC";
            $prizes = dbg_query_all($conn, $sql, 'driverp', 'list_prizes_no_fn');
        }

        $groups = [];
        foreach ($prizes as $p) {
            $premioId    = esc($conn, $p['id']);
            $descripcion = esc($conn, $p['name']);
            // Winners cut: per-prize `hoyo` from driverp; fall back to oyesnumprem.
            $lugares     = (int)($p['hoyo'] ?? 0);
            if ($lugares <= 0) { $lugares = $numPrem; }

            $group = [
                'id'          => 'driverp-' . $p['id'],
                'name'        => $p['name'],
                'shortName'   => $p['name'],
                'maxPlayers'  => $lugares,
                'playerCount' => 0,
            ];

            if ($detalle === '1') {
                $group['players']     = get_driverp_players($conn, $tid, $premioId, $descripcion, $lugares);
                $group['playerCount'] = count($group['players']);
                $group['lastUpdated'] = $p['ultact'] ?? null;
            } else {
                // Best-effort count without running the full winners query.
                $sql2 = "SELECT COUNT(*) as cnt FROM driverpjug
                         WHERE torneoid = $tid AND premio = $premioId";
                $cntRow = safe_query_one($conn, $sql2);
                $group['playerCount'] = min((int)($cntRow['cnt'] ?? 0), $lugares);
            }

            $groups[] = $group;
        }
        $DEBUG_SECTIONS['driverp']['group_count'] = count($groups);

        if (count($groups) > 0) {
            $competencias[] = [
                'id'          => 'driverp',
                'name'        => 'Driver Precisión',
                'shortName'   => 'Driver Prec.',
                'description' => 'Driver más cercano a la línea central',
                'icon'        => 'crosshair',
                'endpoint'    => 'driverp',
                'order'       => 4,
                'enabled'     => true,
                'groupCount'  => count($groups),
                'groups'      => $groups,
                'columns'     => [
                    ['key' => 'position', 'label' => 'Pos', 'align' => 'center', 'width' => '50px', 'format' => 'medal'],
                    ['key' => 'clubLogo', 'label' => 'Club', 'align' => 'center', 'width' => '50px'],
                    ['key' => 'name', 'label' => 'Jugador', 'align' => 'left'],
                    ['key' => 'distance', 'label' => 'Dist', 'align' => 'center', 'width' => '80px', 'format' => 'distance'],
                ],
            ];
        } else {
            $DEBUG_SECTIONS['driverp']['reason'] = 'no groups built';
        }
    } else {
        $DEBUG_SECTIONS['driverp']['reason'] = 'no rows in driverp with premio > 0';
    }
}


// ============================================================================
// Driver Distancia
// ----------------------------------------------------------------------------
// Source tables: `driverjug` (player shots) joined to `v_driver` (configured
// prize/category/course matrix) and `jugadores` (player + club).
// Detection: any driverjug row for this torneoid enables the section.
// Prizes (groups) come from v_driver since that view defines which
// premio/categoria/campo combinations are configured for distance.
// Per-prize cut (winners shown): torneo.oyesnumprem — matches the legacy
// SQL which uses `LIMIT $oyesnumprem`. Distance has no per-prize slot
// column in this schema (driverjug is shot-level, v_driver is the
// configuration matrix), so the global tournament setting is the only
// available source of truth.
// Sorted DESC (longest drive wins).
// ============================================================================
if ($tipo === '' || $tipo === 'driverd') {
    $DEBUG_SECTIONS['driverd']['enabled'] = true;
    $sql = "SELECT COUNT(*) as cnt FROM driverjug WHERE torneoid = $tid";
    $row = dbg_query_one($conn, $sql, 'driverd', 'count_driverjug');
    $DEBUG_SECTIONS['driverd']['count'] = (int)($row['cnt'] ?? 0);

    if ($row && (int)$row['cnt'] > 0) {
        // Group definitions come from v_driver (premio + descripcion).
        // Each configured prize becomes a single card regardless of how
        // many categories it covers.
        $sql = "SELECT DISTINCT premio as id, descripcion as name
                FROM v_driver
                WHERE premio IN (
                    SELECT DISTINCT premio FROM driverjug WHERE torneoid = $tid
                )
                ORDER BY premio ASC";
        $prizes = dbg_query_all($conn, $sql, 'driverd', 'list_prizes_v_driver');

        // Fallback: if v_driver isn't populated, build prizes from driverjug
        // alone so the section still appears (no descriptive name though).
        if (empty($prizes)) {
            $sql = "SELECT DISTINCT premio as id,
                           CONCAT('Premio ', premio) as name
                    FROM driverjug
                    WHERE torneoid = $tid
                    ORDER BY premio ASC";
            $prizes = dbg_query_all($conn, $sql, 'driverd', 'list_prizes_fallback_driverjug');
        }

        $groups = [];
        foreach ($prizes as $p) {
            $premioId = esc($conn, $p['id']);
            // Winners cut: matches legacy `LIMIT $oyesnumprem`.
            $lugares  = $numPrem;

            $group = [
                'id'          => 'driverd-' . $p['id'],
                'name'        => $p['name'],
                'shortName'   => $p['name'],
                'maxPlayers'  => $lugares,
                'playerCount' => 0,
            ];

            if ($detalle === '1') {
                $group['players']     = get_driverd_players($conn, $tid, $premioId, $lugares);
                $group['playerCount'] = count($group['players']);
            } else {
                $sql2 = "SELECT COUNT(DISTINCT jugadorid) as cnt
                         FROM driverjug
                         WHERE torneoid = $tid AND premio = $premioId";
                $cntRow = safe_query_one($conn, $sql2);
                $group['playerCount'] = min((int)($cntRow['cnt'] ?? 0), $lugares);
            }

            $groups[] = $group;
        }
        $DEBUG_SECTIONS['driverd']['group_count'] = count($groups);

        if (count($groups) > 0) {
            $competencias[] = [
                'id'          => 'driverd',
                'name'        => 'Driver Distancia',
                'shortName'   => 'Driver Dist.',
                'description' => 'Drive más largo',
                'icon'        => 'ruler',
                'endpoint'    => 'driverd',
                'order'       => 5,
                'enabled'     => true,
                'groupCount'  => count($groups),
                'groups'      => $groups,
                'columns'     => [
                    ['key' => 'position', 'label' => 'Pos', 'align' => 'center', 'width' => '50px', 'format' => 'medal'],
                    ['key' => 'clubLogo', 'label' => 'Club', 'align' => 'center', 'width' => '50px'],
                    ['key' => 'name', 'label' => 'Jugador', 'align' => 'left'],
                    ['key' => 'distance', 'label' => 'Distancia', 'align' => 'center', 'width' => '100px', 'format' => 'distance'],
                ],
            ];
        } else {
            $DEBUG_SECTIONS['driverd']['reason'] = 'no groups built';
        }
    } else {
        $DEBUG_SECTIONS['driverd']['reason'] = 'no rows in driverjug for this torneoid';
    }
}


// ============= Skin Game =============
// if ($tipo === '' || $tipo === 'skin') {
//     $sql = "SELECT COUNT(DISTINCT a.categoria_id) as cnt 
//             FROM categorias a
//             JOIN caljuego c ON (a.categoria_id = c.categoriaid AND c.campo > 0 AND c.cierre = 1 AND c.skin = 1)
//             WHERE a.torneo_id = $tid AND a.estatus = 1 AND a.Skin_grupo_id > 0";
//     $row = safe_query_one($conn, $sql);
    
//     if ($row && (int)$row['cnt'] > 0) {
//         $conn->query("SET lc_time_names = 'es_ES'");

//         // Get available dates and groups
//         $sql = "SELECT DISTINCT fecha,
//                        DATE_FORMAT(fecha, '%W %e de %M') as fechaFormato
//                 FROM categorias a
//                 JOIN caljuego c ON (a.categoria_id = c.categoriaid AND c.campo > 0 AND c.cierre = 1 AND c.skin = 1)
//                 WHERE a.torneo_id = $tid AND a.estatus = 1 AND a.Skin_grupo_id > 0
//                 ORDER BY fecha";
//         $dateRows = safe_query_all($conn, $sql);

//         $groups = [];
//         foreach ($dateRows as $dr) {
//             $fec = esc($conn, $dr['fecha']);

//             $sql = "SELECT DISTINCT Skin_grupo_id
//                     FROM categorias a
//                     JOIN caljuego c ON (a.categoria_id = c.categoriaid AND c.campo > 0 AND c.cierre = 1 AND c.skin = 1)
//                     WHERE a.torneo_id = $tid AND a.estatus = 1 AND a.Skin_grupo_id > 0 AND c.fecha = '$fec'
//                     ORDER BY Skin_grupo_id";
//             $groupRows = safe_query_all($conn, $sql);

//             foreach ($groupRows as $gr) {
//                 $gid = (int)$gr['Skin_grupo_id'];
//                 $groups[] = [
//                     'id'          => "skin-{$dr['fecha']}-g{$gid}",
//                     'name'        => ucfirst($dr['fechaFormato']) . " - Grupo $gid",
//                     'shortName'   => "G$gid - " . $dr['fechaFormato'],
//                     'date'        => $dr['fecha'],
//                     'groupId'     => $gid,
//                     'maxPlayers'  => 18,
//                     'playerCount' => 0,
//                 ];
//             }
//         }

//         $competencias[] = [
//             'id'          => 'skin-game',
//             'name'        => 'Skin Game',
//             'shortName'   => 'Skin',
//             'description' => 'Competencia Skin Game por hoyo',
//             'icon'        => 'award',
//             'endpoint'    => 'skin_game',
//             'order'       => 40,
//             'enabled'     => true,
//             'groupCount'  => count($groups),
//             'groups'      => $groups,
//             'columns'     => [
//                 ['key' => 'hole', 'label' => 'Hoyo', 'align' => 'center', 'width' => '50px'],
//                 ['key' => 'clubLogo', 'label' => 'Club', 'align' => 'center', 'width' => '50px'],
//                 ['key' => 'name', 'label' => 'Jugador', 'align' => 'left'],
//                 ['key' => 'category', 'label' => 'Cat.', 'align' => 'center', 'width' => '60px'],
//                 ['key' => 'score', 'label' => 'Score', 'align' => 'center', 'width' => '60px', 'format' => 'number'],
//             ],
//         ];
//     }
// }

// Sort by order
usort($competencias, function($a, $b) {
    return $a['order'] - $b['order'];
});

/**
 * Final response.
 * In ?debug=1 mode we wrap the array inside an object so we can attach
 * a `_debug` payload describing what each section did. The frontend treats
 * the response as an array of competencias, so debug mode is intended for
 * manual curl/browser inspection only — DO NOT enable in normal traffic.
 */
if (!empty($DEBUG_MODE)) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'competencias' => $competencias,
        '_debug' => [
            'torneoid'     => (int)$tid,
            'tipo_filter'  => $tipo,
            'detalle'      => $detalle,
            'numPrem'      => $numPrem,
            'returned'     => count($competencias),
            'returned_ids' => array_map(fn($c) => $c['id'], $competencias),
            'sections'     => $DEBUG_SECTIONS,
        ],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
json_response($competencias);

} catch (\Throwable $e) {
    // Caught by the main try: return JSON with details in debug mode
    global $DEBUG_MODE;
    http_response_code(500);
    $payload = ['error' => 'competencias.php threw an exception'];
    if (!empty($DEBUG_MODE)) {
        $payload['_debug'] = [
            'type'    => get_class($e),
            'message' => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
            'trace'   => array_slice(explode("\n", $e->getTraceAsString()), 0, 15),
        ];
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

// ============= Helper Functions =============

/** Get O'Yes players for a prize group */
function get_oyes_players($conn, $tid, $premioId, $numPrem) {
    global $LOGOS_BASE_URL;
    
    // Pre-update (safe - won't crash on failure)
    safe_exec($conn, "UPDATE premiosjug SET orden = 0 WHERE torneoid = $tid", 'oyes reset orden');
    safe_exec($conn, "UPDATE premiosjug a
                  JOIN v_oyesunicas b ON (a.jugadorid = b.jugadorid AND a.torneoid = b.torneoid)
                  SET a.orden = 1
                  WHERE a.torneoid = $tid", 'oyes set orden');


    // Legacy winner query — joins premios on (fecha, campo, hoyo, categoriaid)
    // so a player only counts for the premio that matches THEIR category and
    // the hole/course where the shot was recorded.
    $sql = "SELECT a.jugadorid,
                   CONCAT(j.nombre, ' ', j.apellido) as jugador,
                   ROUND(TRUNCATE(a.distancia, 3), 2) as distancia,
                   a.hoyo,
                   cl.logo, cl.nombre as club
            FROM premiosjug a
            JOIN jugadores j ON (a.jugadorid = j.id AND a.orden = 1)
            JOIN clubs cl ON (j.clubid = cl.id)
            JOIN premios c ON (a.fecha = c.fecha AND a.campo = c.campo
                               AND a.hoyo = c.hoyo AND j.categoriaid = c.categoriaid)
            WHERE a.torneoid = $tid AND c.premio = $premioId
            ORDER BY c.premio, a.distancia ASC
            LIMIT $numPrem";

    $winners = safe_query_all($conn, $sql);

    $players = [];
    $pos = 0;
    foreach ($winners as $w) {
        $pos++;
        $players[] = [
            'id'        => (string)$w['jugadorid'],
            'position'  => $pos,
            'name'      => $w['jugador'],
            'hole'      => (int)$w['hoyo'],
            'distance'  => (float)$w['distancia'],
            'club'      => $w['club'],
            'clubLogo'  => $w['logo'] ? $LOGOS_BASE_URL . $w['logo'] : '',
        ];
    }
    return $players;
}

/** Get O'Yes last updated timestamp */
function get_oyes_last_updated($conn, $tid, $premioId) {
    $sql = "SELECT f_ultact($tid, $premioId) as lastUpdated";
    $row = safe_query_one($conn, $sql);
    return $row['lastUpdated'] ?? null;
}

/** Get O'Yes-X players for a prize group */
function get_oyesx_players($conn, $tid, $premioId, $numPrem, $descLower) {
    global $LOGOS_BASE_URL;

    $sortOrder = (strpos($descLower, 'distancia') !== false || strpos($descLower, 'driver') !== false) ? 'DESC' : 'ASC';

    $sql = "SELECT a.jugadorid,
                   CONCAT(j.nombre, ' ', j.apellido) as jugador,
                   a.distancia, a.hoyo,
                   c.logo, c.nombre as club
            FROM premiosjug a
            JOIN v_premjug b ON (a.jugadorid = b.jugadorid AND a.torneoid = b.torneoid AND a.premio = b.premio)
            JOIN jugadores j ON (a.jugadorid = j.id)
            JOIN clubs c ON (j.clubid = c.id)
            WHERE a.torneoid = $tid AND a.premio = $premioId AND a.orden = 1
            ORDER BY a.distancia $sortOrder
            LIMIT $numPrem";

error_log("competencias.php - O'Yes-X players SQL for premioId=$premioId, desc='$descLower'");

    $winners = safe_query_all($conn, $sql);

    $players = [];
    $pos = 0;
    foreach ($winners as $w) {
        $pos++;
        $players[] = [
            'id'        => (string)$w['jugadorid'],
            'position'  => $pos,
            'name'      => $w['jugador'],
            'distance'  => (float)$w['distancia'],
            'club'      => $w['club'],
            'clubLogo'  => $w['logo'] ? $LOGOS_BASE_URL . $w['logo'] : '',
        ];
    }
    return $players;
}

/** Get O'Yes-X last updated timestamp */
function get_oyesx_last_updated($conn, $descName, $tid) {
    $descEsc = esc($conn, $descName);
    $sql = "SELECT f_ultfechaoyesx('$descEsc', $tid) as lastUpdated";
    $row = safe_query_one($conn, $sql);
    return $row['lastUpdated'] ?? null;
}

/**
 * Get Putt players for a prize group, capped by the number of available spots ("lugares").
 *
 * @param mysqli $conn      Database connection.
 * @param int    $tid       Active tournament id.
 * @param int    $premioId  Prize id within puttjug.
 * @param string $descripcion Configured prize description used to separate
 *                            groups like Damas/Caballeros under same premio.
 * @param int    $limit     Max number of players to return (defaults to 3).
 *                          Comes from torneo.oyesnumprem and matches the
 *                          card's `playerCount`/`maxPlayers` so the rendered
 *                          list never exceeds the displayed cut value.
 */
function get_putt_players($conn, $tid, $premioId, $descripcion, $limit = 3) {
    global $LOGOS_BASE_URL;

    // Defensive: ensure a sane positive integer LIMIT
    $limit = max(1, (int)$limit);
    $descripcionEsc = esc($conn, $descripcion);

    $sql = "SELECT a.jugadorid,
                   CONCAT(j.nombre, ' ', j.apellido) as jugador,
                   a.distancia,
                   c.logo, c.nombre as club
            FROM puttjug a
            JOIN jugadores j ON (a.jugadorid = j.id)
            JOIN clubs c ON (j.clubid = c.id)
            WHERE a.torneoid = $tid AND a.premio = $premioId AND a.premiosjugcol = '$descripcionEsc' AND a.orden = 1
            ORDER BY a.distancia ASC
            LIMIT $limit";


    $winners = safe_query_all($conn, $sql);

    $players = [];
    $pos = 0;

    foreach ($winners as $w) {
        $pos++;
        $players[] = [
            'id'        => (string)$w['jugadorid'],
            'position'  => $pos,
            'name'      => $w['jugador'],
            'distance'  => (float)$w['distancia'],
            'club'      => $w['club'],
            'clubLogo'  => $w['logo'] ? $LOGOS_BASE_URL . $w['logo'] : '',
        ];
        
    }
    return $players;
}

/** Get Putt last updated timestamp */
function get_putt_last_updated($conn, $tid, $premio) {
    $sql = "SELECT f_ultfechaputt($premio,$tid) as lastUpdated";
    $row = safe_query_one($conn, $sql);
    return $row['lastUpdated'] ?? null;
}

/** Get Approach players for a prize group */
function get_approach_players($conn, $tid, $descripcion, $limit) {
    global $LOGOS_BASE_URL;

    // Pre-update: reset orden and mark unique best distances
    safe_exec($conn, "UPDATE approachjug SET orden = 0 WHERE torneoid = $tid", 'approach reset orden');
    safe_exec($conn, "UPDATE approachjug a
                  JOIN v_approachunico b ON (a.jugadorid = b.jugadorid AND a.distancia = b.mindistancia AND a.torneoid = $tid)
                  SET a.orden = 1", 'approach set orden');

    // Fetch players joined with v_approach for category matching
    $sql = "SELECT a.id, a.fecha, a.campo, a.hoyo, a.jugadorid,
                   ROUND(TRUNCATE(a.distancia, 3), 2) as distancia,
                   CONCAT(b.nombre, ' ', b.apellido) as jugador,
                   cl.nombre as club, b.categoriaid,
                   c.descripcion,
                   cl.logo as logo
            FROM approachjug a
            JOIN jugadores b ON (a.jugadorid = b.id)
            JOIN clubs cl ON (b.clubid = cl.id)
            JOIN v_approach c ON (a.campo = c.campo AND b.categoriaid = c.categoriaid AND a.premiosjugcol = c.descripcion)
            WHERE a.torneoid = $tid AND c.descripcion = '$descripcion'
            ORDER BY c.descripcion, a.distancia ASC
            LIMIT $limit";

    $winners = safe_query_all($conn, $sql);

    $players = [];
    $pos = 0;
    foreach ($winners as $w) {
        $pos++;
        $logoPath = $w['logo'] ?? '';
        $players[] = [
            'id'        => (string)$w['jugadorid'],
            'position'  => $pos,
            'name'      => $w['jugador'],
            'distance'  => (float)$w['distancia'],
            'club'      => $w['club'] ?? '',
            'clubLogo'  => $logoPath ? $LOGOS_BASE_URL . $logoPath : '',
        ];
    }
    return $players;
}

/**
 * Get Driver Precisión players for a prize group.
 *
 * Source: `driverpjug` (player shots) joined to `jugadores` + `clubs`.
 * Filtered by torneoid, premio, and the configured `descripcion` slot.
 * Sorted ASC (closest to line wins). Capped by `$limit` (per-prize hoyo
 * count, falling back to torneo.oyesnumprem).
 *
 * @param mysqli $conn        DB connection.
 * @param int    $tid         Active tournament id.
 * @param int    $premioId    Prize id from `driverp.premio`.
 * @param string $descripcion Configured prize description (already escaped).
 * @param int    $limit       Max winners to return.
 */
function get_driverp_players($conn, $tid, $premioId, $descripcion, $limit = 3) {
    global $LOGOS_BASE_URL;
    $limit = max(1, (int)$limit);

    $sql = "SELECT a.jugadorid,
                   CONCAT(j.nombre, ' ', j.apellido) as jugador,
                   ROUND(TRUNCATE(a.distancia, 3), 2) as distancia,
                   a.hoyo,
                   c.logo, c.nombre as club
            FROM driverpjug a
            JOIN jugadores j ON (a.jugadorid = j.id)
            JOIN clubs c ON (j.clubid = c.id)
            WHERE a.torneoid = $tid AND a.premio = $premioId
            ORDER BY a.distancia ASC
            LIMIT $limit";

    $winners = safe_query_all($conn, $sql);

    $players = [];
    $pos = 0;
    foreach ($winners as $w) {
        $pos++;
        $players[] = [
            'id'        => (string)$w['jugadorid'],
            'position'  => $pos,
            'name'      => $w['jugador'],
            'hole'      => (int)($w['hoyo'] ?? 0),
            'distance'  => (float)$w['distancia'],
            'club'      => $w['club'] ?? '',
            'clubLogo'  => $w['logo'] ? $LOGOS_BASE_URL . $w['logo'] : '',
        ];
    }
    return $players;
}

/**
 * Get Driver Distancia players for a prize group.
 *
 * Mirrors legacy SQL exactly:
 *   SELECT * FROM (
 *     SELECT ... FROM driverjug a
 *     JOIN jugadores b ON (a.jugadorid = b.id)
 *     JOIN v_driver  c ON (a.campo = c.campo
 *                          AND b.categoriaid = c.categoriaid
 *                          AND a.premio = c.premio)
 *     WHERE a.torneoid = $tid AND c.premio = '$premio'
 *     ORDER BY a.distancia DESC
 *     LIMIT $oyesnumprem
 *   ) AS x
 *   ORDER BY distancia ASC
 *
 * Inner query takes the top-N longest drives; outer reorder ASC matches
 * the legacy report's display order (shortest of the winners shown first).
 * We then renumber positions DESC-wise so #1 = longest drive.
 */
function get_driverd_players($conn, $tid, $premioId, $limit = 3) {
    global $LOGOS_BASE_URL;
    $limit = max(1, (int)$limit);

    $sql = "SELECT * FROM (
                SELECT a.jugadorid,
                       a.fecha, a.campo, a.hoyo,
                       ROUND(TRUNCATE(a.distancia, 3), 2) as distancia,
                       CONCAT(b.nombre, ' ', b.apellido) as jugador,
                       cl.nombre as club, cl.logo as logo,
                       b.categoriaid, c.descripcion
                FROM driverjug a
                JOIN jugadores b ON (a.jugadorid = b.id)
                JOIN clubs    cl ON (b.clubid = cl.id)
                JOIN v_driver c  ON (a.campo = c.campo
                                     AND b.categoriaid = c.categoriaid
                                     AND a.premio = c.premio)
                WHERE a.torneoid = $tid AND c.premio = $premioId
                ORDER BY a.distancia DESC
                LIMIT $limit
            ) AS x
            ORDER BY distancia DESC";

    $winners = safe_query_all($conn, $sql);

    $players = [];
    $pos = 0;
    foreach ($winners as $w) {
        $pos++; // #1 = longest drive (already sorted DESC)
        $players[] = [
            'id'        => (string)$w['jugadorid'],
            'position'  => $pos,
            'name'      => $w['jugador'],
            'hole'      => (int)($w['hoyo'] ?? 0),
            'distance'  => (float)$w['distancia'],
            'club'      => $w['club'] ?? '',
            'clubLogo'  => $w['logo'] ? $LOGOS_BASE_URL . $w['logo'] : '',
        ];
    }
    return $players;
}

// End of competencias.php - Driver Precisión + Distancia added 2026-04-28
