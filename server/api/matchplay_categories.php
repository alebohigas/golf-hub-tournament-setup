<?php
/**
 * Match Play Categories Endpoint
 * GET /api/matchplay_categories.php?torneoid=XXX
 *
 * Devuelve las categorías del torneo que son MATCH PLAY (sistema='MATCH PLAY')
 * y que tienen al menos 1 jugador registrado o al menos 1 fila en
 * eliminacion_directa. Sirve como índice para la página /matchplay.
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

/**
 * Detecta si la columna `tipoed` existe en `categorias` (algunos esquemas
 * legacy no la tienen). Evita el error 500 por columna desconocida.
 */
$tipoedExists = $conn->query("SHOW COLUMNS FROM categorias LIKE 'tipoed'");
$tipoedSel = ($tipoedExists && $tipoedExists->num_rows > 0) ? 'c.tipoed' : "NULL AS tipoed";

/**
 * Detecta si la tabla `eliminacion_directa` existe. En esquemas legacy sin
 * match play esta tabla puede no existir y rompería el subquery.
 */
$edExists = $conn->query("SHOW TABLES LIKE 'eliminacion_directa'");
$hasED = ($edExists && $edExists->num_rows > 0);
$matchCountSel = $hasED
    ? "(SELECT COUNT(*) FROM eliminacion_directa e
          WHERE e.torneoid    = c.torneo_id
            AND e.categoriaid = c.categoria_id) AS matchCount"
    : "0 AS matchCount";

/**
 * Conteo de jugadores activos (no BAJA) y de filas de bracket por categoría.
 * Filtramos por sistema MATCH PLAY (case-insensitive) y estatus=1.
 */
$sql = "SELECT c.categoria_id, c.categoria, c.abreviatura, c.sistema,
               c.formato, $tipoedSel, c.sexo,
               (SELECT COUNT(*) FROM jugadores j
                  WHERE j.torneoid    = c.torneo_id
                    AND j.categoriaid = c.categoria_id
                    AND (j.estatus IS NULL OR j.estatus <> 'BAJA')) AS playerCount,
               $matchCountSel
        FROM categorias c
        WHERE c.estatus = 1
          AND c.torneo_id = $tid
          AND UPPER(TRIM(c.sistema)) = 'MATCH PLAY'
        ORDER BY c.categoria_id ASC";

$rows = query_all($conn, $sql);

$out = [];
foreach ($rows as $r) {
    $players = (int)$r['playerCount'];
    $matches = (int)$r['matchCount'];
    // Solo expone categorías con datos reales (jugadores o bracket).
    if ($players <= 0 && $matches <= 0) continue;
    $out[] = [
        'categoryId'   => $r['categoria_id'],
        'categoryName' => $r['categoria'],
        'shortName'    => $r['abreviatura'],
        'system'       => $r['sistema'],
        'format'       => $r['formato'],
        'tipoed'       => $r['tipoed'],
        'gender'       => $r['sexo'],
        'playerCount'  => $players,
        'matchCount'   => $matches,
        'isParejas'    => (strtoupper((string)$r['formato']) === 'PAREJAS'),
    ];
}

json_response($out);