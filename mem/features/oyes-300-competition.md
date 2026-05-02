---
name: O'Yes 300 competition
description: Premio "O'Yes 300" — competencia separada de O'Yes regular, ganadores absolutos por hoyo sin filtro de categoría
type: feature
---
# O'Yes 300

Tipo de premio en /competencias, INDEPENDIENTE de O'Yes regular,
Driver Distancia, Driver Precisión, Approach, Putt.

## Diferencia clave vs O'Yes regular
- **O'Yes regular** (`oyes`): usa `premios` + `premiosjug`, filtra ganadores por `categoriaid` (cada categoría tiene sus ganadores).
- **O'Yes 300** (`oyes300`): usa `oyesx` + `oyesxjug`, ganadores ABSOLUTOS por hoyo sin filtrar por categoría. N ganadores permitidos por hoyo.

## Tablas
- Catálogo de premios: `oyesx` (campos clave: `premio`, `descripcion`, `hoyo` = lugares, `torneoid`)
- Resultados de jugadores: `oyesxjug` (campos clave: `jugadorid`, `premio`, `distancia`, `hoyo`, `orden`, `torneoid`)
- Vista de ganadores: `v_oyesx` (marca el mejor por jugador/premio)
- Función fecha actualización: `f_ultfechaoyesx(descripcion, torneoid)`

## Coexistencia con `/api/oyesx.php`
`oyesx.php` usa las MISMAS tablas pero filtra por `descripcion LIKE '%driver%' / '%precision%' / '%approach%'` para Driver Distancia / Driver Precisión / Approach.

Para no chocar, la sección O'Yes 300 en `competencias.php` aplica filtro inverso:
```sql
AND LOWER(descripcion) NOT LIKE '%driver%'
AND LOWER(descripcion) NOT LIKE '%precision%'
AND LOWER(descripcion) NOT LIKE '%approach%'
```

## Lógica de ganadores
1. UPDATE `oyesxjug.orden = 0` para el torneo.
2. UPDATE `oyesxjug.orden = 1` JOIN `v_oyesx` (marca mejores por jugador+premio).
3. SELECT JOIN jugadores+clubs WHERE `orden=1`, ORDER BY `distancia ASC`, LIMIT = `oyesx.hoyo` (lugares) o `torneo.oyesnumprem`.
4. **NO** se hace JOIN con `premios` por `categoriaid` (esa es la diferencia con O'Yes regular).

## Identificadores
- Endpoint: `GET /api/competencias.php?tipo=oyes300&detalle=1`
- Competition `id`: `oyes300`
- Group `id`: `oyes300-{premioId}`
- Icon: `target`, order: 8
- Columnas: Pos / Club / Jugador / Ho (hoyo) / Dist

## Archivos involucrados
- `server/api/competencias.php` — sección `if ($tipo === '' || $tipo === 'oyes300')` + helpers `get_oyes300_players()` y `get_oyes300_last_updated()`.
- Frontend usa `useCompetenciaDetail('oyes300')` automáticamente — el split por '-' en `Competencias.tsx` (línea ~140) extrae `oyes300` como base.

## NO TOCAR
- `server/api/oyes.php` (O'Yes regular)
- `server/api/oyesx.php` (Driver/Approach variants)
- Lógica existente de O'Yes regular en `competencias.php`