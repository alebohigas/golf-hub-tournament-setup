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

//echo $viewName.'  '.$formato.'<br>';

foreach ($groupRows as $group) {
    $salid = esc($conn, $group['id']);

    // Build player query based on system and gross.
    // Salidas is a tee-sheet view, so the order inside each group must follow
    // the explicit tarjeta.orden position instead of leaderboard/tiebreak sort.
    if ($sistema === 'STABLEFORD') {
        if ($gross == 1 || $grossstb == 1) {
            // Stableford Gross — higher points first, then orden ASC, then last-card stableford gross score, then tarjetaid DESC
            if ($isParejas) {
                $sql = "SELECT logo, logo2, CONCAT(nombre, ' ') as jugador,
                               acumstbgross as sa, sistema
                        FROM $viewName
                        WHERE salidagrupoid = $salid
                        ORDER BY salidagrupoid, orden ASC, tarjetaid ASC";
            } else {
                $sql = "SELECT logo, CONCAT(nombre, ' ', apellido) as jugador,
                               acumstbgross as sa, sistema, grupoid
                        FROM $viewName
                        WHERE salidagrupoid = $salid
                        ORDER BY salidagrupoid, orden ASC, tarjetaid ASC";
            }
        } else {
            // Stableford Neto — higher net stableford points first, then orden ASC, then last-card neto stableford score, then tarjetaid DESC
            if ($isParejas) {
                $sql = "SELECT logo, logo2, CONCAT(nombre, ' ') as jugador,
                               acumsa as sa, sistema
                        FROM $viewName
                        WHERE salidagrupoid = $salid
                        ORDER BY salidagrupoid, orden ASC, tarjetaid ASC";
            } else {
                $sql = "SELECT logo, CONCAT(nombre, ' ', apellido) as jugador,
                               acumsa as sa, sistema, grupoid
                        FROM $viewName
                        WHERE salidagrupoid = $salid
                        ORDER BY salidagrupoid, orden ASC, tarjetaid ASC";
            }
        }
    } else {
        // Stroke Play — lower strokes first (ASC), then orden DESC, then last-card score ASC, then tarjetaid DESC
        $scoreCol = ($gross == 1) ? 'acumso' : 'acumsa';
        $tieFn    = ($gross == 1) ? 'f_score_dia_soxU' : 'f_score_dia_saxU';
        if ($isParejas) {
            $sql = "SELECT logo, logo2, CONCAT(nombre, ' ') as jugador,
                           $scoreCol as sa, sistema
                    FROM $viewName
                    WHERE salidagrupoid = $salid
                    ORDER BY salidagrupoid, $scoreCol ASC, orden DESC, $tieFn(jugadorid) ASC, tarjetaid DESC";
        } else {
            $sql = "SELECT logo, CONCAT(nombre, ' ', apellido) as jugador,
                           $scoreCol as sa, sistema, grupoid
                    FROM $viewName
                    WHERE salidagrupoid = $salid
                    ORDER BY salidagrupoid, $scoreCol ASC, orden DESC, $tieFn(jugadorid) ASC, tarjetaid DESC";
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
