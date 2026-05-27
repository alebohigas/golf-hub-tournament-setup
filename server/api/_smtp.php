<?php
/**
 * SMTP helper for registro emails
 * ----------------------------------------------------------------------
 * Sends transactional emails for the pre-registration flow.
 *
 * Uses PHPMailer when present at /api/PHPMailer/ (3 source files dropped
 * in manually — Composer is not available on IONOS shared). Falls back
 * to PHP's native mail() with HTML headers when PHPMailer is missing so
 * deployments without the library still get a (best-effort) send.
 *
 * SMTP credentials are loaded from credentials.php:
 *   $SMTP_HOST, $SMTP_PORT, $SMTP_USER, $SMTP_PASS, $SMTP_FROM_NAME
 */

/**
 * Try to load PHPMailer classes from /api/PHPMailer/.
 * Returns true if all three required files are loaded.
 */
function smtp_load_phpmailer() {
    static $loaded = null;
    if ($loaded !== null) return $loaded;
    $base = __DIR__ . '/PHPMailer';
    $files = ['Exception.php', 'PHPMailer.php', 'SMTP.php'];
    foreach ($files as $f) {
        if (!file_exists("$base/$f")) { $loaded = false; return false; }
    }
    foreach ($files as $f) require_once "$base/$f";
    $loaded = class_exists('\\PHPMailer\\PHPMailer\\PHPMailer');
    return $loaded;
}

/**
 * Pick the next sender mailbox from `cuentas_correo`.
 *
 * Política de rotación (replicada en PHP para tener control fino sobre el
 * fallback — la función MySQL f_correo() corta en 250 y devuelve vacío si
 * todas pasaron de ese umbral):
 *
 *   1) Reset diario: pone `numcorreos = 0` en las filas cuya `fecha` es
 *      anterior a hoy (mismo comportamiento que f_correo).
 *   2) Modo normal: elige la cuenta con `numcorreos < 250`, priorizando
 *      la de menor contador (ORDER BY numcorreos ASC, id ASC). Cambia de
 *      buzón en cuanto el actual llega a 250.
 *   3) Modo emergencia: si TODAS las cuentas ya pasaron de 250 (no
 *      debería ocurrir), se eligen cuentas con `numcorreos < 500` rotando
 *      cada 50 envíos. Se usa ORDER BY FLOOR(numcorreos/50) ASC, id ASC
 *      → la misma cuenta atiende un bloque de 50 antes de saltar a otra.
 *      Limite duro: 500/día (IONOS = 500, dejamos margen).
 *   4) Incrementa `numcorreos` y refresca `fecha` para el destinatario
 *      principal (los CC se cargan después vía smtp_bump_counter()).
 *
 * Devuelve el correo elegido, o null si no hay ninguno bajo 500 (en cuyo
 * caso el caller cae al $SMTP_USER estático de credentials.php).
 */
function smtp_pick_sender($conn = null) {
    if (!$conn) { global $conn; }
    if (!$conn) return null;

    // 1) Reset diario (mismo criterio que f_correo()).
    @$conn->query(
        "UPDATE cuentas_correo SET numcorreos = 0 "
        . "WHERE LEFT(fecha,10) < LEFT(CURDATE(),10)"
    );

    // 2) Modo normal: la primera cuenta con < 250 envíos del día.
    $sql = "SELECT id, cuenta_correo FROM cuentas_correo "
         . "WHERE numcorreos < 250 "
         . "ORDER BY numcorreos ASC, id ASC LIMIT 1";
    $res = @$conn->query($sql);
    $row = $res ? $res->fetch_assoc() : null;
    if ($res) $res->free();

    // 3) Modo emergencia: nadie bajo 250 → rotar cada 50 hasta tope 500.
    if (!$row) {
        $sql2 = "SELECT id, cuenta_correo FROM cuentas_correo "
              . "WHERE numcorreos < 500 "
              . "ORDER BY FLOOR(numcorreos/50) ASC, id ASC LIMIT 1";
        $res2 = @$conn->query($sql2);
        $row = $res2 ? $res2->fetch_assoc() : null;
        if ($res2) $res2->free();
        if ($row) {
            error_log('[smtp] cuentas_correo en modo emergencia: todas las cuentas > 250, rotando cada 50.');
        }
    }

    if (!$row) {
        error_log('[smtp] cuentas_correo agotado: todas las cuentas llegaron al limite diario (500).');
        return null;
    }

    // 4) Reservar +1 envío (TO) y refrescar fecha para el reset diario.
    $idv = (int)$row['id'];
    @$conn->query(
        "UPDATE cuentas_correo SET numcorreos = numcorreos + 1, fecha = NOW() "
        . "WHERE id = $idv LIMIT 1"
    );

    $picked = trim((string)$row['cuenta_correo']);
    return $picked !== '' ? $picked : null;
}

/**
 * Increment the daily send counter for a sender mailbox by N additional
 * units. Used to charge CC recipients to the same picked account (the
 * primary TO was already counted inside f_correo()).
 *
 * @param mysqli $conn   Active DB connection.
 * @param string $sender Email address that was used as sender.
 * @param int    $extra  Number of additional recipients to charge.
 */
function smtp_bump_counter($conn, $sender, $extra) {
    if (!$conn || !$sender || $extra <= 0) return;
    $s = $conn->real_escape_string($sender);
    $n = (int)$extra;
    @$conn->query(
        "UPDATE cuentas_correo SET numcorreos = numcorreos + $n "
        . "WHERE cuenta_correo = '$s' LIMIT 1"
    );
}

