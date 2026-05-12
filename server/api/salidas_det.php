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

foreach ($groupRows as $group) {
    $salid = esc($conn, $group['id']);

    // ============= Player query — EXACT legacy ORDER BY =============
    // Mirrors the legacy PHP source verbatim. Ordering keys (in priority):
    //   1. salidagrupoid  (tee-time group)
    //   2. accumulated score (acumstbgross/acumsa/acumso) per modality
    //   3. orden            (display order field on the view)
    //   4. f_score_dia_{sat blU|saxU|soxU}(jugadorid)  (last-round score function)
    //   5. tarjetaid DESC   (final deterministic fallback)
    //
    // IMPORTANT: For Stableford the legacy code OVERWRITES the SQL when
    // grossstb=1, switching the score column to `acumso` and the direction
    // to ASC. Replicated below with the same control flow.
    $nameExpr = $isParejas
        ? "CONCAT(nombre, ' ') as jugador"
        : "CONCAT(nombre, ' ', apellido) as jugador";
    $logoCols = $isParejas ? "logo, logo2" : "logo";

    if ($sistema === 'STABLEFORD') {
        if ($gross == 1 || $grossstb == 1) {
            $sql = "SELECT $logoCols, $nameExpr, acumstbgross as sa, sistema, grupoid
                    FROM $viewName
                    WHERE salidagrupoid = $salid
                    ORDER BY salidagrupoid, acumstbgross DESC, orden ASC,
                             f_score_dia_satblU(jugadorid) DESC, tarjetaid DESC";
        } else {
            $sql = "SELECT $logoCols, $nameExpr, acumsa as sa, sistema, grupoid
                    FROM $viewName
                    WHERE salidagrupoid = $salid
                    ORDER BY salidagrupoid, acumsa DESC, orden ASC,
                             f_score_dia_saxU(jugadorid) DESC, tarjetaid DESC";
        }
        // Legacy override: grossstb=1 swaps to acumso ASC ordering.
        if ($grossstb == 1) {
            $sql = "SELECT $logoCols, $nameExpr, acumso as sa, sistema, grupoid
                    FROM $viewName
                    WHERE salidagrupoid = $salid
                    ORDER BY salidagrupoid, acumso, orden DESC,
                             f_score_dia_soxU(jugadorid), tarjetaid DESC";
        }
    } else {
        if ($gross == 1 || $grossstb == 1) {
            $sql = "SELECT $logoCols, $nameExpr, acumso as sa, sistema, grupoid
                    FROM $viewName
                    WHERE salidagrupoid = $salid
                    ORDER BY salidagrupoid, acumso, orden DESC,
                             f_score_dia_soxU(jugadorid), tarjetaid DESC";
        } else {
            $sql = "SELECT $logoCols, $nameExpr, acumsa as sa, sistema, grupoid
                    FROM $viewName
                    WHERE salidagrupoid = $salid
                    ORDER BY salidagrupoid, acumsa, orden DESC,
                             f_score_dia_saxU(jugadorid), tarjetaid DESC";
        }
        // Legacy override: grossstb=1 swaps to acumso ordering.
        if ($grossstb == 1) {
            $sql = "SELECT $logoCols, $nameExpr, acumso as sa, sistema, grupoid
                    FROM $viewName
                    WHERE salidagrupoid = $salid
                    ORDER BY salidagrupoid, acumso, orden DESC,
                             f_score_dia_soxU(jugadorid), tarjetaid DESC";
        }
    }

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
