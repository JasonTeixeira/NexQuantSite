# Professional Refactoring Script for NexQuantSite
# This script standardizes naming conventions across the codebase

Write-Host "=== Starting Professional Refactoring ===" -ForegroundColor Cyan
Write-Host ""

# Define naming convention rules
$componentPattern = @{
    # Components should be PascalCase
    Pattern = "^[a-z-]+\.tsx$"
    NewPattern = { param($name) 
        $parts = $name -replace '\.tsx$', '' -split '-'
        $pascalCase = ($parts | ForEach-Object { $_.Substring(0,1).ToUpper() + $_.Substring(1) }) -join ''
        return "$pascalCase.tsx"
    }
}

$servicePattern = @{
    # Services should be camelCase
    Pattern = "^[A-Z-]+.*Service\.ts$"
    NewPattern = { param($name)
        $serviceName = $name -replace '\.ts$', ''
        $camelCase = $serviceName.Substring(0,1).ToLower() + $serviceName.Substring(1)
        return "$camelCase.ts"
    }
}

# Function to rename files based on conventions
function Rename-ToConvention {
    param(
        [string]$Path,
        [string]$FileType
    )
    
    $files = Get-ChildItem -Path $Path -Recurse -File
    $renamedCount = 0
    
    foreach ($file in $files) {
        $oldName = $file.Name
        $newName = $null
        
        # Apply naming conventions based on file type
        switch ($FileType) {
            "Component" {
                if ($oldName -match "^[a-z].*\.tsx$" -and $oldName -match "-") {
                    # Convert kebab-case to PascalCase for components
                    $parts = ($oldName -replace '\.tsx$', '') -split '-'
                    $pascalCase = ($parts | ForEach-Object { 
                        $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower() 
                    }) -join ''
                    $newName = "$pascalCase.tsx"
                }
            }
            "Service" {
                if ($oldName -match "^[a-z-]+.*\.(service|manager|handler)\.ts$") {
                    # Convert to camelCase for services
                    $baseName = $oldName -replace '\.(service|manager|handler)\.ts$', ''
                    $parts = $baseName -split '-'
                    $camelCase = $parts[0].ToLower()
                    for ($i = 1; $i -lt $parts.Count; $i++) {
                        $camelCase += $parts[$i].Substring(0,1).ToUpper() + $parts[$i].Substring(1).ToLower()
                    }
                    $suffix = $oldName -match '\.(service|manager|handler)\.ts$'
                    $newName = "${camelCase}Service.ts"
                }
            }
            "Hook" {
                if ($oldName -match "^use-.*\.tsx?$") {
                    # Hooks should be camelCase starting with 'use'
                    $hookName = $oldName -replace '^use-', '' -replace '\.tsx?$', ''
                    $parts = $hookName -split '-'
                    $camelCase = 'use'
                    foreach ($part in $parts) {
                        $camelCase += $part.Substring(0,1).ToUpper() + $part.Substring(1).ToLower()
                    }
                    $extension = if ($oldName -match '\.tsx$') { '.tsx' } else { '.ts' }
                    $newName = "$camelCase$extension"
                }
            }
        }
        
        if ($newName -and $newName -ne $oldName) {
            $newPath = Join-Path $file.DirectoryName $newName
            Write-Host "  Renaming: $oldName -> $newName" -ForegroundColor Yellow
            # Uncomment to actually rename:
            # Rename-Item -Path $file.FullName -NewName $newName -Force
            $renamedCount++
        }
    }
    
    return $renamedCount
}

# Function to create module index files
function Create-ModuleIndex {
    param([string]$ModulePath)
    
    $indexContent = @"
/**
 * Public API for $(Split-Path $ModulePath -Leaf) module
 * This file exports all public interfaces, types, and components
 */

// Types and Interfaces
export * from './types';

// Services
export * from './services';

// Components
export * from './components';

// Hooks
export * from './hooks';

// Utils
export * from './utils';
"@
    
    $indexPath = Join-Path $ModulePath "index.ts"
    Set-Content -Path $indexPath -Value $indexContent
    Write-Host "  Created index.ts for module: $(Split-Path $ModulePath -Leaf)" -ForegroundColor Green
}

