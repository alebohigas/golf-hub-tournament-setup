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

// ============= Helper Functions =============

/**
 * Send JSON response and exit
 * @param mixed $data - Data to encode as JSON
 * @param int $status - HTTP status code (default 200)
 */
function json_response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Send error JSON response and exit
 * @param string $message - Error message
 * @param int $status - HTTP status code (default 500)
 */
function json_error($message, $status = 500) {
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
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
    $result = $conn->query($sql);
    if (!$result) {
        json_error('Query failed: ' . $conn->error);
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
    $result = $conn->query($sql);
    if (!$result) {
        json_error('Query failed: ' . $conn->error);
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
