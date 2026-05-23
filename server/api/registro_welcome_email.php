<?php
/**
 * Registro Welcome Email Endpoint
 * ----------------------------------------------------------------------
 * POST /api/registro_welcome_email.php   (JSON body: { id, password })
 *
 * Disparado automáticamente desde el dashboard admin cuando un registro
 * pasa a verificado=1 (Sección 3 → "Verificar"). Manda al jugador un
 * correo de bienvenida confirmando su registro OFICIAL al torneo, en la
 * categoría seleccionada.
 *
 * Es idempotente: usa la columna auto-creada `reg_welcome_sent` (TINYINT)
 * para no re-enviar si ya se mandó antes. Devuelve { sent: true|false }.
 */
require_once 'config.php';
require_once '_smtp.php';

const REGISTROS_PASSWORD = 'registros2025';

header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$body = json_decode(file_get_contents('php://input'), true) ?: [];
if (($body['password'] ?? '') !== REGISTROS_PASSWORD) {
    json_error('Unauthorized', 401);
}
$id = (int)($body['id'] ?? 0);
if ($id <= 0) json_error('Missing id', 400);
$force = !empty($body['force']);

/** Resolver columnas disponibles. */
$cols = query_all($conn, "SHOW COLUMNS FROM registro");
$colSet = [];
foreach ($cols as $c) $colSet[$c['Field']] = true;
$has = fn($c) => isset($colSet[$c]);

$pkCol = $has('id') ? 'id' : ($has('reg_id') ? 'reg_id' : null);
if (!$pkCol) json_error('PK no encontrada', 500);

$torneoCol = null;
foreach (['reg_id_torneo','torneo_id','id_torneo','idtorneo','torneoid'] as $c) {
    if ($has($c)) { $torneoCol = $c; break; }
}
if (!$torneoCol) json_error('Columna de torneo no encontrada', 500);

/** Auto-crear flag idempotencia. */
if (!$has('reg_welcome_sent')) {
    @$conn->query("ALTER TABLE registro ADD COLUMN reg_welcome_sent TINYINT NOT NULL DEFAULT 0");
    $colSet['reg_welcome_sent'] = true;
}
if (!$has('reg_welcome_last')) {
    @$conn->query("ALTER TABLE registro ADD COLUMN reg_welcome_last DATETIME NULL");
    $colSet['reg_welcome_last'] = true;
}

$select = ["$pkCol AS id", "$torneoCol AS torneoid", "reg_welcome_sent"];
foreach (['reg_nombre','reg_apellido','reg_correo','reg_categoria','reg_club',
          'reg_handicap','reg_precio_estimado','reg_precio_moneda'] as $c) {
    if ($has($c)) $select[] = $c;
}

$sql = "SELECT " . implode(',', $select) . " FROM registro WHERE $pkCol = $id LIMIT 1";
$row = query_one($conn, $sql);
if (!$row) json_error('Registro no encontrado', 404);
if (empty($row['reg_correo'])) json_error('Registro sin correo', 400);

/** Idempotencia: si ya se mandó y no es force, no re-enviar. */
if (!$force && (int)($row['reg_welcome_sent'] ?? 0) === 1) {
    json_response(['sent' => false, 'already' => true]);
}

/** Folio público (torneoid-regid). */
$folio = ((int)$row['torneoid'] > 0)
    ? ((int)$row['torneoid'] . '-' . (int)$row['id'])
    : ('' . (int)$row['id']);

/** Resolver categoría y torneo. */
$catName = '';
if (!empty($row['reg_categoria'])) {
    $cr = @$conn->query("SELECT categoria FROM categorias WHERE categoria_id = " . (int)$row['reg_categoria'] . " LIMIT 1");
    if ($cr) { $cc = $cr->fetch_assoc(); $cr->free(); if ($cc) $catName = $cc['categoria']; }
}
$torneoName = '';
$tr = @$conn->query("SELECT nombre FROM torneo WHERE torneo_id = " . (int)$row['torneoid'] . " LIMIT 1");
if ($tr) { $tt = $tr->fetch_assoc(); $tr->free(); if ($tt) $torneoName = $tt['nombre'] ?? ''; }

