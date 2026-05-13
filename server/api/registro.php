<?php
/**
 * Registro Endpoint (Pre-Registro)
 * -----------------------------------------------------------------------
 * POST /api/registro.php?torneoid=NN     (multipart/form-data)
 *      Public submission. Accepts whatever fields are enabled in
 *      registro_form_fields for the tournament, plus optional file
 *      `reg_archivo` (uploaded as binary into the LONGBLOB column).
 *
 * GET  /api/registro.php?torneoid=NN&password=registros2025
 *      Admin: lists all submissions for the tournament (newest first).
 *      Excludes the binary blob — use registro_archivo.php to fetch it.
 *
 * POST /api/registro.php?action=verify&password=registros2025  (JSON body)
 *      Admin: { id, verified: 0|1 } toggles a verification flag.
 *      Requires column `reg_verificado TINYINT(1)` (auto-detected).
 *
 * Resilient: any column the host DB doesn't have is silently skipped.
 */
require_once 'config.php';

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

const REGISTROS_PASSWORD = 'registros2025';
/** Max binary upload accepted into reg_archivo (LONGBLOB). 15 MB. */
const MAX_REG_FILE_BYTES = 15 * 1024 * 1024;

/** Cache: which columns exist in the `registro` table. */
function registro_columns($conn) {
    static $cols = null;
    if ($cols !== null) return $cols;
    $cols = [];
    $r = $conn->query("SHOW COLUMNS FROM registro");
    if ($r) {
        while ($row = $r->fetch_assoc()) $cols[$row['Field']] = true;
        $r->free();
    }
    return $cols;
}

function registro_has($conn, $col) {
    $cols = registro_columns($conn);
    return isset($cols[$col]);
}

/**
 * Identify the torneo FK column on `registro`. Different deployments use
 * different names; we probe in priority order.
 */
function registro_torneo_col($conn) {
    foreach (['torneoid', 'torneo_id', 'reg_torneoid', 'reg_torneo_id'] as $c) {
        if (registro_has($conn, $c)) return $c;
    }
    return null;
}

/** Identify primary key column (id by convention; fallback to reg_id). */
function registro_pk_col($conn) {
    foreach (['id', 'reg_id', 'registro_id'] as $c) {
        if (registro_has($conn, $c)) return $c;
    }
    return null;
}

// ============= POST submission (public) =============
if ($_SERVER['REQUEST_METHOD'] === 'POST' && (optional_param('action') !== 'verify')) {
    $torneoid = (int) require_param('torneoid');
    $torneoCol = registro_torneo_col($conn);
    $pkCol = registro_pk_col($conn);

    if (!$pkCol)     json_error('registro table has no recognizable primary key column.', 500);
    if (!$torneoCol) json_error('registro table has no recognizable torneo id column.',  500);

    /** Whitelist of safe field_names accepted from the form. */
    $allowedTextFields = [
        'reg_nombre', 'reg_apellido', 'reg_correo', 'reg_telefono',
        'reg_handicap', 'reg_categoria', 'reg_sexo', 'reg_fechanac',
        'reg_es_socio', 'reg_tipo_socio', 'reg_club', 'reg_ghin',
        'reg_pais', 'reg_estado', 'reg_ciudad', 'reg_notas',
        // Tallas (skipped silently if column doesn't exist on this DB)
        'reg_talla_gorra', 'reg_talla_guante', 'reg_talla_camisa',
        'reg_talla_tenis', 'reg_talla_pantalon', 'reg_talla_cinturon',
    ];

    $cols = [$torneoCol];
    $vals = [$torneoid];

    foreach ($allowedTextFields as $f) {
        if (!isset($_POST[$f])) continue;
        if (!registro_has($conn, $f)) continue; // column missing on this server
        $v = trim((string)$_POST[$f]);
        if ($v === '') continue;
        $cols[] = $f;
        $vals[] = "'" . esc($conn, $v) . "'";
    }

    /** Optional file upload into reg_archivo (LONGBLOB). */
    $haveFile = isset($_FILES['reg_archivo']) && is_uploaded_file($_FILES['reg_archivo']['tmp_name']);
    if ($haveFile) {
        if ($_FILES['reg_archivo']['size'] > MAX_REG_FILE_BYTES) {
            json_error('Archivo demasiado grande (máx 15 MB).', 400);
        }
        if (registro_has($conn, 'reg_archivo')) {
            $bin = file_get_contents($_FILES['reg_archivo']['tmp_name']);
            $cols[] = 'reg_archivo';
            $vals[] = "'" . $conn->real_escape_string($bin) . "'";
        }
        if (registro_has($conn, 'reg_archivo_nombre')) {
            $cols[] = 'reg_archivo_nombre';
            $vals[] = "'" . esc($conn, basename($_FILES['reg_archivo']['name'])) . "'";
        }
        if (registro_has($conn, 'reg_archivo_mime')) {
            $mime = $_FILES['reg_archivo']['type'] ?: 'application/octet-stream';
            $cols[] = 'reg_archivo_mime';
            $vals[] = "'" . esc($conn, $mime) . "'";
        }
    }

    /** Auto timestamp if such a column exists. */
    foreach (['reg_fecha', 'created_at', 'fecha_alta'] as $tc) {
        if (registro_has($conn, $tc)) {
            $cols[] = $tc;
            $vals[] = 'NOW()';
            break;
        }
    }

    /** Default verification flag = 0 if column exists. */
    if (registro_has($conn, 'reg_verificado')) {
        $cols[] = 'reg_verificado';
        $vals[] = '0';
    }

    $sql = "INSERT INTO registro (" . implode(',', $cols) . ") VALUES (" . implode(',', $vals) . ")";
    if (!$conn->query($sql)) {
        json_error('Failed to save registration: ' . $conn->error, 500);
    }

    json_response(['saved' => true, 'id' => $conn->insert_id]);
}

