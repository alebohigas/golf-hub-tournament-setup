# PHP JSON API Wrappers

## Descripción
Endpoints PHP que devuelven JSON puro para ser consumidos por el frontend React.
Listos para subir a IONOS en la carpeta `/api/` del servidor.

## Configuración
1. Editar `config.php` con las credenciales de MySQL de IONOS
2. Subir toda la carpeta `api/` al servidor IONOS
3. Actualizar `src/config/api.ts` en el frontend para apuntar a los nuevos endpoints

## Endpoints Disponibles

### Core
| Endpoint | Parámetros | Descripción |
|----------|-----------|-------------|
| `health.php` | - | Health check |
| `menu.php` | `torneoid` | Configuración del menú |
| `sponsors.php` | `torneoid` | Patrocinadores |
| `tournament.php` | `torneoid` | Info del torneo + estadísticas |
| `categories.php` | `torneoid` | Categorías activas |
| `players.php` | `catid` | Jugadores por categoría |
| `calendario.php` | `torneoid` | Días de juego y horarios |

### Resultados
| Endpoint | Parámetros | Descripción |
|----------|-----------|-------------|
| `resultados.php` | `torneoid` | Master: lista de categorías (Stroke/Match Play) |
| `resultados_jug.php` | `catid`, `torneoid`, `gross` | Resultados individuales (Stroke/Stableford, Neto/Gross) |
| `resultados_parejas.php` | `catid`, `torneoid`, `gross` | Resultados por parejas |
| `resultados_parciales.php` | `catid`, `torneoid`, `gross` | Resultados parciales (oculta días sin jugar) |
| `resultados_tarjeta.php` | `jugadorid`, `categoriaid`, `fecha`, `tipo` | Tarjeta hoyo-por-hoyo del jugador |
| `resultados_ed.php` | `catid`, `torneoid` | Eliminación Directa (brackets) |

### Salidas (Tee Times)
| Endpoint | Parámetros | Descripción |
|----------|-----------|-------------|
| `salidas.php` | `torneoid` | Master: días con categorías |
| `salidas_det.php` | `caljgoid`, `formato` | Detalle: grupos con jugadores |

### Premios Laterales
| Endpoint | Parámetros | Descripción |
|----------|-----------|-------------|
| `oyes.php` | `torneoid`, `modo` | O'Yes (Approach) - general/grupos/hoyo |
| `oyesx.php` | `torneoid`, `tipo` | O'Yes-X (Driver, Precisión, etc.) |
| `putt.php` | `torneoid` | Putt competition |
| `skin_game.php` | `torneoid`, `gpoid`, `fecha`, `tipo` | Skin Game (Gross/Neto) |

### Live Scoring
| Endpoint | Parámetros | Descripción |
|----------|-----------|-------------|
| `live_scoring.php` | `catid`, `torneoid`, `tipo`, `gross` | Leaderboard en tiempo real |
| `live_tarjeta.php` | `jugadorid`, `categoriaid`, `tipo` | Tarjeta live (reemplaza XML) |

## Funciones MySQL Requeridas
Los endpoints dependen de estas funciones MySQL que ya existen en la BD:
- `f_torneosax()`, `f_torneosox()`, `f_torneosa()` - Totales de torneo
- `f_score_dia_sax()`, `f_score_dia_sox()` - Score por día
- `f_stl_gross()` - Stableford Gross
- `f_ultact()`, `f_ultfechaoyesx()`, `f_ultfechaputt()` - Última actualización
- `f_mingross()` - Mínimo gross (Skin Game)
- `f_getventajajug()` - Ventajas por jugador (Parejas)
- `f_logo()` - Logo del club

## Vistas MySQL Requeridas
- `v_jugadores`, `v_jugadores_parejas` - Jugadores activos
- `v_sal_jug`, `v_sal_jug_par` - Salidas con jugadores
- `v_cd_ulttar_sa`, `result_ult_tar` - Último tarjeta/desempate
- `v_oyesunicas`, `v_oyesunicasxoyo`, `v_oyes` - O'Yes
- `v_oyesx` - O'Yes X
- `v_putt`, `v_puttunico` - Putt
- `v_ult_tarjeta0` - Última tarjeta activa
- `v_equipo_ed` - Eliminación Directa
- `v_campeon_gross_stoke`, `v_campeon_gross` - Campeón Gross

## Job de normalización de mojibake (BD)

`mojibake_normalize.php` corrige el mojibake **en la base de datos**, no solo en la
respuesta JSON (`fix_mojibake()` de `config.php`).

Dry-run (no escribe nada):

```bash
php server/api/mojibake_normalize.php --dry-run
```

Aplicar correcciones:

```bash
php server/api/mojibake_normalize.php --apply
php server/api/mojibake_normalize.php --apply --tables=convocatoria_content,torneos
```

Sin acceso CLI (IONOS), vía HTTP con contraseña de superadmin:

```bash
curl -X POST https://cs.speitour.com/api/mojibake_normalize.php \
  -H 'Content-Type: application/json' \
  -d '{"password":"***","apply":false}'
```

Recomendación: correr primero en dry-run, revisar `details[].samples`
(`before` → `after`) y luego repetir con `apply: true`.
