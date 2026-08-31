<?php
/**
 * Categorias Admin Endpoint
 * -----------------------------------------------------------------------
 * CRUD de CATEGORÍAS del torneo para /admin → pestaña "Jugadores".
 *
 * GET  /api/categorias_admin.php?torneoid=XXX
 *      → {
 *          categories: [ { id, categoria, abreviatura, sistema, formato,
 *                          estilo, hcpIdxMin, hcpIdxMax, porcentaje,
 *                          hoyosajugar, sexo, gross, maxjugadores,
 *                          salida, teeName, teeColor, campoid,
 *                          rating, slope, parcampo, playerCount } ],
 *          tees:   [ { id, tee, color } ],   // tabla `salidas`
 *          campos: [ { id, campo } ]         // tabla `campos`
 *        }
 *
 * POST /api/categorias_admin.php
 *      Body: { password | staff_token, torneoid, action, ...datos }
 *      action = 'create' | 'update' | 'delete'
 *
 * Rating / Slope / Par NO viven en `categorias`: se guardan en
 * `campo_tee` por par (campoid, salidaid). Al guardar una categoría con
 * campo + tee seleccionados, hacemos UPSERT sobre esa fila.
 */
require_once 'config.php';
require_once '_staff_auth.php';

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

/** ¿Existe una tabla? (evita 500 en BDs legacy) */
function cadm_table_exists($conn, $table) {
    $t = esc($conn, $table);
    $r = @$conn->query("SHOW TABLES LIKE '$t'");
    $e = $r && $r->num_rows > 0;
    if ($r) $r->free();
    return $e;
}

/** Devuelve NULL SQL o número. */
function cadm_num($v) {
    if ($v === null || $v === '' ) return 'NULL';
    return (float)$v;
}
/** Devuelve NULL SQL o entero. */
function cadm_int($v) {
    if ($v === null || $v === '') return 'NULL';
    return (int)$v;
}
/** Devuelve string escapado y entrecomillado. */
function cadm_str($conn, $v) {
    return "'" . esc($conn, (string)($v ?? '')) . "'";
}

/**
 * Metadatos de TODAS las columnas de `categorias` (cacheado).
 * Permite exponer y editar cualquier columna real de la tabla sin
 * hardcodear la lista, que varía entre instalaciones.
 *
 * @return array [ ['name' => string, 'type' => string, 'numeric' => bool] ]
 */
function cadm_columns($conn) {
    static $cache = null;
    if ($cache !== null) return $cache;
    $cols = [];
    $r = @$conn->query("SHOW COLUMNS FROM categorias");
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            $type = strtolower((string)$row['Type']);
            $cols[] = [
                'name'    => $row['Field'],
                'type'    => $row['Type'],
                'numeric' => (bool)preg_match('/int|decimal|float|double|numeric|bit/', $type),
            ];
        }
        $r->free();
    }
    return $cache = $cols;
}

/** Nombres de columnas de `categorias`. */
function cadm_column_names($conn) {
    return array_map(function ($c) { return $c['name']; }, cadm_columns($conn));
}

