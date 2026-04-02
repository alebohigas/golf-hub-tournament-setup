<?php
/**
 * Competencias Master Endpoint
 * GET /api/competencias.php?torneoid=XXX
 * Returns available competition types based on existing data in DB tables
 *
 * Checks: premiosjug (O'Yes), oyesxjug (O'Yes-X), puttjug (Putt), Skeen_tarjetas (Skin Game)
 * Each type includes its groups (prizes) and player counts
 *
 * Optional: ?tipo=oyes|oyesx|putt|skin - filter to a specific type
 * Optional: ?detalle=1 - include full player data for each group
 */
require_once 'config.php';

// Enable error reporting for debugging 500s
error_reporting(E_ALL);
ini_set('display_errors', '0'); // Don't display, capture instead
ini_set('log_errors', '1');

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
    debug_log_query('safe_query_one', $sql);
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
    debug_log_query('safe_query_all', $sql);
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
// echo "/* Debug: Received request for torneoid=$tid, tipo='$tipo', detalle='$detalle' */\n";
// ============= Get tournament config =============
$sql = "SELECT oyesnumprem FROM torneo WHERE torneo_id = $tid";
$torneoInfo = safe_query_one($conn, $sql);
if (!$torneoInfo) {
    json_error("Tournament $torneoid not found", 404);
}
$numPrem = (int)($torneoInfo['oyesnumprem'] ?? 3);

