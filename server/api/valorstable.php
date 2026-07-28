<?php
/**
 * Valores Stableford Endpoint
 * -----------------------------------------------------------------------
 * GET /api/valorstable.php?torneoid=XXX
 *
 * Devuelve la fila de la tabla `valorstable` correspondiente al torneo.
 * Se usa en la página /reglas para renderizar la tabla de puntaje
 * Stableford dentro de "Reglas Locales del Torneo".
 *
 * Resiliente: si la tabla no existe o no hay fila para el torneo,
 * responde `{ row: null }` en lugar de 500 — el frontend simplemente
 * oculta la tabla.
 */
require_once 'config.php';

$torneoid = (int) require_param('torneoid');

// ¿Existe la tabla?
$check = $conn->query("SHOW TABLES LIKE 'valorstable'");
if (!$check || $check->num_rows === 0) {
    json_response(['row' => null, 'source' => 'no_table']);
}

$sql = "SELECT * FROM valorstable WHERE torneoid = " . esc($conn, $torneoid) . " LIMIT 1";
$rs = $conn->query($sql);
if (!$rs || $rs->num_rows === 0) {
    json_response(['row' => null]);
}
$row = $rs->fetch_assoc();

// Elimina llaves internas que no aportan al frontend.
unset($row['id'], $row['torneoid']);

json_response(['row' => $row]);