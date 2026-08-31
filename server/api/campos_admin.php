<?php
/**
 * Campos Admin Endpoint  (ALIEN SYSTEM → Campos)
 * -----------------------------------------------------------------------------
 * Vista consolidada de los CAMPOS del torneo: es la MISMA fuente de datos que
 * usan las tarjetas de juego, para poder verificar de dónde sale cada dato.
 *
 * GET /api/campos_admin.php?torneoid=346
 *   → { campos: [ {
 *         id, campo,
 *         horarios:   [ { fecha, fechaFormato, horaInicio1, horaInicio10,
 *                         categoria, categoriaid, salhoyos, numfoursome } ],
 *         categorias: [ { id, categoria, abreviatura, sistema, salida,
 *                         teeName, teeColor, rating, slope, par } ],
 *         tees:       [ { id, tee, color, rating, slope, par,
 *                         holes: [ { numero, par, yardas, ventaja } ],
 *                         totalPar, totalYardas } ],
 *         hoyos:      [ { numero, par, minutos } ]   // tabla `hoyos` (staff)
 *       } ] }
 *
 * Sólo lectura: la edición de rating/slope/par sigue en Admin → Jugadores
 * (categorías) y los tiempos por hoyo en la tabla `hoyos`.
 */
require_once 'config.php';

header('Access-Control-Allow-Methods: GET, OPTIONS');

