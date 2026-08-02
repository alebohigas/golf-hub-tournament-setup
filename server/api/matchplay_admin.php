<?php
/**
 * Match Play Admin Endpoint
 * POST /api/matchplay_admin.php?action=set_winner
 * POST /api/matchplay_admin.php?action=reset_match
 *
 * Trabaja sobre la tabla legacy `elimin_salidas_cat` (NO `eliminacion_directa`).
 * Replica la lógica del legacy `el_capturadetalle_p.php`:
 *   1) UPDATE del match (gano, hoyo, fecha).
 *   2) Propaga ganador de D1 a la siguiente ronda usando `pl_grupo` / `sl_grupo`.
 *   3) Para matches de 1ª ronda D1 (matchx 101..108): clona al perdedor en
 *      `jugadores` con sufijo "-B" hacia la categoría MATCH-2 (DRAW-2)
 *      (D2 / `categorias.categoriascol`) y lo coloca en su match D2 vacante.
 *   4) Para matches Scramble (matchx 109..112): clona al perdedor con sufijo
 *      "-C" hacia la categoría con `abreviatura='Scrm A'`.
 *
 * Contrato JSON (set_winner):
 *   { torneoid, catid, matchx, side(1|2), hoyo?, fecha?, password|staff_token }
 * Contrato JSON (reset_match):
 *   { torneoid, catid, matchx, password|staff_token }
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
    $hasPassword = isset($body['password']) && (string)$body['password'] !== '';
    $hasStaffToken = !empty($body['staff_token']) || !empty($_GET['staff_token']) || !empty($_SERVER['HTTP_AUTHORIZATION']);

    if ($hasPassword && is_superadmin_password($conn, $body['password'])) return ['auth' => 'superadmin'];

    // Acepta staff con área `matchplay` (preferente) o `brackets` (legacy).
    $staff = staff_check_area($conn, $body, 'matchplay');
    if (!$staff) $staff = staff_check_area($conn, $body, 'brackets');
    if ($staff) return ['auth' => 'staff', 'usuario' => $staff['usuario'] ?? ''];

    error_log('[matchplay_admin] Unauthorized brackets write. has_password=' . ($hasPassword ? '1' : '0') . ' has_staff_token=' . ($hasStaffToken ? '1' : '0'));
    json_error('Unauthorized — vuelve a iniciar sesión como superadmin', 401, [
        'has_password' => $hasPassword,
        'has_staff_token' => $hasStaffToken,
        'hint' => 'Si /admin seguía abierto por localStorage, cierra sesión y entra otra vez para capturar la contraseña real.',
    ]);
}

$action = $_GET['action'] ?? '';
$body   = read_body_json();

$authInfo = require_brackets_auth($conn, $body);

$torneoid = (int)($body['torneoid'] ?? 0);
if ($torneoid <= 0) json_error('torneoid required', 400);

// =====================================================================
// Helpers de propagación (legacy `el_capturadetalle_p.php`)
// =====================================================================

/**
 * Propaga el ganador del match recién marcado hacia la siguiente ronda del
 * MISMO cuadro (D1 o D2). Cada fila de `elimin_salidas_cat` lleva los punteros
 * `pl_grupo` (match que recibirá al ganador en jugida) y `sl_grupo` (en jugidb).
 */
function propagate_winner_d1($conn, $catid) {
    $cid = (int)$catid;
    $sqls = [
        // → siguiente match recibe al ganador en `jugida`
        "UPDATE elimin_salidas_cat AS a
           JOIN elimin_salidas_cat AS b
             ON (a.matchx = b.pl_grupo AND a.catid = b.catid AND a.gano > 0)
            SET b.jugida = IF(a.gano = 1, a.jugida, a.jugidb)
          WHERE a.catid = $cid",
        // → siguiente match recibe al ganador en `jugidb`
        "UPDATE elimin_salidas_cat AS a
           JOIN elimin_salidas_cat AS b
             ON (a.matchx = b.sl_grupo AND a.catid = b.catid AND a.gano > 0)
            SET b.jugidb = IF(a.gano = 1, a.jugida, a.jugidb)
          WHERE a.catid = $cid",
    ];
    foreach ($sqls as $sql) { $conn->query($sql); }
}

/**
 * Clona al perdedor en `jugadores` cambiando categoría a `$catperd` con el
 * sufijo dado ("-B" para D2, "-C" para Scrm A) y devuelve el `id` recién creado
 * (el más bajo si quedó duplicado por reruns).
 */
