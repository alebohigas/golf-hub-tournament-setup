<?php
/**
 * sheet_live_captura.php — ALIEN SYSTEM → SHEET LIVE → Captura
 * -----------------------------------------------------------------------------
 * App de captura por estación: escribe SÓLO el golpe (SO) de un hoyo en la
 * tarjeta del jugador (`tarjetas.h1..h18`). El sistema Alien recalcula
 * score ajustado, puntos y totales; aquí no se tocan.
 *
 * GET  ?torneoid=N&grupo=SALIDAGRUPOID[&staff_token|password]
 *   → { players: [ { id, name, tarjetaid, holes: { "1": 4|null, ... } } ] }
 * POST { torneoid, grupo, tarjetaid, hoyo (1-18), golpes (1-20 | null), password|staff_token }
 *   → { ok: true, tarjetaid, hoyo, golpes }
 *
 * Acceso: superadmin o staff con el área `alien_captura` del mismo torneo.
 */
require_once 'config.php';
require_once '_staff_auth.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$body = $method === 'POST' ? (json_decode(file_get_contents('php://input'), true) ?: []) : [];

/** Credenciales: body en POST, querystring o cabecera de rescate en GET. */
$authBody = $body;
if (!isset($authBody['password'])) {
    $authBody['password'] = $_GET['password'] ?? ($_SERVER['HTTP_X_SUPERADMIN_PASSWORD'] ?? '');
}
$staff = assert_admin_or_area($conn, $authBody, 'alien_captura');

$torneoid = (int)($body['torneoid'] ?? ($_GET['torneoid'] ?? 0));
$grupo    = (int)($body['grupo'] ?? ($_GET['grupo'] ?? 0));
if ($torneoid <= 0 || $grupo <= 0) json_error('Faltan torneoid o grupo', 400);
/** El staff sólo puede capturar en su propio torneo. */
if ($staff && (int)$staff['torneoid'] !== $torneoid) json_error('Unauthorized', 401);

// ============= GET: jugadores del grupo con sus golpes actuales =============
if ($method === 'GET') {
    $rows = query_all($conn, "SELECT s.jugadorid, CONCAT(s.nombre, ' ', s.apellido) AS jugador, s.tarjetaid,
                                     t.h1,t.h2,t.h3,t.h4,t.h5,t.h6,t.h7,t.h8,t.h9,
                                     t.h10,t.h11,t.h12,t.h13,t.h14,t.h15,t.h16,t.h17,t.h18
                                FROM v_sal_jug s
                                JOIN tarjetas t ON t.id = s.tarjetaid
                               WHERE s.salidagrupoid = $grupo
                               ORDER BY s.tarjetaid");
    $players = [];
    foreach ($rows as $r) {
        $holes = [];
        for ($h = 1; $h <= 18; $h++) {
            $v = $r["h$h"];
            $holes[(string)$h] = ($v === null || (int)$v === 0) ? null : (int)$v;
        }
        $players[] = [
            'id'        => (string)$r['jugadorid'],
            'name'      => trim($r['jugador']),
            'tarjetaid' => (string)$r['tarjetaid'],
            'holes'     => $holes,
        ];
    }
    json_response(['players' => $players]);
}

// ============= POST: guardar el golpe de un hoyo =============
$tarjetaid = (int)($body['tarjetaid'] ?? 0);
$hoyo      = (int)($body['hoyo'] ?? 0);
$golpesRaw = $body['golpes'] ?? null;
if ($tarjetaid <= 0 || $hoyo < 1 || $hoyo > 18) json_error('Datos inválidos', 400);
$golpes = ($golpesRaw === null || $golpesRaw === '') ? null : (int)$golpesRaw;
if ($golpes !== null && ($golpes < 1 || $golpes > 20)) json_error('Golpes fuera de rango (1-20)', 400);

/** La tarjeta debe pertenecer al grupo indicado. */
$own = query_one($conn, "SELECT tarjetaid FROM v_sal_jug WHERE tarjetaid = $tarjetaid AND salidagrupoid = $grupo LIMIT 1");
if (!$own) json_error('La tarjeta no pertenece al grupo', 403);

$val = $golpes === null ? 'NULL' : (string)$golpes;
$ok = $conn->query("UPDATE tarjetas SET h$hoyo = $val, fec_ult_act = NOW() WHERE id = $tarjetaid");
if (!$ok) { error_log('sheet_live_captura: ' . $conn->error); json_error('No se pudo guardar', 500); }

json_response(['ok' => true, 'tarjetaid' => (string)$tarjetaid, 'hoyo' => $hoyo, 'golpes' => $golpes]);
