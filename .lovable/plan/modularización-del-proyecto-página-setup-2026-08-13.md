# Modularización del proyecto + página `/setup`

Objetivo: convertir este proyecto en una base reutilizable para otros torneos de golf (cada uno con su **propia base de datos**), donde cada funcionalidad es un **módulo** que se puede apagar desde una página de configuración sin romper el resto, y donde solo el superadmin puede volver a encenderlo.

## 1. Catálogo de módulos

Cada módulo agrupa: su(s) página(s) pública(s), su tab de `/admin`, sus endpoints PHP y sus migraciones SQL.

**Núcleo (nunca se apaga):** layout (header/footer/menús), visibilidad de páginas, staff/superadmin, `site_config`, `torneoid` por dominio, tema/paleta, Archivos (uploads), Heros, Home.

**Módulos opcionales:**

| Módulo | Páginas | Admin |
|---|---|---|
| convocatoria | /convocatoria | Convocatoria |
| jugadores | /jugadores | — |
| salidas | /salidas, /horarios | — |
| resultados | /resultados | — |
| historial | /historial | Historial |
| live | /live, /live-scoring | LIVE |
| competicion | /competicion | — |
| matchplay | /matchplay, /admin/brackets | Match Play, Brackets |
| skins | /skingame, /skinrules, /skinplayers, /skinscorecards | — |
| stats | /stats | Estadísticas, Página de stats |
| registro | /registro, /admin/registros, /registro/comprobante | Registro (campos, categorías, precios, preferente, socios), Registros |
| posters | /eventos, /avisos, /menus, /premios, /hoteles | Eventos, Avisos, Menús, Premios, Hoteles |
| calendario | /calendario | — |
| banderas | /banderas | Banderas |
| reglas | /reglas | — |
| patrocinadores | /patrocinadores | Patrocinadores |
| showcase | /showcase/* | Showcase 300 |
| avisos-sitio | — | POP UP, Anuncio |

## 2. Registro de módulos en código

- `src/modules/registry.ts`: un objeto por módulo con `id`, `label`, `descripcion`, `core: boolean`, `routes[]` (con carga diferida), `adminTabs[]`, `apiFiles[]`, `migrations[]`, `siteConfigKeys[]`.
- `src/modules/useModules.ts`: hook que devuelve qué módulos están activos (lee la configuración del servidor, con caché).
- `App.tsx` deja de listar rutas a mano: las genera desde el registro, filtrando módulos apagados. Una ruta de módulo apagado responde 404 igual que cualquier ruta inexistente.
- `Admin.tsx` deja de listar tabs a mano: las genera desde el registro. Un módulo apagado no aparece, y su panel no se monta (así no dispara llamadas a endpoints que quizá no existan en ese servidor).
- Los enlaces del menú y las tarjetas del Home filtran también por módulo activo, además de la visibilidad actual.

## 3. Página `/setup`

- Ruta nueva `/setup`, accesible **solo para el superadmin** (misma sesión que `/admin`).
- Lista los módulos agrupados por área, con: interruptor, descripción, y aviso de lo que se pierde al apagarlo.
- Estado de cada módulo: `activo` / `apagado`.
- **Candado:** apagar es reversible solo por superadmin. Si un staff con permiso apaga un módulo, queda `apagado` y el interruptor se muestra bloqueado con candado para todos menos el superadmin.
- Modo "primer arranque": si la base no tiene configuración de módulos, `/setup` muestra un asistente de selección inicial (todo activo por defecto, se destildan los que no se usarán).
- Aviso claro: apagar un módulo **no** borra datos, solo lo oculta; el borrado de código es un paso aparte (sección 6).

## 4. Persistencia

- Nueva columna `modules_config` (TEXT/JSON) en `site_config`, con auto-reparación en `site_config.php` como ya se hace con `hero_config`.
- Formato: `{ "modules": { "skins": { "enabled": false, "lockedBy": "superadmin", "updatedAt": "..." } } }`.
- Migración SQL en `server/migrations/` + endpoint `server/api/modules_config.php` (lectura pública mínima: solo la lista de módulos activos; escritura solo con credencial de superadmin).
- Al ser por base de datos, cada proyecto clonado arranca con su propia selección.

## 5. Aislamiento verificable

- `scripts/check-modules.ts`: falla si algún archivo del núcleo importa un archivo de módulo, o si un módulo importa a otro sin declararlo como dependencia en el registro.
- Resiliencia del backend: los endpoints de un módulo ausente devuelven JSON vacío en lugar de 500 (patrón ya usado en el proyecto), para que un clon sin esas tablas no muestre errores.

## 6. Poda para proyectos nuevos

- `scripts/prune-modules.ts --keep=convocatoria,registro,...`: borra páginas, componentes de admin, hooks, endpoints PHP y migraciones de los módulos no conservados, limpia el registro y corre el build para confirmar que queda sano.
- Se ejecuta una sola vez en el clon, cuando ya se sabe qué se queda.

## 7. Documentación

- `docs/MODULES.md`: catálogo completo — qué hace cada módulo, qué páginas y tabs trae, qué endpoints y tablas/columnas necesita, dependencias, y qué se pierde al apagarlo.
- `docs/ARCHITECTURE.md`: núcleo vs. módulos, flujo de `torneoid` por dominio, `site_config`, auth staff/superadmin, proxies de logos.
- `docs/NEW-PROJECT.md`: receta paso a paso para un torneo nuevo (base de datos, dominio, `torneoid`, `/setup`, poda, despliegue).
- `docs/DEPLOY-IONOS.md`: qué sube a la raíz, qué va en `/api/`, `.htaccess`, permisos de `uploads/`.
- `README.md` reescrito (hoy es la plantilla por defecto) apuntando a los cuatro documentos anteriores.

## Orden de trabajo

1. Documentación + catálogo de módulos (sin tocar código de ejecución).
2. Registro de módulos y generación de rutas y tabs desde él.
3. Columna `modules_config`, endpoint y hook.
4. Página `/setup` con candado de superadmin.
5. Script de validación de aislamiento.
6. Script de poda.

## Notas técnicas

- Las rutas de módulo usan `React.lazy`, así el código de un módulo apagado ni se descarga.
- Nada de esto cambia el aspecto visual de las páginas existentes.
- La visibilidad actual de `/admin` sigue funcionando igual; los módulos son una capa superior: apagado en `/setup` gana siempre sobre visible en `/admin`.
