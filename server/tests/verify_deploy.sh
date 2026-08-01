#!/usr/bin/env bash
# ---------------------------------------------------------------------
# verify_deploy.sh
# Verifica que el server/api/ desplegado (IONOS, subida manual por SFTP)
# incluya el config.php con fix_mojibake y que los acentos españoles
# se sirvan correctamente ("podrÃ¡n" -> "podrán").
#
# Uso:
#   bash server/tests/verify_deploy.sh https://cs.speitour.com 361
#
# Exit code 0 = despliegue correcto; 1 = falta subir server/api/.
# ---------------------------------------------------------------------
set -uo pipefail
BASE="${1:-https://cs.speitour.com}"
TORNEO="${2:-361}"
fail=0

echo "== 1) health.php (marcadores de despliegue) =="
health=$(curl -sS "$BASE/api/health.php")
echo "$health"
echo "$health" | grep -q '"mojibake_fix":"active"' \
  && echo "OK  fix_mojibake activo en el servidor" \
  || { echo "FAIL  fix_mojibake NO activo -> sube server/api/config.php"; fail=1; }
echo "$health" | grep -q '"db_charset":"utf8mb4' \
  && echo "OK  conexión en utf8mb4" \
  || { echo "WARN  la conexión no reporta utf8mb4"; }

echo
echo "== 2) Contenido real de la convocatoria (torneoid=$TORNEO) =="
body=$(curl -sS "$BASE/api/convocatoria_content.php?torneoid=$TORNEO")
if echo "$body" | grep -q 'Ã'; then
  echo "FAIL  la respuesta aún contiene mojibake (Ã):"
  echo "$body" | grep -o '[A-Za-zÁÉÍÓÚáéíóúñ]*Ã[^ ",]*' | sort -u | head -10
  fail=1
else
  echo "OK  sin secuencias mojibake (Ã) en la respuesta"
fi
if echo "$body" | grep -q 'podrán'; then
  echo "OK  se encontró 'podrán' correctamente acentuado"
fi

echo
[ "$fail" -eq 0 ] && echo "RESULTADO: despliegue verificado" || echo "RESULTADO: despliegue pendiente/incompleto"
exit "$fail"
