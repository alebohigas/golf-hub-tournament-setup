<?php
/**
 * Brackets Endpoint — Putt Finales (Caballero / Dama)
 * ----------------------------------------------------------------------------
 * Maneja dos brackets fijos por torneo, sembrados desde el ranking acumulado
 * de putt a lo largo del torneo:
 *
 *   prize_table = 'putt_finales', prize_id = 1, sexo = 'M' → Caballero
 *   prize_table = 'putt_finales', prize_id = 2, sexo = 'F' → Dama
 *
 * Tablas requeridas (ya existen): bracket_config, bracket_matches.
 * Columnas nuevas en bracket_config (ver migrations/2026_05_18_putt_finales_brackets.sql):
 *   - sexo CHAR(1) NULL
 *   - size INT NOT NULL DEFAULT 16
 *   - visible TINYINT(1) NOT NULL DEFAULT 0
 *
 * Ruteo (acción por ?action=):
 *   GET  ?torneoid=X&action=get_putt_finales       (público)
 *        → { M: {config, matches, visible}, F: {...} }
 *   GET  ?torneoid=X&action=get_putt_admin         (admin)
 *        → mismo shape, además incluye candidate count por sexo
 *   POST ?action=save_putt_config                  (admin)
 *        body: { torneoid, sexo, size, visible, password }
 *   POST ?action=generate_putt                     (admin)
 *        body: { torneoid, sexo, password }
 *        Regenera bracket_matches sembrando con ranking acumulado por sexo.
 *   POST ?action=record_score                      (admin)
 *        body: { match_id, player1_score, player2_score, password }
 *        Captura scores; ganador = mayor score; avanza al next_match_id.
 *   POST ?action=set_winner                        (admin)
 *        body: { match_id, winner_id, password }
 *        Override manual (ej. walkover / corrección).
 */

require_once 'config.php';

// ============= CORS — permitimos POST =============
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// ============= Constantes =============
/** Tamaños de bracket permitidos (potencias de 2). */
$ALLOWED_SIZES = [8, 16, 32, 64, 128];
/** Contraseña admin — alineada con el resto del panel. */
$ADMIN_PASSWORD = 'admin2025';
/** Identificador convencional del par de brackets putt-finales. */
$PUTT_PRIZE_TABLE = 'putt_finales';

// ============= Helpers =============

/** Lee body JSON del POST. */
function read_json_body() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $d = json_decode($raw, true);
    return is_array($d) ? $d : [];
}

/** Verifica password admin en body; falla con 401. */
function require_admin($body) {
    global $ADMIN_PASSWORD;
    if (!isset($body['password']) || $body['password'] !== $ADMIN_PASSWORD) {
        json_error('Unauthorized — admin password required', 401);
    }
}

/** Normaliza sexo a 'M' o 'F'; falla si distinto. */
function require_sexo($val) {
    $s = strtoupper((string)$val);
    if ($s !== 'M' && $s !== 'F') {
        json_error("Invalid sexo '$val' — debe ser 'M' o 'F'", 400);
    }
    return $s;
}

/** prize_id convencional según sexo (1=M, 2=F). */
function prize_id_for_sexo($sexo) {
    return $sexo === 'M' ? 1 : 2;
}

/** Query single-row seguro (logea, no muere). */
function safe_one($conn, $sql) {
    $r = $conn->query($sql);
    if (!$r) { error_log('brackets.php query failed: ' . $conn->error . ' | SQL: ' . $sql); return null; }
    $row = $r->fetch_assoc();
    $r->free();
    return $row;
}

/** Query all rows seguro. */
function safe_all($conn, $sql) {
    $r = $conn->query($sql);
    if (!$r) { error_log('brackets.php query failed: ' . $conn->error . ' | SQL: ' . $sql); return []; }
    $out = [];
    while ($row = $r->fetch_assoc()) $out[] = $row;
    $r->free();
    return $out;
}

/**
 * Construye el orden estándar 1-vs-N de seeds para un bracket de $size.
 * Devuelve array de pares [seedA, seedB] para round 1 (1vsN, 8vs9, etc.).
 */
function build_seed_pairs($size) {
    $order = [1, 2];
    while (count($order) < $size) {
        $newOrder = [];
        $sum = count($order) * 2 + 1;
        foreach ($order as $s) {
            $newOrder[] = $s;
            $newOrder[] = $sum - $s;
        }
        $order = $newOrder;
    }
    $pairs = [];
    for ($i = 0; $i < count($order); $i += 2) {
        $pairs[] = [$order[$i], $order[$i + 1]];
    }
    return $pairs;
}

