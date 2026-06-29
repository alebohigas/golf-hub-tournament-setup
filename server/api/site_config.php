<?php
/**
 * Site Config Endpoint
 * GET  /api/site_config.php  - Returns torneoid + menu_order for current domain
 * POST /api/site_config.php  - Saves torneoid and/or menu_order for current domain (admin)
 * 
 * Uses `site_config` table:
 * 
 * CREATE TABLE IF NOT EXISTS site_config (
 *   domain VARCHAR(255) NOT NULL PRIMARY KEY,
 *   torneoid INT NOT NULL,
 *   menu_order TEXT DEFAULT NULL COMMENT 'JSON object mapping pageId to order number',
 *   visibility TEXT DEFAULT NULL COMMENT 'JSON object mapping pageId to boolean',
 *   menu_groups TEXT DEFAULT NULL COMMENT 'JSON array of menu group configs',
 *   page_group_assignments TEXT DEFAULT NULL COMMENT 'JSON object mapping pageId to groupId',
 *   live_scoring_config TEXT DEFAULT NULL COMMENT 'JSON object with live scoring page settings',
 *   sponsors_config TEXT DEFAULT NULL COMMENT 'JSON object with sponsors page display settings (e.g. column count)',
 *   eventos_config TEXT DEFAULT NULL COMMENT 'JSON object with eventos page display settings (cols/gap per breakpoint)',
 *   avisos_config TEXT DEFAULT NULL COMMENT 'JSON object with avisos page display settings (cols/gap per breakpoint)',
 *   theme_config TEXT DEFAULT NULL COMMENT 'JSON object with the active color palette {name, primary, secondary, accent, background} in HSL strings',
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 */
require_once 'config.php';

// Allow POST for saving config
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// Get the current domain from Host header
$domain = $_SERVER['HTTP_HOST'] ?? 'localhost';
$domain = esc($conn, $domain);

/**
 * Detect whether the live_scoring_config column exists.
 * This keeps the endpoint backward-compatible on servers
 * where the schema has not been updated yet.
 */
function site_config_has_live_scoring_config($conn) {
    static $hasColumn = null;

    if ($hasColumn !== null) {
        return $hasColumn;
    }

    $result = $conn->query("SHOW COLUMNS FROM site_config LIKE 'live_scoring_config'");
    $hasColumn = $result && $result->num_rows > 0;

    return $hasColumn;
}

$hasLiveScoringConfig = site_config_has_live_scoring_config($conn);

/**
 * Detect whether the sponsors_config column exists.
 * Keeps endpoint backward-compatible if the schema has not been migrated yet.
 */
function site_config_has_sponsors_config($conn) {
    static $hasColumn = null;

    if ($hasColumn !== null) {
        return $hasColumn;
    }

    $result = $conn->query("SHOW COLUMNS FROM site_config LIKE 'sponsors_config'");
    $hasColumn = $result && $result->num_rows > 0;

    return $hasColumn;
}

$hasSponsorsConfig = site_config_has_sponsors_config($conn);

/**
 * Detect whether the eventos_config column exists.
 * Keeps endpoint backward-compatible if the schema has not been migrated yet.
 */
function site_config_has_eventos_config($conn) {
    static $hasColumn = null;

    if ($hasColumn !== null) {
        return $hasColumn;
    }

    $result = $conn->query("SHOW COLUMNS FROM site_config LIKE 'eventos_config'");
    $hasColumn = $result && $result->num_rows > 0;

    return $hasColumn;
}

$hasEventosConfig = site_config_has_eventos_config($conn);

/**
 * Detect whether the avisos_config column exists.
 * Keeps endpoint backward-compatible if the schema has not been migrated yet.
 */
function site_config_has_avisos_config($conn) {
    static $hasColumn = null;

    if ($hasColumn !== null) {
        return $hasColumn;
    }

    $result = $conn->query("SHOW COLUMNS FROM site_config LIKE 'avisos_config'");
    $hasColumn = $result && $result->num_rows > 0;

    return $hasColumn;
}

$hasAvisosConfig = site_config_has_avisos_config($conn);

/**
 * Detect whether the premios_config column exists.
 * Keeps endpoint backward-compatible until the schema migration runs.
 */
function site_config_has_premios_config($conn) {
    static $hasColumn = null;
    if ($hasColumn !== null) return $hasColumn;
    $result = $conn->query("SHOW COLUMNS FROM site_config LIKE 'premios_config'");
    $hasColumn = $result && $result->num_rows > 0;
    return $hasColumn;
}

$hasPremiosConfig = site_config_has_premios_config($conn);

/**
 * Detect whether the hoteles_config column exists.
 * Keeps endpoint backward-compatible until the schema migration runs.
 */