$competencias = [];
// echo "/* Debug: torneo_id=$tid, tipo='$tipo', detalle='$detalle', numPrem=$numPrem */\n";
// ============= O'Yes (Approach / Closest to Pin) =============
if ($tipo === '' || $tipo === 'oyes') {
    $sql = "SELECT COUNT(DISTINCT premio) as cnt FROM premiosjug WHERE torneoid = $tid";
    $row = safe_query_one($conn, $sql);
    
    if ($row && (int)$row['cnt'] > 0) {
        // Get groups (prizes)
        $sql = "SELECT DISTINCT premio as id, CONCAT('Premio ', premio) as name, hoyo
                FROM premiosjug
                WHERE torneoid = $tid
                ORDER BY premio ASC";
        $prizes = safe_query_all($conn, $sql);


// echo "/* Debug: O'Yes prizes found: " . count($prizes) . " */\n";
// echo $sql . "\n";
        
        $groups = [];
        foreach ($prizes as $p) {
            $premioId = esc($conn, $p['id']);
            
            // Count players
            $sql = "SELECT COUNT(*) as cnt FROM premiosjug WHERE torneoid = $tid AND premio = $premioId AND orden = 1";
            $countRow = safe_query_one($conn, $sql);
            $playerCount = min((int)($countRow['cnt'] ?? 0), $numPrem);
            
            $group = [
                'id'          => 'oyes-' . $p['id'],
                'name'        => $p['name'],
                'shortName'   => $p['name'],
                'hoyo'        => (int)$p['hoyo'],
                'maxPlayers'  => $numPrem,
                'playerCount' => $playerCount,
            ];
// echo "/* Debug: O'Yes group for premioId={$p['id']} - playerCount=$playerCount */\n";

            // Include full player data if requested
            if ($detalle === '1') {
                $group['players'] = get_oyes_players($conn, $tid, $premioId, $numPrem);
                $group['lastUpdated'] = get_oyes_last_updated($conn, $tid, $premioId);
            }

            $groups[] = $group;
        }
        
// echo "/* Debug: Total O'Yes groups: " . count($groups) . " */\n";

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

// echo "/* Debug: Completed O'Yes section, competencias count: " . count($competencias) . " */\n";


// ============= O'Yes-X (Driver, Precision, etc.) =============
if ($tipo === '' || $tipo === 'oyesx') {
    // Pre-update marks (safe - won't crash on failure)
    safe_exec($conn, "UPDATE oyesxjug SET orden = 0 WHERE torneoid = $tid", 'oyesx reset orden');
    safe_exec($conn, "UPDATE oyesxjug a
                  JOIN v_oyesx b ON (a.jugadorid = b.jugadorid AND a.torneoid = b.torneoid AND a.premio = b.premio)
                  SET a.orden = 1
                  WHERE a.torneoid = $tid", 'oyesx set orden');

    // Group O'Yes-X by description type (driver, precision, etc.)
    $sql = "SELECT DISTINCT descripcion FROM oyesxjug WHERE torneoid = $tid ORDER BY descripcion";
    $descRows = safe_query_all($conn, $sql);

    foreach ($descRows as $descRow) {
        $descName = $descRow['descripcion'];
        $descEsc = esc($conn, $descName);
        
        // Determine icon based on description
        $descLower = strtolower($descName);
        $icon = 'star';
        $typeId = 'oyesx-' . preg_replace('/[^a-z0-9]/', '-', $descLower);
        if (strpos($descLower, 'driver') !== false || strpos($descLower, 'distancia') !== false) {
            $icon = 'ruler';
        } elseif (strpos($descLower, 'precision') !== false || strpos($descLower, 'precisión') !== false) {
            $icon = 'crosshair';
        }
    }
}
// echo "/* Debug: Completed O'Yes-X pre-update, competencias count: " . count($competencias) . " */\n";

        // Get prizes for this description type
        $sql = "SELECT DISTINCT premio as id, descripcion as name, hoyo
                FROM oyesxjug
                WHERE torneoid = $tid AND descripcion = '$descEsc'
                ORDER BY premio ASC";
        $prizes = safe_query_all($conn, $sql);

        $groups = [];
        foreach ($prizes as $p) {
            $premioId = esc($conn, $p['id']);
            
            $sql = "SELECT COUNT(*) as cnt FROM oyesxjug WHERE torneoid = $tid AND premio = $premioId AND orden = 1";
            $countRow = safe_query_one($conn, $sql);
            $playerCount = min((int)($countRow['cnt'] ?? 0), $numPrem);

            $group = [
                'id'          => 'oyesx-' . $p['id'],
                'name'        => $p['name'],
                'shortName'   => $p['name'],
                'hoyo'        => (int)$p['hoyo'],
                'maxPlayers'  => $numPrem,
                'playerCount' => $playerCount,
            ];

            if ($detalle === '1') {
                $group['players'] = get_oyesx_players($conn, $tid, $premioId, $numPrem, $descLower);
                $group['lastUpdated'] = get_oyesx_last_updated($conn, $descName, $tid);
            }

            $groups[] = $group;
        }
// echo "/* Debug: Completed O'Yes-X groups for description '$descName', group count: " . count($groups) . " */\n";
        // Determine sort type for columns
        $sortDesc = (strpos($descLower, 'distancia') !== false || strpos($descLower, 'driver') !== false);
        
        $competencias[] = [
            'id'          => $typeId,
            'name'        => $descName,
            'shortName'   => $descName,
            'description' => "Competencia $descName",
            'icon'        => $icon,
            'endpoint'    => 'oyesx',
            'endpointParams' => ['tipo' => $descName],
            'order'       => 10 + count($competencias),
            'enabled'     => true,
            'groupCount'  => count($groups),
            'groups'      => $groups,
            'columns'     => [
                ['key' => 'position', 'label' => 'Pos', 'align' => 'center', 'width' => '50px', 'format' => 'medal'],
                ['key' => 'clubLogo', 'label' => 'Club', 'align' => 'center', 'width' => '50px'],
                ['key' => 'name', 'label' => 'Jugador', 'align' => 'left'],
                ['key' => 'distance', 'label' => $sortDesc ? 'Distancia' : 'Distancia', 'align' => 'center', 'width' => '80px', 'format' => 'distance'],
            ],
        ];
// echo "/* Debug: Completed O'Yes-X section for description '$descName', competencias count: " . count($competencias) . " */\n";

// ============= Putt =============
if ($tipo === '' || $tipo === 'putt') {
    $sql = "SELECT COUNT(DISTINCT premio) as cnt FROM puttjug WHERE torneoid = $tid";
    $row = safe_query_one($conn, $sql);
    
    if ($row && (int)$row['cnt'] > 0) {
        // Pre-update marks (safe - won't crash on failure)
        safe_exec($conn, "UPDATE puttjug SET orden = 0 WHERE torneoid = $tid", 'putt reset orden');
        safe_exec($conn, "UPDATE puttjug a
                      JOIN v_puttunico b ON (a.jugadorid = b.jugadorid AND a.torneoid = b.torneoid AND a.premio = b.premio)
                      SET a.orden = 1
                      WHERE a.torneoid = $tid", 'putt set orden');

        $sql = "SELECT DISTINCT premio as id, descripcion as name, hoyo
                FROM puttjug
                WHERE torneoid = $tid
                ORDER BY premio ASC";
        $prizes = safe_query_all($conn, $sql);
// echo "/* Debug: Putt prizes found: " . count($prizes) . " */\n";
        $groups = [];
        foreach ($prizes as $p) {
            $premioId = esc($conn, $p['id']);
            
            $sql = "SELECT COUNT(*) as cnt FROM puttjug WHERE torneoid = $tid AND premio = $premioId AND orden = 1";
            $countRow = safe_query_one($conn, $sql);
            $playerCount = min((int)($countRow['cnt'] ?? 0), $numPrem);

            $group = [
                'id'          => 'putt-' . $p['id'],
                'name'        => $p['name'],
                'shortName'   => $p['name'],
                'hoyo'        => (int)$p['hoyo'],
                'maxPlayers'  => $numPrem,
                'playerCount' => $playerCount,
            ];

            if ($detalle === '1') {
                $group['players'] = get_putt_players($conn, $tid, $premioId, $numPrem);
                $group['lastUpdated'] = get_putt_last_updated($conn, $tid);
            }

            $groups[] = $group;
        }
// echo "/* Debug: Completed Putt groups, group count: " . count($groups) . " */\n";
        $competencias[] = [
            'id'          => 'putt',
            'name'        => 'Putt',
            'shortName'   => 'Putt',
            'description' => 'Competencia de Putt',
            'icon'        => 'target',
            'endpoint'    => 'putt',
            'order'       => 30,
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
    }
}
// echo "/* Debug: Completed Putt section, competencias count: " . count($competencias) . " */\n";
// ============= Skin Game =============
if ($tipo === '' || $tipo === 'skin') {
    $sql = "SELECT COUNT(DISTINCT a.categoria_id) as cnt 
            FROM categorias a
            JOIN caljuego c ON (a.categoria_id = c.categoriaid AND c.campo > 0 AND c.cierre = 1 AND c.skin = 1)
            WHERE a.torneo_id = $tid AND a.estatus = 1 AND a.Skin_grupo_id > 0";
    $row = safe_query_one($conn, $sql);
    
    if ($row && (int)$row['cnt'] > 0) {
        $conn->query("SET lc_time_names = 'es_ES'");

        // Get available dates and groups
        $sql = "SELECT DISTINCT fecha,
                       DATE_FORMAT(fecha, '%W %e de %M') as fechaFormato
                FROM categorias a
                JOIN caljuego c ON (a.categoria_id = c.categoriaid AND c.campo > 0 AND c.cierre = 1 AND c.skin = 1)
                WHERE a.torneo_id = $tid AND a.estatus = 1 AND a.Skin_grupo_id > 0
                ORDER BY fecha";
        $dateRows = safe_query_all($conn, $sql);

        $groups = [];
        foreach ($dateRows as $dr) {
            $fec = esc($conn, $dr['fecha']);

            $sql = "SELECT DISTINCT Skin_grupo_id
                    FROM categorias a
                    JOIN caljuego c ON (a.categoria_id = c.categoriaid AND c.campo > 0 AND c.cierre = 1 AND c.skin = 1)
                    WHERE a.torneo_id = $tid AND a.estatus = 1 AND a.Skin_grupo_id > 0 AND c.fecha = '$fec'
                    ORDER BY Skin_grupo_id";
            $groupRows = safe_query_all($conn, $sql);

            foreach ($groupRows as $gr) {
                $gid = (int)$gr['Skin_grupo_id'];
                $groups[] = [
                    'id'          => "skin-{$dr['fecha']}-g{$gid}",
                    'name'        => ucfirst($dr['fechaFormato']) . " - Grupo $gid",
                    'shortName'   => "G$gid - " . $dr['fechaFormato'],
                    'date'        => $dr['fecha'],
                    'groupId'     => $gid,
                    'maxPlayers'  => 18,
                    'playerCount' => 0,
                ];
            }
        }

        $competencias[] = [
            'id'          => 'skin-game',
            'name'        => 'Skin Game',
            'shortName'   => 'Skin',
            'description' => 'Competencia Skin Game por hoyo',
            'icon'        => 'award',
            'endpoint'    => 'skin_game',
            'order'       => 40,
            'enabled'     => true,
            'groupCount'  => count($groups),
            'groups'      => $groups,
            'columns'     => [
                ['key' => 'hole', 'label' => 'Hoyo', 'align' => 'center', 'width' => '50px'],
                ['key' => 'clubLogo', 'label' => 'Club', 'align' => 'center', 'width' => '50px'],
                ['key' => 'name', 'label' => 'Jugador', 'align' => 'left'],
                ['key' => 'category', 'label' => 'Cat.', 'align' => 'center', 'width' => '60px'],
                ['key' => 'score', 'label' => 'Score', 'align' => 'center', 'width' => '60px', 'format' => 'number'],
            ],
        ];
    }
}

// Sort by order
usort($competencias, function($a, $b) {
    return $a['order'] - $b['order'];
});

json_response($competencias);

// ============= Helper Functions =============

/** Get O'Yes players for a prize group */
function get_oyes_players($conn, $tid, $premioId, $numPrem) {
    global $LOGOS_BASE_URL;
    
    // Pre-update (safe - won't crash on failure)
    safe_exec($conn, "UPDATE premiosjug SET orden = 0 WHERE torneoid = $tid", 'oyes reset orden');
    safe_exec($conn, "UPDATE premiosjug a
                  JOIN v_oyesunicas b ON (a.jugadorid = b.jugadorid AND a.torneoid = b.torneoid AND a.premio = b.premio)
                  SET a.orden = 1
                  WHERE a.torneoid = $tid", 'oyes set orden');

    $sql = "SELECT a.jugadorid,
                   CONCAT(j.nombre, ' ', j.apellido) as jugador,
                   a.distancia, a.hoyo,
                   c.logo, c.nombre as club
            FROM premiosjug a
            JOIN v_oyes b ON (a.jugadorid = b.jugadorid AND a.torneoid = b.torneoid AND a.premio = b.premio)
            JOIN jugadores j ON (a.jugadorid = j.id)
            JOIN clubs c ON (j.clubid = c.id)
            WHERE a.torneoid = $tid AND a.premio = $premioId AND a.orden = 1
            ORDER BY a.distancia ASC
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
            FROM oyesxjug a
            JOIN v_oyesx b ON (a.jugadorid = b.jugadorid AND a.torneoid = b.torneoid AND a.premio = b.premio)
            JOIN jugadores j ON (a.jugadorid = j.id)
            JOIN clubs c ON (j.clubid = c.id)
            WHERE a.torneoid = $tid AND a.premio = $premioId AND a.orden = 1
            ORDER BY a.distancia $sortOrder
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

/** Get Putt players for a prize group */
function get_putt_players($conn, $tid, $premioId, $numPrem) {
    global $LOGOS_BASE_URL;

    $sql = "SELECT a.jugadorid,
                   CONCAT(j.nombre, ' ', j.apellido) as jugador,
                   a.distancia, a.hoyo,
                   c.logo, c.nombre as club
            FROM puttjug a
            JOIN v_putt b ON (a.jugadorid = b.jugadorid AND a.torneoid = b.torneoid AND a.premio = b.premio)
            JOIN jugadores j ON (a.jugadorid = j.id)
            JOIN clubs c ON (j.clubid = c.id)
            WHERE a.torneoid = $tid AND a.premio = $premioId AND a.orden = 1
            ORDER BY a.distancia ASC
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
            'distance'  => (float)$w['distancia'],
            'club'      => $w['club'],
            'clubLogo'  => $w['logo'] ? $LOGOS_BASE_URL . $w['logo'] : '',
        ];
    }
    return $players;
}

/** Get Putt last updated timestamp */
function get_putt_last_updated($conn, $tid) {
    $sql = "SELECT f_ultfechaputt($tid) as lastUpdated";
    $row = safe_query_one($conn, $sql);
    return $row['lastUpdated'] ?? null;
}
