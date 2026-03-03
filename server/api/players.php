<?php
/**
 * Players Endpoint
 * GET /api/players.php?torneoid=XXX&catid=XXX
 * Returns players for a specific category
 * Uses: jugadores table joined with clubs for logo
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$catid = require_param('catid');
$cid = esc($conn, $catid);
$tid = esc($conn, $torneoid);

/** Query: fetch players with club logo, using real column names from jugadores table */
$sql = "SELECT p.id, p.numjugador,
               CONCAT(p.nombre, ' ', p.apellido) as jugador,
               c.logo, p.hcpindex, p.indexjgo, p.club,
               p.sexo, p.estatus, p.equipo
        FROM jugadores p
        LEFT JOIN clubs c ON (p.clubid = c.id)
        WHERE p.categoriaid = '$cid' AND p.torneoid = $tid
        ORDER BY p.apellido, p.nombre ASC";

$result = $conn->query($sql);
if (!$result) {
    json_error('Query failed: ' . $conn->error);
}

$players = [];
while ($row = $result->fetch_assoc()) {
    $players[] = [
        'id'         => $row['id'],
        'numjugador' => $row['numjugador'] ?? '',
        'jugador'    => $row['jugador'],
        'logo'       => $row['logo'] ? $LOGOS_BASE_URL . $row['logo'] : '',
        'hi'         => $row['hcpindex'] ?? '0',
        'hj'         => $row['indexjgo'] ?? '0',
        'club'       => $row['club'] ?? '',
        'sexo'       => $row['sexo'] ?? '',
        'estatus'    => $row['estatus'] ?? 'NORMAL'
    ];
}
$result->free();

json_response(['players' => $players]);