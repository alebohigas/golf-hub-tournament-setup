<?php
/**
 * Salidas Detail Endpoint
 * GET /api/salidas_det.php?caljgoid=XXX&formato=individual|parejas
 * Returns tee time groups with players for a specific calendar game
 */
require_once 'config.php';

$caljgoid = require_param('caljgoid');
$formato  = optional_param('formato', 'individual');
/*
 * NOTA: previamente esta línea forzaba `$formato='individual';`, lo que
 * provocaba que las categorías de PAREJAS regresaran sólo 1 jugador por
 * pareja (el primero) en el grid de Salidas. Se elimina ese hard-code para
 * que la rama de parejas use `v_sal_jug_par` + nombres de ambos jugadores.
 */

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

/**
 * MATCH PLAY: mapa jugadorid → { match, side }.
 * Los enfrentamientos viven en la tabla legacy `elimin_salidas_cat`
 * (`matchx` = número de match, `jugida` = lado 1, `jugidb` = lado 2).
 * Con este mapa las salidas se agrupan por match (2 matches = 4 jugadores)
 * y el frontend puede intercalar el separador "VS" entre ambos lados.
 */
$isMatchPlay = ($sistema === 'MATCH PLAY');
$matchByPlayer = [];
if ($isMatchPlay) {
    $catid = esc($conn, $calInfo['categoriaid']);
    $mrows = query_all(
        $conn,
        "SELECT matchx, jugida, jugidb, hoyo
           FROM elimin_salidas_cat
          WHERE catid = $catid
          ORDER BY matchx ASC"
    );
    foreach (($mrows ?: []) as $m) {
        $mx = (int)$m['matchx'];
        if ((int)$m['jugida'] > 0) {
            $matchByPlayer[(int)$m['jugida']] = ['match' => $mx, 'side' => 1, 'hoyo' => $m['hoyo'] ?? null];
        }
        if ((int)$m['jugidb'] > 0) {
            $matchByPlayer[(int)$m['jugidb']] = ['match' => $mx, 'side' => 2, 'hoyo' => $m['hoyo'] ?? null];
        }
    }
}

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
        ? "CONCAT(j.nombre, ' ', j.apellido) as jugador,
           CONCAT(j2.nombre, ' ', j2.apellido) as jugador2"
        : "CONCAT(nombre, ' ', apellido) as jugador";
    // Prefijo para resolver ambigüedad de columnas en la rama de parejas.
    $P = $isParejas ? 'v.' : '';
    // v_sal_jug_par no expone `logo2`; el segundo logo se trae desde la pareja j2->club.
    // `jugadorid` se incluye SIEMPRE: es la llave usada para cruzar contra
    // `elimin_salidas_cat` y agrupar por MATCH en categorías MATCH PLAY.
    $logoCols = ($isParejas ? "v.logo, c2.logo as logo2" : "logo")
              . ", {$P}jugadorid as jugadorid";


    /*
     * En parejas hacemos JOIN extra a v_jugadores_parejas + jugadores para
     * recuperar nombre/apellido de AMBOS integrantes de la pareja. El view
     * v_sal_jug_par sólo expone el primer jugador, por eso antes el frontend
     * sólo mostraba 2 nombres (un capitán por pareja) en lugar de los 4.
     */
    $parejasJoin = $isParejas
        ? " JOIN v_jugadores_parejas vp ON (v.jugadorid = vp.jugadorid)
            JOIN jugadores j  ON (vp.jugadorid  = j.id)
            JOIN jugadores j2 ON (vp.jugadorid2 = j2.id)
            LEFT JOIN clubs c2 ON (j2.clubid = c2.id)"
        : "";
    /* En parejas aliasamos la tabla principal como `v` para evitar columnas ambiguas
     * (logo, jugadorid, salidagrupoid) cuando hacemos JOIN a jugadores/clubs adicionales. */
    $fromExpr = $isParejas ? "$viewName v" : $viewName;

    // Prefijos para resolver ambigüedad de columnas en la rama de parejas.
    $P = $isParejas ? 'v.' : '';

    if ($sistema === 'STABLEFORD') {
        if ($gross == 1 || $grossstb == 1) {
            $sql = "SELECT $logoCols, $nameExpr, {$P}acumstbgross as sa, {$P}sistema, {$P}grupoid
                    FROM $fromExpr$parejasJoin
                    WHERE {$P}salidagrupoid = $salid
                    ORDER BY {$P}salidagrupoid, {$P}acumstbgross DESC, {$P}orden ASC,
                             f_score_dia_satblU({$P}jugadorid) DESC, {$P}tarjetaid DESC";
        } else {
            $sql = "SELECT $logoCols, $nameExpr, {$P}acumsa as sa, {$P}sistema, {$P}grupoid
                    FROM $fromExpr$parejasJoin
                    WHERE {$P}salidagrupoid = $salid
                    ORDER BY {$P}salidagrupoid, {$P}acumsa DESC, {$P}orden ASC,
                             f_score_dia_saxU({$P}jugadorid) DESC, {$P}tarjetaid DESC";
        }
        // Legacy override: grossstb=1 swaps to acumso ASC ordering.
        if ($grossstb == 1) {
            $sql = "SELECT $logoCols, $nameExpr, {$P}acumso as sa, {$P}sistema, {$P}grupoid
                    FROM $fromExpr$parejasJoin
                    WHERE {$P}salidagrupoid = $salid
                    ORDER BY {$P}salidagrupoid, {$P}acumso, {$P}orden DESC,
                             f_score_dia_soxU({$P}jugadorid), {$P}tarjetaid DESC";
        }
    } else {
        if ($gross == 1 || $grossstb == 1) {
            $sql = "SELECT $logoCols, $nameExpr, {$P}acumso as sa, {$P}sistema, {$P}grupoid
                    FROM $fromExpr$parejasJoin
                    WHERE {$P}salidagrupoid = $salid
                    ORDER BY {$P}salidagrupoid, {$P}acumso, {$P}orden DESC,
                             f_score_dia_soxU({$P}jugadorid), {$P}tarjetaid DESC";
        } else {
            $sql = "SELECT $logoCols, $nameExpr, {$P}acumsa as sa, {$P}sistema, {$P}grupoid
                    FROM $fromExpr$parejasJoin
                    WHERE {$P}salidagrupoid = $salid
                    ORDER BY {$P}salidagrupoid, {$P}acumsa, {$P}orden DESC,
                             f_score_dia_saxU({$P}jugadorid), {$P}tarjetaid DESC";
        }
        // Legacy override: grossstb=1 swaps to acumso ordering.
        if ($grossstb == 1) {
            $sql = "SELECT $logoCols, $nameExpr, {$P}acumso as sa, {$P}sistema, {$P}grupoid
                    FROM $fromExpr$parejasJoin
                    WHERE {$P}salidagrupoid = $salid
                    ORDER BY {$P}salidagrupoid, {$P}acumso, {$P}orden DESC,
                             f_score_dia_soxU({$P}jugadorid), {$P}tarjetaid DESC";
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
            /* Logo del club del segundo integrante de la pareja. */
            $player['clubLogo2'] = $pr['logo2'] ? $LOGOS_BASE_URL . $pr['logo2'] : '';
        }
        if ($isParejas && isset($pr['jugador2'])) {
            /* Nombre completo del segundo integrante de la pareja — usado en el
             * frontend para renderizar la pareja en dos renglones (uno por jugador). */
            $player['partner'] = trim($pr['jugador2']);
        }
        if (isset($pr['grupoid'])) {
            $player['groupId'] = $pr['grupoid'];
        }
        /* MATCH PLAY: adjunta número de match y lado (1|2) para que el
         * frontend agrupe a los jugadores por enfrentamiento e inserte "VS". */
        if ($isMatchPlay) {
            $jid = (int)($pr['jugadorid'] ?? 0);
            if ($jid > 0 && isset($matchByPlayer[$jid])) {
                $player['matchNo']   = $matchByPlayer[$jid]['match'];
                $player['matchSide'] = $matchByPlayer[$jid]['side'];
            }
        }
        $players[] = $player;
    }

    /* Ordena por match y lado dentro del grupo de salida, para que los dos
     * jugadores de un mismo match queden siempre juntos y en orden 1 → 2. */
    if ($isMatchPlay) {
        usort($players, function ($a, $b) {
            $ma = $a['matchNo']   ?? PHP_INT_MAX;
            $mb = $b['matchNo']   ?? PHP_INT_MAX;
            if ($ma !== $mb) return $ma <=> $mb;
            return (($a['matchSide'] ?? 9) <=> ($b['matchSide'] ?? 9));
        });
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
    /* Bandera para que el frontend active el render agrupado por match + "VS". */
    'isMatchPlay'  => $isMatchPlay,
    'groups'       => $groups

]);
