<?php
/**
 * Categories Endpoint
 * GET /api/categories.php?torneoid=XXX
 * Returns all active categories with player counts
 */
require_once 'config.php';

// debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);


$torneoid = require_param('torneoid');
$tid = esc($conn, $torneoid);

/** Query: fetch categories with player count, joined to jugadores */
/** Query: fetch categories with player count, tee info, rating & slope */
$sql = "SELECT a.categoria_id, a.torneo_id, a.categoria, a.abreviatura,
               a.sistema, a.formato, a.estilo, a.hcpIdxMin, a.hcpIdxMax,
               a.porcentaje, a.hoyosajugar, a.hoyosacorte, a.salida,
               a.gross, a.catrel, a.sexo, a.corte,
               a.maxjugadores, a.hoyosxronda,
               COUNT(b.id) as playerCount,
               s.tee AS teeName, s.color AS teeColorName,
               ct.rating, ct.slope, ct.parcampo
        FROM categorias a
        LEFT JOIN jugadores b ON (a.categoria_id = b.categoriaid)
        LEFT JOIN salidas s ON (a.salida = s.id)
        LEFT JOIN campo_tee ct ON (ct.salidaid = a.salida AND ct.campoid = (
            SELECT campo FROM caljuego WHERE categoriaid = a.categoria_id LIMIT 1
        ))
        WHERE a.estatus = 1 AND a.torneo_id = $tid
        GROUP BY a.categoria_id, a.torneo_id, a.categoria, a.abreviatura,
                 a.sistema, a.formato, a.estilo, a.hcpIdxMin, a.hcpIdxMax,
                 a.porcentaje, a.hoyosajugar, a.hoyosacorte, a.salida,
                 a.gross, a.catrel, a.sexo, a.corte,
                 a.maxjugadores, a.hoyosxronda,
                 s.tee, s.color, ct.rating, ct.slope, ct.parcampo
        ORDER BY a.categoria_id ASC";

$rows = query_all($conn, $sql);

/** Map DB rows to JSON response format */
$categories = array_map(function($row) {
    return [
        'id'          => $row['categoria_id'],
        'name'        => $row['categoria'],
        'shortName'   => $row['abreviatura'],
        'system'      => $row['sistema'],
        'format'      => $row['formato'],
        'style'       => $row['estilo'],
        'hcpMin'      => (float)$row['hcpIdxMin'],
        'hcpMax'      => (float)$row['hcpIdxMax'],
        'percentage'  => (float)$row['porcentaje'],
        'holes'       => (int)$row['hoyosajugar'],
        'cutHoles'    => (int)$row['hoyosacorte'],
        // Final cut count (categorias.corte) — number of players advancing to the final round.
        'finalCut'    => isset($row['corte']) ? (int)$row['corte'] : 0,
        'teeId'       => $row['salida'],
        'gross'       => (int)$row['gross'],
        'relatedCat'  => $row['catrel'],
        'gender'      => $row['sexo'],
        'playerCount' => (int)$row['playerCount'],
        'maxPlayers'  => isset($row['maxjugadores']) ? (int)$row['maxjugadores'] : 0,
        'holesPerRound'=> isset($row['hoyosxronda']) ? (int)$row['hoyosxronda'] : 18,
        'teeName'     => $row['teeName'] ?? '',
        'teeColorName'=> $row['teeColorName'] ?? '',
        'rating'      => $row['rating'] !== null ? (float)$row['rating'] : null,
        'slope'       => $row['slope'] !== null ? (int)$row['slope'] : null,
        'par'         => $row['parcampo'] !== null ? (int)$row['parcampo'] : null,
    ];
}, $rows);

json_response($categories);
