<?php
/**
 * index.php — SPA shell con overrides de meta tags por host.
 *
 * WhatsApp / Facebook / Twitter / LinkedIn NO ejecutan JS al scrapear,
 * así que react-helmet no sirve para el preview de links. Este shim
 * sirve el mismo `index.html` de la SPA pero sustituye <title>, la
 * meta description y todos los `og:*` / `twitter:*` según el Host que
 * el visitante está pidiendo.
 *
 * Añadir un torneo/subdominio nuevo = agregar una entrada al mapa
 * `$HOST_OVERRIDES` de abajo. Si el host no está en el mapa se sirve
 * el `index.html` original sin cambios.
 */

// ============= Overrides por host =============
/**
 * Mapa host → overrides.
 * Claves soportadas: title, description, image (URL absoluta https).
 * `image` se aplica tanto a og:image como a twitter:image.
 */
$HOST_OVERRIDES = [
    'atlascc.speitour.mx' => [
        'title'       => 'Torneo Anual de Golf',
        'description' => 'El torneo de golf amateur más importante de México. Inscríbete y compite.',
        // Imagen dedicada 1200x630 para preview de WhatsApp/Facebook/Twitter.
        // Servida estáticamente desde /og-atlas354.jpg (public/og-atlas354.jpg).
        'image'       => 'https://atlascc.speitour.mx/og-atlas354.jpg?v=4',
    ],
];

// ============= Servir index.html =============
$html = @file_get_contents(__DIR__ . '/index.html');
if ($html === false) {
    http_response_code(500);
    echo 'index.html not found';
    exit;
}

$host = strtolower($_SERVER['HTTP_HOST'] ?? '');
// Normaliza: strip puerto si lo hubiera
$host = preg_replace('/:\d+$/', '', $host);

$ov = $HOST_OVERRIDES[$host] ?? null;

if ($ov) {
    $title = htmlspecialchars($ov['title']       ?? '', ENT_QUOTES, 'UTF-8');
    $desc  = htmlspecialchars($ov['description'] ?? '', ENT_QUOTES, 'UTF-8');
    $img   = htmlspecialchars($ov['image']       ?? '', ENT_QUOTES, 'UTF-8');

    if ($title !== '') {
        $html = preg_replace('#<title>.*?</title>#is', '<title>' . $title . '</title>', $html, 1);
        $html = preg_replace(
            '#<meta\s+property="og:title"[^>]*>#i',
            '<meta property="og:title" content="' . $title . '" />',
            $html
        );
        $html = preg_replace(
            '#<meta\s+name="twitter:title"[^>]*>#i',
            '<meta name="twitter:title" content="' . $title . '" />',
            $html
        );
    }
    if ($desc !== '') {
        $html = preg_replace(
            '#<meta\s+name="description"[^>]*>#i',
            '<meta name="description" content="' . $desc . '" />',
            $html
        );
        $html = preg_replace(
            '#<meta\s+property="og:description"[^>]*>#i',
            '<meta property="og:description" content="' . $desc . '" />',
            $html
        );
        $html = preg_replace(
            '#<meta\s+name="twitter:description"[^>]*>#i',
            '<meta name="twitter:description" content="' . $desc . '" />',
            $html
        );
    }
    if ($img !== '') {
        $html = preg_replace(
            '#<meta\s+property="og:image"[^>]*>#i',
            '<meta property="og:image" content="' . $img . '" />',
            $html
        );
        $html = preg_replace(
            '#<meta\s+name="twitter:image"[^>]*>#i',
            '<meta name="twitter:image" content="' . $img . '" />',
            $html
        );
    }
}

header('Content-Type: text/html; charset=utf-8');
// Que los scrapers no cacheen agresivamente para poder iterar
header('Cache-Control: public, max-age=300');
echo $html;