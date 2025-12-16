# PowerShell script to check if API keys are configured
# Run this on your local machine or create a similar check on the server

Write-Host "🔍 Checking for Claude AI API Keys..." -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists locally (for reference)
if (Test-Path "backend\.env") {
    Write-Host "✓ Found .env file locally" -ForegroundColor Green
    Write-Host ""
    Write-Host "Checking for API keys in .env file:" -ForegroundColor Cyan
    
    $envContent = Get-Content "backend\.env" -Raw
    
    if ($envContent -match "ANTHROPIC_API_KEY\s*=\s*(.+)") {
        $key = $matches[1].Trim().Trim('"')
        if ($key -and $key -ne "your-claude-api-key") {
            Write-Host "  ✓ ANTHROPIC_API_KEY is set (length: $($key.Length) characters)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ ANTHROPIC_API_KEY is set but appears to be a placeholder" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✗ ANTHROPIC_API_KEY not found" -ForegroundColor Red
    }
    
    if ($envContent -match "AI_API_KEY\s*=\s*(.+)") {
        $key = $matches[1].Trim().Trim('"')
        if ($key -and $key -ne "your-claude-api-key") {
            Write-Host "  ✓ AI_API_KEY is set (length: $($key.Length) characters)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ AI_API_KEY is set but appears to be a placeholder" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✗ AI_API_KEY not found" -ForegroundColor Red
    }
} else {
    Write-Host "✗ .env file not found locally" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Note: This checks your local .env file." -ForegroundColor Gray
    Write-Host "To check on your server, SSH in and run:" -ForegroundColor Gray
    Write-Host "  cd ~/chainCommands && bash check-api-keys.sh" -ForegroundColor White
}

Write-Host ""
Write-Host "📋 To check on your AWS server:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. SSH into your server:" -ForegroundColor Yellow
Write-Host "   ssh -i your-key.pem ec2-user@your-server-ip" -ForegroundColor White
Write-Host ""
Write-Host "2. Navigate to project and run:" -ForegroundColor Yellow
Write-Host "   cd ~/chainCommands" -ForegroundColor White
Write-Host "   bash check-api-keys.sh" -ForegroundColor White
Write-Host ""
Write-Host "3. Or manually check:" -ForegroundColor Yellow
Write-Host "   cat backend/.env | grep -E 'ANTHROPIC_API_KEY|AI_API_KEY'" -ForegroundColor White
Write-Host ""

