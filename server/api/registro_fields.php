<?php
/**
 * Registro Form Fields Endpoint
 * -----------------------------------------------------------------------
 * GET  /api/registro_fields.php?torneoid=XXX
 *      → returns the configured form fields for the public /registro page
 *
 * POST /api/registro_fields.php?torneoid=XXX  (JSON body)
 *      → admin: upserts the configuration (fields[] = { field_name, field_label, is_enabled, is_required, display_order })
 *
 * Backed by table `registro_form_fields` (see migration block previously sent
 * to the user). On a fresh tournament with no rows we synthesize a default
 * field set so the public page is usable out of the box.
 */
require_once 'config.php';

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

/** Default field set — used when the DB has no rows for this tournament. */
$DEFAULT_FIELDS = [
    ['field_name' => 'reg_nombre',     'field_label' => 'Nombre',                'is_enabled' => 1, 'is_required' => 1, 'display_order' => 10],
    ['field_name' => 'reg_apellido',   'field_label' => 'Apellido',              'is_enabled' => 1, 'is_required' => 1, 'display_order' => 20],
    ['field_name' => 'reg_correo',     'field_label' => 'Correo electrónico',    'is_enabled' => 1, 'is_required' => 1, 'display_order' => 30],
    ['field_name' => 'reg_telefono',   'field_label' => 'Teléfono',              'is_enabled' => 1, 'is_required' => 0, 'display_order' => 40],
    ['field_name' => 'reg_handicap',   'field_label' => 'Hándicap',              'is_enabled' => 1, 'is_required' => 1, 'display_order' => 50],
    ['field_name' => 'reg_categoria',  'field_label' => 'Categoría',             'is_enabled' => 1, 'is_required' => 1, 'display_order' => 60],
    ['field_name' => 'reg_sexo',       'field_label' => 'Sexo',                  'is_enabled' => 1, 'is_required' => 0, 'display_order' => 70],
    ['field_name' => 'reg_fechanac',   'field_label' => 'Fecha de nacimiento',   'is_enabled' => 1, 'is_required' => 0, 'display_order' => 80],
    ['field_name' => 'reg_es_socio',   'field_label' => '¿Es socio del club?',   'is_enabled' => 1, 'is_required' => 1, 'display_order' => 90],
    ['field_name' => 'reg_tipo_socio', 'field_label' => 'Tipo de socio',         'is_enabled' => 1, 'is_required' => 0, 'display_order' => 100],
    ['field_name' => 'reg_club',       'field_label' => 'Club de procedencia',   'is_enabled' => 1, 'is_required' => 0, 'display_order' => 110],
    ['field_name' => 'reg_ghin',       'field_label' => 'GHIN / FMG ID',         'is_enabled' => 1, 'is_required' => 0, 'display_order' => 120],
    ['field_name' => 'reg_pais',       'field_label' => 'País',                  'is_enabled' => 1, 'is_required' => 0, 'display_order' => 130],
    ['field_name' => 'reg_estado',     'field_label' => 'Estado',                'is_enabled' => 1, 'is_required' => 0, 'display_order' => 140],
    ['field_name' => 'reg_ciudad',     'field_label' => 'Ciudad',                'is_enabled' => 1, 'is_required' => 0, 'display_order' => 150],
    ['field_name' => 'reg_archivo',    'field_label' => 'Comprobante de pago',   'is_enabled' => 1, 'is_required' => 0, 'display_order' => 160],
    ['field_name' => 'reg_notas',      'field_label' => 'Notas adicionales',     'is_enabled' => 1, 'is_required' => 0, 'display_order' => 170],
];

/** Ensure the registro_form_fields table exists; if not, return defaults / refuse writes. */
function registro_fields_table_exists($conn) {
    static $exists = null;
    if ($exists !== null) return $exists;
    $r = $conn->query("SHOW TABLES LIKE 'registro_form_fields'");
    $exists = $r && $r->num_rows > 0;
    return $exists;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $torneoid = (int) require_param('torneoid');

    if (!registro_fields_table_exists($conn)) {
        json_response(['fields' => $DEFAULT_FIELDS, 'source' => 'defaults']);
    }

    $sql = "SELECT field_name, field_label, is_enabled, is_required, display_order
            FROM registro_form_fields
            WHERE torneo_id = $torneoid
            ORDER BY display_order ASC, field_name ASC";
    $rows = query_all($conn, $sql);

    if (count($rows) === 0) {
        json_response(['fields' => $DEFAULT_FIELDS, 'source' => 'defaults']);
    }

    /** Cast booleans / ints for the client */
    $fields = array_map(function($r) {
        return [
            'field_name'    => $r['field_name'],
            'field_label'   => $r['field_label'],
            'is_enabled'    => (int)$r['is_enabled'] ? 1 : 0,
            'is_required'   => (int)$r['is_required'] ? 1 : 0,
            'display_order' => (int)$r['display_order'],
        ];
    }, $rows);

    json_response(['fields' => $fields, 'source' => 'db']);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) json_error('Invalid JSON body', 400);

    $password = $body['password'] ?? '';
    if ($password !== 'admin2025') json_error('Unauthorized', 401);

    $torneoid = isset($body['torneoid']) ? (int)$body['torneoid'] : 0;
    if ($torneoid <= 0) json_error('Missing torneoid', 400);

    if (!registro_fields_table_exists($conn)) {
        json_error('Table registro_form_fields not found. Run the migration block first.', 500);
    }

    $fields = $body['fields'] ?? [];
    if (!is_array($fields)) json_error('fields must be an array', 400);

    /** Replace strategy: wipe this tournament's rows then insert the new set. */
    $conn->query("DELETE FROM registro_form_fields WHERE torneo_id = $torneoid");

    $insertCount = 0;
    foreach ($fields as $f) {
        $name  = esc($conn, (string)($f['field_name']  ?? ''));
        $label = esc($conn, (string)($f['field_label'] ?? ''));
        $en    = !empty($f['is_enabled'])  ? 1 : 0;
        $req   = !empty($f['is_required']) ? 1 : 0;
        $ord   = (int)($f['display_order'] ?? 0);
        if ($name === '') continue;

        $sql = "INSERT INTO registro_form_fields
                (torneo_id, field_name, field_label, is_enabled, is_required, display_order)
                VALUES ($torneoid, '$name', '$label', $en, $req, $ord)";
        if ($conn->query($sql)) $insertCount++;
    }

    json_response(['saved' => true, 'count' => $insertCount]);
}

json_error('Method not allowed', 405);