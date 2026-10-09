# fix-build-windows.ps1
# Repara dependencias locales (Tailwind v4 instalado por error, conflicto lovable-tagger/Vite)
# y recompila el proyecto.
# Uso (en PowerShell, dentro de la carpeta del proyecto):
#   powershell -ExecutionPolicy Bypass -File .\fix-build-windows.ps1

# Ejecutar siempre desde la carpeta donde vive este script (raiz del proyecto)
Set-Location -Path $PSScriptRoot
Write-Host "=== Reparando dependencias en $PSScriptRoot ===" -ForegroundColor Cyan

# 1) Evitar que Puppeteer descargue Chrome
$env:PUPPETEER_SKIP_DOWNLOAD = "true"

# 2) Borrar instalacion anterior y cache de Vite
Write-Host "Borrando node_modules, package-lock.json y cache..."
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path package-lock.json) { Remove-Item -Force package-lock.json }
npm cache clean --force | Out-Null

# 3) Instalar todo (package.json ya fija tailwindcss 3.4.17 y lovable-tagger 1.1.11)
Write-Host "Instalando dependencias..."
npm install --legacy-peer-deps

# 4) Forzar de nuevo las versiones correctas por si acaso
#    - Vite 7 (Vite 8/Rolldown no es compatible con este proyecto)
#    - html2canvas / jspdf: librerias de exportacion PDF usadas por los reportes Admin
npm install -D tailwindcss@3.4.17 lovable-tagger@1.1.11 --save-exact --legacy-peer-deps
npm install -D vite@^7.3.5 --legacy-peer-deps
npm install html2canvas@^1.4.1 jspdf@^4.2.1 --legacy-peer-deps

# 5) Verificar la version real de Tailwind instalada
$twVersion = node -p "require('./node_modules/tailwindcss/package.json').version"
Write-Host "Tailwind instalado: $twVersion"
if (-not $twVersion.StartsWith("3.")) {
    Write-Host "ERROR: sigue instalada una version incorrecta de Tailwind ($twVersion)." -ForegroundColor Red
    Read-Host "`nPresiona Enter para cerrar"
    exit 1
}

# 6) Compilar
Write-Host "Compilando (npm run build)..."
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== LISTO: el build termino correctamente ===" -ForegroundColor Green
} else {
    Write-Host "`n=== El build fallo. Copia las ultimas lineas del error y enviamelas ===" -ForegroundColor Red
}

Read-Host "`nPresiona Enter para cerrar"
