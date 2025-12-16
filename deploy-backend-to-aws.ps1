# SPECTR SYSTEMS Backend Deployment to AWS EC2
# This script helps deploy backend changes to your EC2 instance

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "",
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$User = "ec2-user"
)

Write-Host "🚀 SPECTR SYSTEMS Backend Deployment to AWS" -ForegroundColor Green
Write-Host ""

# Check if server IP is provided
if ([string]::IsNullOrEmpty($ServerIP)) {
    $ServerIP = Read-Host "Enter your EC2 server IP or hostname (e.g., ec2-xx-xx-xx-xx.compute-1.amazonaws.com)"
}

# Check if SSH key is provided
if ([string]::IsNullOrEmpty($SSHKey)) {
    $SSHKey = Read-Host "Enter path to your SSH key file (.pem)"
}

# Verify SSH key exists
if (-not (Test-Path $SSHKey)) {
    Write-Host "❌ SSH key file not found: $SSHKey" -ForegroundColor Red
    exit 1
}

# Build TypeScript locally first
Write-Host "📦 Building TypeScript..." -ForegroundColor Cyan
Set-Location backend
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "📤 Preparing files for deployment..." -ForegroundColor Cyan

# Create a temporary directory for files to deploy
$tempDir = "deploy-temp"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy necessary files
Write-Host "  Copying backend files..." -ForegroundColor Gray
Copy-Item -Path "backend\dist" -Destination "$tempDir\dist" -Recurse -Force
Copy-Item -Path "backend\package.json" -Destination "$tempDir\package.json" -Force
Copy-Item -Path "backend\package-lock.json" -Destination "$tempDir\package-lock.json" -Force
Copy-Item -Path "backend\ecosystem.config.js" -Destination "$tempDir\ecosystem.config.js" -Force
Copy-Item -Path "backend\deploy.sh" -Destination "$tempDir\deploy.sh" -Force

Write-Host ""
Write-Host "📡 Uploading files to server..." -ForegroundColor Cyan

# Use scp to upload files (assuming the project is in ~/chainCommands on the server)
$remotePath = "~/chainCommands/backend-update"
$scpCommand = "scp -i `"$SSHKey`" -r $tempDir/* $User@${ServerIP}:$remotePath"

Write-Host "  Running: $scpCommand" -ForegroundColor Gray
Invoke-Expression $scpCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Your SSH key has correct permissions (chmod 400)" -ForegroundColor Yellow
    Write-Host "  2. The server is accessible" -ForegroundColor Yellow
    Write-Host "  3. You have the correct user name" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔄 Deploying on server..." -ForegroundColor Cyan

# SSH into server and run deployment
$sshCommand = @"
ssh -i `"$SSHKey`" $User@${ServerIP} << 'ENDSSH'
cd ~/chainCommands/backend-update
mkdir -p ../backend/dist
cp -r dist/* ../backend/dist/
cp package.json ../backend/
cp package-lock.json ../backend/
cp ecosystem.config.js ../backend/
cd ../backend
npm install --production
pm2 restart spectr-backend || pm2 start ecosystem.config.js
pm2 save
echo "✅ Deployment complete!"
pm2 status spectr-backend
ENDSSH
"@

Write-Host "  Executing deployment commands on server..." -ForegroundColor Gray
Invoke-Expression $sshCommand

# Cleanup
Write-Host ""
Write-Host "🧹 Cleaning up..." -ForegroundColor Cyan
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "✅ Deployment process complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Check server logs: ssh -i `"$SSHKey`" $User@${ServerIP} 'pm2 logs spectr-backend'" -ForegroundColor Gray
Write-Host "  2. Test the endpoint: https://spectrsystem.com/api/agent/test" -ForegroundColor Gray
Write-Host "  3. Verify agent chat is working" -ForegroundColor Gray

