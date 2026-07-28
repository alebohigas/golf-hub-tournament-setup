<?php
/**
 * API Configuration
 * Shared database connection and JSON response helpers
 * All API wrappers require this file
 */

// ============= CORS Headers =============
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// ============= PHP Error Output Guard =============
// API endpoints must never emit PHP warning/fatal HTML around JSON responses.
// Errors are handled by json_error() or logged server-side instead.
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
mysqli_report(MYSQLI_REPORT_OFF);

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ============= Database Configuration =============
// Credentials are loaded from /api/credentials.php (gitignored in production).
// As a production-safe fallback, the same values can be supplied by environment
// variables; this avoids ever reading credentials.example.php at runtime.
$credentialsFile = __DIR__ . '/credentials.php';
if (file_exists($credentialsFile)) {
    require_once $credentialsFile;
} else {
    $DB_HOST = getenv('DB_HOST') ?: null;
    $DB_USER = getenv('DB_USER') ?: null;
    $DB_PASS = getenv('DB_PASS') ?: null;
    $DB_NAME = getenv('DB_NAME') ?: null;
    $DB_PORT = (int)(getenv('DB_PORT') ?: 3306);
}

if (empty($DB_HOST) || empty($DB_USER) || empty($DB_NAME)) {
    http_response_code(500);
    echo json_encode(['error' => 'Missing /api/credentials.php on this production domain']);
    exit;
}

// ============= Logos Base URL =============
// Proxied through logo.php to avoid cross-origin/ad-blocker issues
$LOGOS_BASE_URL = '/api/logo.php?file=';

// ============= Database Connection =============
$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$conn->set_charset('utf8');

// ============= Debug Mode =============
/** Check if debug mode is enabled via ?debug=1 query param */
$DEBUG_MODE = isset($_GET['debug']) && $_GET['debug'] === '1';

/** Collected SQL queries for debug output */
$DEBUG_QUERIES = [];

/** Track latest SQL query executed (for error diagnostics) */
$LAST_SQL = null;

/**
 * Log a SQL query for debug output
 * @param string $label - Description of the query
 * @param string $sql - The SQL query string
 */
function debug_log_query($label, $sql) {
    global $DEBUG_MODE, $DEBUG_QUERIES, $LAST_SQL;
    // Keep latest SQL for failure context regardless of mode
    $LAST_SQL = $sql;

    // Keep full query log only in debug mode
    if ($DEBUG_MODE) {
        $DEBUG_QUERIES[] = ['label' => $label, 'sql' => $sql];
    }
}

/**
 * Build standardized debug context payload
 * @param array $extra Optional extra debug values
 * @return array Debug context information
 */
function debug_context($extra = []) {
    global $DEBUG_QUERIES, $LAST_SQL;
    return array_merge([
        'query_count' => count($DEBUG_QUERIES),
        'queries' => $DEBUG_QUERIES,
        'last_sql' => $LAST_SQL,
        'request_uri' => $_SERVER['REQUEST_URI'] ?? ''
    ], $extra);
}

// ============= Helper Functions =============

/**
 * Send JSON response and exit
 * @param mixed $data - Data to encode as JSON
 * @param int $status - HTTP status code (default 200)
 */
function json_response($data, $status = 200) {
    global $DEBUG_MODE, $DEBUG_QUERIES;
    http_response_code($status);
    $jsonOptions = JSON_UNESCAPED_UNICODE | (defined('JSON_INVALID_UTF8_SUBSTITUTE') ? JSON_INVALID_UTF8_SUBSTITUTE : 0);
    // In debug mode, wrap response with query info
    if ($DEBUG_MODE) {
        $encoded = json_encode([
            '_debug_queries' => $DEBUG_QUERIES,
            '_debug_query_count' => count($DEBUG_QUERIES),
            'data' => $data
        ], $jsonOptions | JSON_PRETTY_PRINT);
    } else {
        $encoded = json_encode($data, $jsonOptions);
    }

    if ($encoded === false) {
        http_response_code(500);
        echo '{"error":"JSON encoding failed"}';
    } else {
        echo $encoded;
    }
    exit;
}

/**
 * Send error JSON response and exit
 * @param string $message - Error message
 * @param int $status - HTTP status code (default 500)
 * @param array $extraDebug Optional extra debug values
 */
function json_error($message, $status = 500, $extraDebug = []) {
    global $DEBUG_MODE;
    http_response_code($status);
    $jsonOptions = JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | (defined('JSON_INVALID_UTF8_SUBSTITUTE') ? JSON_INVALID_UTF8_SUBSTITUTE : 0);

    $payload = ['error' => $message];
    if ($DEBUG_MODE) {
        $payload['_debug'] = debug_context($extraDebug);
    }

    echo json_encode($payload, $jsonOptions);
    exit;
}

/**
 * Get required GET parameter or return error
 * @param string $name - Parameter name
 * @return string - Parameter value
 */
function require_param($name) {
    if (!isset($_GET[$name]) || $_GET[$name] === '') {
        json_error("Missing required parameter: $name", 400);
    }
    return $_GET[$name];
}

/**
 * Get optional GET parameter with default
 * @param string $name - Parameter name
 * @param mixed $default - Default value
 * @return mixed - Parameter value or default
 */
