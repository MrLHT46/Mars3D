#!/usr/bin/env powershell
# Location Management System - Quick Setup & Validation Script
# Usage: .\setup-and-test.ps1

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Location Management System - Setup & Validation Script      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$projectRoot = "d:\ICDingHoc\Project\Mars3D Vue 3"
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$serverUrl = "http://localhost:5000"
$apiUrl = "$serverUrl/api/landmarks"

function Test-Path-Exists {
    param([string]$Path, [string]$Name)
    if (Test-Path $Path) {
        Write-Host "✓ $Name found" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ $Name not found at: $Path" -ForegroundColor Red
        return $false
    }
}

function Show-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "▶ $Title" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
}

# Step 1: Verify File Structure
Show-Section "Step 1: Verify File Structure"

$files = @(
    @{Path = "$backendDir\migrate.js"; Name = "Backend migration script" },
    @{Path = "$backendDir\routes\landmarks.js"; Name = "Updated backend routes" },
    @{Path = "$backendDir\package.json"; Name = "Backend package.json" },
    @{Path = "$frontendDir\src\components\MarkerModal.vue"; Name = "Updated MarkerModal" },
    @{Path = "$frontendDir\src\components\AddressTooltip.vue"; Name = "New AddressTooltip" },
    @{Path = "$frontendDir\src\components\Mars3DMap.vue"; Name = "Updated Mars3DMap" }
)

$allFilesExist = $true
foreach ($file in $files) {
    if (-not (Test-Path-Exists $file.Path $file.Name)) {
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host ""
    Write-Host "✓ All required files found!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Some files are missing" -ForegroundColor Red
    Write-Host "  Please ensure all changes have been applied" -ForegroundColor Red
}

# Step 2: Verify Backend Setup
Show-Section "Step 2: Verify Backend Setup"

try {
    Set-Location $backendDir
    
    # Check if npm is available
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "✓ npm found" -ForegroundColor Green
        
        # Check if node_modules exists
        if (Test-Path "node_modules") {
            Write-Host "✓ node_modules exists" -ForegroundColor Green
        } else {
            Write-Host "⚠ node_modules not found" -ForegroundColor Yellow
            Write-Host "  Run: npm install" -ForegroundColor Cyan
        }
        
        # Check if .env exists
        if (Test-Path ".env") {
            Write-Host "✓ .env file exists" -ForegroundColor Green
        } else {
            Write-Host "⚠ .env file not found" -ForegroundColor Yellow
            Write-Host "  Create .env with DATABASE_URL and PORT" -ForegroundColor Cyan
        }
        
        # Check migrate script in package.json
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.migrate) {
            Write-Host "✓ 'migrate' script found in package.json" -ForegroundColor Green
        } else {
            Write-Host "⚠ 'migrate' script not in package.json" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ npm not found" -ForegroundColor Red
        Write-Host "  Please install Node.js" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error checking backend setup: $_" -ForegroundColor Red
}

# Step 3: Verify Frontend Setup
Show-Section "Step 3: Verify Frontend Setup"

try {
    Set-Location $frontendDir
    
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "✓ npm found" -ForegroundColor Green
        
        if (Test-Path "node_modules") {
            Write-Host "✓ node_modules exists" -ForegroundColor Green
        } else {
            Write-Host "⚠ node_modules not found" -ForegroundColor Yellow
            Write-Host "  Run: npm install" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "✗ Error checking frontend setup: $_" -ForegroundColor Red
}

# Step 4: Quick Test
Show-Section "Step 4: Test Backend Connectivity"

Write-Host "Testing API connection (if backend is running)..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$serverUrl/api/ping" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend server is running and responding" -ForegroundColor Green
        
        # Try to get landmarks
        try {
            $landmarksResponse = Invoke-WebRequest -Uri $apiUrl -Method Get -TimeoutSec 2
            $landmarks = $landmarksResponse.Content | ConvertFrom-Json
            Write-Host "✓ API returns landmarks: $($landmarks.Count) items" -ForegroundColor Green
            
            if ($landmarks.Count -gt 0) {
                Write-Host "  First landmark: $($landmarks[0].name)" -ForegroundColor Cyan
                if ($landmarks[0].fullAddress) {
                    Write-Host "  Address: $($landmarks[0].fullAddress)" -ForegroundColor Cyan
                }
            }
        } catch {
            Write-Host "⚠ Could not fetch landmarks" -ForegroundColor Yellow
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "⚠ Backend server not running" -ForegroundColor Yellow
    Write-Host "  Start backend with: npm run dev (in backend folder)" -ForegroundColor Cyan
}

# Step 5: Summary & Next Steps
Show-Section "Step 5: Next Steps"

Write-Host ""
Write-Host "To complete setup and test the system:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Start Backend (if not running):" -ForegroundColor Cyan
Write-Host "     cd $backendDir" -ForegroundColor Gray
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Run Database Migration:" -ForegroundColor Cyan
Write-Host "     cd $backendDir" -ForegroundColor Gray
Write-Host "     npm run migrate" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Start Frontend:" -ForegroundColor Cyan
Write-Host "     cd $frontendDir" -ForegroundColor Gray
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Open Browser:" -ForegroundColor Cyan
Write-Host "     http://localhost:8081 (or configured port)" -ForegroundColor Gray
Write-Host ""
Write-Host "  5. Test Features:" -ForegroundColor Cyan
Write-Host "     • Click '➕ Thêm Marker' to add new location" -ForegroundColor Gray
Write-Host "     • Fill in all address fields" -ForegroundColor Gray
Write-Host "     • Hover over marker to see tooltip" -ForegroundColor Gray
Write-Host "     • Click marker to edit" -ForegroundColor Gray
Write-Host "     • Refresh page to verify persistence" -ForegroundColor Gray
Write-Host ""

# Documentation
Show-Section "Documentation Files"

$docs = @(
    @{File = "IMPLEMENTATION_SUMMARY.md"; Description = "Complete implementation overview" },
    @{File = "LOCATION_MANAGEMENT_SETUP.md"; Description = "Detailed setup & testing guide" },
    @{File = "ARCHITECTURE_VISUAL_GUIDE.md"; Description = "System architecture diagrams" },
    @{File = "DATA_STRUCTURE_REFERENCE.md"; Description = "Data structures & API specs" }
)

Write-Host ""
foreach ($doc in $docs) {
    $docPath = Join-Path $projectRoot $doc.File
    if (Test-Path $docPath) {
        Write-Host "✓ $($doc.File)" -ForegroundColor Green
        Write-Host "  $($doc.Description)" -ForegroundColor Gray
    } else {
        Write-Host "✗ $($doc.File) not found" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              Setup & Validation Complete!                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Set-Location $projectRoot
