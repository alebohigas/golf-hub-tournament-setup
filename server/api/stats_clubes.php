<?php
/**
 * Stats — Clubes Asistentes
 * GET /api/stats_clubes.php?torneoid=XXX
 *
 * Returns aggregated player counts per club for the tournament, split
 * into three branches: Caballeros (male, non-senior), Seniors (any
 * category whose name contains SENIOR), and Damas (female).
 *
 * Response shape:
 *   {
 *     total:  int,
 *     clubs:  [{ id, name, logo, caballeros, seniors, damas, total }, ...]
 *   }
 *
 * Resilient: on missing tables/columns returns { total:0, clubs:[] }.
 */
require_once 'config.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

/** Safe wrapper: return [] on failure instead of aborting with json_error. */
function safe_rows($conn, $sql) {
    $r = @$conn->query($sql);
    if (!$r) { error_log('stats_clubes safe_rows failed: ' . $conn->error . ' SQL=' . $sql); return []; }
    $rows = [];
    while ($row = $r->fetch_assoc()) { $rows[] = $row; }
    $r->free();
    return $rows;
}

// Aggregate: one row per club with three counts (Caballeros/Seniors/Damas).
// A player is "Senior" when their category name contains SENIOR (case-insensitive).
// Otherwise Caballeros if sexo='M' and Damas if sexo='F'.
$sql = "SELECT c.id AS club_id, c.nombre AS club_name, c.logo AS club_logo,
               SUM(CASE WHEN UPPER(cat.categoria) LIKE '%SENIOR%' THEN 1 ELSE 0 END) AS seniors,
               SUM(CASE WHEN UPPER(cat.categoria) NOT LIKE '%SENIOR%' AND UPPER(j.sexo)='M' THEN 1 ELSE 0 END) AS caballeros,
               SUM(CASE WHEN UPPER(cat.categoria) NOT LIKE '%SENIOR%' AND UPPER(j.sexo)='F' THEN 1 ELSE 0 END) AS damas,
               COUNT(*) AS total
          FROM jugadores j
          LEFT JOIN clubs c ON (j.clubid = c.id)
          LEFT JOIN categorias cat ON (j.categoriaid = cat.categoria_id)
         WHERE j.torneoid = $tid
           AND (j.estatus IS NULL OR j.estatus <> 'BAJA')
         GROUP BY c.id, c.nombre, c.logo
         ORDER BY total DESC, club_name ASC";

$rows = safe_rows($conn, $sql);

$clubs = [];
$grandTotal = 0;
foreach ($rows as $r) {
    $t = (int)$r['total'];
    $grandTotal += $t;
    $clubs[] = [
        'id'         => $r['club_id'] !== null ? (int)$r['club_id'] : null,
        'name'       => $r['club_name'] ?? '— Sin club —',
        'logo'       => !empty($r['club_logo']) ? $LOGOS_BASE_URL . $r['club_logo'] : null,
        'caballeros' => (int)$r['caballeros'],
        'seniors'    => (int)$r['seniors'],
        'damas'      => (int)$r['damas'],
        'total'      => $t,
    ];
}

json_response([
    'total' => $grandTotal,
    'clubs' => $clubs,
]);