<?php
/**
 * Resultados Master Endpoint
 * GET /api/resultados.php?torneoid=XXX
 * Returns categories list with their scoring systems for results navigation
 * Separates Stroke Play from Match Play (Eliminación Directa)
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

// Get categories with active results
$sql = "SELECT a.categoria_id, a.torneo_id, a.categoria, a.abreviatura,
               a.sistema, a.formato, a.estilo, a.gross,
               a.hcpIdxMin, a.hcpIdxMax, a.porcentaje,
               a.hoyosajugar, a.hoyosacorte, a.salida, a.catrel,
               COUNT(b.id) as playerCount
        FROM categorias a
        JOIN jugadores b ON (a.categoria_id = b.categoriaid)
        WHERE a.estatus = 1 AND a.torneo_id = $tid
        GROUP BY a.categoria_id, a.torneo_id, a.categoria, a.abreviatura,
                 a.sistema, a.formato, a.estilo, a.gross,
                 a.hcpIdxMin, a.hcpIdxMax, a.porcentaje,
                 a.hoyosajugar, a.hoyosacorte, a.salida, a.catrel
        ORDER BY a.categoria_id ASC";

$rows = query_all($conn, $sql);
debug_log_query('Categories with results', $sql);

// Separate by system type
$strokePlay = [];
$matchPlay = [];

foreach ($rows as $row) {
    $cat = [
        'categoryId'  => $row['categoria_id'],
        'name'        => $row['categoria'],
        'shortName'   => $row['abreviatura'],
        'system'      => $row['sistema'],
        'format'      => $row['formato'],
        'style'       => $row['estilo'],
        'gross'       => (int)$row['gross'],
        'playerCount' => (int)$row['playerCount'],
        'relatedCat'  => $row['catrel'],
        /** Detección de torneo de parejas — la categoría es de parejas cuando formato='PAREJAS'. */
        'isParejas'   => (strtoupper($row['formato']) === 'PAREJAS')
    ];

    if (strtoupper($row['sistema']) === 'MATCH PLAY') {
        $matchPlay[] = $cat;
        /**
         * FASE PREVIA DE CLASIFICACIÓN.
         * Una categoría puede haber jugado rondas de STROKE PLAY / STABLEFORD
         * antes del corte y luego cambiar su sistema a MATCH PLAY. Esas rondas
         * ya capturadas deben seguir visibles en /resultados. Si existe al
         * menos una tarjeta cerrada (statlsc=1) de la categoría, la exponemos
         * también en `strokePlay`, marcada con `matchPlayFinal` para que el
         * frontend aclare que el sistema que domina al final es MATCH PLAY.
         */
        $cidEsc = esc($conn, $row['categoria_id']);
        $hist = query_one(
            $conn,
            "SELECT COUNT(*) AS total
               FROM tarjetas t
               JOIN jugadores j ON (j.id = t.jugadorid)
              WHERE j.categoriaid = $cidEsc
                AND t.statlsc = 1"
        );
        if ((int)($hist['total'] ?? 0) > 0) {
            $cat['matchPlayFinal'] = true;   // el sistema vigente es MATCH PLAY
            $cat['hasStrokeHistory'] = true; // tiene rondas previas publicables
            $strokePlay[] = $cat;
        }
    } else {
        $strokePlay[] = $cat;
    }
}

json_response([
    'strokePlay' => $strokePlay,
    'matchPlay'  => $matchPlay
]);
