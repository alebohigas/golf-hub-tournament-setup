<?php
/**
 * Sponsor Logo Debug Endpoint
 *
 * Diagnostic-only endpoint that mirrors the path-resolution logic of
 * `sponsor_logo.php` BUT does not serve the image. Instead it returns a JSON
 * report describing exactly what the proxy would do for a given `?file=` value.
 *
 * Usage:
 *   /api/sponsor_logo_debug.php?file=logos_patrocinadores/apat-12.png
 *   /api/sponsor_logo_debug.php?file=../logos_patrocinadores/apat-12.png
 *
 * The response includes:
 *   - input          : the raw `?file=` parameter as received
 *   - cleaned        : the value after stripping leading slashes/dots and `../` prefixes
 *   - extension      : detected file extension
 *   - extensionAllowed : whether the extension passes the allow-list
 *   - basePath       : absolute path that the proxy considers as its root
 *                      (one level above the web root; this is where
 *                      `logos_patrocinadores/` is expected to live)
 *   - fullPath       : basePath + cleaned path (the candidate file path)
 *   - resolvedPath   : realpath() result for fullPath, or null if unresolved
 *   - withinBase     : true if resolvedPath is still under basePath
 *                      (false would indicate a directory-traversal attempt)
 *   - exists         : whether the resolved path exists on disk
 *   - isFile         : whether the resolved path is a regular file
 *   - readable       : whether PHP can read the file
 *   - sizeBytes      : file size in bytes, if available
 *   - permissions    : Unix-style permission string (e.g. "0644"), if available
 *   - owner / group  : numeric UID/GID of the file owner, if available
 *   - mtime          : last-modified timestamp (ISO 8601), if available
 *   - errors         : list of validation/security failures encountered
 *   - wouldServe     : final verdict — true if the real proxy would serve this file
 *
 * Security notes:
 *   - This endpoint NEVER reads or returns the file's binary contents.
 *   - It applies the SAME validation rules as `sponsor_logo.php` so the
 *     diagnostic mirrors real behavior (an "Invalid path" report here means
 *     the real proxy would reject the same input).
 */

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// ============= Collect & sanitise input =============

/** Raw value as received from the query string */
$rawInput = $_GET['file'] ?? '';

/** Accumulator for any validation/security failures */
$errors = [];

/**
 * Apply the same cleaning steps as the real proxy:
 *  1. Strip leading slashes, dots and backslashes
 *  2. Reject if empty or contains characters outside the safe charset
 *  3. Reject if it still contains a `..` segment (directory traversal)
 *
 * NOTE: We also strip a leading `../` BEFORE the `..` check so that DB values
 * stored with that prefix (legacy convention) can be diagnosed cleanly. The
 * real proxy does the same in its updated version.
 */
$cleaned = ltrim($rawInput, './\\');

// Remove any number of leading "../" segments (legacy DB convention)
while (strpos($cleaned, '../') === 0) {
    $cleaned = substr($cleaned, 3);
}

if ($cleaned === '') {
    $errors[] = 'Empty filename after cleaning';
}

// Safe-charset check (letters, numbers, hyphens, underscores, dots, slashes)
if ($cleaned !== '' && !preg_match('/^[a-zA-Z0-9_\-\.\/]+$/', $cleaned)) {
    $errors[] = 'Filename contains disallowed characters';
}

// Reject any remaining `..` to block directory traversal
if (strpos($cleaned, '..') !== false) {
    $errors[] = 'Path still contains ".." after cleaning (directory traversal blocked)';
}

// ============= Extension allow-list =============

$extension = strtolower(pathinfo($cleaned, PATHINFO_EXTENSION));
$allowedExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
$extensionAllowed = $extension !== '' && in_array($extension, $allowedExts, true);

if (!$extensionAllowed) {
    $errors[] = "Extension '$extension' is not in allow-list (" . implode(', ', $allowedExts) . ')';
}

// ============= Resolve absolute paths =============

