<?php
/**
 * Uploads Endpoint
 * -----------------------------------------------------------------------
 * Manages user-uploaded media (images + PDFs) for the dynamic page sections.
 *
 *   GET  /api/uploads.php?section=eventos                → list files
 *   POST /api/uploads.php?section=eventos&action=upload  → upload (multipart)
 *   POST /api/uploads.php?section=eventos&action=delete  → delete (JSON body)
 *
 * Sections (subfolders under /api/uploads/):
 *   - eventos       (images: poster grid for Eventos page)
 *   - avisos        (images: poster grid for Avisos page)
 *   - convocatoria  (images + PDF: poster grid + downloadable convocatoria document)
 *   - reglas        (PDF only: downloadable reglas y CC document)
 *   - pdfs          (legacy bucket — kept for backwards compatibility with
 *                    files uploaded before the per-section split; new
 *                    uploads should target convocatoria/reglas directly)
 *
 * Files are scoped per active domain (Host header) to keep multi-tenant
 * deployments separated. The on-disk layout is:
 *
 *   /api/uploads/{domain}/{section}/{filename}
 *
 * Public URL pattern (same domain → no CORS): `/api/uploads/{domain}/{section}/{file}`.
 *
 * Auth: same `admin2025` shared password as the rest of the admin endpoints.
 * Validation: per-section MIME + extension whitelist, max 15MB per file,
 *             filename sanitized to [a-z0-9._-]+.
 */
require_once 'config.php';

// Allow POST + DELETE for management operations
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// ============= Configuration =============

/** Maximum allowed file size (bytes). 15 MB covers high-res posters + PDFs. */
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

/** Shared admin password (mirrors site_config.php). */
const ADMIN_PASSWORD = 'admin2025';

/**
 * Per-section validation rules.
 *   - exts:  allowed lowercase file extensions
 *   - mimes: allowed MIME types (defensive — checked alongside extension)
 *   - kind:  human-readable label for error messages
 */