function clone_loser_into_category($conn, $jugperdio_id, $catid_origen, $catperd, $sufijo, $grupoFrom, $grupoTo) {
    $jugperdio_id = (int)$jugperdio_id;
    $catid_origen = (int)$catid_origen;
    $catperd      = (int)$catperd;
    $sufEsc       = esc($conn, $sufijo);
    $grpFromEsc   = esc($conn, $grupoFrom);
    $grpToEsc     = esc($conn, $grupoTo);

    // Lee numjugador del perdedor (clave para detectar el clon más tarde).
    $rsP = query_one($conn, "SELECT numjugador FROM jugadores WHERE id = $jugperdio_id LIMIT 1");
    if (!$rsP) return null;
    $numjug = $rsP['numjugador'];
    $numEsc = esc($conn, $numjug);

    // INSERT clonando todos los campos relevantes del jugador perdedor.
    $sql = "INSERT INTO jugadores
              (torneoid, numjugador, nombre, apellido, fechahandicap, sexo, fechanac, edad,
               hcpindex, teesalidaid, salida, correo, club, tipoinsc, categoriaid, tipoinsc2,
               grupoid, indexjgo, fechareg, estatus, cd1, cd2, cd3, cd4, cd5, cd6, campgross,
               muertesubita, estgross, Skeenjuga, Skeenjugagnal, golforo, sumrr, sumdif, clubid,
               sistema, wpid, equipo, posicion, subgrupo, doble, reg_spei, numghinspei)
            SELECT torneoid,
                   CONCAT(numjugador, '$sufEsc'),
                   nombre,
                   CONCAT(apellido, '$sufEsc'),
                   fechahandicap, sexo, fechanac, edad, hcpindex, teesalidaid, salida, correo,
                   club, tipoinsc,
                   '$catperd',
                   tipoinsc2,
                   REPLACE(grupoid, '$grpFromEsc', '$grpToEsc'),
                   indexjgo, fechareg, estatus, cd1, cd2, cd3, cd4, cd5, cd6, campgross,
                   muertesubita, estgross, Skeenjuga, Skeenjugagnal, golforo, sumrr, sumdif,
                   clubid, sistema, wpid, equipo, posicion, subgrupo, doble, reg_spei, numghinspei
              FROM jugadores
             WHERE categoriaid = $catid_origen AND numjugador = '$numEsc'";
    if (!$conn->query($sql)) return null;

    $rsNew = query_one(
        $conn,
        "SELECT id FROM jugadores
          WHERE numjugador = '" . esc($conn, $numjug . $sufijo) . "'
            AND categoriaid = $catperd
          ORDER BY id ASC LIMIT 1"
    );
    return $rsNew ? (int)$rsNew['id'] : null;
}

/**
 * Propaga al PERDEDOR de un match D1 de primera ronda (101..108) hacia su match
 * vacante en la categoría MATCH-2 (DRAW-2, D2). Replica exactamente la lógica
 * del legacy.
 */
