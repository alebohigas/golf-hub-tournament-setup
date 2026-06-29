<?php
/**
 * Match Play Admin Endpoint
 * POST /api/matchplay_admin.php?action=set_winner
 * POST /api/matchplay_admin.php?action=reset_match
 *
 * Permite al admin marcar ganador o resetear un match de la tabla
 * `eliminacion_directa`. La propagación entre rondas / D2 la hace la
 * herramienta legacy externa (fuera de este endpoint).
 *
 * Auth: superadmin password en body.password ó staff con área `brackets`.
 */
require_once 'config.php';
require_once '_staff_auth.php';

header('Access-Control-Allow-Methods: POST, OPTIONS');

/** Lee body JSON. */
function read_body_json() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $d = json_decode($raw, true);
    return is_array($d) ? $d : [];
}

/** Auth: superadmin password ó staff área brackets. Aborta con 401 si falla. */
function require_brackets_auth($conn, $body) {
    if (isset($body['password']) && is_superadmin_password($conn, $body['password'])) return;
    if (staff_check_area($conn, $body, 'brackets')) return;
    json_error('Unauthorized — admin password required', 401);
}

$action = $_GET['action'] ?? '';
$body   = read_body_json();

require_brackets_auth($conn, $body);

$torneoid = (int)($body['torneoid'] ?? 0);
if ($torneoid <= 0) json_error('torneoid required', 400);

if ($action === 'set_winner') {
    $matchid  = (int)($body['matchid'] ?? 0);
    $ganador  = (int)($body['ganador'] ?? 0); // jugadorid del ganador
    $hoyo     = isset($body['hoyo']) && $body['hoyo'] !== '' ? (int)$body['hoyo'] : null;
    $resultado= isset($body['resultado']) ? trim((string)$body['resultado']) : '';
    if ($matchid <= 0 || $ganador <= 0) json_error('matchid y ganador requeridos', 400);

    // Verifica que el match pertenezca al torneo + que el ganador sea uno de los dos jugadores.
    $row = query_one($conn, "SELECT id, jugadorid1, jugadorid2
                             FROM eliminacion_directa
                             WHERE id = $matchid AND torneoid = $torneoid LIMIT 1");
    if (!$row) json_error('Match no encontrado', 404);
    if ((int)$row['jugadorid1'] !== $ganador && (int)$row['jugadorid2'] !== $ganador) {
        json_error('El ganador no coincide con los jugadores del match', 400);
    }

    $resEsc = esc($conn, $resultado);
    $hoyoSql = $hoyo === null ? 'NULL' : (int)$hoyo;
    $sql = "UPDATE eliminacion_directa
            SET gano = $ganador,
                hoyo = $hoyoSql,
                resultado = '$resEsc'
            WHERE id = $matchid AND torneoid = $torneoid";
    if (!$conn->query($sql)) json_error('Update failed: ' . $conn->error, 500);
    json_response(['ok' => true, 'matchid' => $matchid, 'ganador' => $ganador]);
}

if ($action === 'reset_match') {
    $matchid = (int)($body['matchid'] ?? 0);
    if ($matchid <= 0) json_error('matchid requerido', 400);
    $sql = "UPDATE eliminacion_directa
            SET gano = NULL, hoyo = NULL, resultado = NULL
            WHERE id = $matchid AND torneoid = $torneoid";
    if (!$conn->query($sql)) json_error('Reset failed: ' . $conn->error, 500);
    json_response(['ok' => true, 'matchid' => $matchid]);
}

json_error('Unknown action', 400);