// ===========================================================================
// GET — lista de categorías + catálogos (tees y campos)
// ===========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $torneoid = (int) require_param('torneoid');

    /** `a.*` para poder devolver TODAS las columnas reales de la tabla. */
    $sql = "SELECT a.*,
                   s.tee AS teeName, s.color AS teeColor,
                   (SELECT COUNT(*) FROM jugadores j
                     WHERE j.categoriaid = a.categoria_id) AS playerCount,
                   (SELECT cj.campo FROM caljuego cj
                     WHERE cj.categoriaid = a.categoria_id AND cj.campo > 0
                     ORDER BY cj.campo ASC LIMIT 1) AS campoid
              FROM categorias a
              LEFT JOIN salidas s ON (a.salida = s.id)
             WHERE a.torneo_id = $torneoid
             ORDER BY a.categoria_id ASC";
    $rows = query_all($conn, $sql);

    $colNames = cadm_column_names($conn);

    /** Rating / Slope / Par desde campo_tee por (campoid, salidaid). */
    $categories = array_map(function ($r) use ($conn, $colNames) {
        $salida = (int)($r['salida'] ?? 0);
        $campoid = isset($r['campoid']) && $r['campoid'] !== null ? (int)$r['campoid'] : 0;
        $rating = null; $slope = null; $par = null;
        if ($salida > 0) {
            $where = $campoid > 0
                ? "salidaid = $salida AND campoid = $campoid"
                : "salidaid = $salida";
            $q = @$conn->query("SELECT campoid, rating, slope, parcampo
                                  FROM campo_tee WHERE $where
                                 ORDER BY campoid ASC LIMIT 1");
            if ($q && $q->num_rows > 0) {
                $ct = $q->fetch_assoc();
                if ($campoid <= 0) $campoid = (int)$ct['campoid'];
                $rating = $ct['rating'];
                $slope  = $ct['slope'];
                $par    = $ct['parcampo'];
            }
            if ($q) $q->free();
        }
        /** Valores crudos de TODAS las columnas de `categorias` (tal cual BD). */
        $raw = [];
        foreach ($colNames as $cn) {
            $raw[$cn] = array_key_exists($cn, $r) ? $r[$cn] : null;
        }
        return [
            'id'           => (int)$r['categoria_id'],
            'categoria'    => $r['categoria'] ?? '',
            'abreviatura'  => $r['abreviatura'] ?? null,
            'sistema'      => $r['sistema'] ?? null,
            'formato'      => $r['formato'] ?? null,
            'estilo'       => $r['estilo'] ?? null,
            'hcpIdxMin'    => $r['hcpIdxMin'] ?? null,
            'hcpIdxMax'    => $r['hcpIdxMax'] ?? null,
            'porcentaje'   => $r['porcentaje'] ?? null,
            'hoyosajugar'  => isset($r['hoyosajugar']) && $r['hoyosajugar'] !== null ? (int)$r['hoyosajugar'] : null,
            'sexo'         => $r['sexo'] ?? null,
            'gross'        => (int)($r['gross'] ?? 0),
            'maxjugadores' => isset($r['maxjugadores']) && $r['maxjugadores'] !== null ? (int)$r['maxjugadores'] : null,
            'salida'       => $salida,
            'teeName'      => $r['teeName'] ?? null,
            'teeColor'     => $r['teeColor'] ?? null,
            'campoid'      => $campoid,
            'rating'       => $rating,
            'slope'        => $slope,
            'parcampo'     => $par,
            'estatus'      => (int)($r['estatus'] ?? 0),
            'playerCount'  => (int)$r['playerCount'],
            'raw'          => $raw,
        ];
    }, $rows);


    /** Catálogo de tees de salida. */
    $tees = [];
    if (cadm_table_exists($conn, 'salidas')) {
        foreach (query_all($conn, "SELECT id, tee, color FROM salidas ORDER BY id ASC") as $t) {
            $tees[] = ['id' => (int)$t['id'], 'tee' => $t['tee'], 'color' => $t['color']];
        }
    }
    /** Catálogo de campos. */
    $campos = [];
    if (cadm_table_exists($conn, 'campos')) {
        foreach (query_all($conn, "SELECT id, campo FROM campos ORDER BY id ASC") as $c) {
            $campos[] = ['id' => (int)$c['id'], 'campo' => $c['campo']];
        }
    }

    json_response([
        'categories' => $categories,
        'tees'       => $tees,
        'campos'     => $campos,
        /** Metadatos de todas las columnas reales de torneos.categorias. */
        'columns'    => cadm_columns($conn),
    ]);

}

