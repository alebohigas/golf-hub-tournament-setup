<?php
/**
 * Caljuego Estilo Endpoint
 * GET /api/caljuego_estilo.php?catid=XXX&fecha=YYYY-MM-DD
 *
 * Devuelve el `estilojuego` (Personal | Go Go | Bola Baja | Suma Scores) +
 * el `formato` (INDIVIDUAL | PAREJAS) y el `campo` configurado para una
 * categoría en una fecha específica. El frontend lo usa antes de pedir la
 * tarjeta detallada para decidir qué layout renderizar (la categoría puede
 * tener estilos distintos por día).
 */
require_once 'config.php';

$catid = require_param('catid');
$fecha = require_param('fecha');
$cid = esc($conn, $catid);
$fec = esc($conn, $fecha);

/** Categoría: formato general (INDIVIDUAL / PAREJAS) */
$catInfo = query_one($conn, "SELECT formato FROM categorias WHERE categoria_id = $cid LIMIT 1");
if (!$catInfo) { json_error('Category not found', 404); }

/** caljuego: estilojuego y campo para esa fecha+categoría */
$row = query_one($conn,
    "SELECT estilojuego, campo FROM caljuego
     WHERE categoriaid = $cid AND fecha = '$fec'
     LIMIT 1");

$estilo = $row['estilojuego'] ?? 'Personal';
$campo  = isset($row['campo']) ? (int)$row['campo'] : 0;

json_response([
    'estilojuego' => $estilo,
    'formato'     => $catInfo['formato'],
    'campo'       => $campo,
    /** isParejas: true cuando la categoría es de parejas Y el día tiene campo asignado (>0). */
    'isParejas'   => (strtoupper($catInfo['formato']) === 'PAREJAS' && $campo > 0),
]);