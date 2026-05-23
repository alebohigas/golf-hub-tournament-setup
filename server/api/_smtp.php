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
 * Send an HTML email. Returns ['ok'=>bool, 'error'=>string|null].
 *
 * @param string $to       Recipient email
 * @param string $toName   Recipient display name
 * @param string $subject  Subject line
 * @param string $html     HTML body
 * @param string $textAlt  Plain-text alternative (optional)
 */
function smtp_send($to, $toName, $subject, $html, $textAlt = '') {
    global $SMTP_HOST, $SMTP_PORT, $SMTP_USER, $SMTP_PASS, $SMTP_FROM_NAME;

    $fromAddr = $SMTP_USER ?? '';
    $fromName = $SMTP_FROM_NAME ?? 'Pre-Registro';
    if (!$fromAddr) {
        return ['ok' => false, 'error' => 'SMTP_USER no configurado en credentials.php'];
    }

    // Preferred path: PHPMailer over SMTP with credentials.
    if (smtp_load_phpmailer() && !empty($SMTP_HOST) && !empty($SMTP_PASS)) {
        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = $SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = $SMTP_USER;
            $mail->Password   = $SMTP_PASS;
            $mail->Port       = (int)($SMTP_PORT ?? 587);
            $mail->SMTPSecure = ((int)$mail->Port === 465)
                ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
                : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->CharSet    = 'UTF-8';
            $mail->setFrom($fromAddr, $fromName);
            $mail->addAddress($to, $toName ?: $to);
            $mail->addReplyTo($fromAddr, $fromName);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $html;
            if ($textAlt) $mail->AltBody = $textAlt;
            $mail->send();
            return ['ok' => true, 'error' => null];
        } catch (\Throwable $e) {
            error_log('[smtp] PHPMailer failed: ' . $e->getMessage());
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    // Fallback: PHP mail() with HTML headers (deliverability not guaranteed).
    $boundary = bin2hex(random_bytes(8));
    $headers  = "From: {$fromName} <{$fromAddr}>\r\n";
    $headers .= "Reply-To: <{$fromAddr}>\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $ok = @mail($to, $subject, $html, $headers);
    if (!$ok) error_log("[smtp] mail() fallback failed for $to");
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