function site_config_has_hoteles_config($conn) {
    static $hasColumn = null;
    if ($hasColumn !== null) return $hasColumn;
    $result = $conn->query("SHOW COLUMNS FROM site_config LIKE 'hoteles_config'");
    $hasColumn = $result && $result->num_rows > 0;
    return $hasColumn;
}

$hasHotelesConfig = site_config_has_hoteles_config($conn);

/**
 * Detect whether the theme_config column exists.
 * Keeps endpoint backward-compatible if the schema has not been migrated yet.
 */
function site_config_has_theme_config($conn) {
    static $hasColumn = null;
    if ($hasColumn !== null) return $hasColumn;
    $result = $conn->query("SHOW COLUMNS FROM site_config LIKE 'theme_config'");
    $hasColumn = $result && $result->num_rows > 0;
    return $hasColumn;
}

$hasThemeConfig = site_config_has_theme_config($conn);

/**
 * Detect whether the stats_config column exists.
 * Stores per-domain overrides for the home Stats ribbon (numbers shown
 * to users). Missing column => endpoint silently returns null so the
 * frontend always falls back to auto-computed values.
 */
function site_config_has_stats_config($conn) {
    static $hasColumn = null;
    if ($hasColumn !== null) return $hasColumn;
    $result = $conn->query("SHOW COLUMNS FROM site_config LIKE 'stats_config'");
    $hasColumn = $result && $result->num_rows > 0;
    return $hasColumn;
}

$hasStatsConfig = site_config_has_stats_config($conn);

/**
 * Detect whether the popup_config column exists.
 * Stores the site-wide POP UP overlay configuration (active image URL,
 * which routes it shows on, auto-dismiss duration, and rendered width).
 * Missing column => endpoint silently returns null so the frontend
 * disables the overlay until the schema is migrated.
 */
function site_config_has_popup_config($conn) {
    static $hasColumn = null;
    if ($hasColumn !== null) return $hasColumn;
    $result = $conn->query("SHOW COLUMNS FROM site_config LIKE 'popup_config'");
    $hasColumn = $result && $result->num_rows > 0;
    return $hasColumn;
}