// ===========================================================================
// POST — create / update / delete
// ===========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) json_error('Invalid JSON body', 400);

    /** Auth: superadmin o staff con área de reglas/convocatoria. */
    $password = $body['password'] ?? '';
    if (!is_superadmin_password($conn, $password)) {
        $staff = staff_check_area($conn, $body, 'reglas');
        if (!$staff) json_error('Unauthorized', 401);
    }

    $torneoid = isset($body['torneoid']) ? (int)$body['torneoid'] : 0;
    if ($torneoid <= 0) json_error('Missing torneoid', 400);

    $action = (string)($body['action'] ?? '');

    /** UPSERT de Rating/Slope/Par en campo_tee (si hay tee + campo). */
    $saveTeeData = function ($salida, $campoid, $rating, $slope, $par) use ($conn) {
        $salida = (int)$salida; $campoid = (int)$campoid;
        if ($salida <= 0 || $campoid <= 0) return false;
        if (!cadm_table_exists($conn, 'campo_tee')) return false;
        $r = cadm_num($rating); $s = cadm_num($slope); $p = cadm_int($par);
        $q = @$conn->query("SELECT campoid FROM campo_tee
                             WHERE salidaid = $salida AND campoid = $campoid LIMIT 1");
        $exists = $q && $q->num_rows > 0;
        if ($q) $q->free();
        if ($exists) {
            return (bool)$conn->query("UPDATE campo_tee
                        SET rating = $r, slope = $s, parcampo = $p
                      WHERE salidaid = $salida AND campoid = $campoid");
        }
        return (bool)$conn->query("INSERT INTO campo_tee
                    (campoid, salidaid, rating, slope, parcampo)
                    VALUES ($campoid, $salida, $r, $s, $p)");
    };

    if ($action === 'create' || $action === 'update') {
        $categoria = trim((string)($body['categoria'] ?? ''));
        if ($categoria === '') json_error('El nombre de la categoría es obligatorio', 400);

        $sets = [
            'categoria = '    . cadm_str($conn, $categoria),
            'abreviatura = '  . cadm_str($conn, $body['abreviatura'] ?? ''),
            'sistema = '      . cadm_str($conn, $body['sistema'] ?? ''),
            'formato = '      . cadm_str($conn, $body['formato'] ?? ''),
            'estilo = '       . cadm_str($conn, $body['estilo'] ?? ''),
            'sexo = '         . cadm_str($conn, $body['sexo'] ?? ''),
            'hcpIdxMin = '    . cadm_num($body['hcpIdxMin'] ?? null),
            'hcpIdxMax = '    . cadm_num($body['hcpIdxMax'] ?? null),
            'porcentaje = '   . cadm_num($body['porcentaje'] ?? null),
            'hoyosajugar = '  . cadm_int($body['hoyosajugar'] ?? null),
            'maxjugadores = ' . cadm_int($body['maxjugadores'] ?? null),
            'gross = '        . (!empty($body['gross']) ? 1 : 0),
            'salida = '       . (int)($body['salida'] ?? 0),
        ];

        if ($action === 'create') {
            $cols = 'torneo_id, estatus, ' . implode(', ', array_map(function ($s) {
                return trim(explode('=', $s, 2)[0]);
            }, $sets));
            $vals = "$torneoid, 1, " . implode(', ', array_map(function ($s) {
                return trim(explode('=', $s, 2)[1]);
            }, $sets));
            if (!$conn->query("INSERT INTO categorias ($cols) VALUES ($vals)")) {
                json_error('No se pudo crear la categoría: ' . $conn->error, 500);
            }
            $newId = (int)$conn->insert_id;
            $saveTeeData($body['salida'] ?? 0, $body['campoid'] ?? 0,
                         $body['rating'] ?? null, $body['slope'] ?? null,
                         $body['parcampo'] ?? null);
            json_response(['saved' => true, 'id' => $newId]);
        }

        $id = (int)($body['id'] ?? 0);
        if ($id <= 0) json_error('Missing category id', 400);
        $sql = "UPDATE categorias SET " . implode(', ', $sets) . "
                 WHERE categoria_id = $id AND torneo_id = $torneoid";
        if (!$conn->query($sql)) {
            json_error('No se pudo guardar la categoría: ' . $conn->error, 500);
        }
        $saveTeeData($body['salida'] ?? 0, $body['campoid'] ?? 0,
                     $body['rating'] ?? null, $body['slope'] ?? null,
                     $body['parcampo'] ?? null);
        json_response(['saved' => true, 'id' => $id]);
    }

    if ($action === 'delete') {
        $id = (int)($body['id'] ?? 0);
        if ($id <= 0) json_error('Missing category id', 400);
        /** Seguridad: no borrar categorías con jugadores inscritos. */
        $q = $conn->query("SELECT COUNT(*) AS n FROM jugadores WHERE categoriaid = $id");
        $n = $q ? (int)$q->fetch_assoc()['n'] : 0;
        if ($q) $q->free();
        if ($n > 0 && empty($body['force'])) {
            json_error("La categoría tiene $n jugador(es) asignado(s). No se puede eliminar.", 409);
        }
        if (!$conn->query("DELETE FROM categorias WHERE categoria_id = $id AND torneo_id = $torneoid")) {
            json_error('No se pudo eliminar: ' . $conn->error, 500);
        }
        json_response(['deleted' => true, 'id' => $id]);
    }

    json_error('Acción no soportada', 400);
}

json_error('Method not allowed', 405);
