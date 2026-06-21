<?php
/**
 * Banderas (Pin Sheet) Endpoint
 * -----------------------------------------------------------------------
 * GET  /api/banderas.php?torneoid=XXX
 *      → { holes: [{ hole, depth, pinFromFront, pinFromSide, pinSide, slope, title }] }
 *      Si la tabla no existe o no hay filas, devuelve `holes: []`.
 *
 * POST /api/banderas.php
 *      Body JSON: { password, torneoid, holes: [...] }
 *      Replace-all para el torneo. Sólo guarda filas con `hoyo` > 0.
 *
 * Tabla: `banderas` (migración 2026_06_21).
 */
require_once 'config.php';

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

/** ¿Existe la tabla? Cacheado. */
function banderas_table_exists($conn) {
    static $exists = null;
    if ($exists !== null) return $exists;
    $r = $conn->query("SHOW TABLES LIKE 'banderas'");
    $exists = $r && $r->num_rows > 0;
    return $exists;
}

/** Normaliza fila de BD a JSON consumido por el cliente. */
function normalize_bandera($r) {
    return [
        'hole'         => (int)$r['hoyo'],
        'depth'        => (int)$r['depth'],
        'pinFromFront' => (int)$r['frente'],
        'pinFromSide'  => (int)$r['lateral'],
        'pinSide'      => $r['lateral_lado'] === 'R' ? 'R' : 'L',
        'slope'        => (int)$r['desde_centro'],
        'title'        => $r['titulo'] ?? null,
    ];
}

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $torneoid = (int) require_param('torneoid');

    if (!banderas_table_exists($conn)) {
        json_response(['holes' => [], 'source' => 'no_table']);
    }

    $sql = "SELECT hoyo, depth, frente, lateral, lateral_lado, desde_centro, titulo
              FROM banderas
             WHERE torneo_id = $torneoid
             ORDER BY hoyo ASC";
    $rows = array_map('normalize_bandera', query_all($conn, $sql));
    json_response(['holes' => $rows]);
}

// ---------------------------------------------------------------------------
// POST — admin replace-all
// ---------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) json_error('Invalid JSON body', 400);

    $password = $body['password'] ?? '';
    if ($password !== 'admin2025') json_error('Unauthorized', 401);

    $torneoid = isset($body['torneoid']) ? (int)$body['torneoid'] : 0;
    if ($torneoid <= 0) json_error('Missing torneoid', 400);

    if (!banderas_table_exists($conn)) {
        json_error('Tabla banderas no existe. Corre la migración 2026_06_21_banderas.sql.', 500);
    }

    $holes = $body['holes'] ?? [];
    if (!is_array($holes)) json_error('holes must be an array', 400);

    $conn->query("DELETE FROM banderas WHERE torneo_id = $torneoid");

    $count = 0;
    foreach ($holes as $h) {
        $hole = (int)($h['hole'] ?? 0);
        if ($hole <= 0) continue;
        $depth        = (int)($h['depth'] ?? 0);
        $frente       = (int)($h['pinFromFront'] ?? 0);
        $lateral      = (int)($h['pinFromSide'] ?? 0);
        $side         = (($h['pinSide'] ?? 'L') === 'R') ? 'R' : 'L';
        $desdeCentro  = (int)($h['slope'] ?? 0);
        $titulo       = $h['title'] ?? null;
        $tituloSql    = ($titulo === null || $titulo === '')
            ? 'NULL'
            : "'" . esc($conn, (string)$titulo) . "'";

        $sql = "INSERT INTO banderas
                  (torneo_id, hoyo, depth, frente, lateral, lateral_lado,
                   desde_centro, titulo)
                VALUES
                  ($torneoid, $hole, $depth, $frente, $lateral, '$side',
                   $desdeCentro, $tituloSql)";
        if ($conn->query($sql)) $count++;
    }
    json_response(['saved' => true, 'count' => $count]);
}

json_error('Method not allowed', 405);
