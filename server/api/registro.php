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

/**
 * Map UI/legacy field_name -> actual DB column on `registro`.
 * Older code/forms used reg_sexo/reg_telefono/reg_notas/reg_ghin, but the
 * production schema (registro_campos) uses reg_genero/reg_celular/reg_mensaje/
 * numghinspei. We accept both on the wire and write to the canonical column
 * if it exists; otherwise we fall back to the legacy column.
 */
const REGISTRO_COLUMN_ALIASES = [
    'reg_sexo'     => 'reg_genero',
    'reg_telefono' => 'reg_celular',
    'reg_notas'    => 'reg_mensaje',
    'reg_ghin'     => 'numghinspei',
];

/** Resolve a posted field_name to the column we'll write to (canonical first). */
function resolve_reg_column($conn, $name) {
    if (registro_has($conn, $name)) return $name;
    if (isset(REGISTRO_COLUMN_ALIASES[$name])) {
        $alt = REGISTRO_COLUMN_ALIASES[$name];
        if (registro_has($conn, $alt)) return $alt;
    }
    // Reverse alias: form posted canonical but only legacy exists
    foreach (REGISTRO_COLUMN_ALIASES as $legacy => $canonical) {
        if ($canonical === $name && registro_has($conn, $legacy)) return $legacy;
    }
    return null;
}

/**
 * Compute precise age (in completed years) at a given reference date.
 * Returns null if either date is invalid. Uses day/month precision so a
 * birthday one day after the cutoff stays in the older-age bucket.
 */
function compute_age_at($birth_yyyymmdd, $ref_yyyymmdd) {
    if (!$birth_yyyymmdd || !$ref_yyyymmdd) return null;
    try {
        $b = new DateTime($birth_yyyymmdd);
        $r = new DateTime($ref_yyyymmdd);
    } catch (Exception $e) { return null; }
    if ($b > $r) return null;
    return (int) $b->diff($r)->y;
}

/** Lookup torneo start date (fecha_ini) — used as the cutoff for akron_edad. */
function torneo_fecha_ini($conn, $torneoid) {
    $r = $conn->query("SELECT fecha_ini FROM torneo WHERE torneo_id = " . (int)$torneoid . " LIMIT 1");
    if (!$r) return null;
    $row = $r->fetch_assoc();
    $r->free();
    return $row['fecha_ini'] ?? null;
}

/** Cache: which columns exist in the `jugadores` table. */
function jugadores_cols_reg($conn) {
    static $c = null;
    if ($c !== null) return $c;
    $c = [];
    $r = $conn->query("SHOW COLUMNS FROM jugadores");
    if ($r) { while ($row = $r->fetch_assoc()) $c[$row['Field']] = true; $r->free(); }
    return $c;
}
function jug_has_reg($conn, $col) { $c = jugadores_cols_reg($conn); return isset($c[$col]); }

/**
 * If the pre-registro carries a SPEI or GHIN, sync the `jugadores` row:
 *  - Match by reg_spei or numghinspei (whichever was provided & exists as col).
 *  - On match: UPDATE only the columns that are currently NULL/empty so we
 *    fill gaps without overwriting curated data.
 *  - On no match: do nothing (per product decision — admin merges manually).
 * Silent on errors (non-blocking for the registration save).
 */
