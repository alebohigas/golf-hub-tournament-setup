<?php
/**
 * Registro Welcome Email Endpoint
 * ----------------------------------------------------------------------
 * POST /api/registro_welcome_email.php   (JSON body: { id, password })
 *
 * Disparado por el botón "Enviar bienvenida" en la sección 4
 * ("Registros completados") del dashboard de pre-registros. Se usa
 * DESPUÉS de que el admin ya verificó pago + registro: notifica al
 * jugador que su inscripción al torneo en su categoría quedó oficial.
 *
 * Persiste un contador independiente (`reg_welcome_count`,
 * `reg_welcome_last`) para distinguirlo del correo de validación de
 * pago (`reg_email_count`).
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

/** Resolve schema. */
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

$select = ["$pkCol AS id", "$torneoCol AS torneoid"];
foreach (['reg_nombre','reg_apellido','reg_correo','reg_telefono','reg_celular',
          'reg_handicap','reg_categoria','reg_club','reg_es_socio','reg_tipo_socio',
          'reg_precio_estimado','reg_precio_moneda'] as $c) {
    if ($has($c)) $select[] = $c;
}

$sql = "SELECT " . implode(',', $select) . " FROM registro WHERE $pkCol = $id LIMIT 1";
$row = query_one($conn, $sql);
if (!$row) json_error('Registro no encontrado', 404);
if (empty($row['reg_correo'])) json_error('Registro sin correo', 400);

/** Folio mostrado en el correo (consistente con registro_email.php). */
$folio = ((int)$row['torneoid'] > 0)
    ? ((int)$row['torneoid'] . '-' . (int)$row['id'])
    : ('' . (int)$row['id']);

/** Resolve category name + tournament name/logo. */
$catName = '';
if (!empty($row['reg_categoria'])) {
    $cr = @$conn->query("SELECT categoria FROM categorias WHERE categoria_id = " . (int)$row['reg_categoria'] . " LIMIT 1");
    if ($cr) { $cc = $cr->fetch_assoc(); $cr->free(); if ($cc) $catName = $cc['categoria']; }
}
$torneoName = '';
$tr = @$conn->query("SELECT nombre FROM torneo WHERE torneo_id = " . (int)$row['torneoid'] . " LIMIT 1");
if ($tr) {
    $tt = $tr->fetch_assoc(); $tr->free();
    if ($tt) $torneoName = $tt['nombre'] ?? '';
}

$nombre = trim(($row['reg_nombre'] ?? '') . ' ' . ($row['reg_apellido'] ?? ''));
if ($nombre === '') $nombre = 'Jugador';

/** Helper: render value in bold span. */
$b = fn($v) => '<strong>' . htmlspecialchars((string)($v ?? '—'), ENT_QUOTES, 'UTF-8') . '</strong>';

/** Tabla resumen con datos del registro confirmado. */
$entries = [
    ['Folio',     '#' . $folio],
    ['Jugador',   $nombre],
    ['Categoría', $catName ?: '—'],
    ['Club',      $row['reg_club'] ?? '—'],
    ['Handicap',  $row['reg_handicap'] ?? '—'],
];
if ($torneoName) array_unshift($entries, ['Torneo', $torneoName]);

$rowsHtml = '';
foreach ($entries as [$label, $val]) {
    $rowsHtml .= '<tr>'
        . '<td style="padding:6px 12px;color:#666;font-size:13px;white-space:nowrap;">' . htmlspecialchars($label) . '</td>'
        . '<td style="padding:6px 12px;font-size:14px;">' . $b($val) . '</td>'
        . '</tr>';
}

$subject = '¡Bienvenido al torneo! · Registro confirmado · #' . $folio
    . ($torneoName ? ' · ' . $torneoName : '');

$html = '<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">'
    . '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5;padding:24px 0;">'
    . '<tr><td align="center">'
    . '<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:8px;padding:32px;">'
    . '<tr><td>'
    . '<h1 style="font-size:22px;margin:0 0 8px;color:#0a7d3e;">¡Bienvenido' . ($torneoName ? ' a ' . htmlspecialchars($torneoName) : '') . '!</h1>'
    . '<p style="font-size:14px;line-height:1.5;margin:0 0 16px;">Hola ' . htmlspecialchars($nombre) . ',</p>'
    . '<p style="font-size:15px;line-height:1.6;margin:0 0 16px;">'
    . 'Nos complace confirmar que su pago ha sido verificado y su <strong>registro al torneo ha quedado oficialmente completado</strong>'
    . ($catName ? ' en la categoría <strong>' . htmlspecialchars($catName) . '</strong>' : '')
    . '.'
    . '</p>'
    . '<p style="font-size:14px;line-height:1.6;margin:0 0 24px;">'
    . 'Le esperamos en el campo. Próximamente recibirá información sobre horarios de salida, reglas locales y demás detalles del evento.'
    . '</p>'
    . '<h2 style="font-size:13px;margin:24px 0 8px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Detalles de su registro</h2>'
    . '<table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #eee;border-radius:6px;border-collapse:collapse;">'
    . $rowsHtml
    . '</table>'
    . '<p style="font-size:13px;line-height:1.5;margin:32px 0 0;color:#0a7d3e;background:#eaf7ef;padding:12px 16px;border-radius:6px;">'
    . '<strong>¡Mucho éxito en el torneo!</strong> Si tiene alguna duda, responda a este correo y con gusto le atenderemos.'
    . '</p>'
    . '<p style="font-size:12px;color:#999;margin:32px 0 0;text-align:center;">'
    . ($torneoName ? htmlspecialchars($torneoName) : 'Registro confirmado')
    . '</p>'
    . '<p style="font-size:10px;color:#cccccc;margin:8px 0 0;text-align:center;">Ref: '
    . htmlspecialchars($folio) . ' · ' . date('Y-m-d H:i:s')
    . '</p>'
    . '</td></tr></table>'
    . '</td></tr></table>'
    . '</body></html>';

$textAlt = "Hola $nombre,\n\n"
    . "Su pago ha sido verificado y su registro al torneo"
    . ($torneoName ? " \"$torneoName\"" : '')
    . ($catName ? " en la categoría $catName" : '')
    . " ha quedado oficialmente completado.\n\n"
    . "Folio: #$folio\n\n"
    . "Le esperamos en el campo. ¡Mucho éxito!\n";

$res = smtp_send($row['reg_correo'], $nombre, $subject, $html, $textAlt);
if (!$res['ok']) {
    json_error('No se pudo enviar el correo: ' . ($res['error'] ?? 'desconocido'), 500);
}

/** Contador independiente para el correo de bienvenida. */
if (!$has('reg_welcome_count')) {
    @$conn->query("ALTER TABLE registro ADD COLUMN reg_welcome_count INT NOT NULL DEFAULT 0");
}
if (!$has('reg_welcome_last')) {
    @$conn->query("ALTER TABLE registro ADD COLUMN reg_welcome_last DATETIME NULL");
}
@$conn->query(
    "UPDATE registro SET reg_welcome_count = COALESCE(reg_welcome_count,0) + 1, "
    . "reg_welcome_last = NOW() WHERE $pkCol = $id LIMIT 1"
);

/**
 * Al enviar el correo de bienvenida, marcamos `verificado = 1` en el
 * registro para que la fila se mueva automáticamente a la sección
 * "Registros completados" en el dashboard admin.
 */
if ($has('reg_verificado')) {
    @$conn->query("UPDATE registro SET reg_verificado = 1 WHERE $pkCol = $id LIMIT 1");
}

json_response(['sent' => true, 'to' => $row['reg_correo'], 'folio' => $folio]);