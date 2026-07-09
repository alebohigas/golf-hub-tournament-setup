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

/**
 * Optional `?skin=1` flag.
 * When set, the endpoint returns only categories that have at least one
 * player enrolled in the SKIN GAME (jugadores.Skeenjuga = 1), and the
 * `playerCount` reflects only those skin-enrolled players. Also filters
 * out related sub-categories (categorias.catrel <> 0) so the /skinplayers
 * grid mirrors the legacy `jugadores_skin.php` view.
 */
$skinOnly = isset($_GET['skin']) && $_GET['skin'] === '1';
$playerJoinCond = $skinOnly
    ? "(a.categoria_id = b.categoriaid AND b.Skeenjuga = 1)"
    : "(a.categoria_id = b.categoriaid)";
$skinCatFilter = $skinOnly ? " AND a.catrel = 0 " : '';

/** Detect new optional age-range columns added for the Pre-Registro feature. */
$ageMinExists = $conn->query("SHOW COLUMNS FROM categorias LIKE 'age_range_min'");
$ageMinExists = $ageMinExists && $ageMinExists->num_rows > 0;
$ageMaxExists = $conn->query("SHOW COLUMNS FROM categorias LIKE 'age_range_max'");
$ageMaxExists = $ageMaxExists && $ageMaxExists->num_rows > 0;
$ageMinSel = $ageMinExists ? ', a.age_range_min' : '';
$ageMaxSel = $ageMaxExists ? ', a.age_range_max' : '';

/** Query: fetch categories with player count, joined to jugadores */
/** Query: fetch categories with player count, tee info, rating & slope */
$sql = "SELECT a.categoria_id, a.torneo_id, a.categoria, a.abreviatura,
               a.sistema, a.formato, a.estilo, a.hcpIdxMin, a.hcpIdxMax,
               a.porcentaje, a.hoyosajugar, a.hoyosacorte, a.salida,
               a.gross, a.catrel, a.sexo, a.corte,
               a.maxjugadores, a.hoyosxronda$ageMinSel$ageMaxSel,
               COUNT(b.id) as playerCount,
               /**
                * Conteo de jugadores pre-registrados para esta categoría.
                * Fuente: tabla `registro` (Pre-Registro). Se cuentan sólo
                * los que ya están verificados Y con pago confirmado por
                * tesorería (verificado = 1 AND status_pago = 1). Se filtra
                * por reg_id_torneo + reg_categoria.
                */
               /**
                * Conteo de jugadores activos REALES en la tabla `jugadores`
                * para esta categoría + torneo. Sirve como contador de cupos
                * ocupados en el form público de Pre-Registro. Excluye filas
                * con estatus='BAJA' para que dar de baja libere el lugar.
                */
               (SELECT COUNT(*) FROM jugadores j
                  WHERE j.torneoid    = a.torneo_id
                    AND j.categoriaid = a.categoria_id
                    AND (j.estatus IS NULL OR j.estatus <> 'BAJA')) AS registeredCount,
               s.tee AS teeName, s.color AS teeColorName,
               ct.rating, ct.slope, ct.parcampo
        FROM categorias a
        LEFT JOIN jugadores b ON $playerJoinCond
        LEFT JOIN salidas s ON (a.salida = s.id)
        LEFT JOIN campo_tee ct ON (ct.salidaid = a.salida AND ct.campoid = (
            SELECT campo FROM caljuego WHERE categoriaid = a.categoria_id LIMIT 1
        ))
        WHERE a.estatus = 1 AND a.torneo_id = $tid $skinCatFilter
        GROUP BY a.categoria_id, a.torneo_id, a.categoria, a.abreviatura,
                 a.sistema, a.formato, a.estilo, a.hcpIdxMin, a.hcpIdxMax,
                 a.porcentaje, a.hoyosajugar, a.hoyosacorte, a.salida,
                 a.gross, a.catrel, a.sexo, a.corte,
                 a.maxjugadores, a.hoyosxronda$ageMinSel$ageMaxSel,
                 s.tee, s.color, ct.rating, ct.slope, ct.parcampo
        " . ($skinOnly ? " HAVING playerCount > 0 " : "") . "
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
        /** True cuando la categoría es de parejas (formato='PAREJAS'). El frontend
         *  usa esto en /jugadores y /resultados para activar agrupación por grupoid
         *  y tarjetas de parejas (Go Go, Bola Baja, Suma Scores).
         */
        'isParejas'   => (strtoupper($row['formato'] ?? '') === 'PAREJAS'),
        // Number of players actively registered in this category via the
        // Pre-Registro flow (jugadores.tipoinsc=1 AND tipoinsc2=3). Used by
        // the public registration form to display "spots available" next to
        // each category in the dropdown.
        'registeredCount' => isset($row['registeredCount']) ? (int)$row['registeredCount'] : 0,
        'maxPlayers'  => isset($row['maxjugadores']) ? (int)$row['maxjugadores'] : 0,
        'holesPerRound'=> isset($row['hoyosxronda']) ? (int)$row['hoyosxronda'] : 18,
        'teeName'     => $row['teeName'] ?? '',
        'teeColorName'=> $row['teeColorName'] ?? '',
        'rating'      => $row['rating'] !== null ? (float)$row['rating'] : null,
        'slope'       => $row['slope'] !== null ? (int)$row['slope'] : null,
        'par'         => $row['parcampo'] !== null ? (int)$row['parcampo'] : null,
        // Age-range bounds for senior/age-restricted categories. NULL when
        // the column is absent or the value is not configured.
        'ageMin'      => isset($row['age_range_min']) && $row['age_range_min'] !== null ? (int)$row['age_range_min'] : null,
        'ageMax'      => isset($row['age_range_max']) && $row['age_range_max'] !== null ? (int)$row['age_range_max'] : null,
    ];
}, $rows);

json_response($categories);