$SECTION_RULES = [
    'eventos' => [
        'exts'  => ['webp', 'jpg', 'jpeg', 'png', 'gif'],
        'mimes' => ['image/webp', 'image/jpeg', 'image/png', 'image/gif'],
        'kind'  => 'imagen',
    ],
    'avisos' => [
        'exts'  => ['webp', 'jpg', 'jpeg', 'png', 'gif'],
        'mimes' => ['image/webp', 'image/jpeg', 'image/png', 'image/gif'],
        'kind'  => 'imagen',
    ],
    'convocatoria' => [
        // Convocatoria mixes a poster gallery (images) with the official
        // tournament PDF — both upload through the same section so admins
        // see one cohesive panel.
        'exts'  => ['webp', 'jpg', 'jpeg', 'png', 'gif', 'pdf'],
        'mimes' => ['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        'kind'  => 'imagen o PDF',
    ],
    'reglas' => [
        // Reglas only carries the downloadable rulebook PDF — no gallery.
        'exts'  => ['pdf'],
        'mimes' => ['application/pdf'],
        'kind'  => 'PDF',
    ],
    'pdfs' => [
        // Legacy bucket — still listable/deletable so admins can clean up
        // pre-existing files, but no new uploads are routed here from the UI.
        'exts'  => ['pdf'],
        'mimes' => ['application/pdf'],
        'kind'  => 'PDF',
    ],
    'popup' => [
        // Images used by the site-wide POP UP overlay configured from the
        // Admin > POP tab. Image-only — the overlay never renders PDFs.
        'exts'  => ['webp', 'jpg', 'jpeg', 'png', 'gif'],
        'mimes' => ['image/webp', 'image/jpeg', 'image/png', 'image/gif'],
        'kind'  => 'imagen',
    ],
];

// ============= Helpers =============

/**
 * Normalize the active domain into a safe folder name.
 * Lowercases, strips port, and removes anything that isn't a-z/0-9/dot/dash.
 */
function safe_domain_folder() {
    $host = strtolower($_SERVER['HTTP_HOST'] ?? 'localhost');
    // Strip port if present (e.g. localhost:8080 → localhost)
    if (($pos = strpos($host, ':')) !== false) {
        $host = substr($host, 0, $pos);
    }
    return preg_replace('/[^a-z0-9.\-]/', '', $host) ?: 'localhost';
}

/**
 * Sanitize a filename: strip directories, lowercase the extension,
 * replace runs of unsafe characters with `-`, and collapse repeated dashes.
 */
function safe_filename($raw) {
    // basename() blocks path traversal attempts (../, etc.)
    $name = basename($raw);
    // Split into stem + extension to lowercase the extension only.
    $dot = strrpos($name, '.');
    if ($dot === false) {
        $stem = $name;
        $ext  = '';
    } else {
        $stem = substr($name, 0, $dot);
        $ext  = strtolower(substr($name, $dot + 1));
    }
    // Replace anything outside [a-z0-9._-] with '-'
    $stem = strtolower($stem);
    $stem = preg_replace('/[^a-z0-9._-]+/', '-', $stem);
    $stem = preg_replace('/-+/', '-', $stem);
    $stem = trim($stem, '-.');
    if ($stem === '') {
        $stem = 'file-' . substr(md5(uniqid('', true)), 0, 8);
    }
    return $ext === '' ? $stem : "$stem.$ext";
}

/**
 * Resolve the absolute upload directory for a section, creating it if needed.
 * @return string Absolute path WITHOUT trailing slash
 */
function section_dir($section) {
    $domain = safe_domain_folder();
    $base = __DIR__ . '/uploads/' . $domain . '/' . $section;
    if (!is_dir($base)) {
        @mkdir($base, 0775, true);
    }
    return $base;
}

/**
 * Build the public URL for a file under the given section.
 */
function public_url($section, $filename) {
    $domain = safe_domain_folder();
    return '/api/uploads/' . rawurlencode($domain) . '/' . rawurlencode($section) . '/' . rawurlencode($filename);
}

/**
 * Convert a snake/dash filename stem into a Title Case alt label.
 * Example: "01-clima-aviso" → "01 Clima Aviso"
 */
function filename_to_alt($filename) {
    $stem = preg_replace('/\.[^.]+$/', '', $filename);
    $stem = preg_replace('/[-_]+/', ' ', $stem);
    $stem = trim($stem);
    if ($stem === '') return $filename;
    $words = preg_split('/\s+/', $stem);
    $words = array_map(function ($w) {
        if ($w === '') return $w;
        return mb_strtoupper(mb_substr($w, 0, 1)) . mb_substr($w, 1);
    }, $words);
    return implode(' ', $words);
}

/**
 * Require the admin password (from POST body or query).
 * Aborts with 401 on mismatch.
 */
function require_admin($body) {
    $pw = $body['password'] ?? ($_POST['password'] ?? ($_GET['password'] ?? ''));
    if ($pw !== ADMIN_PASSWORD) {
        json_error('Unauthorized', 401);
    }
}

// ============= Routing =============

global $SECTION_RULES;

$section = isset($_GET['section']) ? strtolower(trim($_GET['section'])) : '';
if ($section === '' || !isset($SECTION_RULES[$section])) {
    json_error('Invalid or missing section. Allowed: ' . implode(', ', array_keys($SECTION_RULES)), 400);
}
$rules = $SECTION_RULES[$section];

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? strtolower(trim($_GET['action'])) : '';

// ============= GET → list files =============
if ($method === 'GET') {
    $dir = section_dir($section);
    $files = [];
    if (is_dir($dir)) {
        foreach (scandir($dir) as $entry) {
            if ($entry === '.' || $entry === '..') continue;
            $full = $dir . '/' . $entry;
            if (!is_file($full)) continue;
            $ext = strtolower(pathinfo($entry, PATHINFO_EXTENSION));
            if (!in_array($ext, $rules['exts'], true)) continue;
            $files[] = [
                'name'     => $entry,
                'url'      => public_url($section, $entry),
                'alt'      => filename_to_alt($entry),
                'size'     => filesize($full),
                'modified' => filemtime($full),
            ];
        }
    }
    // Sort by name (case-insensitive natural order) so numeric prefixes work.
    usort($files, function ($a, $b) {
        return strnatcasecmp($a['name'], $b['name']);
    });
    json_response([
        'section' => $section,
        'kind'    => $rules['kind'],
        'files'   => $files,
    ]);
}

// ============= POST → upload or delete =============
if ($method !== 'POST') {
    json_error('Method not allowed', 405);
}

// ----- DELETE a single file -----
if ($action === 'delete') {
    // Body is JSON: { password, name }
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    require_admin($body);

    $name = isset($body['name']) ? safe_filename($body['name']) : '';
    if ($name === '') {
        json_error('Missing file name', 400);
    }
    $target = section_dir($section) . '/' . $name;
    if (!is_file($target)) {
        json_error('File not found', 404);
    }
    if (!@unlink($target)) {
        json_error('Failed to delete file', 500);
    }
    json_response(['deleted' => true, 'name' => $name]);
}

// ----- UPLOAD one or more files -----
if ($action === 'upload') {
    // Multipart form: password + files[] (or single `file`)
    require_admin($_POST);

    if (empty($_FILES)) {
        json_error('No files received. Use multipart/form-data with field "files[]".', 400);
    }

    // Normalize $_FILES into a uniform list of [name, tmp_name, size, error, type]
    $items = [];
    foreach ($_FILES as $field => $info) {
        if (is_array($info['name'])) {
            $count = count($info['name']);
            for ($i = 0; $i < $count; $i++) {
                $items[] = [
                    'name'     => $info['name'][$i],
                    'tmp_name' => $info['tmp_name'][$i],
                    'size'     => $info['size'][$i],
                    'error'    => $info['error'][$i],
                    'type'     => $info['type'][$i],
                ];
            }
        } else {
            $items[] = $info;
        }
    }

    $dir = section_dir($section);
    $saved = [];
    $errors = [];

    foreach ($items as $item) {
        $original = $item['name'] ?? 'unknown';

        if (($item['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            $errors[] = ['name' => $original, 'error' => 'Upload error code ' . $item['error']];
            continue;
        }
        if ($item['size'] > MAX_UPLOAD_BYTES) {
            $errors[] = ['name' => $original, 'error' => 'File too large (max 15MB)'];
            continue;
        }

        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        if (!in_array($ext, $rules['exts'], true)) {
            $errors[] = ['name' => $original, 'error' => "Extension .$ext not allowed for {$rules['kind']}"];
            continue;
        }

        // Sniff actual MIME from file contents (defensive)
        $detectedMime = '';
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo) {
                $detectedMime = finfo_file($finfo, $item['tmp_name']) ?: '';
                finfo_close($finfo);
            }
        }
        // Some servers return image/jpg instead of image/jpeg — normalize.
        if ($detectedMime === 'image/jpg') $detectedMime = 'image/jpeg';
        if ($detectedMime !== '' && !in_array($detectedMime, $rules['mimes'], true)) {
            $errors[] = ['name' => $original, 'error' => "MIME $detectedMime not allowed"];
            continue;
        }

        $cleanName = safe_filename($original);
        $target = $dir . '/' . $cleanName;

        // Move uploaded file (overwrites if a file with the same sanitized
        // name already exists — intentional, lets users replace by re-upload).
        if (!move_uploaded_file($item['tmp_name'], $target)) {
            $errors[] = ['name' => $original, 'error' => 'Failed to write file'];
            continue;
        }
        @chmod($target, 0664);

        $saved[] = [
            'name'     => $cleanName,
            'original' => $original,
            'url'      => public_url($section, $cleanName),
            'size'     => filesize($target),
        ];
    }

    json_response([
        'section' => $section,
        'saved'   => $saved,
        'errors'  => $errors,
    ]);
}

json_error('Unknown action. Use ?action=upload or ?action=delete.', 400);
