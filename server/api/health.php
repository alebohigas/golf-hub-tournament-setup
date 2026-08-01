<?php
/**
 * Health Check Endpoint
 * GET /api/health.php
 * Returns server status, timestamp and DEPLOYMENT MARKERS:
 *   - api_build:       versión del código PHP desplegado (API_BUILD en config.php)
 *   - mojibake_fix:    'active' si fix_mojibake() repara "podrÃ¡n" -> "podrán"
 *   - mojibake_sample: resultado real de la prueba (debe ser "podrán")
 *   - db_charset:      charset de la conexión (debe ser utf8mb4)
 *
 * Uso para verificar el despliegue:
 *   curl -s https://<dominio>/api/health.php
 * Si `mojibake_fix` no es 'active', el config.php del servidor está viejo:
 * vuelve a subir la carpeta server/api/ por SFTP.
 */
require_once 'config.php';

/** Cadena de control con doble codificación (UTF-8 leído como Latin-1). */
$mojibakeProbe   = "podr\xC3\x83\xC2\xA1n";       // "podrÃ¡n"
$mojibakeExpected = "podr\xC3\xA1n";              // "podrán"
$mojibakeResult  = function_exists('fix_mojibake') ? fix_mojibake($mojibakeProbe) : $mojibakeProbe;

json_response([
    'status' => 'ok',
    'timestamp' => date('c'),
    'database' => $conn->ping() ? 'connected' : 'disconnected',
    'api_build' => defined('API_BUILD') ? API_BUILD : 'unknown',
    'db_charset' => $conn->character_set_name(),
    'mojibake_fix' => $mojibakeResult === $mojibakeExpected ? 'active' : 'inactive',
    // Nota: json_response() aplica fix_mojibake_deep(), por lo que este campo
    // se envía ya reparado; su valor esperado es siempre "podrán".
    'mojibake_sample' => $mojibakeResult,
]);
