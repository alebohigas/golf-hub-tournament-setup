<?php
/**
 * Sponsor Logo Proxy
 * Serves sponsor logos from the external directory (one level above web root)
 * to avoid exposing internal server paths to the browser.
 * 
 * Usage: /api/sponsor_logo.php?file=logos_patrocinadores/imagen.png
 * 
 * Security:
 * - Only allows image file extensions (png, jpg, jpeg, gif, webp, svg)
 * - Sanitises filename to prevent directory traversal attacks
 * - Returns 404 if file doesn't exist
 * - Caches for 7 days (sponsor logos rarely change)
 */

// ============= CORS Headers =============
header('Access-Control-Allow-Origin: *');

// ============= Validate Input =============
$file = $_GET['file'] ?? '';

// Strip any leading slashes or dots to prevent traversal
$file = ltrim($file, './\\');

// Only allow safe path characters (letters, numbers, hyphens, underscores, dots, forward slashes)
if (!$file || !preg_match('/^[a-zA-Z0-9_\-\.\/]+$/', $file)) {
    http_response_code(400);
    echo 'Invalid filename';
    exit;
}

// Block directory traversal attempts
if (strpos($file, '..') !== false) {
    http_response_code(400);
    echo 'Invalid path';
    exit;
}

// Only allow image extensions
$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
$allowedExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
if (!in_array($ext, $allowedExts)) {
    http_response_code(400);
    echo 'Only image files allowed';
    exit;
}

// ============= Resolve Path =============
/**
 * Build absolute path to the image file
 * The logos folder is ONE level above the web root:
 *   web root:    /htdocs/torneo/         (where index.html lives)
 *   logos folder: /htdocs/logos_patrocinadores/
 * 
 * Since this script lives in /htdocs/torneo/api/, we go up two levels:
 *   __DIR__/../../  =>  /htdocs/
 * Then append the file path from the DB (e.g. "logos_patrocinadores/imagen.png")
 */
$basePath = realpath(__DIR__ . '/../../');
if (!$basePath) {
    http_response_code(500);
    echo 'Base path not found';
    exit;
}

$fullPath = $basePath . '/' . $file;

// Verify resolved path is still under the base (extra traversal protection)
$resolvedPath = realpath($fullPath);
if (!$resolvedPath || strpos($resolvedPath, $basePath) !== 0) {
    http_response_code(404);
    echo 'Logo not found';
    exit;
}

// ============= Serve Image =============
if (!file_exists($resolvedPath) || !is_file($resolvedPath)) {
    http_response_code(404);
    echo 'Logo not found';
    exit;
}

// MIME type mapping
$mimeTypes = [
    'png'  => 'image/png',
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif'  => 'image/gif',
    'webp' => 'image/webp',
    'svg'  => 'image/svg+xml',
];

$contentType = $mimeTypes[$ext] ?? 'application/octet-stream';

// Cache for 7 days (logos rarely change)
header('Content-Type: ' . $contentType);
header('Cache-Control: public, max-age=604800');
header('Content-Length: ' . filesize($resolvedPath));

readfile($resolvedPath);
