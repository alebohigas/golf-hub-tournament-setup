<?php
/**
 * Site Config Endpoint
 * GET  /api/site_config.php          - Returns torneoid for current domain
 * POST /api/site_config.php          - Saves torneoid for current domain (admin)
 * 
 * Uses `site_config` table: domain VARCHAR(255) PK, torneoid INT, updated_at TIMESTAMP
 * 
 * CREATE TABLE IF NOT EXISTS site_config (
 *   domain VARCHAR(255) NOT NULL PRIMARY KEY,
 *   torneoid INT NOT NULL,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 */
require_once 'config.php';

// Allow POST for saving config
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// Get the current domain from Host header
$domain = $_SERVER['HTTP_HOST'] ?? 'localhost';
$domain = esc($conn, $domain);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Return config for current domain
    $sql = "SELECT torneoid FROM site_config WHERE domain = '$domain' LIMIT 1";
    $row = query_one($conn, $sql);
    
    if ($row) {
        json_response([
            'domain'   => $_SERVER['HTTP_HOST'],
            'torneoid' => (int)$row['torneoid'],
        ]);
    } else {
        // No config for this domain yet
        json_response([
            'domain'   => $_SERVER['HTTP_HOST'],
            'torneoid' => null,
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read JSON body
    $body = json_decode(file_get_contents('php://input'), true);
    
    if (!$body || !isset($body['torneoid'])) {
        json_error('Missing torneoid in request body', 400);
    }
    
    // Simple admin password check
    $password = $body['password'] ?? '';
    if ($password !== 'admin2025') {
        json_error('Unauthorized', 401);
    }
    
    $tid = (int)$body['torneoid'];
    
    // Upsert: INSERT ON DUPLICATE KEY UPDATE
    $sql = "INSERT INTO site_config (domain, torneoid) 
            VALUES ('$domain', $tid)
            ON DUPLICATE KEY UPDATE torneoid = $tid";
    
    if (!$conn->query($sql)) {
        json_error('Failed to save config: ' . $conn->error);
    }
    
    json_response([
        'domain'   => $_SERVER['HTTP_HOST'],
        'torneoid' => $tid,
        'saved'    => true,
    ]);
} else {
    json_error('Method not allowed', 405);
}
