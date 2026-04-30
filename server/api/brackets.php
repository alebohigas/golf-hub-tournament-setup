<?php
/**
 * Brackets Endpoint — Match Play / Knockout
 * ----------------------------------------------------------------------------
 * Handles all bracket operations for prizes flagged with is_bracket=1
 * across the 6 prize tables: oyes, oyesx, approach, putt, driver, driverp.
 *
 * Schema dependencies (must be created via migration first):
 *   - oyes.is_bracket / oyesx.is_bracket / approach.is_bracket /
 *     putt.is_bracket / driver.is_bracket / driverp.is_bracket  TINYINT(1)
 *   - bracket_config(id, torneoid, prize_table, prize_id, size,
 *                    seed_source ENUM('standings','manual','random'),
 *                    advancement ENUM('manual','auto'),
 *                    seed_categoriaid, seed_premio, seed_hoyo, seed_campo,
 *                    advancement_source, status, created_at, updated_at)
 *   - bracket_matches(id, bracket_config_id, round, position,
 *                     player1_id, player2_id, player1_seed, player2_seed,
 *                     player1_score, player2_score, winner_id,
 *                     next_match_id, next_slot, status, updated_at)
 *
 * Routing — single endpoint, action determined by ?action=
 *   GET  ?torneoid=X&action=list_prizes
 *        → list every prize row in all 6 tables with is_bracket flag
 *   POST ?action=set_flag           body: prize_table, prize_id, is_bracket
 *   GET  ?action=get_config         params: torneoid, prize_table, prize_id
 *   POST ?action=save_config        body: full bracket_config payload
 *   POST ?action=generate           body: bracket_config_id (rebuilds matches)
 *   POST ?action=record_score       body: match_id, player1_score, player2_score
 *
 * All POST actions require admin password (matches site_config.php pattern).
 */

require_once 'config.php';

// ============= Allow POST in addition to GET =============
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// ============= Constants =============
/** Tables that can host bracket-flagged prizes (per user spec) */
$BRACKET_TABLES = ['oyes', 'oyesx', 'approach', 'putt', 'driver', 'driverp'];
/** Allowed bracket sizes (powers of 2, 4..128) */
$ALLOWED_SIZES = [4, 8, 16, 32, 64, 128];
/** Admin password — keep aligned with site_config.php */
$ADMIN_PASSWORD = 'admin2025';

// ============= Helper: validate prize table =============
/**
 * Throw 400 JSON error if the supplied table name is not whitelisted.
 * Defends against SQL injection via the dynamic table name.
 */
function validate_prize_table($table) {
    global $BRACKET_TABLES;
    if (!in_array($table, $BRACKET_TABLES, true)) {
        json_error("Invalid prize_table '$table'. Allowed: " . implode(',', $BRACKET_TABLES), 400);
    }
}

// ============= Helper: read JSON body =============
/**
 * Read POST JSON body into associative array. Returns empty array if missing.
 */
function read_json_body() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// ============= Helper: require admin =============
/**
 * Verify the password supplied in the JSON body matches the admin password.
 * Calls json_error() with 401 on mismatch.
 */
function require_admin($body) {
    global $ADMIN_PASSWORD;
    if (!isset($body['password']) || $body['password'] !== $ADMIN_PASSWORD) {
        json_error('Unauthorized — admin password required', 401);
    }
}

// ============= Standard 1-vs-N seed pairing =============
/**
 * Build the "standard tennis-style" seed pairing for a bracket of $size.
 * Returns an array of [seedA, seedB] pairs for round 1, ordered so that
 * the bracket folds onto itself correctly (1 plays N, 8 plays 9, etc.).
 *
 * Algorithm: start with [1,2], then for each doubling round, pair each
 * existing seed S with (newSize+1 - S) and interleave.
 */
function build_seed_pairs($size) {
    // Build full seed order list (left-to-right placement in the bracket)
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
    // Pair up consecutive seeds → round 1 matchups
    $pairs = [];
    for ($i = 0; $i < count($order); $i += 2) {
        $pairs[] = [$order[$i], $order[$i + 1]];
    }
    return $pairs;
}

