# Mantente App - Complete Startup Script (PowerShell)
# This script starts both PocketBase and the frontend application

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MANTENTE - Complete Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the current directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# Check if pocketbase.exe exists
if (!(Test-Path "pocketbase.exe")) {
    Write-Host "ERROR: pocketbase.exe not found!" -ForegroundColor Red
    Write-Host "Please ensure pocketbase.exe is in: $projectRoot" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press any key to exit"
    exit 1
}

# Step 1: Start PocketBase
Write-Host "Step 1/3: Starting PocketBase Server..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:8090" -ForegroundColor Cyan
Write-Host "Admin: http://localhost:8090/_/" -ForegroundColor Cyan
Write-Host ""

Start-Process -FilePath "pocketbase.exe" -ArgumentList "serve --http=127.0.0.1:8090" -WindowStyle Normal
Write-Host "✅ PocketBase started in new window" -ForegroundColor Green
Write-Host ""

# Wait for PocketBase to start
Write-Host "Waiting for PocketBase to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 2: Initialize Collections
Write-Host ""
Write-Host "Step 2/3: Initializing Database Collections..." -ForegroundColor Yellow
Set-Location "$projectRoot\pocketbase-server"

if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Creating collections..." -ForegroundColor Yellow
npm run dev

Write-Host ""
Write-Host "✅ Collections initialized" -ForegroundColor Green
Write-Host ""

# Step 3: Start Frontend
Write-Host "Step 3/3: Starting Frontend Application..." -ForegroundColor Yellow
Set-Location "$projectRoot\mantente-app"

if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

npm run dev

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Application Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open your browser and go to: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
