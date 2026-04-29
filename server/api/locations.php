<?php
/**
 * Locations Endpoint (cascading dropdowns)
 * -----------------------------------------------------------------------
 * GET /api/locations.php?kind=countries
 * GET /api/locations.php?kind=states&country_id=NN
 * GET /api/locations.php?kind=cities&state_id=NN
 *
 * Backed by tables: countries(id, name), states(id, id_country, name),
 *                   cities(id, id_state, name).
 *
 * If a table is missing we return an empty list rather than 500 so the
 * /registro form degrades gracefully into a free text field.
 */
require_once 'config.php';

/** Simple table existence check (cached). */
function table_exists($conn, $name) {
    static $cache = [];
    if (isset($cache[$name])) return $cache[$name];
    $safe = $conn->real_escape_string($name);
    $r = $conn->query("SHOW TABLES LIKE '$safe'");
    return $cache[$name] = ($r && $r->num_rows > 0);
}

$kind = require_param('kind');

switch ($kind) {
    case 'countries':
        if (!table_exists($conn, 'countries')) json_response([]);
        json_response(query_all($conn, "SELECT id, name FROM countries ORDER BY name ASC"));

    case 'states':
        if (!table_exists($conn, 'states')) json_response([]);
        $cid = (int) require_param('country_id');
        json_response(query_all($conn, "SELECT id, name FROM states WHERE id_country = $cid ORDER BY name ASC"));

    case 'cities':
        if (!table_exists($conn, 'cities')) json_response([]);
        $sid = (int) require_param('state_id');
        json_response(query_all($conn, "SELECT id, name FROM cities WHERE id_state = $sid ORDER BY name ASC"));

    default:
        json_error('Unknown kind. Use countries|states|cities.', 400);
}