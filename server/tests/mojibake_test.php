<?php
/**
 * mojibake_test.php
 * ---------------------------------------------------------------------
 * Prueba unitaria (sin base de datos) de fix_mojibake() / fix_mojibake_deep()
 * definidas en server/api/config.php.
 *
 * Ejecutar:
 *   php server/tests/mojibake_test.php
 *
 * Salida: una línea por caso (PASS/FAIL) y exit code 1 si algo falla,
 * para poder usarla en CI antes de subir la API por SFTP.
 *
 * No se hace `require config.php` (abriría conexión MySQL y enviaría
 * headers); en su lugar se extrae el bloque de funciones del archivo real,
 * de modo que la prueba valida SIEMPRE el código que se despliega.
 */

// ---------- Carga de las funciones desde el config.php real ----------
$configPath = __DIR__ . '/../api/config.php';
$src = file_get_contents($configPath);
if ($src === false) {
    fwrite(STDERR, "No se pudo leer $configPath\n");
    exit(1);
}
$start = strpos($src, 'function fix_mojibake(');
$end   = strpos($src, 'function json_response(');
if ($start === false || $end === false || $end <= $start) {
    fwrite(STDERR, "No se encontraron fix_mojibake()/json_response() en config.php\n");
    exit(1);
}
eval(substr($src, $start, $end - $start));

// ---------- Utilidades de aserción ----------
$failures = 0;

/**
 * Compara valor obtenido vs esperado e imprime el resultado.
 * @param string $name     Nombre del caso
 * @param mixed  $actual   Valor devuelto
 * @param mixed  $expected Valor esperado
 */
function check(string $name, $actual, $expected): void {
    global $failures;
    if ($actual === $expected) {
        echo "PASS  $name\n";
        return;
    }
    $failures++;
    echo "FAIL  $name\n";
    echo "      esperado: " . json_encode($expected, JSON_UNESCAPED_UNICODE) . "\n";
    echo "      obtenido: " . json_encode($actual,   JSON_UNESCAPED_UNICODE) . "\n";
}

// ---------- Casos: mojibake típico del español ----------
$cases = [
    // [nombre, entrada mojibake, salida esperada]
    ['podrán',        "podr\xC3\x83\xC2\xA1n",                 'podrán'],
    ['Edición',       "Edici\xC3\x83\xC2\xB3n",                'Edición'],
    ['año',           "a\xC3\x83\xC2\xB1o",                    'año'],
    ['categoría',     "categor\xC3\x83\xC2\xADa",              'categoría'],
    ['Ningún',        "Ning\xC3\x83\xC2\xBAn",                 'Ningún'],
    ['jugará (frase)', "El jugador jugar\xC3\x83\xC2\xA1 con hÃƒÂ¡ndicap", 'El jugador jugará con hándicap'],
];
foreach ($cases as [$name, $in, $out]) {
    check("fix_mojibake: $name", fix_mojibake($in), $out);
}

// ---------- Casos: texto ya correcto NO debe alterarse ----------
$idempotent = ['podrán', 'Edición 71', 'año', 'CLUB CAMPESTRE SALTILLO', 'Señor Ñandú', ''];
foreach ($idempotent as $text) {
    check("idempotente: " . ($text === '' ? '(vacío)' : $text), fix_mojibake($text), $text);
}

// ---------- Caso: doble aplicación es estable ----------
check(
    'doble aplicación estable',
    fix_mojibake(fix_mojibake("podr\xC3\x83\xC2\xA1n")),
    'podrán'
);

// ---------- Casos: tipos no string se devuelven intactos ----------
check('int intacto',   fix_mojibake(123),  123);
check('null intacto',  fix_mojibake(null), null);

// ---------- Casos: recursión profunda (payload tipo convocatoria) ----------
$payload = [
    'sections' => [
        [
            'section_id' => 'elegibilidad',
            'content' => [
                'eligibilityText' => "Se jugar\xC3\x83\xC2\xA1 con el handicap \xC3\x83\xC2\xADndice GHIN",
                'notesText' => [
                    "Ning\xC3\x83\xC2\xBAn jugador podr\xC3\x83\xC2\xA1 participar en m\xC3\x83\xC2\xA1s de una categor\xC3\x83\xC2\xADa.",
                    'Texto ya correcto: año 2026',
                ],
                'enabled' => true,
                'sort_order' => 2,
            ],
        ],
    ],
];
$fixed = fix_mojibake_deep($payload);
check(
    'deep: eligibilityText',
    $fixed['sections'][0]['content']['eligibilityText'],
    'Se jugará con el handicap índice GHIN'
);
check(
    'deep: notesText[0]',
    $fixed['sections'][0]['content']['notesText'][0],
    'Ningún jugador podrá participar en más de una categoría.'
);
check('deep: notesText[1] intacto', $fixed['sections'][0]['content']['notesText'][1], 'Texto ya correcto: año 2026');
check('deep: bool preservado', $fixed['sections'][0]['content']['enabled'], true);
check('deep: int preservado',  $fixed['sections'][0]['content']['sort_order'], 2);

// ---------- Caso: claves mojibake también se reparan ----------
$keyed = fix_mojibake_deep(["categor\xC3\x83\xC2\xADa" => 'A']);
check('deep: clave reparada', array_key_first($keyed), 'categoría');

// ---------- Resultado ----------
echo "\n" . ($failures === 0
    ? "OK: todos los casos pasaron\n"
    : "ERROR: $failures caso(s) fallaron\n");
exit($failures === 0 ? 0 : 1);
