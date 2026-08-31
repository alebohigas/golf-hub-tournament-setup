<?php
/**
 * Jugadores Admin Endpoint  (ALIEN SYSTEM → Jugadores)
 * -----------------------------------------------------------------------------
 * Listado + edición de JUGADORES del torneo activo, con la información que se
 * usa en las tarjetas: PAR del campo, HANDICAP (HI / HJ / HN) y CATEGORÍA.
 *
 * GET  /api/jugadores_admin.php?torneoid=346[&catid=6337][&q=texto]
 *      → {
 *          players: [ { id, numjugador, nombre, apellido, jugador, club,
 *                       sexo, estatus, categoriaid, categoria, abreviatura,
 *                       sistema, hi, hj, hn, teesalidaid, teeName, teeColor,
 *                       campoid, campo, par, rating, slope } ],
 *          categories: [ { id, categoria, abreviatura, sistema, salida,
 *                          campoid, campo, par, porcentaje } ],
 *          tees: [ { id, tee, color } ]
 *        }
 *
 * POST /api/jugadores_admin.php
 *      Body: { password | staff_token, torneoid, action:'update', id, ...campos }
 *      Campos editables: nombre, apellido, indexjgo (HI), categoriaid,
 *      teesalidaid, sexo, estatus, club.
 *
 * El PAR / RATING / SLOPE NO viven en `jugadores`: se resuelven por
 * (campo del calendario de la categoría, tee de salida) sobre `campo_tee`,
 * exactamente igual que en la impresión de tarjetas.
 */
require_once 'config.php';
require_once '_staff_auth.php';

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

/** Columnas existentes de una tabla (evita SQL a columnas ausentes). */
function jadm_columns($conn, $table) {
    static $cache = [];
    if (isset($cache[$table])) return $cache[$table];
    $cols = [];
    $r = @$conn->query("SHOW COLUMNS FROM `" . esc($conn, $table) . "`");
    if ($r) {
        while ($row = $r->fetch_assoc()) $cols[] = $row['Field'];
        $r->free();
    }
    return $cache[$table] = $cols;
}

/** String escapado y entrecomillado. */
function jadm_str($conn, $v) { return "'" . esc($conn, (string)($v ?? '')) . "'"; }
/** NULL SQL o número decimal. */
function jadm_num($v) { return ($v === null || $v === '') ? 'NULL' : (float)$v; }

/**
 * Mapa categoria_id → datos del campo y del tee (campoid, campo, par,
 * rating, slope, tee). Fuente idéntica a la de las tarjetas:
 * caljuego.campo + categorias.salida + campo_tee.
 */
