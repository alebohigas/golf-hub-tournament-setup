<?php
/**
 * Eliminación Directa (Match Play Brackets) Endpoint
 * GET /api/resultados_ed.php?catid=XXX&torneoid=XXX
 * Returns bracket matches for 16-player single elimination
 */
require_once 'config.php';

$catid    = require_param('catid');
$torneoid = require_param('torneoid');

$cid = esc($conn, $catid);
$tid = esc($conn, $torneoid);

// Category info
$sql = "SELECT categoria_id, categoria, abreviatura
        FROM categorias WHERE categoria_id = $cid";
$catInfo = query_one($conn, $sql);
if (!$catInfo) { json_error('Category not found', 404); }

// Bracket matches (IDs 101-115 for 16-player bracket)
$sql = "SELECT matchid, jugadorid1, jugador1, jugadorid2, jugador2,
               gano, hoyo, resultado, ronda, posicion,
               logo1, logo2, club1, club2
        FROM v_equipo_ed
        WHERE categoriaid = $cid AND torneoid = $tid
        ORDER BY matchid ASC";

$result = $conn->query($sql);

// If v_equipo_ed doesn't exist, try alternative
if (!$result) {
    $sql = "SELECT e.id as matchid,
                   e.jugadorid1, CONCAT(j1.nombre, ' ', j1.apellido) as jugador1,
                   e.jugadorid2, CONCAT(j2.nombre, ' ', j2.apellido) as jugador2,
                   e.gano, e.hoyo, e.resultado, e.ronda, e.posicion,
                   c1.logo as logo1, c2.logo as logo2,
                   c1.nombre as club1, c2.nombre as club2
            FROM eliminacion_directa e
            LEFT JOIN jugadores j1 ON (e.jugadorid1 = j1.id)
            LEFT JOIN jugadores j2 ON (e.jugadorid2 = j2.id)
            LEFT JOIN clubs c1 ON (j1.clubid = c1.id)
            LEFT JOIN clubs c2 ON (j2.clubid = c2.id)
            WHERE e.categoriaid = $cid AND e.torneoid = $tid
            ORDER BY e.id ASC";
    $result = $conn->query($sql);
    if (!$result) { json_error('Query failed: ' . $conn->error); }
}

$matches = [];
while ($row = $result->fetch_assoc()) {
    $matches[] = [
        'matchId'    => (int)$row['matchid'],
        'player1'    => [
            'id'       => $row['jugadorid1'],
            'name'     => $row['jugador1'],
            'clubLogo' => $row['logo1'] ? $LOGOS_BASE_URL . $row['logo1'] : '',
            'club'     => $row['club1'] ?? ''
        ],
        'player2'    => [
            'id'       => $row['jugadorid2'],
            'name'     => $row['jugador2'],
            'clubLogo' => $row['logo2'] ? $LOGOS_BASE_URL . $row['logo2'] : '',
            'club'     => $row['club2'] ?? ''
        ],
        'winner'     => $row['gano'],
        'hole'       => $row['hoyo'],
        'result'     => $row['resultado'],
        'round'      => (int)($row['ronda'] ?? 0),
        'position'   => (int)($row['posicion'] ?? 0)
    ];
}
$result->free();

json_response([
    'categoryId'   => $catInfo['categoria_id'],
    'categoryName' => $catInfo['categoria'],
    'shortName'    => $catInfo['abreviatura'],
    'format'       => 16,
    'matches'      => $matches
]);
