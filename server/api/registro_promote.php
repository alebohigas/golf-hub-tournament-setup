<?php
/**
 * Registro Promote Endpoint (Lista de espera → Pendiente pago)
 * ----------------------------------------------------------------------
 * POST /api/registro_promote.php   (JSON body: { id, password })
 *
 * Disparado por el botón "Agregar a categoría" en la sección 5
 * ("Lista de espera") del dashboard de pre-registros. Se usa cuando se
 * libera un lugar en la categoría del jugador (por baja de otro
 * inscrito) y el comité decide moverlo al flujo normal.
 *
 * Efectos:
 *   1) Valida que la categoría tenga cupo (jugadores < maxjugadores).
 *   2) UPDATE status_pago = 0 → el registro pasa a la sección 2
 *      ("Pendiente verificación de pago") del admin.
 *   3) Envía automáticamente el correo "registro validado" con los
 *      datos bancarios y el link para subir comprobante (misma plantilla
 *      que registro_email.php).
 *   4) Incrementa `reg_email_count` / `reg_email_last`.
 *
 * Devuelve {ok:true, to:..., folio:...} en éxito.
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

/** Schema discovery (mismo patrón que registro_email.php). */
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
          'reg_precio_estimado','reg_precio_moneda','reg_token','status_pago'] as $c) {
    if ($has($c)) $select[] = $c;
}

$row = query_one($conn,
    "SELECT " . implode(',', $select) . " FROM registro WHERE $pkCol = $id LIMIT 1");
if (!$row) json_error('Registro no encontrado', 404);
if (empty($row['reg_correo'])) json_error('Registro sin correo', 400);

// Sólo registros en lista de espera (status_pago=67) pueden promoverse.
if ((int)($row['status_pago'] ?? 0) !== 67) {
    json_error('El registro no está en lista de espera (status_pago != 67).', 400);
}

/**
 * Validar cupo real antes de promover. Si la categoría sigue llena, no
 * dejamos pasar. Se considera "lleno" cuando maxjugadores > 0 y <> 99
 * (99 = ilimitado en la convención del proyecto) y el conteo actual
 * iguala/supera el máximo.
 */
