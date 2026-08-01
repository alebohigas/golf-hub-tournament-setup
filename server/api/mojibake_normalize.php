<?php
/**
 * mojibake_normalize.php
 * =====================================================================
 * JOB DE NORMALIZACIÓN DE MOJIBAKE EN LA BASE DE DATOS
 * ---------------------------------------------------------------------
 * `fix_mojibake()` (config.php) repara el texto SOLO al momento de
 * responder JSON. Este job repara el ORIGEN: recorre las columnas de
 * texto de la base de datos, detecta los valores con doble codificación
 * ("podrÃ¡n", "EdiciÃ³n", "aÃ±o") y los reescribe con la ortografía
 * correcta en español ("podrán", "Edición", "año").
 *
 * MODOS DE USO
 * ---------------------------------------------------------------------
 * 1) CLI (recomendado, sin límite de tiempo del navegador):
 *      php server/api/mojibake_normalize.php --dry-run
 *      php server/api/mojibake_normalize.php --apply
 *      php server/api/mojibake_normalize.php --apply --tables=convocatoria_content,torneos
 *
 * 2) HTTP (hosting compartido sin CLI). Requiere contraseña superadmin:
 *      POST /api/mojibake_normalize.php
 *      { "password": "***", "apply": true, "tables": "convocatoria_content" }
 *    Sin `apply` corre en modo simulación (dry-run) y no escribe nada.
 *
 * SEGURIDAD / RESGUARDOS
 * ---------------------------------------------------------------------
 * - Dry-run por default: nunca escribe si no se pide `--apply` / `apply:true`.
 * - Solo UPDATE de columnas de texto; jamás DDL, GRANT, DROP ni DELETE.
 * - Solo actualiza filas identificables por su llave primaria simple.
 * - Cada UPDATE va con sentencia preparada (sin concatenar el texto).
 * - Si el valor reparado no es UTF-8 válido, se deja intacto.
 */

require_once __DIR__ . '/config.php';

// ============= Constantes del job =============
/** Columnas candidatas: tipos de texto donde puede vivir mojibake. */
const MOJIBAKE_TEXT_TYPES = ['char', 'varchar', 'text', 'tinytext', 'mediumtext', 'longtext'];
/** Máximo de ejemplos guardados por columna para el reporte. */
const MOJIBAKE_SAMPLE_LIMIT = 5;
/** Tamaño de lote al leer filas (evita agotar memoria en tablas grandes). */
const MOJIBAKE_BATCH_SIZE = 500;

$IS_CLI = (PHP_SAPI === 'cli');

// ============= Parseo de opciones =============
/**
 * mojibake_options
 * Resuelve las opciones del job desde CLI (argv) o desde el cuerpo HTTP.
 * @return array{apply:bool,tables:array,password:string}
 */
function mojibake_options() {
    global $IS_CLI, $argv;

    if ($IS_CLI) {
        $apply = false;
        $tables = [];
        foreach (array_slice((array)$argv, 1) as $arg) {
            if ($arg === '--apply') $apply = true;
            if ($arg === '--dry-run') $apply = false;
            if (strpos($arg, '--tables=') === 0) {
                $tables = array_filter(array_map('trim', explode(',', substr($arg, 9))));
            }
        }
        return ['apply' => $apply, 'tables' => $tables, 'password' => ''];
    }

    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);
    if (!is_array($body)) $body = [];
    $tables = $body['tables'] ?? ($_GET['tables'] ?? '');
    if (is_string($tables)) {
        $tables = array_filter(array_map('trim', explode(',', $tables)));
    }
    return [
        'apply'    => !empty($body['apply']) || (($_GET['apply'] ?? '') === '1'),
        'tables'   => array_values((array)$tables),
        'password' => (string)($body['password'] ?? ($_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '')),
    ];
}

$OPTS = mojibake_options();

// ============= Autenticación (solo HTTP) =============
if (!$IS_CLI) {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_error('Method not allowed. Usa POST con la contraseña de superadmin.', 405);
    }
    if (!is_superadmin_password($conn, $OPTS['password'])) {
        json_error('Unauthorized', 401);
    }
}

// ============= Descubrimiento del esquema =============
/**
 * mojibake_text_columns
 * Lista las columnas de texto del esquema actual, agrupadas por tabla.
 * @param mysqli $conn
 * @param array $onlyTables Filtro opcional de nombres de tabla
 * @return array<string, string[]> tabla => [columnas]
 */
function mojibake_text_columns($conn, $onlyTables = []) {
    $types = "'" . implode("','", MOJIBAKE_TEXT_TYPES) . "'";
    $sql = "SELECT TABLE_NAME, COLUMN_NAME
              FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND DATA_TYPE IN ($types)
             ORDER BY TABLE_NAME, ORDINAL_POSITION";
    debug_log_query('schema text columns', $sql);
    $res = $conn->query($sql);
    if (!$res) return [];

    $filter = array_map('strtolower', $onlyTables);
    $map = [];
    while ($row = $res->fetch_assoc()) {
        $t = $row['TABLE_NAME'];
        if ($filter && !in_array(strtolower($t), $filter, true)) continue;
        $map[$t][] = $row['COLUMN_NAME'];
    }
    return $map;
}

/**
 * mojibake_primary_key
 * Devuelve la llave primaria si es de una sola columna (requisito para
 * poder hacer UPDATE fila por fila de forma segura).
 * @return string|null Nombre de la columna PK o null
 */
