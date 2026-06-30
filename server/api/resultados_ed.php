<?php
/**
 * Eliminación Directa (Match Play Brackets) Endpoint
 * GET /api/resultados_ed.php?catid=XXX&torneoid=XXX[&debug=1]
 *
 * Lee la(s) vista(s) legacy del esquema de Speitour:
 *   - `v_equipo_ed_par`  → categorías PAREJAS
 *   - `v_equipo_ed`      → categorías INDIVIDUAL (mismo shape)
 *
 * Shape de la vista (1 fila por LADO, 2 filas por match):
 *   torneoid, categoriaid, matchx ('101','109','115','201',...),
 *   posicion, postabla, gano, hoyo, resultado,
 *   jugador, logojug, fecha, club, clubid, idelimin_salidas
 *
 * Detección de ganador: cuando `gano == postabla` ese lado es el winner.
 * D1 (Winners/Cuadro principal) → matchx 1xx. D2 (Consolación) → matchx 2xx.
 */
require_once 'config.php';

$catid    = require_param('catid');
$torneoid = require_param('torneoid');

$cid = esc($conn, $catid);
$tid = esc($conn, $torneoid);

// ----- Categoría (incluye tipoed si la columna existe) ----------------------
$tipoedExists = $conn->query("SHOW COLUMNS FROM categorias LIKE 'tipoed'");
$tipoedSel = ($tipoedExists && $tipoedExists->num_rows > 0) ? 'tipoed' : "NULL AS tipoed";

$catInfo = query_one(
    $conn,
    "SELECT categoria_id, categoria, abreviatura, sistema, formato, $tipoedSel, sexo
       FROM categorias WHERE categoria_id = $cid"
);
if (!$catInfo) { json_error('Category not found', 404); }

$isParejas = (strtoupper((string)($catInfo['formato'] ?? '')) === 'PAREJAS');

/**
 * Carga las filas crudas (1 por lado) desde la vista legacy correspondiente.
 * Si la vista preferida no existe (esquema viejo), prueba la otra como fallback
 * y si tampoco está devuelve [] para no romper la página.
 */
function load_sides($conn, $cid, $tid, $isParejas) {
    $candidates = $isParejas
        ? ['v_equipo_ed_par', 'v_equipo_ed']
        : ['v_equipo_ed', 'v_equipo_ed_par'];

    foreach ($candidates as $view) {
        // Comprueba existencia antes de hacer SELECT para evitar un 500.
        $chk = $conn->query("SHOW TABLES LIKE '" . $conn->real_escape_string($view) . "'");
        if (!$chk || $chk->num_rows === 0) continue;

        $sql = "SELECT idelimin_salidas, categoriaid, torneoid,
                       matchx, posicion, postabla, gano, hoyo, resultado,
                       jugador, logojug,
                       DATE_FORMAT(fecha, '%Y-%m-%d %H:%i') AS fecha,
                       club, clubid
                  FROM $view
                 WHERE torneoid = $tid AND categoriaid = $cid
                 ORDER BY matchx ASC, posicion ASC";
        $rows = query_all($conn, $sql);
        if ($rows !== null) return $rows;
    }
    return [];
}

$sides = load_sides($conn, $cid, $tid, $isParejas);

// ----- Agrupa las filas por matchx → estructura player1/player2 -------------
/**
 * Convierte una fila de la vista en el objeto BracketPlayer que espera el front.
 * El nombre lleva la posición del seed al inicio (ej: "1 Alfredo Hauter | Allan Salinas").
 */
function side_to_player($row, $LOGOS_BASE_URL) {
    if (!$row) {
        return ['id' => null, 'name' => null, 'clubLogo' => '', 'club' => ''];
    }
    $name = trim((string)$row['jugador']);
    $pos  = (int)($row['posicion'] ?? 0);
    if ($pos > 0 && stripos($name, (string)$pos) !== 0) {
        $name = $pos . ' ' . $name;
    }
    $logo = $row['logojug'] ?? '';
    return [
        'id'       => $row['idelimin_salidas'] ?? null,
        'name'     => $name,
        'clubLogo' => $logo ? $LOGOS_BASE_URL . $logo : '',
        'club'     => $row['club'] ?? ''
    ];
}

$grouped = [];
foreach ($sides as $row) {
    $mx = (string)$row['matchx'];
    if (!isset($grouped[$mx])) $grouped[$mx] = [];
    $grouped[$mx][] = $row;
}

$d1 = [];
$d2 = [];
foreach ($grouped as $mx => $pair) {
    $r1 = $pair[0] ?? null;
    $r2 = $pair[1] ?? null;
    $mid = (int)$mx;

    // Winner: comparar gano vs postabla en cada lado.
    $winner = null;
    if ($r1 && $r1['gano'] !== null && (string)$r1['gano'] === (string)$r1['postabla']) {
        $winner = 1;
    } elseif ($r2 && $r2['gano'] !== null && (string)$r2['gano'] === (string)$r2['postabla']) {
        $winner = 2;
    }

    $entry = [
        'matchId'  => $mid,
        'player1'  => side_to_player($r1, $LOGOS_BASE_URL),
        'player2'  => side_to_player($r2, $LOGOS_BASE_URL),
        'winner'   => $winner,
        'hole'     => $r1['hoyo'] ?? null,
        'result'   => $r1['resultado'] ?? null,
        'fecha'    => $r1['fecha'] ?? null,
        'round'    => 0,
        'position' => 0,
    ];

    if ($mid >= 200) $d2[] = $entry;
    else             $d1[] = $entry;
}

// Orden estable por matchId.
usort($d1, fn($a, $b) => $a['matchId'] - $b['matchId']);
usort($d2, fn($a, $b) => $a['matchId'] - $b['matchId']);

json_response([
    'categoryId'   => $catInfo['categoria_id'],
    'categoryName' => $catInfo['categoria'],
    'shortName'    => $catInfo['abreviatura'],
    'system'       => $catInfo['sistema'],
    'format'       => $catInfo['formato'],
    'tipoed'       => $catInfo['tipoed'],
    'isParejas'    => $isParejas,
    // `matches` se mantiene por back-compat (todos los matches concatenados).
    'matches'      => array_merge($d1, $d2),
    'd1'           => $d1,
    'd2'           => $d2,
]);