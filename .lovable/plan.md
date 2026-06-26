## Objetivo
Crear un sistema de **staff temporal** en `/admin` que permita generar cuentas con usuario+contraseña, vigencia por rango de fechas, alcance al torneo activo, y permisos granulares por área (checkboxes). Estas cuentas reemplazan el password compartido `admin2025` para esas áreas específicas, sin tocar el resto del flujo admin existente.

## Base de datos

### Tabla `usuarios` (ya existe — la usamos tal cual)
| Columna | Uso en esta feature |
|---|---|
| `usuario` (varchar 15) | Username de login |
| `pwd` (varchar 100) | Password hash bcrypt (`password_hash` PHP) |
| `torneoid` (int) | Torneo activo donde se creó la cuenta |
| `tipo` (int) | Fijo en un valor reservado (ej. `99`) para identificar "staff temporal" y no chocar con `usutipo` legacy |
| `desde` / `hasta` (date) | Rango de vigencia — login rechazado fuera de él |
| `estatus` (varchar 10) | `'activo'` / `'inactivo'` (admin puede revocar) |
| `activo` (int) | 1/0 espejo de estatus |
| `nombre`, `correo_electronico` | Metadatos visibles en /admin |
| `ultent` (datetime) | Última entrada — se actualiza en cada login exitoso |

### Tabla nueva `usuario_areas`
```sql
CREATE TABLE usuario_areas (
  usuario_id INT NOT NULL,
  area VARCHAR(40) NOT NULL,
  PRIMARY KEY (usuario_id, area),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```
`area` ∈ catálogo fijo: `preregistros`, `brackets`, `banderas`, `pop`, `eventos`, `avisos`, `premios`, `hoteles`, `uploads`, `showcase_rotacion`.

## Backend (PHP)

1. **`server/api/staff_users.php`** — CRUD admin (protegido con `admin2025` como hoy):
   - `GET ?torneoid=` → lista cuentas del torneo con sus áreas.
   - `POST action=create` → crea usuario (hash bcrypt), inserta áreas, valida `desde<=hasta`, username único.
   - `POST action=update` → edita nombre/correo/fechas/estatus/áreas/(opcional reset password).
   - `POST action=delete` → soft delete (`activo=0`, `estatus='inactivo'`).
2. **`server/api/staff_login.php`** — login del staff:
   - Recibe `{usuario, pwd, torneoid}`.
   - Valida hash, `activo=1`, `CURDATE() BETWEEN desde AND hasta`, y `torneoid` coincide.
   - Devuelve token opaco (random 48 chars guardado en cookie httpOnly + tabla `usuario_sesion(id, usuario_id, token, expira)` con TTL = `hasta 23:59:59`).
   - Endpoint `GET staff_session.php` valida el token y devuelve `{usuario, nombre, areas[], torneoid, hasta}`.
3. **Endpoints existentes** (`brackets.php`, `banderas.php`, `uploads.php`, `registro_*`, `site_config.php`, `convocatoria_content.php`): agregar helper `assert_admin_or_area($area)` que acepta **o** `password=admin2025` **o** un cookie/token de staff válido cuyo `usuario_areas` incluya el `area` requerida. Mínimo cambio, máxima retrocompatibilidad.

## Frontend

### Nuevo en `/admin`
- Pestaña **"Usuarios"** (`AdminStaffUsers.tsx`) con:
  - Tabla de cuentas del torneo activo: usuario, nombre, vigencia, áreas (chips), estatus, última entrada.
  - Botón **Crear usuario** → dialog con: usuario, contraseña (autogen + copy), nombre, correo, `desde`/`hasta` (DatePicker), checkboxes de áreas.
  - Acciones por fila: editar, resetear password, activar/desactivar, eliminar.

### Login staff
- Página pública `/staff/login` con form (usuario + pwd). Al pasar, guarda token en cookie httpOnly + `localStorage` mínimo (areas/hasta) para gating de UI.
- Nuevo contexto `StaffAuthContext` con `isStaff`, `staffAreas[]`, `canAccess(area)`.
- Nuevo wrapper `StaffRoute` que permite paso a una ruta admin **si** `isAdmin` (legacy admin2025) **o** `canAccess(area)`.

### Rutas envueltas con `StaffRoute`
| Ruta | area |
|---|---|
| `/admin/registros` | `preregistros` |
| `/admin/brackets` | `brackets` |
| `/admin/showcase-rotacion` | `showcase_rotacion` |
| `/admin` (vista filtrada — solo verán los tabs cuyas áreas tengan permiso) | varios |

Dentro de `/admin`, si el usuario es **staff y no admin global**, ocultamos pestañas a las que no tiene acceso y bloqueamos las demás vistas. Si es admin global (`admin2025`), todo sigue funcionando igual.

## Seguridad
- Password se guarda con `password_hash($pwd, PASSWORD_BCRYPT)`; login valida con `password_verify`.
- Token de sesión 48 chars aleatorio (`random_bytes(32) → hex`), cookie `HttpOnly; Secure; SameSite=Lax`, expira al final del día `hasta`.
- Server siempre re-valida vigencia y estatus en cada request — el token caduco se rechaza aunque la cookie siga.
- `usuario_areas` solo se lee server-side al validar; el cliente no puede falsificar áreas.

## Archivos a crear / tocar
**Crear**
- `server/migrations/2026_06_26_staff_users.sql` (tabla `usuario_areas` + `usuario_sesion`).
- `server/api/staff_users.php`, `server/api/staff_login.php`, `server/api/staff_session.php`.
- `server/api/_staff_auth.php` (helper `assert_admin_or_area`).
- `src/components/admin/AdminStaffUsers.tsx`.
- `src/contexts/StaffAuthContext.tsx`.
- `src/components/auth/StaffRoute.tsx`.
- `src/pages/StaffLogin.tsx`.
- `src/hooks/useStaffUsers.ts`.

**Modificar**
- `src/pages/Admin.tsx` (nueva tab + gating por área para staff).
- `src/App.tsx` (provider + ruta `/staff/login` + envolver rutas `/admin/*` con `StaffRoute`).
- `server/api/brackets.php`, `banderas.php`, `uploads.php` (aceptar token staff).

## Fuera de alcance (no se toca)
- Tabla `usutipo` legacy — la dejamos en paz; usamos `tipo=99` reservado.
- Password admin global `admin2025` sigue funcionando para retrocompatibilidad de todo lo demás.
- Eventos/Avisos/Premios/etc se exponen al staff vía las mismas pestañas de /admin filtradas — no se duplican páginas.

¿Apruebas para implementar?