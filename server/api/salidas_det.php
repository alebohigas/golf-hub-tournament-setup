<?php
/**
 * Salidas Detail Endpoint
 * GET /api/salidas_det.php?caljgoid=XXX&formato=individual|parejas
 * Returns tee time groups with players for a specific calendar game
 */
require_once 'config.php';

$caljgoid = require_param('caljgoid');
$formato  = optional_param('formato', 'individual');
$formato='individual';

$cgid = esc($conn, $caljgoid);

// ============= Calendar game + category info =============
$sql = "SELECT a.id, a.torneoid, a.fecha, a.campo, a.categoriaid,
               b.abreviatura, b.categoria, b.sistema, b.gross, b.grossstb,
               s.tee, c.campo as campo_nombre
        FROM caljuego a
        JOIN categorias b ON (a.categoriaid = b.categoria_id)
        JOIN salidas s ON (b.salida = s.id)
        JOIN campos c ON (a.campo = c.id)
        WHERE a.id = $cgid";

$calInfo = query_one($conn, $sql);
if (!$calInfo) {
    // Return empty response if calendar game not found (no salidas generated)
    json_response([
        'caljgoid'     => $caljgoid,
        'date'         => '',
        'course'       => '',
        'categoryId'   => '',
        'categoryName' => '',
        'shortName'    => '',
        'system'       => '',
        'tee'          => '',
        'groups'       => []
    ]);
    exit;
}

$sistema  = strtoupper($calInfo['sistema']);
$gross    = (int)$calInfo['gross'];
$grossstb = (int)($calInfo['grossstb'] ?? 0);

// ============= Last-complete-round tiebreaker helpers =============
/**
 * Builds a scalar SQL subquery for the player's score in the latest completed
 * round available for this category. It is used only as a tie-breaker after
 * the tee-slot (`grupoid`) and accumulated score (`acumsa/acumso`) ordering.
 */
function salidas_round_score_expr($playerAlias, $roundDate, $torneoid, $scoreCol) {
    if (!$roundDate) return 'NULL';
    $cardScoreCol = ($scoreCol === 'acumso') ? 'SO' : (($scoreCol === 'acumstbgross') ? 'totstbgross' : 'SA');
    return "(SELECT IFNULL(t.$cardScoreCol, 0)
             FROM tarjetas t
             WHERE t.jugadorid = $playerAlias.jugadorid
               AND t.torneoid = $torneoid
               AND DATE(t.fecha_juego) = '$roundDate'
               AND t.statlsc = 1
             LIMIT 1)";
}

/**
 * Builds a scalar SQL subquery that sums the official last-round tie-breaker
 * hole ranges: H10-H18, H13-H18, H16-H18 and H18.
 */
function salidas_hole_chunk_expr($playerAlias, $roundDate, $torneoid, $holeSource, $holes) {
    if (!$roundDate) return 'NULL';
    $parts = [];
    foreach ($holes as $h) {
        if ($holeSource === 'h') {
            $parts[] = "IFNULL(t.h{$h}, 0)";
        } elseif ($holeSource === 'h_a') {
            $parts[] = "IFNULL(t.h{$h}_a, 0)";
        } elseif ($holeSource === 'arsa' || $holeSource === 'arstbgross') {
            $parts[] = "CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(t.{$holeSource}, ',', {$h}), ',', -1) AS SIGNED)";
        } else {
            $parts[] = '0';
        }
    }
    $sum = implode(' + ', $parts);
    return "(SELECT IFNULL($sum, 0)
             FROM tarjetas t
             WHERE t.jugadorid = $playerAlias.jugadorid
               AND t.torneoid = $torneoid
               AND DATE(t.fecha_juego) = '$roundDate'
               AND t.statlsc = 1
             LIMIT 1)";
}

// ============= Get tee time groups =============
$sql = "SELECT a.id, LEFT(RIGHT(horainicio1a, 8), 5) as hora,
               c.tee, teesal, b.gross
        FROM salidagrupo a
        JOIN categorias b ON (a.categoriaid = b.categoria_id AND caljuegoid = $cgid)
        JOIN salidas c ON (c.id = b.salida)
        ORDER BY a.id";

$groupRows = query_all($conn, $sql);

// ============= Build groups with players =============
$groups = [];
$isParejas = ($formato === 'parejas');

// Determine view name based on format
$viewName = $isParejas ? 'v_sal_jug_par' : 'v_sal_jug';

