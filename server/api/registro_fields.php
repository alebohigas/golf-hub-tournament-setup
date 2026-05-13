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

/**
 * Default field set — used when the DB has no rows for this tournament.
 * `section` groups fields into the progressive-disclosure UI sections:
 *   - 'basica'      → identity, contact, hcp, género, fechanac, categoría
 *   - 'socios'      → es_socio, tipo_socio, club, location
 *   - 'adicionales' → comprobante, notas, future tallas
 */
$DEFAULT_FIELDS = [
    ['field_name' => 'reg_nombre',     'field_label' => 'Nombre',                                       'is_enabled' => 1, 'is_required' => 1, 'display_order' => 10,  'section' => 'basica'],
    ['field_name' => 'reg_apellido',   'field_label' => 'Apellido',                                     'is_enabled' => 1, 'is_required' => 1, 'display_order' => 20,  'section' => 'basica'],
    ['field_name' => 'reg_correo',     'field_label' => 'Correo electrónico',                           'is_enabled' => 1, 'is_required' => 1, 'display_order' => 30,  'section' => 'basica'],
    ['field_name' => 'reg_telefono',   'field_label' => 'Teléfono',                                     'is_enabled' => 1, 'is_required' => 0, 'display_order' => 40,  'section' => 'basica'],
    ['field_name' => 'reg_handicap',   'field_label' => 'Hándicap',                                     'is_enabled' => 1, 'is_required' => 1, 'display_order' => 50,  'section' => 'basica'],
    ['field_name' => 'reg_sexo',       'field_label' => 'Género',                                       'is_enabled' => 1, 'is_required' => 0, 'display_order' => 60,  'section' => 'basica'],
    ['field_name' => 'reg_fechanac',   'field_label' => 'Fecha de nacimiento',                          'is_enabled' => 1, 'is_required' => 0, 'display_order' => 70,  'section' => 'basica'],
    ['field_name' => 'reg_categoria',  'field_label' => 'Categoría',                                    'is_enabled' => 1, 'is_required' => 1, 'display_order' => 80,  'section' => 'basica'],
    ['field_name' => 'reg_es_socio',   'field_label' => '¿Es socio del club que realiza el torneo?',    'is_enabled' => 1, 'is_required' => 1, 'display_order' => 90,  'section' => 'socios'],
    ['field_name' => 'reg_tipo_socio', 'field_label' => 'Tipo de socio',                                'is_enabled' => 1, 'is_required' => 0, 'display_order' => 100, 'section' => 'socios'],
    ['field_name' => 'reg_club',       'field_label' => 'Club de procedencia',                          'is_enabled' => 1, 'is_required' => 0, 'display_order' => 110, 'section' => 'socios'],
    ['field_name' => 'reg_pais',       'field_label' => 'País',                                         'is_enabled' => 1, 'is_required' => 0, 'display_order' => 120, 'section' => 'socios'],
    ['field_name' => 'reg_estado',     'field_label' => 'Estado',                                       'is_enabled' => 1, 'is_required' => 0, 'display_order' => 130, 'section' => 'socios'],
    ['field_name' => 'reg_ciudad',     'field_label' => 'Ciudad',                                       'is_enabled' => 1, 'is_required' => 0, 'display_order' => 140, 'section' => 'socios'],
    ['field_name' => 'reg_ghin',       'field_label' => 'GHIN / FMG ID',                                'is_enabled' => 1, 'is_required' => 0, 'display_order' => 150, 'section' => 'socios'],
    ['field_name' => 'reg_archivo',         'field_label' => 'Comprobante de pago',                          'is_enabled' => 1, 'is_required' => 0, 'display_order' => 160, 'section' => 'adicionales'],
    ['field_name' => 'reg_notas',           'field_label' => 'Notas adicionales',                            'is_enabled' => 1, 'is_required' => 0, 'display_order' => 170, 'section' => 'adicionales'],
    // Tallas — desactivadas por defecto; el admin las activa según necesidad
    ['field_name' => 'reg_talla_gorra',     'field_label' => 'Talla de gorra',                               'is_enabled' => 0, 'is_required' => 0, 'display_order' => 180, 'section' => 'adicionales'],
    ['field_name' => 'reg_talla_guante',    'field_label' => 'Talla de guante',                              'is_enabled' => 0, 'is_required' => 0, 'display_order' => 190, 'section' => 'adicionales'],
    ['field_name' => 'reg_talla_camisa',    'field_label' => 'Talla de camisa',                              'is_enabled' => 0, 'is_required' => 0, 'display_order' => 200, 'section' => 'adicionales'],
    ['field_name' => 'reg_talla_tenis',     'field_label' => 'Talla de tenis (zapatos)',                     'is_enabled' => 0, 'is_required' => 0, 'display_order' => 210, 'section' => 'adicionales'],
    ['field_name' => 'reg_talla_pantalon',  'field_label' => 'Talla de pantalón',                            'is_enabled' => 0, 'is_required' => 0, 'display_order' => 220, 'section' => 'adicionales'],
    ['field_name' => 'reg_talla_cinturon',  'field_label' => 'Talla de cinturón',                            'is_enabled' => 0, 'is_required' => 0, 'display_order' => 230, 'section' => 'adicionales'],
];

