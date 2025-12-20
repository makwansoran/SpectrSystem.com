# Complete Deployment Script - Deploy Everything to AWS
# This script deploys both backend and frontend with all new features

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "",
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$User = "ec2-user",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiKey = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false
)

Write-Host "🚀 Complete Deployment to AWS" -ForegroundColor Green
Write-Host "Deploying: Backend + Frontend + All New Features" -ForegroundColor Cyan
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

Write-Host "📡 Connecting to server: $ServerIP" -ForegroundColor Yellow
Write-Host ""

# Build frontend locally first
if (-not $SkipBuild) {
    Write-Host "📦 Building frontend locally..." -ForegroundColor Cyan
    Push-Location frontend
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend build failed!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
    Write-Host ""
}

# Complete deployment command
$deployCommand = @"
set -e

echo "🚀 Starting Complete Deployment..."
echo ""

# Navigate to project directory
cd ~/chainCommands || cd ~/SpectrSystem.com

echo "📥 Pulling latest code from git..."
git pull origin main || git pull origin master || echo "⚠️  Git pull failed, continuing..."

echo ""
echo "=========================================="
echo "🔧 BACKEND DEPLOYMENT"
echo "=========================================="

cd backend

# Update API key if provided
if [ ! -z "$NEW_API_KEY" ]; then
    echo "🔑 Updating API key..."
    if [ -f .env ]; then
        sed -i '/^ANTHROPIC_API_KEY=/d' .env
    fi
    echo "ANTHROPIC_API_KEY=$NEW_API_KEY" >> .env
    echo "✓ API key updated"
fi

# Install dependencies
echo ""
echo "📦 Installing backend dependencies..."
npm install --production

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build

# Ensure data directories exist
echo ""
echo "📁 Creating data directories..."
mkdir -p data
mkdir -p src/services/company-intelligence/data/raw

# Restart backend
echo ""
echo "🔄 Restarting backend..."
pm2 restart spectr-backend || pm2 start ecosystem.config.js || pm2 start dist/index.js --name spectr-backend

echo ""
echo "=========================================="
echo "🎨 FRONTEND DEPLOYMENT"
echo "=========================================="

cd ../frontend

# Install dependencies
echo ""
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend
echo ""
echo "🔨 Building frontend..."
npm run build

# Copy built files to web server directory
echo ""
echo "📤 Copying frontend files to web server..."
sudo mkdir -p /var/www/spectrsystem.com
sudo cp -r dist/* /var/www/spectrsystem.com/
sudo chown -R nginx:nginx /var/www/spectrsystem.com || sudo chown -R www-data:www-data /var/www/spectrsystem.com

# Restart nginx
echo ""
echo "🔄 Restarting web server..."
sudo systemctl restart nginx || sudo service nginx restart

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=========================================="

echo ""
echo "📊 Service Status:"
pm2 status spectr-backend

echo ""
echo "🧪 Testing endpoints..."
echo "  Backend Health: curl http://localhost:3001/api/health"
echo "  Frontend: https://spectrsystem.com"
"@

# Replace API key placeholder if provided
if (-not [string]::IsNullOrEmpty($ApiKey)) {
    $deployCommand = $deployCommand -replace '\$NEW_API_KEY', $ApiKey
} else {
    $deployCommand = $deployCommand -replace 'if \[ ! -z "\$NEW_API_KEY" \]; then.*?fi', ''
}

$sshCommand = "ssh -i `"$SSHKey`" $User@${ServerIP} `"$deployCommand`""

Write-Host "Executing deployment..." -ForegroundColor Yellow
Write-Host ""
Invoke-Expression $sshCommand

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Test your deployment:" -ForegroundColor Cyan
Write-Host "  Frontend: https://spectrsystem.com" -ForegroundColor White
Write-Host "  Backend API: https://spectrsystem.com/api/health" -ForegroundColor White
Write-Host "  Datasets: https://spectrsystem.com/datasets" -ForegroundColor White
Write-Host ""
Write-Host "📋 Check logs:" -ForegroundColor Cyan
Write-Host "  Backend: ssh -i `"$SSHKey`" $User@${ServerIP} 'pm2 logs spectr-backend --lines 50'" -ForegroundColor White
Write-Host "  Nginx: ssh -i `"$SSHKey`" $User@${ServerIP} 'sudo tail -f /var/log/nginx/error.log'" -ForegroundColor White

