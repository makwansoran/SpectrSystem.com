# Script to update Resend API key in local .env file
# Usage: .\update-resend-api-key-local.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$ResendApiKey = "re_ApHf5BBN_BxLoM4F25weAxwG1AKbv4AHw"
)

Write-Host "🔑 Updating Resend API Key in local .env file..." -ForegroundColor Cyan
Write-Host ""

$envPath = "backend\.env"

# Create .env file if it doesn't exist
if (-not (Test-Path $envPath)) {
    Write-Host "📝 Creating new .env file..." -ForegroundColor Yellow
    New-Item -Path $envPath -ItemType File -Force | Out-Null
}

# Read existing .env content
$envContent = @()
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
}

# Remove old Resend variables
$envContent = $envContent | Where-Object { 
    $_ -notmatch '^RESEND_API_KEY=' -and 
    $_ -notmatch '^RESEND_FROM='
}

# Add new Resend variables
$envContent += "RESEND_API_KEY=$ResendApiKey"
$envContent += "RESEND_FROM=noreply@spectrsystem.com"

# Add FRONTEND_URL if not present
if ($envContent -notmatch '^FRONTEND_URL=') {
    $envContent += "FRONTEND_URL=https://spectrsystem.com"
}

# Write back to file
$envContent | Set-Content $envPath

Write-Host "✅ Updated $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resend configuration:" -ForegroundColor Cyan
Get-Content $envPath | Select-String -Pattern "RESEND_|FRONTEND_URL" | ForEach-Object {
    if ($_ -match "RESEND_API_KEY") {
        $key = $_ -replace "RESEND_API_KEY=", ""
        Write-Host "  RESEND_API_KEY=$($key.Substring(0, [Math]::Min(10, $key.Length)))..." -ForegroundColor Gray
    } else {
        Write-Host "  $_" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ Done! Resend API key has been updated locally." -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test locally: npm run dev (in backend folder)" -ForegroundColor White
Write-Host "  2. Deploy to server: Use update-resend-api-key-remote.ps1" -ForegroundColor White