// ============= Ranking acumulado de putt (sembrado) =============
/**
 * Replica la lógica de `listado_ganadores_put-2.php` corrigiendo el bug del
 * filtro por sexo: filtra correctamente DENTRO de cada subquery del UNION.
 *
 * Para cada premio (PREMIO) del torneo, toma las HOYO mejores distancias
 * de v_puttjug filtradas por sexo del jugador, luego ordena el agregado
 * por distancia ASC y ultact ASC, y limita a $limit (tamaño del bracket).
 *
 * Devuelve filas con: jugadorid, jugador, categoria, distancia, ultact.
 */
function collect_putt_ranking($conn, $torneoid, $sexo, $limit) {
    $tid    = (int)$torneoid;
    $sx     = esc($conn, $sexo);

    // Lista distinct PREMIO + HOYO de la tabla putt (sólo premios del sexo
    // correspondiente — se hace JOIN con categorias.sexo igual que el legacy).
    $sqlPrizes = "SELECT DISTINCT a.PREMIO, a.HOYO
                  FROM putt a
                  JOIN categorias b ON a.categoriaid = b.categoria_id
                  WHERE a.torneoid = $tid AND b.SEXO = '$sx'";
    $prizes = safe_all($conn, $sqlPrizes);
    if (empty($prizes)) return [];

    // UNION ALL de las HOYO mejores por premio, con filtro extra por sexo
    // del jugador (JOIN jugadores) para que NO se cuelen del otro sexo.
    $unionParts = [];
    foreach ($prizes as $p) {
        $premio = (int)$p['PREMIO'];
        $hoyo   = (int)$p['HOYO'];
        if ($hoyo <= 0) continue;
        $unionParts[] = "(SELECT vp.id, vp.campo, vp.hoyo, vp.premio, vp.fecha,
                                 vp.jugador, vp.categoria, vp.distancia,
                                 vp.jugadorid, vp.torneoid, vp.descripcion, vp.ultact
                          FROM v_puttjug vp
                          JOIN jugadores j ON j.id = vp.jugadorid
                          WHERE vp.torneoid = $tid
                            AND vp.premio   = $premio
                            AND j.sexo      = '$sx'
                          ORDER BY vp.distancia ASC
                          LIMIT $hoyo)";
    }
    if (empty($unionParts)) return [];

    $lim = (int)$limit;
    $sqlAgg = "SELECT * FROM (" . implode(' UNION ALL ', $unionParts) . ") AS z
               ORDER BY z.distancia ASC, z.ultact ASC
               LIMIT $lim";
    return safe_all($conn, $sqlAgg);
}

// ============= Acción: get_putt_finales (público) =============
/**
 * Devuelve la configuración + matches actuales para ambos brackets (M/F).
 * Sólo se incluye `visible=1` cuando el público debe verlo — el front decide
 * si mostrar o no en /competicion según ese flag.
 */
