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

/** Split planned groups by starting tee; unused tees must not create phantom AM/PM sessions. */
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