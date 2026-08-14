#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# safe-merge.sh — Verificación previa al merge/pull
#
# Objetivo:
#   Evitar el error de Git "Your local changes to the following files would be
#   overwritten by merge: package.json" detectando cambios locales ANTES de
#   hacer el merge, y ofreciendo guardarlos (commit) o stashearlos automática-
#   mente.
#
# Uso:
#   bash scripts/safe-merge.sh                 # merge del upstream actual (interactivo)
#   bash scripts/safe-merge.sh origin/main     # merge de una rama concreta
#   bash scripts/safe-merge.sh --check         # solo verifica, no hace merge
#   bash scripts/safe-merge.sh --stash         # stashea automáticamente (no pregunta)
#   bash scripts/safe-merge.sh --commit        # commitea automáticamente (no pregunta)
#
# Archivos vigilados (los que más chocan en este proyecto):
#   package.json, package-lock.json, bun.lockb, .env
# ---------------------------------------------------------------------------

set -euo pipefail

# --- Configuración -------------------------------------------------------
# WATCHED: rutas que provocan aborts de merge con más frecuencia.
WATCHED=("package.json" "package-lock.json" "bun.lockb" ".env")

MODE="ask"      # ask | stash | commit | check
TARGET=""       # rama/ref a mergear (vacío = upstream configurado)

# --- Parseo de argumentos ------------------------------------------------
for arg in "$@"; do
  case "$arg" in
    --check)  MODE="check" ;;
    --stash)  MODE="stash" ;;
    --commit) MODE="commit" ;;
    -h|--help) sed -n '2,25p' "$0"; exit 0 ;;
    *) TARGET="$arg" ;;
  esac
done

# --- Utilidades ----------------------------------------------------------
# log: imprime un mensaje con prefijo para distinguirlo de la salida de git.
log() { printf '\033[1;32m[safe-merge]\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m[safe-merge]\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31m[safe-merge]\033[0m %s\n' "$1" >&2; exit 1; }

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "No estás en un repositorio Git."

# --- 1. Detección de cambios locales ------------------------------------
# dirty_all: todos los archivos modificados/staged/sin trackear.
dirty_all="$(git status --porcelain)"

# dirty_watched: solo los archivos de la lista WATCHED que están sucios.
dirty_watched=()
for f in "${WATCHED[@]}"; do
  if [ -n "$(git status --porcelain -- "$f")" ]; then
    dirty_watched+=("$f")
  fi
done

if [ ${#dirty_watched[@]} -eq 0 ] && [ -z "$dirty_all" ]; then
  log "Árbol limpio, no hay riesgo de sobrescritura."
else
  if [ ${#dirty_watched[@]} -gt 0 ]; then
    warn "Cambios locales en archivos críticos: ${dirty_watched[*]}"
  else
    warn "Hay cambios locales (no críticos) en el árbol de trabajo."
  fi
  git status --short

  # --- 2. Resolución: preguntar o aplicar el modo elegido ---------------
  if [ "$MODE" = "check" ]; then
    fail "Resuelve los cambios antes de mergear (usa --stash o --commit)."
  fi

  if [ "$MODE" = "ask" ]; then
    printf '¿Qué hago? [s]tash / [c]ommit / [a]bortar: '
    read -r answer
    case "$answer" in
      s|S) MODE="stash" ;;
      c|C) MODE="commit" ;;
      *)   fail "Abortado por el usuario." ;;
    esac
  fi

  STAMP="$(date +%Y-%m-%d_%H:%M:%S)"
  if [ "$MODE" = "stash" ]; then
    log "Stasheando cambios (incluye archivos sin trackear)…"
    git stash push -u -m "safe-merge $STAMP"
    STASHED=1
  else
    log "Commiteando cambios locales…"
    git add -A
    git commit -m "chore: guardar cambios locales antes del merge ($STAMP)"
    STASHED=0
  fi
fi

# --- 3. Merge ------------------------------------------------------------
if [ -z "$TARGET" ]; then
  TARGET="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)"
  [ -n "$TARGET" ] || fail "No hay upstream configurado; pasa la rama: scripts/safe-merge.sh origin/main"
  log "Actualizando referencias remotas…"
  git fetch --all --prune
fi

log "Mergeando $TARGET…"
if git merge "$TARGET"; then
  log "Merge completado."
else
  warn "El merge dejó conflictos; resuélvelos y luego 'git merge --continue'."
fi

# --- 4. Restaurar stash (si aplica) -------------------------------------
if [ "${STASHED:-}" = "1" ]; then
  log "Restaurando tu stash…"
  if git stash pop; then
    log "Cambios locales restaurados."
  else
    warn "Conflicto al restaurar el stash. Tus cambios siguen en 'git stash list'."
  fi
fi

log "Listo."
