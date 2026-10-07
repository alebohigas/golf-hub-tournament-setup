<?php
/**
 * Calendario (Calendar) Endpoint
 * GET /api/calendario.php?torneoid=XXX
 *
 * Returns the tournament calendar matrix sourced from `caljuego`.
 *
 * For each row we use:
 *   - fecha            -> column (date)
 *   - categoriaid/categoria -> row (category)
 *   - horainicio_1     -> tee time when at least one group starts at hole 1
 *   - horainicio_10    -> tee time when at least one group starts at hole 10
 *   - salhoyos         -> comma-separated list of starting holes per group
 *                         e.g. "1,1,1,1" -> all from hole 1
 *                              "1,1,10,10" -> 2 from hole 1, 2 from hole 10
 *   - numfoursome      -> total number of foursomes (groups) playing that day
 *
 * Morning: 04:50–10:59; afternoon: 11:00–16:00 (inclusive minutes).
 * Each starting tee is classified independently so a cell can contain both.
 *
 * Each entry in the response carries:
 *   - hasAM / hasPM      booleans for cell coloring
 *   - amTime / pmTime    formatted tee time strings (or null)
 *   - amGroups / pmGroups number of groups in each half (split using salhoyos)
 *
 * The response also contains daily totals (`amTotals`, `pmTotals`) that
 * aggregate group counts across all categories per date.
 */
require_once 'config.php';
require_once '_calendario_slots.php';

$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

// Pull every relevant field from caljuego with category and course names.
$sql = "SELECT c.id, c.fecha, c.horainicio_1, c.horainicio_10,
               c.categoria, c.campo, c.salhoyos, c.numfoursome,
               ca.campo as campo_nombre,
               cat.categoria_id, cat.categoria as categoria_nombre, cat.abreviatura,
               DATE_FORMAT(c.fecha, '%W') as dia_semana,
               DATE_FORMAT(c.fecha, '%e') as dia_num,
               DATE_FORMAT(c.fecha, '%M') as mes_nombre
        FROM caljuego c
        LEFT JOIN campos ca ON (c.campo = ca.id)
        LEFT JOIN categorias cat ON (c.categoriaid = cat.categoria_id)
        WHERE c.torneoid = $tid
          AND c.categoria IS NOT NULL
          AND c.categoria != ''
          AND c.campo > 0
        ORDER BY c.fecha ASC, c.horainicio_1 ASC, c.categoria ASC";

$rows = query_all($conn, $sql);

/** Format HH:MM:SS into a short label like "7:00 AM" / "1:30 PM". */
function fmt_time($t) {
    if (!$t) return null;
    $parts = explode(':', $t);
    $h = isset($parts[0]) ? (int)$parts[0] : 0;
    $m = isset($parts[1]) ? $parts[1] : '00';
    $ampm = $h >= 12 ? 'PM' : 'AM';
    $disp = $h % 12; if ($disp === 0) $disp = 12;
    return $disp . ':' . $m . ' ' . $ampm;
}

$datesMap = [];
$entries = [];
// Aggregate group counts per date split by AM/PM for the bottom rows.
$amTotals = [];
$pmTotals = [];

foreach ($rows as $row) {
    $fecha = $row['fecha'];

    if (!isset($datesMap[$fecha])) {
        $datesMap[$fecha] = [
            'date'      => $fecha,
            'dayOfWeek' => $row['dia_semana'],
            'dayNum'    => $row['dia_num'],
            'month'     => $row['mes_nombre'],
            'course'    => $row['campo_nombre']
        ];
        $amTotals[$fecha] = 0;
        $pmTotals[$fecha] = 0;
    }

    $hasAM = false; $hasPM = false;
    $amGroups = 0;  $pmGroups = 0;
    $amTime = null; $pmTime = null;

    // Each configured tee contributes its own time and non-duplicated groups.
    foreach (calendario_planned_slots($row) as $slot) {
        $period = calendario_slot($slot['time']);
        if ($period === 'AM') {
            $hasAM    = true;
            $amGroups += $slot['groups'];
            if ($amTime === null || $slot['time'] < $amTime) $amTime = $slot['time'];
        } elseif ($period === 'PM') {
            $hasPM    = true;
            $pmGroups += $slot['groups'];
            if ($pmTime === null || $slot['time'] < $pmTime) $pmTime = $slot['time'];
        }
    }

    $amTotals[$fecha] += $amGroups;
    $pmTotals[$fecha] += $pmGroups;

    $entries[] = [
        'id'           => (int)$row['id'],
        'date'         => $fecha,
        'category'     => $row['categoria'],
        // categoriaId from the categorias table — used by the frontend to
        // sort matrix rows in the canonical DB order (ORDER BY categoria_id ASC).
        'categoriaId'  => isset($row['categoria_id']) ? (int)$row['categoria_id'] : 0,
        'categoryName' => $row['categoria_nombre'] ?: $row['categoria'],
        'shortName'    => $row['abreviatura'] ?: $row['categoria'],
        'course'       => $row['campo_nombre'],
        'hasAM'        => $hasAM,
        'hasPM'        => $hasPM,
        'amTime'       => fmt_time($amTime),
        'pmTime'       => fmt_time($pmTime),
        'amGroups'     => $amGroups,
        'pmGroups'     => $pmGroups,
        // Kept for backward compatibility with older clients.
        'startTime'    => $row['horainicio_1'],
    ];
}

json_response([
    'dates'    => array_values($datesMap),
    'entries'  => $entries,
    'amTotals' => $amTotals,
    'pmTotals' => $pmTotals,
]);
