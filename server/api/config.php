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
// Credentials loaded from separate file (not tracked in git)
$credentialsFile = __DIR__ . '/credentials.php';
if (!file_exists($credentialsFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Missing credentials.php - copy credentials.example.php and fill in your values']);
    exit;
}
require_once $credentialsFile;

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
