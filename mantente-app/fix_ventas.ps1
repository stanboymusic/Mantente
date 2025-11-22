# Script para arreglar Ventas.jsx
$path = 'c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app\src\components\Ventas.jsx'
$content = Get-Content -Path $path -Raw

# Reemplazar las funciones
$content = $content -replace 'crearFactura', 'createFactura'
$content = $content -replace 'crearCliente', 'createCliente'

Set-Content -Path $path -Value $content
Write-Host "Ventas.jsx actualizado"
