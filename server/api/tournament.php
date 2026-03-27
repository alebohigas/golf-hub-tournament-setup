<?php
/**
 * Tournament Info Endpoint
 * GET /api/tournament.php?torneoid=XXX
 * Returns tournament details and statistics
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

// Tournament info
$sql = "SELECT a.torneo_id, a.nombre, a.fecha_ini, a.fecha_fin, a.status,
               a.logo, a.formato, a.estilo, a.sistemajuego, a.tipotorneo,
               a.color_cinta, a.imagen_gif,
               b.nombre as club, b.logo as club_logo
        FROM torneo a
        JOIN clubs b ON (a.club_id = b.id)
        WHERE a.torneo_id = $tid";

$torneo = query_one($conn, $sql);
if (!$torneo) {
    json_error('Tournament not found', 404);
}

// Player count
$sql = "SELECT COUNT(*) as total FROM jugadores WHERE torneoid = $tid";
$stats = query_one($conn, $sql);

// Category count
$sql = "SELECT COUNT(*) as total FROM categorias WHERE torneo_id = $tid AND estatus = 1";
$catStats = query_one($conn, $sql);

// Days of play
$sql = "SELECT COUNT(DISTINCT fecha) as total FROM caljuego WHERE torneoid = $tid AND campo > 0";
$dayStats = query_one($conn, $sql);

// Years of history: calculate from min/max fecha_ini for same club_id
$clubId = esc($conn, $torneo['club_id'] ?? 0);
$sql = "SELECT MIN(YEAR(fecha_ini)) as min_year, MAX(YEAR(fecha_ini)) as max_year
        FROM torneo
        WHERE club_id = (SELECT club_id FROM torneo WHERE torneo_id = $tid)";
$yearStats = query_one($conn, $sql);
$yearsHistory = 0;
if ($yearStats && $yearStats['min_year'] && $yearStats['max_year']) {
    $yearsHistory = (int)$yearStats['max_year'] - (int)$yearStats['min_year'];
}

json_response([
    'id'          => $torneo['torneo_id'],
    'name'        => $torneo['nombre'],
    'club'        => $torneo['club'],
    'clubLogo'    => $torneo['club_logo'] ? $LOGOS_BASE_URL . $torneo['club_logo'] : null,
    'logo'        => $torneo['logo'] ? $LOGOS_BASE_URL . $torneo['logo'] : null,
    'startDate'   => $torneo['fecha_ini'],
    'endDate'     => $torneo['fecha_fin'],
    'status'      => $torneo['status'],
    'format'      => $torneo['formato'],
    'style'       => $torneo['estilo'],
    'system'      => $torneo['sistemajuego'],
    'type'        => $torneo['tipotorneo'],
    'ribbonColor' => $torneo['color_cinta'],
    'heroImage'   => $torneo['imagen_gif'] ? $LOGOS_BASE_URL . $torneo['imagen_gif'] : null,
    'stats' => [
        'players'      => (int)($stats['total'] ?? 0),
        'categories'   => (int)($catStats['total'] ?? 0),
        'days'         => (int)($dayStats['total'] ?? 0),
        'yearsHistory' => $yearsHistory
    ]
]);