/** Ensure the registro_form_fields table exists; if not, return defaults / refuse writes. */
function registro_fields_table_exists($conn) {
    static $exists = null;
    if ($exists !== null) return $exists;
    $r = $conn->query("SHOW TABLES LIKE 'registro_form_fields'");
    $exists = $r && $r->num_rows > 0;
    return $exists;
}

/**
 * Ensure the `section` column exists on `registro_form_fields`. Runs a
 * harmless ALTER TABLE the first time and caches the result for the
 * remainder of the request.
 */
function ensure_section_column($conn) {
    static $checked = null;
    if ($checked !== null) return $checked;
    if (!registro_fields_table_exists($conn)) return $checked = false;
    $r = $conn->query("SHOW COLUMNS FROM registro_form_fields LIKE 'section'");
    if ($r && $r->num_rows > 0) return $checked = true;
    @$conn->query("ALTER TABLE registro_form_fields ADD COLUMN section VARCHAR(32) NOT NULL DEFAULT 'basica'");
    $r = $conn->query("SHOW COLUMNS FROM registro_form_fields LIKE 'section'");
    return $checked = ($r && $r->num_rows > 0);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $torneoid = (int) require_param('torneoid');

    if (!registro_fields_table_exists($conn)) {
        json_response(['fields' => $DEFAULT_FIELDS, 'source' => 'defaults']);
    }

    $hasSection = ensure_section_column($conn);
    $sectionSql = $hasSection ? ", section" : "";
    $sql = "SELECT field_name, field_label, is_enabled, is_required, display_order $sectionSql
            FROM registro_form_fields
            WHERE torneo_id = $torneoid
            ORDER BY display_order ASC, field_name ASC";
    $rows = query_all($conn, $sql);

    if (count($rows) === 0) {
        json_response(['fields' => $DEFAULT_FIELDS, 'source' => 'defaults']);
    }

    /** Cast booleans / ints for the client */
    /** Default-section lookup (so legacy rows without `section` map sensibly). */
    $defaultSectionByName = [];
    foreach ($DEFAULT_FIELDS as $df) {
        $defaultSectionByName[$df['field_name']] = $df['section'];
    }
    $fields = array_map(function($r) use ($defaultSectionByName) {
        $section = isset($r['section']) && $r['section'] !== ''
            ? $r['section']
            : ($defaultSectionByName[$r['field_name']] ?? 'basica');
        return [
            'field_name'    => $r['field_name'],
            'field_label'   => $r['field_label'],
            'is_enabled'    => (int)$r['is_enabled'] ? 1 : 0,
            'is_required'   => (int)$r['is_required'] ? 1 : 0,
            'display_order' => (int)$r['display_order'],
            'section'       => $section,
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

    $hasSection = ensure_section_column($conn);

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
        $sect  = esc($conn, (string)($f['section'] ?? 'basica'));
        if ($name === '') continue;

        if ($hasSection) {
            $sql = "INSERT INTO registro_form_fields
                    (torneo_id, field_name, field_label, is_enabled, is_required, display_order, section)
                    VALUES ($torneoid, '$name', '$label', $en, $req, $ord, '$sect')";
        } else {
            $sql = "INSERT INTO registro_form_fields
                    (torneo_id, field_name, field_label, is_enabled, is_required, display_order)
                    VALUES ($torneoid, '$name', '$label', $en, $req, $ord)";
        }
        if ($conn->query($sql)) $insertCount++;
    }

    json_response(['saved' => true, 'count' => $insertCount]);
}

json_error('Method not allowed', 405);