function jadm_category_map($conn, $tid) {
    $rows = query_all($conn, "SELECT a.categoria_id, a.categoria, a.abreviatura,
                                     a.sistema, a.porcentaje, a.salida,
                                     s.tee AS teeName, s.color AS teeColor,
                                     (SELECT cj.campo FROM caljuego cj
                                       WHERE cj.categoriaid = a.categoria_id
                                         AND cj.campo > 0
                                       ORDER BY cj.fecha ASC LIMIT 1) AS campoid
                                FROM categorias a
                                LEFT JOIN salidas s ON (a.salida = s.id)
                               WHERE a.torneo_id = $tid
                               ORDER BY a.categoria_id ASC");
    $out = [];
    foreach ($rows as $r) {
        $campoid = (int)($r['campoid'] ?? 0);
        $salida  = (int)$r['salida'];
        $par = null; $rating = null; $slope = null; $campo = '';
        if ($salida > 0) {
            $where = $campoid > 0
                ? "salidaid = $salida AND campoid = $campoid"
                : "salidaid = $salida";
            $ct = query_one($conn, "SELECT campoid, rating, slope, parcampo
                                      FROM campo_tee WHERE $where
                                     ORDER BY campoid ASC LIMIT 1");
            if ($ct) {
                if ($campoid <= 0) $campoid = (int)$ct['campoid'];
                $par = $ct['parcampo']; $rating = $ct['rating']; $slope = $ct['slope'];
            }
        }
        if ($campoid > 0) {
            $c = query_one($conn, "SELECT campo FROM campos WHERE id = $campoid LIMIT 1");
            $campo = $c ? (string)$c['campo'] : '';
        }
        $out[(int)$r['categoria_id']] = [
            'id'          => (int)$r['categoria_id'],
            'categoria'   => $r['categoria'],
            'abreviatura' => $r['abreviatura'],
            'sistema'     => $r['sistema'],
            'porcentaje'  => $r['porcentaje'],
            'salida'      => $salida,
            'teeName'     => $r['teeName'],
            'teeColor'    => $r['teeColor'],
            'campoid'     => $campoid,
            'campo'       => $campo,
            'par'         => $par !== null ? (int)$par : null,
            'rating'      => $rating,
            'slope'       => $slope,
        ];
    }
    return $out;
}

// ===========================================================================
// GET — listado de jugadores
// ===========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $tid   = (int) require_param('torneoid');
    $catid = (int) optional_param('catid', 0);
    $q     = trim((string) optional_param('q', ''));

    $cats = jadm_category_map($conn, $tid);

    $jcols = jadm_columns($conn, 'jugadores');
    $has = function ($c) use ($jcols) { return in_array($c, $jcols, true); };

    $sel = ['p.id', 'p.nombre', 'p.apellido', 'p.categoriaid'];
    foreach (['numjugador', 'indexjgo', 'club', 'clubid', 'sexo', 'estatus',
              'teesalidaid', 'grupoid'] as $opt) {
        if ($has($opt)) $sel[] = "p.`$opt`";
    }

    $where = ["p.torneoid = $tid"];
    if ($catid > 0) $where[] = "p.categoriaid = $catid";
    if ($q !== '') {
        $qe = esc($conn, $q);
        $like = "CONCAT_WS(' ', p.nombre, p.apellido) LIKE '%$qe%'";
        if ($has('numjugador')) $like .= " OR p.numjugador LIKE '%$qe%'";
        if ($has('club')) $like .= " OR p.club LIKE '%$qe%'";
        $where[] = "($like OR p.id LIKE '%$qe%')";
    }

    $rows = query_all($conn, "SELECT " . implode(', ', $sel) . "
                                FROM jugadores p
                               WHERE " . implode(' AND ', $where) . "
                               ORDER BY p.apellido ASC, p.nombre ASC
                               LIMIT 5000");

    /** HJ / HN se calculan con las funciones de la BD (igual que players.php). */
    $players = array_map(function ($r) use ($conn, $cats, $has) {
        $cid  = (int)$r['categoriaid'];
        $cat  = $cats[$cid] ?? null;
        $hi   = $has('indexjgo') ? $r['indexjgo'] : null;
        $tee  = $has('teesalidaid') ? (int)$r['teesalidaid'] : (int)($cat['salida'] ?? 0);
        $campoid = (int)($cat['campoid'] ?? 0);
        $pct  = $cat['porcentaje'] ?? null;
        $hj = null; $hn = null;
        if ($hi !== null && $tee > 0 && $campoid > 0) {
            $hrow = query_one($conn, "SELECT f_hdccampo(" . (float)$hi . ", $tee, $campoid) AS hj,
                                             f_hdccamponeto(" . (float)$hi . ", $tee, $campoid,
                                               " . jadm_num($pct) . ") AS hn");
            if ($hrow) { $hj = $hrow['hj']; $hn = $hrow['hn']; }
        }
        return [
            'id'          => (int)$r['id'],
            'numjugador'  => $has('numjugador') ? (string)($r['numjugador'] ?? '') : '',
            'nombre'      => (string)$r['nombre'],
            'apellido'    => (string)$r['apellido'],
            'jugador'     => trim($r['nombre'] . ' ' . $r['apellido']),
            'club'        => $has('club') ? (string)($r['club'] ?? '') : '',
            'sexo'        => $has('sexo') ? (string)($r['sexo'] ?? '') : '',
            'estatus'     => $has('estatus') ? (string)($r['estatus'] ?? '') : '',
            'categoriaid' => $cid,
            'categoria'   => $cat['categoria'] ?? '',
            'abreviatura' => $cat['abreviatura'] ?? '',
            'sistema'     => $cat['sistema'] ?? '',
            'hi'          => $hi,
            'hj'          => $hj,
            'hn'          => $hn,
            'teesalidaid' => $tee,
            'teeName'     => $cat && $tee === (int)$cat['salida'] ? $cat['teeName'] : null,
            'teeColor'    => $cat && $tee === (int)$cat['salida'] ? $cat['teeColor'] : null,
            'campoid'     => $campoid,
            'campo'       => $cat['campo'] ?? '',
            'par'         => $cat['par'] ?? null,
            'rating'      => $cat['rating'] ?? null,
            'slope'       => $cat['slope'] ?? null,
        ];
    }, $rows);

    /** Catálogo de tees de salida. */
    $tees = [];
    foreach (query_all($conn, "SELECT id, tee, color FROM salidas ORDER BY id ASC") as $t) {
        $tees[] = ['id' => (int)$t['id'], 'tee' => $t['tee'], 'color' => $t['color']];
    }

    json_response([
        'players'    => $players,
        'categories' => array_values($cats),
        'tees'       => $tees,
    ]);
}

// ===========================================================================
// POST — edición de un jugador
// ===========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) json_error('Invalid JSON body', 400);

    /** Auth: superadmin o staff con área de pre-registros. */
    if (!is_superadmin_password($conn, $body['password'] ?? '')) {
        if (!staff_check_area($conn, $body, 'preregistros')) json_error('Unauthorized', 401);
    }

    $tid = isset($body['torneoid']) ? (int)$body['torneoid'] : 0;
    $id  = isset($body['id']) ? (int)$body['id'] : 0;
    if ($tid <= 0) json_error('Missing torneoid', 400);
    if ($id <= 0) json_error('Missing id', 400);
    if (($body['action'] ?? 'update') !== 'update') json_error('Acción no soportada', 400);

    $jcols = jadm_columns($conn, 'jugadores');
    $sets = [];
    /** Campo del body → columna de `jugadores` + tipo de casteo. */
    $map = [
        'nombre'      => ['nombre', 'str'],
        'apellido'    => ['apellido', 'str'],
        'club'        => ['club', 'str'],
        'sexo'        => ['sexo', 'str'],
        'estatus'     => ['estatus', 'str'],
        'indexjgo'    => ['indexjgo', 'num'],
        'categoriaid' => ['categoriaid', 'int'],
        'teesalidaid' => ['teesalidaid', 'int'],
    ];
    foreach ($map as $key => [$col, $type]) {
        if (!array_key_exists($key, $body)) continue;
        if (!in_array($col, $jcols, true)) continue;
        if ($type === 'str') $sets[] = "`$col` = " . jadm_str($conn, $body[$key]);
        elseif ($type === 'num') $sets[] = "`$col` = " . jadm_num($body[$key]);
        else $sets[] = "`$col` = " . (int)$body[$key];
    }
    if (!$sets) json_error('Nada que actualizar', 400);

    $ok = $conn->query("UPDATE jugadores SET " . implode(', ', $sets) . "
                         WHERE id = $id AND torneoid = $tid LIMIT 1");
    if (!$ok) {
        error_log('jugadores_admin update failed: ' . $conn->error);
        json_error('No se pudo guardar el jugador', 500);
    }

    json_response(['ok' => true, 'id' => $id]);
}

json_error('Method not allowed', 405);