/**
 * basePath probing.
 * The real proxy now tries multiple candidate basePaths (1, 2, and 3 levels
 * above this script) and picks the first one where the file actually exists.
 * We replicate that logic and report every candidate so it's obvious which
 * directory layout the deployment is using.
 */
$candidateBases = array_filter([
    realpath(__DIR__ . '/..'),       // one level up   (e.g. /htdocs)
    realpath(__DIR__ . '/../..'),    // two levels up  (e.g. /htdocs when api is in /htdocs/torneo/api)
    realpath(__DIR__ . '/../../..'), // three levels up
]);

$candidatesReport = [];
$basePath         = null;
$fullPath         = null;
$resolvedPath     = null;
$withinBase       = false;

foreach ($candidateBases as $candidate) {
    $tryFull     = $cleaned !== '' ? $candidate . '/' . $cleaned : null;
    $tryResolved = $tryFull ? (realpath($tryFull) ?: null) : null;
    $tryWithin   = $tryResolved && strpos($tryResolved, $candidate) === 0;
    $tryExists   = $tryResolved && file_exists($tryResolved) && is_file($tryResolved);

    $candidatesReport[] = [
        'basePath'     => $candidate,
        'fullPath'     => $tryFull,
        'resolvedPath' => $tryResolved,
        'withinBase'   => (bool)$tryWithin,
        'exists'       => (bool)$tryExists,
    ];

    // Pick the first candidate that resolves to an existing file under itself
    if ($basePath === null && $tryExists && $tryWithin) {
        $basePath     = $candidate;
        $fullPath     = $tryFull;
        $resolvedPath = $tryResolved;
        $withinBase   = true;
    }
}

if ($basePath === null) {
    // Fall back to the first candidate so the rest of the report has values
    $basePath = $candidateBases[0] ?? null;
    $fullPath = $basePath && $cleaned !== '' ? $basePath . '/' . $cleaned : null;
    $errors[] = 'No candidate basePath contains the requested file';
}

// ============= File-system inspection =============

$exists      = $resolvedPath !== null && file_exists($resolvedPath);
$isFile      = $exists && is_file($resolvedPath);
$readable    = $exists && is_readable($resolvedPath);
$sizeBytes   = $isFile ? @filesize($resolvedPath) : null;
$permissions = $exists ? substr(sprintf('%o', @fileperms($resolvedPath)), -4) : null;
$owner       = $exists ? @fileowner($resolvedPath) : null;
$group       = $exists ? @filegroup($resolvedPath) : null;
$mtime       = $isFile ? @filemtime($resolvedPath) : null;

if ($resolvedPath !== null && !$exists) {
    $errors[] = 'Resolved path does not exist on disk';
}
if ($exists && !$isFile) {
    $errors[] = 'Resolved path exists but is not a regular file';
}
if ($exists && !$readable) {
    $errors[] = 'Resolved path exists but is not readable by PHP';
}

// ============= Final verdict =============

/**
 * `wouldServe` is true only if EVERY check the real proxy performs would pass.
 * Mirrors the early-exit chain inside sponsor_logo.php.
 */
$wouldServe = empty($errors)
    && $extensionAllowed
    && $resolvedPath !== null
    && $withinBase
    && $isFile
    && $readable;

// ============= Emit report =============

echo json_encode([
    'input'             => $rawInput,
    'cleaned'           => $cleaned,
    'extension'         => $extension,
    'extensionAllowed'  => $extensionAllowed,
    'basePath'          => $basePath ?: null,
    'fullPath'          => $fullPath,
    'resolvedPath'      => $resolvedPath,
    'withinBase'        => $withinBase,
    'exists'            => $exists,
    'isFile'            => $isFile,
    'readable'          => $readable,
    'sizeBytes'         => $sizeBytes,
    'permissions'       => $permissions,
    'owner'             => $owner,
    'group'             => $group,
    'mtime'             => $mtime ? date('c', $mtime) : null,
    'errors'            => $errors,
    /** Per-candidate breakdown — shows every basePath the proxy tried */
    'candidates'        => $candidatesReport,
    'wouldServe'        => $wouldServe,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