function action_get_putt_finales($conn, $torneoid) {
    global $PUTT_PRIZE_TABLE;
    $tid = (int)$torneoid;
    $out = ['M' => null, 'F' => null];
    foreach (['M' => 1, 'F' => 2] as $sx => $pid) {
        $cfg = safe_one($conn,
            "SELECT *, bracket_size AS size FROM bracket_config
             WHERE torneoid = $tid AND prize_table = '$PUTT_PRIZE_TABLE' AND prize_id = $pid LIMIT 1");
        $matches = [];
        if ($cfg) {
            $cfgId = (int)$cfg['id'];
            $matches = safe_all($conn,
                "SELECT m.*,
                        m.player_high_id  AS player1_id,
                        m.player_low_id   AS player2_id,
                        m.seed_high       AS player1_seed,
                        m.seed_low        AS player2_seed,
                        m.score_high      AS player1_score,
                        m.score_low       AS player2_score,
                        m.winner_player_id AS winner_id,
                        m.round_num       AS round,
                        m.match_num       AS position,
                        CONCAT(j1.nombre,' ',j1.apellido) AS player1_name,
                        CONCAT(j2.nombre,' ',j2.apellido) AS player2_name
                 FROM bracket_matches m
                 LEFT JOIN jugadores j1 ON j1.id = m.player_high_id
                 LEFT JOIN jugadores j2 ON j2.id = m.player_low_id
                 WHERE m.bracket_id = $cfgId
                 ORDER BY m.round_num ASC, m.match_num ASC");
        }
        $out[$sx] = [
            'config'  => $cfg,
            'matches' => $matches,
            'visible' => $cfg ? (int)$cfg['visible'] === 1 : false,
        ];
    }
    json_response($out);
}

// ============= Acción: get_putt_admin (admin) =============
/**
 * Igual que get_putt_finales pero agrega `candidates_count` por sexo —
 * cuántos jugadores únicos podrían entrar al bracket según el ranking actual.
 * Útil para que el admin elija el tamaño correcto antes de generar.
 */
function action_get_putt_admin($conn, $torneoid) {
    global $PUTT_PRIZE_TABLE;
    $tid = (int)$torneoid;
    $out = ['M' => null, 'F' => null];
    foreach (['M' => 1, 'F' => 2] as $sx => $pid) {
        $cfg = safe_one($conn,
            "SELECT *, bracket_size AS size FROM bracket_config
             WHERE torneoid = $tid AND prize_table = '$PUTT_PRIZE_TABLE' AND prize_id = $pid LIMIT 1");
        $matches = [];
        if ($cfg) {
            $cfgId = (int)$cfg['id'];
            $matches = safe_all($conn,
                "SELECT m.*,
                        m.player_high_id  AS player1_id,
                        m.player_low_id   AS player2_id,
                        m.seed_high       AS player1_seed,
                        m.seed_low        AS player2_seed,
                        m.score_high      AS player1_score,
                        m.score_low       AS player2_score,
                        m.winner_player_id AS winner_id,
                        m.round_num       AS round,
                        m.match_num       AS position,
                        CONCAT(j1.nombre,' ',j1.apellido) AS player1_name,
                        CONCAT(j2.nombre,' ',j2.apellido) AS player2_name
                 FROM bracket_matches m
                 LEFT JOIN jugadores j1 ON j1.id = m.player_high_id
                 LEFT JOIN jugadores j2 ON j2.id = m.player_low_id
                 WHERE m.bracket_id = $cfgId
                 ORDER BY m.round_num ASC, m.match_num ASC");
        }
        // Conteo de candidatos potenciales (límite alto para ver el universo).
        $ranking = collect_putt_ranking($conn, $tid, $sx, 9999);
        $out[$sx] = [
            'config'           => $cfg,
            'matches'          => $matches,
            'visible'          => $cfg ? (int)$cfg['visible'] === 1 : false,
            'candidates_count' => count($ranking),
        ];
    }
    json_response($out);
}

// ============= Acción: save_putt_config (admin) =============
/**
 * Upsert de la fila bracket_config para un bracket (M o F).
 * Body: { torneoid, sexo, size, visible, password }.
 * NO regenera matches — sólo guarda configuración y visibilidad.
 */
function action_save_putt_config($conn, $body) {
    global $ALLOWED_SIZES, $PUTT_PRIZE_TABLE;
    require_admin($body);
    $tid     = (int)($body['torneoid'] ?? 0);
    if ($tid <= 0) json_error('Invalid torneoid', 400);
    $sexo    = require_sexo($body['sexo'] ?? '');
    $size    = (int)($body['size'] ?? 0);
    if (!in_array($size, $ALLOWED_SIZES, true)) {
        json_error('Invalid size; allowed: ' . implode(',', $ALLOWED_SIZES), 400);
    }
    $visible = !empty($body['visible']) ? 1 : 0;
    $pid     = prize_id_for_sexo($sexo);

    // Upsert por unique key (torneoid, prize_table, prize_id).
    // NOTE: La tabla legacy `bracket_config` usa `bracket_size` (no `size`)
    // y el ENUM de status es ('pending','seeded','in_progress','completed').
    $sql = "INSERT INTO bracket_config
              (torneoid, prize_table, prize_id, sexo, bracket_size,
               seed_source, status, visible, created_at, updated_at)
            VALUES
              ($tid, '$PUTT_PRIZE_TABLE', $pid, '$sexo', $size,
               'standings', 'pending', $visible, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
               sexo = VALUES(sexo),
               bracket_size = VALUES(bracket_size),
               visible = VALUES(visible),
               updated_at = NOW()";
    if (!$conn->query($sql)) {
        json_error('Save config failed: ' . $conn->error, 500);
    }

    $saved = safe_one($conn,
        "SELECT *, bracket_size AS size FROM bracket_config
         WHERE torneoid = $tid AND prize_table = '$PUTT_PRIZE_TABLE' AND prize_id = $pid LIMIT 1");
    json_response(['config' => $saved]);
}

// ============= Acción: generate_putt (admin) =============
/**
 * Regenera bracket_matches para un sexo: tira los matches anteriores,
 * recolecta ranking acumulado de putt (sembrado), crea la estructura
 * completa de partidos vinculados por next_match_id y siembra el round 1.
 */
function action_generate_putt($conn, $body) {
    global $PUTT_PRIZE_TABLE;
    require_admin($body);
    $tid  = (int)($body['torneoid'] ?? 0);
    if ($tid <= 0) json_error('Invalid torneoid', 400);
    $sexo = require_sexo($body['sexo'] ?? '');
    $pid  = prize_id_for_sexo($sexo);

    $cfg = safe_one($conn,
        "SELECT *, bracket_size AS size FROM bracket_config
         WHERE torneoid = $tid AND prize_table = '$PUTT_PRIZE_TABLE' AND prize_id = $pid LIMIT 1");
    if (!$cfg) json_error('Configura primero el tamaño del bracket antes de generar.', 404);

    $cfgId = (int)$cfg['id'];
    $size  = (int)$cfg['bracket_size'];

    // 1) Recolectar ranking sembrado (jugadorid en orden 1..size).
    $ranking = collect_putt_ranking($conn, $tid, $sexo, $size);
    $players = array_slice($ranking, 0, $size);
    while (count($players) < $size) {
        // Padding con BYE (jugadorid = null) para tamaños sin suficientes inscritos.
        $players[] = ['jugadorid' => null];
    }

    // 2) Wipe matches anteriores.
    $conn->query("DELETE FROM bracket_matches WHERE bracket_id = $cfgId");

    // 3) Crear matches por ronda (final primero para poder linkear next_match_id).
    $totalRounds = (int)log($size, 2);
    $matchIds = []; // [round][position] => id
    for ($round = $totalRounds; $round >= 1; $round--) {
        $matchesInRound = (int)pow(2, $totalRounds - $round);
        for ($pos = 1; $pos <= $matchesInRound; $pos++) {
            $nextId   = 'NULL';
            $nextSlot = 'NULL';
            if ($round < $totalRounds) {
                $parentPos  = (int)ceil($pos / 2);
                // slot enum en bracket_matches: 'high' | 'low'
                $parentSlot = (($pos - 1) % 2) === 0 ? "'high'" : "'low'";
                $nextId   = (int)$matchIds[$round + 1][$parentPos];
                $nextSlot = $parentSlot;
            }
            $sql = "INSERT INTO bracket_matches
                      (bracket_id, round_num, match_num, next_match_id, next_slot, status, updated_at)
                    VALUES ($cfgId, $round, $pos, $nextId, $nextSlot, 'pending', NOW())";
            if (!$conn->query($sql)) {
                json_error('Insert match failed: ' . $conn->error, 500);
            }
            $matchIds[$round][$pos] = $conn->insert_id;
        }
    }

    // 4) Poblar round 1 con seeds (1vsN, etc.) + auto-avance de BYEs.
    $pairs = build_seed_pairs($size);
    foreach ($pairs as $i => $pair) {
        $pos = $i + 1;
        $matchId = (int)$matchIds[1][$pos];
        $p1 = $players[$pair[0] - 1]['jugadorid'] ?? null;
        $p2 = $players[$pair[1] - 1]['jugadorid'] ?? null;
        $p1Sql = $p1 !== null ? (int)$p1 : 'NULL';
        $p2Sql = $p2 !== null ? (int)$p2 : 'NULL';
        $s1 = (int)$pair[0];
        $s2 = (int)$pair[1];
        $conn->query("UPDATE bracket_matches
                      SET player_high_id = $p1Sql, player_low_id = $p2Sql,
                          seed_high = $s1, seed_low = $s2, updated_at = NOW()
                      WHERE id = $matchId");
        // BYE: avanzar al jugador presente
        if ($p1 !== null && $p2 === null)      advance_winner($conn, $matchId, (int)$p1);
        elseif ($p2 !== null && $p1 === null)  advance_winner($conn, $matchId, (int)$p2);
    }

    $conn->query("UPDATE bracket_config SET status = 'seeded', updated_at = NOW() WHERE id = $cfgId");

    json_response([
        'ok'             => true,
        'config_id'      => $cfgId,
        'rounds'         => $totalRounds,
        'players_seeded' => count(array_filter($players, fn($p) => $p['jugadorid'] !== null)),
        'size'           => $size,
    ]);
}

// ============= Avance automático de ganador =============
/**
 * Marca ganador en $matchId y lo coloca en el slot correspondiente del
 * match padre (next_match_id / next_slot). NO recursa: si el padre
 * también queda completo, el siguiente record_score lo avanzará.
 */
function advance_winner($conn, $matchId, $winnerId) {
    $mid = (int)$matchId;
    $wid = (int)$winnerId;
    $conn->query("UPDATE bracket_matches
                  SET winner_player_id = $wid, status = 'completed', updated_at = NOW()
                  WHERE id = $mid");
    $row = safe_one($conn, "SELECT next_match_id, next_slot FROM bracket_matches WHERE id = $mid");
    if (!$row || $row['next_match_id'] === null) return;
    $nextId  = (int)$row['next_match_id'];
    // next_slot es ENUM 'high'|'low' -> mapea a la columna del player correspondiente
    $slotCol = ($row['next_slot'] === 'high') ? 'player_high_id' : 'player_low_id';
    $conn->query("UPDATE bracket_matches SET $slotCol = $wid, updated_at = NOW() WHERE id = $nextId");
}

// ============= Acción: record_score (admin) =============
/**
 * Captura scores del match. Si ambos scores presentes y distintos, marca al
 * mayor como ganador (semántica match-play "holes won") y lo avanza al
 * siguiente round automáticamente.
 */
function action_record_score($conn, $body) {
    require_admin($body);
    $matchId = (int)($body['match_id'] ?? 0);
    if ($matchId <= 0) json_error('Invalid match_id', 400);
    $s1 = isset($body['player1_score']) && $body['player1_score'] !== '' ? (int)$body['player1_score'] : null;
    $s2 = isset($body['player2_score']) && $body['player2_score'] !== '' ? (int)$body['player2_score'] : null;
    $s1Sql = $s1 !== null ? (int)$s1 : 'NULL';
    $s2Sql = $s2 !== null ? (int)$s2 : 'NULL';

    $conn->query("UPDATE bracket_matches
                  SET score_high = $s1Sql, score_low = $s2Sql, updated_at = NOW()
                  WHERE id = $matchId");

    $m = safe_one($conn, "SELECT * FROM bracket_matches WHERE id = $matchId");
    if (!$m) json_error('Match not found', 404);

    if ($s1 !== null && $s2 !== null && $s1 !== $s2) {
        $winner = $s1 > $s2 ? (int)$m['player_high_id'] : (int)$m['player_low_id'];
        if ($winner > 0) advance_winner($conn, $matchId, $winner);
    }
    json_response(['ok' => true]);
}

// ============= Acción: set_winner (admin, override manual) =============
/**
 * Sobreescribe el ganador del match sin tocar scores. Útil para walkovers,
 * descalificaciones o correcciones manuales del admin.
 */
function action_set_winner($conn, $body) {
    require_admin($body);
    $matchId  = (int)($body['match_id']  ?? 0);
    $winnerId = (int)($body['winner_id'] ?? 0);
    if ($matchId <= 0 || $winnerId <= 0) json_error('Invalid match_id or winner_id', 400);
    $m = safe_one($conn, "SELECT player_high_id, player_low_id FROM bracket_matches WHERE id = $matchId");
    if (!$m) json_error('Match not found', 404);
    if ((int)$m['player_high_id'] !== $winnerId && (int)$m['player_low_id'] !== $winnerId) {
        json_error('winner_id no corresponde a player1 ni player2 de este match', 400);
    }
    advance_winner($conn, $matchId, $winnerId);
    json_response(['ok' => true]);
}

// ============= Router =============
$method = $_SERVER['REQUEST_METHOD'];
$action = optional_param('action', '');

if ($method === 'GET') {
    $torneoid = require_param('torneoid');
    if ($action === 'get_putt_finales')      action_get_putt_finales($conn, $torneoid);
    elseif ($action === 'get_putt_admin')    action_get_putt_admin($conn, $torneoid);
    else json_error("Unknown GET action '$action'. Try get_putt_finales | get_putt_admin.", 400);
} elseif ($method === 'POST') {
    $body = read_json_body();
    if     ($action === 'save_putt_config') action_save_putt_config($conn, $body);
    elseif ($action === 'generate_putt')    action_generate_putt($conn, $body);
    elseif ($action === 'record_score')     action_record_score($conn, $body);
    elseif ($action === 'set_winner')       action_set_winner($conn, $body);
    else json_error("Unknown POST action '$action'.", 400);
} else {
    json_error('Method not allowed', 405);
}