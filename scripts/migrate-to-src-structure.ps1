# File Migration Script for Professional Refactoring
# Moves files from old structure to new src/ structure

Write-Host "=== Starting File Migration to Professional Structure ===" -ForegroundColor Cyan
Write-Host ""

# Define migration mappings
$migrations = @{
    # Core infrastructure
    "lib\database\*" = "src\core\infrastructure\database\"
    "lib\auth\*" = "src\core\infrastructure\auth\"
    "lib\services\*" = "src\core\application\services\"
    
    # Domain logic
    "lib\models\trading.ts" = "src\core\domain\trading\"
    "lib\models\user.ts" = "src\core\domain\user\"
    "lib\models\*.ts" = "src\core\domain\"
    
    # Shared utilities
    "lib\utils.ts" = "src\shared\utils\"
    "lib\validation.ts" = "src\shared\utils\"
    "lib\hash.ts" = "src\shared\utils\"
    "lib\debug.ts" = "src\shared\utils\"
    
    # UI Components
    "components\ui\*" = "src\ui\primitives\"
    "components\trading\*" = "src\ui\features\trading\"
    "components\newsletter\*" = "src\ui\features\newsletter\"
    "components\pwa\*" = "src\ui\features\pwa\"
    "components\dashboard\*" = "src\ui\features\dashboard\"
    "components\auth\*" = "src\ui\features\auth\"
    "components\*Layout*.tsx" = "src\ui\layouts\"
    "components\*.tsx" = "src\ui\components\"
    
    # Hooks
    "hooks\*.ts" = "src\shared\hooks\"
    "hooks\*.tsx" = "src\shared\hooks\"
    
    # Types
    "types\*" = "src\shared\types\"
    "shared\api-schema\*" = "src\shared\types\api\"
    
    # Module-specific
    "lib\trading\*" = "src\modules\trading\"
    "lib\auth\*" = "src\modules\auth\"
    "lib\admin-*.ts" = "src\modules\admin\"
}

# Function to perform migration
function Migrate-Files {
    param(
        [string]$Source,
        [string]$Destination,
        [bool]$DryRun = $true
    )
    
    if (-not (Test-Path $Source)) {
        Write-Host "  Source not found: $Source" -ForegroundColor Yellow
        return 0
    }
    
    $files = Get-ChildItem -Path $Source -File -ErrorAction SilentlyContinue
    $count = 0
    
    foreach ($file in $files) {
        if (-not (Test-Path $Destination)) {
            if (-not $DryRun) {
                New-Item -ItemType Directory -Path $Destination -Force | Out-Null
            }
            Write-Host "  Creating directory: $Destination" -ForegroundColor Green
        }
        
        $destPath = Join-Path $Destination $file.Name
        
        if ($DryRun) {
            Write-Host "  [DRY RUN] Would move: $($file.Name) -> $destPath" -ForegroundColor Cyan
        } else {
            Move-Item -Path $file.FullName -Destination $destPath -Force
            Write-Host "  Moved: $($file.Name) -> $destPath" -ForegroundColor Green
        }
        $count++
    }
    
    return $count
}

# Create import mapping file
function Create-ImportMapping {
    $mapping = @"
// Import Update Mappings
// Update these imports after migration

// Before: import { something } from '../lib/services/ml-service-client';
// After:  import { something } from '@/core/application/services/mlServiceClient';

// Before: import { Component } from '../components/ui/button';
// After:  import { Component } from '@/ui/primitives/Button';

// Before: import { useToast } from '../hooks/use-toast';
// After:  import { useToast } from '@/shared/hooks/useToast';

// Before: import { TradingStrategy } from '../lib/models/trading';
// After:  import { TradingStrategy } from '@/core/domain/trading/TradingStrategy';

// Path aliases to add to tsconfig.json:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/ui/*": ["./src/ui/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/modules/*": ["./src/modules/*"]
    }
  }
}
"@
    
    Set-Content -Path ".\docs\refactoring\import-mappings.md" -Value $mapping
    Write-Host "Created import mappings file at: docs\refactoring\import-mappings.md" -ForegroundColor Green
}

# Main migration process
Write-Host "Starting Migration Analysis (Dry Run)..." -ForegroundColor Cyan
Write-Host ""

$totalFiles = 0
foreach ($pattern in $migrations.Keys) {
    Write-Host "Analyzing: $pattern" -ForegroundColor Yellow
    $destination = $migrations[$pattern]
    $source = $pattern -replace '\\\*$', ''
    
    if ($pattern.EndsWith('\*')) {
        $count = Migrate-Files -Source $source -Destination $destination -DryRun $true
    } else {
        # Single file migration
        if (Test-Path $pattern) {
            Write-Host "  [DRY RUN] Would move: $pattern -> $destination" -ForegroundColor Cyan
            $count = 1
        } else {
            $count = 0
        }
    }
    
    $totalFiles += $count
}

Write-Host ""
Write-Host "=== Migration Summary ===" -ForegroundColor Cyan
Write-Host "Total files to migrate: $totalFiles" -ForegroundColor Green
Write-Host ""

# Create import mapping
Create-ImportMapping

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Review the migration plan above" -ForegroundColor White
Write-Host "2. Run this script with -DryRun `$false to perform actual migration" -ForegroundColor White
Write-Host "3. Update imports using the mapping file" -ForegroundColor White
Write-Host "4. Update tsconfig.json with path aliases" -ForegroundColor White
Write-Host "5. Run tests to verify everything works" -ForegroundColor White
Write-Host ""

# Create a batch file for easy execution
$batchContent = @"
@echo off
echo Running file migration...
powershell -ExecutionPolicy Bypass -File "%~dp0migrate-to-src-structure.ps1"
pause
"@

Set-Content -Path ".\scripts\run-migration.bat" -Value $batchContent
Write-Host "Created batch file for easy execution: scripts\run-migration.bat" -ForegroundColor Green
