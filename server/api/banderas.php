<?php
/**
 * Banderas (Pin Sheet) Endpoint
 * -----------------------------------------------------------------------
 *  GET  /api/banderas.php?torneoid=XXX
 *       → { round: { round_label, round_date }, holes: [ ...18 rows ] }
 *
 *  POST /api/banderas.php
 *       Body: {
 *         password,
 *         torneoid,
 *         round: { round_label?, round_date? },
 *         holes: [
 *           { hole_number, depth, pin_from_front, pin_from_side,
 *             pin_side ('L'|'R'), center_offset }
 *         ]
 *       }
 *       → Replace-all para el torneo activo. Cualquier hoyo no incluido
 *         se elimina; los enviados se hacen INSERT ... ON DUPLICATE KEY
 *         UPDATE para conservar la PK (torneo_id, hole_number).
 *
 * Tablas: banderas_pin_sheet, banderas_round
 * Migración: 2026_06_21_banderas_pin_sheet.sql
 */
require_once 'config.php';

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

/** Cache: ¿la tabla principal existe? Permite operar antes de que el
 *  admin corra la migración sin reventar la página pública. */
function banderas_table_exists($conn) {
    static $exists = null;
    if ($exists !== null) return $exists;
    $r = $conn->query("SHOW TABLES LIKE 'banderas_pin_sheet'");
    $exists = $r && $r->num_rows > 0;
    return $exists;
}

/** Cache: ¿la tabla de metadatos existe? */
function round_table_exists($conn) {
    static $exists = null;
    if ($exists !== null) return $exists;
    $r = $conn->query("SHOW TABLES LIKE 'banderas_round'");
    $exists = $r && $r->num_rows > 0;
    return $exists;
}

/** Normaliza fila DB → forma JSON consumida por el frontend. */
function normalize_hole($r) {
    return [
        'hole_number'    => (int)$r['hole_number'],
        'depth'          => (int)$r['depth'],
        'pin_from_front' => (int)$r['pin_from_front'],
        'pin_from_side'  => (int)$r['pin_from_side'],
        'pin_side'       => $r['pin_side'] === 'R' ? 'R' : 'L',
        'center_offset'  => (int)$r['center_offset'],
    ];
}

// ===========================================================================
// GET — listar todos los hoyos + metadata del round
// ===========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $torneoid = (int) require_param('torneoid');

    // Si la migración aún no ha corrido, devolvemos shape vacío en vez
    // de 500 — la página pública muestra el mensaje de disculpa y el
    // admin sabrá que tiene que ejecutar la migración.
    if (!banderas_table_exists($conn)) {
        json_response(['round' => null, 'holes' => [], 'source' => 'no_table']);
    }

    $rowsRaw = query_all(
        $conn,
        "SELECT hole_number, depth, pin_from_front, pin_from_side,
                pin_side, center_offset
           FROM banderas_pin_sheet
          WHERE torneo_id = $torneoid
          ORDER BY hole_number ASC"
    );
    $holes = array_map('normalize_hole', $rowsRaw);

    $round = null;
    if (round_table_exists($conn)) {
        $r = query_one(
            $conn,
            "SELECT round_label, round_date
               FROM banderas_round
              WHERE torneo_id = $torneoid
              LIMIT 1"
        );
        if ($r) {
            $round = [
                'round_label' => $r['round_label'],
                'round_date'  => $r['round_date'],
            ];
        }
    }

    json_response(['round' => $round, 'holes' => $holes]);
}

// ===========================================================================
// POST — admin replace-all
// ===========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) json_error('Invalid JSON body', 400);

    $password = $body['password'] ?? '';
    if ($password !== 'admin2025') json_error('Unauthorized', 401);

    $torneoid = isset($body['torneoid']) ? (int)$body['torneoid'] : 0;
    if ($torneoid <= 0) json_error('Missing torneoid', 400);

    if (!banderas_table_exists($conn)) {
        json_error(
            'Tabla banderas_pin_sheet no existe. Corre la migración 2026_06_21_banderas_pin_sheet.sql.',
            500
        );
    }

    $holes = $body['holes'] ?? [];
    if (!is_array($holes)) json_error('holes must be an array', 400);

    // Replace-all: borrar todo lo previo de este torneo y reinsertar.
    $conn->query("DELETE FROM banderas_pin_sheet WHERE torneo_id = $torneoid");

    $count = 0;
    foreach ($holes as $h) {
        $hole = isset($h['hole_number']) ? (int)$h['hole_number'] : 0;
        if ($hole < 1 || $hole > 18) continue; // skip filas inválidas
        $depth  = max(0, (int)($h['depth'] ?? 0));
        $front  = max(0, (int)($h['pin_from_front'] ?? 0));
        $side   = max(0, (int)($h['pin_from_side']  ?? 0));
        $sideLR = (isset($h['pin_side']) && $h['pin_side'] === 'R') ? 'R' : 'L';
        $offset = (int)($h['center_offset'] ?? 0);

        $sql = "INSERT INTO banderas_pin_sheet
                  (torneo_id, hole_number, depth, pin_from_front,
                   pin_from_side, pin_side, center_offset)
                VALUES
                  ($torneoid, $hole, $depth, $front, $side, '$sideLR', $offset)";
        if ($conn->query($sql)) $count++;
    }

    // Metadatos del round (label + date). Replace-all también — un torneo
    // tiene un solo "round" publicado a la vez.
    if (round_table_exists($conn) && isset($body['round']) && is_array($body['round'])) {
        $rl = isset($body['round']['round_label']) ? $body['round']['round_label'] : null;
        $rd = isset($body['round']['round_date'])  ? $body['round']['round_date']  : null;
        $rlSql = $rl === null || $rl === '' ? 'NULL' : "'" . esc($conn, (string)$rl) . "'";
        $rdSql = $rd === null || $rd === '' ? 'NULL' : "'" . esc($conn, (string)$rd) . "'";
        $conn->query(
            "INSERT INTO banderas_round (torneo_id, round_label, round_date)
             VALUES ($torneoid, $rlSql, $rdSql)
             ON DUPLICATE KEY UPDATE
               round_label = VALUES(round_label),
               round_date  = VALUES(round_date)"
        );
    }

    json_response(['saved' => true, 'count' => $count]);
}

json_error('Method not allowed', 405);