/** Columnas de una tabla (cacheadas) — evita SQL a columnas inexistentes. */
function cpa_columns($conn, $table) {
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

/** Primera columna existente de una lista de candidatas. */
function cpa_pick($conn, $table, array $cands) {
    $cols = cpa_columns($conn, $table);
    foreach ($cands as $c) if (in_array($c, $cols, true)) return $c;
    return null;
}

$tid = (int) require_param('torneoid');

// ============= Campos usados por el torneo (según el calendario) =============
$campoRows = query_all($conn, "SELECT DISTINCT cj.campo AS id, c.campo
                                 FROM caljuego cj
                                 LEFT JOIN campos c ON (cj.campo = c.id)
                                WHERE cj.torneoid = $tid AND cj.campo > 0
                                ORDER BY cj.campo ASC");

$campos = [];
foreach ($campoRows as $cr) {
    $campoid = (int)$cr['id'];

    // ---- Horarios (caljuego): fecha, salida de hoyo 1 / hoyo 10 ----
    $horarios = array_map(function ($h) {
        return [
            'fecha'        => $h['fecha'],
            'fechaFormato' => $h['fecha_formato'],
            'categoriaid'  => (int)($h['categoriaid'] ?? 0),
            'categoria'    => (string)($h['categoria'] ?? ''),
            'horaInicio1'  => $h['horainicio_1'],
            'horaInicio10' => $h['horainicio_10'],
            'salhoyos'     => $h['salhoyos'],
            'numfoursome'  => $h['numfoursome'] !== null ? (int)$h['numfoursome'] : null,
        ];
    }, query_all($conn, "SELECT fecha,
                                DATE_FORMAT(fecha, '%W, %e de %M %Y') AS fecha_formato,
                                categoriaid, categoria, horainicio_1, horainicio_10,
                                salhoyos, numfoursome
                           FROM caljuego
                          WHERE torneoid = $tid AND campo = $campoid
                          ORDER BY fecha ASC, horainicio_1 ASC"));

    // ---- Categorías que juegan en este campo, con su tee y rating ----
    $catRows = query_all($conn, "SELECT DISTINCT a.categoria_id, a.categoria,
                                        a.abreviatura, a.sistema, a.salida,
                                        s.tee AS teeName, s.color AS teeColor
                                   FROM caljuego cj
                                   JOIN categorias a ON (cj.categoriaid = a.categoria_id)
                                   LEFT JOIN salidas s ON (a.salida = s.id)
                                  WHERE cj.torneoid = $tid AND cj.campo = $campoid
                                  ORDER BY a.categoria_id ASC");

    /** Rating / Slope / Par por tee de salida en este campo (campo_tee). */
    $teeData = [];
    foreach (query_all($conn, "SELECT ct.salidaid, ct.rating, ct.slope, ct.parcampo,
                                      s.tee, s.color
                                 FROM campo_tee ct
                                 LEFT JOIN salidas s ON (ct.salidaid = s.id)
                                WHERE ct.campoid = $campoid
                                ORDER BY ct.salidaid ASC") as $t) {
        $teeData[(int)$t['salidaid']] = $t;
    }

    $categorias = array_map(function ($c) use ($teeData) {
        $sal = (int)$c['salida'];
        $td = $teeData[$sal] ?? null;
        return [
            'id'          => (int)$c['categoria_id'],
            'categoria'   => $c['categoria'],
            'abreviatura' => $c['abreviatura'],
            'sistema'     => $c['sistema'],
            'salida'      => $sal,
            'teeName'     => $c['teeName'],
            'teeColor'    => $c['teeColor'],
            'rating'      => $td['rating'] ?? null,
            'slope'       => $td['slope'] ?? null,
            'par'         => isset($td['parcampo']) ? (int)$td['parcampo'] : null,
        ];
    }, $catRows);

    // ---- Hoyos por tee de salida (hoyosxsalida) ----
    $tees = [];
    foreach ($teeData as $sal => $td) {
        $holes = [];
        $totalPar = 0; $totalYds = 0;
        foreach (query_all($conn, "SELECT numero, par, yardaje, ventaja
                                     FROM hoyosxsalida
                                    WHERE campoid = $campoid AND salidaid = " . (int)$sal . "
                                    ORDER BY numero ASC") as $h) {
            $n = (int)$h['numero'];
            if ($n < 1 || $n > 18) continue;
            $holes[] = [
                'numero'  => $n,
                'par'     => (int)$h['par'],
                'yardas'  => (int)$h['yardaje'],
                'ventaja' => (int)$h['ventaja'],
            ];
            $totalPar += (int)$h['par'];
            $totalYds += (int)$h['yardaje'];
        }
        $tees[] = [
            'id'          => (int)$sal,
            'tee'         => $td['tee'],
            'color'       => $td['color'],
            'rating'      => $td['rating'],
            'slope'       => $td['slope'],
            'par'         => isset($td['parcampo']) ? (int)$td['parcampo'] : null,
            'holes'       => $holes,
            'totalPar'    => $totalPar,
            'totalYardas' => $totalYds,
        ];
    }

    // ---- Tiempos por hoyo editables por el staff (tabla `hoyos`) ----
    $hoyos = [];
    $numCol   = cpa_pick($conn, 'hoyos', ['numero', 'hoyo', 'num', 'nohoyo']);
    $campoCol = cpa_pick($conn, 'hoyos', ['campoid', 'campo_id', 'campo']);
    $parCol   = cpa_pick($conn, 'hoyos', ['par']);
    $minCol   = cpa_pick($conn, 'hoyos', [
        'tiempo', 'minutos', 'tiempojuego', 'tiempo_juego', 'hora', 'horas',
        'partime', 'par_time', 'timepar', 'tpo', 'mins', 'minutosjuego',
    ]);
    if ($numCol) {
        $sel = "`$numCol` AS numero"
             . ($parCol ? ", `$parCol` AS par" : ', NULL AS par')
             . ($minCol ? ", `$minCol` AS minutos" : ', NULL AS minutos');
        $where = $campoCol ? "WHERE `$campoCol` = $campoid" : '';
        foreach (query_all($conn, "SELECT $sel FROM `hoyos` $where ORDER BY `$numCol` ASC") as $h) {
            $n = (int)$h['numero'];
            if ($n < 1 || $n > 18) continue;
            $hoyos[] = [
                'numero'  => $n,
                'par'     => $h['par'] !== null ? (int)$h['par'] : null,
                'minutos' => $h['minutos'],
            ];
        }
    }

    // ---- PAR TIME resuelto igual que timeline.php (para auditar la fuente) ----
    /**
     * Minutos por hoyo con la MISMA cadena de resolución que el Time Line:
     *   1) tabla `hoyos` (capturado por staff)  → fuente 'hoyos'
     *   2) columna de minutos de `hoyosxsalida` → fuente 'hoyosxsalida'
     *   3) estimación por par (3=15, 4=14, 5=19) → fuente 'estimado'
     * Se expone `fuente` para que en ALIEN SYSTEM se vea qué números son
     * reales de la base de datos y cuáles se están estimando.
     */
    $PAR_MINUTES = [3 => 15, 4 => 14, 5 => 19];

    /** Convierte "14", "00:14" o "00:14:00" a minutos enteros. */
    $toMinutes = function ($v) {
        if ($v === null || $v === '') return 0;
        if (is_numeric($v)) return (int)round((float)$v);
        if (preg_match('/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/', trim((string)$v), $m)) {
            return (int)$m[1] * 60 + (int)$m[2];
        }
        return 0;
    };

    $hoyosMin = [];
    foreach ($hoyos as $h) $hoyosMin[$h['numero']] = $toMinutes($h['minutos']);

    /** Minutos de `hoyosxsalida` (nombre de columna variable). */
    $hxsMinCol = cpa_pick($conn, 'hoyosxsalida', [
        'tiempo', 'minutos', 'tiempojuego', 'tiempo_juego', 'partime', 'par_time',
        'timepar', 'tpo', 'mins', 'minutosjuego',
    ]);
    $hxsMin = [];
    if ($hxsMinCol) {
        foreach (query_all($conn, "SELECT numero, `$hxsMinCol` AS minutos
                                     FROM hoyosxsalida
                                    WHERE campoid = $campoid
                                    GROUP BY numero") as $r) {
            $hxsMin[(int)$r['numero']] = $toMinutes($r['minutos']);
        }
    }

    /** Par de referencia por hoyo (primer tee configurado del campo). */
    $parRef = [];
    if (!empty($tees[0]['holes'])) {
        foreach ($tees[0]['holes'] as $h) $parRef[$h['numero']] = (int)$h['par'];
    }
    foreach ($hoyos as $h) {
        if (empty($parRef[$h['numero']]) && $h['par']) $parRef[$h['numero']] = (int)$h['par'];
    }

    $parTime = [];
    foreach (range(1, 18) as $n) {
        if (!isset($parRef[$n]) && !isset($hoyosMin[$n]) && !isset($hxsMin[$n])) continue;
        $par = (int)($parRef[$n] ?? 0);
        if (!empty($hoyosMin[$n])) {
            $min = $hoyosMin[$n]; $fuente = 'hoyos';
        } elseif (!empty($hxsMin[$n])) {
            $min = $hxsMin[$n];  $fuente = 'hoyosxsalida';
        } else {
            $min = $PAR_MINUTES[$par] ?? 15; $fuente = 'estimado';
        }
        $parTime[] = ['numero' => $n, 'par' => $par ?: null, 'minutos' => $min, 'fuente' => $fuente];
    }

    $campos[] = [
        'id'         => $campoid,
        'campo'      => (string)($cr['campo'] ?? ''),
        'horarios'   => $horarios,
        'categorias' => $categorias,
        'tees'       => $tees,
        'hoyos'      => $hoyos,
        'parTime'    => $parTime,
    ];

}

json_response(['campos' => $campos]);
