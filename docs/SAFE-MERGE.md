# Verificación previa al merge (`scripts/safe-merge.sh`)

Evita el error clásico de Git:

```
error: Your local changes to the following files would be overwritten by merge:
        package.json
Aborting
```

## Qué hace

1. Detecta cambios locales, con foco en los archivos que más chocan:
   `package.json`, `package-lock.json`, `bun.lockb`, `.env`.
2. Si hay cambios, ofrece **stash** o **commit** automático (o modo no interactivo).
3. Hace `git fetch` + `git merge`.
4. Si stasheó, hace `git stash pop` al final y avisa si hay conflictos.

## Uso

```bash
bash scripts/safe-merge.sh                 # interactivo, usa el upstream actual
bash scripts/safe-merge.sh origin/main     # rama específica
bash scripts/safe-merge.sh --check         # solo verifica y sale con error si está sucio
bash scripts/safe-merge.sh --stash         # stashea sin preguntar
bash scripts/safe-merge.sh --commit        # commitea sin preguntar
```

## Notas

- El script no borra nada: si el `stash pop` falla, tus cambios siguen en `git stash list`.
- Ejecútalo desde la raíz del repo, en tu entorno local (no dentro del editor de Lovable).