function optional_param($name, $default = null) {
    return isset($_GET[$name]) && $_GET[$name] !== '' ? $_GET[$name] : $default;
}

/**
 * Execute query and return all rows as associative array
 * @param mysqli $conn - Database connection
 * @param string $sql - SQL query
 * @return array - Result rows
 */
function query_all($conn, $sql) {
    debug_log_query('query_all', $sql);
    $result = $conn->query($sql);
    if (!$result) {
        json_error('Query failed: ' . $conn->error, 500, ['failed_sql' => $sql]);
    }
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    $result->free();
    return $rows;
}

/**
 * Execute query and return single row
 * @param mysqli $conn - Database connection
 * @param string $sql - SQL query
 * @return array|null - Single row or null
 */
function query_one($conn, $sql) {
    debug_log_query('query_one', $sql);
    $result = $conn->query($sql);
    if (!$result) {
        json_error('Query failed: ' . $conn->error, 500, ['failed_sql' => $sql]);
    }
    $row = $result->fetch_assoc();
    $result->free();
    return $row;
}

/**
 * Escape string for SQL query
 * @param mysqli $conn - Database connection
 * @param string $value - Value to escape
 * @return string - Escaped value
 */
function esc($conn, $value) {
    return $conn->real_escape_string($value);
}

// ============= Superadmin Password Helpers =============
// Reutilizamos la tabla `usuarios` existente. El superadmin se guarda como un
// row reservado con usuario='__superadmin__' y tipo=100 usando la columna
// `pwd` (la misma que el resto). NO se crea ninguna tabla nueva.

const SUPERADMIN_DEFAULT_PASSWORD = 'admin2025';
const SUPERADMIN_USER_KEY = '__superadmin__';
const SUPERADMIN_TIPO = 100;

/** Lee el hash del superadmin desde `usuarios`, o null si no existe. */
function superadmin_password_hash_from_db($conn) {
    static $hash = false;
    if ($hash !== false) return $hash;
    $hash = null;
    $key = SUPERADMIN_USER_KEY;
    $r = @$conn->query("SELECT pwd FROM usuarios WHERE usuario='$key' LIMIT 1");
    if ($r && $r->num_rows > 0) {
        $row = $r->fetch_assoc();
        $hash = !empty($row['pwd']) ? $row['pwd'] : null;
    }
    if ($r) $r->free();
    return $hash;
}

/**
 * superadmin_password_candidates
 * ------------------------------------------------------------------
 * Builds the ordered list of possible superadmin password values for the
 * current request. This lets legacy admin screens that still send the old
 * `admin2025` body value be rescued by the current password sent in the
 * `X-Superadmin-Password` header by the frontend compatibility layer.
 */
function superadmin_password_candidates($password) {
    $candidates = [];
    $add = function ($value) use (&$candidates) {
        $value = (string)$value;
        if ($value !== '' && !in_array($value, $candidates, true)) {
            $candidates[] = $value;
        }
    };

    $add($password);
    if (!empty($_SERVER['HTTP_X_SUPERADMIN_PASSWORD'])) {
        $add($_SERVER['HTTP_X_SUPERADMIN_PASSWORD']);
    }
    if (!empty($_POST['password'])) {
        $add($_POST['password']);
    }
    if (!empty($_GET['password'])) {
        $add($_GET['password']);
    }

    return $candidates;
}

/** Valida una contraseña candidata del superadmin contra DB/env/fallback. */
function superadmin_password_matches($conn, $password) {
    global $SUPERADMIN_PASSWORD, $SUPERADMIN_PASSWORD_HASH;
    $password = (string)$password;
    if ($password === '') return false;

    $dbHash = superadmin_password_hash_from_db($conn);
    if ($dbHash && password_verify($password, $dbHash)) return true;

    if (!empty($SUPERADMIN_PASSWORD_HASH) && password_verify($password, $SUPERADMIN_PASSWORD_HASH)) return true;
    if (!empty($SUPERADMIN_PASSWORD) && hash_equals((string)$SUPERADMIN_PASSWORD, $password)) return true;

    // Fallback histórico mientras no exista un hash configurado.
    if (!$dbHash && empty($SUPERADMIN_PASSWORD_HASH) && empty($SUPERADMIN_PASSWORD)) {
        return hash_equals(SUPERADMIN_DEFAULT_PASSWORD, $password);
    }
    return false;
}

/** Valida la contraseña del superadmin (sin usuario). */
function is_superadmin_password($conn, $password) {
    foreach (superadmin_password_candidates($password) as $candidate) {
        if (superadmin_password_matches($conn, $candidate)) return true;
    }
    return false;
}

/** Persiste un nuevo hash del superadmin en `usuarios` (upsert). */
function set_superadmin_password_hash($conn, $hash) {
    $key = SUPERADMIN_USER_KEY;
    $tipo = SUPERADMIN_TIPO;
    $h = esc($conn, $hash);
    $sql = "INSERT INTO usuarios (usuario, pwd, tipo, activo)
              VALUES ('$key', '$h', $tipo, 1)
              ON DUPLICATE KEY UPDATE pwd=VALUES(pwd), tipo=VALUES(tipo), activo=1";
    if (!$conn->query($sql)) json_error('No se pudo guardar la contraseña: ' . $conn->error, 500);
}