function propagate_loser_to_d2($conn, $catid, $juggano_id, $jugperdio_id) {
    $catid = (int)$catid;
    $juggano_id = (int)$juggano_id;

    // Categoría MATCH-2 (DRAW-2) viene de categorias.categoriascol.
    $cat = query_one($conn, "SELECT categoriascol FROM categorias WHERE categoria_id = $catid LIMIT 1");
    if (!$cat || !$cat['categoriascol']) return;
    $catperd = (int)$cat['categoriascol'];

    // Crea el clon "-B" del perdedor en la categoría D2.
    $minid = clone_loser_into_category($conn, $jugperdio_id, $catid, $catperd, '-B', 'F1', 'F2');
    if (!$minid) return;

    // En la categoría D1 actual, busca dónde "espera" jugar el ganador
    // (match con gano=0 donde el ganador todavía aparece como jugida/jugidb).
    // Ese mismo matchx ocupa el slot vacante en D2 al que va el perdedor.
    $rsx = query_one(
        $conn,
        "SELECT matchx, jugida, jugidb
           FROM elimin_salidas_cat
          WHERE catid = $catid
            AND (jugida = $juggano_id OR jugidb = $juggano_id)
            AND gano = 0
          LIMIT 1"
    );
    if (!$rsx) return;
    $matchx = (int)$rsx['matchx'];
    $juge1  = (int)$rsx['jugida'];

    // El lado del ganador (jugida vs jugidb) determina en qué slot del match
    // gemelo en D2 va el clon del perdedor.
    if ($juge1 === $juggano_id) {
        $conn->query("UPDATE elimin_salidas_cat
                         SET jugida = $minid
                       WHERE catid = $catperd AND matchx = $matchx");
    } else {
        $conn->query("UPDATE elimin_salidas_cat
                         SET jugidb = $minid
                       WHERE catid = $catperd AND matchx = $matchx");
    }
}

/**
 * Propaga al PERDEDOR de un match Scramble (matchx 109..112) al cuadro
 * `Scrm A` clonándolo con sufijo "-C".
 */
function propagate_loser_scramble($conn, $catid, $jugperdio_id) {
    $cat = query_one($conn, "SELECT categoria_id FROM categorias WHERE abreviatura = 'Scrm A' LIMIT 1");
    if (!$cat) return;
    $catperd = (int)$cat['categoria_id'];
    clone_loser_into_category($conn, $jugperdio_id, $catid, $catperd, '-C', 'C', 'C');
}

/**
 * Propaga al PERDEDOR de una semifinal hacia el match por 3er lugar.
 *
 * La semifinal debe tener `elimin_salidas_cat.tl_grupo` != NULL apuntando
 * al `matchx` del 3er lugar (convención: 199 para D1). El slot destino
 * (`jugida`/`jugidb`) se resuelve por ORDEN de matchx entre las dos semis:
 *   - la semi con matchx MENOR deposita al perdedor en `jugida`
 *   - la semi con matchx MAYOR deposita al perdedor en `jugidb`
 *
 * Esto evita añadir otra columna (`tl_slot`) porque el orden es determinista.
 *
 * Se llama después de cada `set_winner` — no hace nada si `tl_grupo` es NULL.
 */
function propagate_loser_third_place($conn, $catid, $matchx, $jugperdio_id) {
    $cid = (int)$catid;
    $mx  = (int)$matchx;
    $lid = (int)$jugperdio_id;
    if ($lid <= 0) return;

    // 1) ¿Esta fila tiene tl_grupo? Si no, no aplica.
    $src = query_one($conn, "SELECT tl_grupo FROM elimin_salidas_cat
                              WHERE catid = $cid AND matchx = $mx LIMIT 1");
    if (!$src || $src['tl_grupo'] === null) return;
    $tl = (int)$src['tl_grupo'];
    if ($tl <= 0) return;

    // 2) ¿Cuál es el OTRO semi que también apunta al mismo 3er lugar?
    //    Slot: la de matchx MENOR va a jugida; la MAYOR a jugidb.
    $siblings = query_all($conn, "SELECT matchx FROM elimin_salidas_cat
                                   WHERE catid = $cid AND tl_grupo = $tl
                                   ORDER BY matchx ASC");
    if (empty($siblings)) return;
    $firstMx = (int)$siblings[0]['matchx'];
    $slotCol = ($mx === $firstMx) ? 'jugida' : 'jugidb';

    // 3) Escribe al perdedor en el slot correspondiente del match 3er lugar.
    $conn->query("UPDATE elimin_salidas_cat
                     SET $slotCol = $lid
                   WHERE catid = $cid AND matchx = $tl");
}

/**
 * Limpia el slot del match 3er lugar cuando se resetea una semifinal cuya
 * `tl_grupo` apuntaba a ese 3er lugar. Sólo borra si el slot todavía
 * contiene al perdedor que la semi había propagado, para no pisar edits
 * manuales del admin.
 */
function clear_third_place_slot_on_reset($conn, $catid, $matchx, $loserId) {
    $cid = (int)$catid;
    $mx  = (int)$matchx;
    $lid = (int)$loserId;
    if ($lid <= 0) return;

    $src = query_one($conn, "SELECT tl_grupo FROM elimin_salidas_cat
                              WHERE catid = $cid AND matchx = $mx LIMIT 1");
    if (!$src || $src['tl_grupo'] === null) return;
    $tl = (int)$src['tl_grupo'];
    if ($tl <= 0) return;

    $siblings = query_all($conn, "SELECT matchx FROM elimin_salidas_cat
                                   WHERE catid = $cid AND tl_grupo = $tl
                                   ORDER BY matchx ASC");
    if (empty($siblings)) return;
    $firstMx = (int)$siblings[0]['matchx'];
    $slotCol = ($mx === $firstMx) ? 'jugida' : 'jugidb';

    $conn->query("UPDATE elimin_salidas_cat
                     SET $slotCol = 0
                   WHERE catid = $cid AND matchx = $tl AND $slotCol = $lid");
}

/**
 * Habilita el match por 3er lugar en la categoría D1 indicada.
 *
 * Crea (idempotente) la fila `matchx = 199` en `elimin_salidas_cat` con
 * ambos slots vacíos, y setea `tl_grupo = 199` en las dos filas de
 * semifinal (las dos filas con `matchx` más alto justo antes de la final).
 *
 * Detección de semifinales: se toman todos los matchx del cuadro D1
 * (rango 100..199 exclusive) y las dos últimas anteriores al final son las
 * semis. El final = max(matchx) del rango D1 contiguo.
 */
function enable_third_place($conn, $catid) {
    $cid = (int)$catid;
    if ($cid <= 0) return ['ok' => false, 'error' => 'catid inválido'];

    // 1) Lista de matchx D1 contiguos (100..198). El 199 es el 3er lugar
    //    mismo — se excluye para no confundirlo con el final.
    $rows = query_all($conn, "SELECT matchx FROM elimin_salidas_cat
                               WHERE catid = $cid
                                 AND matchx BETWEEN 101 AND 198
                               ORDER BY matchx ASC");
    if (count($rows) < 3) {
        return ['ok' => false, 'error' => 'Bracket sin suficientes matches D1 (mínimo 3: 2 semis + 1 final)'];
    }
    $mxs = array_map(fn($r) => (int)$r['matchx'], $rows);
    $finalMx = end($mxs);
    // Las 2 anteriores a la final son las semis.
    $semi2 = prev($mxs); // segunda semi (matchx mayor de las semis)
    $semi1 = prev($mxs); // primera semi (matchx menor)
    if (!$semi1 || !$semi2) {
        return ['ok' => false, 'error' => 'No se pudieron identificar las semifinales'];
    }

    // 2) Inserta (si no existe) la fila del 3er lugar con matchx=199.
    //    Copia torneoid de cualquier fila existente del catid para respetar FK.
    $anyRow = query_one($conn, "SELECT torneoid FROM elimin_salidas_cat
                                 WHERE catid = $cid LIMIT 1");
    if (!$anyRow) return ['ok' => false, 'error' => 'No hay filas base en la categoría'];
    $tid = (int)$anyRow['torneoid'];

    $exists = query_one($conn, "SELECT idelimin_salidas FROM elimin_salidas_cat
                                 WHERE catid = $cid AND matchx = 199 LIMIT 1");
    if (!$exists) {
        $conn->query("INSERT INTO elimin_salidas_cat
                        (torneoid, catid, matchx, jugida, jugidb, gano, pl_grupo, sl_grupo, tl_grupo)
                      VALUES ($tid, $cid, 199, 0, 0, 0, NULL, NULL, NULL)");
    }

    // 3) Setea tl_grupo=199 en las dos filas de semifinal.
    $conn->query("UPDATE elimin_salidas_cat SET tl_grupo = 199
                   WHERE catid = $cid AND matchx IN ($semi1, $semi2)");

    // 4) Si las semis YA tienen ganador, propaga los perdedores ahora mismo.
    foreach ([$semi1, $semi2] as $sMx) {
        $s = query_one($conn, "SELECT gano, jugida, jugidb FROM elimin_salidas_cat
                                WHERE catid = $cid AND matchx = $sMx LIMIT 1");
        if (!$s) continue;
        $g = (int)$s['gano'];
        if ($g === 1) propagate_loser_third_place($conn, $cid, $sMx, (int)$s['jugidb']);
        elseif ($g === 2) propagate_loser_third_place($conn, $cid, $sMx, (int)$s['jugida']);
    }

    return ['ok' => true, 'catid' => $cid, 'semi1' => $semi1, 'semi2' => $semi2, 'third_place_matchx' => 199];
}

// =====================================================================
// Acciones
// =====================================================================

if ($action === 'set_winner') {
    $catid  = (int)($body['catid']  ?? 0);
    $matchx = (int)($body['matchx'] ?? 0);
    $side   = (int)($body['side']   ?? 0); // 1 = jugida, 2 = jugidb
    $hoyo   = isset($body['hoyo'])  && $body['hoyo']  !== '' ? (int)$body['hoyo']  : null;
    $fecha  = isset($body['fecha']) && $body['fecha'] !== '' ? (string)$body['fecha'] : null;
    if ($catid <= 0 || $matchx <= 0 || ($side !== 1 && $side !== 2)) {
        json_error('catid, matchx y side(1|2) son requeridos', 400);
    }

    // Localiza la fila base del match en elimin_salidas_cat.
    $row = query_one(
        $conn,
        "SELECT idelimin_salidas, jugida, jugidb, matchx
           FROM elimin_salidas_cat
          WHERE catid = $catid AND matchx = $matchx
          LIMIT 1"
    );
    if (!$row) json_error('Match no encontrado en elimin_salidas_cat', 404);

    $idelimin = (int)$row['idelimin_salidas'];
    $juggano   = $side === 1 ? (int)$row['jugida'] : (int)$row['jugidb'];
    $jugperdio = $side === 1 ? (int)$row['jugidb'] : (int)$row['jugida'];
    if ($juggano <= 0) json_error('El lado ganador no tiene jugador asignado', 400);

    // ----- 1) UPDATE del match -----
    $hoyoSql  = $hoyo === null ? 'NULL' : (int)$hoyo;
    $fechaSql = $fecha === null ? 'NOW()' : "'" . esc($conn, $fecha) . "'";
    $sql = "UPDATE elimin_salidas_cat
               SET gano = $side, hoyo = $hoyoSql, fecha = $fechaSql
             WHERE idelimin_salidas = $idelimin";
    if (!$conn->query($sql)) json_error('Update failed: ' . $conn->error, 500);

    // ----- 2) Propaga ganador (D1 y D2) -----
    propagate_winner_d1($conn, $catid);

    // ----- 3) Propaga perdedor según rango del matchx -----
    if ($matchx >= 101 && $matchx <= 108) {
        propagate_loser_to_d2($conn, $catid, $juggano, $jugperdio);
    } elseif ($matchx >= 109 && $matchx <= 112) {
        propagate_loser_scramble($conn, $catid, $jugperdio);
    }

    // ----- 4) Propaga perdedor a match por 3er lugar (si tl_grupo != NULL) -----
    // Esto aplica típicamente a las semifinales (matchx = penúltimas del D1).
    // Es idempotente: sin tl_grupo, no hace nada.
    propagate_loser_third_place($conn, $catid, $matchx, $jugperdio);

    json_response([
        'ok' => true,
        'matchx' => $matchx,
        'side'   => $side,
        'idelimin_salidas' => $idelimin,
    ]);
}

if ($action === 'reset_match') {
    $catid  = (int)($body['catid']  ?? 0);
    $matchx = (int)($body['matchx'] ?? 0);
    if ($catid <= 0 || $matchx <= 0) json_error('catid y matchx requeridos', 400);
    // 1) Lee el estado actual para saber a quién hay que "des-avanzar".
    $cur = query_one(
        $conn,
        "SELECT jugida, jugidb, gano FROM elimin_salidas_cat
          WHERE catid = $catid AND matchx = $matchx LIMIT 1"
    );
    if (!$cur) json_error('Match no encontrado', 404);
    $g = (int)$cur['gano'];
    $winnerId = $g === 1 ? (int)$cur['jugida'] : ($g === 2 ? (int)$cur['jugidb'] : 0);
    $loserId  = $g === 1 ? (int)$cur['jugidb'] : ($g === 2 ? (int)$cur['jugida']  : 0);

    // 2) Si había ganador propagado, lo quitamos del slot del siguiente match.
    if ($winnerId > 0) {
        $next = query_all(
            $conn,
            "SELECT matchx, jugida, jugidb, pl_grupo, sl_grupo
               FROM elimin_salidas_cat
              WHERE catid = $catid AND (pl_grupo = $matchx OR sl_grupo = $matchx)"
        );
        foreach ($next as $n) {
            $nmx = (int)$n['matchx'];
            if ((int)$n['pl_grupo'] === $matchx && (int)$n['jugida'] === $winnerId) {
                $conn->query("UPDATE elimin_salidas_cat SET jugida = 0
                               WHERE catid = $catid AND matchx = $nmx");
            }
            if ((int)$n['sl_grupo'] === $matchx && (int)$n['jugidb'] === $winnerId) {
                $conn->query("UPDATE elimin_salidas_cat SET jugidb = 0
                               WHERE catid = $catid AND matchx = $nmx");
            }
        }
    }

    // 2b) Si el perdedor había sido propagado al match por 3er lugar, quítalo.
    if ($loserId > 0) {
        clear_third_place_slot_on_reset($conn, $catid, $matchx, $loserId);
    }

    // 3) Limpia el match actual.
    $sql = "UPDATE elimin_salidas_cat
               SET gano = 0, hoyo = NULL, fecha = NULL
             WHERE catid = $catid AND matchx = $matchx";
    if (!$conn->query($sql)) json_error('Reset failed: ' . $conn->error, 500);

    json_response(['ok' => true, 'matchx' => $matchx, 'cleared_next_for' => $winnerId]);
}

// =====================================================================
// Acción: enable_third_place — crea la fila matchx=199 y linkea semis
// =====================================================================
if ($action === 'enable_third_place') {
    $catid = (int)($body['catid'] ?? 0);
    if ($catid <= 0) json_error('catid requerido', 400);
    $result = enable_third_place($conn, $catid);
    if (empty($result['ok'])) {
        json_error($result['error'] ?? 'No se pudo habilitar', 400);
    }
    json_response($result);
}

json_error('Unknown action', 400);