function sync_jugadores_from_registro($conn, $posted, $birth_yyyymmdd) {
    $spei = trim((string)($posted['reg_spei'] ?? ''));
    $ghin = trim((string)($posted['numghinspei'] ?? $posted['reg_ghin'] ?? ''));
    if ($spei === '' && $ghin === '') return;

    $where = [];
    if ($spei !== '' && jug_has_reg($conn, 'reg_spei')) {
        $where[] = "reg_spei = '" . esc($conn, $spei) . "'";
    }
    if ($ghin !== '' && jug_has_reg($conn, 'numghinspei')) {
        $where[] = "numghinspei = '" . esc($conn, $ghin) . "'";
    }
    if (!$where) return;

    $sel = "SELECT * FROM jugadores WHERE " . implode(' OR ', $where) . " LIMIT 1";
    $r = @$conn->query($sel);
    if (!$r || !($row = $r->fetch_assoc())) {
        // Player not yet in jugadores; nothing to sync now.
        return;
    }
    $r->free();

    $jugId = (int)($row['id'] ?? 0);
    if ($jugId <= 0) return;

    /**
     * Map of jugadores column -> incoming registro field. Only columns that
     * exist on jugadores AND are currently NULL/empty get filled.
     */
    $fillMap = [
        'nombre'      => $posted['reg_nombre']    ?? '',
        'apellido'    => $posted['reg_apellido']  ?? '',
        'correo'      => $posted['reg_correo']    ?? '',
        'telefono'    => $posted['reg_telefono']  ?? $posted['reg_celular'] ?? '',
        'celular'     => $posted['reg_celular']   ?? $posted['reg_telefono'] ?? '',
        'sexo'        => $posted['reg_sexo']      ?? $posted['reg_genero']  ?? '',
        'genero'      => $posted['reg_genero']    ?? $posted['reg_sexo']    ?? '',
        'club'        => $posted['reg_club']      ?? '',
        'fechanac'    => $birth_yyyymmdd          ?? '',
        'reg_spei'    => $posted['reg_spei']      ?? '',
        'numghinspei' => $posted['numghinspei']   ?? $posted['reg_ghin'] ?? '',
        'handicap'    => $posted['reg_handicap']  ?? '',
    ];
    $sets = [];
    foreach ($fillMap as $col => $val) {
        $val = trim((string)$val);
        if ($val === '') continue;
        if (!jug_has_reg($conn, $col)) continue;
        // Only fill if current value is NULL or empty string
        $current = $row[$col] ?? null;
        if ($current !== null && trim((string)$current) !== '') continue;
        $sets[] = "$col = '" . esc($conn, $val) . "'";
    }
    if ($sets) {
        @$conn->query("UPDATE jugadores SET " . implode(',', $sets) . " WHERE id = $jugId LIMIT 1");
    }
}