/** Latest completed round date for this category up to the requested tee sheet date. */
$catId = esc($conn, $calInfo['categoriaid']);
$tid = esc($conn, $calInfo['torneoid']);
$currentDate = esc($conn, $calInfo['fecha']);
$eligibleWhere = "j.categoriaid = $catId AND j.torneoid = $tid AND j.estatus = 'NORMAL'";
if ($gross !== 1 && $grossstb !== 1) { $eligibleWhere .= " AND j.campgross = 0"; }

$lastCompleteRow = query_one($conn, "SELECT cj.fecha
                                     FROM caljuego cj
                                     JOIN tarjetas t ON (DATE(t.fecha_juego) = DATE(cj.fecha)
                                                      AND t.torneoid = $tid
                                                      AND t.statlsc = 1)
                                     JOIN jugadores j ON (j.id = t.jugadorid)
                                     WHERE cj.categoriaid = $catId
                                       AND cj.campo > 0
                                       AND DATE(cj.fecha) <= DATE('$currentDate')
                                       AND $eligibleWhere
                                     GROUP BY cj.fecha
                                     HAVING COUNT(DISTINCT t.jugadorid) >= (
                                         SELECT COUNT(*) FROM jugadores j WHERE $eligibleWhere
                                     )
                                     ORDER BY cj.fecha DESC
                                     LIMIT 1");
$lastCompleteDate = $lastCompleteRow['fecha'] ?? '';

//echo $viewName.'  '.$formato.'<br>';

foreach ($groupRows as $group) {
    $salid = esc($conn, $group['id']);

    // Build player query based on system and gross.
    // IMPORTANT: legacy /salidas does NOT reorder players by score inside a
    // tee-time group. Players are listed in their assigned slot order using
    // grupoid DESC, matching the requested inverted visible player order exactly.
    if ($sistema === 'STABLEFORD') {
        // Pick the displayed score column based on gross flags
        $scoreCol = ($gross == 1 || $grossstb == 1) ? 'acumstbgross' : 'acumsa';
        if ($isParejas) {
            $sql = "SELECT logo, logo2, CONCAT(nombre, ' ') as jugador,
                           $scoreCol as sa, sistema
                    FROM $viewName
                    WHERE salidagrupoid = $salid
                    ORDER BY grupoid, $scoreCol ASC";
        } else {
            $sql = "SELECT logo, CONCAT(nombre, ' ', apellido) as jugador,
                           $scoreCol as sa, sistema, grupoid
                    FROM $viewName
                    WHERE salidagrupoid = $salid
                    ORDER BY grupoid, $scoreCol ASC";
        }
    } else {
        // Stroke Play - use gross (acumso) or net (acumsa) for display only
        $scoreCol = ($gross == 1) ? 'acumso' : 'acumsa';
        if ($isParejas) {
            $sql = "SELECT logo, logo2, CONCAT(nombre, ' ') as jugador,
                           $scoreCol as sa, sistema
                    FROM $viewName
                    WHERE salidagrupoid = $salid
                    ORDER BY grupoid, $scoreCol ASC";
        } else {
            $sql = "SELECT logo, CONCAT(nombre, ' ', apellido) as jugador,
                           $scoreCol as sa, sistema, grupoid
                    FROM $viewName
                    WHERE salidagrupoid = $salid
                    ORDER BY grupoid, $scoreCol ASC";
        }
    }

//echo $sql.'<br>';
    $playerRows = query_all($conn, $sql);

    $players = [];
    foreach ($playerRows as $pr) {
        $player = [
            'name'     => trim($pr['jugador']),
            'clubLogo' => $pr['logo'] ? $LOGOS_BASE_URL . $pr['logo'] : '',
            'score'    => (int)($pr['sa'] ?? 0),
            'system'   => $pr['sistema'] ?? ''
        ];
        if ($isParejas && isset($pr['logo2'])) {
            $player['clubLogo2'] = $pr['logo2'] ? $LOGOS_BASE_URL . $pr['logo2'] : '';
        }
        if (isset($pr['grupoid'])) {
            $player['groupId'] = $pr['grupoid'];
        }
        $players[] = $player;
    }

    $groups[] = [
        'id'      => $group['id'],
        'tee'     => $group['teesal'] ?? $group['tee'] ?? '',
        'time'    => $group['hora'] ?? '',
        'players' => $players
    ];
}

json_response([
    'caljgoid'     => $caljgoid,
    'date'         => $calInfo['fecha'],
    'course'       => $calInfo['campo_nombre'],
    'categoryId'   => $calInfo['categoriaid'],
    'categoryName' => $calInfo['categoria'],
    'shortName'    => $calInfo['abreviatura'],
    'system'       => $calInfo['sistema'],
    'tee'          => $calInfo['tee'],
    'groups'       => $groups
]);
