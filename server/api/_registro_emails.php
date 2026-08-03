<?php
/**
 * Registro Email Helpers
 * ----------------------------------------------------------------------
 * Helpers shared by registro.php (initial pre-registration submit) and
 * registro_publico.php (player uploads comprobante via public token):
 *
 *   send_registration_ack_email($conn, $regId)
 *     "Pre-registro recibido" — sent right after a normal (non-waitlist)
 *     INSERT so the player gets immediate confirmation of their entry.
 *
 *   send_comprobante_received_email($conn, $regId)
 *     "Comprobante recibido" — sent when the player attaches the payment
 *     receipt through the public token page, so they know it arrived.
 *
 * Both are best-effort: errors are logged and never break the flow.
 * Both rely on smtp_send() from _smtp.php (already loaded by callers).
 */

if (!function_exists('send_registration_ack_email')) {

/**
 * Resolve {pkCol, torneoCol, has} for the `registro` table in one pass.
 * Returns null if essential columns are missing.
 */
function _regmail_meta($conn) {
    $cols = query_all($conn, "SHOW COLUMNS FROM registro");
    $set  = [];
    foreach ($cols as $c) $set[$c['Field']] = true;
    $has = fn($c) => isset($set[$c]);
    $pkCol = $has('id') ? 'id' : ($has('reg_id') ? 'reg_id' : null);
    $torneoCol = null;
    foreach (['reg_id_torneo','torneo_id','id_torneo','idtorneo','torneoid'] as $c) {
        if ($has($c)) { $torneoCol = $c; break; }
    }
    if (!$pkCol || !$torneoCol) return null;
    return ['pk' => $pkCol, 'torneo' => $torneoCol, 'has' => $has];
}

/** Confirmation email after the initial pre-registration form is saved. */
function send_registration_ack_email($conn, $registroId) {
    $registroId = (int)$registroId;
    if ($registroId <= 0) return;
    $meta = _regmail_meta($conn);
    if (!$meta) return;
    $pkCol = $meta['pk']; $torneoCol = $meta['torneo']; $has = $meta['has'];

    $sel = ["$pkCol AS id", "$torneoCol AS torneoid"];
    foreach (['reg_nombre','reg_apellido','reg_correo','reg_telefono','reg_celular',
              'reg_handicap','reg_categoria','reg_club','reg_es_socio','reg_tipo_socio',
              'reg_cargo_socio','reg_precio_estimado','reg_precio_moneda'] as $c) {
        if ($has($c)) $sel[] = $c;
    }
    $row = query_one($conn, "SELECT " . implode(',', $sel) . " FROM registro WHERE $pkCol = $registroId LIMIT 1");
    if (!$row || empty($row['reg_correo'])) return;

    $folio = ((int)$row['torneoid'] > 0)
        ? ((int)$row['torneoid'] . '-' . (int)$row['id'])
        : ('' . (int)$row['id']);

    $catName = '';
    if (!empty($row['reg_categoria'])) {
        $cr = @$conn->query("SELECT categoria FROM categorias WHERE categoria_id = " . (int)$row['reg_categoria'] . " LIMIT 1");
        if ($cr) { $cc = $cr->fetch_assoc(); $cr->free(); if ($cc) $catName = $cc['categoria']; }
    }
    $torneoName = '';
    $torneoMail = '';
    $tr = @$conn->query("SELECT nombre, correotorne FROM torneo WHERE torneo_id = " . (int)$row['torneoid'] . " LIMIT 1");
    if ($tr) {
        $tt = $tr->fetch_assoc(); $tr->free();
        if ($tt) {
            $torneoName = $tt['nombre'] ?? '';
            $torneoMail = trim((string)($tt['correotorne'] ?? ''));
        }
    }

    $nombre = trim(($row['reg_nombre'] ?? '') . ' ' . ($row['reg_apellido'] ?? ''));
    if ($nombre === '') $nombre = 'Jugador';

    $b = fn($v) => '<strong>' . htmlspecialchars((string)($v ?? '—'), ENT_QUOTES, 'UTF-8') . '</strong>';
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

    $subject = 'Pre-registro recibido · Folio #' . $folio
        . ($torneoName ? ' · ' . $torneoName : '');

    $html = '<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">'
        . '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5;padding:24px 0;">'
        . '<tr><td align="center">'
        . '<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:8px;padding:32px;">'
        . '<tr><td>'
        . '<h1 style="font-size:20px;margin:0 0 8px;color:#0a7d3e;">Pre-registro recibido</h1>'
        . '<p style="font-size:14px;line-height:1.5;margin:0 0 16px;">Hola ' . htmlspecialchars($nombre) . ',</p>'
        . '<p style="font-size:14px;line-height:1.6;margin:0 0 16px;">'
        . 'Hemos recibido tu pre-registro. El comité del torneo lo revisará y te contactaremos para los siguientes pasos.'
        . '</p>'
        . '<h2 style="font-size:13px;margin:24px 0 8px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Detalles de tu pre-registro</h2>'
        . '<table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #eee;border-radius:6px;border-collapse:collapse;">'
        . $rowsHtml
        . '</table>'
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
        . "Hemos recibido tu pre-registro.\n\n"
        . "Folio: #$folio\n"
        . ($catName ? "Categoría: $catName\n" : '')
        . ($torneoName ? "Torneo: $torneoName\n" : '');

    // CC fijo al buzón de coordinación para tener trazabilidad de cada paso del pre-registro.
    // Se añade también el correo del torneo (torneo.correotorne) cuando existe.
    $ccAdmin = _regmail_admin_cc($torneoMail);
    $res = smtp_send($row['reg_correo'], $nombre, $subject, $html, $textAlt, $ccAdmin);
    if (!$res['ok']) {
        error_log('[registro_ack_email] send failed id=' . $registroId . ' err=' . ($res['error'] ?? ''));
    }
}

/** Confirmation email after the player uploads the payment receipt. */
function send_comprobante_received_email($conn, $registroId) {
    $registroId = (int)$registroId;
    if ($registroId <= 0) return;
    $meta = _regmail_meta($conn);
    if (!$meta) return;
    $pkCol = $meta['pk']; $torneoCol = $meta['torneo']; $has = $meta['has'];

    $sel = ["$pkCol AS id", "$torneoCol AS torneoid"];
    foreach (['reg_nombre','reg_apellido','reg_correo','reg_categoria',
              'reg_precio_estimado','reg_precio_moneda'] as $c) {
        if ($has($c)) $sel[] = $c;
    }
    $row = query_one($conn, "SELECT " . implode(',', $sel) . " FROM registro WHERE $pkCol = $registroId LIMIT 1");
    if (!$row || empty($row['reg_correo'])) return;

    $folio = ((int)$row['torneoid'] > 0)
        ? ((int)$row['torneoid'] . '-' . (int)$row['id'])
        : ('' . (int)$row['id']);

    $torneoName = '';
    $torneoMail = '';
    $tr = @$conn->query("SELECT nombre, correotorne FROM torneo WHERE torneo_id = " . (int)$row['torneoid'] . " LIMIT 1");
    if ($tr) {
        $tt = $tr->fetch_assoc(); $tr->free();
        if ($tt) {
            $torneoName = $tt['nombre'] ?? '';
            $torneoMail = trim((string)($tt['correotorne'] ?? ''));
        }
    }

    $catName = '';
    if (!empty($row['reg_categoria'])) {
        $cr = @$conn->query("SELECT categoria FROM categorias WHERE categoria_id = " . (int)$row['reg_categoria'] . " LIMIT 1");
        if ($cr) { $cc = $cr->fetch_assoc(); $cr->free(); if ($cc) $catName = $cc['categoria']; }
    }

    $nombre = trim(($row['reg_nombre'] ?? '') . ' ' . ($row['reg_apellido'] ?? ''));
    if ($nombre === '') $nombre = 'Jugador';

    $subject = 'Comprobante recibido · Folio #' . $folio
        . ($torneoName ? ' · ' . $torneoName : '');

    $html = '<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">'
        . '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5;padding:24px 0;">'
        . '<tr><td align="center">'
        . '<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:8px;padding:32px;">'
        . '<tr><td>'
        . '<h1 style="font-size:20px;margin:0 0 8px;color:#0a7d3e;">¡Comprobante recibido!</h1>'
        . '<p style="font-size:14px;line-height:1.5;margin:0 0 16px;">Hola ' . htmlspecialchars($nombre) . ',</p>'
        . '<p style="font-size:14px;line-height:1.6;margin:0 0 16px;">'
        . 'Recibimos tu comprobante de pago para el folio <strong>#' . htmlspecialchars($folio) . '</strong>'
        . ($catName ? ' (categoría <strong>' . htmlspecialchars($catName) . '</strong>)' : '')
        . '. El comité del torneo validará el pago y te confirmaremos tu registro en breve.'
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
        . "Recibimos tu comprobante de pago para el folio #$folio.\n"
        . "El comité validará tu pago y te confirmaremos tu registro en breve.\n"
        . ($torneoName ? "Torneo: $torneoName\n" : '');

    // CC fijo al buzón de coordinación para tener trazabilidad de cada paso del pre-registro.
    // Se añade también el correo del torneo (torneo.correotorne) cuando existe.
    $ccAdmin = _regmail_admin_cc($torneoMail);
    $res = smtp_send($row['reg_correo'], $nombre, $subject, $html, $textAlt, $ccAdmin);
    if (!$res['ok']) {
        error_log('[registro_comprobante_email] send failed id=' . $registroId . ' err=' . ($res['error'] ?? ''));
    }
}

} // end function_exists guard