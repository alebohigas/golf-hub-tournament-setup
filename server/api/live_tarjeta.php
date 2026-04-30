<?php
/**
 * Live Tarjeta (Live Scorecard) Endpoint
 * GET /api/live_tarjeta.php?jugadorid=XXX&categoriaid=XXX&tipo=stroke|stableford|goro_neto|goro_gross
 * Returns real-time hole-by-hole scorecard as JSON
 * Replaces Score_live_xml.php, Score_live_xml_stable.php, Score_live_xml_goro.php
 */
require_once 'config.php';

$jugadorid   = require_param('jugadorid');
$categoriaid = optional_param('categoriaid', '0');
$tipo        = optional_param('tipo', 'stroke');

$jid = esc($conn, $jugadorid);

// ============= Get latest card for player =============
// Qualify every tarjetas column because v_sal_jug also exposes score/date fields.
$sql = "SELECT a.id,
               a.h1, a.h2, a.h3, a.h4, a.h5, a.h6, a.h7, a.h8, a.h9,
               a.h10, a.h11, a.h12, a.h13, a.h14, a.h15, a.h16, a.h17, a.h18,
               a.h1_a, a.h2_a, a.h3_a, a.h4_a, a.h5_a, a.h6_a, a.h7_a, a.h8_a, a.h9_a,
               a.h10_a, a.h11_a, a.h12_a, a.h13_a, a.h14_a, a.h15_a, a.h16_a, a.h17_a, a.h18_a,
               a.so, a.sa,
               COALESCE(NULLIF(s.ventajasjug, ''), a.ventajas) as vtjasjug,
               a.parcampohoyo as parcampo,
               a.campoid,
               a.fecha_juego as fecha,
               c.campo";

// For Golfista de Oro (GORO) neto, include ventajas de golfista de oro
if ($tipo === 'goro_neto') {
    $sql .= ", a.vtjasgo as vtjasgoro";
} else {
    $sql .= ", '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0' as vtjasgoro";
}

$sql .= " FROM tarjetas a
          JOIN v_ult_tarjeta0 b ON (a.id = b.tarjetaid)
          JOIN campos c ON (a.campoid = c.id)
          LEFT JOIN v_sal_jug s ON (s.tarjetaid = a.id)
          WHERE a.jugadorid = $jid";

$card = query_one($conn, $sql);
if (!$card) { json_error('Card not found', 404); }

// ============= Build holes arrays =============
$holesSO = []; // Score Original
$holesSA = []; // Score Adjusted (SA or Stableford points)
$parHoles = [];

// Parse par per hole from CSV
$parValues = $card['parcampo'] ? explode(',', $card['parcampo']) : [];

for ($h = 1; $h <= 18; $h++) {
    $holesSO[] = $card["h$h"] !== null ? (int)$card["h$h"] : null;
    $holesSA[] = $card["h{$h}_a"] !== null ? (int)$card["h{$h}_a"] : null;
    $parHoles[] = isset($parValues[$h - 1]) ? (int)$parValues[$h - 1] : null;
}

// Parse ventajas (handicap strokes per hole) from CSV
$ventajas = $card['vtjasjug'] ? array_map('intval', explode(',', $card['vtjasjug'])) : [];
$ventajasGoro = $card['vtjasgoro'] ? array_map('intval', explode(',', $card['vtjasgoro'])) : [];

// Calculate totals
$outSO = 0; $inSO = 0; $outSA = 0; $inSA = 0; $outPar = 0; $inPar = 0;
for ($h = 0; $h < 9; $h++) {
    $outSO += $holesSO[$h] ?? 0;
    $outSA += $holesSA[$h] ?? 0;
    $outPar += $parHoles[$h] ?? 0;
}
for ($h = 9; $h < 18; $h++) {
    $inSO += $holesSO[$h] ?? 0;
    $inSA += $holesSA[$h] ?? 0;
    $inPar += $parHoles[$h] ?? 0;
}

json_response([
    'cardId'  => $card['id'],
    'date'    => $card['fecha'],
    'course'  => $card['campo'],
    'type'    => $tipo,
    'totals'  => [
        'SO'     => (int)$card['so'],
        'SA'     => (int)$card['sa'],
        'outSO'  => $outSO,
        'inSO'   => $inSO,
        'outSA'  => $outSA,
        'inSA'   => $inSA,
        'outPar' => $outPar,
        'inPar'  => $inPar,
        'par'    => $outPar + $inPar
    ],
    'holes'   => $holesSO,
    'holesSA' => $holesSA,
    'par'     => $parHoles,
    'ventajas'     => $ventajas,
    'ventajasGoro' => $ventajasGoro
]);