function mojibake_primary_key($conn, $table) {
    $t = esc($conn, $table);
    $sql = "SELECT COLUMN_NAME
              FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = '$t'
               AND CONSTRAINT_NAME = 'PRIMARY'";
    $res = $conn->query($sql);
    if (!$res) return null;
    $cols = [];
    while ($row = $res->fetch_assoc()) $cols[] = $row['COLUMN_NAME'];
    return count($cols) === 1 ? $cols[0] : null;
}

// ============= Detección =============
/**
 * mojibake_needs_fix
 * True cuando fix_mojibake() produce un texto distinto y válido en UTF-8.
 */
function mojibake_needs_fix($value) {
    if (!is_string($value) || $value === '') return false;
    $fixed = fix_mojibake($value);
    return $fixed !== $value && mb_check_encoding($fixed, 'UTF-8');
}

// ============= Ejecución del job =============
/**
 * mojibake_run
 * Recorre tablas/columnas, detecta mojibake y (si $apply) lo corrige.
 * @return array Reporte con totales, detalle por columna y ejemplos
 */
function mojibake_run($conn, $apply, $onlyTables = []) {
    $report = [
        'apply'          => (bool)$apply,
        'api_build'      => API_BUILD,
        'started_at'     => date('c'),
        'tables_scanned' => 0,
        'rows_scanned'   => 0,
        'values_found'   => 0,
        'values_fixed'   => 0,
        'skipped_tables' => [],
        'details'        => [],
    ];

    foreach (mojibake_text_columns($conn, $onlyTables) as $table => $columns) {
        $pk = mojibake_primary_key($conn, $table);
        if (!$pk) {
            // Sin PK simple no se puede ubicar la fila: se reporta y se omite.
            $report['skipped_tables'][] = ['table' => $table, 'reason' => 'sin llave primaria de una columna'];
            continue;
        }
        $report['tables_scanned']++;

        $colList = implode(', ', array_map(function ($c) { return "`$c`"; }, $columns));
        $offset = 0;

        while (true) {
            $sql = "SELECT `$pk`, $colList FROM `$table` ORDER BY `$pk` LIMIT " . MOJIBAKE_BATCH_SIZE . " OFFSET $offset";
            $res = $conn->query($sql);
            if (!$res) {
                $report['skipped_tables'][] = ['table' => $table, 'reason' => 'error de lectura: ' . $conn->error];
                break;
            }
            $count = 0;
            while ($row = $res->fetch_assoc()) {
                $count++;
                $report['rows_scanned']++;
                $updates = [];

                foreach ($columns as $col) {
                    $value = $row[$col] ?? null;
                    if (!mojibake_needs_fix($value)) continue;
                    $fixed = fix_mojibake($value);
                    $updates[$col] = $fixed;
                    $report['values_found']++;

                    $key = "$table.$col";
                    if (!isset($report['details'][$key])) {
                        $report['details'][$key] = ['table' => $table, 'column' => $col, 'found' => 0, 'fixed' => 0, 'samples' => []];
                    }
                    $report['details'][$key]['found']++;
                    if (count($report['details'][$key]['samples']) < MOJIBAKE_SAMPLE_LIMIT) {
                        $report['details'][$key]['samples'][] = [
                            'id'     => $row[$pk],
                            'before' => mb_substr($value, 0, 120),
                            'after'  => mb_substr($fixed, 0, 120),
                        ];
                    }
                }

                if (!$updates || !$apply) continue;

                // UPDATE preparado: el texto reparado nunca se concatena al SQL.
                $set = implode(', ', array_map(function ($c) { return "`$c` = ?"; }, array_keys($updates)));
                $stmt = $conn->prepare("UPDATE `$table` SET $set WHERE `$pk` = ? LIMIT 1");
                if (!$stmt) { error_log("mojibake_normalize: prepare falló en $table: " . $conn->error); continue; }
                $params = array_values($updates);
                $params[] = $row[$pk];
                $stmt->bind_param(str_repeat('s', count($params)), ...$params);
                if ($stmt->execute()) {
                    foreach (array_keys($updates) as $c) $report['details']["$table.$c"]['fixed']++;
                    $report['values_fixed'] += count($updates);
                } else {
                    error_log("mojibake_normalize: update falló en $table#{$row[$pk]}: " . $stmt->error);
                }
                $stmt->close();
            }
            if ($count < MOJIBAKE_BATCH_SIZE) break;
            $offset += MOJIBAKE_BATCH_SIZE;
        }
    }

    $report['details'] = array_values($report['details']);
    $report['finished_at'] = date('c');
    return $report;
}

$REPORT = mojibake_run($conn, $OPTS['apply'], $OPTS['tables']);

// ============= Salida =============
if ($IS_CLI) {
    $mode = $REPORT['apply'] ? 'APLICADO' : 'SIMULACIÓN (dry-run)';
    echo "Mojibake normalize [$mode] build=" . $REPORT['api_build'] . "\n";
    echo "Tablas: {$REPORT['tables_scanned']}  Filas: {$REPORT['rows_scanned']}  Detectados: {$REPORT['values_found']}  Corregidos: {$REPORT['values_fixed']}\n";
    foreach ($REPORT['details'] as $d) {
        echo "  - {$d['table']}.{$d['column']}: {$d['found']} detectados, {$d['fixed']} corregidos\n";
        foreach ($d['samples'] as $s) {
            echo "      #{$s['id']}: {$s['before']}  =>  {$s['after']}\n";
        }
    }
    foreach ($REPORT['skipped_tables'] as $s) {
        echo "  ! omitida {$s['table']}: {$s['reason']}\n";
    }
    if (!$REPORT['apply']) echo "\nNada se escribió. Repite con --apply para corregir.\n";
    exit(0);
}

json_response($REPORT);
