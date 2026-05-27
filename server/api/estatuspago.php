<?php
/**
 * Estatuspago Catalog Endpoint
 * ----------------------------------------------------------------------
 * GET /api/estatuspago.php
 *
 * Devuelve las primeras 6 opciones de la tabla `estatuspago`
 * (catálogo cuyo PK se relaciona con registro.status_pago).
 *
 * Respuesta: { rows: [ { value: <pk:int>, label: <texto:string> }, ... ] }
 *
 * Auto-detecta el nombre de la PK y de la primera columna textual
 * (varchar/char/text) para ser resiliente a esquemas distintos.
 */
require_once 'config.php';

header('Access-Control-Allow-Methods: GET, OPTIONS');

$cols = query_all($conn, "SHOW COLUMNS FROM estatuspago");
if (!$cols) json_response(['rows' => []]);

$pkCol = null;
$labelCol = null;
foreach ($cols as $c) {
    if ($pkCol === null && strtoupper($c['Key'] ?? '') === 'PRI') $pkCol = $c['Field'];
    if ($labelCol === null && $c['Field'] !== ($pkCol ?? '') ) {
        $t = strtolower($c['Type'] ?? '');
        if (strpos($t,'char')!==false || strpos($t,'text')!==false || strpos($t,'enum')!==false) {
            $labelCol = $c['Field'];
        }
    }
}
// Fallbacks si el SHOW COLUMNS no marcó PRI
if (!$pkCol)    $pkCol    = $cols[0]['Field'];
if (!$labelCol) $labelCol = $cols[count($cols) > 1 ? 1 : 0]['Field'];

$rows = query_all($conn, "SELECT `$pkCol` AS value, `$labelCol` AS label FROM estatuspago ORDER BY `$pkCol` ASC LIMIT 6");
$out = [];
foreach ($rows as $r) {
    $out[] = ['value' => (int)$r['value'], 'label' => (string)$r['label']];
}
json_response(['rows' => $out]);