$nombre = trim(($row['reg_nombre'] ?? '') . ' ' . ($row['reg_apellido'] ?? ''));
if ($nombre === '') $nombre = 'Jugador';

/** Helper para valores en negritas y escape. */
$b = fn($v) => '<strong>' . htmlspecialchars((string)($v ?? '—'), ENT_QUOTES, 'UTF-8') . '</strong>';

$rowsHtml = '';
$entries = [
    ['Folio de registro', '#' . $folio],
    ['Nombre',    $nombre],
    ['Correo',    $row['reg_correo'] ?? ''],
    ['Club',      $row['reg_club'] ?? ''],
    ['Categoría', $catName],
    ['Handicap',  $row['reg_handicap'] ?? ''],
];
foreach ($entries as [$label, $val]) {
    $rowsHtml .= '<tr>'
        . '<td style="padding:6px 12px;color:#666;font-size:13px;white-space:nowrap;">' . htmlspecialchars($label) . '</td>'
        . '<td style="padding:6px 12px;font-size:14px;">' . $b($val) . '</td>'
        . '</tr>';
}

$subject = '¡Bienvenido al torneo! · Registro confirmado'
    . ($torneoName ? ' · ' . $torneoName : '');

$html = '<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">'
    . '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5;padding:24px 0;">'
    . '<tr><td align="center">'
    . '<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:8px;padding:32px;">'
    . '<tr><td>'
    . '<h1 style="font-size:22px;margin:0 0 12px;color:#0a7d3e;">¡Bienvenido' . ($nombre !== 'Jugador' ? ', ' . htmlspecialchars($nombre) : '') . '!</h1>'
    . '<p style="font-size:15px;line-height:1.6;margin:0 0 16px;">'
    . 'Tu pago ha sido verificado y has quedado <strong>oficialmente registrado</strong>'
    . ($torneoName ? ' al torneo <strong>' . htmlspecialchars($torneoName) . '</strong>' : ' al torneo')
    . ($catName ? ', en la categoría <strong>' . htmlspecialchars($catName) . '</strong>' : '')
    . '.'
    . '</p>'
    . '<p style="font-size:14px;line-height:1.5;margin:0 0 16px;">'
    . '¡Felicidades y mucho éxito! Te esperamos en el campo.'
    . '</p>'
    . '<h2 style="font-size:13px;margin:24px 0 8px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Detalles de tu registro</h2>'
    . '<table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #eee;border-radius:6px;border-collapse:collapse;">'
    . $rowsHtml
    . '</table>'
    . '<p style="font-size:13px;line-height:1.5;margin:24px 0 0;color:#0a7d3e;background:#e8f5ee;padding:12px 16px;border-radius:6px;">'
    . 'Conserva este correo como comprobante de tu registro oficial al torneo.'
    . '</p>'
    . '<p style="font-size:12px;color:#999;margin:32px 0 0;text-align:center;">'
    . ($torneoName ? htmlspecialchars($torneoName) : 'Torneo')
    . '</p>'
    . '<p style="font-size:10px;color:#cccccc;margin:8px 0 0;text-align:center;">Ref: '
    . htmlspecialchars($folio) . ' · ' . date('Y-m-d H:i:s')
    . '</p>'
    . '</td></tr></table>'
    . '</td></tr></table>'
    . '</body></html>';

$textAlt = "¡Bienvenido $nombre!\n\n"
    . "Tu pago ha sido verificado. Quedas oficialmente registrado"
    . ($torneoName ? " al torneo $torneoName" : '')
    . ($catName ? ", en la categoría $catName" : '')
    . ".\n\nFolio: #$folio\n\n¡Te esperamos en el campo!\n";

$res = smtp_send($row['reg_correo'], $nombre, $subject, $html, $textAlt);
if (!$res['ok']) {
    json_error('No se pudo enviar el correo: ' . ($res['error'] ?? 'desconocido'), 500);
}

@$conn->query(
    "UPDATE registro SET reg_welcome_sent = 1, reg_welcome_last = NOW() "
    . "WHERE $pkCol = $id LIMIT 1"
);

json_response(['sent' => true, 'to' => $row['reg_correo'], 'folio' => $folio]);