$categoriaId = (int)($row['reg_categoria'] ?? 0);
$torneoId    = (int)$row['torneoid'];
if ($categoriaId <= 0 || $torneoId <= 0) {
    json_error('Registro sin categoría o torneo válidos.', 400);
}
$cr = @$conn->query("SELECT maxjugadores FROM categorias
                     WHERE categoria_id = $categoriaId AND torneo_id = $torneoId LIMIT 1");
$max = 0;
if ($cr) { $crow = $cr->fetch_assoc(); $cr->free(); if ($crow) $max = (int)$crow['maxjugadores']; }

$jc = @$conn->query("SELECT COUNT(*) AS n FROM jugadores
                     WHERE torneoid = $torneoId AND categoriaid = $categoriaId
                       AND (estatus IS NULL OR estatus <> 'BAJA')");
$count = 0;
if ($jc) { $count = (int)($jc->fetch_assoc()['n'] ?? 0); $jc->free(); }

$unlimited = ($max <= 0 || $max === 99);
if (!$unlimited && $count >= $max) {
    json_error("La categoría sigue llena ($count/$max). No se puede promover.", 409);
}

// Mover al flujo normal: status_pago = 0 → aparece en sección 2.
if (!$has('status_pago')) {
    json_error('La columna status_pago no existe en la BD.', 500);
}
if (!@$conn->query("UPDATE registro SET status_pago = 0 WHERE $pkCol = $id LIMIT 1")) {
    json_error('No se pudo actualizar status_pago: ' . $conn->error, 500);
}

/*
 * ============= Envío de correo "registro validado" =============
 * Replica la misma plantilla de registro_email.php (datos bancarios + CTA
 * para subir comprobante). Mantenido inline para no introducir
 * dependencias circulares entre endpoints.
 */
$folio = ($torneoId > 0) ? ($torneoId . '-' . (int)$row['id']) : ('' . (int)$row['id']);

$catName = '';
$cr2 = @$conn->query("SELECT categoria FROM categorias WHERE categoria_id = $categoriaId LIMIT 1");
if ($cr2) { $cc = $cr2->fetch_assoc(); $cr2->free(); if ($cc) $catName = $cc['categoria']; }

$torneoName = '';
$cuentaImg  = '';
$tr = @$conn->query("SELECT nombre, logo_cuentadeposito FROM torneo WHERE torneo_id = $torneoId LIMIT 1");
if ($tr) {
    $tt = $tr->fetch_assoc(); $tr->free();
    if ($tt) {
        $torneoName = $tt['nombre'] ?? '';
        $cuentaImg  = trim((string)($tt['logo_cuentadeposito'] ?? ''));
    }
}

$tokenUrl = '';
if (!empty($row['reg_token'])) {
    $tokenUrl = smtp_public_origin() . '/registro/comprobante?token=' . rawurlencode($row['reg_token']);
}

$b = fn($v) => '<strong>' . htmlspecialchars((string)($v ?? '—'), ENT_QUOTES, 'UTF-8') . '</strong>';

$entries = [
    ['Folio de registro', '#' . $folio],
    ['Nombre',    trim(($row['reg_nombre'] ?? '') . ' ' . ($row['reg_apellido'] ?? ''))],
    ['Correo',    $row['reg_correo'] ?? ''],
    ['Teléfono',  $row['reg_telefono'] ?? ($row['reg_celular'] ?? '')],
    ['Club',      $row['reg_club'] ?? ''],
    ['Categoría', $catName],
    ['Handicap',  $row['reg_handicap'] ?? ''],
    ['Socio',     ($row['reg_es_socio'] ?? '') === 'SI' ? ('Sí · ' . ($row['reg_tipo_socio'] ?? '')) : 'No'],
];
if (!empty($row['reg_precio_estimado'])) {
    $entries[] = ['Monto a pagar', number_format((float)$row['reg_precio_estimado'], 2) . ' ' . ($row['reg_precio_moneda'] ?? 'MXN')];
}
$rowsHtml = '';
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
        . 'width="500" '
        . 'style="max-width:500px;max-height:300px;width:auto;height:auto;'
        . 'object-fit:contain;border:1px solid #e5e5e5;border-radius:6px;" />'
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

$subject = '¡Se abrió un lugar! Pre-registro validado · Folio #' . $folio
    . ($torneoName ? ' · ' . $torneoName : '');

$promoBanner = '<div style="background:#eaf7ef;border:1px solid #0a7d3e;'
    . 'border-radius:6px;padding:14px 18px;margin:0 0 20px;'
    . 'font-size:16px;font-weight:bold;color:#0a5a2c;">'
    . '¡Buenas noticias! Se abrió un lugar en su categoría y su registro '
    . 'avanzó automáticamente de la lista de espera. Continúe con el pago '
    . 'para finalizar su inscripción.'
    . '</div>';

$html = '<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">'
    . '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5;padding:24px 0;">'
    . '<tr><td align="center">'
    . '<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:8px;padding:32px;">'
    . '<tr><td>'
    . $promoBanner
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

$textAlt = "Hola $nombre,\n\n"
    . "¡Se abrió un lugar! Su registro avanzó automáticamente de la lista de espera. "
    . "Para terminar su inscripción, realice el pago. Folio: #$folio\n"
    . "Incluya el folio en el concepto de pago.\n"
    . ($tokenUrl ? "Subir comprobante: $tokenUrl\n" : '')
    . "\nUna vez verificado el pago, se enviará confirmación oficial.\n";

$res = smtp_send($row['reg_correo'], $nombre, $subject, $html, $textAlt);
if (!$res['ok']) {
    // El registro ya fue promovido; reportar el fallo del correo sin
    // revertir el cambio (el admin puede reenviar desde sec1/sec2).
    json_error('Registro promovido pero el correo falló: ' . ($res['error'] ?? 'desconocido'), 500);
}

// Persistir contador de correos (mismo schema que registro_email.php).
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

json_response(['ok' => true, 'to' => $row['reg_correo'], 'folio' => $folio]);