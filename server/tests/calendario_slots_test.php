<?php
/** Regression coverage for calendar boundaries and planned split-tee counts. */
require_once __DIR__ . '/../api/_calendario_slots.php';

/** Fail loudly when a calendar boundary or count changes unexpectedly. */
function check_calendar($actual, $expected, $label) {
    if ($actual !== $expected) throw new RuntimeException($label . ': unexpected result');
}

foreach (['04:49:59' => null, '04:50:00' => 'AM', '10:59:59' => 'AM',
          '11:00:00' => 'PM', '16:00:00' => 'PM', '16:01:00' => null,
          '00:00:00' => null, '25:00:00' => null] as $time => $expected) {
    check_calendar(calendario_slot($time), $expected, $time);
}
$slots = calendario_planned_slots(['numfoursome' => 4, 'salhoyos' => '1,1,10,10',
    'horainicio_1' => '07:00:00', 'horainicio_10' => '11:30:00']);
check_calendar($slots[0]['groups'], 2, 'Morning groups');
check_calendar($slots[1]['groups'], 2, 'Afternoon groups');
check_calendar(array_sum(array_column($slots, 'groups')), 4, 'No double counting');

/** Collect only occupied planned sessions, matching the endpoint's fallback classification. */
function planned_periods($row) {
    $periods = [];
    foreach (calendario_planned_slots($row) as $slot) {
        $period = calendario_slot($slot['time']);
        if ($period !== null) $periods[$period] = true;
    }
    return array_keys($periods);
}

// Campeonato/AA: opposite unused tee times must not make either date bicolor.
$friday = ['numfoursome' => 4, 'salhoyos' => '1,1,1,1',
    'horainicio_1' => '06:30:00', 'horainicio_10' => '12:30:00'];
check_calendar(planned_periods($friday), ['AM'], 'Friday morning-only category');
$saturday = array_merge($friday, ['horainicio_1' => '12:30:00', 'horainicio_10' => '06:30:00']);
check_calendar(planned_periods($saturday), ['PM'], 'Saturday afternoon-only category');
check_calendar(planned_periods(array_merge($friday, ['salhoyos' => '10,10,10,10'])),
    ['PM'], 'Only occupied hole 10');

// B: occupied tees in both windows must keep the mixed session on each date.
foreach (['2026-10-09', '2026-10-10'] as $date) {
    check_calendar(planned_periods(array_merge($friday, ['salhoyos' => '1,1,10,10'])),
        ['AM', 'PM'], 'B mixed sessions ' . $date);
}
check_calendar(planned_periods(array_merge($friday, ['numfoursome' => 0])), [], 'No groups, no session');
echo "Calendar boundaries, occupied tees and daily mixed sessions: OK\n";