# Main refactoring process
Write-Host "1. Analyzing Components Directory..." -ForegroundColor Cyan
$componentsToRename = Rename-ToConvention -Path ".\components" -FileType "Component"
Write-Host "  Found $componentsToRename components to rename" -ForegroundColor Gray

Write-Host ""
Write-Host "2. Analyzing Services in lib Directory..." -ForegroundColor Cyan
$servicesToRename = Rename-ToConvention -Path ".\lib" -FileType "Service"
Write-Host "  Found $servicesToRename services to rename" -ForegroundColor Gray

Write-Host ""
Write-Host "3. Analyzing Hooks Directory..." -ForegroundColor Cyan
$hooksToRename = Rename-ToConvention -Path ".\hooks" -FileType "Hook"
Write-Host "  Found $hooksToRename hooks to rename" -ForegroundColor Gray

Write-Host ""
Write-Host "4. Creating Module Index Files..." -ForegroundColor Cyan
$modules = @("src\modules\auth", "src\modules\trading", "src\modules\analytics", "src\modules\admin")
foreach ($module in $modules) {
    if (Test-Path $module) {
        Create-ModuleIndex -ModulePath $module
    }
}

Write-Host ""
Write-Host "5. File Organization Report:" -ForegroundColor Cyan
Write-Host "  - Components to rename: $componentsToRename" -ForegroundColor Gray
Write-Host "  - Services to rename: $servicesToRename" -ForegroundColor Gray
Write-Host "  - Hooks to rename: $hooksToRename" -ForegroundColor Gray

# Create a mapping file for import updates
$mappingFile = @"
# File Rename Mappings
# Use this to update imports after renaming

## Components
# Old Name -> New Name
error-boundary.tsx -> ErrorBoundary.tsx
help-button.tsx -> HelpButton.tsx
help-system.tsx -> HelpSystem.tsx
mobile-optimized-layout.tsx -> MobileOptimizedLayout.tsx
notification-center.tsx -> NotificationCenter.tsx
quality-dashboard.tsx -> QualityDashboard.tsx
risk-calculator-client.tsx -> RiskCalculatorClient.tsx
strategy-lab-client.tsx -> StrategyLabClient.tsx
theme-provider.tsx -> ThemeProvider.tsx
transformation-dashboard.tsx -> TransformationDashboard.tsx

## Services
auth-config.ts -> authConfig.ts
auth-tokens.ts -> authTokens.ts
csrf-protection.ts -> csrfProtection.ts
data-adapters.ts -> dataAdapters.ts
error-handler.ts -> errorHandler.ts
market-data-service.ts -> marketDataService.ts
rate-limiter.ts -> rateLimiter.ts
security-headers.ts -> securityHeaders.ts
security-manager.ts -> securityManager.ts
security-utils.ts -> securityUtils.ts
session-manager.ts -> sessionManager.ts
subscription-utils.ts -> subscriptionUtils.ts
two-factor-auth.ts -> twoFactorAuth.ts

## Hooks
use-async-operation.ts -> useAsyncOperation.ts
use-keyboard-navigation.ts -> useKeyboardNavigation.ts
use-mobile.tsx -> useMobile.tsx
use-performance-monitor.ts -> usePerformanceMonitor.ts
use-performance.ts -> usePerformance.ts
use-toast.ts -> useToast.ts
use-usage.ts -> useUsage.ts
"@

Set-Content -Path ".\docs\refactoring\rename-mappings.md" -Value $mappingFile
Write-Host ""
Write-Host "Created rename mappings file at: docs\refactoring\rename-mappings.md" -ForegroundColor Green

Write-Host ""
Write-Host "=== Refactoring Analysis Complete ===" -ForegroundColor Green
Write-Host "To apply the renaming, uncomment the Rename-Item command in the script and run again." -ForegroundColor Yellow
Write-Host ""
