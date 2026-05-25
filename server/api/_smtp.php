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
 * Pick the next sender mailbox from `cuentas_correo` using the MySQL
 * stored function `f_correo()`. The function:
 *   - Resets `numcorreos` to 0 for rows whose `fecha` is older than today
 *   - Selects the first account with `numcorreos < 250`
 *   - Increments that account's `numcorreos` by 1 (for the primary TO)
 * Returns the picked email address, or null on failure (caller falls back
 * to the static $SMTP_USER from credentials.php).
 *
 * @param mysqli|null $conn Active DB connection (optional; uses global $conn).
 * @return string|null Picked sender email or null.
 */
function smtp_pick_sender($conn = null) {
    if (!$conn) { global $conn; }
    if (!$conn) return null;
    $res = @$conn->query("SELECT f_correo() AS c");
    if (!$res) {
        error_log('[smtp] f_correo() failed: ' . $conn->error);
        return null;
    }
    $row = $res->fetch_assoc();
    $res->free();
    $picked = trim((string)($row['c'] ?? ''));
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
        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = $SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = $fromAddr;  // rotated mailbox
            $mail->Password   = $SMTP_PASS;
            $mail->Port       = (int)($SMTP_PORT ?? 587);
            $mail->SMTPSecure = ((int)$mail->Port === 465)
                ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
                : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->CharSet    = 'UTF-8';
            $mail->setFrom($fromAddr, $fromName);
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
            // Charge each CC recipient to the same rotated mailbox.
            // f_correo() already counted +1 for the primary TO.
            smtp_bump_counter($conn, $fromAddr, count($ccList));
            return ['ok' => true, 'error' => null];
        } catch (\Throwable $e) {
            error_log('[smtp] PHPMailer failed: ' . $e->getMessage());
            return ['ok' => false, 'error' => $e->getMessage()];
        }
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