/**
 * Send an HTML email. Returns ['ok'=>bool, 'error'=>string|null].
 *
 * The sender (Username/From) is rotated per call via `f_correo()` so that
 * no single IONOS mailbox exceeds the 250/day limit. All mailboxes share
 * $SMTP_PASS and live under @speitour.mx (SPF-authorized). Reply-To is
 * fixed to $SMTP_REPLY_TO (default noreply@speitour.mx).
 *
 * @param string       $to       Primary recipient email
 * @param string       $toName   Recipient display name
 * @param string       $subject  Subject line
 * @param string       $html     HTML body
 * @param string       $textAlt  Plain-text alternative (optional)
 * @param array        $cc       Optional list of CC emails (or [email,name] pairs)
 */
function smtp_send($to, $toName, $subject, $html, $textAlt = '', $cc = []) {
    global $SMTP_HOST, $SMTP_PORT, $SMTP_USER, $SMTP_PASS, $SMTP_FROM_NAME,
           $SMTP_REPLY_TO, $conn;

    // 1) Rotate sender via cuentas_correo. Fall back to static SMTP_USER
    //    if the DB lookup fails so registro_email keeps working.
    $fromAddr = smtp_pick_sender($conn);
    if (!$fromAddr) $fromAddr = $SMTP_USER ?? '';
    $fromName = $SMTP_FROM_NAME ?? 'Pre-Registro';
    $replyTo  = $SMTP_REPLY_TO ?? 'noreply@speitour.mx';
    if (!$fromAddr) {
        return ['ok' => false, 'error' => 'No hay cuenta de envío disponible (cuentas_correo agotado y SMTP_USER vacío)'];
    }

    // 2) Normalize CC list to [[email, name], ...] for PHPMailer.
    $ccList = [];
    foreach ((array)$cc as $entry) {
        if (is_array($entry)) {
            $addr = trim((string)($entry[0] ?? ''));
            $nm   = trim((string)($entry[1] ?? ''));
        } else {
            $addr = trim((string)$entry);
            $nm   = '';
        }
        if ($addr !== '') $ccList[] = [$addr, $nm];
    }

    // Preferred path: PHPMailer over SMTP with credentials.
    if (smtp_load_phpmailer() && !empty($SMTP_HOST) && !empty($SMTP_PASS)) {
        /**
         * Intento principal con la cuenta rotada; si la auth/envío falla
         * y la cuenta rotada es DISTINTA al $SMTP_USER estático, hacemos
         * un único reintento con $SMTP_USER (la cuenta "maestra" que
         * sabemos que funciona) para que el correo igualmente llegue.
         */
        $candidates = [$fromAddr];
        $staticUser = trim((string)($SMTP_USER ?? ''));
        if ($staticUser !== '' && strcasecmp($staticUser, $fromAddr) !== 0) {
            $candidates[] = $staticUser;
        }
        $lastErr = null;
        foreach ($candidates as $idx => $senderAddr) {
            try {
                $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
                $mail->isSMTP();
                $mail->Host       = $SMTP_HOST;
                $mail->SMTPAuth   = true;
                $mail->Username   = $senderAddr;
                $mail->Password   = $SMTP_PASS;
                $mail->Port       = (int)($SMTP_PORT ?? 587);
                $mail->SMTPSecure = ((int)$mail->Port === 465)
                    ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
                    : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                $mail->CharSet    = 'UTF-8';
                $mail->setFrom($senderAddr, $fromName);
                $mail->addAddress($to, $toName ?: $to);
                foreach ($ccList as [$ccAddr, $ccName]) {
                    $mail->addCC($ccAddr, $ccName ?: $ccAddr);
                }
                $mail->addReplyTo($replyTo, $fromName);
                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body    = $html;
                if ($textAlt) $mail->AltBody = $textAlt;
                $mail->send();
                smtp_bump_counter($conn, $senderAddr, count($ccList));
                if ($idx > 0) {
                    error_log("[smtp] envío OK con fallback $senderAddr tras fallar $fromAddr");
                }
                return ['ok' => true, 'error' => null];
            } catch (\Throwable $e) {
                $lastErr = $e->getMessage();
                error_log("[smtp] PHPMailer falló con $senderAddr: $lastErr");
                continue;
            }
        }
        return ['ok' => false, 'error' => $lastErr ?: 'SMTP send failed'];
    }

    // Fallback: PHP mail() with HTML headers (deliverability not guaranteed).
    $boundary = bin2hex(random_bytes(8));
    $headers  = "From: {$fromName} <{$fromAddr}>\r\n";
    $headers .= "Reply-To: <{$replyTo}>\r\n";
    if (!empty($ccList)) {
        $ccHeader = implode(', ', array_map(fn($p) => $p[0], $ccList));
        $headers .= "Cc: {$ccHeader}\r\n";
    }
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $ok = @mail($to, $subject, $html, $headers);
    if (!$ok) error_log("[smtp] mail() fallback failed for $to");
    if ($ok) smtp_bump_counter($conn, $fromAddr, count($ccList));
    return ['ok' => (bool)$ok, 'error' => $ok ? null : 'mail() falló (sin PHPMailer/SMTP)'];
}

/**
 * Build the absolute public URL for the player's "Adjuntar comprobante"
 * page using the active host. Falls back to https if scheme cannot be
 * detected (most IONOS deployments are TLS).
 */
function smtp_public_origin() {
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $isHttps = (
        (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
        (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') ||
        (($_SERVER['SERVER_PORT'] ?? '') == 443)
    );
    return ($isHttps ? 'https' : 'http') . '://' . $host;
}