/** Cache: which columns exist in the `registro` table. */
function registro_columns($conn, $refresh = false) {
    static $cols = null;
    if ($refresh) $cols = null;
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
 * Garantizar que existan las columnas para "Cargo a cuenta de socio".
 * Se ejecuta una sola vez por request (cachéo via static). Si ya existen
 * no hace nada. Permite que el feature funcione sin requerir migración
 * manual en cada deployment.
 */
function ensure_cargo_socio_columns($conn) {
    static $done = false;
    if ($done) return;
    $done = true;
    if (!registro_has($conn, 'reg_cargo_socio')) {
        @$conn->query("ALTER TABLE registro ADD COLUMN reg_cargo_socio TINYINT(1) NOT NULL DEFAULT 0");
    }
    if (!registro_has($conn, 'reg_clave_socio')) {
        @$conn->query("ALTER TABLE registro ADD COLUMN reg_clave_socio VARCHAR(64) NULL");
    }
    registro_columns($conn, true);
}

/**
 * Identify the torneo FK column on `registro`. Different deployments use
 * different names; we probe in priority order.
 */
function registro_torneo_col($conn) {
    foreach (['torneoid', 'torneo_id', 'id_torneo', 'idtorneo', 'reg_torneoid', 'reg_torneo_id'] as $c) {
        if (registro_has($conn, $c)) return $c;
    }

    // Some legacy `registro` tables were created without a tournament column.
    // Add the canonical column once so new submissions can be tied to torneoid.
    @$conn->query("ALTER TABLE registro ADD COLUMN torneoid INT(11) NULL");
    registro_columns($conn, true);
    if (registro_has($conn, 'torneoid')) return 'torneoid';

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

    // Asegurar columnas para el flujo "Cargo a cuenta de socio".
    ensure_cargo_socio_columns($conn);

    /** Whitelist of safe field_names accepted from the form. */
    $allowedTextFields = [
        'reg_nombre', 'reg_apellido', 'reg_correo', 'reg_telefono',
        'reg_handicap', 'reg_categoria', 'reg_sexo', 'reg_fechanac', 'reg_edad',
        'reg_es_socio', 'reg_tipo_socio', 'reg_club', 'reg_ghin',
        'reg_pais', 'reg_estado', 'reg_ciudad', 'reg_notas',
        // Canonical names from registro_campos
        'reg_genero', 'reg_celular', 'reg_mensaje', 'numghinspei',
        'reg_spei', 'reg_direccion', 'reg_cp', 'reg_id_club', 'reg_cargo',
        // Cargo a cuenta de socio (checkbox '1'/'' + clave de socio)
        'reg_cargo_socio', 'reg_clave_socio',
        // Talla de gorra (única reg_talla_*; las demás van en akron_*)
        'reg_talla_gorra',
        // Akron-specific
        'akron_talla', 'akron_talla_guante', 'akron_calzado',
        'akron_codigo', 'akron_monto_pago',
        // Snapshot del precio mostrado al jugador al enviar el form.
        // Lo escribe el cliente con base en /api/registro_precios.php?action=match.
        'reg_precio_estimado', 'reg_precio_moneda', 'reg_precio_regla_id',
    ];

    $cols = [$torneoCol];
    $vals = [$torneoid];
    $writtenCols = []; // dedupe when alias maps two posted names to same column

    foreach ($allowedTextFields as $f) {
        if (!isset($_POST[$f])) continue;
        $v = trim((string)$_POST[$f]);
        if ($v === '') continue;
        $target = resolve_reg_column($conn, $f);
        if (!$target) continue; // neither canonical nor alias exists on this server
        if (isset($writtenCols[$target])) continue;
        $writtenCols[$target] = true;
        $cols[] = $target;
        $vals[] = "'" . esc($conn, $v) . "'";
    }

    /**
     * Auto-calculate akron_edad against the tournament start date so a
     * player whose birthday falls one day after the cutoff stays in the
     * older bucket. We compute on the server with day-month precision.
     */
    $birth = trim((string)($_POST['reg_fechanac'] ?? ''));
    if ($birth !== '' && registro_has($conn, 'akron_edad') && !isset($writtenCols['akron_edad'])) {
        $cutoff = torneo_fecha_ini($conn, $torneoid);
        $age = $cutoff ? compute_age_at($birth, $cutoff) : null;
        if ($age !== null) {
            $writtenCols['akron_edad'] = true;
            $cols[] = 'akron_edad';
            $vals[] = (int)$age;
        }
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

    // Best-effort sync to jugadores when SPEI/GHIN provided.
    sync_jugadores_from_registro($conn, $_POST, $birth);

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

    // Asegurar columnas de cargo a cuenta antes de listar.
    ensure_cargo_socio_columns($conn);

    /** Fields to surface in the listing (skip blob). */
    $fields = [$pkCol . ' AS id'];
    $optional = [
        'reg_nombre','reg_apellido','reg_correo','reg_telefono','reg_handicap',
        'reg_categoria','reg_sexo','reg_fechanac','reg_es_socio','reg_tipo_socio',
        'reg_club','reg_ghin','reg_pais','reg_estado','reg_ciudad','reg_notas',
        'reg_verificado','reg_fecha','created_at','fecha_alta','reg_archivo_nombre',
        // Cargo a cuenta de socio
        'reg_cargo_socio','reg_clave_socio',
        // Tallas (optional columns)
        'reg_talla_gorra',
        // Canonical / akron columns
        'reg_genero','reg_celular','reg_mensaje','numghinspei','reg_spei',
        'reg_direccion','reg_cp','reg_id_club','reg_cargo',
        'akron_edad','akron_talla','akron_talla_guante','akron_calzado',
        'akron_codigo','akron_monto_pago',
        'reg_precio_estimado','reg_precio_moneda','reg_precio_regla_id',
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