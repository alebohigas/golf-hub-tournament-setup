<?php
/**
 * Approach Clasificados Endpoint
 * -----------------------------------------------------------------------
 * GET /api/approach_clasificados.php?torneoid=XXX&orden=asc|desc
 *
 * Resumen de CLASIFICADOS DE APPROACH: junta en UNA sola tabla a todos los
 * jugadores registrados en `approachjug` que caen dentro de los parámetros de
 * la competencia (join con `v_approach`: mismo campo, misma categoría y misma
 * descripción de premio).
 *
 * Orden:
 *   1) distancia  (ASC por default; DESC cuando ?orden=desc)
 *   2) fecha/hora de registro ASC  (desempate, igual que Putt Finales)
 *   3) id ASC                       (desempate estable)
 *
 * Respuesta JSON:
 * {
 *   orden: 'asc'|'desc',
 *   total: int,
 *   lastUpdated: string|null,
 *   groups: [{ descripcion, lugares, playerCount }],
 *   players: [{ position, id, name, club, clubLogo, category, group,
 *               distance, fecha }]
 * }
 */
require_once 'config.php';

// ============= Helpers tolerantes a fallas =============

/**
 * safe_all
 * Ejecuta un SELECT y devuelve [] si la consulta falla (tabla/vista
 * inexistente en este torneo), registrando el error solo en error_log
 * para no romper el JSON.
 */
function safe_all($conn, $sql, $label = '') {
    $res = $conn->query($sql);
    if (!$res) {
        error_log("approach_clasificados.php [$label] SQL error: " . $conn->error);
        return [];
    }
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    return $rows;
}

/** safe_run: ejecuta un UPDATE ignorando errores (solo log). */
function safe_run($conn, $sql, $label = '') {
    if (!$conn->query($sql)) {
        error_log("approach_clasificados.php [$label] SQL error: " . $conn->error);
        return false;
    }
    return true;
}

/** column_exists: true si la tabla tiene la columna indicada. */
function column_exists($conn, $table, $column) {
    $res = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    return $res && $res->num_rows > 0;
}

// ============= Parámetros =============

$torneoid = require_param('torneoid');
$tid      = esc($conn, $torneoid);
$orden    = strtolower((string)optional_param('orden', 'asc')) === 'desc' ? 'desc' : 'asc';
$dir      = $orden === 'desc' ? 'DESC' : 'ASC';

// ============= Catálogo de premios (parámetros de la competencia) =============
// `approach.hoyo` guarda el número de LUGARES premiados por grupo.
$prizes = safe_all(
    $conn,
    "SELECT premio AS id, descripcion, hoyo AS lugares,
            LEFT(f_ultfechaapproach(descripcion, torneoid), 16) AS ultact
     FROM approach
     WHERE torneoid = $tid AND premio > 0
     GROUP BY premio, descripcion, hoyo
     ORDER BY premio ASC",
    'prizes_with_fn'
);
if (empty($prizes)) {
    // La función f_ultfechaapproach() es opcional: reintenta sin ella.
    $prizes = safe_all(
        $conn,
        "SELECT premio AS id, descripcion, hoyo AS lugares, NULL AS ultact
         FROM approach
         WHERE torneoid = $tid AND premio > 0
         GROUP BY premio, descripcion, hoyo
         ORDER BY premio ASC",
        'prizes_no_fn'
    );
}

// ============= Reportes seleccionados (site_config.approach_config.grupos) =============
// Admin > Approach permite elegir QUÉ premios/reportes entran al resumen.
// La lista se guarda como `grupos: string[]` (descripciones de premio).
//   - Sin columna / sin config / sin la clave `grupos`  → todos los grupos.
//   - `grupos` presente (aunque vacío)                 → sólo esos grupos.
$selectedGroups = null; // null = sin filtro (todos)
if (column_exists($conn, 'site_config', 'approach_config')) {
    $cfgRows = safe_all(
        $conn,
        "SELECT approach_config FROM site_config WHERE torneoid = $tid LIMIT 1",
        'approach_config'
    );
    if (!empty($cfgRows) && !empty($cfgRows[0]['approach_config'])) {
        $cfg = json_decode($cfgRows[0]['approach_config'], true);
        if (is_array($cfg) && array_key_exists('grupos', $cfg) && is_array($cfg['grupos'])) {
            $selectedGroups = array_map('strval', $cfg['grupos']);
        }
    }
}
if ($selectedGroups !== null) {
    // Recorta el catálogo de premios a los reportes seleccionados.
    $prizes = array_values(array_filter(
        $prizes,
        fn($p) => in_array((string)($p['descripcion'] ?? ''), $selectedGroups, true)
    ));
}

