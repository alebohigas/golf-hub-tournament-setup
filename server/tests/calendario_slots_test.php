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
echo "Calendar time boundaries and split counts: OK\n";