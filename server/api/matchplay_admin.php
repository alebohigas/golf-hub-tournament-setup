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
 *      `jugadores` con sufijo "-B" hacia la categoría de consolación
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

    $staff = staff_check_area($conn, $body, 'brackets');
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
 * vacante en la categoría de consolación (D2). Replica exactamente la lógica
 * del legacy.
 */
function propagate_loser_to_d2($conn, $catid, $juggano_id, $jugperdio_id) {
    $catid = (int)$catid;
    $juggano_id = (int)$juggano_id;

    // Categoría de consolación viene de categorias.categoriascol.
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
    $sql = "UPDATE elimin_salidas_cat
               SET gano = 0, hoyo = NULL, fecha = NULL
             WHERE catid = $catid AND matchx = $matchx";
    if (!$conn->query($sql)) json_error('Reset failed: ' . $conn->error, 500);
    // Nota: la propagación NO se revierte automáticamente — los slots de la
    // ronda siguiente quedan con el jugador que ya se había avanzado. Si se
    // requiere revertir totalmente, se debe resetear también el match siguiente.
    json_response(['ok' => true, 'matchx' => $matchx]);
}

json_error('Unknown action', 400);