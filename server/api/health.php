<?php
/**
 * Health Check Endpoint
 * GET /api/health.php
 * Returns server status and timestamp
 */
require_once 'config.php';

json_response([
    'status' => 'ok',
    'timestamp' => date('c'),
    'database' => $conn->ping() ? 'connected' : 'disconnected'
]);
