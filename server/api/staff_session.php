<?php
/**
 * staff_session.php — Valida un token activo y devuelve perfil.
 *
 * GET ?staff_token=...
 *   → { ok:true, usuario, nombre, areas, torneoid, expira } | 401
 *
 * POST { action: 'logout', staff_token }
 *   → { ok:true }
 */
require_once 'config.php';
require_once '_staff_auth.php';

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

$body = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?: [];
    if (($body['action'] ?? '') === 'logout') {
        $tok = staff_extract_token($body);
        if ($tok && preg_match('/^[a-f0-9]+$/i', $tok)) {
            $te = esc($conn, $tok);
            $conn->query("DELETE FROM usuario_sesion WHERE token = '$te'");
        }
        json_response(['ok' => true]);
    }
}

$info = staff_validate_token($conn, staff_extract_token($body));
if (!$info) json_error('Invalid session', 401);
json_response(['ok' => true] + $info);