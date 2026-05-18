<?php
/**
 * Email Validation Endpoint
 * -----------------------------------------------------------------------
 * GET /api/email_validate.php?email=foo@bar.com
 *
 * Returns { valid: bool, reason?: string, suggestion?: string }.
 *
 * Validation layers:
 *   1. Strict syntax check via filter_var(EMAIL).
 *   2. Domain MX record check (checkdnsrr) — catches invented domains
 *      like asdf@asdfqwer.com. Cannot detect fake mailboxes on real
 *      providers (e.g. asdf@gmail.com) — that requires SMTP probing
 *      which Gmail blocks; we don't attempt it.
 *   3. Common typo suggestions (gmial.com → gmail.com, etc.).
 */
require_once 'config.php';

$email = trim((string) optional_param('email', ''));
if ($email === '') {
    json_response(['valid' => false, 'reason' => 'empty']);
}

// 1) Syntax
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['valid' => false, 'reason' => 'syntax']);
}

[$local, $domain] = explode('@', $email, 2);
$domainLower = strtolower($domain);

// 3) Typo suggestion (run before MX so we can suggest before failing).
$typos = [
    'gmial.com'    => 'gmail.com',
    'gmal.com'     => 'gmail.com',
    'gmai.com'     => 'gmail.com',
    'gnail.com'    => 'gmail.com',
    'gmail.co'     => 'gmail.com',
    'hotnail.com'  => 'hotmail.com',
    'hotmial.com'  => 'hotmail.com',
    'hotmai.com'   => 'hotmail.com',
    'hotmail.co'   => 'hotmail.com',
    'yaho.com'     => 'yahoo.com',
    'yahooo.com'   => 'yahoo.com',
    'outlok.com'   => 'outlook.com',
    'outloo.com'   => 'outlook.com',
    'icloud.co'    => 'icloud.com',
];
if (isset($typos[$domainLower])) {
    json_response([
        'valid'      => false,
        'reason'     => 'typo',
        'suggestion' => $local . '@' . $typos[$domainLower],
    ]);
}

// 2) MX record (fall back to A record since some domains accept mail via A).
$hasMx = function_exists('checkdnsrr')
    ? (@checkdnsrr($domain, 'MX') || @checkdnsrr($domain, 'A'))
    : true; // can't check → don't block

if (!$hasMx) {
    json_response(['valid' => false, 'reason' => 'no_mx']);
}

json_response(['valid' => true]);
