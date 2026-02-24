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
$sql = "SELECT a.id,
               h1, h2, h3, h4, h5, h6, h7, h8, h9,
               h10, h11, h12, h13, h14, h15, h16, h17, h18,
               h1_a, h2_a, h3_a, h4_a, h5_a, h6_a, h7_a, h8_a, h9_a,
               h10_a, h11_a, h12_a, h13_a, h14_a, h15_a, h16_a, h17_a, h18_a,
               so, sa,
               ventajas as vtjasjug,
               parcampohoyo as parcampo,
               fecha_juego as fecha,
               c.campo";

// For Golfista de Oro (GORO) neto, include ventajas de golfista de oro
if ($tipo === 'goro_neto') {
    $sql .= ", vtjasgo as vtjasgoro";
} else {
    $sql .= ", '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0' as vtjasgoro";
}

$sql .= " FROM tarjetas a
          JOIN v_ult_tarjeta0 b ON (a.id = b.tarjetaid)
          JOIN campos c ON (a.campoid = c.id)
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
