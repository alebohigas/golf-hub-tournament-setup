<?php
/**
 * Registro Archivo (binary download)
 * -----------------------------------------------------------------------
 * GET /api/registro_archivo.php?id=NN&password=registros2025
 *
 * Streams the LONGBLOB stored in registro.reg_archivo back to the browser.
 * Only callable by the verification dashboard (password gate).
 *
 * NOTE: this file does NOT include config.php (which forces JSON content-type
 * + CORS); we set our own headers instead.
 */

/** Load DB credentials directly to avoid the JSON header default. */
$credentialsFile = __DIR__ . '/credentials.php';
if (!file_exists($credentialsFile)) {
    http_response_code(500);
    echo 'Missing credentials.php';
    exit;
}
require_once $credentialsFile;

/**
 * Auth — se acepta cualquiera de:
 *   • password === 'registros2025'  (contraseña histórica del dashboard)
 *   • password del superadmin       (via is_superadmin_password)
 *   • staff_token con área 'registros'
 * Así los usuarios staff temporales con acceso a "registros" pueden
 * descargar el comprobante sin recibir 401.
 */
$password = $_GET['password'] ?? '';
$authorized = ($password === 'registros2025');
if (!$authorized) {
    // Cargamos config.php sólo cuando hace falta validar staff/superadmin,
    // para no romper el header binario del stream si la auth simple pasó.
    require_once __DIR__ . '/config.php';
    require_once __DIR__ . '/_staff_auth.php';
    // Nota: config.php ya abrió $conn; lo reutilizamos.
    if (is_superadmin_password($conn, $password)) {
        $authorized = true;
    } else {
        $staff = staff_check_area($conn, [], 'registros');
        if ($staff) $authorized = true;
    }
}
if (!$authorized) {
    http_response_code(401);
    echo 'Unauthorized';
    exit;
}

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    echo 'Missing id';
    exit;
}

// $conn puede haber sido creado por config.php (rama staff/superadmin).
// Si no existe, abrimos aquí para el camino simple `registros2025`.
if (!isset($conn) || !($conn instanceof mysqli)) {
    $conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);
    if ($conn->connect_error) {
        http_response_code(500);
        echo 'DB connection failed';
        exit;
    }
    $conn->set_charset('utf8');
}

/** Detect optional metadata columns */
$hasMime   = $conn->query("SHOW COLUMNS FROM registro LIKE 'reg_archivo_mime'");
$hasMime   = $hasMime && $hasMime->num_rows > 0;
$hasName   = $conn->query("SHOW COLUMNS FROM registro LIKE 'reg_archivo_nombre'");
$hasName   = $hasName && $hasName->num_rows > 0;

/** Detect PK column */
$pkCol = 'id';
foreach (['id', 'reg_id', 'registro_id'] as $c) {
    $r = $conn->query("SHOW COLUMNS FROM registro LIKE '$c'");
    if ($r && $r->num_rows > 0) { $pkCol = $c; break; }
}

$select = ['reg_archivo'];
if ($hasMime) $select[] = 'reg_archivo_mime';
if ($hasName) $select[] = 'reg_archivo_nombre';

$sql = "SELECT " . implode(',', $select) . " FROM registro WHERE $pkCol = $id LIMIT 1";
$res = $conn->query($sql);
if (!$res || !($row = $res->fetch_assoc()) || empty($row['reg_archivo'])) {
    http_response_code(404);
    echo 'No file';
    exit;
}

$mime = $hasMime && !empty($row['reg_archivo_mime']) ? $row['reg_archivo_mime'] : 'application/octet-stream';
$name = $hasName && !empty($row['reg_archivo_nombre']) ? $row['reg_archivo_nombre'] : ('comprobante_' . $id);

header('Content-Type: ' . $mime);
header('Content-Disposition: inline; filename="' . str_replace('"', '', $name) . '"');
header('Content-Length: ' . strlen($row['reg_archivo']));
echo $row['reg_archivo'];
exit;