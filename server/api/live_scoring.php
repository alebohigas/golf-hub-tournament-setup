<?php
/**
 * Live Scoring Leaderboard Endpoint
 * GET /api/live_scoring.php?catid=XXX&torneoid=XXX&tipo=stroke|stableford&gross=0|1
 * 
 * Returns real-time leaderboard using legacy views:
 *   Stableford: v_sumsa, v_sumsarr, v_difpar_ulttarjeta_stb
 *   Stableford Neto: v_sumsa, v_sumsarr, v_difpar_ulttarjeta_neto
 *   Stroke:     v_difpar_jugador, v_difpar_ulttarjeta
 */
require_once 'config.php';

$catid    = require_param('catid');
$torneoid = require_param('torneoid');
$tipo     = optional_param('tipo', 'stroke');
$gross    = optional_param('gross', '0');

$cid = esc($conn, $catid);
$tid = esc($conn, $torneoid);

// ── Category info ──
$sql = "SELECT categoria_id, categoria, abreviatura, sistema, formato, salida, porcentaje
        FROM categorias WHERE categoria_id = $cid";
$catInfo = query_one($conn, $sql);
if (!$catInfo) { json_error('Category not found', 404); }

// ── Course info (par, rating, slope) ──
$salidaid = esc($conn, $catInfo['salida']);
$sql = "SELECT b.campoid, rating, slope, tee, parcampo
        FROM caljuego a
        JOIN campo_tee b ON (a.campo = b.campoid AND categoriaid = $cid AND salidaid = $salidaid)
        JOIN salidas s ON (b.salidaid = s.id)
        LIMIT 1";
$courseInfo = query_one($conn, $sql);
$parcampo = (int)($courseInfo['parcampo'] ?? 72);

// ── Determine scoring system ──
$sistema = strtoupper($catInfo['sistema'] ?? '');
$isStableford = ($sistema === 'STABLEFORD' || $tipo === 'stableford');

// ── Build leaderboard query based on scoring system ──
if ($isStableford) {
    /**
     * Stableford query — mirrors legacy livescoring_stableford.php
     * Joins: jugadores → clubs, v_sumsa (total SA), v_sumsarr (previous round SA + progress),
     *        v_difpar_ulttarjeta_stb (current round stableford detail)
     * For NETO uses v_difpar_ulttarjeta_neto instead
     */
    $ultTarView = ($gross == '1') ? 'v_difpar_ulttarjeta_stb' : 'v_difpar_ulttarjeta_neto';
    $orderDir   = 'DESC';  // Stableford: higher = better

    $sql = "SELECT a.id AS jugadorid, numjugador,
                   CONCAT(nombre, ' ', apellido) AS jugador,
                   IF(c.avance IS NULL, 0, c.avance) AS avance,
                   IF(c.sumsa IS NULL, 0, c.sumsa) AS sumsault,
                   b.sumsa,
                   a.estatus AS estatjug,
                   club,
                   cl.logo AS juglogoclub,
                   v.sa
            FROM jugadores AS a
            JOIN clubs AS cl ON (a.clubid = cl.id AND estatus = 'NORMAL')
            JOIN v_sumsa AS b ON (a.id = b.jugadorid)
            LEFT JOIN v_sumsarr AS c ON (a.id = c.jugadorid)
            LEFT JOIN $ultTarView AS v ON (a.id = v.jugadorid)
            WHERE a.categoriaid = $cid
            ORDER BY b.sumsa $orderDir";

} else {
    /**
     * Stroke Play query — mirrors legacy live_scoring_det_neto.php
     * Joins: jugadores → clubs, v_difpar_jugador (accumulated diff to par),
     *        v_difpar_ulttarjeta (current round detail)
     * ORDER: ASC by difpar (fewer strokes = better), then DESC avance (more progress = tiebreak)
     */
    $orderDir = 'ASC';

    $sql = "SELECT b.id AS jugadorid, b.nombre, apellido,
                   b.estatus AS estatjug,
                   club,
                   b.indexjgo,
                   cl.logo AS juglogoclub,
                   dif.difpar,
                   v.difpar_ulttar AS difparulttar,
                   v.avance AS avance_ulttar
            FROM jugadores AS b
            JOIN clubs AS cl ON (b.clubid = cl.id)
            JOIN v_difpar_jugador AS dif ON (dif.jugadorid = b.id)
            JOIN v_difpar_ulttarjeta AS v ON (b.id = v.jugadorid)
            WHERE b.ESTATUS = 'NORMAL' AND b.categoriaid = $cid
            ORDER BY if(v.avance=0,999,dif.difpar) ASC, dif.difpar ASC, v.avance DESC";
}

$rows = query_all($conn, $sql);

// ── Format response ──
$players = [];
$pos = 0;

foreach ($rows as $row) {
    $pos++;

    if ($isStableford) {
        /**
         * Stableford player mapping:
         *   score    = sumsa (total accumulated stableford points)
         *   prevRoundScore = sumsault (previous round accumulated)
         *   thru     = avance (holes completed in current round)
         *   todayScore = sa (current round stableford points)
         */
        $players[] = [
            'position'       => $pos,
            'playerId'       => $row['jugadorid'],
            'number'         => $row['numjugador'] ?? '',
            'name'           => $row['jugador'],
            'clubLogo'       => $row['juglogoclub'] ? $LOGOS_BASE_URL . $row['juglogoclub'] : '',
            'club'           => $row['club'] ?? '',
            'score'          => (int)($row['sumsa'] ?? 0),
            'prevRoundScore' => (int)($row['sumsault'] ?? 0),
            'todayScore'     => (int)($row['sa'] ?? 0),
            'thru'           => (int)($row['avance'] ?? 0),
            'status'         => $row['estatjug'] ?? '',
        ];
    } else {
        /**
         * Stroke player mapping:
         *   score       = difpar (accumulated difference to par, negative = under par)
         *   todayScore  = difparulttar (current round diff to par)
         *   thru        = avance_ulttar (holes completed in current round)
         *   handicap    = indexjgo (player's playing handicap index)
         */
        $playerName = trim(($row['nombre'] ?? '') . ' ' . ($row['apellido'] ?? ''));
        $players[] = [
            'position'       => $pos,
            'playerId'       => $row['jugadorid'],
            'name'           => $playerName,
            'clubLogo'       => $row['juglogoclub'] ? $LOGOS_BASE_URL . $row['juglogoclub'] : '',
            'club'           => $row['club'] ?? '',
            'score'          => (int)($row['difpar'] ?? 0),
            'todayScore'     => (int)($row['difparulttar'] ?? 0),
            'thru'           => (int)($row['avance_ulttar'] ?? 0),
            'handicap'       => $row['indexjgo'] ?? '',
            'status'         => $row['estatjug'] ?? '',
        ];
    }
}

json_response([
    'categoryId'   => $catInfo['categoria_id'],
    'categoryName' => $catInfo['categoria'],
    'shortName'    => $catInfo['abreviatura'],
    'system'       => $catInfo['sistema'],
    'type'         => $isStableford ? 'stableford' : 'stroke',
    'gross'        => (int)$gross,
    'par'          => $parcampo,
    'course'       => $courseInfo ? [
        'rating' => (float)($courseInfo['rating'] ?? 0),
        'slope'  => (int)($courseInfo['slope'] ?? 0),
        'tee'    => $courseInfo['tee'] ?? ''
    ] : null,
    'players'      => $players
]);
