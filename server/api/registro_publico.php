<?php
/**
 * Public Registro Token Endpoint
 * ----------------------------------------------------------------------
 * Lets a player access their pre-registration via a single-use-feel
 * opaque token (no admin password needed) so they can attach the
 * payment receipt after the admin emails them the link.
 *
 *   GET  /api/registro_publico.php?token=<token>
 *        Returns the full registro row + categoria_name (no blob bytes).
 *
 *   POST /api/registro_publico.php  (multipart/form-data)
 *        Fields: token, reg_archivo (file).
 *        Stores the file into reg_archivo LONGBLOB and marks enviado=1.
 */
require_once 'config.php';
require_once '_smtp.php';

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

/** Max binary upload size (15 MB, matches registro.php). */
const MAX_PUB_FILE_BYTES = 15 * 1024 * 1024;

/** Light wrapper around SHOW COLUMNS. */
function pub_cols($conn) {
    static $c = null;
    if ($c !== null) return $c;
    $c = [];
    $r = $conn->query('SHOW COLUMNS FROM registro');
    if ($r) { while ($row = $r->fetch_assoc()) $c[$row['Field']] = true; $r->free(); }
    return $c;
}
function pub_has($conn, $col) { $c = pub_cols($conn); return isset($c[$col]); }

if (!pub_has($conn, 'reg_token')) {
    json_error('Esta funcionalidad requiere que el admin abra primero /admin/registros para inicializar el token.', 500);
}

$pkCol = pub_has($conn, 'id') ? 'id' : (pub_has($conn, 'reg_id') ? 'reg_id' : null);
if (!$pkCol) json_error('PK no encontrada', 500);

$token = trim((string)($_REQUEST['token'] ?? ''));
if ($token === '' || !preg_match('/^[a-f0-9]{32,128}$/i', $token)) {
    json_error('Token inválido', 400);
}

/** Locate the registro row by token (avoid id leakage). */
$row = query_one(
    $conn,
    "SELECT * FROM (
         SELECT *, $pkCol AS _pk FROM registro WHERE reg_token = '" . esc($conn, $token) . "' LIMIT 1
     ) t"
);
if (!$row) json_error('Token no encontrado', 404);
$id = (int)$row['_pk'];

// ============= GET: devolver datos del registro =============
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Quitar campos sensibles/grandes antes de responder.
    unset($row['reg_archivo']);
    unset($row['_pk']);
    $row['id'] = $id;
    $row['has_archivo'] = pub_has($conn, 'reg_archivo')
        ? (int)((bool) @query_one($conn, "SELECT 1 AS x FROM registro WHERE $pkCol = $id AND reg_archivo IS NOT NULL AND OCTET_LENGTH(reg_archivo) > 0 LIMIT 1"))
        : 0;

    // Resolver nombre de categoría y de torneo.
    $catName = '';
    if (!empty($row['reg_categoria'])) {
        $cr = @$conn->query("SELECT categoria FROM categorias WHERE categoria_id = " . (int)$row['reg_categoria'] . " LIMIT 1");
        if ($cr) { $cc = $cr->fetch_assoc(); $cr->free(); if ($cc) $catName = $cc['categoria']; }
    }
    $row['categoria_name'] = $catName;

    $torneoCol = null;
    foreach (['reg_id_torneo','torneo_id','id_torneo','idtorneo','torneoid'] as $c) {
        if (pub_has($conn, $c)) { $torneoCol = $c; break; }
    }
    $torneoName = '';
    if ($torneoCol && !empty($row[$torneoCol])) {
        $tr = @$conn->query("SELECT nombre FROM torneo WHERE torneo_id = " . (int)$row[$torneoCol] . " LIMIT 1");
        if ($tr) { $tt = $tr->fetch_assoc(); $tr->free(); if ($tt) $torneoName = $tt['nombre']; }
    }
    $row['torneo_name'] = $torneoName;

    json_response(['registro' => $row]);
}

// ============= POST: subir comprobante =============
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $hasFile = isset($_FILES['reg_archivo']) && is_uploaded_file($_FILES['reg_archivo']['tmp_name']);

    // Tallas editables que el jugador puede confirmar/cambiar al adjuntar
    // el comprobante. Se aceptan solo si la columna existe en `registro`.
    $tallaCols = ['akron_talla', 'akron_talla_guante', 'reg_talla_gorra', 'akron_calzado'];
    $sets = [];
    foreach ($tallaCols as $col) {
        if (!array_key_exists($col, $_POST)) continue;
        if (!pub_has($conn, $col)) continue;
        $v = trim((string)$_POST[$col]);
        $sets[] = "`$col` = '" . esc($conn, $v) . "'";
    }

    if (!$hasFile && empty($sets)) {
        json_error('Falta el archivo', 400);
    }
    if ($hasFile && $_FILES['reg_archivo']['size'] > MAX_PUB_FILE_BYTES) {
        json_error('Archivo demasiado grande (máx 15 MB).', 400);
    }
    if ($hasFile && !pub_has($conn, 'reg_archivo')) {
        json_error('La tabla no tiene reg_archivo', 500);
    }

    if ($hasFile) {
        $bin  = file_get_contents($_FILES['reg_archivo']['tmp_name']);
        $name = basename($_FILES['reg_archivo']['name']);
        $mime = $_FILES['reg_archivo']['type'] ?: 'application/octet-stream';
        $sets[] = "reg_archivo = '" . $conn->real_escape_string($bin) . "'";
        if (pub_has($conn, 'reg_archivo_nombre')) {
            $sets[] = "reg_archivo_nombre = '" . esc($conn, $name) . "'";
        }
        if (pub_has($conn, 'reg_archivo_mime')) {
            $sets[] = "reg_archivo_mime = '" . esc($conn, $mime) . "'";
        }
        // Subir comprobante → pasa a "Pendiente verificación de pago".
        if (pub_has($conn, 'enviado')) {
            $sets[] = "enviado = 1";
        }
    }

    if (!$conn->query("UPDATE registro SET " . implode(',', $sets) . " WHERE $pkCol = $id LIMIT 1")) {
        json_error('No se pudo guardar: ' . $conn->error, 500);
    }

    // Notificar al jugador que su comprobante llegó (best-effort).
    if ($hasFile && function_exists('send_comprobante_received_email')) {
        @send_comprobante_received_email($conn, $id);
    }

    json_response(['saved' => true]);
}

json_error('Method not allowed', 405);