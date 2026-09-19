<?php
/**
 * Distancias Endpoint
 * GET /api/distancias.php?torneoid=XXX
 *
 * Devuelve los campos activos del calendario y, para cada uno, únicamente las
 * mesas activas de `campo_tee` que están asignadas a categorías del torneo.
 * Cada mesa incluye sus colores de `salidas` y yardas/par/ventaja por hoyo.
 */
require_once 'config.php';

/** Comprueba si una tabla contiene una columna sin romper bases antiguas. */
function dist_has_column($conn, $table, $column) {
    static $cache = [];
    $key = $table . '.' . $column;
    if (array_key_exists($key, $cache)) return $cache[$key];
    $t = esc($conn, $table);
    $c = esc($conn, $column);
    $result = @$conn->query("SHOW COLUMNS FROM `$t` LIKE '$c'");
    return $cache[$key] = (bool)($result && $result->num_rows > 0);
}

$tid = (int)require_param('torneoid');
$teeActive = dist_has_column($conn, 'campo_tee', 'activa') ? ' AND ct.activa = 1' : '';

/** Campos que realmente participan en el calendario activo del torneo. */
$campoRows = query_all($conn, "SELECT DISTINCT cj.campo AS id, c.campo
                                FROM caljuego cj
                                LEFT JOIN campos c ON c.id = cj.campo
                               WHERE cj.torneoid = $tid AND cj.campo > 0
                               ORDER BY cj.campo ASC");

$campos = [];
foreach ($campoRows as $campoRow) {
    $campoid = (int)$campoRow['id'];

    /**
     * Mesas asignadas a categorías que juegan en este campo. La unión con
     * campo_tee garantiza que la mesa esté cargada para el campo; `activa=1`
     * se aplica cuando la columna existe.
     */
    $teeRows = query_all($conn, "SELECT DISTINCT s.id, s.tee, s.bgcolor, s.color, ct.ventajas
                                  FROM caljuego cj
                                  JOIN categorias cat ON cat.categoria_id = cj.categoriaid
                                  JOIN salidas s ON s.id = cat.salida
                                  JOIN campo_tee ct ON ct.campoid = cj.campo AND ct.salidaid = cat.salida$teeActive
                                 WHERE cj.torneoid = $tid AND cj.campo = $campoid
                                 ORDER BY s.id ASC");

    $tees = [];
    foreach ($teeRows as $teeRow) {
        $salidaid = (int)$teeRow['id'];
        /** Nombres completos de las categorías que comparten esta mesa. */
        $categoryRows = query_all($conn, "SELECT DISTINCT cat.categoria_id AS id, cat.categoria
                                           FROM caljuego cj
                                           JOIN categorias cat ON cat.categoria_id = cj.categoriaid
                                          WHERE cj.torneoid = $tid
                                            AND cj.campo = $campoid
                                            AND cat.salida = $salidaid
                                          ORDER BY cat.categoria_id ASC");

        /** Ventajas generales registradas como CSV en `campo_tee`. */
        $campoVentajas = array_map('intval', explode(',', (string)($teeRow['ventajas'] ?? '')));

        /** Distancia, par y ventaja de los hoyos 1–18 para este campo/mesa. */
        $holes = [];
        $totalYardas = 0;
        $totalPar = 0;
        foreach (query_all($conn, "SELECT numero, par, yardaje, ventaja
                                     FROM hoyosxsalida
                                    WHERE campoid = $campoid AND salidaid = $salidaid
                                    ORDER BY numero ASC") as $holeRow) {
            $numero = (int)$holeRow['numero'];
            if ($numero < 1 || $numero > 18) continue;
            $yardas = (int)$holeRow['yardaje'];
            $par = (int)$holeRow['par'];
            $ventaja = (int)$holeRow['ventaja'];
            $ventajaCampo = array_key_exists($numero - 1, $campoVentajas)
                ? (int)$campoVentajas[$numero - 1]
                : null;
            $holes[] = [
                'numero' => $numero,
                'yardas' => $yardas,
                'par' => $par,
                'ventaja' => $ventaja,
                'ventajaCampo' => $ventajaCampo,
                'ventajaDiferente' => $ventajaCampo !== null && $ventaja !== $ventajaCampo,
            ];
            $totalYardas += $yardas;
            $totalPar += $par;
        }

        $tees[] = [
            'id' => $salidaid,
            'tee' => (string)($teeRow['tee'] ?? ''),
            'bgcolor' => (string)($teeRow['bgcolor'] ?? ''),
            'color' => (string)($teeRow['color'] ?? ''),
            'categories' => array_map(function ($category) {
                return [
                    'id' => (int)$category['id'],
                    'name' => (string)$category['categoria'],
                ];
            }, $categoryRows),
            'holes' => $holes,
            'totalYardas' => $totalYardas,
            'totalPar' => $totalPar,
        ];
    }

    if ($tees) {
        $campos[] = [
            'id' => $campoid,
            'campo' => (string)($campoRow['campo'] ?? ''),
            'tees' => $tees,
        ];
    }
}

json_response(['campos' => $campos]);
