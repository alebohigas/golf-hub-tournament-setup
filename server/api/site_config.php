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
    // Return full config for current domain
    $sql = "SELECT torneoid, menu_order, visibility, menu_groups, page_group_assignments, live_scoring_config 
            FROM site_config WHERE domain = '$domain' LIMIT 1";
    $row = query_one($conn, $sql);
    
    if ($row) {
        json_response([
            'domain'                => $_SERVER['HTTP_HOST'],
            'torneoid'              => (int)$row['torneoid'],
            'menu_order'            => $row['menu_order'] ? json_decode($row['menu_order'], true) : null,
            'visibility'            => $row['visibility'] ? json_decode($row['visibility'], true) : null,
            'menu_groups'           => $row['menu_groups'] ? json_decode($row['menu_groups'], true) : null,
            'page_group_assignments'=> $row['page_group_assignments'] ? json_decode($row['page_group_assignments'], true) : null,
        ]);
    } else {
        json_response([
            'domain'                => $_SERVER['HTTP_HOST'],
            'torneoid'              => null,
            'menu_order'            => null,
            'visibility'            => null,
            'menu_groups'           => null,
            'page_group_assignments'=> null,
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read JSON body
    $body = json_decode(file_get_contents('php://input'), true);
    
    if (!$body) {
        json_error('Invalid JSON body', 400);
    }
    
    // Simple admin password check
    $password = $body['password'] ?? '';
    if ($password !== 'admin2025') {
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
