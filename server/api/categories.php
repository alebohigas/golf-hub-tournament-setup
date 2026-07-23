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
               a.maxjugadores, a.hoyosxronda,
               a.Skin_grupo_id, a.Skeenporcent$ageMinSel$ageMaxSel,
               COUNT(b.id) as playerCount,
               /**
                * Conteo de PRE-REGISTROS realizados para esta categoría en
                * el torneo activo. Fuente: tabla `registro` (formulario
                * público de Pre-Registro). Se cuentan TODAS las filas de la
                * categoría/torneo salvo las des-registradas (status_pago=99)
                * — así, cuando el jugador ve "2/70 espacios disponibles",
                * el "2" refleja cuánta gente ya se anotó en pre-registro
                * (incluida lista de espera), no cuántos jugadores activos
                * hay en la tabla `jugadores`. Esto le permite ver cuántos
                * están adelante de él en la fila.
                */
               (SELECT COUNT(*) FROM registro r
                  WHERE r.reg_id_torneo = a.torneo_id
                    AND r.reg_categoria = a.categoria_id
                    AND (r.status_pago IS NULL OR r.status_pago <> 99)) AS registeredCount,
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
                 a.maxjugadores, a.hoyosxronda,
                 a.Skin_grupo_id, a.Skeenporcent$ageMinSel$ageMaxSel,
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
        /** Skin game grouping identifier (categorias.Skin_grupo_id).
         *  Categorías con el mismo Skin_grupo_id comparten bolsa de skins. */
        'skinGroupId' => isset($row['Skin_grupo_id']) ? (string)$row['Skin_grupo_id'] : '',
        /** Porcentaje de handicap aplicado específicamente para el Skin Game
         *  (categorias.Skeenporcent). Distinto de `percentage` regular. */
        'skinPercent' => isset($row['Skeenporcent']) ? (float)$row['Skeenporcent'] : 0,
    ];
}, $rows);

json_response($categories);
