<?php
/**
 * Registro Preferente Endpoint
 * -----------------------------------------------------------------------
 * GET  /api/registro_preferente.php?torneoid=NNN
 *      → Devuelve la config del registro preferente para el torneo:
 *        {
 *          fecha_inicio, fecha_fin, same_range,
 *          clubs: [{ id, nombre, fecha_inicio, fecha_fin }],
 *          active_now: true|false,      // ventana global vigente hoy
 *          allowed_club_ids: [1,7,...]  // clubes autorizados HOY (ventana vigente)
 *        }
 *
 * POST /api/registro_preferente.php   (JSON body — admin)
 *      { torneoid, fecha_inicio, fecha_fin, same_range, clubs:[{clubid,fecha_inicio,fecha_fin}], password }
 *      → Guarda config global y reemplaza la lista de clubes autorizados
 *        en `clubs_registro` para ese torneo.
 *
 * Backed by:
 *   - `registro_preferente_config` (torneoid PK, fecha_inicio, fecha_fin, same_range)
 *   - `clubs_registro` (id, torneoid, clubid, fecha_inicio NULL, fecha_fin NULL)
 *
 * Requiere superadmin password o staff con área `preregistros`.
 */
require_once 'config.php';
require_once '_staff_auth.php';

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

/** Ensure the preferente config table exists (defensive, in case the
 *  migration hasn't been run on this environment yet). */
