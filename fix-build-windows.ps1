# fix-build-windows.ps1
# Repara el conflicto de dependencias (lovable-tagger / Vite) y recompila el proyecto.
# Uso: clic derecho > "Ejecutar con PowerShell", o en PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\fix-build-windows.ps1

Write-Host "=== Reparando dependencias del proyecto ===" -ForegroundColor Cyan

# 1) Evitar que Puppeteer descargue Chrome (causa de errores previos)
$env:PUPPETEER_SKIP_DOWNLOAD = "true"

# 2) Borrar instalacion anterior (node_modules y lockfile)
Write-Host "Borrando node_modules y package-lock.json..."
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path package-lock.json) { Remove-Item -Force package-lock.json }

# 3) Forzar las versiones correctas en package.json
Write-Host "Fijando lovable-tagger@1.1.11 y tailwindcss@3.4.17..."
npm install -D lovable-tagger@1.1.11 --save-exact --legacy-peer-deps
npm install -D tailwindcss@3.4.17 --save-exact --legacy-peer-deps

# 4) Instalar todo
Write-Host "Instalando dependencias..."
npm install --legacy-peer-deps

# 5) Compilar
Write-Host "Compilando (npm run build)..."
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== LISTO: el build termino correctamente ===" -ForegroundColor Green
} else {
    Write-Host "`n=== El build fallo. Copia las ultimas lineas del error y enviamelas ===" -ForegroundColor Red
}

Read-Host "`nPresiona Enter para cerrar"