// ============= Marca el mejor registro por jugador =============
// Igual que competencias.php: orden = 1 en la mejor (menor) distancia de cada
// jugador, para que el resumen no repita al mismo jugador varias veces.
safe_run($conn, "UPDATE approachjug SET orden = 0 WHERE torneoid = $tid", 'reset orden');
safe_run(
    $conn,
    "UPDATE approachjug a
     JOIN v_approachunico b
       ON (a.jugadorid = b.jugadorid AND a.distancia = b.mindistancia AND a.torneoid = $tid)
     SET a.orden = 1",
    'set orden'
);
$marked = safe_all($conn, "SELECT COUNT(*) AS cnt FROM approachjug WHERE torneoid = $tid AND orden = 1", 'count orden');
$hasOrden = (int)($marked[0]['cnt'] ?? 0) > 0;

// ============= Columna de fecha/hora de registro =============
// Algunos torneos guardan la marca de tiempo en `ultact`, otros solo en `fecha`.
$timeCol = column_exists($conn, 'approachjug', 'ultact') ? 'a.ultact' : 'a.fecha';

// ============= Jugadores clasificados =============
// Se consulta SIEMPRE en orden ascendente por distancia para poder recortar
// cada grupo/premio a su límite de lugares (`approach.hoyo`). El orden final
// (asc/desc) se aplica después del recorte.
$sql = "SELECT a.id,
               a.jugadorid,
               $timeCol AS registrado,
               ROUND(TRUNCATE(a.distancia, 3), 2) AS distancia,
               CONCAT(j.nombre, ' ', j.apellido) AS jugador,
               cl.nombre AS club,
               cl.logo   AS logo,
               COALESCE(cat.abreviatura, cat.categoria, '') AS categoria,
               c.descripcion AS grupo
        FROM approachjug a
        JOIN jugadores j ON (a.jugadorid = j.id)
        LEFT JOIN clubs cl ON (j.clubid = cl.id)
        LEFT JOIN categorias cat ON (j.categoriaid = cat.categoria_id)
        JOIN v_approach c
          ON (a.campo = c.campo
              AND j.categoriaid = c.categoriaid
              AND a.premiosjugcol = c.descripcion)
        WHERE a.torneoid = $tid
          AND a.distancia > 0
          " . ($hasOrden ? "AND a.orden = 1" : "") . "
        ORDER BY a.distancia ASC, $timeCol ASC, a.id ASC";

$rows = safe_all($conn, $sql, 'clasificados');

// Aplica el filtro de reportes seleccionados también a los jugadores,
// para que los grupos no elegidos queden fuera del reporte final.
if ($selectedGroups !== null) {
    $rows = array_values(array_filter(
        $rows,
        fn($r) => in_array((string)($r['grupo'] ?? ''), $selectedGroups, true)
    ));
}

/**
 * $limits
 * Límite de lugares por grupo/premio, tomado de `approach.hoyo`.
 * Si un grupo no trae límite (0/NULL), se considera sin límite.
 */
$limits = [];
foreach ($prizes as $p) {
    $limits[$p['descripcion'] ?? ''] = (int)($p['lugares'] ?? 0);
}

/**
 * Recorte por grupo: sólo los primeros N jugadores (mejores distancias) de
 * cada premio entran al reporte final. Ej.: 3 premios × 25 lugares = 75.
 */
$kept = [];
$byGroup = [];
foreach ($rows as $r) {
    $grupo = $r['grupo'] ?? '';
    $limit = $limits[$grupo] ?? 0;
    $count = $byGroup[$grupo] ?? 0;
    if ($limit > 0 && $count >= $limit) continue;
    $byGroup[$grupo] = $count + 1;
    $kept[] = $r;
}

/** Orden final: descendente invierte la lista ya recortada. */
if ($orden === 'desc') $kept = array_reverse($kept);

$players = [];
$pos = 0;
foreach ($kept as $r) {
    $pos++;
    $logo = $r['logo'] ?? '';
    $players[] = [
        'position'  => $pos,
        'id'        => (string)$r['jugadorid'],
        'name'      => $r['jugador'],
        'club'      => $r['club'] ?? '',
        'clubLogo'  => $logo ? $LOGOS_BASE_URL . $logo : '',
        'category'  => $r['categoria'] ?? '',
        'group'     => $r['grupo'] ?? '',
        'distance'  => (float)$r['distancia'],
        'fecha'     => $r['registrado'] ? substr((string)$r['registrado'], 0, 16) : null,
    ];
}


/** Resumen por grupo (parámetros de la competencia + cuántos entraron). */
$groups = [];
$lastUpdated = null;
foreach ($prizes as $p) {
    $desc = $p['descripcion'] ?? '';
    $groups[] = [
        'descripcion' => $desc,
        'lugares'     => (int)($p['lugares'] ?? 0),
        'playerCount' => (int)($byGroup[$desc] ?? 0),
    ];
    if (!empty($p['ultact']) && ($lastUpdated === null || $p['ultact'] > $lastUpdated)) {
        $lastUpdated = $p['ultact'];
    }
}

json_response([
    'orden'       => $orden,
    'total'       => count($players),
    'lastUpdated' => $lastUpdated,
    'groups'      => $groups,
    'players'     => $players,
]);
