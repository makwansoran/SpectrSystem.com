# Complete deployment script - Deploy code and update API key
# This script will: 1) Pull latest code on server, 2) Update API key, 3) Rebuild and restart

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

Write-Host "🚀 Complete Deployment to AWS" -ForegroundColor Green
Write-Host "This will: Pull latest code, update API key, rebuild, and restart" -ForegroundColor Cyan
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

Write-Host "📡 Connecting to server..." -ForegroundColor Yellow

# Complete deployment command
$deployCommand = @"
cd ~/chainCommands
echo "📥 Pulling latest code..."
git pull

cd backend
echo ""
echo "🔑 Updating API key..."
if [ -f .env ]; then
    sed -i '/^ANTHROPIC_API_KEY=/d' .env
fi
echo "ANTHROPIC_API_KEY=$NEW_API_KEY" >> .env
echo "✓ API key updated"

echo ""
echo "📦 Installing dependencies..."
npm install --production

echo ""
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "🔄 Restarting backend..."
pm2 restart spectr-backend || pm2 start ecosystem.config.js

echo ""
echo "✅ Deployment complete!"
echo ""
pm2 status spectr-backend
"@

# Replace the placeholder
$deployCommand = $deployCommand -replace '\$NEW_API_KEY', $NEW_API_KEY

$sshCommand = "ssh -i `"$SSHKey`" $User@${ServerIP} `"$deployCommand`""

Write-Host ""
Invoke-Expression $sshCommand

Write-Host ""
Write-Host "🧪 Testing deployment..." -ForegroundColor Cyan
Write-Host "  Test endpoint: curl https://spectrsystem.com/api/agent/test" -ForegroundColor White
Write-Host "  Check logs: ssh -i `"$SSHKey`" $User@${ServerIP} 'pm2 logs spectr-backend --lines 20'" -ForegroundColor White

