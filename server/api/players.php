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

/** Query: fetch players with club logo and calculated handicaps using DB functions */
$sql = "SELECT p.id, p.numjugador,
               CONCAT(p.nombre, ' ', p.apellido) as jugador,
               c.logo, p.indexjgo as hi,
               f_hdccampo(p.indexjgo, p.teesalidaid, cat.campoid) as hj,
               f_hdccamponeto(p.indexjgo, p.teesalidaid, cat.campoid, cat.porcentaje) as hn,
               p.club, p.sexo, p.estatus, p.equipo, p.fechahandicap
        FROM jugadores p
        LEFT JOIN clubs c ON (p.clubid = c.id)
        LEFT JOIN (
            SELECT cat.categoria_id, cj.campo as campoid, cat.porcentaje
            FROM categorias cat
            JOIN caljuego cj ON (cat.categoria_id = cj.categoriaid)
            WHERE cat.categoria_id = '$cid'
            LIMIT 1
        ) cat ON (p.categoriaid = cat.categoria_id)
        WHERE p.categoriaid = '$cid' AND p.torneoid = $tid
        ORDER BY p.apellido, p.nombre ASC";

$result = $conn->query($sql);
if (!$result) {
    json_error('Query failed: ' . $conn->error);
}

$players = [];
$fechaHandicap = '';  // Same for all players in category
while ($row = $result->fetch_assoc()) {
    // Capture fechahandicap from first row (same for all players in category)
    if (empty($fechaHandicap) && !empty($row['fechahandicap']) && $row['fechahandicap'] !== '0000-00-00') {
        $fechaHandicap = $row['fechahandicap'];
    }
    $players[] = [
        'id'         => $row['id'],
        'numjugador' => $row['numjugador'] ?? '',
        'jugador'    => $row['jugador'],
        'logo'       => $row['logo'] ? $LOGOS_BASE_URL . $row['logo'] : '',
        'hi'         => $row['hi'] ?? '0',
        'hj'         => $row['hj'] ?? '0',
        'hn'         => $row['hn'] ?? '0',
        'club'       => $row['club'] ?? '',
        'sexo'       => $row['sexo'] ?? '',
        'estatus'    => $row['estatus'] ?? 'NORMAL'
    ];
}
$result->free();

json_response(['players' => $players, 'fechaHandicap' => $fechaHandicap]);