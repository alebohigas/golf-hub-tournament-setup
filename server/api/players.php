<?php
/**
 * Players Endpoint
 * GET /api/players.php?catid=XXX
 * Returns players for a specific category
 */
require_once 'config.php';

$catid = require_param('catid');
$cid = esc($conn, $catid);

$sql = "SELECT p.id, p.numjugador, p.jugador, c.logo, p.hi, p.hc, p.hn
        FROM players p
        LEFT JOIN clubs c ON p.club_id = c.id
        WHERE p.category_id = '$cid'
        ORDER BY p.jugador ASC";

// Try new schema first, fallback to legacy
$result = $conn->query($sql);
if (!$result) {
    // Legacy schema
    $sql = "SELECT p.id, p.numjugador,
                   CONCAT(p.nombre, ' ', p.apellido) as jugador,
                   c.logo, p.hi, p.hc, p.hn
            FROM jugadores p
            LEFT JOIN clubs c ON (p.clubid = c.id)
            WHERE p.categoriaid = '$cid'
            ORDER BY p.apellido, p.nombre ASC";
    $result = $conn->query($sql);
    if (!$result) {
        json_error('Query failed: ' . $conn->error);
    }
}

$players = [];
while ($row = $result->fetch_assoc()) {
    $players[] = [
        'id'         => $row['id'],
        'numjugador' => $row['numjugador'] ?? '',
        'jugador'    => $row['jugador'],
        'logo'       => $row['logo'] ? $LOGOS_BASE_URL . $row['logo'] : '',
        'hi'         => $row['hi'],
        'hc'         => $row['hc'] ?? '',
        'hn'         => $row['hn'] ?? ''
    ];
}
$result->free();

json_response(['players' => $players]);
