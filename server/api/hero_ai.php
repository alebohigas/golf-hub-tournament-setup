<?php
/**
 * hero_ai.php
 * -----------------------------------------------------------------------
 * Generates a HERO background image with AI (Lovable AI Gateway) and stores
 * it as a regular upload in the `heros` section, so it immediately shows up
 * in Admin > Heros next to the manually uploaded files.
 *
 *   POST /api/hero_ai.php
 *   Body (JSON): { password, prompt, page?, model? }
 *   Response   : { saved: true, name, url, prompt }
 *
 * Auth: superadmin password or a staff user with the "pagina" area, i.e. the
 * same rule site_config.php applies to hero_config.
 *
 * The API key is read from credentials.php ($AI_GATEWAY_API_KEY) or from the
 * AI_GATEWAY_API_KEY / LOVABLE_API_KEY environment variables. It NEVER
 * reaches the browser: only this endpoint talks to the gateway.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/_staff_auth.php';

header('Content-Type: application/json; charset=utf-8');

/** Uniform JSON error exit (no stray output around JSON). */
function hero_ai_error($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    hero_ai_error('Method not allowed', 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    hero_ai_error('Invalid JSON body', 400);
}

// ---------- Auth ----------
$password = $body['password'] ?? '';
if (!is_superadmin_password($conn, $password) && !staff_check_area($conn, $body, 'pagina')) {
    hero_ai_error('Unauthorized', 401);
}

// ---------- Input ----------
$prompt = trim((string)($body['prompt'] ?? ''));
if ($prompt === '') {
    hero_ai_error('Falta el prompt de la imagen', 400);
}
// Model: Gemini image models take the chat-shape body used below.
$model = trim((string)($body['model'] ?? 'google/gemini-3-pro-image'));
// Optional page slug, only used to build a readable filename.
$pageSlug = preg_replace('/[^a-z0-9\-]+/', '-', strtolower((string)($body['page'] ?? 'hero')));
$pageSlug = trim($pageSlug, '-');
if ($pageSlug === '') $pageSlug = 'hero';

// ---------- API key ----------
$apiKey = '';
if (isset($AI_GATEWAY_API_KEY) && $AI_GATEWAY_API_KEY) {
    $apiKey = $AI_GATEWAY_API_KEY;
} elseif (getenv('AI_GATEWAY_API_KEY')) {
    $apiKey = getenv('AI_GATEWAY_API_KEY');
} elseif (getenv('LOVABLE_API_KEY')) {
    $apiKey = getenv('LOVABLE_API_KEY');
}
if ($apiKey === '') {
    hero_ai_error('Falta la llave de IA en el servidor. Agrega $AI_GATEWAY_API_KEY en api/credentials.php.', 500);
}

// ---------- Gateway call ----------
// Non-streaming: the browser waits for one JSON body with the final PNG.
// No client-side timeout is imposed here; image models can take minutes.
$payload = json_encode([
    'model'      => $model,
    'messages'   => [[
        'role'    => 'user',
        'content' => $prompt . ' — cinematic wide golf photography, deep green and gold palette, dark edges so white text stays legible, no lettering, no watermark',
    ]],
    'modalities' => ['image', 'text'],
]);

$ch = curl_init('https://ai.gateway.lovable.dev/v1/images/generations');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ],
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_TIMEOUT        => 600,
]);
$raw    = curl_exec($ch);
$status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($raw === false) {
    error_log('hero_ai: curl error ' . $curlErr);
    hero_ai_error('No se pudo contactar al servicio de IA: ' . $curlErr, 502);
}

$decoded = json_decode($raw, true);
if ($status < 200 || $status >= 300) {
    $msg = $decoded['error']['message'] ?? ('Error de IA (HTTP ' . $status . ')');
    if ($status === 429) $msg = 'Límite de solicitudes de IA alcanzado. Intenta más tarde.';
    if ($status === 402) $msg = 'Créditos de IA agotados.';
    error_log('hero_ai: gateway ' . $status . ' ' . substr($raw, 0, 500));
    hero_ai_error($msg, $status);
}

$b64 = $decoded['data'][0]['b64_json'] ?? '';
if ($b64 === '') {
    error_log('hero_ai: no image in response ' . substr($raw, 0, 500));
    hero_ai_error('La IA no devolvió imagen. Intenta con otro prompt.', 502);
}
$bytes = base64_decode($b64, true);
if ($bytes === false || strlen($bytes) < 1024) {
    hero_ai_error('Imagen inválida devuelta por la IA.', 502);
}

// ---------- Save into the `heros` uploads folder ----------
$domain = preg_replace('/[^a-zA-Z0-9\.\-]/', '', $_SERVER['HTTP_HOST'] ?? 'default');
$dir    = __DIR__ . '/uploads/' . $domain . '/heros';
if (!is_dir($dir) && !@mkdir($dir, 0755, true)) {
    hero_ai_error('No se pudo crear la carpeta de heros en el servidor.', 500);
}
$name = 'ia-' . $pageSlug . '-' . date('Ymd-His') . '.png';
if (@file_put_contents($dir . '/' . $name, $bytes) === false) {
    hero_ai_error('No se pudo guardar la imagen generada.', 500);
}

$url = '/api/uploads/' . rawurlencode($domain) . '/heros/' . rawurlencode($name);

echo json_encode([
    'saved'  => true,
    'name'   => $name,
    'url'    => $url,
    'prompt' => $prompt,
]);