$hasPopupConfig = site_config_has_popup_config($conn);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Return full config for current domain
    $selectFields = 'torneoid, menu_order, visibility, menu_groups, page_group_assignments';
    if ($hasLiveScoringConfig) {
        $selectFields .= ', live_scoring_config';
    }
    if ($hasSponsorsConfig) {
        $selectFields .= ', sponsors_config';
    }
    if ($hasEventosConfig) {
        $selectFields .= ', eventos_config';
    }
    if ($hasAvisosConfig) {
        $selectFields .= ', avisos_config';
    }
    if ($hasPremiosConfig) {
        $selectFields .= ', premios_config';
    }
    if ($hasHotelesConfig) {
        $selectFields .= ', hoteles_config';
    }
    if ($hasThemeConfig) {
        $selectFields .= ', theme_config';
    }
    if ($hasStatsConfig) {
        $selectFields .= ', stats_config';
    }
    if ($hasPopupConfig) {
        $selectFields .= ', popup_config';
    }

    $sql = "SELECT $selectFields FROM site_config WHERE domain = '$domain' LIMIT 1";
    $row = query_one($conn, $sql);
    
    if ($row) {
        json_response([
            'domain'                => $_SERVER['HTTP_HOST'],
            'torneoid'              => (int)$row['torneoid'],
            'menu_order'            => $row['menu_order'] ? json_decode($row['menu_order'], true) : null,
            'visibility'            => $row['visibility'] ? json_decode($row['visibility'], true) : null,
            'menu_groups'           => $row['menu_groups'] ? json_decode($row['menu_groups'], true) : null,
            'page_group_assignments'=> $row['page_group_assignments'] ? json_decode($row['page_group_assignments'], true) : null,
            'live_scoring_config'   => $hasLiveScoringConfig && !empty($row['live_scoring_config']) ? json_decode($row['live_scoring_config'], true) : null,
            'sponsors_config'       => $hasSponsorsConfig && !empty($row['sponsors_config']) ? json_decode($row['sponsors_config'], true) : null,
            'eventos_config'        => $hasEventosConfig && !empty($row['eventos_config']) ? json_decode($row['eventos_config'], true) : null,
            'avisos_config'         => $hasAvisosConfig && !empty($row['avisos_config']) ? json_decode($row['avisos_config'], true) : null,
            'premios_config'        => $hasPremiosConfig && !empty($row['premios_config']) ? json_decode($row['premios_config'], true) : null,
            'hoteles_config'        => $hasHotelesConfig && !empty($row['hoteles_config']) ? json_decode($row['hoteles_config'], true) : null,
            'theme_config'          => $hasThemeConfig && !empty($row['theme_config']) ? json_decode($row['theme_config'], true) : null,
            'stats_config'          => $hasStatsConfig && !empty($row['stats_config']) ? json_decode($row['stats_config'], true) : null,
            'popup_config'          => $hasPopupConfig && !empty($row['popup_config']) ? json_decode($row['popup_config'], true) : null,
        ]);
    } else {
        json_response([
            'domain'                => $_SERVER['HTTP_HOST'],
            'torneoid'              => null,
            'menu_order'            => null,
            'visibility'            => null,
            'menu_groups'           => null,
            'page_group_assignments'=> null,
            'live_scoring_config'   => null,
            'sponsors_config'       => null,
            'eventos_config'        => null,
            'avisos_config'         => null,
            'premios_config'        => null,
            'hoteles_config'        => null,
            'theme_config'          => null,
            'stats_config'          => null,
            'popup_config'          => null,
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read JSON body
    $body = json_decode(file_get_contents('php://input'), true);
    
    if (!$body) {
        json_error('Invalid JSON body', 400);
    }
    
    // Superadmin password check (separate from staff `usuarios`).
    $password = $body['password'] ?? '';
    if (!is_superadmin_password($conn, $password)) {
        json_error('Unauthorized', 401);
    }
    
    // Build dynamic UPDATE fields from provided data
    $fields = [];
    $insertFields = ['domain'];
    $insertValues = ["'$domain'"];
    
    if (isset($body['torneoid'])) {
        $tid = (int)$body['torneoid'];
        $fields[] = "torneoid = $tid";
        $insertFields[] = 'torneoid';
        $insertValues[] = $tid;
    }
    
    if (array_key_exists('menu_order', $body)) {
        $val = $body['menu_order'] !== null ? "'" . esc($conn, json_encode($body['menu_order'])) . "'" : 'NULL';
        $fields[] = "menu_order = $val";
        $insertFields[] = 'menu_order';
        $insertValues[] = $val;
    }
    
    if (array_key_exists('visibility', $body)) {
        $val = $body['visibility'] !== null ? "'" . esc($conn, json_encode($body['visibility'])) . "'" : 'NULL';
        $fields[] = "visibility = $val";
        $insertFields[] = 'visibility';
        $insertValues[] = $val;
    }
    
    if (array_key_exists('menu_groups', $body)) {
        $val = $body['menu_groups'] !== null ? "'" . esc($conn, json_encode($body['menu_groups'])) . "'" : 'NULL';
        $fields[] = "menu_groups = $val";
        $insertFields[] = 'menu_groups';
        $insertValues[] = $val;
    }
    
    if (array_key_exists('page_group_assignments', $body)) {
        $val = $body['page_group_assignments'] !== null ? "'" . esc($conn, json_encode($body['page_group_assignments'])) . "'" : 'NULL';
        $fields[] = "page_group_assignments = $val";
        $insertFields[] = 'page_group_assignments';
        $insertValues[] = $val;
    }
    
    if (array_key_exists('live_scoring_config', $body)) {
        if (!$hasLiveScoringConfig) {
            json_error("Missing DB column live_scoring_config in site_config. Run: ALTER TABLE site_config ADD COLUMN live_scoring_config TEXT DEFAULT NULL COMMENT 'JSON object with live scoring page settings';", 500);
        }

        $val = $body['live_scoring_config'] !== null ? "'" . esc($conn, json_encode($body['live_scoring_config'])) . "'" : 'NULL';
        $fields[] = "live_scoring_config = $val";
        $insertFields[] = 'live_scoring_config';
        $insertValues[] = $val;
    }

    if (array_key_exists('sponsors_config', $body)) {
        if (!$hasSponsorsConfig) {
            json_error("Missing DB column sponsors_config in site_config. Run: ALTER TABLE site_config ADD COLUMN sponsors_config TEXT DEFAULT NULL COMMENT 'JSON object with sponsors page display settings';", 500);
        }

        $val = $body['sponsors_config'] !== null ? "'" . esc($conn, json_encode($body['sponsors_config'])) . "'" : 'NULL';
        $fields[] = "sponsors_config = $val";
        $insertFields[] = 'sponsors_config';
        $insertValues[] = $val;
    }

    if (array_key_exists('eventos_config', $body)) {
        if (!$hasEventosConfig) {
            json_error("Missing DB column eventos_config in site_config. Run: ALTER TABLE site_config ADD COLUMN eventos_config TEXT DEFAULT NULL COMMENT 'JSON object with eventos page display settings';", 500);
        }

        $val = $body['eventos_config'] !== null ? "'" . esc($conn, json_encode($body['eventos_config'])) . "'" : 'NULL';
        $fields[] = "eventos_config = $val";
        $insertFields[] = 'eventos_config';
        $insertValues[] = $val;
    }

    if (array_key_exists('avisos_config', $body)) {
        if (!$hasAvisosConfig) {
            json_error("Missing DB column avisos_config in site_config. Run: ALTER TABLE site_config ADD COLUMN avisos_config TEXT DEFAULT NULL COMMENT 'JSON object with avisos page display settings';", 500);
        }

        $val = $body['avisos_config'] !== null ? "'" . esc($conn, json_encode($body['avisos_config'])) . "'" : 'NULL';
        $fields[] = "avisos_config = $val";
        $insertFields[] = 'avisos_config';
        $insertValues[] = $val;
    }

    if (array_key_exists('premios_config', $body)) {
        if (!$hasPremiosConfig) {
            json_error("Missing DB column premios_config in site_config. Run: ALTER TABLE site_config ADD COLUMN premios_config TEXT DEFAULT NULL COMMENT 'JSON object with premios page display settings';", 500);
        }

        $val = $body['premios_config'] !== null ? "'" . esc($conn, json_encode($body['premios_config'])) . "'" : 'NULL';
        $fields[] = "premios_config = $val";
        $insertFields[] = 'premios_config';
        $insertValues[] = $val;
    }

    if (array_key_exists('hoteles_config', $body)) {
        if (!$hasHotelesConfig) {
            json_error("Missing DB column hoteles_config in site_config. Run: ALTER TABLE site_config ADD COLUMN hoteles_config TEXT DEFAULT NULL COMMENT 'JSON object with hoteles page display settings';", 500);
        }

        $val = $body['hoteles_config'] !== null ? "'" . esc($conn, json_encode($body['hoteles_config'])) . "'" : 'NULL';
        $fields[] = "hoteles_config = $val";
        $insertFields[] = 'hoteles_config';
        $insertValues[] = $val;
    }

    if (array_key_exists('theme_config', $body)) {
        if (!$hasThemeConfig) {
            json_error("Missing DB column theme_config in site_config. Run: ALTER TABLE site_config ADD COLUMN theme_config TEXT DEFAULT NULL COMMENT 'JSON object with the active color palette';", 500);
        }
        $val = $body['theme_config'] !== null ? "'" . esc($conn, json_encode($body['theme_config'])) . "'" : 'NULL';
        $fields[] = "theme_config = $val";
        $insertFields[] = 'theme_config';
        $insertValues[] = $val;
    }

    if (array_key_exists('stats_config', $body)) {
        if (!$hasStatsConfig) {
            json_error("Missing DB column stats_config in site_config. Run: ALTER TABLE site_config ADD COLUMN stats_config TEXT DEFAULT NULL COMMENT 'JSON object overriding home stats ribbon values';", 500);
        }
        $val = $body['stats_config'] !== null ? "'" . esc($conn, json_encode($body['stats_config'])) . "'" : 'NULL';
        $fields[] = "stats_config = $val";
        $insertFields[] = 'stats_config';
        $insertValues[] = $val;
    }

    if (array_key_exists('popup_config', $body)) {
        if (!$hasPopupConfig) {
            json_error("Missing DB column popup_config in site_config. Run: ALTER TABLE site_config ADD COLUMN popup_config TEXT DEFAULT NULL COMMENT 'JSON object with site-wide popup overlay settings';", 500);
        }
        $val = $body['popup_config'] !== null ? "'" . esc($conn, json_encode($body['popup_config'])) . "'" : 'NULL';
        $fields[] = "popup_config = $val";
        $insertFields[] = 'popup_config';
        $insertValues[] = $val;
    }
    
    if (empty($fields)) {
        json_error('No fields to update', 400);
    }
    
    // Ensure torneoid has a default for INSERT
    if (!isset($body['torneoid'])) {
        $insertFields[] = 'torneoid';
        $insertValues[] = 0;
    }
    
    $updateClause = implode(', ', $fields);
    $insertFieldsStr = implode(', ', $insertFields);
    $insertValuesStr = implode(', ', $insertValues);
    
    $sql = "INSERT INTO site_config ($insertFieldsStr) 
            VALUES ($insertValuesStr)
            ON DUPLICATE KEY UPDATE $updateClause";
    
    if (!$conn->query($sql)) {
        json_error('Failed to save config: ' . $conn->error);
    }
    
    json_response([
        'domain' => $_SERVER['HTTP_HOST'],
        'saved'  => true,
    ]);
} else {
    json_error('Method not allowed', 405);
}
