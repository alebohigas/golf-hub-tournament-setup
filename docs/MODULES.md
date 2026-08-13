# Arquitectura modular

Este proyecto está dividido en **módulos**. Un módulo agrupa todo lo necesario
para que una funcionalidad exista: su página pública, su tab en `/admin`, sus
endpoints PHP, sus columnas JSON en `site_config` y sus migraciones.

La idea: **un solo código base** que sirve para varios torneos/clubes, donde cada
instalación decide qué módulos usa. Cuando un proyecto ya no va a cambiar de
opinión, se puede **podar** el código de los módulos apagados.

---

## 1. Fuente de verdad: `src/modules/registry.ts`

Cada módulo se declara con:

| Campo | Para qué sirve |
|---|---|
| `id` | Identificador estable. **Nunca renombrar**: se guarda en la base de datos. |
| `label`, `description`, `losesOnDisable` | Textos que se muestran en `/setup`. |
| `core` | `true` = nunca se puede apagar (núcleo). |
| `group` | Agrupación visual en `/setup`. |
| `pageIds` | Ids de página del menú (`menuConfig` en `src/data/mockData.ts`). |
| `routes` | Rutas de React Router del módulo. |
| `adminTabs` | Valores de `value=` de los tabs de `/admin`. |
| `staffAreas` | Áreas de permiso de staff relacionadas. |
| `siteConfigKeys` | Columnas JSON de `site_config` que usa. |
| `apiFiles`, `srcFiles`, `migrations` | Archivos propios (los borra el script de poda). |
| `dependsOn` | Otros módulos requeridos. |

**Regla de oro:** el núcleo nunca depende de un módulo opcional, y un módulo solo
puede usar otro si lo declara en `dependsOn`.

---

## 2. Estado en ejecución

```
site_config.modules_config (MySQL, JSON)
        │  GET /api/site_config.php
        ▼
useSiteConfig() → useSyncModules() en App.tsx
        ▼
moduleState.ts (singleton fuera de React)
        ├── PageVisibilityContext.isPageVisible()  → menú + ProtectedRoute
        ├── ModuleGate                             → rutas sin ProtectedRoute
        └── useModules()                           → /setup y tabs de /admin
```

Formato guardado (una entrada ausente = módulo **encendido**):

```json
{ "modules": { "skins": { "enabled": false, "lockedBy": "superadmin",
                          "updatedAt": "2026-08-13T10:00:00Z" } } }
```

Piezas:

- `src/modules/moduleState.ts` — singleton con los ids apagados. Vive fuera de
  React porque `PageVisibilityContext` se monta antes de que llegue la config.
- `src/modules/useModules.ts` — `useSyncModules`, `useModules`, `useModuleEnabled`.
- `src/components/modules/ModuleGate.tsx` — guardia para rutas que no pasan por
  `ProtectedRoute` (showcase, `/admin/registros`, `/admin/brackets`, …).
- `src/pages/Setup.tsx` — la página `/setup`.

**Precedencia:** *apagado en `/setup`* gana siempre sobre *visible en `/admin`*.
Un módulo apagado no aparece en el menú, su ruta responde como inexistente y su
tab de `/admin` no se monta, aunque la visibilidad diga lo contrario.

---

## 3. La página `/setup`

- Solo el **superadmin**. El backend (`site_config.php`) rechaza `modules_config`
  con cualquier otra credencial, así que un usuario de staff no puede reactivar
  nada, ni desde la UI ni llamando al endpoint.
- Apagar un módulo **no borra datos**: solo lo oculta. Se puede reactivar.
- Al apagar un módulo se apagan sus dependientes; al encenderlo se encienden sus
  requisitos.
- "Activar todo" limpia la configuración y deja el proyecto como recién instalado.

---

## 4. Base de datos

Columna `site_config.modules_config TEXT NULL`.

- Migración: `server/migrations/2026_08_13_add_modules_config_to_site_config.sql`.
- `site_config.php` **auto-crea** la columna en su primer uso, así que en IONOS
  normalmente no hace falta correr el SQL a mano.
- Sin `GRANT`: hosting compartido MySQL (ver memoria del proyecto).

---

## 5. Agregar un módulo nuevo

1. Escribe la página/componentes y el endpoint PHP como siempre.
2. Añade la entrada al catálogo en `src/modules/registry.ts` (todos los campos).
3. Registra la ruta en `src/App.tsx`:
   - si es página de menú → `<ProtectedRoute pageId="…">` (ya respeta módulos);
   - si no → envuélvela en `<ModuleGate moduleId="…">`.
4. Si tiene tab en `/admin`, agrega su `value` a `adminTabs`; el filtrado es
   automático (`visibleAdminTabs`).
5. Si usa una columna JSON nueva de `site_config`, decláralo en `siteConfigKeys`.

---

## 6. Poda (borrar el código de un módulo)

```bash
bun scripts/prune-modules.ts --list
bun scripts/prune-modules.ts --remove=skins,matchplay          # simulación
bun scripts/prune-modules.ts --remove=skins,matchplay --apply  # borra
bun scripts/prune-modules.ts --keep=convocatoria,resultados --apply
bunx tsgo --noEmit -p tsconfig.app.json
```

Borra los archivos del módulo, quita sus imports/rutas de `App.tsx`, sus
imports/tabs de `Admin.tsx` y su entrada del catálogo. Hazlo **en una rama** y
revisa el diff: los `TabsContent` de varias líneas y las entradas de `menuConfig`
pueden requerir un ajuste manual que el typecheck te señala.
