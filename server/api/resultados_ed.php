<?php
/**
 * Eliminación Directa (Match Play Brackets) Endpoint
 * GET /api/resultados_ed.php?catid=XXX&torneoid=XXX
 *
 * Devuelve TODOS los matches de la categoría (Winners D1 = matchid 1xx,
 * Losers/Consolación D2 = matchid 2xx), agrupados. Detecta automáticamente
 * categorías de parejas y lee de `v_equipo_ed_par` cuando aplica.
 */
require_once 'config.php';

$catid    = require_param('catid');
$torneoid = require_param('torneoid');

$cid = esc($conn, $catid);
$tid = esc($conn, $torneoid);

// Detecta `tipoed` (columna opcional en esquemas legacy).
$tipoedExists = $conn->query("SHOW COLUMNS FROM categorias LIKE 'tipoed'");
$tipoedSel = ($tipoedExists && $tipoedExists->num_rows > 0) ? 'tipoed' : "NULL AS tipoed";

// Category info — incluye formato y sistema para que el front decida layout.
$sql = "SELECT categoria_id, categoria, abreviatura, sistema, formato, $tipoedSel, sexo
        FROM categorias WHERE categoria_id = $cid";
$catInfo = query_one($conn, $sql);
if (!$catInfo) { json_error('Category not found', 404); }

$isParejas = (strtoupper((string)($catInfo['formato'] ?? '')) === 'PAREJAS');

/**
 * Intenta una vista (`v_equipo_ed` o `v_equipo_ed_par`) y si falla cae a
 * un JOIN manual sobre `eliminacion_directa`. Devuelve siempre el mismo
 * shape para que el mapeo posterior no se ramifique.
 */
function load_bracket_matches($conn, $cid, $tid, $isParejas) {
    $view = $isParejas ? 'v_equipo_ed_par' : 'v_equipo_ed';
    $sql = "SELECT matchid, jugadorid1, jugador1, jugadorid2, jugador2,
                   gano, hoyo, resultado, ronda, posicion,
                   logo1, logo2, club1, club2
            FROM $view
            WHERE categoriaid = $cid AND torneoid = $tid
            ORDER BY matchid ASC";
    $r = $conn->query($sql);
    if ($r) return $r;
    // Fallback: query directa.
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
    return $conn->query($sql);
}

$result = load_bracket_matches($conn, $cid, $tid, $isParejas);
if (!$result) {
    // Si ni la vista ni la tabla existen, devolvemos bracket vacío en vez de 500.
    json_response([
        'categoryId'   => $catInfo['categoria_id'],
        'categoryName' => $catInfo['categoria'],
        'shortName'    => $catInfo['abreviatura'],
        'system'       => $catInfo['sistema'],
        'format'       => $catInfo['formato'],
        'tipoed'       => $catInfo['tipoed'],
        'isParejas'    => $isParejas,
        'matches'      => [], 'd1' => [], 'd2' => [],
        '_note'        => 'eliminacion_directa table/view not available'
    ]);
}

/** D1 = matchid 1xx (Winners), D2 = matchid 2xx (Consolación/Losers). */
$d1 = [];
$d2 = [];
while ($row = $result->fetch_assoc()) {
    $mid = (int)$row['matchid'];
    $entry = [
        'matchId'    => $mid,
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
    if ($mid >= 200) $d2[] = $entry;
    else             $d1[] = $entry;
}
$result->free();

json_response([
    'categoryId'   => $catInfo['categoria_id'],
    'categoryName' => $catInfo['categoria'],
    'shortName'    => $catInfo['abreviatura'],
    'system'       => $catInfo['sistema'],
    'format'       => $catInfo['formato'],
    'tipoed'       => $catInfo['tipoed'],
    'isParejas'    => $isParejas,
    // Back-compat: `matches` mantiene todos (legacy consumers).
    'matches'      => array_merge($d1, $d2),
    'd1'           => $d1,
    'd2'           => $d2,
]);
