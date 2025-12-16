# Quick script to verify API key on AWS server
# This will SSH into your server and check for the API key

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "",
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$User = "ec2-user"
)

Write-Host "🔍 Checking API Key on AWS Server..." -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($ServerIP)) {
    $ServerIP = Read-Host "Enter your EC2 server IP or hostname"
}

if ([string]::IsNullOrEmpty($SSHKey)) {
    $SSHKey = Read-Host "Enter path to your SSH key file (.pem)"
}

if (-not (Test-Path $SSHKey)) {
    Write-Host "❌ SSH key file not found: $SSHKey" -ForegroundColor Red
    exit 1
}

Write-Host "Connecting to server..." -ForegroundColor Yellow

# Check for API keys on the server
$checkCommand = @"
cd ~/chainCommands/backend
if [ -f .env ]; then
    echo "✓ .env file exists"
    echo ""
    if grep -q "ANTHROPIC_API_KEY" .env; then
        KEY_LENGTH=`$(grep "ANTHROPIC_API_KEY" .env | cut -d '=' -f2 | tr -d ' ' | tr -d '"' | wc -c)
        if [ `$KEY_LENGTH -gt 20 ]; then
            echo "✓ ANTHROPIC_API_KEY is set (length: `$((KEY_LENGTH-1)) characters)"
        else
            echo "⚠ ANTHROPIC_API_KEY appears to be too short or a placeholder"
        fi
    else
        echo "✗ ANTHROPIC_API_KEY not found in .env"
    fi
    
    if grep -q "AI_API_KEY" .env; then
        KEY_LENGTH=`$(grep "AI_API_KEY" .env | cut -d '=' -f2 | tr -d ' ' | tr -d '"' | wc -c)
        if [ `$KEY_LENGTH -gt 20 ]; then
            echo "✓ AI_API_KEY is set (length: `$((KEY_LENGTH-1)) characters)"
        else
            echo "⚠ AI_API_KEY appears to be too short or a placeholder"
        fi
    else
        echo "✗ AI_API_KEY not found in .env"
    fi
else
    echo "✗ .env file not found in backend directory"
    echo ""
    echo "You need to create backend/.env with:"
    echo "  ANTHROPIC_API_KEY=your-api-key"
fi
"@

$sshCommand = "ssh -i `"$SSHKey`" $User@${ServerIP} `"$checkCommand`""

Write-Host ""
Invoke-Expression $sshCommand

Write-Host ""
Write-Host "📋 Note: The .env file is not in git (for security)." -ForegroundColor Yellow
Write-Host "If the key is missing on the server, you need to add it manually." -ForegroundColor Yellow
Write-Host ""
Write-Host "To add the API key on the server:" -ForegroundColor Cyan
Write-Host "  ssh -i `"$SSHKey`" $User@${ServerIP}" -ForegroundColor White
Write-Host "  cd ~/chainCommands/backend" -ForegroundColor White
Write-Host "  echo 'ANTHROPIC_API_KEY=your-api-key' >> .env" -ForegroundColor White
Write-Host "  pm2 restart spectr-backend" -ForegroundColor White

