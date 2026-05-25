<?php
/**
 * Registro Email Endpoint
 * ----------------------------------------------------------------------
 * POST /api/registro_email.php   (JSON body: { id, password })
 *
 * Triggered by the "Enviar correo" button in Section 1 of the admin
 * dashboard. Builds and sends an HTML email to the player with:
 *   - bold reg_id (player must include it in the payment concept)
 *   - summary of their pre-registration fields (values in bold)
 *   - embedded image from torneo.logo_cuentadeposito (bank details)
 *   - CTA button linking to /registro/comprobante?token=<reg_token>
 *
 * Sending does NOT flip `enviado` — that flag only becomes 1 when the
 * player actually uploads a receipt (or originally selected cargo a
 * cuenta). The email is just a reminder.
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

/** Resolve the registro row. */
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
          'reg_precio_estimado','reg_precio_moneda','reg_token','reg_id_club'] as $c) {
    if ($has($c)) $select[] = $c;
}

$sql = "SELECT " . implode(',', $select) . " FROM registro WHERE $pkCol = $id LIMIT 1";
$row = query_one($conn, $sql);
if (!$row) json_error('Registro no encontrado', 404);
if (empty($row['reg_correo'])) json_error('Registro sin correo', 400);

/**
 * Folio público mostrado al jugador y usado como concepto de pago.
 * Formato: <reg_id_torneo>-<reg_id>  (p.ej. "12-345").
 * Si por alguna razón no hay torneoid resuelto, cae a sólo el id.
 */
$folio = ((int)$row['torneoid'] > 0)
    ? ((int)$row['torneoid'] . '-' . (int)$row['id'])
    : ('' . (int)$row['id']);

/** Resolve category name + tournament logo_cuentadeposito. */
$catName = '';
if (!empty($row['reg_categoria'])) {
    $cr = @$conn->query("SELECT categoria FROM categorias WHERE categoria_id = " . (int)$row['reg_categoria'] . " LIMIT 1");
    if ($cr) { $cc = $cr->fetch_assoc(); $cr->free(); if ($cc) $catName = $cc['categoria']; }
}
$torneoName = '';
$cuentaImg  = '';
$tr = @$conn->query("SELECT nombre, logo_cuentadeposito FROM torneo WHERE torneo_id = " . (int)$row['torneoid'] . " LIMIT 1");
if ($tr) {
    $tt = $tr->fetch_assoc();
    $tr->free();
    if ($tt) {
        $torneoName = $tt['nombre'] ?? '';
        $cuentaImg  = trim((string)($tt['logo_cuentadeposito'] ?? ''));
    }
}

/** Build the public "subir comprobante" URL using the active host. */
$tokenUrl = '';
if (!empty($row['reg_token'])) {
    $tokenUrl = smtp_public_origin() . '/registro/comprobante?token=' . rawurlencode($row['reg_token']);
}

/** Render values as bold spans. */
$b = fn($v) => '<strong>' . htmlspecialchars((string)($v ?? '—'), ENT_QUOTES, 'UTF-8') . '</strong>';

$rowsHtml = '';
$entries = [
    ['Folio de registro', '#' . $folio],
    ['Nombre',        trim(($row['reg_nombre'] ?? '') . ' ' . ($row['reg_apellido'] ?? ''))],
    ['Correo',        $row['reg_correo'] ?? ''],
    ['Teléfono',      $row['reg_telefono'] ?? ($row['reg_celular'] ?? '')],
    ['Club',          $row['reg_club'] ?? ''],
    ['Categoría',     $catName],
    ['Handicap',      $row['reg_handicap'] ?? ''],
    ['Socio',         ($row['reg_es_socio'] ?? '') === 'SI' ? ('Sí · ' . ($row['reg_tipo_socio'] ?? '')) : 'No'],
];
if (!empty($row['reg_precio_estimado'])) {
    $entries[] = ['Monto a pagar', number_format((float)$row['reg_precio_estimado'], 2) . ' ' . ($row['reg_precio_moneda'] ?? 'MXN')];
}
foreach ($entries as [$label, $val]) {
    $rowsHtml .= '<tr>'
        . '<td style="padding:6px 12px;color:#666;font-size:13px;white-space:nowrap;">' . htmlspecialchars($label) . '</td>'
        . '<td style="padding:6px 12px;font-size:14px;">' . $b($val) . '</td>'
        . '</tr>';
}

$cuentaImgHtml = '';
if ($cuentaImg !== '') {
    $cuentaImgHtml = '<div style="margin:24px 0;text-align:center;">'
        . '<img src="' . htmlspecialchars($cuentaImg, ENT_QUOTES) . '" alt="Datos de la cuenta" '
        . 'style="max-width:100%;height:auto;border:1px solid #e5e5e5;border-radius:6px;" />'
        . '</div>';
}

