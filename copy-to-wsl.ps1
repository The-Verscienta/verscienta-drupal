# PowerShell script to copy files to WSL DDEV location
# Run this in PowerShell: .\copy-to-wsl.ps1

$SOURCE = "C:\Users\pf1\OneDrive\Documents\GitHub\verscienta-drupal"
$WSL_DEST = "\\wsl.localhost\DDEV\home\pf1"

Write-Host "📋 Copying files to WSL DDEV location..." -ForegroundColor Cyan

# Create directories in WSL
Write-Host "Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$WSL_DEST\backend\web\modules\custom\holistic_hub" | Out-Null
New-Item -ItemType Directory -Force -Path "$WSL_DEST\frontend" | Out-Null

# Copy backend files
Write-Host "Copying backend files..." -ForegroundColor Yellow
Copy-Item "$SOURCE\backend\composer.json" -Destination "$WSL_DEST\backend\" -Force
Copy-Item "$SOURCE\backend\Dockerfile" -Destination "$WSL_DEST\backend\" -Force
Copy-Item "$SOURCE\backend\setup-content-types.sh" -Destination "$WSL_DEST\backend\" -Force

# Copy custom module
Copy-Item "$SOURCE\backend\web\modules\custom\holistic_hub\holistic_hub.info.yml" -Destination "$WSL_DEST\backend\web\modules\custom\holistic_hub\" -Force -ErrorAction SilentlyContinue

# Copy frontend files
Write-Host "Copying frontend files..." -ForegroundColor Yellow
Copy-Item "$SOURCE\frontend\package.json" -Destination "$WSL_DEST\frontend\" -Force
Copy-Item "$SOURCE\frontend\next.config.ts" -Destination "$WSL_DEST\frontend\" -Force
Copy-Item "$SOURCE\frontend\tsconfig.json" -Destination "$WSL_DEST\frontend\" -Force
Copy-Item "$SOURCE\frontend\tailwind.config.ts" -Destination "$WSL_DEST\frontend\" -Force
Copy-Item "$SOURCE\frontend\postcss.config.js" -Destination "$WSL_DEST\frontend\" -Force
Copy-Item "$SOURCE\frontend\.env.local.example" -Destination "$WSL_DEST\frontend\" -Force

# Copy app, components, lib directories
if (Test-Path "$SOURCE\frontend\app") {
    Copy-Item "$SOURCE\frontend\app" -Destination "$WSL_DEST\frontend\" -Recurse -Force
}
if (Test-Path "$SOURCE\frontend\components") {
    Copy-Item "$SOURCE\frontend\components" -Destination "$WSL_DEST\frontend\" -Recurse -Force
}
if (Test-Path "$SOURCE\frontend\lib") {
    Copy-Item "$SOURCE\frontend\lib" -Destination "$WSL_DEST\frontend\" -Recurse -Force
}
if (Test-Path "$SOURCE\frontend\types") {
    Copy-Item "$SOURCE\frontend\types" -Destination "$WSL_DEST\frontend\" -Recurse -Force
}
if (Test-Path "$SOURCE\frontend\styles") {
    Copy-Item "$SOURCE\frontend\styles" -Destination "$WSL_DEST\frontend\" -Recurse -Force
}
if (Test-Path "$SOURCE\frontend\public") {
    Copy-Item "$SOURCE\frontend\public" -Destination "$WSL_DEST\frontend\" -Recurse -Force
}

# Copy documentation
Write-Host "Copying documentation..." -ForegroundColor Yellow
Copy-Item "$SOURCE\README.md" -Destination "$WSL_DEST\" -Force
Copy-Item "$SOURCE\TIMELINE.md" -Destination "$WSL_DEST\" -Force
Copy-Item "$SOURCE\SETUP.md" -Destination "$WSL_DEST\" -Force
Copy-Item "$SOURCE\AFTER-DDEV-INSTALL.md" -Destination "$WSL_DEST\" -Force

# Copy .gitignore if exists
if (Test-Path "$SOURCE\.gitignore") {
    Copy-Item "$SOURCE\.gitignore" -Destination "$WSL_DEST\" -Force
}

# Copy docker-compose.yml
Copy-Item "$SOURCE\docker-compose.yml" -Destination "$WSL_DEST\" -Force

Write-Host "✅ Files copied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open WSL terminal: wsl -d DDEV" -ForegroundColor White
Write-Host "2. Navigate: cd /home/pf1/backend" -ForegroundColor White
Write-Host "3. Check DDEV: ddev describe" -ForegroundColor White
Write-Host "4. Run setup: ddev exec bash setup-content-types.sh" -ForegroundColor White