function ensure_preferente_table($conn) {
    $conn->query("CREATE TABLE IF NOT EXISTS `registro_preferente_config` (
        `torneoid` INT(11) NOT NULL PRIMARY KEY,
        `fecha_inicio` DATE NULL DEFAULT NULL,
        `fecha_fin`    DATE NULL DEFAULT NULL,
        `same_range` TINYINT(1) NOT NULL DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

/** Ensure the per-club date columns exist in clubs_registro. */
function ensure_clubs_registro_dates($conn) {
    // MySQL <8 no soporta IF NOT EXISTS en ADD COLUMN; probamos y silenciamos.
    @ $conn->query("ALTER TABLE `clubs_registro` ADD COLUMN `fecha_inicio` DATE NULL DEFAULT NULL");
    @ $conn->query("ALTER TABLE `clubs_registro` ADD COLUMN `fecha_fin`    DATE NULL DEFAULT NULL");
}

/** Read config + clubs list. Also computes active_now / allowed_club_ids. */
function preferente_read($conn, $torneoid) {
    ensure_preferente_table($conn);
    ensure_clubs_registro_dates($conn);

    $cfg = [
        'fecha_inicio' => null,
        'fecha_fin'    => null,
        'same_range'   => 1,
    ];
    $r = $conn->query("SELECT fecha_inicio, fecha_fin, same_range
                       FROM registro_preferente_config
                       WHERE torneoid = $torneoid LIMIT 1");
    if ($r && $row = $r->fetch_assoc()) {
        $cfg['fecha_inicio'] = $row['fecha_inicio'];
        $cfg['fecha_fin']    = $row['fecha_fin'];
        $cfg['same_range']   = (int)$row['same_range'];
    }
    if ($r) $r->free();

    $clubs = [];
    $sql = "SELECT cr.clubid, cr.fecha_inicio, cr.fecha_fin, c.nombre
            FROM clubs_registro cr
            INNER JOIN clubs c ON c.id = cr.clubid
            WHERE cr.torneoid = $torneoid
            ORDER BY c.nombre ASC";
    $res = $conn->query($sql);
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $clubs[] = [
                'id'           => (int)$row['clubid'],
                'nombre'       => (string)$row['nombre'],
                'fecha_inicio' => $row['fecha_inicio'],
                'fecha_fin'    => $row['fecha_fin'],
            ];
        }
        $res->free();
    }

    // Compute active_now / allowed_club_ids using server "today" (Y-m-d).
    $today = date('Y-m-d');
    $sameRange = (int)$cfg['same_range'] === 1;
    $activeGlobal = false;
    if ($cfg['fecha_inicio'] && $cfg['fecha_fin']) {
        $activeGlobal = ($today >= $cfg['fecha_inicio'] && $today <= $cfg['fecha_fin']);
    }
    $allowed = [];
    $anyClubActive = false;
    foreach ($clubs as $c) {
        $ok = false;
        if ($sameRange) {
            $ok = $activeGlobal;
        } else {
            if ($c['fecha_inicio'] && $c['fecha_fin']) {
                $ok = ($today >= $c['fecha_inicio'] && $today <= $c['fecha_fin']);
            }
        }
        if ($ok) { $allowed[] = (int)$c['id']; $anyClubActive = true; }
    }

    return [
        'fecha_inicio'     => $cfg['fecha_inicio'],
        'fecha_fin'        => $cfg['fecha_fin'],
        'same_range'       => $sameRange ? 1 : 0,
        'clubs'            => $clubs,
        'active_now'       => $sameRange ? $activeGlobal : $anyClubActive,
        'allowed_club_ids' => $allowed,
        'server_today'     => $today,
    ];
}

$torneoid = (int) optional_param('torneoid', 0);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($torneoid <= 0) json_response([
        'fecha_inicio' => null, 'fecha_fin' => null, 'same_range' => 1,
        'clubs' => [], 'active_now' => false, 'allowed_club_ids' => [],
    ]);
    json_response(preferente_read($conn, $torneoid));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) json_error('Invalid JSON body', 400);

    $password = $body['password'] ?? '';
    if (!is_superadmin_password($conn, $password)) {
        $staff = staff_check_area($conn, $body, 'preregistros');
        if (!$staff) json_error('Unauthorized', 401);
    }

    $torneoid = isset($body['torneoid']) ? (int)$body['torneoid'] : 0;
    if ($torneoid <= 0) json_error('Missing torneoid', 400);

    ensure_preferente_table($conn);
    ensure_clubs_registro_dates($conn);

    // ---- Save global config ----
    $fi = isset($body['fecha_inicio']) && $body['fecha_inicio'] ? esc($conn, $body['fecha_inicio']) : null;
    $ff = isset($body['fecha_fin'])    && $body['fecha_fin']    ? esc($conn, $body['fecha_fin'])    : null;
    $sr = !empty($body['same_range']) ? 1 : 0;
    $fiSql = $fi ? "'$fi'" : 'NULL';
    $ffSql = $ff ? "'$ff'" : 'NULL';
    $conn->query("INSERT INTO registro_preferente_config (torneoid, fecha_inicio, fecha_fin, same_range)
                  VALUES ($torneoid, $fiSql, $ffSql, $sr)
                  ON DUPLICATE KEY UPDATE fecha_inicio=VALUES(fecha_inicio),
                                          fecha_fin=VALUES(fecha_fin),
                                          same_range=VALUES(same_range)");

    // ---- Replace authorized clubs list ----
    $clubs = isset($body['clubs']) && is_array($body['clubs']) ? $body['clubs'] : [];
    $conn->query("DELETE FROM clubs_registro WHERE torneoid = $torneoid");
    $inserted = 0;
    foreach ($clubs as $c) {
        $cid = (int)($c['clubid'] ?? $c['id'] ?? 0);
        if ($cid <= 0) continue;
        $cfi = isset($c['fecha_inicio']) && $c['fecha_inicio'] ? "'" . esc($conn, $c['fecha_inicio']) . "'" : 'NULL';
        $cff = isset($c['fecha_fin'])    && $c['fecha_fin']    ? "'" . esc($conn, $c['fecha_fin'])    . "'" : 'NULL';
        if ($conn->query("INSERT INTO clubs_registro (torneoid, clubid, fecha_inicio, fecha_fin)
                          VALUES ($torneoid, $cid, $cfi, $cff)")) $inserted++;
    }

    json_response(['saved' => true, 'clubs' => $inserted, 'config' => preferente_read($conn, $torneoid)]);
}

json_error('Method not allowed', 405);