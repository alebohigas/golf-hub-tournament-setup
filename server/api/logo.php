<?php
/**
 * Logo Proxy
 * Serves club logos from the external server through our own domain
 * to avoid ad-blocker/privacy extension blocking of cross-origin requests.
 * 
 * Usage: /api/logo.php?file=logo_name.png
 */

// ============= CORS Headers =============
header('Access-Control-Allow-Origin: *');

// ============= Validate Input =============
$file = $_GET['file'] ?? '';

// Only allow safe filenames (letters, numbers, hyphens, underscores, dots)
if (!$file || !preg_match('/^[a-zA-Z0-9_\-\.]+$/', $file)) {
    http_response_code(400);
    echo 'Invalid filename';
    exit;
}

// ============= Fetch & Serve =============
$remoteUrl = 'https://alien2019.speitour.mx/logos/' . $file;
$imageData = @file_get_contents($remoteUrl);

if ($imageData === false) {
    http_response_code(404);
    echo 'Logo not found';
    exit;
}

// Detect content type from extension
$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
$mimeTypes = [
    'png'  => 'image/png',
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'svg'  => 'image/svg+xml',
    'gif'  => 'image/gif',
    'webp' => 'image/webp',
];

$contentType = $mimeTypes[$ext] ?? 'application/octet-stream';

// Cache for 24 hours
header('Content-Type: ' . $contentType);
header('Cache-Control: public, max-age=86400');
header('Content-Length: ' . strlen($imageData));

echo $imageData;