// ============= Action: list_prizes =============
/**
 * Return every prize row in all 6 bracket-eligible tables for the given
 * torneoid, with the current is_bracket flag plus whether a bracket_config
 * already exists. The frontend admin uses this to show a master list with
 * a checkbox per row.
 *
 * Each row has shape:
 *   { prize_table, prize_id, descripcion, hoyo, categoriaid, premio,
 *     campo, is_bracket, has_config, config_id, size, status }
 *
 * Tables vary slightly in column names — query each separately and tolerate
 * missing columns (some tables may not have categoriaid/campo).
 */
function action_list_prizes($conn, $torneoid) {
    global $BRACKET_TABLES;
    $tid = esc($conn, $torneoid);
    $rows = [];

    foreach ($BRACKET_TABLES as $table) {
        // Discover column names so we don't blow up on tables that don't
        // share a perfectly identical schema.
        $colsRes = $conn->query("SHOW COLUMNS FROM `$table`");
        if (!$colsRes) {
            error_log("brackets.php list_prizes: SHOW COLUMNS failed for $table: " . $conn->error);
            continue;
        }
        $cols = [];
        while ($c = $colsRes->fetch_assoc()) { $cols[$c['Field']] = true; }
        $colsRes->free();

        // Skip tables where the migration hasn't been run yet
        if (!isset($cols['is_bracket'])) {
            error_log("brackets.php: $table missing is_bracket column — run migration");
            continue;
        }

        // Build SELECT defensively
        $selectParts = ['id', 'is_bracket'];
        $selectParts[] = isset($cols['descripcion'])  ? 'descripcion'  : "'' AS descripcion";
        $selectParts[] = isset($cols['hoyo'])         ? 'hoyo'         : 'NULL AS hoyo';
        $selectParts[] = isset($cols['categoriaid'])  ? 'categoriaid'  : 'NULL AS categoriaid';
        $selectParts[] = isset($cols['premio'])       ? 'premio'       : 'NULL AS premio';
        $selectParts[] = isset($cols['campo'])        ? 'campo'        : 'NULL AS campo';

        $sql = 'SELECT ' . implode(', ', $selectParts) . " FROM `$table` WHERE torneoid = $tid ORDER BY id ASC";
        $res = $conn->query($sql);
        if (!$res) {
            error_log("brackets.php list_prizes failed for $table: " . $conn->error);
            continue;
        }
        while ($r = $res->fetch_assoc()) {
            $rows[] = [
                'prize_table' => $table,
                'prize_id'    => (int)$r['id'],
                'descripcion' => $r['descripcion'] ?? '',
                'hoyo'        => $r['hoyo'] !== null ? (int)$r['hoyo'] : null,
                'categoriaid' => $r['categoriaid'] !== null ? (int)$r['categoriaid'] : null,
                'premio'      => $r['premio'] !== null ? (int)$r['premio'] : null,
                'campo'       => $r['campo'] !== null ? (int)$r['campo'] : null,
                'is_bracket'  => (int)$r['is_bracket'],
                'has_config'  => false,
                'config_id'   => null,
                'size'        => null,
                'status'      => null,
            ];
        }
        $res->free();
    }

    // Annotate with existing bracket_config rows
    $cfgRes = $conn->query("SELECT id, prize_table, prize_id, size, status
                            FROM bracket_config WHERE torneoid = $tid");
    if ($cfgRes) {
        $cfgMap = [];
        while ($c = $cfgRes->fetch_assoc()) {
            $cfgMap[$c['prize_table'] . ':' . $c['prize_id']] = $c;
        }
        $cfgRes->free();
        foreach ($rows as &$row) {
            $key = $row['prize_table'] . ':' . $row['prize_id'];
            if (isset($cfgMap[$key])) {
                $row['has_config'] = true;
                $row['config_id']  = (int)$cfgMap[$key]['id'];
                $row['size']       = (int)$cfgMap[$key]['size'];
                $row['status']     = $cfgMap[$key]['status'];
            }
        }
        unset($row);
    } else {
        error_log('brackets.php: bracket_config table missing or unreadable: ' . $conn->error);
    }

    json_response(['prizes' => $rows]);
}

// ============= Action: set_flag =============
/**
 * Toggle is_bracket on a single prize row. Body: { prize_table, prize_id,
 * is_bracket: 0|1, password }. When set to 0 we LEAVE bracket_config rows
 * intact (admin can clean them separately) so flipping back keeps history.
 */
function action_set_flag($conn, $body) {
    require_admin($body);
    $table = $body['prize_table'] ?? '';
    validate_prize_table($table);
    $id   = (int)($body['prize_id'] ?? 0);
    $flag = (int)($body['is_bracket'] ?? 0) ? 1 : 0;
    if ($id <= 0) json_error('Invalid prize_id', 400);

    $sql = "UPDATE `$table` SET is_bracket = $flag WHERE id = $id LIMIT 1";
    if (!$conn->query($sql)) {
        json_error('Update failed: ' . $conn->error, 500);
    }
    json_response(['ok' => true, 'prize_table' => $table, 'prize_id' => $id, 'is_bracket' => $flag]);
}

// ============= Action: get_config =============
/**
 * Return the bracket_config row + all bracket_matches for a given prize.
 * Returns 404-shaped payload (config: null) if no config exists yet so the
 * frontend can render an empty editor.
 */
function action_get_config($conn, $torneoid, $prizeTable, $prizeId) {
    validate_prize_table($prizeTable);
    $tid = esc($conn, $torneoid);
    $pt  = esc($conn, $prizeTable);
    $pid = (int)$prizeId;

    $cfg = safe_query_one_local($conn,
        "SELECT * FROM bracket_config
         WHERE torneoid = $tid AND prize_table = '$pt' AND prize_id = $pid LIMIT 1");

    $matches = [];
    if ($cfg) {
        $cfgId = (int)$cfg['id'];
        $res = $conn->query("SELECT m.*,
                                    CONCAT(j1.nombre,' ',j1.apellido) AS player1_name,
                                    CONCAT(j2.nombre,' ',j2.apellido) AS player2_name
                             FROM bracket_matches m
                             LEFT JOIN jugadores j1 ON j1.id = m.player1_id
                             LEFT JOIN jugadores j2 ON j2.id = m.player2_id
                             WHERE m.bracket_config_id = $cfgId
                             ORDER BY m.round ASC, m.position ASC");
        if ($res) {
            while ($m = $res->fetch_assoc()) { $matches[] = $m; }
            $res->free();
        }
    }

    json_response(['config' => $cfg, 'matches' => $matches]);
}

/** Local safe single-row helper (avoids name clash with competencias.php) */
function safe_query_one_local($conn, $sql) {
    $r = $conn->query($sql);
    if (!$r) {
        error_log('brackets.php query failed: ' . $conn->error . ' | SQL: ' . $sql);
        return null;
    }
    $row = $r->fetch_assoc();
    $r->free();
    return $row;
}

// ============= Action: save_config =============
/**
 * Upsert a bracket_config row. Body fields:
 *   torneoid, prize_table, prize_id, size, seed_source, advancement,
 *   seed_categoriaid, seed_premio, seed_hoyo, seed_campo,
 *   advancement_source, password
 * Returns the saved config row.
 */
function action_save_config($conn, $body) {
    global $ALLOWED_SIZES;
    require_admin($body);
    $torneoid = (int)($body['torneoid'] ?? 0);
    $table    = $body['prize_table'] ?? '';
    validate_prize_table($table);
    $prizeId  = (int)($body['prize_id'] ?? 0);
    $size     = (int)($body['size'] ?? 0);
    if (!in_array($size, $ALLOWED_SIZES, true)) {
        json_error('Invalid size; allowed: ' . implode(',', $ALLOWED_SIZES), 400);
    }
    $seedSrc  = in_array($body['seed_source'] ?? '', ['standings','manual','random'], true)
              ? $body['seed_source'] : 'standings';
    $adv      = in_array($body['advancement'] ?? '', ['manual','auto'], true)
              ? $body['advancement'] : 'manual';

    // Optional standings filters (any may be NULL)
    $catId    = isset($body['seed_categoriaid']) ? (int)$body['seed_categoriaid'] : null;
    $premio   = isset($body['seed_premio'])      ? (int)$body['seed_premio']      : null;
    $hoyo     = isset($body['seed_hoyo'])        ? (int)$body['seed_hoyo']        : null;
    $campo    = isset($body['seed_campo'])       ? (int)$body['seed_campo']       : null;
    $advSrc   = isset($body['advancement_source'])
              ? "'" . esc($conn, $body['advancement_source']) . "'" : 'NULL';

    $tid = (int)$torneoid;
    $pt  = esc($conn, $table);

    // Build NULL-aware values
    $catSql    = $catId  !== null ? (int)$catId  : 'NULL';
    $premioSql = $premio !== null ? (int)$premio : 'NULL';
    $hoyoSql   = $hoyo   !== null ? (int)$hoyo   : 'NULL';
    $campoSql  = $campo  !== null ? (int)$campo  : 'NULL';

    // Upsert by unique key (torneoid, prize_table, prize_id)
    $sql = "INSERT INTO bracket_config
              (torneoid, prize_table, prize_id, size, seed_source, advancement,
               seed_categoriaid, seed_premio, seed_hoyo, seed_campo,
               advancement_source, status, created_at, updated_at)
            VALUES
              ($tid, '$pt', $prizeId, $size, '$seedSrc', '$adv',
               $catSql, $premioSql, $hoyoSql, $campoSql,
               $advSrc, 'draft', NOW(), NOW())
            ON DUPLICATE KEY UPDATE
               size = VALUES(size),
               seed_source = VALUES(seed_source),
               advancement = VALUES(advancement),
               seed_categoriaid = VALUES(seed_categoriaid),
               seed_premio = VALUES(seed_premio),
               seed_hoyo = VALUES(seed_hoyo),
               seed_campo = VALUES(seed_campo),
               advancement_source = VALUES(advancement_source),
               updated_at = NOW()";
    if (!$conn->query($sql)) {
        json_error('Save config failed: ' . $conn->error, 500);
    }

    $saved = safe_query_one_local($conn,
        "SELECT * FROM bracket_config WHERE torneoid = $tid AND prize_table = '$pt' AND prize_id = $prizeId LIMIT 1");
    json_response(['config' => $saved]);
}

// ============= Action: generate =============
/**
 * (Re)generate the bracket_matches rows for a given bracket_config_id.
 * Steps:
 *   1. Load config + verify exists.
 *   2. Pull seeded player list from the chosen source (standings or random).
 *      (manual seeding is left untouched — admin populates rows by hand.)
 *   3. Wipe existing bracket_matches for this config.
 *   4. Build round-1 matches using build_seed_pairs($size), then create
 *      empty placeholder matches for all subsequent rounds, linking each
 *      match's next_match_id / next_slot so winners can be auto-advanced.
 *   5. Set status = 'active'.
 *
 * Standings source query: pulls from the same view family used by the
 * existing premio endpoints, but is intentionally generic here — we read
 * jugadorid + ordering from the linked premio table itself when possible
 * so the bracket reflects the same ranking the public sees.
 */
function action_generate($conn, $body) {
    require_admin($body);
    $cfgId = (int)($body['bracket_config_id'] ?? 0);
    if ($cfgId <= 0) json_error('Invalid bracket_config_id', 400);

    $cfg = safe_query_one_local($conn, "SELECT * FROM bracket_config WHERE id = $cfgId LIMIT 1");
    if (!$cfg) json_error('bracket_config not found', 404);

    $size       = (int)$cfg['size'];
    $seedSource = $cfg['seed_source'];
    $tid        = (int)$cfg['torneoid'];
    $table      = $cfg['prize_table'];
    $prizeId    = (int)$cfg['prize_id'];

    // Pull candidate players
    $players = collect_seed_players($conn, $cfg, $size, $seedSource);
    // Truncate / pad to bracket size
    $players = array_slice($players, 0, $size);
    while (count($players) < $size) {
        $players[] = ['jugadorid' => null]; // BYE slot
    }

    // Wipe existing matches for this config
    $conn->query("DELETE FROM bracket_matches WHERE bracket_config_id = $cfgId");

    // Build placeholder rows for all rounds
    $totalRounds = (int)log($size, 2);
    // matchIds[round][position] = inserted match row id
    $matchIds = [];

    // Insert in reverse round order (final first) so we can wire next_match_id
    // for earlier rounds. We do final → semis → … → R1.
    for ($round = $totalRounds; $round >= 1; $round--) {
        $matchesInRound = (int)pow(2, $totalRounds - $round);
        for ($pos = 1; $pos <= $matchesInRound; $pos++) {
            $nextMatchId = 'NULL';
            $nextSlot    = 'NULL';
            if ($round < $totalRounds) {
                $parentPos  = (int)ceil($pos / 2);
                $parentSlot = (($pos - 1) % 2) + 1;
                $nextMatchId = (int)$matchIds[$round + 1][$parentPos];
                $nextSlot    = $parentSlot;
            }

            $sql = "INSERT INTO bracket_matches
                      (bracket_config_id, round, position, next_match_id, next_slot, status, updated_at)
                    VALUES ($cfgId, $round, $pos, $nextMatchId, $nextSlot, 'pending', NOW())";
            if (!$conn->query($sql)) {
                json_error('Insert match failed: ' . $conn->error, 500);
            }
            $matchIds[$round][$pos] = $conn->insert_id;
        }
    }

    // Populate round 1 with seeded players
    $pairs = build_seed_pairs($size);
    foreach ($pairs as $pos1Based => $pair) {
        $pos    = $pos1Based + 1;
        $matchId = (int)$matchIds[1][$pos];
        $p1     = $players[$pair[0] - 1]['jugadorid'] ?? null;
        $p2     = $players[$pair[1] - 1]['jugadorid'] ?? null;
        $p1Sql  = $p1 !== null ? (int)$p1 : 'NULL';
        $p2Sql  = $p2 !== null ? (int)$p2 : 'NULL';
        $s1     = (int)$pair[0];
        $s2     = (int)$pair[1];

        $conn->query("UPDATE bracket_matches
                      SET player1_id = $p1Sql, player2_id = $p2Sql,
                          player1_seed = $s1, player2_seed = $s2,
                          updated_at = NOW()
                      WHERE id = $matchId");

        // Auto-advance BYEs (one player null)
        if ($p1 !== null && $p2 === null) {
            advance_winner($conn, $matchId, (int)$p1);
        } elseif ($p2 !== null && $p1 === null) {
            advance_winner($conn, $matchId, (int)$p2);
        }
    }

    $conn->query("UPDATE bracket_config SET status = 'active', updated_at = NOW() WHERE id = $cfgId");

    json_response(['ok' => true, 'config_id' => $cfgId, 'rounds' => $totalRounds, 'players_seeded' => count($players)]);
}

/**
 * Collect players to seed the bracket.
 * - 'random': pull all distinct jugadorid that played in this category
 * - 'standings': pull ranked players from the relevant standings query
 * - 'manual': return empty (admin will fill in by hand)
 * Each returned row is at minimum { jugadorid, name? }.
 */
function collect_seed_players($conn, $cfg, $size, $source) {
    $tid    = (int)$cfg['torneoid'];
    $catId  = $cfg['seed_categoriaid'] !== null ? (int)$cfg['seed_categoriaid'] : null;
    $premio = $cfg['seed_premio']      !== null ? (int)$cfg['seed_premio']      : null;
    $hoyo   = $cfg['seed_hoyo']        !== null ? (int)$cfg['seed_hoyo']        : null;
    $campo  = $cfg['seed_campo']       !== null ? (int)$cfg['seed_campo']       : null;

    if ($source === 'manual') {
        return [];
    }

    if ($source === 'random') {
        $where = "WHERE j.torneoid = $tid";
        if ($catId !== null) $where .= " AND j.categoriaid = $catId";
        $sql = "SELECT DISTINCT j.id AS jugadorid
                FROM jugadores j
                $where
                ORDER BY RAND()
                LIMIT $size";
        $res = $conn->query($sql);
        if (!$res) {
            error_log('brackets.php random seed failed: ' . $conn->error);
            return [];
        }
        $out = [];
        while ($r = $res->fetch_assoc()) { $out[] = $r; }
        $res->free();
        return $out;
    }

    // standings: pull from gross/net category leaderboard.
    // We use the same data source the public Resultados page uses:
    // resultados_jug.php drives off `jugadores` joined with the round
    // tables via category. To keep this generic we order by sumtotalneto
    // ascending (best first); if your DB uses a different column the
    // admin should override via 'random' or wire a custom view.
    $where = "WHERE j.torneoid = $tid";
    if ($catId !== null) $where .= " AND j.categoriaid = $catId";
    $sql = "SELECT j.id AS jugadorid,
                   CONCAT(j.nombre,' ',j.apellido) AS name,
                   COALESCE(j.sumtotalneto, 999999) AS rank_score
            FROM jugadores j
            $where
            ORDER BY rank_score ASC, j.id ASC
            LIMIT $size";
    $res = $conn->query($sql);
    if (!$res) {
        error_log('brackets.php standings seed failed: ' . $conn->error . ' SQL: ' . $sql);
        return [];
    }
    $out = [];
    while ($r = $res->fetch_assoc()) { $out[] = $r; }
    $res->free();
    return $out;
}

/**
 * Mark a winner for $matchId and propagate them into the parent match's
 * appropriate slot (player1 if next_slot=1, player2 if next_slot=2).
 * If the parent match becomes complete (was already auto-advanceable),
 * recursion is NOT triggered here — we only fill the slot.
 */
function advance_winner($conn, $matchId, $winnerId) {
    $mid = (int)$matchId;
    $wid = (int)$winnerId;
    $conn->query("UPDATE bracket_matches SET winner_id = $wid, status = 'complete', updated_at = NOW() WHERE id = $mid");
    $row = safe_query_one_local($conn, "SELECT next_match_id, next_slot FROM bracket_matches WHERE id = $mid");
    if (!$row || $row['next_match_id'] === null) return;
    $nextId   = (int)$row['next_match_id'];
    $slotCol  = ((int)$row['next_slot']) === 1 ? 'player1_id' : 'player2_id';
    $conn->query("UPDATE bracket_matches SET $slotCol = $wid, updated_at = NOW() WHERE id = $nextId");
}

// ============= Action: record_score =============
/**
 * Record scores for a single match. If both players have a score the
 * higher score wins (golf match-play "holes won" semantics — admin can
 * adjust later if a different convention is needed). When advancement
 * is set on the config the winner is auto-pushed to the next round slot.
 */
function action_record_score($conn, $body) {
    require_admin($body);
    $matchId = (int)($body['match_id'] ?? 0);
    if ($matchId <= 0) json_error('Invalid match_id', 400);
    $s1 = isset($body['player1_score']) ? (int)$body['player1_score'] : null;
    $s2 = isset($body['player2_score']) ? (int)$body['player2_score'] : null;
    $s1Sql = $s1 !== null ? (int)$s1 : 'NULL';
    $s2Sql = $s2 !== null ? (int)$s2 : 'NULL';

    $conn->query("UPDATE bracket_matches SET player1_score = $s1Sql, player2_score = $s2Sql, updated_at = NOW() WHERE id = $matchId");

    $m = safe_query_one_local($conn,
        "SELECT m.*, c.advancement
         FROM bracket_matches m
         JOIN bracket_config c ON c.id = m.bracket_config_id
         WHERE m.id = $matchId");
    if (!$m) json_error('Match not found', 404);

    if ($s1 !== null && $s2 !== null && $s1 !== $s2 && $m['advancement'] === 'auto') {
        $winner = $s1 > $s2 ? (int)$m['player1_id'] : (int)$m['player2_id'];
        if ($winner > 0) {
            advance_winner($conn, $matchId, $winner);
        }
    }
    json_response(['ok' => true]);
}

// ============= Router =============
$method = $_SERVER['REQUEST_METHOD'];
$action = optional_param('action', '');

if ($method === 'GET') {
    $torneoid = require_param('torneoid');
    if ($action === 'list_prizes') {
        action_list_prizes($conn, $torneoid);
    } elseif ($action === 'get_config') {
        $pt  = require_param('prize_table');
        $pid = require_param('prize_id');
        action_get_config($conn, $torneoid, $pt, $pid);
    } else {
        json_error("Unknown GET action '$action'. Try list_prizes or get_config.", 400);
    }
} elseif ($method === 'POST') {
    $body = read_json_body();
    if ($action === 'set_flag') {
        action_set_flag($conn, $body);
    } elseif ($action === 'save_config') {
        action_save_config($conn, $body);
    } elseif ($action === 'generate') {
        action_generate($conn, $body);
    } elseif ($action === 'record_score') {
        action_record_score($conn, $body);
    } else {
        json_error("Unknown POST action '$action'.", 400);
    }
} else {
    json_error('Method not allowed', 405);
}