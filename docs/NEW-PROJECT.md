# Arrancar un proyecto nuevo (otro club / otro torneo)

Cada proyecto tiene **su propia base de datos MySQL** y su propio dominio, pero
comparte este código base. Ver `docs/MODULES.md` para la arquitectura modular.

## 1. Clonar y desplegar

1. Copia el repositorio a la nueva instalación.
2. `server/api/credentials.php` → credenciales MySQL del nuevo servidor
   (usa `credentials.example.php` como plantilla; nunca se sube al repo).
3. `bun install && bun run build` y sube `dist/` a la raíz del hosting y
   `server/api/` a `/api/` (ver la memoria de despliegue IONOS).
4. Entra a `/admin` con la contraseña de superadmin y fija el **torneoid** del
   dominio; ahí también se crean las cuentas de staff.

## 2. Elegir los módulos

1. Entra a **`/setup`** (o `/admin` → botón **Módulos**).
2. Apaga lo que este club no vaya a usar. Todo empieza encendido.
3. Ajusta después el menú y la visibilidad fina en `/admin → Página`.

Solo el superadmin puede volver a encender un módulo apagado.

## 3. Contenido inicial

- **Convocatoria / Reglas**: `/admin → Convocatoria` (o un seed SQL en
  `server/migrations/` siguiendo los ejemplos `seed_convocatoria_torneo*.sql`).
- **Imágenes y PDF**: `/admin → Archivos` (no hace falta FTP).
- **Heros**: `/admin → Heros`, por página y por torneo.
- **Patrocinadores, POP UP, Anuncio, Tema de color**: sus tabs en `/admin`.

## 4. Congelar el proyecto (opcional)

Cuando la selección de módulos ya es definitiva, borra el código sobrante:

```bash
git checkout -b prune-modules
bun scripts/prune-modules.ts --keep=<ids que sí usas> --apply
bunx tsgo --noEmit -p tsconfig.app.json
bun run build
```

Revisa el diff antes de subir. Si más adelante hace falta un módulo podado, se
recupera desde el proyecto original (este repo sigue siendo la referencia).