$ctaHtml = '';
if ($tokenUrl !== '') {
    $ctaHtml = '<div style="text-align:center;margin:32px 0 8px;">'
        . '<a href="' . htmlspecialchars($tokenUrl, ENT_QUOTES) . '" '
        . 'style="display:inline-block;background:#0a7d3e;color:#ffffff;'
        . 'padding:14px 28px;border-radius:6px;text-decoration:none;'
        . 'font-weight:600;font-size:15px;">Adjuntar comprobante a su registro</a>'
        . '</div>'
        . '<p style="text-align:center;font-size:12px;color:#888;margin:4px 0 0;">'
        . 'O copia este enlace: <a href="' . htmlspecialchars($tokenUrl, ENT_QUOTES) . '">' . htmlspecialchars($tokenUrl) . '</a></p>';
}

$nombre = trim(($row['reg_nombre'] ?? '') . ' ' . ($row['reg_apellido'] ?? ''));
if ($nombre === '') $nombre = 'Jugador';

$subject = 'Pre-registro validado · Folio #' . $folio
    . ($torneoName ? ' · ' . $torneoName : '');

$html = '<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">'
    . '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5;padding:24px 0;">'
    . '<tr><td align="center">'
    . '<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:8px;padding:32px;">'
    . '<tr><td>'
    . '<h1 style="font-size:20px;margin:0 0 8px;color:#0a7d3e;">Su registro ha sido validado</h1>'
    . '<p style="font-size:14px;line-height:1.5;margin:0 0 16px;">Hola ' . htmlspecialchars($nombre) . ',</p>'
    . '<p style="font-size:14px;line-height:1.5;margin:0 0 16px;">'
    . 'Para terminar su registro, por favor realice el pago a la siguiente cuenta. '
    . '<strong>IMPORTANTE:</strong> agregar el folio de registro '
    . '<span style="background:#fff3cd;padding:2px 6px;border-radius:4px;font-weight:bold;font-size:16px;">#' . htmlspecialchars($folio) . '</span> '
    . 'en el concepto de su pago.'
    . '</p>'
    . $cuentaImgHtml
    . $ctaHtml
    . '<h2 style="font-size:14px;margin:24px 0 8px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Datos del registro</h2>'
    . '<table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #eee;border-radius:6px;border-collapse:collapse;">'
    . $rowsHtml
    . '</table>'
    . '<p style="font-size:13px;line-height:1.5;margin:32px 0 0;color:#c0392b;background:#ffeaea;padding:12px 16px;border-radius:6px;">'
    . '<strong>IMPORTANTE:</strong> Esto no es una confirmación de registro al torneo. '
    . 'Una vez que haya sido verificado su pago, se enviará un correo confirmando su registro oficial.'
    . '</p>'
    . '<p style="font-size:12px;color:#999;margin:32px 0 0;text-align:center;">'
    . ($torneoName ? htmlspecialchars($torneoName) : 'Pre-Registro')
    . '</p>'
    . '<p style="font-size:10px;color:#cccccc;margin:8px 0 0;text-align:center;">Ref: '
    . htmlspecialchars($folio) . ' · ' . date('Y-m-d H:i:s')
    . '</p>'
    . '</td></tr></table>'
    . '</td></tr></table>'
    . '</body></html>';

$textAlt = "Hola $nombre,\n\nSu registro ha sido validado. Folio: #{$folio}\n"
    . "Por favor incluya el folio en el concepto de pago.\n"
    . ($tokenUrl ? "Subir comprobante: $tokenUrl\n" : '')
    . "\nIMPORTANTE: Esto no es una confirmación de registro al torneo. "
    . "Una vez que haya sido verificado su pago, se enviará un correo confirmando su registro oficial.\n";

$res = smtp_send($row['reg_correo'], $nombre, $subject, $html, $textAlt);
if (!$res['ok']) {
    json_error('No se pudo enviar el correo: ' . ($res['error'] ?? 'desconocido'), 500);
}

/**
 * Persistir contador de envíos y timestamp del último envío exitoso.
 * Auto-crea las columnas si no existen (idempotente). Esto alimenta la
 * columna "Estatus Correo" en la sección 1 del admin y permite que el
 * botón cambie a "Volver a enviar" tras el primer envío.
 */
if (!$has('reg_email_count')) {
    @$conn->query("ALTER TABLE registro ADD COLUMN reg_email_count INT NOT NULL DEFAULT 0");
}
if (!$has('reg_email_last')) {
    @$conn->query("ALTER TABLE registro ADD COLUMN reg_email_last DATETIME NULL");
}
@$conn->query(
    "UPDATE registro SET reg_email_count = COALESCE(reg_email_count,0) + 1, "
    . "reg_email_last = NOW() WHERE $pkCol = $id LIMIT 1"
);

json_response(['sent' => true, 'to' => $row['reg_correo'], 'folio' => $folio]);