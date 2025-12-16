# PowerShell script to update API key on AWS server remotely
# This will SSH into your server and update the API key

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey,
    
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "",
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$User = "ec2-user"
)

$NEW_API_KEY = $ApiKey

Write-Host "🔑 Updating ANTHROPIC_API_KEY on AWS Server..." -ForegroundColor Cyan
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

Write-Host "Connecting to server and updating API key..." -ForegroundColor Yellow

# Command to update API key on server
$updateCommand = @"
cd ~/chainCommands/backend
if [ -f .env ]; then
    # Remove old ANTHROPIC_API_KEY if it exists
    sed -i '/^ANTHROPIC_API_KEY=/d' .env
    # Add new API key
    echo "ANTHROPIC_API_KEY=$NEW_API_KEY" >> .env
    echo "✓ API key updated"
    # Verify
    if grep -q "^ANTHROPIC_API_KEY=" .env; then
        KEY_LENGTH=`$(grep "^ANTHROPIC_API_KEY=" .env | cut -d '=' -f2- | wc -c)
        echo "✓ Verification: API key is set (length: `$((KEY_LENGTH-1)) characters)"
    else
        echo "✗ Error: API key was not added correctly"
        exit 1
    fi
else
    echo "ANTHROPIC_API_KEY=$NEW_API_KEY" > .env
    echo "✓ Created .env file with API key"
fi
# Restart backend
pm2 restart spectr-backend
echo "✓ Backend restarted"
"@

# Replace the placeholder in the command
$updateCommand = $updateCommand -replace '\$NEW_API_KEY', $NEW_API_KEY

$sshCommand = "ssh -i `"$SSHKey`" $User@${ServerIP} `"$updateCommand`""

Write-Host ""
Invoke-Expression $sshCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ API key updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test the endpoint:" -ForegroundColor Cyan
    Write-Host "  curl https://spectrsystem.com/api/agent/test" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Failed to update API key" -ForegroundColor Red
    exit 1
}

