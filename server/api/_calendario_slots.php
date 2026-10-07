<?php
/** Shared calendar classification helpers; no database access or JSON output. */

/** Classify valid tee times by the tournament's morning/afternoon windows. */
function calendario_slot($time) {
    if (!is_string($time) || !preg_match('/^(\d{1,2}):(\d{2})(?::\d{2})?$/', trim($time), $match)) return null;
    $hour = (int)$match[1];
    $minute = (int)$match[2];
    if ($hour > 23 || $minute > 59) return null;
    $minutes = $hour * 60 + $minute;
    if ($minutes >= 290 && $minutes <= 659) return 'AM';
    if ($minutes >= 660 && $minutes <= 960) return 'PM';
    return null;
}

/** Detect occupied A/B subgroups in the stored Num Jug Calc JSON, ignoring empty subgroups. */
function calendario_has_subgroups_ab($value) {
    $groups = is_string($value) ? json_decode($value, true) : $value;
    if (!is_array($groups)) return false;
    $occupied = [];
    foreach ($groups as $group) {
        if (!is_array($group) || (int)($group['jug'] ?? 0) <= 0) continue;
        $occupied[strtoupper(trim((string)($group['grupo'] ?? '')))] = true;
    }
    return isset($occupied['A'], $occupied['B']);
}

/** Locate the legacy Num Jug Calc column safely in either calendar or category metadata. */
function calendario_subgroup_column($conn, $table) {
    $result = @$conn->query("SHOW COLUMNS FROM `$table`");
    if (!$result) return null;
    $name = null;
    while ($column = $result->fetch_assoc()) {
        $normalized = strtolower(preg_replace('/[^a-z0-9]/i', '', $column['Field']));
        if ($normalized === 'numjugcalc') $name = $column['Field'];
    }
    $result->free();
    return $name;
}

/** Split planned group counts without double counting; counts do not control scheduled cell visibility. */
function calendario_planned_slots($row) {
    $total = max(0, (int)$row['numfoursome']);
    $holes = preg_split('/\s*,\s*/', trim((string)$row['salhoyos']), -1, PREG_SPLIT_NO_EMPTY);
    $hole10 = 0;
    foreach ($holes as $hole) {
        if (preg_match('/^(?:H)?0*10$/i', trim($hole))) $hole10++;
    }
    $hole10 = min($total, $hole10);
    $slots = [
        ['time' => $row['horainicio_1'], 'groups' => $total - $hole10],
        ['time' => $row['horainicio_10'], 'groups' => $hole10],
    ];
    // A configured tee time only represents a session when groups actually use that tee.
    return array_values(array_filter($slots, function ($slot) {
        return $slot['groups'] > 0;
    }));
}

/** Resolve display sessions independently of group totals; only occupied A/B subgroups allow bicolor. */
function calendario_display_times($row, $hasSubgroupsAB, $actualAM, $actualPM) {
    $times = ['AM' => $actualAM, 'PM' => $actualPM];
    // Scheduled starts remain visible on future days with no generated or planned foursomes.
    if ($actualAM === null && $actualPM === null) {
        foreach (['horainicio_1', 'horainicio_10'] as $field) {
            $time = $row[$field] ?? null;
            $period = calendario_slot($time);
            if ($period === null) continue;
            if ($times[$period] === null || $time < $times[$period]) $times[$period] = $time;
            if (!$hasSubgroupsAB) break;
        }
    }
    if (!$hasSubgroupsAB && $times['AM'] !== null && $times['PM'] !== null) {
        // For an unsplit category the primary scheduled start determines its single color.
        $period = calendario_slot($row['horainicio_1'] ?? null)
            ?? calendario_slot($row['horainicio_10'] ?? null)
            ?? 'AM';
        $times[$period === 'AM' ? 'PM' : 'AM'] = null;
    }
    return $times;
}