// ============= POST verify (admin) =============
if ($_SERVER['REQUEST_METHOD'] === 'POST' && optional_param('action') === 'verify') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) json_error('Invalid JSON', 400);
    if (($body['password'] ?? '') !== REGISTROS_PASSWORD) json_error('Unauthorized', 401);

    if (!registro_has($conn, 'reg_verificado')) {
        json_error("Missing column reg_verificado on registro. Run: ALTER TABLE registro ADD COLUMN reg_verificado TINYINT(1) NOT NULL DEFAULT 0;", 500);
    }

    $pkCol = registro_pk_col($conn);
    if (!$pkCol) json_error('registro PK not found', 500);
    $id = (int)($body['id'] ?? 0);
    $v  = !empty($body['verified']) ? 1 : 0;
    if ($id <= 0) json_error('Missing id', 400);

    if (!$conn->query("UPDATE registro SET reg_verificado = $v WHERE $pkCol = $id LIMIT 1")) {
        json_error('Update failed: ' . $conn->error);
    }
    json_response(['saved' => true]);
}

// ============= GET listing (admin) =============
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $torneoid = (int) require_param('torneoid');
    if (optional_param('password') !== REGISTROS_PASSWORD) {
        json_error('Unauthorized', 401);
    }

    $torneoCol = registro_torneo_col($conn);
    $pkCol     = registro_pk_col($conn);
    if (!$pkCol || !$torneoCol) json_error('registro table not configured properly.', 500);

    /** Fields to surface in the listing (skip blob). */
    $fields = [$pkCol . ' AS id'];
    $optional = [
        'reg_nombre','reg_apellido','reg_correo','reg_telefono','reg_handicap',
        'reg_categoria','reg_sexo','reg_fechanac','reg_es_socio','reg_tipo_socio',
        'reg_club','reg_ghin','reg_pais','reg_estado','reg_ciudad','reg_notas',
        'reg_verificado','reg_fecha','created_at','fecha_alta','reg_archivo_nombre',
    ];
    foreach ($optional as $c) if (registro_has($conn, $c)) $fields[] = $c;
    /** Indicate whether a binary attachment exists without sending the bytes. */
    if (registro_has($conn, 'reg_archivo')) {
        $fields[] = "(reg_archivo IS NOT NULL AND OCTET_LENGTH(reg_archivo) > 0) AS has_archivo";
    }

    $orderCol = $pkCol;
    if (registro_has($conn, 'reg_fecha'))   $orderCol = 'reg_fecha';
    elseif (registro_has($conn, 'created_at')) $orderCol = 'created_at';

    $sql = "SELECT " . implode(',', $fields) . " FROM registro
            WHERE $torneoCol = $torneoid
            ORDER BY $orderCol DESC
            LIMIT 1000";
    json_response(['rows' => query_all($conn, $sql)]);
}

json_error('Method not allowed', 405);